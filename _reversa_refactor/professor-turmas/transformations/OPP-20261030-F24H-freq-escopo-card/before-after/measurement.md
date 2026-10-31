# Medição de acoplamento - OPP-20261030-F24H

## Antes

| Métrica | Valor |
|---------|-------|
| Chamadas a `document.getElementById` no módulo de frequência | 6 |
| Símbolos globais consumidos (`freq-data`, `freq-disciplina`) | 2 |
| IDs duplicados por render de N turmas | 2N |
| Módulos que dependem do DOM global | 1 (`professor-turmas-frequencia.ts`) |

Evidência (HEAD antes do CHG-002):

```
src/views/professor-turmas-frequencia.ts:63  document.getElementById("freq-data")
src/views/professor-turmas-frequencia.ts:66  document.getElementById("freq-disciplina")
src/views/professor-turmas-frequencia.ts:111 document.getElementById("freq-data")
src/views/professor-turmas-frequencia.ts:112 document.getElementById("freq-disciplina")
src/views/professor-turmas-frequencia.ts:136 document.getElementById("freq-data")
src/views/professor-turmas-frequencia.ts:137 document.getElementById("freq-disciplina")
```

## Depois

| Métrica | Valor |
|---------|-------|
| Chamadas a `document.getElementById` no módulo de frequência | 0 |
| Símbolos globais consumidos | 0 |
| IDs duplicados por render | 0 (IDs únicos por turma) |
| Resolvedor escopado ao card | 1 (`camposFrequencia`) |
| Imports novos | 0 |

Evidência:

```
$ grep -c 'getElementById' src/views/professor-turmas-frequencia.ts
0

$ grep -c 'id="freq-data"\|id="freq-disciplina"' src/views/professor-turmas.ts
0

$ grep -c 'freq-data-${turma.id' src/views/professor-turmas.ts
2
```

## Leitura

O módulo deixou de depender do documento inteiro e passou a depender apenas do
`container` que já recebia como parâmetro. A dependência de dados (`turma.id`)
não mudou. O grafo de imports permaneceu idêntico: nenhum acoplamento novo foi
introduzido para remover os antigos.
