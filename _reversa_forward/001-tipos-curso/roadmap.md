# Roadmap: Tipos de Curso

> Identificador: `001-tipos-curso`
> Data: `2026-05-23`
> Requirements: `_reversa_forward/001-tipos-curso/requirements.md`
> Confidência: 🟢 CONFIRMADO

## 1. Resumo da abordagem

Adicionar campo `tipo_curso` (`'tecnico' | 'formacao'`) à tabela `cursos`. Adaptar a lógica de avaliação em `academic-service.ts` e `professor-service.ts` para usar notas numéricas (técnico) ou conceitos A/B/C (formação). Alterar `boletim` para suportar conceito textual ao lado do campo numérico. Migração SQL adiciona coluna com default `'tecnico'` (backwards compatible). Views de UI adaptam exibição conforme tipo.

## 2. Princípios aplicados

Nenhum princípio definido em `.reversa/principles.md`. Nenhum conflito identificado.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|---------------|--------------------------|-------------|
| D-01 | Campo `tipo_curso` na tabela `cursos` com default `'tecnico'` | Compatibilidade retroativa com cursos existentes | Tabela separada de configuração de curso (over-engineering) | 🟢 |
| D-02 | Campo `conceito` (text) no `boletim` ao lado das notas numéricas | Reutiliza estrutura existente sem quebrar boletins antigos; cursos técnicos ignoram conceito e vice-versa | Tabela separada de avaliação (complexidade desnecessária) | 🟢 |
| D-03 | Validação no service layer (Zod) + RLS permanece inalterada | A regra de avaliação é lógica de negócio, não de segurança | RLS por tipo (não escala) | 🟢 |
| D-04 | Badge "Técnico" / "Formação" na listagem de cursos via CSS class | Minimal touch na view; curso técnico pode ter ícone diferente via data attribute | Coluna dedicada no backend table (já existe `tipo_curso`) | 🟢 |

## 4. Premissas

Nenhuma — requirements não tem marcadores `[DÚVIDA]`.

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Course/Service | `src/lib/course-service.ts` | regra-alterada | `createCurso` aceita `tipo_curso`; filtrar por tipo em `getCursos` |
| Course/View | `src/views/gestao-turmas.ts` | regra-alterada | Dropdown de tipo na criação/edição; badge na listagem |
| Academic/Service | `src/lib/academic-service.ts` | regra-alterada | `upsertNotaEstagio` adaptável; lógica de conceito em boletim |
| Academic/View | `src/views/secretaria.ts` | regra-alterada | Boletim exibe conceito A/B/C para formação |
| Professor/Service | `src/lib/professor-service.ts` | regra-alterada | Validação condicional: nota 0-10 vs conceito A/B/C |
| Professor/View | `src/views/professor.ts` | regra-alterada | Input de conceito (select A/B/C) ao invés de número |
| Database | `cursos`, `boletim` | schema-alterado | Novas colunas: `cursos.tipo_curso`, `boletim.conceito` |

## 6. Delta no modelo de dados

- `cursos.tipo_curso` — `text`, default `'tecnico'`, check in ('tecnico', 'formacao')
- `boletim.conceito` — `text`, nullable, check in ('A', 'B', 'C') quando presente
- RN-03: Impedir update se `EXISTS (SELECT 1 FROM turmas WHERE curso_id = X)`
- Detalhe completo em: `_reversa_forward/001-tipos-curso/data-delta.md`

## 7. Delta de contratos externos

Nenhum contrato externo afetado (apenas frontend + Supabase DB).

## 8. Plano de migração

1. Migration SQL: `ALTER TABLE cursos ADD COLUMN tipo_curso text DEFAULT 'tecnico' NOT NULL CHECK (tipo_curso IN ('tecnico', 'formacao'))`
2. Migration SQL: `ALTER TABLE boletim ADD COLUMN conceito text CHECK (conceito IN ('A', 'B', 'C'))`
3. Atualizar `course-service.ts`: `createCurso` aceita `tipo_curso`; `getCursos` aceita filtro `?tipo=`
4. Atualizar `types/domain.ts`: adicionar `tipo_curso` e `conceito` nos tipos
5. Atualizar `academic-service.ts`: lógica de boletim condicional por tipo de curso
6. Atualizar `professor-service.ts`: validação condicional nota vs conceito
7. Atualizar views: dropdown de tipo, badge, input de conceito

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Quebrar boletins existentes de cursos técnicos | alto | baixa | Default `'tecnico'` + coluna `conceito` nullable; cursos existentes não precisam de migração de dados |
| Professor lançar conceito em curso técnico (ou vice-versa) | médio | média | Validação no service layer + UI condicional por tipo do curso |
| Esquecer de filtrar por tipo em relatórios/exportações | médio | baixa | Adicionar `tipo_curso` nos retornos; relatórios existentes usam `getCursoDaTurma` que já incluirá o campo |

## 10. Critério de pronto

- [ ] Migration SQL aplicada no Supabase local e linked
- [ ] `createCurso` salva e retorna `tipo_curso`
- [ ] `getCursos` filtra por `?tipo=` parâmetro opcional
- [ ] Editar tipo bloqueado para cursos com turmas ativas
- [ ] Boletim de curso técnico exibe notas numéricas (0-10)
- [ ] Boletim de curso formação exibe conceitos (A/B/C)
- [ ] Professor vê inputs adequados ao tipo da disciplina/turma
- [ ] Badge de tipo na listagem de cursos
- [ ] Conversão conceito→nota (A=10, B=7.5, C=5) disponível para relatórios
- [ ] `tsc --noEmit` + `npm test` passando
- [ ] `regression-watch.md` gerado

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-05-23 | Versão inicial gerada por `/reversa-plan` | reversa |
