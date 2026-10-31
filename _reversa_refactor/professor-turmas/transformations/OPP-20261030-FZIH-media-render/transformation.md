---
schema_version: 1
id: OPP-20261030-FZIH
verb: simplify
state: applied
safety_net:
  kind: characterization
  green_before: true
  green_after: true
preservation:
  method: equivalence-proof
  evidence:
    - safety-net/before.txt
    - safety-net/after.txt
    - safety-net/type-check-after.txt
    - before-after/equivalence.md
measurement:
  before: "2 regras de exibicao da media (crua no render, arredondada no recalculo), 2 divergencias (coluna Media e recDisabled)"
  after: "1 regra via arredondarNota, 0 divergencias, final e status inalterados"
change_set:
  - chg: CHG-001
    file: src/views/professor-turmas-notas.test.ts
    purpose: caracterizacao do que nao muda e regressao da media exibida
  - chg: CHG-002
    file: src/views/professor-turmas-notas.ts
    purpose: arredondar a media exibida e alinhar o bloqueio da Rec
approval:
  by: user
  at: 2026-10-30T22:12:00-03:00
reversible_via: [CHG-001.diff, CHG-002.diff]
---

## Lógica antes

`renderLinhaAluno` exibia `mediaParcial` crua e decidia `recDisabled` por
`mediaParcial >= 7`. `recalcularMedia` exibia
`arredondarNota(calcularMediaParcial(...))` e decidia o bloqueio pelo valor
arredondado. O PDF já usava o valor arredondado. Três caminhos, duas regras.

## Lógica depois

`renderLinhaAluno` calcula `mediaExibida = arredondarNota(mediaParcial)` e usa
esse valor na coluna Média e em `recDisabled`. A nota final continua sendo
`calcularNotaFinal(mediaParcial, rec)` com a média crua, idêntica à de antes.
O recálculo não foi tocado.

A nova lógica é mais simples porque elimina a segunda regra de exibição: a
mesma função de arredondamento que já existia no projeto passa a valer no
render, no recálculo e no PDF.

## Mudança de comportamento aprovada

A coluna Média do render inicial passa a mostrar o valor arredondado, igual ao
que aparece após qualquer edição. A Rec deixa de ser habilitada quando a média
exibida já é 7,0. Final e status não mudam. A correção foi aprovada no gate
CHG-002.

## Prova

- Caracterização: 4 testes verdes antes e depois (inclui o teste de carga que já
  existia).
- Regressão: 2 testes vermelhos antes (`CHG-001`) e verdes depois.
- `npm run type-check`: verde.
- Tabela de casos e bordas em `before-after/equivalence.md`.

## Reversão

Aplicar `CHG-002.diff` e `CHG-001.diff` em ordem inversa.
