# Regression Watch — Tipos de Curso (001)

> Gerado por `/reversa-coding` em 2026-05-23

## Pontos de atenção para regressão

### Área de risco: CursoService
- `createCurso` agora recebe `tipo?: 'tecnico' | 'formacao'` — qualquer chamada sem esse campo usará o DEFAULT `'tecnico'` no banco.
- `updateCurso` bloqueia alteração de `tipo_curso` se houver turmas ativas vinculadas ao curso.
- `getCursos` e `getCursosAtivos` aceitam filtro opcional `tipo`.

### Área de risco: matrícula simultânea
- `academic-service.ts`: `verificarMatriculaSimultanea` foi adicionada; permite que aluno esteja em múltiplos cursos se um deles for `'formacao'`. Pode alterar o comportamento de matrícula.

### Área de risco: boletim — conceito
- A coluna `conceito` (text, CHECK IN ('A','B','C')) foi adicionada à tabela `boletim`.
- Fluxo de formação usa `conceito` em vez de `n1,n2,n3,rec` no professor view.
- `getBoletim` do `academic-service.ts` retorna `nota_final` como equivalência numérica do conceito.

### Área de risco: testes
- `course-service.test.ts` testa criação com tipo, filtragem, e bloqueio de edição com turmas ativas.
- `academic-service.test.ts` testa `verificarMatriculaSimultanea`.
- `professor-service.test.ts` testa validação condicional nota vs conceito.

## Testes a monitorar
- `src/components/Tabs/GerenciarAlunosTab.test.ts` — 4 falhas pré-existentes (não relacionadas).
- Demais 235 testes passam.
