# Adendo: Tipos de Curso (Técnico vs Formação)

> Identificador: `001-tipos-curso`
> Data: `2026-09-08T10:00:00-03:00`
> Cenário: legado

## Vigência

Vigente desde 2026-09-08.

## Resumo da entrega

Introduz o conceito de tipo de curso (`tipo_curso`: `'tecnico'` | `'formacao'`) como determinante do sistema de avaliação — nota 0-10 para técnico, conceito A/B/C para formação. Adiciona colunas `tipo_curso` em `cursos` e `conceito` em `boletim`, habilita matrícula simultânea quando um dos cursos é de formação, adapta `course-service`, `academic-service` e `professor-service`, e atualiza a view de gestão de cursos (dropdown de tipo, badge e bloqueio de edição com turmas ativas). 10/10 ações concluídas.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/domain.md` | `#regras-de-negócio-implícitas` | regra-nova | RB13 "Tipos de Curso determinam sistema de avaliação (Técnico vs Formação)" passa a valer: a avaliação a ser aplicada depende do `tipo_curso`, não é mais única para todos os cursos |
| `_reversa_sdd/architecture.md` | `#módulos-principais` (Course) | regra-alterada | `course-service` aceita `tipo_curso` na criação e filtro por tipo; `updateCurso` bloqueia mudança de tipo se houver turmas ativas |
| `_reversa_sdd/architecture.md` | `#módulos-principais` (Academic) | regra-alterada | `verificarMatriculaSimultanea` passou a permitir matrícula dupla quando um dos cursos é de formação; `upsertNotaEstagio`/`getBoletim` adaptáveis por tipo (nota vs conceito) |
| `_reversa_sdd/architecture.md` | `#módulos-principais` (Academic) | delta-de-dados | Novas colunas `cursos.tipo_curso` (DEFAULT `'tecnico'`) e `boletim.conceito` (CHECK IN A/B/C); cursos antigos assumem `'tecnico'`, boletins antigos ficam com `conceito = NULL` |
| `_reversa_sdd/architecture.md` | `#camadas` (Presentation Layer) | regra-alterada | `GerenciarCursosTab` ganhou dropdown de tipo, badge e modal de edição; `gestao-turmas` esconde Grade/Notas para cursos de formação |

## Regras sob vigilância

- W001 (CursoService), W002 (matrícula simultânea), W003 (boletim conceito), W004 (testes) — ver `_reversa_forward/001-tipos-curso/regression-watch.md`

## Fontes

- `_reversa_forward/001-tipos-curso/legacy-impact.md`
- `_reversa_forward/001-tipos-curso/regression-watch.md`
- `_reversa_forward/001-tipos-curso/requirements.md`
- `_reversa_forward/001-tipos-curso/actions.md`
- `_reversa_forward/001-tipos-curso/progress.jsonl`
