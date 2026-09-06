# Data Delta: Lançamento de Notas de Estágio Supervisionado

> Identificador: `006-lancamento-notas-estagio`
> Data: `2026-09-06`

## 1. Visão Geral das Tabelas Afetadas

A funcionalidade reutiliza o modelo de dados existente no PostgreSQL via Supabase sem necessidade de alterações na estrutura de tabelas (DDL).

```
 ┌─────────────────┐       ┌────────────────────────┐       ┌───────────────────┐
 │     perfis      │       │        boletim         │       │      cursos       │
 ├─────────────────┤       ├────────────────────────┤       ├───────────────────┤
 │ id              │1     N│ id                     │N     1│ id                │
 │ perfil          ├───────┤ aluno_id               ├───────┤ tipo_curso        │
 │ bloqueio_financ │       │ disciplina_base_id     │       │ (tecnico/formacao)│
 └─────────────────┘       │ n1, n2, n3, rec        │       └───────────────────┘
                           │ nota_estagio (NUMERIC) │
                           │ versao                 │
                           └────────────────────────┘
```

## 2. Detalhe de Campos Utilizados

| Tabela | Campo | Tipo | Descrição / Regra |
|--------|-------|------|-------------------|
| `boletim` | `nota_estagio` | `NUMERIC(4,2)` | Armazena a nota do estágio supervisionado (0.00 a 10.00). Preenchida apenas pela Secretaria/Coordenação para turmas técnicas. |
| `boletim` | `versao` | `INTEGER` | Utilizado para optimistic locking em atualizações concorrentes. |
| `cursos` | `tipo_curso` | `TEXT` | Válido apenas `'tecnico'` para habilitação da funcionalidade de estágio supervisionado. |
| `perfis` | `bloqueio_financeiro` | `BOOLEAN` | Indica pendência financeira. **Não bloqueia** inserção/edição em `boletim`. |

## 3. Script de Migração SQL

> n/a — Nenhuma migração DDL necessária.
