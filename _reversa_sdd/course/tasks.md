# Gestão de Cursos (Course), Tarefas de Implementação

## Pré-requisitos
- [x] Tabelas: cursos, disciplinas_base, turmas, turma_disciplinas
- [x] Campos: ativo em cursos

## Tarefas

- [ ] T-01, Implementar getCursos e getCursosAtivos
  - Origem no legado: `src/lib/course-service.ts:21-36`
  - Critério de pronto: Lista ordenada por nome
  - Confiança: 🟢

- [ ] T-02, Implementar createCurso
  - Origem no legado: `src/lib/course-service.ts:38-45`
  - Critério de pronto: Curso criado e retornado
  - Confiança: 🟢

- [ ] T-03, Implementar desativarCurso e reativarCurso
  - Origem no legado: `src/lib/course-service.ts:47-61`
  - Critério de pronto: Campo ativo atualizado
  - Confiança: 🟢

- [ ] T-04, Implementar getMatrizCurricular
  - Origem no legado: `src/lib/course-service.ts:68-76`
  - Critério de pronto: Disciplinas ordenadas por módulo e nome
  - Confiança: 🟢

- [ ] T-05, Implementar addDisciplinaAoCatalogo
  - Origem no legado: `src/lib/course-service.ts:78-91`
  - Critério de pronto: Disciplina criada com carga horária default
  - Confiança: 🟢

- [ ] T-06, Implementar getTurmasDoCurso
  - Origem no legado: `src/lib/course-service.ts:97-107`
  - Critério de pronto: Turmas com contagem de matrículas
  - Confiança: 🟡

- [ ] T-07, Implementar getOfertasDaTurma
  - Origem no legado: `src/lib/course-service.ts:110-120`
  - Critério de pronto: Ofertas com dados da disciplina e professor
  - Confiança: 🟢

- [ ] T-08, Implementar criarOfertaDisciplina
  - Origem no legado: `src/lib/course-service.ts:123-134`
  - Critério de pronto: Oferta criada
  - Confiança: 🟢

- [ ] T-09, Implementar atribuirProfessorAEstrutura
  - Origem no legado: `src/lib/course-service.ts:137-143`
  - Critério de pronto: Professor vinculado à oferta
  - Confiança: 🟢

- [ ] T-10, Implementar removerOfertaDisciplina
  - Origem no legado: `src/lib/course-service.ts:157-164`
  - Critério de pronto: Oferta removida
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Teste de criação de curso
- [ ] TT-02, Teste de adição de disciplina ao catálogo
- [ ] TT-03, Teste de criação de oferta

## Lacunas Pendentes (🔴)

- 🟡 COUNT em getTurmasDoCurso pode precisar otimização (subquery vs count)