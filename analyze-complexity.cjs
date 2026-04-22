const fs = require('fs');
const path = require('path');

function getCyclomaticComplexity(code) {
  let complexity = 1;
  const lines = code.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('if') || /\bif\s*\(/.test(trimmed) ||
        /\bfor\s*\(/.test(trimmed) || /\bwhile\s*\(/.test(trimmed) ||
        /\bcatch\s*\(/.test(trimmed) || /\&\&/.test(trimmed) || /\|\|/.test(trimmed)) {
      complexity++;
    }
  }
  return complexity;
}

function analyzeFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const lines = code.split('\n').length;
  return { lines, complexity: getCyclomaticComplexity(code) };
}

function getFiles(dir, ext, results) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist') {
      getFiles(fullPath, ext, results);
    } else if (entry.name.endsWith(ext)) {
      try {
        const stats = analyzeFile(fullPath);
        const relPath = path.relative(__dirname, fullPath);
        results.push({ file: relPath, ...stats });
      } catch (e) {}
    }
  }
}

const srcDir = path.join(__dirname, 'src');
const results = [];
getFiles(srcDir, '.ts', results);
results.sort((a, b) => b.complexity - a.complexity);

console.log('================================================================================');
console.log('ANÁLISE DE COMPLEXIDADE CICLOMÁTICA - Pós-Refatoração');
console.log('================================================================================');
console.log('');
console.log('Arquivo                                          | Linhas | CC');
console.log('--------------------------------------------------------------------------------');
for (const r of results.slice(0, 10)) {
  const fileShort = r.file.replace('src/', '').padEnd(45);
  console.log(fileShort + ' | ' + String(r.lines).padStart(6) + ' | ' + r.complexity);
}

const avgCC = (results.reduce((sum, r) => sum + r.complexity, 0) / results.length).toFixed(1);
const criticalFiles = results.filter(r => r.complexity > 25).length;
console.log('');
console.log('CC média: ' + avgCC + ' | Arquivos críticos (>25): ' + criticalFiles);
