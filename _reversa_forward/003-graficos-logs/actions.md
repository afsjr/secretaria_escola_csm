# Actions — Gráficos na Página de Logs

> Feature: Dashboard com gráficos de barras e linha de tendência
> Versão: 1.0

---

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 12 |
| Ações paralelizáveis | 4 |
| Maior cadeia | 3 |

---

## Fase 1: Preparação (Setup)

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|------------|--------------|-----------|--------|
| T001 | Criar função SQL get_logs_agrupados(periodo) no banco | — | — | supabase/functions/get-logs-agrupados/index.ts | 🟢 | [X] |
| T002 | Configurar cache client-side (5min TTL) | — | [//] | src/hooks/useAuditStats.ts | 🟢 | [X] |

---

## Fase 2: Backend

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|------------|--------------|-----------|--------|
| T003 | Criar endpoint na API para dados agregados | T001 | — | supabase/functions/get-logs-agrupados/index.ts | 🟢 | [X] |
| T004 | Implementar lógica de agregação por período (12m, 6m, 3m, 30d, semana) | T003 | — | supabase/functions/get-logs-agrupados/index.ts | 🟢 | [X] |

---

## Fase 3: Frontend - Componentes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|------------|--------------|-----------|--------|
| T005 | Criar hook useAuditStats para dados agregados | T003, T004 | — | src/hooks/useAuditStats.ts | 🟢 | [X] |
| T006 | Criar componente AuditCards (cards consolidados) | T005 | [//] | src/components/audit/AuditCards.ts | 🟢 | [X] |
| T007 | Criar componente AuditBarChart (gráfico de barras) | T005 | [//] | src/components/audit/AuditBarChart.ts | 🟢 | [X] |
| T008 | Criar componente AuditTrendChart (gráfico de linha) | T005 | [//] | src/components/audit/AuditTrendChart.ts | 🟢 | [X] |

---

## Fase 4: Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|------------|--------------|-----------|--------|
| T009 | Adicionar selector de período na página de audit | T006, T007, T008 | — | src/views/audit-dashboard.ts | 🟢 | [X] |
| T010 | Integrar componentes na página de audit-log | T009 | — | src/views/audit-dashboard.ts | 🟢 | [X] |

---

## Fase 5: Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confiança | Status |
|----|-----------|--------------|------------|--------------|-----------|--------|
| T011 | Adicionar tooltips e legendas interativas | T010 | — | src/components/audit/AuditBarChart.ts, AuditTrendChart.ts | 🟢 | [X] |
| T012 | Testar responsividade (desktop/tablet) | T010 | — | src/views/audit-dashboard.ts | 🟢 | [X] |

---

## Cadeia de dependências

```
T001 → T003 → T005 → T006, T007, T008 → T009 → T010 → T011, T012
   ↘ T002 (paralelo)
```

---

## Critério de pronto

- [ ] Todas as 12 ações marcadas como [X]
- [ ] Gráficos renderizando corretamente
- [ ] Todos os 5 períodos funcionando
- [ ] Cards consolidados exibindo valores
- [ ] Responsivo em desktop/tablet