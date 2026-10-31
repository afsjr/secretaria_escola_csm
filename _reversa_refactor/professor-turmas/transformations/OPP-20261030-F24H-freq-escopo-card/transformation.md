---
schema_version: 1
id: OPP-20261030-F24H
verb: decouple
state: applied
safety_net:
  kind: characterization
  green_before: true
  green_after: true
preservation:
  method: tests
  evidence:
    - safety-net/characterization-before.txt
    - safety-net/characterization-and-regression-after.txt
    - safety-net/type-check-after.txt
measurement:
  before: "6 chamadas a document.getElementById, 2 simbolos globais, 2N IDs duplicados"
  after: "0 chamadas a document.getElementById, 0 simbolos globais, 0 IDs duplicados, 1 resolvedor escopado ao card"
change_set:
  - chg: CHG-001
    file: src/views/professor-turmas-frequencia.test.ts
    purpose: teste de caracterizacao do fluxo de frequencia
  - chg: CHG-002
    file: src/views/professor-turmas.ts
    purpose: IDs unicos por turma e classes estaveis nos campos de frequencia
  - chg: CHG-002
    file: src/views/professor-turmas-frequencia.ts
    purpose: resolvedor camposFrequencia escopado ao card, remove getElementById
  - chg: CHG-003
    file: src/views/professor-turmas-frequencia.test.ts
    purpose: regressao com dois cards provando disciplina correta por turma
approval:
  by: user
  at: 2026-10-30T22:00:30-03:00
reversible_via: [CHG-001.diff, CHG-002.diff, CHG-003.diff]
---

## O que foi feito

1. **CHG-001**: criado teste de caracterização em
   `src/views/professor-turmas-frequencia.test.ts` cobrindo render de alunos
   ativos, checkbox de ausência, `turma.id`, data padrão e lista de ausentes.
   Verde antes da costura (ver `safety-net/characterization-before.txt`).
2. **CHG-002**: a view passou a gerar IDs únicos por turma
   (`freq-data-<turma>`, `freq-disciplina-<turma>`) e classes estáveis. O módulo
   de frequência ganhou `camposFrequencia(container, turma)`, que resolve os
   campos dentro do `.turma-card` (fallback para o container) e substituiu as 6
   chamadas a `document.getElementById`.
3. **CHG-003**: adicionado teste de regressão com dois cards. O card B salva com
   a data e a disciplina do próprio card. Esse teste falhava antes da costura
   (ver a linha `1 failed | 1 passed` no arquivo de caracterização antes) e
   passa depois.

## Mudança de comportamento aprovada

Esta transformação corrige um comportamento observável errado. Antes, o card B
lia a data e a disciplina do card A porque `getElementById` devolve o primeiro
elemento do documento. O contrato preservado é o restante do fluxo: mesmo
`turma.id`, mesmos alunos ativos, mesmo fallback de data e mesmos ausentes
marcados. A correção foi aprovada explicitamente no gate CHG-002.

## Prova

- Caracterização: verde antes e depois.
- Regressão de dois cards: vermelha antes, verde depois.
- `npm run type-check`: verde (`safety-net/type-check-after.txt`).
- `npm test` completo: 352 passam, 4 falham. As 4 falhas são pré-existentes em
  `src/views/secretaria.test.ts` e `src/components/Tabs/GerenciarAlunosTab.test.ts`.
  Reproduzem com as duas alterações revertidas por `git stash` e nenhum desses
  testes importa `professor-turmas`.

## Reversão

Aplicar os três diffs em ordem inversa. A transformação é revertível por
`CHG-001.diff`, `CHG-002.diff` e `CHG-003.diff`.
