---
schema_version: 1
id: OPP-20260909-A1B2
verb: prune
state: applied
safety_net:
  kind: existing
  green_before: true
  green_after: true
preservation:
  method: death-proof
  evidence: ["CHG-001.diff", "before.ts", "after.ts"]
measurement:
  before: "registro pré-existente: 2 botões renderizados sem handler; 942 linhas no arquivo"
  after: "2 botões removidos; 866 linhas no arquivo (-76 linhas de dead code)"
change_set:
  - chg: CHG-001
    file: src/views/professor-turmas.ts
    purpose: "Remove os botões btn-alertas-geral e btn-export-geral do header da view"
approval:
  by: user
  at: 2026-09-09T17:40:00-03:00
reversible_via: ["CHG-001.diff"]
---

## Prova de morte

- `grep -c btn-alertas-geral src/views/professor-turmas.ts` → 0 (antes da aplicação: 1)
- `grep -c btn-export-geral src/views/professor-turmas.ts` → 0 (antes da aplicação: 1)
- Busca por `addEventListener` / `getElementById` / `querySelector` com esses IDs no arquivo → nenhuma referência fora do próprio HTML.
- Nenhuma spec de `_reversa_sdd/professor/requirements.md` referencia esses botões de forma obrigatória.

## Rede de segurança

- `npm run type-check` → verde antes e depois
- `npm test` → 314 passed / 4 failed (4 falhas pré-existentes inalteradas, baseline)