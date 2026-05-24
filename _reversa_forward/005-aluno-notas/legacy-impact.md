# Legacy Impact: Aluno — Minhas Notas

> Identificador: `005-aluno-notas`
> Data: `2026-05-23`

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|------------|------|------------|---------------|
| `src/types/domain.ts` | Types | regra-alterada | LOW | Interface `Boletim` atualizada com campos reais do banco |
| `src/views/aluno-notas.ts` | Presentation — Views | componente-novo | MEDIUM | Nova view para exibição de notas do aluno |
| `src/views/dashboard.ts` | Presentation — Views | regra-alterada | MEDIUM | Adicionada rota `/aluno/notas` e item no sidebar |

## Diff conceitual por componente

### Types — `src/types/domain.ts`

Interface `Boletim` alterada:
- Adicionado: `disciplina_base_id`, `nota_estagio`, `estagio_parecer`, `status`, `versao`, `disciplinas_base` (join)
- Removido: `conceito` (campo inexistente no banco, nunca usado)

Nenhuma regressão esperada — os campos adicionados são opcionais (`?`), e o campo removido era opcional e não utilizado.

### Presentation — Views (`src/views/aluno-notas.ts`)

Componente novo. Reusa `AcademicService.getBoletim()` (inalterado) e `grades-utils.ts` (inalterado). Nenhum impacto em views existentes.

### Presentation — Views (`src/views/dashboard.ts`)

Duas alterações localizadas:
1. Import adicionado no topo
2. Rota `aluno/notas` inserida antes do fallback `else`
3. Sidebar item inserido após "Matriz Curricular" condicionado a `_isAluno`

Nenhum impacto negativo em rotas ou sidebar existentes.

## Preservadas

| Regra (origem) | Descrição |
|----------------|-----------|
| `_reversa_sdd/domain.md#RB02` | Notas entre 0 e 10 — inalterado |
| `_reversa_sdd/domain.md#RB01` | Matrícula ativa vincula aluno-turma — inalterado |
| `_reversa_sdd/architecture.md#Camadas` | Padrão Service-View preservado |
| `_reversa_sdd/permissions.md` | RLS "Students view own grades" inalterado |

## Modificadas

| Regra (origem) | Descrição da mudança |
|----------------|----------------------|
| `_reversa_sdd/academic/design.md#Interface` | `getBoletim` continua inalterado, novo consumidor adicionado |
| `src/types/domain.ts` | Interface `Boletim` sincronizada com schema real do banco |
