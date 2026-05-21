#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$SCRIPT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DUMP_FILE="$BACKUP_DIR/controle_secretaria_$TIMESTAMP.dump"
ENCRYPTED_FILE="$DUMP_FILE.enc"
LOG_FILE="$BACKUP_DIR/backup.log"
ENV_FILE="$SCRIPT_DIR/.env.backup"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

if [ ! -f "$ENV_FILE" ]; then
  log "ERRO: Arquivo .env.backup não encontrado em $ENV_FILE"
  exit 1
fi

load_var() {
  grep -m1 "^$1=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '\r'
}

DB_CONNECTION=$(load_var DB_CONNECTION)
GPG_PASS=$(load_var GPG_PASS)
GH_PAT=$(load_var GH_PAT)
GH_REPO="github.com/$(load_var GH_REPO)"

if [ -z "$DB_CONNECTION" ] || [ -z "$GPG_PASS" ] || [ -z "$GH_PAT" ] || [ -z "$GH_REPO" ]; then
  log "ERRO: .env.backup incompleto. Necessário: DB_CONNECTION, GPG_PASS, GH_PAT, GH_REPO"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

log "Iniciando backup..."

node "$SCRIPT_DIR/backup-db.mjs" > "$DUMP_FILE" 2>&1
BACKUP_EXIT=${PIPESTATUS[0]}
if [ "$BACKUP_EXIT" -ne 0 ] || [ ! -s "$DUMP_FILE" ]; then
  log "ERRO: Falha ao gerar dump (exit code $BACKUP_EXIT)"
  tail -5 "$DUMP_FILE" 2>/dev/null | tee -a "$LOG_FILE"
  exit 1
fi

DUMP_SIZE=$(stat -f%z "$DUMP_FILE" 2>/dev/null || stat -c%s "$DUMP_FILE" 2>/dev/null || echo "?")
log "Dump gerado: $DUMP_FILE ($DUMP_SIZE bytes)"

log "Criptografando com OpenSSL (AES-256-CBC)..."
openssl enc -aes-256-cbc -salt -pbkdf2 \
  -pass "pass:$GPG_PASS" \
  -in "$DUMP_FILE" \
  -out "$ENCRYPTED_FILE"

ENCRYPTED_SIZE=$(stat -f%z "$ENCRYPTED_FILE" 2>/dev/null || stat -c%s "$ENCRYPTED_FILE" 2>/dev/null || echo "?")
log "Arquivo criptografado: $ENCRYPTED_FILE ($ENCRYPTED_SIZE bytes)"

rm -f "$DUMP_FILE"
log "Arquivo temporário removido: $DUMP_FILE"

REPO_DIR="/tmp/secretaria-db-backup"
if [ -d "$REPO_DIR" ]; then
  git -C "$REPO_DIR" pull --ff-only 2>&1 | tee -a "$LOG_FILE"
else
  git clone "https://x-access-token:$GH_PAT@$GH_REPO" "$REPO_DIR" 2>&1 | tee -a "$LOG_FILE"
fi

cp "$ENCRYPTED_FILE" "$REPO_DIR/"
git -C "$REPO_DIR" add -A
git -C "$REPO_DIR" commit -m "backup $TIMESTAMP" 2>&1 | tee -a "$LOG_FILE"
git -C "$REPO_DIR" push 2>&1 | tee -a "$LOG_FILE"

log "Backup enviado para $GH_REPO"

log "Limpando backups locais com mais de 30 dias..."
find "$BACKUP_DIR" -name "*.gpg" -type f -mtime +30 -delete 2>&1 | tee -a "$LOG_FILE"

log "Backup concluído com sucesso!"
