# Adendo: Vincular e Desvincular Professores em Disciplinas de Turmas

> Feature: `011-vincular-professor-disciplina`
> Data: `2026-09-11`
> Cenário: legado
> Extração base: `_reversa_sdd/`

## Vigência

Vigente desde 2026-09-11.

## Resumo da entrega

A feature permite vincular, substituir e desvincular o professor responsável por cada disciplina ofertada em uma turma, diretamente na aba Grade da gestão de turmas. O desvínculo apenas esvazia `professor_id`, preservando a oferta e todo o histórico de notas e aulas. Substituições e desvínculos com histórico exigem confirmação, e todas as ações são auditadas. Foram concluídas 10 de 10 ações do plano.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/architecture.md` | Módulos Principais (Course) | regra-nova | `CourseService` ganhou `vincularProfessorDisciplina`, `desvincularProfessorDisciplina` e `ofertaPossuiHistorico`; ver `legacy-impact.md` da feature |
| `_reversa_sdd/architecture.md` | Módulos Principais (Academic) | regra-alterada | A aba Grade de `gestao-turmas.ts` passou a permitir vincular/substituir/desvincular professor inline, deixando de ser somente leitura |
| `_reversa_sdd/architecture.md` | Módulos Principais (Audit) | delta-de-contrato-externo | `AuditService` passou a reconhecer as ações `vincular_professor` e `desvincular_professor` (severidade média) |
| `_reversa_sdd/domain.md` | Regras de Domínio por Tipo de Entidade (Professor) | regra-alterada | O vínculo de professor a ofertas agora é explicitamente opcional: `professor_id` pode ser `null` após desvínculo, com a oferta preservada |
| `_reversa_sdd/data-dictionary.md` | Oferta (turma_disciplinas) | delta-de-dados | Nenhum campo novo; `professor_id` passa a ser gravado como `null` no desvínculo (campo já opcional) |

## Regras sob vigilância

W001, W002, W003, W004 — detalhes em `_reversa_forward/011-vincular-professor-disciplina/regression-watch.md`

## Fontes

- `_reversa_forward/011-vincular-professor-disciplina/requirements.md`
- `_reversa_forward/011-vincular-professor-disciplina/legacy-impact.md`
- `_reversa_forward/011-vincular-professor-disciplina/regression-watch.md`
- `_reversa_forward/011-vincular-professor-disciplina/progress.jsonl`
