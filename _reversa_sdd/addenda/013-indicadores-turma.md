# Adendo: Indicadores Pedagógicos da Turma

> Feature: `013-indicadores-turma`
> Data ISO 8601: `2026-10-31T06:26:36-03:00`
> Cenário: legado

## Vigência

Vigente desde 2026-10-31.

## Resumo da entrega

Adiciona a aba **Indicadores** na gestão de turmas, depois de Calendário, visível para turmas de cursos não-formação. A aba é somente leitura e mostra média final da turma, percentual de presença e os ranges de maior e menor média e presença entre alunos, além de contadores e quebra por disciplina. A feature reutiliza `grades-utils` e a fórmula de frequência da Ata, não cria migração e não grava no banco. Foram concluídas 14 de 14 ações.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/architecture.md` | `#módulos-principais` (Academic) | regra-nova | Academic ganhou `getIndicadoresPedagogicosTurma`, um read model que agrega média, presença e ranges a partir de `turmas`, `turma_disciplinas`, `matriculas`, `disciplinas_base` e `boletim`. |
| `_reversa_sdd/architecture.md` | `#camadas` (Presentation) | componente-alterado | `gestao-turmas.ts` ganhou a aba Indicadores e `gestao-turmas-indicadores.ts` renderiza cards e tabela; `main.css` ganhou as classes `gt-indicadores-*`. |
| `_reversa_sdd/code-analysis.md` | `#módulo-academic` | componente-alterado | O Academic passou a expor o read model de indicadores; `grades-utils` ganhou `calcularPercentualFrequencia`, consumido também pela Ata. |
| `_reversa_sdd/domain.md` | `#rb13` | regra-nova | Indicadores existem apenas para cursos não-formação; `tipo_curso` nulo é tratado como técnico. RB13 permanece preservada. |
| `_reversa_sdd/domain.md` | `#rb02` | regra-nova | Indicadores usam as notas 0-10 já validadas e a média dinâmica de `grades-utils`; nenhuma nova máquina de aprovação foi criada. |
| `_reversa_sdd/addenda/008-ata-resultados-finais.md` | `#impacto-por-artefato-da-extração` | componente-alterado | A fórmula de frequência da Ata virou helper compartilhado; a saída da Ata permanece igual para os mesmos dados. |
| `_reversa_sdd/addenda/010-calculo-medias-notas.md` | `#impacto-por-artefato-da-extração` | regra-nova | Os indicadores consomem `calcularMediaParcial` com contagem dinâmica de notas; a regra da feature 010 continua vigente. |
| `_reversa_sdd/permissions.md` | `#matriz-de-permissões` | regra-nova | A aba Indicadores herda o acesso de `view_turmas` e `manage_turmas`: `master_admin`, `admin`, `secretaria` e `coordenacao`. `financeiro`, `professor` e `aluno` não acessam pela navegação. A rota direta `#/gestao-turmas` em `main.ts` segue sem guarda explícita de perfil. |
| `_reversa_sdd/database/erd.md` | `#domínio-acadêmico` | delta-de-dados | Nenhuma migração ou coluna nova; os indicadores são derivados em leitura das tabelas acadêmicas existentes. |

## Regras sob vigilância

W001, W002, W003, W004, W005, W006. Detalhes em `_reversa_forward/013-indicadores-turma/regression-watch.md`.

## Fontes

- `_reversa_forward/013-indicadores-turma/legacy-impact.md`
- `_reversa_forward/013-indicadores-turma/regression-watch.md`
- `_reversa_forward/013-indicadores-turma/requirements.md`
- `_reversa_forward/013-indicadores-turma/progress.jsonl`
