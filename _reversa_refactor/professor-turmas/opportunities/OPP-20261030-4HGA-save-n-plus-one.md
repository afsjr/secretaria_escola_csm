---
schema_version: 1
id: OPP-20261030-4HGA
display_number: 11
context: professor-turmas
verb: optimize
title: Salvar notas em lote refaz consultas por aluno
target:
  files: ["src/lib/professor-service.ts", "src/views/professor-turmas-notas.ts"]
  symbol: "salvarNotasEmLote, salvarNota"
smell: salvarNotasEmLote busca o nome da disciplina uma vez, mas delega para salvarNota, que repete a busca do nome da disciplina e ainda faz um select do boletim por aluno antes do update. Para uma turma de N alunos isso vira 1 + 2N consultas.
roi:
  confidence: green
  impact: Hotpath de gravação de notas. Latência cresce linearmente com o tamanho da turma e multiplica round-trips no Supabase.
  cost: low
  est_return: Cortar as consultas redundantes por aluno e reduzir o lote a um custo constante de leitura mais as escritas necessárias.
state: proposed
traceability:
  soul: []
  specs: ["professor/requirements.md#rf-06"]
---

## Observado

`src/lib/professor-service.ts:165-188`: `salvarNotasEmLote` já obteve
`discBase.nome` e ainda chama `salvarNota` N vezes. Cada `salvarNota`
(`:124-162`) refaz:

1. select do nome em `disciplinas_base`;
2. select do id em `boletim` por aluno e disciplina;
3. update/insert.

O mapa de notas carregado no cliente (`notasMap`) já traz `id` e `versao`, mas
isso não é aproveitado: `salvarNota` ignora o `id` e busca de novo.

## Transformação proposta

- Propagar o nome da disciplina já buscado para o caminho em lote (parâmetro
  opcional), evitando N selects em `disciplinas_base`.
- Receber `boletimId` no item do lote (já disponível em `notasMap`) e usar
  update direto com optimistic lock, ou fazer um único select com `.in` dos
  alunos e casar em memória antes das escritas.
- Manter a mesma semântica de versão e o mesmo resultado externo.

## Medição

Contar queries antes e depois para uma turma sintética de 40 alunos (esperado:
de 1 + 2N para 1 + 1 + N escritas).

## Rede de segurança

`src/lib/professor-service.test.ts` cobre o serviço. Rodar antes e depois.

## Risco

Baixo. Não muda payload nem regra de nota, apenas o número de consultas.
