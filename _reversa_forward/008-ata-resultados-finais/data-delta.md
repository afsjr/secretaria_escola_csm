# Data Delta: Ata de Resultados Finais (PDF)

> Identificador: `008-ata-resultados-finais`
> Data: `2026-09-07`

## 1. Visão Geral das Tabelas Afetadas

A feature é **somente leitura**: nenhuma alteração DDL. Todas as tabelas abaixo são consumidas pelo `AcademicService.getDadosAtaTurma` para montar o payload do PDF.

```
 ┌──────────────┐      ┌──────────────┐      ┌───────────────────┐
 │    turmas    │      │    cursos    │      │ disciplinas_base  │
 ├──────────────┤      ├──────────────┤      ├───────────────────┤
 │ id           │N    1│ id           │1    N│ id                │
 │ nome         ├──────┤ nome         ├──────┤ nome              │
 │ periodo      │      │ tipo         │      │ modulo            │
 │ curso_id     │      └──────────────┘      │ carga_horaria     │
 │ status_...   │                            │ ordem             │
 └──────────────┘                            └───────────────────┘
        │ N
        │
 ┌──────┴────────┐      ┌──────────────────┐      ┌──────────────┐
 │   matriculas  │      │     boletim      │      │    perfis    │
 ├───────────────┤      ├──────────────────┤      ├──────────────┤
 │ id            │      │ aluno_id         │      │ id           │
 │ turma_id      │      │ disciplina_base_ │N    1│ nome_completo│
 │ aluno_id   N─1├──────┤ id          N   1├──────│              │
 │ status_aluno  │      │ n1, n2, n3, rec  │      └──────────────┘
 └───────────────┘      │ faltas           │
                        │ nota_estagio     │
                        │ status           │
                        │ versao           │
                        └──────────────────┘
```

## 2. Detalhe de Campos Utilizados

| Tabela | Campo | Tipo | Descrição / Regra |
|--------|-------|------|-------------------|
| `turmas` | `id`, `nome` | `UUID`, `TEXT` | Identificação da turma; `nome` compõe o título e o nome do arquivo da Ata. |
| `turmas` | `periodo` | `TEXT` | Origem do ano letivo (`token YYYY` com fallback ano corrente) — ver roadmap D-07. |
| `turmas` | `curso_id` | `UUID` | Chave para o catálogo de componentes (matriz). |
| `cursos` | `nome`, `tipo` | `TEXT` | Identificação do curso no cabeçalho da Ata. `tipo` (`saude|tecnico|outro|formacao`) não restringe a emissão. |
| `disciplinas_base` | `nome`, `modulo`, `ordem`, `carga_horaria` | `TEXT`, `TEXT`, `INTEGER`, `INTEGER` | Componentes da Ata, ordenados por `modulo, ordem`. `carga_horaria` é o total exibido nas colunas T/P e E/S (não existe divisão de carga no banco — roadmap D-03). |
| `matriculas` | `status_aluno` | `TEXT` | `ativo | trancado | evadido | concluido` — entrada para a "Situação final" preferente (roadmap D-05). |
| `matriculas` | `aluno_id` | `UUID` | Junção com `perfis` e `boletim`. |
| `perfis` | `nome_completo` | `TEXT` | Nome do aluno na ordem dos «alunos» da Ata. |
| `boletim` | `disciplina_base_id` | `UUID` | Junção do registro de notas ao catálogo. |
| `boletim` | `n1, n2, n3, rec` | `NUMERIC` | Base para `calcularNotaFinal` e status por componente (`Aprovado`/`Reprovado`/`Cursando`). |
| `boletim` | `faltas` | `INTEGER` | Base para o % de frequência derivado: `clamp(100 - faltas*100/carga_horaria, 0, 100)` (roadmap D-06). |
| `boletim` | `nota_estagio` | `TEXT` (`AP|REP`) | Preenche a coluna E/S para componentes com estágio (`disciplinaTemEstagio`). |
| `boletim` | `status`, `versao` | `TEXT`, `INTEGER` | `status='pendente'` indica componente ainda cursando. `versao` não é alterado pela Ata. |

## 3. Campos Derivados (não persistidos)

| Derivado | Regra |
|----------|-------|
| `situacaoFinal` (por aluno) | Se `status_aluno != 'ativo'`, usa `evadido/trancado/concluido`; senão agrega status por componente: todos `Aprovado` → `Aprovado`; algum `Reprovado` → `Reprovado`; senão `Cursando` (roadmap D-05). |
| `statusPorComponente` | `calcularStatusAluno(calcularNotaFinal(n1,n2,n3,rec))` via `grades-utils`; `boletim.status='pendente'` → `Cursando`. |
| `percentualFrequencia` | `clamp(100 - faltas*100/carga_horaria, 0, 100)` por componente (roadmap D-06). |
| `anoLetivo` | `turmas.periodo` token `YYYY`, senão ano corrente (roadmap D-07). |

## 4. Script de Migração SQL

> n/a — Nenhuma migração DDL necessária.