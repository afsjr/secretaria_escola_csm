const fs = require('fs');
const path = require('path');

function getCyclomaticComplexity(code) {
  let complexity = 1;
  const lines = code.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith('if') ||
      trimmed.startsWith('else if') ||
      /\bif\s*\(/.test(trimmed) ||
      /\bfor\s*\(/.test(trimmed) ||
      /\bwhile\s*\(/.test(trimmed) ||
      /\bswitch\s*\(/.test(trimmed) ||
      /\bcatch\s*\(/.test(trimmed) ||
      /\&\&/.test(trimmed) ||
      /\|\|/.test(trimmed)
    ) {
      complexity++;
    }
  }
  
  return complexity;
}

function analyzeFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const lines = code.split('\n').length;
  const complexity = getCyclomaticComplexity(code);
  const functions = (code.match(/function\s+\w+/g) || []).length;
  
  return { lines, complexity, functions };
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
      } catch (e) {
        // Ignorar erros
      }
    }
  }
}

console.log('================================================================================');
console.log('ANÁLISE DE COMPLEXIDADE CICLOMÁTICA - Sistema Secretaria CSM');
console.log('================================================================================');
console.log('');

const srcDir = path.join(__dirname, 'src');
const results = [];
getFiles(srcDir, '.ts', results);

results.sort((a, b) => b.complexity - a.complexity);

console.log('TOP 15 ARQUIVOS MAIS COMPLEXOS:\n');
console.log('Arquivo                                          | Linhas | CC  | Funções');
console.log('--------------------------------------------------------------------------------');

for (const r of results.slice(0, 15)) {
  const fileShort = r.file.replace('src/', '').padEnd(45);
  console.log(fileShort + ' | ' + String(r.lines).padStart(6) + ' | ' + String(r.complexity).padStart(3) + ' | ' + r.functions);
}

console.log('');
console.log('================================================================================');
console.log('RESUMO ESTATÍSTICO');
console.log('================================================================================');

const avgCC = (results.reduce((sum, r) => sum + r.complexity, 0) / results.length).toFixed(1);
const maxCC = Math.max(...results.map(r => r.complexity));
const avgLines = (results.reduce((sum, r) => sum + r.lines, 0) / results.length).toFixed(0);
const filesAbove10 = results.filter(r => r.complexity > 10).length;
const filesAbove20 = results.filter(r => r.complexity > 20).length;
const criticalFiles = results.filter(r => r.complexity > 25).length;

console.log('Total de arquivos analisados: ' + results.length);
console.log('Complexidade ciclomática média: ' + avgCC);
console.log('Complexidade ciclomática máxima: ' + maxCC);
console.log('Média de linhas por arquivo: ' + avgLines);
console.log('Arquivos com CC > 10: ' + filesAbove10);
console.log('Arquivos com CC > 20: ' + filesAbove20);
console.log('Arquivos CRÍTICOS (CC > 25): ' + criticalFiles);

console.log('');
console.log('================================================================================');
console.log('CLASSIFICAÇÃO DE COMPLEXIDADE');
console.log('================================================================================');
console.log('CC 1-10    | Baixa      | Fácil de manter e testar');
console.log('CC 11-20   | Moderada   | Requer atenção');
console.log('CC 21-25   | Alta      | Difícil de manter - considerar refatoração');
console.log('CC > 25    | Crítica   | Requer refatoração imediata');
console.log('================================================================================');

const highComplexityFiles = results.filter(r => r.complexity > 20);
if (highComplexityFiles.length > 0) {
  console.log('\nARQUIVOS PRIORITÁRIOS PARA REFATORAÇÃO (CC > 20):\n');
  for (const r of highComplexityFiles.slice(0, 10)) {
    const cc = r.complexity;
    const classification = cc > 25 ? '[CRITICO]' : '[ALTO]';
    console.log(classification + ' ' + r.file + ' (CC: ' + cc + ')');
  }
}