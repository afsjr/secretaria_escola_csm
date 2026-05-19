# Audit, Tarefas de Implementação

## Tarefas

| ID | Descrição | Critério de Pronto | Confiança |
|----|-----------|-------------------|-----------|
| T-01 | Implementar `log(params)` | Insere registro em audit_log, não falha em caso de erro | 🟢 |
| T-02 | Implementar `getLogs(params)` | Retorna logs com filtros, ordenados por created_at desc | 🟢 |
| T-03 | Implementar `getUniqueActions()` | Retorna ações distintas para filtro de UI | 🟢 |
| T-04 | Implementar `getLogsByUser(userId, limit)` | Retorna logs de usuário específico | 🟢 |
| T-05 | Implementar `getRecentLogs(limit)` | Retorna logs recentes para dashboard | 🟢 |
| T-06 | Implementar `getCountsBySeverity()` | Retorna contagem por nível (alta/media/baixa) | 🟢 |
| T-07 | Implementar `getHighSeverityLogs()` | Retorna apenas logs de alta severidade | 🟢 |
| T-08 | Implementar `withAudit(fn, options)` | HOF para log automático após operação | 🟢 |
| T-09 | Implementar AuditLogView() | Renderiza painel com tabela, filtros e paginação | 🟢 |

## Dependências

- T-01 → T-02, T-03, T-04, T-05, T-06, T-07 (todas usam tabela)
- T-08 → T-01 (wrapper usa log internamente)
- T-09 → T-02, T-06 (view consome serviços)

## Observações

- Falha no log é non-blocking (design pattern explícito)
- Apenas admin/master_admin devem acessar getLogs (implementar RLS)
- Tabela audit_log deve ser append-only (sem update/delete)
- user_agent coletado do navigator quando disponível