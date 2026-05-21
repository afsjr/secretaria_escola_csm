import pg from 'pg';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = join(__dirname, '.env.backup');

function loadVar(key) {
  const content = readFileSync(envFile, 'utf-8');
  const match = content.match(new RegExp(`^${key}=(.*)`, 'm'));
  if (!match) return '';
  return match[1].trim().replace(/\r$/, '');
}

const dbUrl = loadVar('DB_CONNECTION');
if (!dbUrl) {
  console.error('DB_CONNECTION not found in .env.backup');
  process.exit(1);
}

async function main() {
  const client = new pg.Client({ connectionString: dbUrl });
  await client.connect();

  const tablesRes = await client.query(`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      AND table_type = 'BASE TABLE'
    ORDER BY table_schema, table_name
  `);

  const output = [];
  output.push('-- Backup gerado em ' + new Date().toISOString());
  output.push('-- Database: ' + dbUrl.split('@')[1]?.split('/')[0]);
  output.push('');

  for (const { table_schema, table_name } of tablesRes.rows) {
    const fullName = `"${table_schema}"."${table_name}"`;

    try {
      const dataRes = await client.query(`SELECT * FROM ${fullName} ORDER BY 1`);
      const colNames = dataRes.fields.map(f => `"${f.name}"`).join(', ');

      if (dataRes.rows.length === 0) {
        output.push(`-- ${fullName}: 0 rows`);
        continue;
      }

      output.push(`-- ${fullName}: ${dataRes.rows.length} rows`);
      for (const row of dataRes.rows) {
        const values = dataRes.fields.map(f => {
          const v = row[f.name];
          if (v === null) return 'NULL';
          if (typeof v === 'number') return String(v);
          if (v instanceof Date) return `'${v.toISOString()}'`;
          return `'${String(v).replace(/'/g, "''")}'`;
        }).join(', ');
        output.push(`INSERT INTO ${fullName} (${colNames}) VALUES (${values});`);
      }
      output.push('');
    } catch (err) {
      output.push(`-- ERROR on ${fullName}: ${err.message}`);
    }
  }

  await client.end();
  return output.join('\n');
}

main()
  .then(sql => {
    process.stdout.write(sql);
  })
  .catch(err => {
    console.error('Backup failed:', err.message);
    process.exit(1);
  });
