---
schema_version: 1
id: OPP-20261030-HX4X
display_number: 10
context: professor-turmas
verb: decouple
title: Versões de notas em variável global window
target:
  files: ["src/views/professor-turmas-notas.ts"]
  symbol: "__notasVersoes, loadAlunosDaDisciplina, bindSalvarNotas"
smell: As versões carregadas do boletim são gravadas em (window as any).__notasVersoes e lidas de lá no momento de salvar. Módulos diferentes se comunicam por estado global implícito, com chave por oferta e sem limpeza.
roi:
  confidence: yellow
  impact: Acoplamento oculto e risco de versão obsoleta entre carregar e salvar. Dificulta teste do fluxo de salvamento e a futura feature de concorrência (OPP-8).
  cost: low
  est_return: Estado de versões explicitamente passado (ou encapsulado) em vez de global mutável, testável e sem vazamento entre telas.
state: proposed
traceability:
  soul: []
  specs: ["professor/requirements.md#rf-05", "professor/requirements.md#rf-06"]
---

## Observado

`src/views/professor-turmas-notas.ts:88-89` cria e popula
`(window as any).__notasVersoes` durante `loadAlunosDaDisciplina`.
`:228-229` lê o mesmo global em `bindSalvarNotas`. Não há limpeza ao sair da
view nem garantia de que a carga terminou antes do clique em salvar. A chave é
o ID da oferta, mas o objeto guarda mapas de `NotaExistente` por aluno.

## Transformação proposta

- Encapsular em um módulo próprio (ex.: `notas-contexto.ts`) com `set/get/clear`
  por oferta, ou passar um `Map<string, Record<string, NotaExistente>>` criado
  em `ProfessorTurmasView` e repassado para carga e salvamento.
- Limpar o contexto ao reconstruir a view.
- Tipar sem `as any`.

## Rede de segurança

O teste atual cobre apenas a carga. Antes de aplicar, caracterizar o fluxo de
salvamento (versão enviada por aluno) para provar preservação.

## Risco

Baixo para a estrutura, médio para concorrência. Não mexer na semântica de
`versao` nesta passagem; tocar apenas no transporte do estado.
