---
schema_version: 1
id: OPP-20260909-F7G8
verb: simplify
state: applied
safety_net:
  kind: existing
  green_before: true
  green_after: true
preservation:
  method: tests
  evidence: ["CHG-001.diff", "before.ts", "after.ts"]
measurement:
  before: "5 linhas de cálculo manual divergente de grades-utils no handler de export PDF"
  after: "2 linhas reutilizando calcularMediaParcial + calcularNotaFinal; comportamento alinhado à UI"
change_set:
  - chg: CHG-001
    file: src/views/professor-turmas.ts
    purpose: "Substitui cálculo manual de média/final no export PDF por calcularMediaParcial/calcularNotaFinal de grades-utils, corrigindo divergência quando rec=0"
approval:
  by: user
  at: 2026-09-09T18:08:00-03:00
reversible_via: ["CHG-001.diff"]
---

## O que foi feito

No handler `.btn-export-pdf` (dentro de `ProfessorTurmasView`):

**Antes:**
```ts
let mediaParcial = arredondarNota((n1Val + n2Val + n3Val) / 3);
let finalVal = mediaParcial;
if (mediaParcial < 7) {
  finalVal = arredondarNota((mediaParcial + recVal) / 2);
}
const status = calcularStatusAluno(finalVal);
```

**Depois:**
```ts
const mediaParcial = arredondarNota(calcularMediaParcial(n1Val, n2Val, n3Val));
const finalVal = calcularNotaFinal(mediaParcial, recVal);
const status = calcularStatusAluno(finalVal);
```

## Por que corrige o bug

`calcularNotaFinal` retorna `arredondarNota(mediaParcial)` quando `rec <= 0`, em vez de dividir por 2. Exemplo concreto: média 6.5, rec 0.

- Antes: `(6.5 + 0) / 2 = 3.25` → 3.5 → **Reprovado** no PDF
- Depois: `calcularNotaFinal(6.5, 0) = arredondarNota(6.5) = 6.5` → **Aprovado** (alinhado à tela)

## Rede de segurança

- `npm run type-check` → verde antes e depois
- `npm test` → 314 passed / 4 failed (4 falhas pré-existentes inalteradas, baseline)
- `grades.test.ts` cobre `calcularMediaParcial`/`calcularNotaFinal`, que agora são a fonte única do cálculo