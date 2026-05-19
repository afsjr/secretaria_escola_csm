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

| Data | feature-id | Veredito | Observações |
|------|------------|----------|-------------|
| — | — | — | Nenhuma re-extração executada ainda |

---

## Arquivadas

Nenhum item arquivado.

---

## Observações

- A feature não alterou regras de negócio existentes
- Apenas adicionou nova funcionalidade de visualização
- Precisa de teste de integração com a página existente de audit-log