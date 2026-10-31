---
schema_version: 1
id: OPP-20261030-SIHI
display_number: 12
context: professor-turmas
verb: restructure
title: Leitura e cálculo de linhas duplicados entre notas, PDF e alertas
target:
  files: ["src/views/professor-turmas-notas.ts", "src/views/professor-turmas-pdf.ts", "src/views/professor-turmas-alertas.ts"]
  symbol: "bindSalvarNotas, bindExportPdfButtons, verificarAlertasBaixa, recalcularMedia"
smell: Três módulos varrem as mesmas linhas da tabela e releem os mesmos inputs com seletores próprios. O alerta lê o texto já renderizado em vez de recalcular, e cada cópia pode divergir na regra de média.
roi:
  confidence: yellow
  impact: Cada mudança no formato da linha exige editar três lugares. Divergência entre o que salva, o que exporta e o que alerta já apareceu antes (OPP-4/OPP-5).
  cost: medium
  est_return: Uma única leitura de linha alimenta salvar, PDF e alertas, com uma só regra de cálculo.
state: proposed
traceability:
  soul: []
  specs: ["professor/requirements.md#rf-04", "professor/requirements.md#rf-06"]
---

## Observado

- `professor-turmas-notas.ts:220-246` lê faltas, n1, n2, n3 e rec por linha no
  salvamento.
- `professor-turmas-pdf.ts:27-71` repete a mesma leitura e recalcula média e
  status.
- `professor-turmas-alertas.ts:13-25` lê `[data-final]` como texto e faz
  `parseFloat` do que foi renderizado.
- `professor-turmas-notas.ts:150-206` recalcula a média a partir dos inputs com
  uma terceira variação da fórmula.

## Transformação proposta

- Extrair `lerLinhaNota(row)` em módulo compartilhado, retornando alunoId,
  faltas, n1, n2, n3, rec e o cálculo canônico (via `grades-utils`).
- Fazer salvar, PDF e alertas consumirem essa função.
- `verificarAlertasBaixa` passa a receber os alunos calculados, não o DOM.
- Sem alterar a regra de arredondamento nem os textos exibidos.

## Rede de segurança

Existe teste de carga. Adicionar caracterização da leitura de uma linha e do
alerta antes de refatorar.

## Risco

Médio. Encadear depois de OPP-13 (divergência de média), para que a regra
canônica já esteja decidida.
