---
schema_version: 1
id: OPP-20260909-A1B2
display_number: 1
context: professor-turmas
verb: prune
title: Botões mortos btn-alertas-geral e btn-export-geral
target:
  files: ["src/views/professor-turmas.ts"]
  symbol: "btn-alertas-geral, btn-export-geral"
smell: Dois botões renderizados no HTML (linhas 153-158) sem nenhum event listener conectado. Botões não fazem nada quando clicados — código morto de UI.
roi:
  confidence: green
  impact: UX confuso — usuário vê botões que não funcionam, gera suporte desnecessário
  cost: low
  est_return: Remove código morto e melhora a experiência do usuário
state: applied
traceability:
  soul: ["auth: controle de acesso"]
  specs: ["professor/requirements.md"]
  transformation: transformations/OPP-20260909-A1B2-dead-buttons/transformation.md
---

## Observado

- `btn-alertas-geral` (linha 153): Botão "Alertas" no header da página. Nenhum `addEventListener` ou `getElementById` usa este ID.
- `btn-export-geral` (linha 156): Botão "Exportar PDF Geral" no header. Nenhum handler registrado.

## Transformação proposta

Remover os dois botões do HTML e seus estilos inline associados. Se a funcionalidade for necessária no futuro, pode ser reimplementada com handlers de verdade.

## Risco

Muito baixo — remoção de UI não funcional. Não afeta nenhuma regra de negócio.
