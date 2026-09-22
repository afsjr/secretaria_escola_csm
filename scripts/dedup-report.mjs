/**
 * Relatório de decisão para deduplicação de perfis por CPF (somente leitura).
 *
 * Gera, em scripts/backups/:
 *   - dedup-relatorio-<timestamp>.md   : visão para a secretaria aprovar caso a caso
 *   - dedup-relatorio-<timestamp>.json : dados estruturados (uso por script de limpeza)
 *
 * Nada é alterado no banco. Uso: node scripts/dedup-report.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
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
  } catch { /* arquivo ausente */ }
  return out;
}

const env = { ...loadEnv(join(root, '.env')), ...loadEnv(join(root, '.env.local')) };
const URL = env.VITE_SUPABASE_URL;
const KEY = env.VITE_SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error('Faltam VITE_SUPABASE_URL / VITE_SUPABASE_SERVICE_ROLE_KEY em .env/.env.local');
  process.exit(1);
}
const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function getAll(path) {
  const res = await fetch(`${URL}/rest/v1/${path}`, { headers });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

const normCpf = (s) => String(s || '').replace(/\D/g, '');
const normName = (s) =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// Similaridade simples por tokens (Jaccard) para sinalizar nomes divergentes com mesmo CPF.
function nameSimilarity(a, b) {
  const ta = new Set(normName(a).split(' ').filter(Boolean));
  const tb = new Set(normName(b).split(' ').filter(Boolean));
  if (!ta.size || !tb.size) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / (ta.size + tb.size - inter);
}

const ALUNO_TABLES = [
  'matriculas',
  'boletim',
  'frequencia',
  'pagamentos',
  'certificados',
  'responsaveis',
  'observacoes_aluno',
  'financeiro_acordos',
];

// A conta canônica é, de regra, a que está matriculada (é a que a secretaria
// enxerga e gerencia). Dados acadêmicos entram como reforço/desempate.
function scoreAccount(acc) {
  let score = 0;
  if (acc.matriculas.some((m) => m.status === 'ativo')) score += 100;
  if (acc.matriculas.some((m) => m.data_matricula)) score += 50;
  score += acc.frequencia * 2;
  score += acc.boletim_com_nota * 3;
  score += acc.boletim * 0.5;
  score += acc.certificados * 5;
  score += acc.pagamentos * 3;
  score += acc.responsaveis * 2;
  score += acc.observacoes * 2;
  score += acc.audit * 0.1;
  // Desempate: conta mais recente.
  if (acc.criado_em) score += new Date(acc.criado_em).getTime() / 1e13;
  return score;
}

async function main() {
  mkdirSync(outDir, { recursive: true });

  const perfis = await getAll('perfis?select=*&order=nome_completo');
  const matriculas = await getAll(
    'matriculas?select=id,aluno_id,turma_id,status_aluno,data_matricula,criado_em,turmas(nome,periodo)'
  );
  const boletim = await getAll('boletim?select=id,aluno_id,disciplina_base_id,disciplina,n1,n2,n3,rec,faltas,status');
  const frequencia = await getAll('frequencia?select=id,aluno_id');
  const pagamentos = await getAll('pagamentos?select=id,aluno_id');
  const certificados = await getAll('certificados?select=id,aluno_id');
  const responsaveis = await getAll('responsaveis?select=id,aluno_id');
  const observacoes = await getAll('observacoes_aluno?select=id,aluno_id');
  const acordos = await getAll('financeiro_acordos?select=id,aluno_id');
  const audit = await getAll('audit_log?select=usuario_id,created_at');

  const groupBy = (rows, key) => {
    const map = {};
    for (const r of rows) (map[r[key]] = map[r[key]] || []).push(r);
    return map;
  };
  const mByAluno = groupBy(matriculas, 'aluno_id');
  const bByAluno = groupBy(boletim, 'aluno_id');
  const fByAluno = groupBy(frequencia, 'aluno_id');
  const pByAluno = groupBy(pagamentos, 'aluno_id');
  const cByAluno = groupBy(certificados, 'aluno_id');
  const rByAluno = groupBy(responsaveis, 'aluno_id');
  const oByAluno = groupBy(observacoes, 'aluno_id');
  const aByAluno = groupBy(acordos, 'aluno_id');
  const auditByAluno = groupBy(audit, 'usuario_id');

  const hasRealGrade = (b) =>
    [b.n1, b.n2, b.n3, b.rec].some((v) => v !== null && v !== undefined && Number(v) > 0);

  const byCpf = {};
  for (const p of perfis) {
    const c = normCpf(p.cpf);
    if (!c) continue;
    (byCpf[c] = byCpf[c] || []).push(p);
  }

  const groups = Object.entries(byCpf)
    .filter(([, arr]) => arr.length > 1)
    .map(([cpf, arr]) => {
      const accounts = arr.map((p) => {
        const mats = (mByAluno[p.id] || []).map((m) => ({
          id: m.id,
          turma: m.turmas?.nome || '(sem turma)',
          periodo: m.turmas?.periodo || '',
          status: m.status_aluno,
          data_matricula: m.data_matricula,
        }));
        const bols = bByAluno[p.id] || [];
        const audits = (auditByAluno[p.id] || []).map((a) => a.created_at).filter(Boolean).sort();
        const acc = {
          id: p.id,
          nome: p.nome_completo,
          email: p.email,
          cpf: p.cpf,
          status: p.status,
          cadastro_desativado: p.cadastro_desativado,
          criado_em: p.criado_em || p.created_at,
          matriculado: mats.some((m) => m.status === 'ativo'),
          matriculas: mats,
          boletim: bols.length,
          boletim_com_nota: bols.filter(hasRealGrade).length,
          frequencia: (fByAluno[p.id] || []).length,
          pagamentos: (pByAluno[p.id] || []).length,
          certificados: (cByAluno[p.id] || []).length,
          responsaveis: (rByAluno[p.id] || []).length,
          observacoes: (oByAluno[p.id] || []).length,
          acordos: (aByAluno[p.id] || []).length,
          audit: audits.length,
          ultima_atividade: audits[audits.length - 1] || null,
        };
        acc.score = scoreAccount(acc);
        return acc;
      });

      accounts.sort((x, y) => y.score - x.score);

      // Similaridade mínima entre os nomes do grupo: baixa = possível CPF repetido por erro.
      let minSim = 1;
      for (let i = 0; i < accounts.length; i++)
        for (let j = i + 1; j < accounts.length; j++)
          minSim = Math.min(minSim, nameSimilarity(accounts[i].nome, accounts[j].nome));

      const divergente = minSim < 0.5;
      return {
        cpf,
        cpf_formatado: accounts[0].cpf,
        quantidade: accounts.length,
        similaridade_nomes: Number(minSim.toFixed(2)),
        verificar_identidade: divergente,
        manter: accounts[0].id,
        desativar: accounts.slice(1).map((a) => a.id),
        contas: accounts,
      };
    })
    .sort((a, b) => b.quantidade - a.quantidade || a.cpf.localeCompare(b.cpf));

  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const jsonPath = join(outDir, `dedup-relatorio-${ts}.json`);
  writeFileSync(jsonPath, JSON.stringify({ gerado_em: new Date().toISOString(), grupos: groups }, null, 2));

  const L = [];
  L.push('# Relatório de deduplicação por CPF');
  L.push('');
  L.push(`Gerado em: ${new Date().toISOString()}`);
  L.push(`Projeto: ${URL}`);
  L.push('');
  L.push(`- Grupos de CPF duplicado: **${groups.length}**`);
  L.push(`- Perfis envolvidos: **${groups.reduce((s, g) => s + g.quantidade, 0)}**`);
  L.push(`- Grupos com nomes divergentes (verificar identidade): **${groups.filter((g) => g.verificar_identidade).length}**`);
  L.push('');
  L.push('> Regra de recomendação: a conta **matriculada (ativa)** é sugerida como canônica');
  L.push('> (**manter**), pois é a que a secretaria já gerencia; as demais como **desativar**.');
  L.push('> Dados acadêmicos (notas/frequência) entram como reforço. A decisão final é da');
  L.push('> secretaria. O grupo com nomes divergentes precisa de confirmação de identidade.');
  L.push('');

  groups.forEach((g, i) => {
    L.push(`## ${i + 1}. CPF ${g.cpf_formatado || g.cpf} — ${g.quantidade} contas`);
    if (g.verificar_identidade) {
      L.push(`> **ATENÇÃO:** nomes divergentes (similaridade ${g.similaridade_nomes}). Confirmar se é a mesma pessoa antes de mesclar.`);
    }
    L.push('');
    L.push('| Recomendação | Nome | E-mail | Matriculado | Matrículas | Boletim (c/ nota) | Frequência | Pagam. | Certif. | Respons. | Observ. | Últ. atividade | ID |');
    L.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
    g.contas.forEach((a, idx) => {
      const rec = idx === 0 ? '**MANTER**' : 'desativar';
      const mats = a.matriculas.length
        ? a.matriculas.map((m) => `${m.turma} [${m.periodo}] ${m.status}${m.data_matricula ? ` ${m.data_matricula}` : ''}`).join('<br>')
        : '—';
      L.push(
        `| ${rec} | ${a.nome} | ${a.email} | ${a.matriculado ? 'sim' : 'não'} | ${mats} | ${a.boletim} (${a.boletim_com_nota}) | ${a.frequencia} | ${a.pagamentos} | ${a.certificados} | ${a.responsaveis} | ${a.observacoes} | ${a.ultima_atividade || '—'} | \`${a.id}\` |`
      );
    });
    L.push('');
  });

  const mdPath = join(outDir, `dedup-relatorio-${ts}.md`);
  writeFileSync(mdPath, L.join('\n'));

  console.log(`Grupos de CPF duplicado: ${groups.length}`);
  console.log(`Perfis envolvidos: ${groups.reduce((s, g) => s + g.quantidade, 0)}`);
  console.log(`Grupos a verificar identidade: ${groups.filter((g) => g.verificar_identidade).length}`);
  console.log(`\nRelatório gravado em:\n  ${mdPath}\n  ${jsonPath}`);
}

main().catch((err) => {
  console.error('Relatório falhou:', err.message);
  process.exit(1);
});
