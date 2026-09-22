# Data Delta: Validação e Unicidade de CPF no Cadastro

> Identificador: `012-cpf-aluno-duplicado`
> Data: `2026-09-11`
> Base extraída: `_reversa_sdd/data-dictionary.md`, `supabase/schema.sql`

## 1. Resumo

Não há alteração de schema. A tabela `perfis` permanece como está; `cpf` continua `TEXT` e opcional no banco. A unicidade é aplicada apenas na camada de aplicação (client-side), por decisão do usuário e por restrição do `allowedPaths` (`src/**`).

## 2. Tabelas afetadas

### perfis

| Campo | Tipo | Mudança | Uso pela feature |
|-------|------|---------|------------------|
| `id` | uuid | nenhuma | PK; ignorar ao checar o próprio registro (se aplicável) |
| `nome_completo` | text | nenhuma | Exibição no painel de inconsistências |
| `email` | text | nenhuma | Exibição no painel |
| `perfil` | text | nenhuma | Identificar aluno/professor no painel |
| `cpf` | text | nenhuma (sem `UNIQUE`) | Normalizado e comparado para detectar duplicidade; listado no passivo |
| `created_at` | timestamp | nenhuma | Ordenação do painel |

## 3. Tabelas consultadas, não alteradas

Nenhuma além de `perfis`. A criação de usuário continua via `AdminService.createUserByAdmin` (Auth + `perfis`).

## 4. Índices e constraints

- **Não aplicável nesta feature.** Não há `UNIQUE` nem índice em `perfis.cpf`; a comparação é feita em memória após a leitura.
- Pendência registrada: avaliar `CREATE UNIQUE INDEX` sobre expressão normalizada quando `supabase/**` estiver liberado no `allowedPaths`.

## 5. Migrações

n/a. Nenhum arquivo SQL é criado ou alterado.

## 6. Impacto em dados existentes

- Perfis sem CPF: preservados; aparecem no grupo "sem CPF" do painel.
- Perfis com CPF duplicado: preservados; aparecem agrupados no grupo "duplicados".
- Nenhum backfill, nenhuma normalização de dados em disco.
