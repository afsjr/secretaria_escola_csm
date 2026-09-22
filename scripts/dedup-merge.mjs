/**
 * Mesclagem e desativação de contas duplicadas por CPF.
 *
 * Estratégia:
 *   1. Mescla boletim/frequência e demais dependentes na conta canônica.
 *   2. Canônica = conta com matrícula ativa (desempate: data_matricula, notas).
 *   3. Desativa as demais (status='inativo', cadastro_desativado=true) — NÃO exclui do Auth.
 *
 * Uso:
 *   node scripts/dedup-merge.mjs            # dry-run (não altera nada)
 *   node scripts/dedup-merge.mjs --apply    # executa
 *
 * Grupos com nomes divergentes (identidade a confirmar) são ignorados.
 * Operação idempotente e re-executável.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(__dirname, 'backups');
const APPLY = process.argv.includes('--apply');

function loadEnv(file) {
  const out = {};
  try {
    for (const line of readFileSync(file, 'utf-8').split('\n')) {
      const m = line.match(/^([A-Za-z_]+)=(.*)$/);
      if (m) out[m[1]] = m[2].trim();
    }
  } catch { /* ausente */ }
  return out;
}
const env = { ...loadEnv(join(root, '.env')), ...loadEnv(join(root, '.env.local')) };
const URL = env.VITE_SUPABASE_URL;
const SKEY = env.VITE_SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !SKEY) { console.error('Faltam credenciais Supabase.'); process.exit(1); }

const headers = {
  apikey: SKEY,
  Authorization: `Bearer ${SKEY}`,
  'Content-Type': 'application/json',
};

