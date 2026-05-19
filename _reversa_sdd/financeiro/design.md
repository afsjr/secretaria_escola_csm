# Financeiro, Design Técnico

## Interface do Serviço

| Símbolo | Assinatura | Retorno |
|---------|-----------|---------|
| `getResumo` | `()` | `{ data: { totalInadimplente, totalRecuperado, totalPrevisto, contagemAtrasados }, error }` |
| `getInadimplentes` | `()` | `{ data: perfis[], error }` |
| `getHistoricoAluno` | `(alunoId: string)` | `{ data: pagamentos[], error }` |
| `criarAcordo` | `(dados: AcordoData)` | `{ data: acordo, error }` |
| `getConfig` | `()` | `{ data: Record<string, number>, error }` |
| `getAllPagamentos` | `()` | `{ data: pagamentos[], error }` |
| `createPagamento` | `(payload: PagamentoPayload)` | `{ data: pagamento, error }` |

### Tipos

```typescript
interface AcordoData {
  alunoId: string
  totalDebito: number
  totalComDesconto: number
  numeroParcelas: number
  valorParcela: number
}

interface PagamentoPayload {
  aluno_id: string
  descricao: string
  valor_original: string | number
  data_vencimento: string
  status: string
}
```

## Estrutura de Dados

### Tabela: pagamentos
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| aluno_id | uuid | FK → perfis.id |
| descricao | text | Descrição da cobrança |
| valor_original | numeric | Valor nominal |
| valor_pago | numeric | Valor efetivamente pago |
| data_vencimento | date | Data de vencimento |
| status | text | pendente/pago/atrasado/acordo |

### Tabela: financeiro_acordos
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| aluno_id | uuid | FK → perfis.id |
| total_debito | numeric | Total sem desconto |
| total_com_desconto | numeric | Total com desconto aplicado |
| numero_parcelas | int | Quantidade de parcelas |
| valor_parcela | numeric | Valor de cada parcela |
| status | text | ativo/quitado |

### Tabela: financeiro_config
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| chave | text | Identificador da config |
| valor | text | Valor da configuração |

## Fluxos

### Fluxo 1: Dashboard Financeiro
1. Carrega resumo via `getResumo()`
2. Carrega lista de todos alunos via `AdminService.listAlunos()`
3. Carrega configurações via `getConfig()`
4. Carrega todos pagamentos via `getAllPagamentos()`
5. Renderiza cards: Volume em Atraso, Acordos Recuperados

### Fluxo 2: Negociação de Acordo
1. Usuário clica em "Ficha Financeira" → abre modal
2. Carrega histórico do aluno via `getHistoricoAluno()`
3. Usuário seleciona débitos para negociação
4. Sistema calcula: principal + multas(2%) + juros(1%) - desconto
5. Usuário define plano de parcelas (1x, 2x, 3x, 6x, 12x)
6. Usuário confirma → `criarAcordo()` → atualiza pagamentos para 'acordo'
7. Gera PDF do termo de acordo

### Fluxo 3: Lançamento de Débito
1. Usuário clica em "Lançar" → abre modal
2. Preenche: descrição, valor, data vencimento
3. Se data < hoje → status = 'atrasado', senão 'pendente'
4. `createPagamento()` →insere na tabela

## Riscos e Lacunas

- 🔴 getResumo() usa iteração manual em JS sem agregação SQL - performance comprometida para grandes volumes
- 🔴 Não há registro de pagamentos efetuados (baixa)
- 🔴 Não há integração com gateway de pagamento
- 🟡 Estratégia de recuperação de juros não documentada no código