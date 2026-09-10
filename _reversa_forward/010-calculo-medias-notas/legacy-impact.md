# Legacy Impact: Cálculo de Médias com Notas Variáveis

> Identificador: `010-calculo-medias-notas`
> Data: `2026-09-10`
> Política de edição: `allowLegacyEdits: true`, `allowedPaths: ["src/**"]`

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|------------|------|------------|---------------|
| `src/lib/grades-utils.ts` | Academic (grades-utils) | regra-alterada | HIGH | Função `calcularMediaParcial` alterada de divisão fixa por 3 para contagem dinâmica |
| `src/lib/pdf-service.ts` | Academic (pdf-service) | contrato-alterado | MEDIUM | `_calcularMediaTeoria` delega para `calcularMediaParcial` de `grades-utils` |
| `src/views/professor-turmas-notas.ts` | Professor (UI notas) | regra-nova | LOW | Adição de alerta visual "Nenhuma avaliação registrada" + correção de `recalcularMedia` que também dividia por 3 |
| `src/lib/grades.test.ts` | Academic (testes) | componente-novo | LOW | 6 novos testes para cenários com 1 e 2 notas |

## Diff conceitual por componente

### grades-utils.ts

**Antes:** `calcularMediaParcial(n1, n2, n3)` retornava `(n1 + n2 + n3) / 3` — sempre dividia por 3, subestimando médias de disciplinas com menos de 3 avaliações.

**Depois:** Filtra notas > 0, soma e divide pela contagem dinâmica. Disciplina com 1 nota (8) agora retorna 8 em vez de 2.67. Disciplina com 3 notas (8, 7, 9) continua retornando 8 (retrocompatível).

### pdf-service.ts

**Antes:** `_calcularMediaTeoria` implementava contagem dinâmica de forma independente (22 linhas).

**Depois:** Delega para `calcularMediaParcial` de `grades-utils` (4 linhas). Elimina duplicação.

### professor-turmas-notas.ts

**Antes:** `recalcularMedia` calculava `(n1+n2+n3)/3` manualmente na UI.

**Depois:** Usa `calcularMediaParcial` importado de `grades-utils`. Adiciona alerta visual quando disciplina não possui notas lançadas.

## Preservadas

| Regra | Arquivo | Confidência |
|-------|---------|-------------|
| RB02: Notas entre 0 e 10 | `_reversa_sdd/domain.md` | 🟢 |
| RB03: Controle de concorrência em notas | `_reversa_sdd/domain.md` | 🟢 |
| RB09: Disciplinas com estágio têm lógica separada | `_reversa_sdd/domain.md` | 🟢 |
| RB13: Tipos de curso determinam sistema de avaliação | `_reversa_sdd/domain.md` | 🟢 |
| `calcularNotaFinal` inalterada | `src/lib/grades-utils.ts` | 🟢 |
| `calcularStatusAluno` inalterada | `src/lib/grades-utils.ts` | 🟢 |

## Modificadas

| Regra | Arquivo | Tipo de mudança | Confidência |
|-------|---------|-----------------|-------------|
| `calcularMediaParcial` sempre dividia por 3 | `src/lib/grades-utils.ts` | Comportamento alterado para contagem dinâmica | 🟢 |
| `_calcularMediaTeoria` tinha lógica própria | `src/lib/pdf-service.ts` | Agora delega para `grades-utils` | 🟡 |
| `recalcularMedia` dividia por 3 na UI | `src/views/professor-turmas-notas.ts` | Agora usa `calcularMediaParcial` | 🟢 |