async function req(method, path, body) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    method,
    headers: { ...headers, Prefer: 'return=minimal' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${await res.text()}`);
}

const getAll = async (p) => {
  const res = await fetch(`${URL}/rest/v1/${p}`, { headers });
  if (!res.ok) throw new Error(`${p} -> ${res.status} ${await res.text()}`);
  return res.json();
};

const normCpf = (s) => String(s || '').replace(/\D/g, '');
const normName = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z ]/g, '').replace(/\s+/g, ' ').trim();
const normDisc = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const grades = (b) => [Number(b.n1 || 0), Number(b.n2 || 0), Number(b.n3 || 0), Number(b.rec || 0)];
const hasGrade = (b) => grades(b).some((v) => v > 0);
const isEmpty = (v) => v === null || v === undefined || v === '' || Number(v) === 0;

function nameSimilarity(a, b) {
  const ta = new Set(normName(a).split(' ').filter(Boolean));
  const tb = new Set(normName(b).split(' ').filter(Boolean));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / (ta.size + tb.size - inter);
}

const OTHER_REFS = [
  ['pagamentos', 'aluno_id'],
  ['certificados', 'aluno_id'],
  ['responsaveis', 'aluno_id'],
  ['observacoes_aluno', 'aluno_id'],
  ['financeiro_acordos', 'aluno_id'],
  ['perfis_enderecos', 'user_id'],
  ['solicitacoes', 'user_id'],
];

async function main() {
  mkdirSync(outDir, { recursive: true });

  const perfis = await getAll('perfis?select=id,nome_completo,email,cpf,status,cadastro_desativado,criado_em,created_at&order=nome_completo');
  const matriculas = await getAll('matriculas?select=id,aluno_id,turma_id,status_aluno,data_matricula,criado_em,turmas(nome,periodo)');
  const boletim = await getAll('boletim?select=*');
  const frequencia = await getAll('frequencia?select=id,aluno_id,aula_id');

  const group = (rows, key) => { const m = {}; for (const r of rows) (m[r[key]] = m[r[key]] || []).push(r); return m; };
  const mByAluno = group(matriculas, 'aluno_id');
  const bByAluno = group(boletim, 'aluno_id');
  const fByAluno = group(frequencia, 'aluno_id');
  const perfisById = Object.fromEntries(perfis.map((p) => [p.id, p]));

  const byCpf = {};
  for (const p of perfis) { const c = normCpf(p.cpf); if (!c) continue; (byCpf[c] = byCpf[c] || []).push(p); }

  const groups = Object.entries(byCpf).filter(([, a]) => a.length > 1);
  const plan = [];
  const discarded = [];
  const skipped = [];
  const errors = [];

  for (const [cpf, arr] of groups) {
    // Identidade a confirmar: nomes muito divergentes.
    let minSim = 1;
    for (let i = 0; i < arr.length; i++)
      for (let j = i + 1; j < arr.length; j++)
        minSim = Math.min(minSim, nameSimilarity(arr[i].nome_completo, arr[j].nome_completo));
    if (minSim < 0.5) { skipped.push({ cpf, motivo: `nomes divergentes (sim ${minSim.toFixed(2)})`, contas: arr.map((p) => p.email) }); continue; }

    const scored = arr.map((p) => {
      const m = mByAluno[p.id] || [];
      const b = bByAluno[p.id] || [];
      const f = fByAluno[p.id] || [];
      const ativo = m.some((x) => x.status_aluno === 'ativo');
      const temData = m.some((x) => x.data_matricula);
      const notas = b.filter(hasGrade).length;
      const score = (ativo ? 1000 : 0) + (temData ? 500 : 0) + notas * 3 + f.length * 2 + new Date(p.criado_em || p.created_at || 0).getTime() / 1e13;
      return { p, m, b, f, ativo, temData, notas, score };
    }).sort((a, b) => b.score - a.score);

    const C = scored[0];
    const Ds = scored.slice(1);
    if (!C.ativo) { skipped.push({ cpf, motivo: 'nenhuma conta com matrícula ativa', contas: arr.map((p) => p.email) }); continue; }

    const entry = {
      cpf,
      cpf_formatado: C.p.cpf,
      canonica: { id: C.p.id, nome: C.p.nome_completo, email: C.p.email },
      desativar: [],
      boletim: [],
      frequencia: [],
      matriculas: [],
      outros: [],
    };

    // Cópia mutável do boletim da canônica para casar disciplinas durante o merge.
    const cBoletim = (bByAluno[C.p.id] || []).slice();
    const findC = (r) => cBoletim.find((c) =>
      (c.disciplina_base_id && r.disciplina_base_id && c.disciplina_base_id === r.disciplina_base_id) ||
      normDisc(c.disciplina) === normDisc(r.disciplina));

    for (const D of Ds) {
      // --- boletim ---
      for (const r of (bByAluno[D.p.id] || [])) {
        const c = findC(r);
        if (!c) {
          entry.boletim.push({ acao: 'reatribuir', de: D.p.email, para: C.p.email, disciplina: r.disciplina, id: r.id });
          if (APPLY) await req('PATCH', `boletim?id=eq.${r.id}`, { aluno_id: C.p.id });
          cBoletim.push({ ...r, aluno_id: C.p.id });
          continue;
        }
        if (!hasGrade(c) && hasGrade(r)) {
          // Canônica sem nota: completa com a nota da duplicada (preserva faltas/status já existentes).
          const patch = {};
          for (const f of ['n1', 'n2', 'n3', 'rec']) if (isEmpty(c[f]) && !isEmpty(r[f])) patch[f] = r[f];
          if (isEmpty(c.faltas) && !isEmpty(r.faltas)) patch.faltas = r.faltas;
          if (!c.status && r.status) patch.status = r.status;
          if (!c.nota_estagio && r.nota_estagio) patch.nota_estagio = r.nota_estagio;
          if (!c.estagio_parecer && r.estagio_parecer) patch.estagio_parecer = r.estagio_parecer;
          if (!c.conceito && r.conceito) patch.conceito = r.conceito;
          if (!c.disciplina_base_id && r.disciplina_base_id) patch.disciplina_base_id = r.disciplina_base_id;
          entry.boletim.push({ acao: 'completar_nota', de: D.p.email, para: C.p.email, disciplina: r.disciplina, completado: grades(r), anterior: grades(c) });
          if (APPLY) { await req('PATCH', `boletim?id=eq.${c.id}`, patch); await req('DELETE', `boletim?id=eq.${r.id}`); }
          Object.assign(c, patch);
        } else if (hasGrade(c) && hasGrade(r)) {
          entry.boletim.push({ acao: 'descartar_duplicada', de: D.p.email, para: C.p.email, disciplina: r.disciplina, mantido: grades(c), descartado: grades(r) });
          discarded.push({ cpf, disciplina: r.disciplina, mantido_email: C.p.email, mantido: grades(c), descartado_email: D.p.email, descartado: grades(r) });
          if (APPLY) await req('DELETE', `boletim?id=eq.${r.id}`);
        } else {
          // Duplicada sem nota: nada a contribuir.
          entry.boletim.push({ acao: 'descartar_vazia', de: D.p.email, disciplina: r.disciplina });
          if (APPLY) await req('DELETE', `boletim?id=eq.${r.id}`);
        }
      }

      // --- frequência ---
      for (const r of (fByAluno[D.p.id] || [])) {
        entry.frequencia.push({ acao: 'reatribuir', de: D.p.email, para: C.p.email, id: r.id });
        if (APPLY) await req('PATCH', `frequencia?id=eq.${r.id}`, { aluno_id: C.p.id });
      }

      // --- matrículas ---
      for (const r of (mByAluno[D.p.id] || [])) {
        const mesma = (mByAluno[C.p.id] || []).some((x) => x.turma_id === r.turma_id);
        if (mesma) {
          entry.matriculas.push({ acao: 'apagar', de: D.p.email, turma: r.turmas?.nome, status: r.status_aluno });
          if (APPLY) await req('DELETE', `matriculas?id=eq.${r.id}`);
        } else {
          entry.matriculas.push({ acao: 'reatribuir', de: D.p.email, para: C.p.email, turma: r.turmas?.nome });
          if (APPLY) await req('PATCH', `matriculas?id=eq.${r.id}`, { aluno_id: C.p.id });
        }
      }

      // --- outros dependentes ---
      for (const [table, col] of OTHER_REFS) {
        const rows = await getAll(`${table}?select=id&${col}=eq.${D.p.id}`);
        for (const r of rows) {
          entry.outros.push({ tabela: table, acao: 'reatribuir', de: D.p.email, para: C.p.email, id: r.id });
          if (APPLY) await req('PATCH', `${table}?id=eq.${r.id}`, { [col]: C.p.id });
        }
      }

      // --- desativar duplicada ---
      entry.desativar.push({ id: D.p.id, nome: D.p.nome_completo, email: D.p.email });
      if (APPLY) {
        await req('PATCH', `perfis?id=eq.${D.p.id}`, { status: 'inativo', cadastro_desativado: true });
        try {
          await req('POST', 'audit_log', [{
            usuario_id: C.p.id,
            usuario_nome: 'Deduplicação automática',
            usuario_perfil: 'sistema',
            acao: 'dedup_desativar_conta',
            tabela_afetada: 'perfis',
            registro_id: D.p.id,
            descricao: `Conta duplicada (CPF ${C.p.cpf}) mesclada na canônica ${C.p.email} e desativada`,
            dados_novos: { status: 'inativo', cadastro_desativado: true, mesclado_em: C.p.id },
          }]);
        } catch (e) { errors.push(`audit_log ${D.p.email}: ${e.message}`); }
      }
    }

    plan.push(entry);
  }

  // ---- relatórios ----
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const modo = APPLY ? 'apply' : 'dry-run';
  const jsonPath = join(outDir, `dedup-plano-${modo}-${ts}.json`);
  writeFileSync(jsonPath, JSON.stringify({ modo, gerado_em: new Date().toISOString(), plan, discarded, skipped, errors }, null, 2));

  const L = [];
  L.push(`# Plano de mesclagem/deduplicação (${modo})`);
  L.push('');
  L.push(`Gerado em: ${new Date().toISOString()}`);
  L.push(`Grupos processados: **${plan.length}** | contas a desativar: **${plan.reduce((s, e) => s + e.desativar.length, 0)}**`);
  L.push(`Notas divergentes descartadas (mantida a da matriculada): **${discarded.length}**`);
  L.push(`Grupos ignorados (identidade): **${skipped.length}**`);
  L.push('');
  if (skipped.length) {
    L.push('## Grupos ignorados');
    skipped.forEach((s) => L.push(`- CPF ${s.cpf} — ${s.motivo}: ${s.contas.join(', ')}`));
    L.push('');
  }
  for (const e of plan) {
    L.push(`## CPF ${e.cpf_formatado} — manter ${e.canonica.email}`);
    L.push(`- Desativar: ${e.desativar.map((d) => d.email).join(', ')}`);
    const bRe = e.boletim.filter((x) => x.acao === 'reatribuir').length;
    const bCo = e.boletim.filter((x) => x.acao === 'completar_nota').length;
    const bDi = e.boletim.filter((x) => x.acao === 'descartar_duplicada').length;
    const bVa = e.boletim.filter((x) => x.acao === 'descartar_vazia').length;
    L.push(`- Boletim: reatribuir=${bRe}, completar_nota=${bCo}, descartar_duplicada=${bDi}, descartar_vazia=${bVa}`);
    L.push(`- Frequência: ${e.frequencia.length} | Matrículas: ${e.matriculas.map((m) => `${m.acao}:${m.turma || '?'}`).join(', ') || '—'} | Outros: ${e.outros.length}`);
    L.push('');
  }
  if (discarded.length) {
    L.push('## Notas divergentes (mantida a da conta matriculada)');
    L.push('');
    L.push('| CPF | Disciplina | Mantido (matriculada) | Descartado (duplicada) |');
    L.push('|---|---|---|---|');
    for (const d of discarded) L.push(`| ${d.cpf} | ${d.disciplina} | ${d.mantido_email}: ${d.mantido.join('/')} | ${d.descartado_email}: ${d.descartado.join('/')} |`);
  }
  const mdPath = join(outDir, `dedup-plano-${modo}-${ts}.md`);
  writeFileSync(mdPath, L.join('\n'));

  console.log(`Modo: ${modo}`);
  console.log(`Grupos processados: ${plan.length} | contas a desativar: ${plan.reduce((s, e) => s + e.desativar.length, 0)}`);
  console.log(`Notas descartadas: ${discarded.length} | grupos ignorados: ${skipped.length}`);
  if (errors.length) console.log(`Erros de audit_log: ${errors.length}`);
  console.log(`\nRelatórios:\n  ${mdPath}\n  ${jsonPath}`);
}

main().catch((err) => { console.error('Falha:', err.message); process.exit(1); });
