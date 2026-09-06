# Adendo: Lançamento de Notas de Disciplinas Regulares e Estágio Supervisionado por Lote

> Identificador: `006-lancamento-notas-estagio`
> Data: `2026-09-06`
> Cenário: `legado`

## Vigência

Vigente desde 2026-09-06.

## Resumo da entrega

A feature estabeleceu a segregação de responsabilidades no registro de notas acadêmicas: professores lançam notas de disciplinas regulares no painel docente, enquanto a Secretaria e Coordenação realizam a carga e salvamento em lote das notas de estágio supervisionado de turmas do curso técnico (via `upsertNotaEstagioLote`). A gravação de notas de estágio exibe confirmação visual imediata por Toast Flutuante e é isenta de bloqueios por pendência financeira (`bloqueio_financeiro = true`). Alunos de cursos técnicos visualizam a nota de estágio supervisionado no boletim acadêmico.

Conclusão: 8 de 8 ações concluídas em `actions.md`.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/architecture.md` | `#módulos-principais` | componente-novo | Adicionada a view `SecretariaEstagioLoteView` em `src/views/secretaria-estagio.ts` para lançamento em lote de estágio. |
| `_reversa_sdd/domain.md` | `#regras-de-domínio-por-tipo-de-entidade` | regra-nova | Lançamento de nota de estágio supervisionado é restrito a `admin`, `secretaria` e `coordenacao`. |
| `_reversa_sdd/domain.md` | `#rb09` | regra-nova | Método `upsertNotaEstagioLote` em `academic-service.ts` executa a gravação em lote no campo `nota_estagio` da tabela `boletim`. |
| `_reversa_sdd/domain.md` | `#aluno` | regra-nova | Alunos com `bloqueio_financeiro = true` aceitam gravação e consulta de notas normalmente sem restrições. |
| `_reversa_sdd/domain.md` | `#rb15` | regra-nova | Alunos de curso técnico visualizam a nota de estágio supervisionado no seu boletim (`AlunoNotasView`). |

## Regras sob vigilância

- `W001` (Apontador em `_reversa_forward/006-lancamento-notas-estagio/regression-watch.md#W001`)
- `W002` (Apontador em `_reversa_forward/006-lancamento-notas-estagio/regression-watch.md#W002`)
- `W003` (Apontador em `_reversa_forward/006-lancamento-notas-estagio/regression-watch.md#W003`)
- `W004` (Apontador em `_reversa_forward/006-lancamento-notas-estagio/regression-watch.md#W004`)

## Fontes

- `_reversa_forward/006-lancamento-notas-estagio/requirements.md`
- `_reversa_forward/006-lancamento-notas-estagio/roadmap.md`
- `_reversa_forward/006-lancamento-notas-estagio/legacy-impact.md`
- `_reversa_forward/006-lancamento-notas-estagio/regression-watch.md`
- `_reversa_forward/006-lancamento-notas-estagio/progress.jsonl`
