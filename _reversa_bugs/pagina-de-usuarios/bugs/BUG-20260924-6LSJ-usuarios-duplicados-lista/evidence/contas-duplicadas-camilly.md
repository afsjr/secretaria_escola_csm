# Evidência: contas ativas duplicadas para a mesma pessoa

## PESSOA 10 (aparece 2x na página)

Backup: `scripts/backups/backup-dedup-2026-09-22T14-37-58.sql`

| Linha | id | email | CPF | status | cadastro_desativado | criado em |
|-------|----|-------|-----|--------|---------------------|-----------|
| 2528 | `<id-mascarado>` | `<e-mail-mascarado>` | `***.***.***-**` | `ativo` | `false` | 2026-04-14 |
| 2668 | `<id-mascarado>` | `<e-mail-mascarado>` | `NULL` | `ativo` | `false` | 2026-09-10 (matrícula "Enfermagem - Noite - 2026/2027") |

As duas passam no filtro de `getAllProfiles()` (`status` ativo + `cadastro_desativado` falso) e,
por terem linhas distintas em `perfis`, a página renderiza dois cards idênticos e soma 2 no `Total:`.

## Por que a dedup de 2026-09-22 não resolveu

- `scripts/dedup-pendencias.mjs:82` e `scripts/dedup-merge.mjs:139` agrupam somente por CPF:
  `for (const p of perfis) { const c = normCpf(p.cpf); if (!c) continue; ... }`
- A conta de 10/09 tem CPF `NULL`, então nunca entrou em nenhum grupo de duplicidade.
- `scripts/backups/dedup-pendencias-2026-09-22T17-09-25.md:9` — "Grupos pendentes: **0**".
- `scripts/backups/dedup-plano-apply-2026-09-22T17-07-55.md` — 28 grupos / 37 contas desativadas,
  sem nenhuma menção à PESSOA 12.

## PESSOA 11 (2x no print do usuário)

Estrutura de conta idêntica (duas linhas ativas na `perfis` com o mesmo `nome_completo`).
Conferir ids/CPFs no backup antes de qualquer reparo de dados.
