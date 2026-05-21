# Actions: Central de Notificações no Header

> Identificador: `004-central-notificacoes`
> Data: `2026-05-21`
> Roadmap: `_reversa_forward/004-central-notificacoes/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 8 |
| Paralelizáveis (`[//]`) | 4 |
| Maior cadeia de dependência | 4 (T001 → T004 → T006 → T007) |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Adicionar `getPendingByUser(userId)` em `DocumentsService` que retorna apenas solicitações pendentes de um usuário específico (alunos verem apenas as próprias) | - | `[//]` | `src/lib/documents-service.ts` | 🟢 | `[X]` |
| T002 | Adicionar classes CSS para o dropdown de notificações: `.notification-dropdown`, `.notification-item`, `.notification-badge-count`, `.notification-empty`, animação fadeIn, seta do popover | - | `[//]` | `src/styles/main.css` | 🟢 | `[X]` |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T003 | Escrever teste unitário para `getPendingByUser` (mock Supabase) | T001 | `[//]` | `src/lib/documents-service.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T004 | Criar componente `NotificationDropdown`: renderiza lista (máx 10), badge count, estado vazio, click-outside, Escape key, cache in-memory 30s, ação "Concluir" inline, perfil adaptado | T001, T002 | - | `src/components/NotificationDropdown.ts` | 🟢 | `[X]` |
| T005 | Adicionar suporte a hash param `?solicitacoes` na rota `#/dashboard/secretaria` para ativar a aba Solicitações automaticamente ao vir do "Ver todas" | - | `[//]` | `src/views/secretaria.ts` | 🟡 | `[X]` |
| T006 | Conectar o `NotificationDropdown` ao botão `#header-notification-btn` no dashboard.ts: event listener, inicialização com perfil do usuário, atualização do badge ao carregar | T004, T005 | - | `src/views/dashboard.ts` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T007 | Rodar `tsc --noEmit` + `npm test`, corrigir se necessário | T006 | - | (terminal) | 🟢 | `[X]` |
| T008 | Gerar `regression-watch.md` e `legacy-impact.md` | T007 | - | `_reversa_forward/004-central-notificacoes/` | 🟢 | `[X]` |

## Notas de execução

Nenhuma.
