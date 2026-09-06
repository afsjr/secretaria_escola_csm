# Actions: Lançamento de Notas de Disciplinas Regulares e Estágio Supervisionado por Lote

> Identificador: `006-lancamento-notas-estagio`
> Data: `2026-09-06`
> Roadmap: `_reversa_forward/006-lancamento-notas-estagio/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 8 |
| Paralelizáveis (`[//]`) | 3 |
| Maior cadeia de dependência | 4 |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Atualizar interfaces de tipo em `src/types/domain.ts`, adicionando `NotaEstagioLotePayload` com `{ aluno_id: string; disciplina_base_id: string; nota: number }` | - | `[//]` | `src/types/domain.ts` | 🟢 | `[X]` |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T002 | Criar arquivo de teste unitário `src/lib/academic-service-estagio.test.ts` testando o método `upsertNotaEstagioLote` e a gravação de notas para aluno com `bloqueio_financeiro = true` | - | `[//]` | `src/lib/academic-service-estagio.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T003 | Adicionar método `upsertNotaEstagioLote` em `src/lib/academic-service.ts` para persistência em batch de notas de estágio via `Promise.all`, sem bloqueio por inadimplência | T001 | - | `src/lib/academic-service.ts` | 🟢 | `[X]` |
| T004 | Em `src/lib/professor-service.ts`: restringir salvamento de notas às avaliações regulares (N1, N2, N3, Rec), omitindo e bloqueando alterações no campo `nota_estagio` | - | `[//]` | `src/lib/professor-service.ts` | 🟢 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Criar view `SecretariaEstagioLoteView` em `src/views/secretaria-estagio.ts` para preenchimento e gravação de estágio por lote para turmas técnicas com sinalização por Toast Flutuante | T003 | - | `src/views/secretaria-estagio.ts` | 🟢 | `[X]` |
| T006 | Registrar a rota e menu de Lançamento de Estágio por Lote em `src/views/dashboard.ts` restritos a `admin`, `secretaria` e `coordenacao` | T005 | - | `src/views/dashboard.ts` | 🟢 | `[X]` |
| T007 | Atualizar `src/views/aluno-notas.ts` para incluir a coluna/exibição da nota de estágio supervisionado no boletim do aluno quando o curso for do tipo `tecnico` | T003 | - | `src/views/aluno-notas.ts` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T008 | Executar checagem estática de tipos via `npx tsc --noEmit` e rodar a suíte de testes com `npx vitest run` | T002, T004, T006, T007 | - | - | 🟢 | `[X]` |

## Notas de execução

- Ações T001 até T008 concluídas com sucesso.
- `npx tsc --noEmit` executado sem nenhum erro de tipo.
- Suíte de testes unitários `academic-service-estagio.test.ts` validou com sucesso 3/3 cenários.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-06 | Versão inicial gerada por `/reversa-to-do` | reversa |
| 2026-09-06 | Execução via `/reversa-coding` — 8/8 ações concluídas | reversa |
