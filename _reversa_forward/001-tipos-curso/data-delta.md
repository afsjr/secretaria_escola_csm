# Data Delta: Tipos de Curso

> Feature: `001-tipos-curso`
> Data: `2026-05-23`
> Modelo base: `_reversa_sdd/data-dictionary.md` e `_reversa_sdd/erd-complete.md`

## Mudanças no schema

### Tabela `cursos`

| Ação | Campo | Tipo | Restrições | Default |
|------|-------|------|------------|---------|
| +ADD | `tipo_curso` | `text` | NOT NULL, CHECK IN ('tecnico', 'formacao') | `'tecnico'` |

### Tabela `boletim`

| Ação | Campo | Tipo | Restrições | Default |
|------|-------|------|------------|---------|
| +ADD | `conceito` | `text` | NULLABLE, CHECK IN ('A', 'B', 'C') | `null` |

## Dicionário

### Cursos.tipo_curso

| Valor | Significado | Avaliação | Aprovação |
|-------|-------------|-----------|-----------|
| `tecnico` | Curso técnico profissionalizante | Notas 0-10 | Média >= 7.0 |
| `formacao` | Curso de formação livre | Conceitos A/B/C | Presença >= 75% + conceito >= B |

### Boletim.conceito

| Valor | Significado | Conversão para nota |
|-------|-------------|---------------------|
| `A` | Excelente | 10 |
| `B` | Bom | 7.5 |
| `C` | Regular | 5.0 |

## Regras de integridade

1. `cursos.tipo_curso` só pode ser alterado se não houver turmas ativas vinculadas ao curso:
   ```sql
   CHECK (NOT (OLD.tipo_curso IS DISTINCT FROM NEW.tipo_curso AND
     EXISTS (SELECT 1 FROM turmas WHERE curso_id = NEW.id)))
   ```
   Implementado via código (service layer), não via CHECK constraint (PostgreSQL não permite subquery em CHECK).

2. `boletim.conceito` só deve ser preenchido para cursos de formação. Cursos técnicos mantêm conceito = null.

## Migração SQL

```sql
-- 001-tipos-curso: adicionar tipo_curso à tabela cursos
ALTER TABLE cursos ADD COLUMN tipo_curso text NOT NULL DEFAULT 'tecnico'
  CHECK (tipo_curso IN ('tecnico', 'formacao'));

-- 001-tipos-curso: adicionar conceito à tabela boletim
ALTER TABLE boletim ADD COLUMN conceito text
  CHECK (conceito IN ('A', 'B', 'C'));
```

## Impacto em dados existentes

- **Cursos existentes**: todos recebem `tipo_curso = 'tecnico'` automaticamente (default)
- **Boletins existentes**: `conceito = null` — funcionam normalmente com notas numéricas
- **Zero necessidade de backfill**: compatibilidade total
