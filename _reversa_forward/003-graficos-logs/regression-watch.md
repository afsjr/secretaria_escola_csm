# Regression Watch — Gráficos na Página de Logs

> Feature: 003-graficos-logs

---

## Itens de Verificação

| ID | Origem | Regra Esperada | Tipo de Verificação | Sinal de Violação |
|----|--------|----------------|---------------------|-------------------|
| W001 | `audit/requirements.md` | Funções de log devem continuar funcionando | Presença | Endpoint retorna erro |
| W002 | `audit/requirements.md` | Mapeamento ação→severidade mantido | Presença | Gráficos mostram severidade incorreta |
| W003 | `audit/requirements.md` | Acesso restrito a admin/master_admin | Presença | Usuário comum acessa gráficos |

---

## Histórico de Re-extrações

### Re-extração 2026-09-06 15:28

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | Funções de auditoria preservadas em `src/lib/audit-service.ts` |
| W002 | 🟢 verde | Mapeamento ação/severidade preservado em `audit/requirements.md` e UI |
| W003 | 🟢 verde | Acesso a audit-log e gráficos restrito a admin e master_admin |

---

## Arquivadas

Nenhum item arquivado.

---

## Observações

- A feature não alterou regras de negócio existentes
- Apenas adicionou nova funcionalidade de visualização
- Precisa de teste de integração com a página existente de audit-log