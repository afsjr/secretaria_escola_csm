/**
 * Relatório de pendências de deduplicação (para conferência física).
 *
 * Lista os grupos de CPF duplicado que NÃO puderam ser resolvidos
 * automaticamente (nomes divergentes / provável CPF lançado errado),
 * com todos os dados para análise, e um resumo dos grupos já resolvidos.
 *
 * Uso: node scripts/dedup-pendencias.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outDir = join(__dirname, 'backups');

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
const headers = { apikey: SKEY, Authorization: `Bearer ${SKEY}` };

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

const normCpf = (s) => String(s || '').replace(/\D/g, '');
const normName = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z ]/g, '').replace(/\s+/g, ' ').trim();
const hasGrade = (b) => [b.n1, b.n2, b.n3, b.rec].some((v) => Number(v) > 0);

function nameSimilarity(a, b) {
  const ta = new Set(normName(a).split(' ').filter(Boolean));
  const tb = new Set(normName(b).split(' ').filter(Boolean));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / (ta.size + tb.size - inter);
}

function fmtCpf(c) {
  const d = normCpf(c);
  if (d.length !== 11) return c || '—';
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

async function main() {
  mkdirSync(outDir, { recursive: true });

  const perfis = await getAll('perfis?select=id,nome_completo,email,cpf,status,cadastro_desativado,criado_em,created_at&order=nome_completo');
  const matriculas = await getAll('matriculas?select=id,aluno_id,turma_id,status_aluno,data_matricula,turmas(nome,periodo)');
  const boletim = await getAll('boletim?select=id,aluno_id,disciplina,n1,n2,n3,rec,faltas,status');
  const frequencia = await getAll('frequencia?select=id,aluno_id');

  const group = (rows, key) => { const m = {}; for (const r of rows) (m[r[key]] = m[r[key]] || []).push(r); return m; };
  const mBy = group(matriculas, 'aluno_id');
  const bBy = group(boletim, 'aluno_id');
  const fBy = group(frequencia, 'aluno_id');

  const byCpf = {};
  for (const p of perfis) { const c = normCpf(p.cpf); if (!c) continue; (byCpf[c] = byCpf[c] || []).push(p); }

  const pendentes = [];
  for (const [cpf, arr] of Object.entries(byCpf)) {
    if (arr.length < 2) continue;
    let minSim = 1;
    for (let i = 0; i < arr.length; i++)
      for (let j = i + 1; j < arr.length; j++)
        minSim = Math.min(minSim, nameSimilarity(arr[i].nome_completo, arr[j].nome_completo));
    if (minSim < 0.5) {
      pendentes.push({
        cpf,
        similaridade: minSim,
        contas: arr.map((p) => {
          const mats = (mBy[p.id] || []).map((m) => `${m.turmas?.nome || '?'} [${m.turmas?.periodo || '?'}] ${m.status_aluno}${m.data_matricula ? ` (${m.data_matricula})` : ''}`);
          const bols = bBy[p.id] || [];
          return {
            nome: p.nome_completo,
            email: p.email,
            id: p.id,
            status: p.status,
            matriculado: mats.length > 0,
            matriculas: mats,
            boletim: bols.length,
            boletim_com_nota: bols.filter(hasGrade).length,
            frequencia: (fBy[p.id] || []).length,
            criado_em: (p.criado_em || p.created_at || '').slice(0, 10),
          };
        }),
      });
    }
  }

  // Resumo dos grupos já resolvidos (último plano de apply).
  let resolved = null;
  try {
    const files = readdirSync(outDir).filter((f) => /^dedup-plano-apply-.*\.json$/.test(f)).sort();
    if (files.length) resolved = JSON.parse(readFileSync(join(outDir, files[files.length - 1]), 'utf-8'));
  } catch { /* sem plano */ }

  const L = [];
  L.push('# Duplicidade de cadastros — Pendências para conferência');
  L.push('');
  L.push(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
  L.push('');
  L.push('Este relatório lista os grupos de **mesmo CPF com nomes divergentes**, que não puderam ser');
  L.push('mesclados automaticamente e precisam de decisão da secretaria. Use este material para');
  L.push('conferência física, marque a decisão de cada caso e devolva para execução.');
  L.push('');
  L.push(`**Grupos pendentes: ${pendentes.length}**`);
  L.push('');

  pendentes.forEach((g, i) => {
    L.push(`## Pendência ${i + 1} — CPF ${fmtCpf(g.cpf)}`);
    L.push('');
    L.push(`> Similaridade entre nomes: **${(g.similaridade * 100).toFixed(0)}%**. ` +
      (g.similaridade === 0
        ? 'Nomes totalmente diferentes — provavelmente **CPF lançado errado** em um dos cadastros.'
        : 'Nomes parecidos, mas com divergência relevante — confirmar se é a mesma pessoa.'));
    L.push('');
    L.push('| Nome | E-mail | Matriculado | Matrícula(s) | Boletim (c/ nota) | Frequência | Cadastro | ID |');
    L.push('|---|---|---|---|---|---|---|---|');
    for (const c of g.contas) {
      L.push(`| ${c.nome} | ${c.email} | ${c.matriculado ? 'sim' : 'não'} | ${c.matriculas.join('<br>') || '—'} | ${c.boletim} (${c.boletim_com_nota}) | ${c.frequencia} | ${c.criado_em} | \`${c.id}\` |`);
    }
    L.push('');
    L.push('**Decisão da secretaria** (marque uma opção):');
    L.push('');
    L.push('- (  ) É a **mesma pessoa** → manter a conta: ____________________  e desativar a(s) outra(s).');
    L.push('- (  ) São **pessoas diferentes** → corrigir o **CPF** do cadastro: ____________________');
    L.push('- (  ) Outra orientação: ______________________________________________');
    L.push('');
    L.push('Responsável: ____________________________  Data: ____/____/______');
    L.push('');
    L.push('---');
    L.push('');
  });

  if (resolved) {
    L.push('## Grupos já resolvidos (referência)');
    L.push('');
    L.push(`Total: **${resolved.plan.length}** grupos. Conta mantida e contas desativadas:`);
    L.push('');
    L.push('| CPF | Conta mantida (canônica) | Contas desativadas |');
    L.push('|---|---|---|');
    for (const e of resolved.plan) {
      L.push(`| ${e.cpf_formatado || e.cpf} | ${e.canonica.email} | ${e.desativar.map((d) => d.email).join(', ') || '—'} |`);
    }
    L.push('');
    L.push(`> Notas divergentes descartadas (mantida a da conta matriculada): **${resolved.discarded.length}**.`);
    L.push('> Detalhamento em `dedup-plano-apply-*.pdf`.');
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const mdPath = join(outDir, `dedup-pendencias-${ts}.md`);
  writeFileSync(mdPath, L.join('\n'));

  console.log(`Grupos pendentes: ${pendentes.length}`);
  pendentes.forEach((g) => console.log(`  CPF ${fmtCpf(g.cpf)} — ${g.contas.map((c) => c.email).join(', ')}`));
  console.log(`\nRelatório: ${mdPath}`);
}

main().catch((err) => { console.error('Falha:', err.message); process.exit(1); });
