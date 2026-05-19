# Financeiro, Tarefas de Implementação

## Tarefas

| ID | Descrição | Critério de Pronto | Confiança |
|----|-----------|-------------------|-----------|
| T-01 | Implementar `getResumo()` | Retorna objeto com totalInadimplente, totalRecuperado, totalPrevisto, contagemAtrasados | 🟢 |
| T-02 | Implementar `getInadimplentes()` | Retorna lista de perfis com pagamentos atrasados | 🟢 |
| T-03 | Implementar `getHistoricoAluno(alunoId)` | Retorna pagamentos do aluno ordenados por data_vencimento desc | 🟢 |
| T-04 | Implementar `criarAcordo(dados)` | Cria registro em financeiro_acordos e atualiza pagamentos para 'acordo' | 🟢 |
| T-05 | Implementar `getConfig()` | Retorna objeto com multa_atraso, juros_mensal | 🟢 |
| T-06 | Implementar `getAllPagamentos()` | Retorna todos registros da tabela pagamentos | 🟢 |
| T-07 | Implementar `createPagamento(payload)` | Cria novo registro de cobrança | 🟢 |
| T-08 | Implementar View FinanceiroView() | Renderiza dashboard, lista alunos, modal acordo, modal lançamento | 🟢 |
| T-09 | Implementar cálculo dinâmico de multas/juros | Aplica 2% + 1% ao selecionar débitos | 🟢 |
| T-10 | Implementar geração PDF de termo de acordo | Gera PDF com dados do acordo e aluno | 🟢 |
| T-11 | Implementar exportação Excel | Exporta dados financeiros para planilha | 🟢 |

## Dependências

- T-01, T-02, T-05, T-06 → T-08 (serviços alimentam view)
- T-03 → T-08 (dados do aluno no modal)
- T-04 → T-10 (acordo criado → gerar PDF)
- T-08 → T-09, T-10, T-11 (features da view)

## Observações

- Multa fixa: 2% do valor original
- Juros mensal: 1% do valor original
- Opções de parcels: 1x, 2x, 3x, 6x, 12x (6x e 12x com juros administrativo)
- Status automático baseado em data_vencimento vs data atual