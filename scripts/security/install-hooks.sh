#!/usr/bin/env bash
# Instala o hook de pré-commit que bloqueia commits com PII/segredos.
# Uso:  bash scripts/security/install-hooks.sh
#
# Observação: este script escreve em .git/hooks/pre-commit e .git/info/exclude
# (metadados locais do git, não versionados).
set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

HOOK="$ROOT/.git/hooks/pre-commit"
mkdir -p "$ROOT/.git/hooks"

cat > "$HOOK" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

# 1) gitleaks, se o time tiver instalado (varre o staged)
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks protect --staged --redact --no-banner || {
    echo "gitleaks bloqueou o commit."; exit 1; }
fi

# 2) scanner próprio (sem dependências)
node scripts/security/scan-sensitive.mjs
EOF

chmod +x "$HOOK"

# Mantém estado local do CLI do Supabase fora do versionamento (exclude local)
EXCLUDE="$ROOT/.git/info/exclude"
grep -qx 'supabase/.temp/' "$EXCLUDE" 2>/dev/null || echo 'supabase/.temp/' >> "$EXCLUDE"

echo "Hook instalado em: $HOOK"
echo "Exclusão local adicionada: supabase/.temp/"
echo "Teste com: node scripts/security/scan-sensitive.mjs"
