# Medição de acoplamento - OPP-20261030-HX4X

## Antes

| Métrica | Valor |
|---------|-------|
| Acessos diretos a `window.__notasVersoes` | 3 (2 escritas + 1 leitura) |
| Contrato tipado para o estado de versões | 0 |
| Limpeza de ciclo de vida | 0 |
| Escopo do estado | global, sobrevive à view |

Evidência no código anterior:

```
src/views/professor-turmas-notas.ts:89  (window as any).__notasVersoes = ...
src/views/professor-turmas-notas.ts:90  (window as any).__notasVersoes[disc.id] = notasMap
src/views/professor-turmas-notas.ts:229 (window as any).__notasVersoes?.[ofertaId]
```

## Depois

| Métrica | Valor |
|---------|-------|
| Acessos a `window` no código de produção | 0 |
| Contrato tipado | 1 (`NotasContexto`) |
| Dono do ciclo de vida | `ProfessorTurmasView` |
| Funções que recebem o contexto | 2 (`loadAlunosDaDisciplina`, `bindSalvarNotas`) |

Evidência:

```
$ grep -rn "__notasVersoes" src/views/professor-turmas-notas.ts \
  src/views/professor-turmas.ts src/views/professor-turmas-types.ts
(sem resultados)

$ grep -n "NotasContexto" src/views/professor-turmas-types.ts
34:export type NotasContexto = Map<string, Record<string, NotaExistente>>;

$ grep -n "notasContexto" src/views/professor-turmas.ts
239:  const notasContexto: NotasContexto = new Map();
242:      loadAlunosDaDisciplina(disc, turma, container, notasContexto);
247:  bindSalvarNotas(container, notasContexto);
```

## Leitura

O estado deixou de viver no objeto global e passou a ser um parâmetro
obrigatório. O compilador acusa qualquer chamador que esqueça o contexto. O
grafo de imports não ganhou dependência nova: o tipo vive no módulo de tipos que
os dois lados já importavam.
