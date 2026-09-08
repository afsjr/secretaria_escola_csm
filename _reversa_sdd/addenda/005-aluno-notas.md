# Adendo: Aluno — Minhas Notas

> Identificador: `005-aluno-notas`
> Data: `2026-09-08T10:15:00-03:00`
> Cenário: legado

## Vigência

Vigente desde 2026-09-08.

## Resumo da entrega

Adiciona a aba "Minhas Notas" no dashboard do perfil `aluno`, exibindo as disciplinas em que o aluno está matriculado com N1, N2, N3, Recuperação, Média Final e badge de status (aprovado/reprovado/cursando), em modo somente leitura. Cria a rota `#/dashboard/aluno/notas` e o item no sidebar do aluno, reutilizando o `getBoletim` do `AcademicService` e as funções de cálculo de média de `grades-utils.ts` (a média não é coluna no banco, é calculada no frontend). 4/4 ações concluídas.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/domain.md` | `#regras-de-negócio-implícitas` | regra-nova | RB15 "Acesso de Alunos ao Boletim (Somente Leitura)" passa a valer: aluno visualiza apenas as próprias notas e não pode lançar nem editar; disciplinas `pendente` aparecem como "Cursando" |
| `_reversa_sdd/architecture.md` | `#camadas` (Presentation Layer) | componente-novo | Nova view `src/views/aluno-notas.ts` reutiliza `getBoletim` (inalterado) e `grades-utils.ts` (inalterado) |
| `_reversa_sdd/architecture.md` | `#camadas` (Presentation Layer) | regra-alterada | Dashboard adiciona rota `aluno/notas` com guard `_isAluno` e link no sidebar visível apenas para perfil `aluno` |
| `_reversa_sdd/database/data-dictionary.md` | `boletim` | delta-de-dados | Interface `Boletim` em `src/types/domain.ts` sincronizada com o schema real (removido campo `conceito` inexistente, adicionados `disciplina_base_id`, `nota_estagio`, `status`, `versao`) |

Regras RB01 (matrícula ativa) e RB02 (notas 0-10) preservadas; política RLS "Students view own grades" inalterada.

## Regras sob vigilância

- W001, W002, W003 — ver `_reversa_forward/005-aluno-notas/regression-watch.md`

## Fontes

- `_reversa_forward/005-aluno-notas/legacy-impact.md`
- `_reversa_forward/005-aluno-notas/regression-watch.md`
- `_reversa_forward/005-aluno-notas/requirements.md`
- `_reversa_forward/005-aluno-notas/actions.md`
- `_reversa_forward/005-aluno-notas/progress.jsonl`
