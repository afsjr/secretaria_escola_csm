# Data Delta: Aluno — Minhas Notas

> Identificador: `005-aluno-notas`
> Data: `2026-05-23`

## Resumo

**Nenhuma mudança no banco de dados.** A feature é puramente de apresentação.

## Modelo atual (legado)

Tabela `boletim` (schema.sql + migration.sql):
| Coluna | Tipo | Origem |
|--------|------|--------|
| `id` | UUID PK | schema.sql |
| `aluno_id` | UUID FK → perfis(id) | schema.sql |
| `disciplina` | TEXT | schema.sql |
| `disciplina_base_id` | UUID FK → disciplinas_base(id) | migration.sql |
| `faltas` | INTEGER DEFAULT 0 | schema.sql |
| `n1` | DECIMAL DEFAULT 0 | schema.sql |
| `n2` | DECIMAL DEFAULT 0 | schema.sql |
| `n3` | DECIMAL DEFAULT 0 | schema.sql |
| `rec` | DECIMAL DEFAULT 0 | schema.sql |
| `nota_estagio` | TEXT CHECK(IN 'AP','REP') | migration.sql |
| `estagio_parecer` | TEXT | migration.sql |
| `status` | TEXT DEFAULT NULL (pendente/normal) | migration_calendario_pendencia.sql |
| `versao` | INTEGER DEFAULT 1 | migration.sql |
| `created_at` | TIMESTAMP DEFAULT NOW() | schema.sql |

Join disponível via `getBoletim`: `disciplinas_base (id, nome, modulo)`.

## Mudanças propostas

Nenhuma.

## Tipo TypeScript afetado

O tipo `Boletim` em `src/types/domain.ts:123-134` está desatualizado em relação ao banco:
- Faltam: `disciplina_base_id`, `nota_estagio`, `estagio_parecer`, `status`, `versao`
- Removeu: `conceito` (não está no banco atual)

**Recomendação:** Atualizar o tipo `Boletim` em `src/types/domain.ts` para espelhar o schema real do banco, como parte da implementação desta feature.

## Migrações necessárias

Nenhuma.
