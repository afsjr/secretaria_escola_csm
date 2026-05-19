# Legacy Impact — Gráficos na Página de Logs

> Feature: 003-graficos-logs
> Gerado em: 2026-05-19

---

## Arquivos Afetados

| Arquivo | Componente | Tipo | Severidade | Justificativa |
|---------|------------|------|------------|---------------|
| `supabase/functions/get-logs-agrupados/index.ts` | audit | componente-novo | LOW | Nova Edge Function para dados agregados |
| `supabase/functions/get-logs-agrupados/deno.json` | audit | componente-novo | LOW | Configuração da Edge Function |
| `src/hooks/useAuditStats.ts` | audit | componente-novo | LOW | Hook React para dados de estatísticas |
| `src/components/audit/AuditCards.ts` | audit | componente-novo | LOW | Componente de cards consolidados |
| `src/components/audit/AuditBarChart.ts` | audit | componente-novo | LOW | Componente de gráfico de barras |
| `src/components/audit/AuditTrendChart.ts` | audit | componente-novo | LOW | Componente de gráfico de linha |
| `src/views/audit-dashboard.ts` | audit | componente-novo | LOW | Wrapper do dashboard de gráficos |

---

## Delta de Dados

Nenhum impacto no schema do banco de dados. A feature usa:
- Tabela existente `audit_log` (leitura)
- Nova função SQL inline na Edge Function (sem stored procedure)

---

## Contratos Afetados

| Contrato | Tipo | Alteração |
|----------|------|-----------|
| `/functions/v1/get-logs-agrupados` | Edge Function | Novo endpoint |

---

## Preservadas

As seguintes regras do `_reversa_sdd/domain.md` permanecem intactas:

- Log de auditoria é **imutável** — não há operação de update/delete
- Falha no log de auditoria **não bloqueia** o fluxo principal
- Apenas admin e master_admin podem acessar logs

---

## Modificadas

Nenhuma regra modificada. A feature apenas adiciona visualização aos dados existentes.

---

## Observações

A integração final na página `src/views/audit-log.ts` existente ainda requer:
1. Importação do componente `AuditDashboard`
2. Posicionamento na UI acima da tabela de logs
3. Teste de integração completa