---
schema_version: 1
id: OPP-20261030-OFZQ
display_number: 15
context: professor-turmas
verb: optimize
title: Alunos da turma consultados uma vez por disciplina e por frequência
target:
  files: ["src/views/professor-turmas.ts", "src/views/professor-turmas-notas.ts", "src/views/professor-turmas-frequencia.ts"]
  symbol: ProfessorTurmasView, loadAlunosDaDisciplina, loadFrequenciaAlunos
smell: Para cada disciplina da turma o carregamento de notas chama AcademicService.getAlunosDaTurma, e a frequência chama a mesma consulta de novo para a turma. Numa turma com cinco disciplinas, os mesmos alunos são buscados seis vezes.
roi:
  confidence: yellow
  impact: Rajada de consultas idênticas no Supabase ao abrir a tela, proporcional a disciplinas por turma.
  cost: low
  est_return: Buscar os alunos uma vez por turma e reaproveitar para notas e frequência.
state: proposed
traceability:
  soul: []
  specs: ["professor/requirements.md#rf-04", "professor/requirements.md#rf-07", "professor/requirements.md#rf-10"]
---

## Observado

`ProfessorTurmasView` (`professor-turmas.ts:240-254`) chama
`loadAlunosDaDisciplina` para cada disciplina. Cada chamada faz
`AcademicService.getAlunosDaTurma(turmaId)` (`notas:64`). Em seguida chama
`loadFrequenciaAlunos` por turma, que faz a mesma consulta
(`frequencia:24`).

As chamadas são assíncronas e concorrentes, então a tela dispara várias
consultas idênticas no mesmo instante.

## Transformação proposta

- Em `ProfessorTurmasView`, buscar as matrículas uma vez por turma e passar a
  lista para `loadAlunosDaDisciplina` e `loadFrequenciaAlunos`.
- Manter um fallback que busca quando a lista não é fornecida, para não quebrar
  chamadas existentes.
- Não alterar filtros de status nem a ordem dos alunos.

## Medição

Contar chamadas a `getAlunosDaTurma` ao montar uma turma com N disciplinas
(esperado: de N + 1 para 1).

## Rede de segurança

Teste de composição contando chamadas com dois níveis de mock, ou
caracterização do HTML resultante para garantir mesmos alunos e ordem.

## Risco

Baixo. Só reaproveitamento de leitura; nenhuma escrita.
