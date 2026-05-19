# Roadmap — Gráficos na Página de Logs

> Feature: Dashboard com gráficos de barras e linha de tendência
> Versão: 1.0

## 1. Resumo da Abordagem

Adicionar dashboard analítico à página de auditoria existente, com:
- Gráficos de barras por tipo de ação
- Gráficos de linha mostrando tendência temporal
- Cards consolidados com métricas
- Filtros por período (12m, 6m, 3m, 30d, semana)

**Tecnologia:** Highcharts.js (já disponível no projeto via CDN) ou Chart.js

---

## 2. Princípios Aplicados

| Princípio | Aplicação |
|-----------|-----------|
| Performance | Cache de 5min para dados agregados |
| Segurança | RLS mantida (apenas admin/master_admin) |

---

## 3. Decisões Técnicas

| Decisão | Opção | Justificativa |
|---------|-------|----------------|
| Biblioteca de gráficos | Highcharts | Já disponível, bom suporte a tipos mistos |
| Aggregação | Server-side (SQL) | Evita expor dados brutos ao cliente |
| Cache | Client-side 5min | Balance entre performance e frescor |
| Responsividade | CSS Grid + Media Queries | Layout flexível |

---

## 4. Delta Arquitetural

### Componentes afetados

| Componente | Arquivo_origem | Alteração |
|------------|----------------|-----------|
| audit-service.ts | `_reversa_sdd/audit/` | Nova função getLogsAgrupados |
| audit-log.ts | `_reversa_sdd/audit/` | Nova UI com gráficos |

### Novos arquivos

| Arquivo | Descrição |
|---------|-----------|
| `audit-graficos.ts` | Componente de gráficos |
| `audit-cards.ts` | Componente de cards consolidados |
| `hooks/useAuditStats.ts` | Hook para dados agregados |

---

## 5. Delta de Dados

### Nova função no banco

```sql
-- Nova função para aggregação
CREATE OR REPLACE FUNCTION get_logs_agrupados(periodo TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
BEGIN
  -- Implementação com base no período
  -- Retorna JSON com total, por_severidade, por_acao, tendência
END;
$$;
```

**Nota:** Não altera schema, apenas nova view/função.

---

## 6. Contratos Afetados

### Interface: getLogsAgrupados

**Request:**
```
GET /rest/v1/logs/agrupados?periodo=6meses
```

**Response:**
```json
{
  "periodo": "6meses",
  "total": 150,
  "por_severidade": { "alta": 5, "media": 45, "baixa": 100 },
  "por_acao": [...],
  "tendência": [...]
}
```

---

## 7. Plano de Migração

1. **Fase 1 (Backend):** Criar função SQL de agregação
2. **Fase 2 (Backend):** Adicionar endpoint na API
3. **Fase 3 (Frontend):** Criar componentes de gráfico
4. **Fase 4 (Frontend):** Integrar na página de audit
5. **Fase 5 (Teste):** Validação com dados reais

---

## 8. Riscos

| Risco | Severidade | Mitigação |
|-------|------------|-----------|
| Performance com grandes volumes | 🟡 | Implementar cache e paginação |
| Dados esparsos (poucos logs) | 🟡 | Mostrar mensagem amigável |

---

## 9. Critério de Pronto

- [ ] Gráficos renderizando corretamente
- [ ] Todos os 5 períodos funcionando
- [ ] Cards consolidados exibindo valores
- [ ] Responsivo em desktop/tablet
- [ ] Testes com dados reais passando

---

**Confiança geral:** 🟢 Alto (baseado em código existente do audit)