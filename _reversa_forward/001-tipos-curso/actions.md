# Actions: Tipos de Curso

> Identificador: `001-tipos-curso`
> Data: `2026-05-23`
> Roadmap: `_reversa_forward/001-tipos-curso/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 10 |
| Paralelizáveis (`[//]`) | 4 |
| Maior cadeia de dependência | 5 (T001 → T004 → T005 → T006 → T007) |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Migration SQL: `ALTER TABLE cursos ADD COLUMN tipo_curso text DEFAULT 'tecnico'` com CHECK | - | `[//]` | `supabase/migrations/` | 🟢 | `[X]` |
| T002 | Migration SQL: `ALTER TABLE boletim ADD COLUMN conceito text` com CHECK | - | `[//]` | `supabase/migrations/` | 🟢 | `[X]` |
| T003 | Atualizar tipos em `src/types/domain.ts`: adicionar `tipo_curso` em Curso e `conceito` em Boletim | T001, T002 | - | `src/types/domain.ts` | 🟢 | `[X]` |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T004 | Escrever testes para `course-service.ts`: criar curso com tipo, filtrar por tipo, bloquear edição com turmas ativas | T003 | `[//]` | `src/lib/course-service.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Atualizar `course-service.ts`: `createCurso` aceita `tipo_curso`; `getCursos` aceita filtro `tipo`; valida bloqueio de edição com turmas ativas | T003 | - | `src/lib/course-service.ts` | 🟢 | `[X]` |
| T006 | Atualizar `academic-service.ts`: `upsertNotaEstagio` + `getBoletim` adaptáveis por tipo de curso (notas vs conceitos) | T005 | - | `src/lib/academic-service.ts` | 🟢 | `[X]` |
| T007 | Atualizar `professor-service.ts`: validação condicional (nota 0-10 para técnico, conceito A/B/C para formação) | T006 | - | `src/lib/professor-service.ts` | 🟢 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T008 | Atualizar view de cursos: dropdown de tipo na criação/edição, badge "Técnico"/"Formação" na listagem | T005 | `[//]` | `src/components/Tabs/GerenciarCursosTab.ts` | 🟢 | `[X]` |
| T009 | Atualizar view de professor: input condicional (número vs select A/B/C) + boletim com conceito | T007 | `[//]` | `src/views/professor.ts` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T010 | Rodar `tsc --noEmit` + `npm test`, gerar `regression-watch.md` e `legacy-impact.md` | T004, T008, T009 | - | (terminal) | 🟢 | `[X]` |

## Notas de execução

Nenhuma.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-05-23 | Versão inicial gerada por `/reversa-to-do` | reversa |
