# Data Delta: Central de Notificações no Header

> Identificador: `004-central-notificacoes`
> Data: `2026-05-21`

## Resumo

**Nenhuma mudança no banco de dados.** A feature é 100% front-end.

## Modelo de dados existente utilizado

A tabela `solicitacoes` já definida em `supabase/schema.sql` atende completamente:

| Campo | Tipo | Uso na feature |
|-------|------|----------------|
| `id` | UUID | Identificar a solicitação para ação "Concluir" |
| `user_id` | UUID | Filtrar por usuário (alunos) |
| `tipo` | TEXT | Exibir tipo do documento no dropdown |
| `status` | TEXT (default 'pendente') | Filtrar apenas pendentes |
| `criado_em` | TIMESTAMP | Ordenar por data (mais recentes primeiro) |

## Índices existentes

- `idx_solicitacoes_status` em `status` — usado para filtrar pendentes
- `idx_solicitacoes_user` em `user_id` — usado para filtrar por aluno

## Queries necessárias

Nenhuma query nova. As funções existentes em `src/lib/documents-service.ts` já cobrem todos os cenários:

- `getAllOpenRequests()` → admin/secretaria/coordenação
- `getMyRequests(userId)` → alunos
- `updateStatus(id, 'concluido')` → ação concluir inline
