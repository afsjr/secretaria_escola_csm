# Actions: Aluno — Minhas Notas

> Identificador: `005-aluno-notas`
> Data: `2026-05-23`
> Roadmap: `_reversa_forward/005-aluno-notas/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 4 |
| Paralelizáveis (`[//]`) | 2 |
| Maior cadeia de dependência | 3 |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Atualizar interface `Boletim` em `src/types/domain.ts` adicionando campos faltantes: `disciplina_base_id`, `nota_estagio`, `estagio_parecer`, `status`, `versao`; remover `conceito` (inexistente no banco) | - | `[//]` | `src/types/domain.ts` | 🟢 | `[X]` |

## Fase 2, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T002 | Criar view `AlunoNotasView` em `src/views/aluno-notas.ts`: tabela com N1/N2/N3/Rec/Média, badge de status, agrupamento por módulo, loading state, empty state | - | `[//]` | `src/views/aluno-notas.ts` | 🟢 | `[X]` |

## Fase 3, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T003 | Em `src/views/dashboard.ts`: importar `AlunoNotasView`, adicionar rota `aluno/notas` no router, adicionar item "Minhas Notas" no sidebar condicionado a `_isAluno` | T002 | - | `src/views/dashboard.ts` | 🟢 | `[X]` |

## Fase 4, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T004 | Rodar `tsc --noEmit` e corrigir erros de tipo; verificar que a rota e sidebar funcionam em runtime | T001, T002, T003 | - | - | 🟢 | `[X]` |

## Notas de execução

- T002 pode usar `any` no tipo do boletim se T001 ainda não tiver sido executado — sem dependência rígida.
- O tipo `UserProfile` já exporta `id` e `perfil` necessários para filtrar sidebar e chamar `getBoletim`.
- `tsc --noEmit` passou com zero erros.
- Testes: 240 passed, 4 failed (pre-existing em `GerenciarAlunosTab.test.ts`, não relacionados).

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-05-23 | Versão inicial gerada por `/reversa-to-do` | reversa |
| 2026-05-23 | Execução via `/reversa-coding` — 4/4 ações concluídas | reversa |
