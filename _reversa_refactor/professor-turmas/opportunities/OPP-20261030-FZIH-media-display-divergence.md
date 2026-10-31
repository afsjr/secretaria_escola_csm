---
schema_version: 1
id: OPP-20261030-FZIH
display_number: 13
context: professor-turmas
verb: simplify
title: Média exibida diverge entre render inicial e recálculo
target:
  files: ["src/views/professor-turmas-notas.ts"]
  symbol: renderLinhaAluno, recalcularMedia
smell: No render inicial a coluna Média mostra a média parcial crua; após qualquer edição o recálculo mostra a média já arredondada. A mesma aluna muda de valor na tela sem que nenhuma nota tenha mudado.
roi:
  confidence: green
  impact: Inconsistência visual que confunde aluno e professor. Exemplo: notas 7, 7 e 6,4 mostram média 6.8 ao carregar e 7.0 após editar.
  cost: low
  est_return: Uma única regra de arredondamento para exibir a média, igual no primeiro render e no recálculo.
state: applied
traceability:
  soul: []
  specs: ["professor/requirements.md#rf-04"]
---

## Observado

`renderLinhaAluno` (`:12-38`) usa `mediaParcial` sem arredondar:
`mediaParcial > 0 ? mediaParcial.toFixed(1) : "-"`.

`recalcularMedia` (`:166`) faz
`mediaParcial = arredondarNota(calcularMediaParcial(n1, n2, n3))` e exibe esse
valor. Para notas 7, 7 e 6,4:

- render inicial: média bruta 6,8;
- recálculo: 6,8 arredonda para 7,0.

A nota final já usa arredondamento nos dois caminhos, então só a coluna Média
oscila. `calcularMediaParcial` foi alterado recentemente (commit 79d62c5) e
esse caminho de exibição ficou para trás.

## Transformação proposta

- Calcular a média parcial com `arredondarNota` também no render inicial, ou
  criar `calcularMediaExibida(n1, n2, n3)` em `grades-utils` e usar nos dois
  pontos.
- Não mexer em `calcularNotaFinal` nem em `calcularStatusAluno`.

## Rede de segurança

Teste unitário de `renderLinhaAluno` com notas 7, 7 e 6,4 provando que a célula
de média mostra 7.0 antes e depois do recálculo.

## Risco

Baixo e determinístico. Só apresentação; nenhuma escrita no banco.
