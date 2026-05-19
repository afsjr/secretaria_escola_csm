# Gestão de Cursos (Course)

> Módulo de gestão de cursos, matriz curricular e ofertas

## Visão Geral
Gerencia o catálogo de cursos, disciplinas base (matriz curricular) e ofertas de disciplinas às turmas.

## Responsabilidades
- CRUD de cursos (ativar/desativar)
- Gestão de matriz curricular (disciplinas_base)
- Criação e remoção de ofertas (turma_disciplinas)
- Atribuição de professores a ofertas
- Consulta de turmas por curso

## Regras de Negócio
- Curso pode ser ativado/desativado logicamente 🟢
- Disciplinas pertencem ao catálogo do curso (não da turma) 🟢
- Oferta vincula: turma + disciplina_base + professor 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Listar cursos | Must | Lista de cursos |
| RF-02 | Listar cursos ativos | Must | Apenas cursos com ativo=true |
| RF-03 | Criar curso | Must | Curso criado |
| RF-04 | Desativar curso | Must | Curso marcado como inativo |
| RF-05 | Reativar curso | Must | Curso marcado como ativo |
| RF-06 | Consultar matriz curricular | Must | Disciplinas do curso ordenadas |
| RF-07 | Adicionar disciplina ao catálogo | Must | Disciplina base criada |
| RF-08 | Listar turmas do curso | Must | Turmas vinculadas ao curso |
| RF-09 | Listar ofertas da turma | Must | Ofertas com dados da disciplina |
| RF-10 | Criar oferta de disciplina | Must | Oferta criada |
| RF-11 | Atribuir professor à oferta | Must | Professor vinculado |
| RF-12 | Remover oferta | Must | Oferta removida |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Integridade | Soft delete (ativo/inativo) | `course-service.ts:47-61` | 🟢 |
| performance | Carga horária default 40h | `course-service.ts:79` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado admin criando curso
Quando executar createCurso
Então curso criado e retornado

Dado consulta de matriz curricular
Quando getMatrizCurricular(cursoId)
Então disciplinas ordenadas por módulo, depois por nome

Dado criação de oferta
Quando criarOfertaDisciplina(turmaId, disciplinaBaseId, professorId)
Então oferta criada com os três vínculos
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| getCursos, getCursosAtivos | Must | Base para qualquer operação |
| getMatrizCurricular | Must | Exibição de grade curricular |
| criarOfertaDisciplina | Must | Funcionalidade central |
| createCurso, desativar/reativar | Should | CRUD completo |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/lib/course-service.ts` | `getCursos`, `getCursosAtivos` | 🟢 |
| `src/lib/course-service.ts` | `createCurso`, `desativarCurso`, `reativarCurso` | 🟢 |
| `src/lib/course-service.ts` | `getMatrizCurricular`, `addDisciplinaAoCatalogo` | 🟢 |
| `src/lib/course-service.ts` | `getTurmasDoCurso`, `getOfertasDaTurma` | 🟢 |
| `src/lib/course-service.ts` | `criarOfertaDisciplina`, `atribuirProfessorAEstrutura` | 🟢 |
| `src/lib/course-service.ts` | `removerOfertaDisciplina` | 🟢 |