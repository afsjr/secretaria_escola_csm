# Actions: Indicadores Pedagógicos da Turma

> Identificador: `013-indicadores-turma`
> Data: `2026-10-30`
> Roadmap: `_reversa_forward/013-indicadores-turma/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 14 |
| Paralelizáveis (`[//]`) | 6 |
| Maior cadeia de dependência | 7 (T001 → T003 → T005 → T010 → T011 → T013 → T014) |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Adicionar `calcularPercentualFrequencia(faltas, cargaHoraria)` em `grades-utils.ts`, exportada, com clamp entre 0 e 100 e retorno 100 quando a carga horária for menor ou igual a zero. | - | - | `src/lib/grades-utils.ts` | 🟢 | `[X]` |
| T002 | Adicionar os tipos `IndicadorDisciplina` e `IndicadoresPedagogicosTurma` em `src/types/domain.ts`, com campos anuláveis para indicadores sem dado. | - | `[//]` | `src/types/domain.ts` | 🟢 | `[X]` |
| T003 | Refatorar `AcademicService._montarComponenteResultado` para consumir `calcularPercentualFrequencia`, preservando a saída atual da Ata. | T001 | - | `src/lib/academic-service.ts` | 🟢 | `[X]` |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T004 | Adicionar testes de `calcularPercentualFrequencia`: faltas zero, faltas parciais, faltas que zeram a presença, carga horária zero e valores acima de 100. | T001 | `[//]` | `src/lib/grades.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Implementar `AcademicService.getIndicadoresPedagogicosTurma(turmaId)`: validar o tipo do curso, buscar turma, ofertas, alunos ativos e boletim em lote, calcular médias, presença, ranges e quebra por disciplina. | T001, T002, T003 | - | `src/lib/academic-service.ts` | 🟢 | `[X]` |
| T006 | Adicionar testes de `getIndicadoresPedagogicosTurma` cobrindo média e range, presença e range, aluno inativo, disciplina não ofertada, estágio fora da média, turma sem dados e consultas em lote. | T005 | - | `src/lib/academic-service.test.ts` | 🟢 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T007 | Criar o renderer puro `renderIndicadoresTurma(data)` com cards de média, presença, alunos e disciplinas, tabela por disciplina, estados vazio e erro. | T002 | `[//]` | `src/views/gestao-turmas-indicadores.ts` | 🟢 | `[X]` |
| T008 | Adicionar testes do renderer para valores formatados, range, estado vazio, estado de erro e presença inteira. | T007 | `[//]` | `src/views/gestao-turmas-indicadores.test.ts` | 🟢 | `[X]` |
| T009 | Adicionar o botão e o conteúdo da aba Indicadores após Calendário em `gestao-turmas.ts`, incluindo `indicadores` na constante `TABS`. | - | `[//]` | `src/views/gestao-turmas.ts` | 🟡 | `[X]` |
| T010 | Implementar `loadTurmaIndicadores(turmaId)` em `gestao-turmas.ts`: estado de carregamento, chamada ao serviço, injeção do renderer, erro com ação de tentar novamente e recarga ao ativar a aba. | T005, T007, T009 | - | `src/views/gestao-turmas.ts` | 🟢 | `[X]` |
| T011 | Integrar a visibilidade e a seleção: ocultar a aba e o conteúdo para `formacao`, exibir para técnico ou tipo nulo, carregar ao selecionar a turma e garantir fallback para Alunos. | T009, T010 | - | `src/views/gestao-turmas.ts` | 🟡 | `[X]` |
| T012 | Criar as classes `gt-indicadores-*` em `main.css` para grid, cards, valores, ranges, tabela e estados vazio/erro, sem novos estilos inline. | T009 | `[//]` | `src/styles/main.css` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T013 | Rodar a suíte do alvo (`grades`, `academic-service`, `gestao-turmas-indicadores`), a suíte completa e `npm run type-check`, registrando falhas pré-existentes. | T006, T008, T011, T012 | - | (terminal) | 🟢 | `[X]` |
| T014 | Gerar `regression-watch.md` com observações de manutenção, baseline de falhas e pontos de atenção da feature. | T013 | - | `_reversa_forward/013-indicadores-turma/regression-watch.md` | 🟢 | `[X]` |

## Notas de execução

- Baseline antes da feature: **359 passed, 4 failed**. As 4 falhas são pré-existentes em `src/views/secretaria.test.ts` e `src/components/Tabs/GerenciarAlunosTab.test.ts`, sem relação com os arquivos desta feature.
- Após a feature: **377 passed, 4 failed**, as mesmas falhas pré-existentes. `npm run type-check`: sem erros.
- Testes novos: `src/lib/academic-service-indicadores.test.ts` (6), `src/views/gestao-turmas-indicadores.test.ts` (5) e 7 casos em `src/lib/grades.test.ts`.
- Sem migração, sem escrita em banco e sem contrato externo novo.
- A aba foi integrada em `gestao-turmas.ts` e o renderer separado em `gestao-turmas-indicadores.ts` para permitir testes puros.
- Validação manual em navegador ainda recomendada seguindo `onboarding.md`, especialmente a comparação com a Ata e a ocultação em curso de formação.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-10-30 | Versão inicial gerada por `/reversa-to-do` | reversa |
| 2026-10-30 | Ações T001–T014 executadas por `/reversa-coding` | reversa |
