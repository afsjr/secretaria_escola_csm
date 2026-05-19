# Gestão de Cursos (Course), Design Técnico

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `getCursos` | `()` | `{ data, error }` | Todos os cursos |
| `getCursosAtivos` | `()` | `{ data, error }` | Apenas ativos |
| `createCurso` | `({ nome, descricao })` | `{ data, error }` | Cria curso |
| `desativarCurso` | `(cursoId)` | `{ data, error }` | Ativo=false |
| `reativarCurso` | `(cursoId)` | `{ data, error }` | Ativo=true |
| `getMatrizCurricular` | `(cursoId)` | `{ data, error }` | Disciplinas do curso |
| `addDisciplinaAoCatalogo` | `(DisciplinaBaseData)` | `{ data, error }` | Nova disciplina |
| `getTurmasDoCurso` | `(cursoId)` | `{ data, error }` | Turmas do curso |
| `getOfertasDaTurma` | `(turmaId)` | `{ data, error }` | Ofertas da turma |
| `criarOfertaDisciplina` | `(turmaId, disciplinaBaseId, professorId?)` | `{ data, error }` | Nova oferta |
| `atribuirProfessorAEstrutura` | `(ofertaId, professorId)` | `{ data, error }` | Vincula professor |
| `getCursoDaTurma` | `(turmaId)` | `{ data, error }` | Curso da turma |
| `removerOfertaDisciplina` | `(ofertaId)` | `{ data, error }` | Remove oferta |

## Fluxo Principal

### getMatrizCurricular
1. Query em disciplinas_base
2. Filtro: curso_id = parâmetro
3. Ordenação: modulo asc, nome asc

### getTurmasDoCurso
1. Query em turmas com curso_id
2. Include: matriculas (count)
3. Ordenação: periodo desc

### criarOfertaDisciplina
1. Insere: turma_id, disciplina_base_id, professor_id (opcional)
2. Retorna dados criados

### atribuirProfessorAEstrutura
1. Update em turma_disciplinas
2. Filtro: id = ofertaId
3. Set: professor_id = parâmetro

## Fluxos Alternativos

- **desativar/reativar:** Update simples do campo ativo
- **removerOfertaDisciplina:** Delete direto (pode falhar se houver aulas)

## Dependências
- `supabase` — cliente para queries

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Soft delete via campo ativo | `course-service.ts:47-61` | 🟢 |
| Carga horária default 40h | `course-service.ts:79` | 🟢 |
| JOIN para count de matrículas | `course-service.ts:102` | 🟡 |

## Estado Interno

- Tipo `CursoData`: { nome, descricao? }
- Tipo `DisciplinaBaseData`: { nome, modulo, cursoId, cargaHoraria? }

## Observabilidade

- Sem logs explícitos

## Riscos e Lacunas
- 🟢 Sem lacunas significativas