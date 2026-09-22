/**
 * Backup lógico (somente leitura) via REST do Supabase.
 *
 * Gera, em scripts/backups/:
 *   - backup-dedup-<timestamp>.json : snapshot completo das tabelas públicas
 *   - backup-dedup-<timestamp>.sql  : INSERTs para restauração manual
 *   - backup-dedup-<timestamp>.log  : contagens por tabela
 *
 * Uso: node scripts/backup-dedup.mjs
 * Requer: VITE_SUPABASE_URL e VITE_SUPABASE_SERVICE_ROLE_KEY (.env / .env.local)
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

async function listRelations() {
  const res = await fetch(`${URL}/rest/v1/`, {
    headers: { ...headers, Accept: 'application/openapi+json' },
  });
  const spec = await res.json();
  return Object.keys(spec.paths || {})
    .filter((p) => !p.startsWith('/rpc') && p !== '/')
    .map((p) => p.slice(1))
    .sort();
}

async function fetchAll(table) {
  const rows = [];
  const pageSize = 1000;
  for (let offset = 0; ; offset += pageSize) {
    const res = await fetch(
      `${URL}/rest/v1/${table}?select=*&limit=${pageSize}&offset=${offset}`,
      { headers }
    );
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`${res.status} ${body.slice(0, 200)}`);
    }
    const page = await res.json();
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows;
}

function sqlValue(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  return `'${s.replace(/'/g, "''")}'`;
}

function toSql(table, rows) {
  if (!rows.length) return `-- ${table}: 0 rows`;
  const cols = Object.keys(rows[0]);
  const colList = cols.map((c) => `"${c}"`).join(', ');
  const lines = [`-- ${table}: ${rows.length} rows`];
  for (const row of rows) {
    const values = cols.map((c) => sqlValue(row[c])).join(', ');
    lines.push(`INSERT INTO "public"."${table}" (${colList}) VALUES (${values});`);
  }
  return lines.join('\n');
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const relations = await listRelations();

  const snapshot = {};
  const sqlParts = [
    `-- Backup lógico CSM`,
    `-- Gerado em: ${new Date().toISOString()}`,
    `-- Projeto: ${URL}`,
    `-- Tabelas: ${relations.length}`,
    '',
  ];
  const logLines = [`Backup em ${new Date().toISOString()}`, `Projeto: ${URL}`, ''];

  for (const table of relations) {
    try {
      const rows = await fetchAll(table);
      snapshot[table] = rows;
      sqlParts.push(toSql(table, rows), '');
      logLines.push(`${String(rows.length).padStart(6)}  ${table}`);
      console.log(`OK  ${String(rows.length).padStart(6)}  ${table}`);
    } catch (err) {
      snapshot[table] = { error: err.message };
      logLines.push(`  ERRO  ${table}: ${err.message}`);
      console.error(`ERR ${table}: ${err.message}`);
    }
  }

  const base = join(outDir, `backup-dedup-${ts}`);
  writeFileSync(`${base}.json`, JSON.stringify(snapshot, null, 2));
  writeFileSync(`${base}.sql`, sqlParts.join('\n'));
  writeFileSync(`${base}.log`, logLines.join('\n'));
  console.log(`\nBackup gravado em:\n  ${base}.json\n  ${base}.sql\n  ${base}.log`);
}

main().catch((err) => {
  console.error('Backup falhou:', err.message);
  process.exit(1);
});
