# Legacy Impact — Tipos de Curso (001)

> Gerado por `/reversa-coding` em 2026-05-23

## Arquivos criados
- `supabase/migrations/20260523_tipos_curso.sql`
- `supabase/migrations/20260523_boletim_conceito.sql`

## Arquivos modificados

### `src/lib/course-service.ts`
- `CursoData` interface: adicionado campo `tipo?: 'tecnico' | 'formacao'`
- `createCurso`: aceita `tipo`, insere no banco
- `getCursos` / `getCursosAtivos`: filtro opcional `tipo`
- `updateCurso`: valida turmas ativas antes de alterar `tipo_curso`
- `getTurmasDoCurso`: novo método (usado pela view de gestão)

### `src/lib/academic-service.ts`
- `upsertNotaEstagio`: suporta `conceito` para formação
- `getBoletim`: retorna `nota_final` como equivalência numérica do conceito
- `getTipoDaTurma`: novo método
- `verificarMatriculaSimultanea`: permite matrícula dupla se curso for `'formacao'`

### `src/lib/academic-service.test.ts`
- Testes para `verificarMatriculaSimultanea`

### `src/lib/professor-service.ts`
- `salvarNotas`: valida condicional — nota 0-10 (técnico) ou conceito A/B/C (formação)
- `getDisciplinasProfessor`: inclui `cursos.tipo_curso` na query

### `src/lib/professor-service.test.ts`
- Testes para validação condicional nota vs conceito

### `src/lib/course-service.test.ts`
- Testes para criação com tipo, filtragem, bloqueio de edição

### `src/types/domain.ts`
- `Curso`: adicionado `tipo_curso?: string`
- `Boletim`: adicionado `conceito?: string`

### `src/components/Tabs/GerenciarCursosTab.ts`
- Dropdown de tipo na criação (Técnico / Formação Complementar)
- Badge de tipo na listagem
- Botão "Editar" com modal para alterar tipo (bloqueado se houver turmas ativas)

### `src/views/professor.ts`
- Já possuía input condicional (número vs select A/B/C) — confirmado funcional

### `src/views/gestao-turmas.ts`
- `toggleTabsPorType`: esconde Grade/Notas para cursos de formação
- `selectedCursoTipo`: usado para controle de visibilidade das abas

## Impacto em dados existentes
- Cursos existentes sem `tipo_curso` receberão DEFAULT `'tecnico'`
- Boletins existentes sem `conceito` terão `conceito = NULL` (sem CHECK violation)
