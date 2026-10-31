---
schema_version: 1
id: OPP-20261030-F24H
display_number: 9
context: professor-turmas
verb: decouple
title: IDs globais de frequência colidem entre turmas
target:
  files: ["src/views/professor-turmas.ts", "src/views/professor-turmas-frequencia.ts"]
  symbol: "ProfessorTurmasView, loadFrequenciaAlunos, carregarFrequenciaExistente"
smell: O card de cada turma renderiza os mesmos IDs fixos (freq-data e freq-disciplina) e o módulo de frequência lê esses campos via document.getElementById, sempre pegando o primeiro card do documento. O módulo conhece e depende de um DOM global em vez do container da turma.
roi:
  confidence: yellow
  impact: Bug real com 2 ou mais turmas. Salvar e carregar frequência usam a data e a disciplina do primeiro card, então o professor lança presença na disciplina errada.
  cost: low
  est_return: Cada turma passa a ler sua própria data e disciplina, eliminando lançamento cruzado entre turmas.
state: applied
traceability:
  soul: []
  specs: ["professor/requirements.md#rf-07"]
---

## Observado

`src/views/professor-turmas.ts:184` e `:190` geram, dentro de `turmas.map`,
`id="freq-data"` e `id="freq-disciplina"` para cada turma. Com duas ou mais
turmas existem IDs duplicados no documento.

`src/views/professor-turmas-frequencia.ts:63-68`, `:111-112` e `:136-137` usam
`document.getElementById` para ler esses campos. Como `getElementById` retorna
o primeiro elemento em ordem de documento, todos os cards leem a data e a
disciplina do primeiro card. O `turma.id` vem do closure, mas `disciplinaId` e
`dataAula` vêm do card errado.

Efeito: o botão "Salvar Frequência" do segundo card envia alunos ausentes para
a disciplina selecionada no primeiro card, e o carregamento de frequência
existente também consulta a disciplina errada.

## Transformação proposta

- Escopar os campos ao card: buscar `freq-data` e `freq-disciplina` dentro de
  `freqList.closest('.turma-card')` em vez de `document`.
- Passar os elementos já resolvidos para `carregarFrequenciaExistente`, sem
  nova consulta global.
- Opcional: IDs únicos por turma (`freq-data-${turma.id}`) mantendo os labels
  associados por `for` dinâmico.

## Rede de segurança

Não há teste de frequência hoje. Exigir teste de caracterização que monte dois
cards, altere a disciplina do segundo e prove que o salvamento do segundo usa
a disciplina dele.

## Risco

Médio. O comportamento errado é corrigido (muda comportamento observável do
bug), então o gate precisa aprovar explicitamente a correção. Nenhum CSS
depende desses IDs (verificado por grep).
