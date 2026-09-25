# Rotação de credenciais expostas

> Rotacionar é o que **neutraliza** o vazamento (o histórico do git ainda tem os valores antigos).
> Faça na ordem abaixo. Nunca cole os valores novos em arquivo versionado.

## Mapa: onde está / onde usa / onde rotaciona / onde atualizar

| Credencial | Está em | Usada por | Rotaciona em | Atualizar depois |
|---|---|---|---|---|
| **Senha do Postgres** (`DB_CONNECTION`) | `scripts/.env.backup` | `backup-db.mjs`, `backup-db.sh` | Supabase → PROJECT SETTINGS → **Database → Reset database password** | `scripts/.env.backup` |
| **JWT secret / API keys** (`ANON_KEY`, `SERVICE_ROLE_KEY`) | `.env`, `.env.local`, `.env.production`; CI secrets; Edge Functions | app, scripts `dedup-*.mjs`, build/deploy | Supabase → PROJECT SETTINGS → **API → JWT Settings → Generate new JWT secret** (rotaciona anon **e** service_role) | `.env`, `.env.local`, `.env.production`, GitHub Actions secrets, `supabase secrets set`, `.env.example` (anon) |
| **GitHub PAT** (`GH_PAT`) | `scripts/.env.backup` | `backup-db.sh` (push dos backups) | GitHub → Settings → Developer settings → **Personal access tokens** (classic ou fine-grained): revogar antigo, criar novo | `scripts/.env.backup` |
| **Passphrase de criptografia** (`GPG_PASS`) | `scripts/.env.backup` | `backup-db.sh` (OpenSSL AES-256-CBC) | escolher nova passphrase forte | `scripts/.env.backup` + **re-criptografar** os `*.dump.enc` existentes |

## Passo a passo

### 1. Senha do Postgres (Supabase)
- Dashboard → Project Settings → Database → **Reset database password**.
- Editar `scripts/.env.backup`: trocar **apenas a senha** dentro de `DB_CONNECTION` (manter host e
  porta). Não colar o valor aqui nem em arquivo versionado.
- Não afeta o runtime do app (só os scripts de backup/dedup).

### 2. JWT secret + API keys (Supabase)
- Dashboard → Project Settings → API → JWT Settings → **Generate new JWT secret**.
- Isso invalida `anon` e `service_role` antigos e **desloga todas as sessões** (fazer em janela de manutenção).
- Atualizar:
  - locais: `.env`, `.env.local`, `.env.production` (`VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_SERVICE_ROLE_KEY`);
  - CI: GitHub repo → Settings → Secrets and variables → Actions → `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`;
  - Edge Functions: `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<nova> --project-ref <ref>` e redeploy;
  - `.env.example` (atualizar a anon de exemplo, se for real).

### 3. GitHub PAT
- GitHub → Settings → Developer settings → Personal access tokens → **revogar** o antigo e criar novo, com escopo mínimo ao repositório de backups (`GH_REPO`).
- Colar o novo em `scripts/.env.backup` (`GH_PAT=`).
- Recomendado: usar **fine-grained** (repo de backup, permissão Contents: write).

### 4. Passphrase de criptografia (GPG_PASS)
- Escolher nova passphrase forte e atualizar `scripts/.env.backup`.
- **Re-criptografar** os backups já versionados (foram cifrados com a antiga):
  ```bash
  # para cada .dump.enc antigo, decifrar com a antiga e recifrar com a nova
  openssl enc -d -aes-256-cbc -pbkdf2 -pass "pass:<ANTIGA>" -in antigo.dump.enc -out dump.tmp
  openssl enc    -aes-256-cbc -salt -pbkdf2 -pass "pass:<NOVA>"   -in dump.tmp -out novo.dump.enc
  rm -f dump.tmp
  ```
  Depois substituir os `.enc` no repo de backups e remover os antigos.

### 5. Verificação final
```bash
node scripts/security/scan-sensitive.mjs --all
git grep -n 'SUA_SENHA_AQUI\|postgres:.*@' || true
```
- Confirmar que os valores antigos não funcionam mais (senha antiga é rejeitada; PAT antigo revogado).
- Agendar a purga do histórico (`_reversa_bugs/_security/PURGE-HISTORY.md`) para remover os valores antigos dos commits.

## Observação
A senha-padrão de reset do sistema (`csm1983#`) é um item de endurecimento separado (hoje está
literal no código e serve de padrão para o botão "Resetar Senha").
