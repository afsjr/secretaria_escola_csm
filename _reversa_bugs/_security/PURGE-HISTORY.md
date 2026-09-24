# P2 — Purgar do histórico git os blobs com PII/segredos

> **NÃO executado.** Roteiro para decisão humana. Ação **destrutiva e irreversível**:
> reescreve commits e exige `force-push`. Requer avisar todos os colaboradores.

## Por que

O commit `1aab953` (artefatos do bug não mascarados) e o commit `2767d37` (dumps completos do
banco) ainda carregam PII no histórico, mesmo após `9eb3d0d` removê-los do HEAD.

## Antes de começar

1. **Rotacionar primeiro** todas as credenciais expostas (senha do Postgres, `GPG_PASS`,
   `GH_PAT`, service role key). Reescrever histórico **não** invalida segredos já vazados.
2. Garantir que o remoto e todos os clones serão atualizados; force-push invalida clones.
3. Fazer um espelho de backup do repo (por segurança): `git clone --mirror <url> backup.git`.
4. Preferir horário de baixa (bloqueia PRs/merges durante a reescrita).

## Opção A — `git-filter-repo` (recomendado)

```bash
brew install git-filter-repo

# Caminhos a remover do histórico (adaptar). Ex.:
git filter-repo --force \
  --path scripts/backups --invert-paths \
  --path _reversa_bugs/pagina-de-usuarios --invert-paths
```

Se o objetivo for reescrever o conteúdo (mascarar) em vez de remover o caminho, use
`--replace-text` com um arquivo de substituições:

```bash
cat > /tmp/replacements.txt <<'EOF'
CAMILLY VITORIA DA SILVA ALBUQUERQUE==>PESSOA
159.598.884-08==>***.***.***-**
camilly@gmail.com==><e-mail-mascarado>
EOF
git filter-repo --force --replace-text /tmp/replacements.txt
```

## Opção B — BFG Repo-Cleaner

```bash
brew install bfg
# remover arquivos grandes/sensíveis (nomeados no HEAD):
bfg --delete-files 'backup-dedup-*.sql' --delete-files 'dedup-*.json' --delete-files 'dedup-*.pdf'
bfg --replace-text /tmp/replacements.txt
git reflog expire --expire=now --all && git gc --prune=now --aggressive
```

## Depois

```bash
git remote add origin <url>   # filter-repo remove o remote; readicione
git push --force --all
git push --force --tags
```

- Abrir ticket no GitHub Support para expurgar objetos órfãos (o GitHub mantém blobs órfãos por
  um tempo até o GC).
- Avisar o time para `git fetch && git reset --hard origin/main` (não `pull`/merge).

## Verificação

```bash
git log --all --full-history -- scripts/backups
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | grep -iE 'backup|dedup' | head
node scripts/security/scan-sensitive.mjs --all
```
