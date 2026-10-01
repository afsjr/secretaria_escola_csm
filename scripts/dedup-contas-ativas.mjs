/**
 * Reparo de dados: consolidação de contas duplicadas ATIVAS sem CPF.
 *
 * Complementa o dedup-merge.mjs (que só agrupa por CPF). Aqui as decisões são
 * EXPLÍCITAS e vêm de um arquivo NÃO versionado (contém PII):
 *
 *   scripts/dedup-contas-ativas-decisoes.md
 *
 * Formato (uma decisão por bloco):
 *   canonica: <e-mail da conta que permanece>
 *   duplicada: <e-mail da conta a mesclar e desativar>
 *   duplicada: <e-mail ...>   # opcional, repetível
 *
 * A canônica é escolhida por decisão HUMANA (a que concentra mais informação),
 * nunca automaticamente por nome.
 *
 * Operação (idempotente):
 *   1. Move boletim/frequência/matrículas e dependentes da duplicada para a canônica.
 *   2. Mescla boletim por disciplina_base_id (ou nome normalizado): preserva a nota
 *      da canônica; completa campos vazios; descarta a linha duplicada.
 *   3. Desativa a duplicada (status='inativo', cadastro_desativado=true) + audit log.
 *
 * Uso:
 *   node scripts/dedup-contas-ativas.mjs            # dry-run (não altera nada)
 *   node scripts/dedup-contas-ativas.mjs --apply    # executa (exige backup prévio)
 *
 * Requer: VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY (.env / .env.local)
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const APPLY = process.argv.includes('--apply');
const DECISOES_FILE = join(__dirname, 'dedup-contas-ativas-decisoes.md');

// Lê as decisões (arquivo local, NÃO versionado).
function loadDecisoes() {
  if (!existsSync(DECISOES_FILE)) {
    console.error(`Arquivo de decisões ausente: ${DECISOES_FILE}`);
    process.exit(1);
  }
  const decisoes = [];
  let cur = null;
  for (const raw of readFileSync(DECISOES_FILE, 'utf-8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const canon = line.match(/^canonica:\s*(.+)$/i);
    if (canon) { cur = { canonicalEmail: canon[1].trim(), duplicateEmails: [] }; decisoes.push(cur); continue; }
    const dup = line.match(/^duplicada:\s*(.+)$/i);
    if (dup && cur) { cur.duplicateEmails.push(dup[1].trim()); continue; }
  }
  return decisoes.filter((d) => d.canonicalEmail && d.duplicateEmails.length);
}

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

const headers = { apikey: SKEY, Authorization: `Bearer ${SKEY}`, 'Content-Type': 'application/json' };

async function req(method, path, body) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    method,
    headers: { ...headers, Prefer: 'return=minimal' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${await res.text()}`);
}

async function getAll(path) {
  const out = [];
  const page = 1000;
  const base = path.includes('?') ? path : `${path}?select=*`;
  const withOrder = /[?&]order=/.test(base) ? base : `${base}&order=id`;
  for (let offset = 0; ; offset += page) {
    const res = await fetch(`${URL}/rest/v1/${withOrder}&limit=${page}&offset=${offset}`, { headers });
    if (!res.ok) throw new Error(`${path} -> ${res.status} ${await res.text()}`);
    const rows = await res.json();
    out.push(...rows);
    if (rows.length < page) break;
  }
  return out;
}

const normDisc = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const grades = (b) => [Number(b.n1 || 0), Number(b.n2 || 0), Number(b.n3 || 0), Number(b.rec || 0)];
const hasGrade = (b) => grades(b).some((v) => v > 0);
const isEmpty = (v) => v === null || v === undefined || v === '' || Number(v) === 0;

const OTHER_REFS = [
  ['pagamentos', 'aluno_id'],
  ['certificados', 'aluno_id'],
  ['responsaveis', 'aluno_id'],
  ['observacoes_aluno', 'aluno_id'],
  ['financeiro_acordos', 'aluno_id'],
];

async function main() {
  const DECISIONS = loadDecisoes();
  if (!DECISIONS.length) { console.error('Nenhuma decisão válida no arquivo.'); process.exit(1); }

  const perfis = await getAll('perfis?select=id,nome_completo,email,status,cadastro_desativado');
  const byEmail = new Map(perfis.map((p) => [String(p.email || '').toLowerCase(), p]));

  const plan = [];
  const errors = [];

  for (const dec of DECISIONS) {
    const C = byEmail.get(dec.canonicalEmail.toLowerCase());
    if (!C) { errors.push(`Canônica não encontrada: ${dec.canonicalEmail}`); continue; }
    const Ds = dec.duplicateEmails.map((e) => byEmail.get(e.toLowerCase())).filter(Boolean);
    if (!Ds.length) { errors.push(`Duplicada(s) não encontrada(s): ${dec.duplicateEmails.join(', ')}`); continue; }

    const boletim = await getAll(`boletim?select=*&aluno_id=in.(${[C, ...Ds].map((p) => p.id).join(',')})`);
    const bByAluno = {};
    for (const b of boletim) (bByAluno[b.aluno_id] = bByAluno[b.aluno_id] || []).push(b);
    const cBoletim = (bByAluno[C.id] || []).slice();

    const findC = (r) => cBoletim.find((c) =>
      (c.disciplina_base_id && r.disciplina_base_id && c.disciplina_base_id === r.disciplina_base_id) ||
      normDisc(c.disciplina) === normDisc(r.disciplina));

    const entry = { canonica: { id: C.id, email: C.email }, duplicates: [], boletim: [], frequencia: [], matriculas: [], outros: [], desativar: [] };

    for (const D of Ds) {
      if (D.status === 'inativo' && D.cadastro_desativado === true) {
        entry.desativar.push({ id: D.id, email: D.email, acao: 'ja_desativada' });
        continue;
      }
      for (const r of (bByAluno[D.id] || [])) {
        const c = findC(r);
        if (!c) {
          entry.boletim.push({ acao: 'reatribuir', disciplina: r.disciplina, id: r.id });
          if (APPLY) await req('PATCH', `boletim?id=eq.${r.id}`, { aluno_id: C.id });
          cBoletim.push({ ...r, aluno_id: C.id });
          continue;
        }
        if (!hasGrade(c) && hasGrade(r)) {
          const patch = {};
          for (const f of ['n1', 'n2', 'n3', 'rec']) if (isEmpty(c[f]) && !isEmpty(r[f])) patch[f] = r[f];
          if (isEmpty(c.faltas) && !isEmpty(r.faltas)) patch.faltas = r.faltas;
          if (!c.status && r.status) patch.status = r.status;
          if (!c.nota_estagio && r.nota_estagio) patch.nota_estagio = r.nota_estagio;
          if (!c.estagio_parecer && r.estagio_parecer) patch.estagio_parecer = r.estagio_parecer;
          if (!c.disciplina_base_id && r.disciplina_base_id) patch.disciplina_base_id = r.disciplina_base_id;
          entry.boletim.push({ acao: 'completar_nota', disciplina: r.disciplina, completado: grades(r), anterior: grades(c) });
          if (APPLY) { await req('PATCH', `boletim?id=eq.${c.id}`, patch); await req('DELETE', `boletim?id=eq.${r.id}`); }
          Object.assign(c, patch);
        } else if (hasGrade(c) && hasGrade(r)) {
          entry.boletim.push({ acao: 'descartar_duplicada', disciplina: r.disciplina, mantido: grades(c), descartado: grades(r) });
          if (APPLY) await req('DELETE', `boletim?id=eq.${r.id}`);
        } else {
          entry.boletim.push({ acao: 'descartar_vazia', disciplina: r.disciplina });
          if (APPLY) await req('DELETE', `boletim?id=eq.${r.id}`);
        }
      }

      const freq = await getAll(`frequencia?select=id&aluno_id=eq.${D.id}`);
      for (const r of freq) {
        entry.frequencia.push({ acao: 'reatribuir', id: r.id });
        if (APPLY) await req('PATCH', `frequencia?id=eq.${r.id}`, { aluno_id: C.id });
      }

      const matsC = await getAll(`matriculas?select=id,turma_id&aluno_id=eq.${C.id}`);
      const matsD = await getAll(`matriculas?select=id,turma_id&aluno_id=eq.${D.id}`);
      for (const r of matsD) {
        const mesma = matsC.some((x) => x.turma_id === r.turma_id);
        if (mesma) {
          entry.matriculas.push({ acao: 'apagar', turma_id: r.turma_id });
          if (APPLY) await req('DELETE', `matriculas?id=eq.${r.id}`);
        } else {
          entry.matriculas.push({ acao: 'reatribuir', turma_id: r.turma_id });
          if (APPLY) await req('PATCH', `matriculas?id=eq.${r.id}`, { aluno_id: C.id });
        }
      }

      for (const [table, col] of OTHER_REFS) {
        const rows = await getAll(`${table}?select=id&${col}=eq.${D.id}`);
        for (const r of rows) {
          entry.outros.push({ tabela: table, acao: 'reatribuir', id: r.id });
          if (APPLY) await req('PATCH', `${table}?id=eq.${r.id}`, { [col]: C.id });
        }
      }

      entry.desativar.push({ id: D.id, email: D.email });
      entry.duplicates.push({ id: D.id, email: D.email });
      if (APPLY) {
        await req('PATCH', `perfis?id=eq.${D.id}`, { status: 'inativo', cadastro_desativado: true });
        try {
          await req('POST', 'audit_log', [{
            usuario_id: C.id,
            usuario_nome: 'Consolidação de contas (script)',
            usuario_perfil: 'sistema',
            acao: 'dedup_consolidar_conta_ativa',
            tabela_afetada: 'perfis',
            registro_id: D.id,
            descricao: `Conta ativa duplicada ${D.email} mesclada na canônica ${C.email} e desativada`,
            dados_novos: { status: 'inativo', cadastro_desativado: true, mesclado_em: C.id },
          }]);
        } catch (e) { errors.push(`audit_log ${D.email}: ${e.message}`); }
      }
    }
    plan.push(entry);
  }

  console.log(`\n===== ${APPLY ? 'APPLY' : 'DRY-RUN'} — consolidação de contas ativas =====\n`);
  for (const e of plan) {
    console.log(`Canônica: ${e.canonica.email} [${e.canonica.id}]`);
    for (const d of e.duplicates) console.log(`  <- duplicada: ${d.email} [${d.id}]`);
    const g = (arr) => arr.reduce((m, x) => ((m[x.acao] = (m[x.acao] || 0) + 1), m), {});
    console.log(`  boletim: ${JSON.stringify(g(e.boletim))} | frequencia: ${e.frequencia.length} | matriculas: ${JSON.stringify(e.matriculas)} | outros: ${e.outros.length} | desativar: ${e.desativar.length}`);
    const descartadas = e.boletim.filter((b) => b.acao === 'descartar_duplicada');
    if (descartadas.length) {
      console.log(`  Notas descartadas (mantida a da canônica): ${descartadas.length}`);
      for (const x of descartadas) console.log(`    - ${x.disciplina}: mantido [${x.mantido.join(',')}] x descartado [${x.descartado.join(',')}]`);
    }
  }
  if (errors.length) { console.log('\nERROS:'); for (const e of errors) console.log('  -', e); }
  if (!APPLY) console.log('\n(dry-run) Nada foi alterado. Rode com --apply após o backup.');
  else console.log('\nAplicado. Verifique as contas consolidadas.');
}

main().catch((err) => { console.error('Falha:', err.message); process.exit(1); });
