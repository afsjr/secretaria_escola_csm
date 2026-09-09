---
schema_version: 1
id: OPP-20260909-F7G8
display_number: 4
context: professor-turmas
verb: simplify
title: Duplicação de cálculo de média final diverge de grades-utils no export PDF
target:
  files: ["src/views/professor-turmas.ts"]
  symbol: handler .btn-export-pdf
smell: O handler de exportação PDF recalcula média/final manualmente (linhas ~422-426) em vez de usar calcularMediaParcial/calcularNotaFinal. A lógica manual diverge de grades-utils quando rec=0 e média<7, produzindo nota final menor e status errado no PDF.
roi:
  confidence: green
  impact: Bug real de saída de PDF — aluno com média 6.5 e sem rec sai como Reprovado no relatório (6.5/2=3.25) em vez de Aprovado (6.5)
  cost: low
  est_return: Elimina divergência de cálculo; PDF passa a refletir exatamente o que a UI mostra (calcularNotaFinal + arredondarNota já cobertos por grades.test.ts)
state: proposed
traceability:
  soul: ["academic: lançamento de notas"]
  specs: ["professor/requirements.md"]
---

## Observado

Handler `.btn-export-pdf` (dentro de ProfessorTurmasView):
```ts
let mediaParcial = arredondarNota((n1Val + n2Val + n3Val) / 3);
let finalVal = mediaParcial;
if (mediaParcial < 7) {
  finalVal = arredondarNota((mediaParcial + recVal) / 2);
}
```

`grades-utils.calcularNotaFinal`:
```ts
if (mediaParcial >= 7) return arredondarNota(mediaParcial)
if (rec <= 0) return arredondarNota(mediaParcial)   // ← não divide por 2 quando sem rec
const notaComRec = (mediaParcial + rec) / 2
return arredondarNota(notaComRec)
```

**Divergência confirmada:** média 6.5, rec 0
- grades-utils → `arredondarNota(6.5)` = 6.5 → Aprovado
- handler PDF → `arredondarNota(6.5/2)`... espera: `(6.5+0)/2 = 3.25` → 3.5 → Reprovado

O relatório em PDF mostra situação divergente da tela de lançamento para qualquer aluno abaixo de 7 sem nota de recuperação lançada.

## Transformação proposta

Substituir o bloco manual por:
```ts
const mediaParcial = calcularMediaParcial(n1Val, n2Val, n3Val)
const finalVal = calcularNotaFinal(mediaParcial, recVal)
```
e remover import `arredondarNota` se não houver mais uso.

## Risco

Baixo — os utilitários `calcularMediaParcial`/`calcularNotaFinal`/`arredondarNota` têm suite de testes em `grades.test.ts`. O comportamento muda apenas no caso divergente (corrigindo o bug).