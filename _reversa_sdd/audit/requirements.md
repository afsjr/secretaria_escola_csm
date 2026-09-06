# Registro de Auditoria (Audit)

> Módulo de auditoria e logs de ações sensíveis do sistema

## Visão Geral
Sistema de registro imutável de todas as ações sensíveis do sistema. Utilizado para compliance, investigação de incidentes e rastreabilidade de alterações.

## Responsabilidades
- Registro de ações sensíveis no log de auditoria
- Consulta de logs com filtros (ação, tabela, usuário, data)
- Classificação de ações por severidade (alta, média, baixa)
- Visualização em painel administrativo
- Contagem de logs por severidade

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Registrar ação no log | Must | Insere registro em audit_log com dados do usuário, ação e detalhes |
| RF-02 | Listar logs com filtros | Must | Retorna logs filtrados por ação, tabela, usuário, data |
| RF-03 | Listar ações únicas | Must | Retorna lista de ações distintas para filtros de UI |
| RF-04 | Buscar por usuário | Must | Retorna logs de um usuário específico |
| RF-05 | Logs recentes | Must | Retorna últimos N logs (dashboard) |
| RF-06 | Contagem por severidade | Must | Retorna contagem de logs por nível (alta/média/baixa) |
| RF-07 | Logs alta severidade | Must | Retorna apenas logs de ações críticas |
| RF-08 | Painel de auditoria | Must | Renderiza UI com tabela, filtros, contadores e paginação |
| RF-09 | Agregação por período | Must | Edge Function get-logs-agrupados consolida eventos por 7d, 30d, 3m, 6m, 12m |
| RF-10 | Gráfico de barras de logs | Should | AuditBarChart exibe distribuição de ações no período selecionado |
| RF-11 | Gráfico de tendência temporal | Should | AuditTrendChart exibe evolução temporal do volume de eventos |
| RF-12 | Cache client-side de métricas | Should | Hook useAuditStats implementa cache de 5 minutos (TTL) |

## Regras de Negório

- Log de auditoria é **imutável** — não há operação de update/delete 🟢
- Falha no log de auditoria **não bloqueia** o fluxo principal 🟢
- Ações sensíveis mapeadas por severidade:
  - **Alta:** reset_senha, delete_usuario, alterar_perfil_acesso
  - **Média:** lancar_nota, alterar_nota, delete_nota, criar_usuario, matricular_aluno, transferir_aluno
  - **Baixa:** login_sucesso, solicitar_documento, atualizar_perfil, registrar_aula
- Apenas admin e master_admin podem acessar logs 🟢

## Rastreabilidade

| Arquivo | Função / Componente | Cobertura |
|---------|---------------------|-----------|
| `src/lib/audit-service.ts` | log, getLogs, getUniqueActions, getLogsByUser, getRecentLogs, getCountsBySeverity, getHighSeverityLogs, withAudit | 🟢 |
| `src/views/audit-log.ts` | AuditLogView com filtros, tabela e paginação | 🟢 |
| `src/views/audit-dashboard.ts` | Dashboard consolidado com gráficos e filtros de período | 🟢 |
| `src/hooks/useAuditStats.ts` | Hook com cache de 5 min para agregação | 🟢 |
| `src/components/audit/AuditBarChart.ts` | Componente de gráfico de barras | 🟢 |
| `src/components/audit/AuditTrendChart.ts` | Componente de gráfico de tendência de linha | 🟢 |
| `src/components/audit/AuditCards.ts` | Cards consolidados de métricas de auditoria | 🟢 |
| `supabase/functions/get-logs-agrupados/` | Edge Function para agregação no PostgreSQL | 🟢 |

## Confiança

- 🟢 Todas as funções e componentes extraídos diretamente do código
- 🟢 Mapeamento de ações/severidade completo (extraído do código)