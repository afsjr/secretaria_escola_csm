# Data Delta: Cálculo de Médias com Notas Variáveis

> Identificador: `010-calculo-medias-notas`
> Data: `2026-09-10`

## Resumo

**Sem mudanças no modelo de dados.** A feature é inteiramente uma alteração de lógica de cálculo client-side. Não há novos campos, tabelas, migrações ou alterações de schema.

## Schema atual (preservado)

A tabela `boletim` mantém exatamente a mesma estrutura:

| Coluna | Tipo | Observação |
|--------|------|------------|
| `n1` | numeric | Nota 1 (0 se não lançada) |
| `n2` | numeric | Nota 2 (0 se não lançada) |
| `n3` | numeric | Nota 3 (0 se não lançada) |
| `rec` | numeric | Recuperação (0 se não aplicada) |
| `nota_estagio` | numeric | Nota de estágio (campo separado) |

## Migração

n/a
