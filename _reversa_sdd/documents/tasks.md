# Documents, Tarefas de Implementação

## Tarefas

| ID | Descrição | Critério de Pronto | Confiança |
|----|-----------|-------------------|-----------|
| T-01 | Implementar função `createRequest(userId, type)` | Função cria registro em `documents` com status 'pendente' e retorna o registro criado | 🟢 |
| T-02 | Implementar função `getMyRequests(userId)` | Retorna lista de solicitações do aluno logado | 🟢 |
| T-03 | Implementar função `getAllOpenRequests()` | Retorna lista de todas as solicitações com status pendente (para admin/secretaria) | 🟢 |
| T-04 | Implementar função `updateStatus(id, status)` | Atualiza status da solicitação para 'concluído' | 🟢 |

## Dependências

- T-01 → T-02 (ambos usam a tabela `documents`)
- T-03 → T-04 (fluxo admin: listar → atualizar)

## Observações

- Todas as funções usam Supabase client
- Status válidos: 'pendente', 'concluído' (🔴 validar no frontend se há outros)
- Tipo de documento: string (🔴 catalogar tipos disponíveis)