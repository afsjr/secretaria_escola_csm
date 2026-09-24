#!/usr/bin/env node
/**
 * Scanner de dados sensíveis (PII/segredos) para pré-commit.
 *
 * Regra do projeto: nenhum dado real de pessoa (nome, CPF, e-mail, telefone,
 * endereço, id de conta) nem credencial pode ser versionado ou persistido de
 * forma a permitir consulta/exposição por pessoa não autorizada.
 *
 * Uso:
 *   node scripts/security/scan-sensitive.mjs            # varre o que está staged
 *   node scripts/security/scan-sensitive.mjs --all      # varre todos os arquivos versionados
 *
 * Saída: lista arquivo:linha:regra (com trecho mascarado) e exit 1 se houver achado.
 * Exceções (dados fictícios/placeholders) ficam em scripts/security/allowlist.txt.
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const ROOT = execSync('git rev-parse --show-toplevel').toString().trim();
process.chdir(ROOT);

const ALL = process.argv.includes('--all');

function listFiles() {
  const cmd = ALL
    ? 'git ls-files -z'
    : 'git diff --cached --name-only --diff-filter=ACM -z';
  const out = execSync(cmd, { maxBuffer: 1024 * 1024 * 64 }).toString();
  return out.split('\0').filter(Boolean);
}

function loadAllowlist() {
  const p = 'scripts/security/allowlist.txt';
  if (!existsSync(p)) return [];
  return readFileSync(p, 'utf-8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => new RegExp(l));
}

const allow = loadAllowlist();
const isAllowed = (text) => allow.some((re) => re.test(text));

// Arquivos que nunca podem conter dados reais (defesa em profundidade)
const pathRules = [
  { re: /^scripts\/backups\/(?!.*\.enc$).+/, rule: 'backup_artefato_nao_criptografado' },
  { re: /(^|\/)\.env$/, rule: 'arquivo_dotenv' },
  { re: /\.env\.(local|production|staging|development)$/, rule: 'arquivo_dotenv' },
];

const contentRules = [
  { rule: 'cpf_formatado', re: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g },
  { rule: 'cpf_bruto', re: /(?<!\d)\d{11}(?!\d)/g, onlyWith: /cpf/i },
  { rule: 'email', re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  { rule: 'jwt', re: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g },
  { rule: 'postgres_url_com_senha', re: /postgres(?:ql)?:\/\/[^\s:/@]+:[^@\s]+@/g },
  { rule: 'chave_privada', re: /-----BEGIN [A-Z ]{0,30}PRIVATE KEY-----/g },
  { rule: 'token_github', re: /gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}/g },
  { rule: 'chave_aws', re: /AKIA[0-9A-Z]{16}/g },
  { rule: 'senha_em_texto', re: /(?:senha|password|passwd|secret|api[_-]?key|token)\s*[:=]\s*['"][^'"]{8,}['"]/gi },
];

const findings = [];
const isBinary = (buf) => buf.includes(0);

for (const file of listFiles()) {
  if (file.startsWith('scripts/security/')) continue;
  if (file.startsWith('node_modules/')) continue;
  for (const { re, rule } of pathRules) {
    if (re.test(file) && !isAllowed(file)) {
      findings.push({ file, line: 0, rule, text: file });
    }
  }
  let buf;
  try {
    buf = readFileSync(file);
  } catch {
    continue;
  }
  if (isBinary(buf)) continue;
  const lines = buf.toString('utf-8').split('\n');
  lines.forEach((line, i) => {
    for (const { rule, re, onlyWith } of contentRules) {
      if (onlyWith && !onlyWith.test(line)) continue;
      const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
      let m;
      while ((m = g.exec(line)) !== null) {
        const text = m[0];
        if (!isAllowed(text)) {
          findings.push({ file, line: i + 1, rule, text });
        }
        if (m.index === g.lastIndex) g.lastIndex++;
      }
    }
  });
}

const mask = (t) => (t.length <= 6 ? '***' : t.slice(0, 4) + '…' + t.slice(-2));

if (findings.length === 0) {
  console.log('scan-sensitive: OK — nenhum dado sensível detectado.');
  process.exit(0);
}

console.error(`\nscan-sensitive: ${findings.length} achado(s) — commit BLOQUEADO.\n`);
for (const f of findings) {
  console.error(`  ${f.file}${f.line ? ':' + f.line : ''}  [${f.rule}]  ${mask(f.text)}`);
}
console.error('\nMascare/anonymize o dado (nomes→pseudônimo, CPF/e-mail/UUID→mascarado),');
console.error('remova o arquivo do versionamento, ou registre um falso-positivo em');
console.error('scripts/security/allowlist.txt (só para dados comprovadamente fictícios).\n');
process.exit(1);
