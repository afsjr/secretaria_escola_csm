---
schema_version: 1
id: OPP-20260909-C3D4
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
  before: "função loadAulasDaDisciplina (63 linhas) presente, sem chamadas externas"
  after: "função removida; import formatDateBR removido por não ter mais usuário"
change_set:
  - chg: CHG-001
    file: src/views/professor-turmas.ts
    purpose: "Remove a função morta loadAulasDaDisciplina e o import não utilizado formatDateBR"
approval:
  by: user
  at: 2026-09-09T17:40:00-03:00
reversible_via: ["CHG-001.diff"]
---

## Prova de morte

- `grep -c loadAulasDaDisciplina src/views/professor-turmas.ts` → 0 (antes: 2 — definição + auto-referência na recursão)
- A única referência era a chamada recursiva dentro da própria função (exclusão de aula). Nenhum caller externo.
- Não existe elemento `.aulas-list` no template HTML da view — o seletor nunca encontrava nó.
- `getAulasDaDisciplina`/`excluirAula` continuam existindo no `ProfessorService` — só a view não os usa.

## Rede de segurança

- `npm run type-check` → verde antes e depois
- `npm test` → 314 passed / 4 failed (4 falhas pré-existentes inalteradas, baseline)

## Observação

Durante a aplicação, um primeiro edit removeu também `loadFrequenciaAlunos` por erro de delimitação (oldString largo demais). O erro foi detectado no type-check (TS2304: Cannot find name 'loadFrequenciaAlunos') e a função foi restaurada integralmente antes de fechar. Estado final verificado: `loadFrequenciaAlunos` presente com 2 referências (definição + chamada em ProfessorTurmasView).