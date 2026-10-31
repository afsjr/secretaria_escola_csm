---
schema_version: 1
id: OPP-20261030-HX4X
verb: decouple
state: applied
safety_net:
  kind: characterization
  green_before: true
  green_after: true
preservation:
  method: tests
  evidence:
    - safety-net/before.txt
    - safety-net/after.txt
    - safety-net/full-after.txt
    - safety-net/type-check-after.txt
    - before-after/measurement.md
measurement:
  before: "3 acessos a window.__notasVersoes, 0 contrato tipado, 0 limpeza de ciclo de vida"
  after: "0 acessos a window, 1 tipo NotasContexto, ciclo de vida da view, 2 funcoes recebem o contexto"
change_set:
  - chg: CHG-001
    file: src/views/professor-turmas-notas.test.ts
    purpose: caracterizacao do envio de versao e regressao do estado global
  - chg: CHG-002
    file: src/views/professor-turmas-types.ts
    purpose: tipo NotasContexto
  - chg: CHG-002
    file: src/views/professor-turmas-notas.ts
    purpose: carga grava no contexto e salvamento le do contexto
  - chg: CHG-002
    file: src/views/professor-turmas.ts
    purpose: view cria e passa o contexto
  - chg: CHG-002
    file: src/views/professor-turmas-notas.test.ts
    purpose: testes passam o contexto explicito
approval:
  by: user
  at: 2026-10-30T22:39:04-03:00
reversible_via: [CHG-001.diff, CHG-002.diff]
---

## O que foi feito

1. **CHG-001**: teste de caracterização do fluxo carregar e salvar, provando que
   a versão carregada por aluno chega ao `salvarNotasEmLote`. Teste de regressão
   provando que `window.__notasVersoes` não deve existir. Antes da costura a
   caracterização passou e a regressão falhou.
2. **CHG-002**: criado `NotasContexto` em `professor-turmas-types.ts` como
   `Map<string, Record<string, NotaExistente>>`. `loadAlunosDaDisciplina` e
   `bindSalvarNotas` passaram a exigir o contexto. `ProfessorTurmasView` cria o
   `Map` e o repassa. As três referências a `window.__notasVersoes` saíram do
   código de produção.

## Comportamento preservado

O payload de salvamento não mudou: mesmo `aluno_id`, mesma `versao` carregada,
mesmos valores de faltas e notas. A mudança é apenas de transporte e de posse do
estado. A condição de corrida entre clicar em salvar antes de a carga terminar
já existia antes e permanece fora do escopo desta oportunidade.

## Prova

- Caracterização: verde antes e depois.
- Regressão do estado global: vermelha antes, verde depois.
- Testes do alvo: 10 passam.
- Suíte completa: 359 passam, 4 falham. As 4 falhas são as mesmas do baseline,
  em `src/views/secretaria.test.ts` e
  `src/components/Tabs/GerenciarAlunosTab.test.ts`, sem relação com o alvo.
- `npm run type-check`: verde.

## Reversão

Aplicar `CHG-002.diff` e `CHG-001.diff` em ordem inversa.
