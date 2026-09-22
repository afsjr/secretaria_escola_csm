/**
 * Converte um relatório Markdown (formato gerado pelo dedup-report.mjs) em PDF
 * usando o Chrome headless.
 *
 * Uso: node scripts/md-to-pdf.mjs <arquivo.md> [saida.pdf]
 */
import { readFileSync, writeFileSync, rmSync } from 'fs';
import { basename, dirname, join, resolve } from 'path';
import { spawnSync } from 'child_process';

const input = process.argv[2];
if (!input) {
  console.error('Uso: node scripts/md-to-pdf.mjs <arquivo.md> [saida.pdf]');
  process.exit(1);
}
const mdPath = resolve(input);
const pdfPath = process.argv[3] ? resolve(process.argv[3]) : mdPath.replace(/\.md$/i, '.pdf');
const htmlPath = join(dirname(mdPath), `.tmp-${basename(mdPath, '.md')}.html`);

const md = readFileSync(mdPath, 'utf-8');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) =>
  esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.+?)`/g, '<code>$1</code>');

const lines = md.split('\n');
const html = [];
let inTable = false;
let inList = false;

const closeTable = () => { if (inTable) { html.push('</tbody></table>'); inTable = false; } };
const closeList = () => { if (inList) { html.push('</ul>'); inList = false; } };

for (const raw of lines) {
  const line = raw.replace(/\r$/, '');
  if (/^\s*$/.test(line)) { closeTable(); closeList(); continue; }

  if (/^\|/.test(line)) {
    closeList();
    const cells = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
    if (/^[\s:|-]+$/.test(cells.join('')) && cells.every((c) => /^:?-+:?$/.test(c) || c === '')) continue;
    if (!inTable) { html.push('<table><thead><tr>' + cells.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>'); inTable = true; }
    else { html.push('<tr>' + cells.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>'); }
    continue;
  }
  closeTable();

  if (/^#\s+/.test(line)) { closeList(); html.push(`<h1>${inline(line.replace(/^#\s+/, ''))}</h1>`); continue; }
  if (/^##\s+/.test(line)) { closeList(); html.push(`<h2>${inline(line.replace(/^##\s+/, ''))}</h2>`); continue; }
  if (/^###\s+/.test(line)) { closeList(); html.push(`<h3>${inline(line.replace(/^###\s+/, ''))}</h3>`); continue; }
  if (/^>\s?/.test(line)) { closeList(); html.push(`<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`); continue; }
  if (/^-\s+/.test(line)) { if (!inList) { html.push('<ul>'); inList = true; } html.push(`<li>${inline(line.replace(/^-\s+/, ''))}</li>`); continue; }
  closeList();
  html.push(`<p>${inline(line)}</p>`);
}
closeTable(); closeList();

const doc = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<style>
  @page { size: A4 landscape; margin: 10mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; color: #1f2937; font-size: 10px; margin: 0; }
  h1 { font-size: 18px; margin: 0 0 8px; color: #111827; }
  h2 { font-size: 13px; margin: 14px 0 4px; color: #1d4ed8; border-bottom: 1px solid #cbd5e1; padding-bottom: 2px; page-break-after: avoid; }
  h3 { font-size: 11px; margin: 10px 0 4px; }
  p { margin: 3px 0; }
  blockquote { margin: 3px 0; padding: 3px 8px; background: #fef9c3; border-left: 3px solid #eab308; color: #713f12; font-size: 9.5px; }
  ul { margin: 4px 0; padding-left: 16px; }
  table { border-collapse: collapse; width: 100%; margin: 6px 0 12px; page-break-inside: auto; }
  th, td { border: 1px solid #cbd5e1; padding: 3px 5px; text-align: left; vertical-align: top; font-size: 8.5px; }
  th { background: #e2e8f0; font-size: 8.5px; }
  tr { page-break-inside: avoid; }
  tbody tr:nth-child(even) { background: #f8fafc; }
  code { font-family: "SF Mono", Menlo, monospace; font-size: 8px; background: #f1f5f9; padding: 0 2px; border-radius: 2px; }
  strong { color: #b91c1c; }
</style></head>
<body>
${html.join('\n')}
</body></html>`;

writeFileSync(htmlPath, doc);

const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const res = spawnSync(chrome, [
  '--headless',
  '--disable-gpu',
  '--no-pdf-header-footer',
  `--print-to-pdf=${pdfPath}`,
  `file://${htmlPath}`,
], { stdio: 'inherit' });

rmSync(htmlPath, { force: true });

if (res.status !== 0) {
  console.error('Falha ao gerar PDF (Chrome headless).');
  process.exit(res.status || 1);
}
console.log(`PDF gerado: ${pdfPath}`);
