/**
 * Reparo de dados: destravar componentes "pendente" que já possuem nota.
 *
 * Contexto: a marcação automática de "matrícula tardia" grava
 * boletim.status='pendente' (falta cursar) quando a matrícula ocorreu após a
 * data_fim da oferta. Quando o componente JÁ TEM nota lançada, ele não é
 * "falta cursar": deve voltar a ser um componente normal (status=NULL),
 * aparecendo e sendo lançável.
 *
 * Regra: linhas de `boletim` com status='pendente' e COM nota
 * (qualquer n1/n2/n3/rec > 0, ou nota_estagio preenchida) -> status=NULL.
 * Linhas pendentes SEM nota permanecem 'pendente'.
 *
 * Escopo: alunos listados no arquivo de decisões local (NÃO versionado):
 *   scripts/boletim-destravar-cursando-decisoes.md
 * Formato:
 *   aluno: <e-mail>
 *   aluno: <e-mail>
 *
 * Uso:
 *   node scripts/boletim-destravar-cursando.mjs            # dry-run
 *   node scripts/boletim-destravar-cursando.mjs --apply    # executa (após backup)
 *
 * Requer: VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY (.env / .env.local)
 * Idempotente.
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const APPLY = process.argv.includes('--apply');
const DECISOES_FILE = join(__dirname, 'boletim-destravar-cursando-decisoes.md');

function loadAlunos() {
  if (!existsSync(DECISOES_FILE)) {
    console.error(`Arquivo de decisões ausente: ${DECISOES_FILE}`);
    process.exit(1);
  }
  const out = [];
  for (const raw of readFileSync(DECISOES_FILE, 'utf-8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const m = line.match(/^aluno:\s*(.+)$/i);
    if (m) out.push(m[1].trim().toLowerCase());
  }
  return out;
}

function loadEnv(file) {
  const o = {};
  try {
    for (const l of readFileSync(file, 'utf-8').split('\n')) {
      const m = l.match(/^([A-Za-z_]+)=(.*)$/);
      if (m) o[m[1]] = m[2].trim();
    }
  } catch { /* ausente */ }
  return o;
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
  const res = await fetch(`${URL}/rest/v1/${path}`, { headers });
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${await res.text()}`);
  return res.json();
}

const hasGrade = (b) =>
  [b.n1, b.n2, b.n3, b.rec].some((v) => Number(v) > 0) ||
  (b.nota_estagio !== null && b.nota_estagio !== undefined && String(b.nota_estagio).trim() !== '');

async function main() {
  const emails = loadAlunos();
  if (!emails.length) { console.error('Nenhum aluno no arquivo de decisões.'); process.exit(1); }

  const perfis = await getAll(`perfis?select=id,email&email=in.(${emails.map((e) => `"${e}"`).join(',')})`);
  const byEmail = new Map(perfis.map((p) => [String(p.email).toLowerCase(), p]));

  let destravadas = 0, mantidas = 0;
  const errors = [];

  for (const email of emails) {
    const p = byEmail.get(email);
    if (!p) { errors.push(`Aluno não encontrado: ${email}`); continue; }
    const rows = await getAll(`boletim?select=id,disciplina,status,n1,n2,n3,rec,nota_estagio&aluno_id=eq.${p.id}&status=eq.pendente`);
    console.log(`\n${email} [${p.id}] — ${rows.length} pendente(s)`);
    for (const b of rows) {
      if (hasGrade(b)) {
        destravadas++;
        console.log(`  DESTRAVAR  ${b.disciplina} (n1=${b.n1} n2=${b.n2} n3=${b.n3} rec=${b.rec} estagio=${b.nota_estagio ?? '-'})`);
        if (APPLY) {
          await req('PATCH', `boletim?id=eq.${b.id}`, { status: null });
          try {
            await req('POST', 'audit_log', [{
              usuario_id: p.id,
              usuario_nome: 'Destravar matrícula tardia (script)',
              usuario_perfil: 'sistema',
              acao: 'destravar_pendente_com_nota',
              tabela_afetada: 'boletim',
              registro_id: b.id,
              descricao: `Componente "${b.disciplina}" tinha status=pendente e já possuía nota; status reposto para normal`,
              dados_novos: { status: null },
            }]);
          } catch (e) { errors.push(`audit_log ${b.id}: ${e.message}`); }
        }
      } else {
        mantidas++;
        console.log(`  manter     ${b.disciplina} (sem nota)`);
      }
    }
  }

  console.log(`\n===== ${APPLY ? 'APPLY' : 'DRY-RUN'} =====`);
  console.log(`A destravar: ${destravadas} | mantidas pendentes: ${mantidas}`);
  if (errors.length) { console.log('ERROS:'); for (const e of errors) console.log('  -', e); }
  if (!APPLY) console.log('\n(dry-run) Nada foi alterado. Rode com --apply após o backup.');
  else console.log('\nAplicado.');
}

main().catch((e) => { console.error('Falha:', e.message); process.exit(1); });
