# Gestão Financeira (Financeiro)

> Módulo de gestão de cobranças, acordos e inadimplência

## Visão Geral
Sistema de gestão financeira inspirado em modelo comercial CSM. Gerencia cobranças de mensalidades, acordos de parcelamento, inadimplência e emissão de recibos/termos.

## Responsabilidades
- Dashboard financeiro com indicadores de inadimplência
- Gestão de alunos inadimplentes
- Histórico financeiro por aluno
- Criação e gestão de acordos de pagamento
- Lançamento de novos débitos/mensalidades
- Cálculo automático de multas e juros
- Geração de termos de acordo em PDF
- Exportação de dados para Excel

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Dashboard financeiro | Must | Exibe total inadimplente, recuperado, previsto e contagem atrasados |
| RF-02 | Listar inadimplentes | Must | Lista alunos com pagamentos status='atrasado' |
| RF-03 | Histórico do aluno | Must | Lista todos pagamentos de um aluno específico |
| RF-04 | Criar acordo | Must | Cria registro em financeiro_acordos e atualiza pagamentos para status='acordo' |
| RF-05 | Consultar configurações | Must | Retorna configurações (multa_atraso, juros_mensal) |
| RF-06 | Listar todos pagamentos | Must | Lista todos registros da tabela pagamentos |
| RF-07 | Criar pagamento/débito | Must | Cria novo registro de cobrança para aluno |
| RF-08 | Calcular multa e juros | Must | Aplica 2% multa + 1% juros mensal sobre valor atrasado |
| RF-09 | Gerar termo de acordo PDF | Must | Gera PDF com dados do acordo e aluno |
| RF-10 | Exportar Excel | Must | Exporta lista de alunos com status financeiro |

## Requisitos Não Funcionais

| Requisito | Descrição | Critério |
|-----------|-----------|----------|
| RNF-01 | Performance | Usar SQL aggregation para cálculos de resumo (recomendado) 🟢 |
| RNF-02 | Segurança | Acesso restrito a usuários com permissão administrativa |

## Regras de Negócio

- Status de pagamento válidos: 'pendente', 'pago', 'atrasado', 'acordo' 🟢
- Multa por atraso: 2% sobre valor original 🟢
- Juros mensal: 1% sobre valor original 🟢
- Acordo altera status dos pagamentos originais para 'acordo' 🟢
- Data de vencimento inferior a hoje = status 'atrasado' 🟢
- Configurações armazenadas em tabela 'financeiro_config' (CRUD necessário) 🟢

## Rastreabilidade

| Arquivo | Função | Cobertura |
|---------|--------|-----------|
| `src/lib/financeiro-service.ts` | getResumo, getInadimplentes, getHistoricoAluno, criarAcordo, getConfig, getAllPagamentos, createPagamento | 🟢 |
| `src/views/financeiro.ts` | Dashboard, modal acordo, cálculo dinâmica, geração PDF, exportação | 🟢 |
| `src/lib/pdf-service.ts` | generateTermoAcordoPDF | 🟡 |
| `src/lib/excel-service.ts` | exportToExcel | 🟢 |

## Confiança

- 🟢 Funções principais extraídas diretamente do código
- 🟡 Configurações e estratégia de storage inferidas