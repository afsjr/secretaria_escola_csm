# Investigation: Tipos de Curso

> Feature: `001-tipos-curso`
> Data: `2026-05-23`

## Contexto

O sistema atual trata todos os cursos como iguais. A tabela `cursos` (`_reversa_sdd/data-dictionary.md`) tem apenas: `id, nome, descricao, ativo, created_at`. O boletim (`boletim`) usa campos numéricos (`n1, n2, n3, rec, nota_estagio`) para todos os cursos.

## Alternativas avaliadas

### Alternativa A: Campo `tipo_curso` na tabela `cursos` + campo `conceito` no `boletim`

**Prós:**
- Compatível com schema existente
- Default `'tecnico'` = zero migração de dados
- `conceito` nullable = registros antigos intactos
- Validação via CHECK constraint + Zod

**Contras:**
- `boletim` acumula colunas opcionais (já tem `nota_estagio`)

### Alternativa B: Tabela separada `tipos_curso` + `avaliacoes`

**Prós:**
- Normalização total
- Flexível para novos tipos no futuro

**Contras:**
- Over-engineering para 2 tipos
- JOIN extra em toda query de curso
- Mais complexidade de migração

### Alternativa C: Enum PostgreSQL (`CREATE TYPE tipo_curso AS ENUM`)

**Prós:**
- Fortemente tipado no DB

**Contras:**
- Supabase Edge Functions podem ter dificuldade com enums customizados
- ALTER TYPE é complexo
- CHECK constraint resolve o mesmo problema

**Decisão:** Alternativa A + CHECK constraint (não enum).

## Padrões aplicáveis

- **Strategy Pattern** (implícito): a lógica de avaliação (notas vs conceitos) é decidida pelo `tipo_curso` do curso. Implementado como condicional no service, não como classes separadas — adequado ao estilo do projeto (service-oriented SPA).
- **Backwards Compatibility**: default `'tecnico'` garante que cursos existentes continuem funcionando sem alteração.

## Referências

- Spec Course: `_reversa_sdd/course/requirements.md` — RF-01 a RF-12
- Spec Academic: `_reversa_sdd/academic/requirements.md` — regras de notas 0-10
- Dicionário de dados: `_reversa_sdd/data-dictionary.md` — tabelas `cursos` e `boletim`
