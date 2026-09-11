# Actions: Vincular e Desvincular Professores em Disciplinas de Turmas

> Identificador: `011-vincular-professor-disciplina`
> Data: `2026-09-11`
> Roadmap: `_reversa_forward/011-vincular-professor-disciplina/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 10 |
| Paralelizáveis (`[//]`) | 2 |
| Maior cadeia de dependência | 7 (T001 → T002 → T006 → T007 → T008 → T009 → T010) |

## Fase 1, Preparação

<!-- Sem setup, scaffolding ou migração: não há alteração de schema. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| (nenhuma ação nesta fase) | | | | | | |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Adicionar testes de `vincularProfessorDisciplina` (cria oferta ausente, atualiza existente) e `desvincularProfessorDisciplina` (zera `professor_id`) em `course-service.test.ts`. | - | `[//]` | `src/lib/course-service.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T002 | Implementar `CourseService.vincularProfessorDisciplina(turmaId, disciplinaBaseId, professorId)`: localiza oferta por (turma, disciplina), atualiza `professor_id` se existir ou cria via `criarOfertaDisciplina` se não, e registra `AuditService.log` com ação `vincular_professor`. | T001 | - | `src/lib/course-service.ts` | 🟢 | `[X]` |
| T003 | Implementar `CourseService.desvincularProfessorDisciplina(turmaId, disciplinaBaseId)`: localiza a oferta, define `professor_id = null` sem remover a oferta e registra `AuditService.log` com ação `desvincular_professor`. | T001 | - | `src/lib/course-service.ts` | 🟢 | `[X]` |
| T004 | Implementar `CourseService.ofertaPossuiHistorico(ofertaId, turmaId, disciplinaBaseId)`: retorna `true` se houver `aulas` da oferta ou `boletim` dos alunos ativos da turma na disciplina. | T001 | - | `src/lib/course-service.ts` | 🟢 | `[X]` |
| T005 | Registrar as severidades `vincular_professor` e `desvincular_professor` no mapa `ACTION_SEVERITY`. | - | `[//]` | `src/lib/audit-service.ts` | 🟡 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T006 | Na aba Grade de `gestao-turmas.ts`, renderizar por disciplina um seletor de professor e um botão "Desvincular" (apenas quando `canManageTurmas`), carregando a lista de professores via `ProfessorService.getProfessores()` e o `id`/`professor_id` das ofertas. | T002, T003, T004 | - | `src/views/gestao-turmas.ts` | 🟢 | `[X]` |
| T007 | Tratar a mudança do seletor de professor: se a disciplina já tiver responsável, alertar a substituição; chamar `vincularProfessorDisciplina`; exibir toast e recarregar a grade. | T006 | - | `src/views/gestao-turmas.ts` | 🟢 | `[X]` |
| T008 | Tratar o clique em "Desvincular": verificar histórico via `ofertaPossuiHistorico` e pedir confirmação quando houver notas/aulas; chamar `desvincularProfessorDisciplina`; exibir toast e recarregar a grade. | T006, T007 | - | `src/views/gestao-turmas.ts` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T009 | Rodar a suíte completa (`npm test`) e garantir que todos os testes passam. | T007, T008 | - | (terminal) | 🟢 | `[X]` |
| T010 | Gerar `regression-watch.md` com observações de manutenção da feature. | T009 | - | `_reversa_forward/011-vincular-professor-disciplina/regression-watch.md` | 🟢 | `[X]` |

## Notas de execução

- Suíte completa: **331 passed, 4 failed**. As 4 falhas (`GerenciarAlunosTab.test.ts` e `secretaria.test.ts`) são pré-existentes, já registradas como baseline na feature `009-visualizar-senha`; não têm relação com esta feature.
- `src/lib/course-service.test.ts`: **21 passed** (6 novos).
- `npm run type-check`: sem erros.
- Desvincular via seletor "Sem professor" e via botão "Desvincular" usam o mesmo fluxo com checagem de histórico.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-11 | Versão inicial gerada por `/reversa-to-do` | reversa |
| 2026-09-11 | Ações T001–T010 executadas por `/reversa-coding` | reversa |
