---
schema_version: 1
id: OPP-20260909-C3D4
display_number: 2
context: professor-turmas
verb: prune
title: Função loadAulasDaDisciplina nunca chamada
target:
  files: ["src/views/professor-turmas.ts"]
  symbol: loadAulasDaDisciplina
smell: Função definida nas linhas 718-781 com console.log de debug, mas nunca chamada de fora dela mesma. Não existe elemento .aulas-list no HTML template. Código morto completo.
roi:
  confidence: green
  impact: 63 linhas de código morto com console.log de debug, prejudica legibilidade
  cost: low
  est_return: Remove código morto e logs de debug em produção
state: applied
traceability:
  soul: ["auth: controle de acesso"]
  specs: ["professor/requirements.md"]
  transformation: transformations/OPP-20260909-C3D4-dead-function/transformation.md
---

## Observado

- `loadAulasDaDisciplina` (linhas 718-781): Função async que busca aulas via `ProfessorService.getAulasDaDisciplina` e renderiza em `.aulas-list[data-turma-id]`.
- Contém `console.log` de debug nas linhas 728 e 733.
- Não existe nenhum elemento com classe `aulas-list` no HTML do template.
- A função só é chamada recursivamente em si mesma (linha 772) após exclusão de aula.
- Não é exportada e não é chamada de `ProfessorTurmasView`.

## Transformação proposta

Remover a função `loadAulasDaDisciplina` inteira (linhas 718-781). Se a funcionalidade de listar/excluir aulas for necessária no futuro, pode ser reimplementada com o devido wiring.

## Risco

Muito baixo — código não executado. A exclusão não afeta comportamento observável.
