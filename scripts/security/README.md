# Segurança de dados — proteção contra vazamento de PII/segredos

## Regra do projeto (não-negociável)

Nenhum dado real de pessoa (nome, CPF, e-mail, telefone, endereço, data de nascimento,
documentos, id de conta) nem credencial pode ser **versionado** nem **persistido** de forma que
permita **consulta ou exposição por pessoa não autorizada**.

## Como rodar a verificação

```bash
node scripts/security/scan-sensitive.mjs           # varre o que está staged (usado pelo hook)
node scripts/security/scan-sensitive.mjs --all     # varre todos os arquivos versionados
```

Saída: `arquivo:linha:regra` com trecho mascarado; exit 1 se houver achado.

## Hook de pré-commit

```bash
bash scripts/security/install-hooks.sh
```

Instala `.git/hooks/pre-commit` (metadados locais, não versionados). O hook roda o **gitleaks**
se estiver instalado e, em seguida, o scanner próprio. Também adiciona `supabase/.temp/` ao
`.git/info/exclude`.

Gitleaks opcional (recomendado): `brew install gitleaks`.

## Exceções (`allowlist.txt`)

Só entram dados **comprovadamente fictícios/placeholder** (CPFs de teste da Receita, domínios
`@exemplo.*`, máscaras `999.999.999-99`, contato institucional público, senha-padrão de reset do
sistema). Nunca adicione dado real.

## O que NUNCA entra no git

- Dumps/backups (`scripts/backups/*` não-`.enc`), relatórios de dedup, exports (CSV/XLSX/PDF).
- `.env`, `.env.local`, `.env.production`, `.env.backup`.
- Qualquer evidência de bug com dado real: use o template mascarado
  (`_reversa_bugs/_templates/evidence-mascarada.md`).

## Pendências conhecidas (não resolvidas aqui)

1. **Reescrever o histórico** para remover blobs com PII já commitados:
   ver `_reversa_bugs/_security/PURGE-HISTORY.md`.
2. **Rotacionar credenciais**: senha do Postgres, `GPG_PASS`, `GH_PAT` e a service role key do
   Supabase (foram persistidas em claro em arquivos locais/segredos de CI).
3. **Endurecer a senha-padrão de reset** `csm1983#` (hoje literal no código) — item separado.
