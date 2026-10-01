---
schema_version: 1
id: BUG-20261001-MALE
display_number: 6
title: "Alunos com matrícula tardia somem do lançamento de notas e do PDF do professor"
status: resolved
phase: patching
severity: high
priority: P1
created: 2026-10-01
updated: 2026-10-01
express: true

origin:
  type: manual-report
  external_ref: null

area: docente
module: professor
feature: emissao-documentos-pdf
labels:
  - spec-gap

visibility: normal
security_suspected: false

reproduction:
  classification: deterministic
  rate: "1/1"
  suspected_triggers: []

blocking: []

relationships: []

traceability:
  specs: []
  affected_code:
    - "src/views/professor-turmas-notas.ts:89"
    - "src/views/professor-turmas-notas.ts:105"
  root_cause:
    state: confirmed
    hypothesis: "loadAlunosDaDisciplina filtra fora os alunos cujo boletim tem status='pendente' (matrícula tardia), mostrando-os só como alerta. Como a tabela '.notas-tbody' é a fonte do PDF (professor-turmas-pdf.ts lê as linhas DOM), esses alunos somem também do PDF — e o professor não tem como lançar a nota deles pela tela."
    causal_path:
      - "Matrícula após data_fim da oferta marca boletim.status='pendente' (gestao-turmas.ts verificarPendencias)"
      - "loadAlunosDaDisciplina exclui alunos pendentes do tbody (linhas 89-99)"
      - "PDF do professor lê as linhas do tbody (professor-turmas-pdf.ts)"
      - "Aluno não aparece no lançamento nem no PDF"
    evidence:
      - ref: evidence/reproduction.md
        observation: "Teste: aluno pendente não entra no tbody; 4 alunas reais com status=pendente"
    code_refs:
      - file: src/views/professor-turmas-notas.ts
        symbol: loadAlunosDaDisciplina
        commit: null
  reproduction_tests:
    - src/views/professor-turmas-notas.test.ts
  regression_tests:
    - src/views/professor-turmas-notas.test.ts

spec_verdict: spec-gap

change_set:
  - id: CHG-001
    kind: code
    artifact: src/views/professor-turmas-notas.ts
    purpose: "Exibe alunos com matrícula tardia na tabela (com selo) em vez de escondê-los; mantém o alerta"
    diff: fix/CHG-001.diff
  - id: CHG-002
    kind: test
    artifact: src/views/professor-turmas-notas.test.ts
    purpose: "Regressão: aluno pendente aparece no tbody (e no PDF), trancado não"
    diff: fix/CHG-002.diff
  - id: CHG-003
    kind: specification
    artifact: _reversa_sdd/addenda/bug-20261001-MALE-v001.md
    purpose: "Especifica que aluno de matrícula tardia permanece visível e lançável, marcado"
    diff: fix/CHG-003.md

closure:
  policy: local-software
  satisfied: true
resolution_kind: fixed
---

# Alunos com matrícula tardia somem do lançamento de notas e do PDF do professor

## Summary

No Painel do Professor, a lista de **Lançar Notas** de uma disciplina não mostra os alunos
marcados como "matrícula tardia" (`boletim.status='pendente'`). Como o **PDF do relatório de
notas** é montado a partir das linhas dessa tabela, esses alunos também ficam de fora do PDF.
Na turma `Enfermagem - Noite - 2026/2027` isso atinge 4 alunas (CAMILLY, GISELA, JANEICLEIDE e
JULIANA), algumas já com notas gravadas.

## Expected Behavior

O aluno de matrícula tardia deve **permanecer visível** na tabela de lançamento (identificado
por um selo "matrícula tardia"), para o professor poder consultar e lançar notas, e deve constar
do PDF. O aviso de "matrícula tardia" continua sendo exibido.

## Actual Behavior

- `loadAlunosDaDisciplina` remove do `tbody` todo aluno cujo boletim tenha `status='pendente'`.
- O aluno aparece apenas como aviso ("N aluno(s) com matrícula tardia"), sem linha, sem nome e
  sem campos de nota.
- O PDF (`professor-turmas-pdf.ts`), que lê `.notas-tbody`, omite esse aluno.
- Não há caminho na tela para lançar a nota dele.

## Steps to Reproduce

1. Como professor, abrir um painel de turma com disciplina concluída antes da matrícula de um aluno.
2. Em "Lançar Notas", observar que o aluno com matrícula tardia não aparece na lista.
3. Clicar em **PDF** da disciplina: o aluno também não consta.

## Evidence

- `evidence/reproduction.md` — teste de regressão e contagem real (4 alunas com `status='pendente'`).

## Suspected Area

- `src/views/professor-turmas-notas.ts:89` a `:105` (filtro de pendentes no `tbody`).
- `src/views/professor-turmas-pdf.ts` (lê as linhas do `tbody`).

## Acceptance Criteria

- [x] Aluno de matrícula tardia aparece na tabela de lançamento, com selo visual.
- [x] O PDF passa a incluir esses alunos.
- [x] Aluno com matrícula não ativa continua fora.
- [x] Teste de regressão em `professor-turmas-notas.test.ts`.

## Traceability

- **Spec efetiva:** nenhuma. Comportamento nunca especificado -> `spec-gap`; adendo aditivo
  `_reversa_sdd/addenda/bug-20261001-MALE-v001.md`.
- **Código afetado (onde aparece):** `src/views/professor-turmas-notas.ts:89`.
- **Causa raiz (onde nasceu):** filtro de pendentes no `tbody` + PDF dependente do DOM.

## Resolution

**Fechado por:** /reversa-debugger-fix (rota expressa) em 2026-10-01.

**Causa raiz (estado: confirmed).** `loadAlunosDaDisciplina` excluía do `tbody` os alunos com
`boletim.status='pendente'`; o PDF do professor lê o `tbody`, então também os omitia. A regra de
"matrícula tardia" era intencional, mas o efeito de esconder o aluno virou beco sem saída.

**Veredito de spec: `spec-gap`** (decisão humana). Adendo aditivo
`_reversa_sdd/addenda/bug-20261001-MALE-v001.md`.

**Resolution kind: `fixed`.**

### Change set

| CHG | Kind | Artefato | Propósito |
|-----|------|----------|-----------|
| CHG-001 | code | `src/views/professor-turmas-notas.ts` | Lista o aluno tardio (com selo) e mantém o alerta |
| CHG-002 | test | `src/views/professor-turmas-notas.test.ts` | Regressão do filtro |
| CHG-003 | specification | `_reversa_sdd/addenda/bug-20261001-MALE-v001.md` | Especifica a visibilidade do matrícula tardia |

### Testes

- Reprodução/regressão: `npx vitest run src/views/professor-turmas-notas.test.ts`
  - Vermelho antes: aluno pendente ausente do `tbody`.
  - Verde depois: aluno pendente presente, com selo; aluno trancado fora.

## Agent Notes

- Rota expressa: registro mínimo + correção na mesma passada.
- Proposta de taxonomia: feature `emissao-documentos-pdf` ficou aproximada; o defeito é da tela
  de lançamento de notas (`professor-turmas`).
- Dívida correlata: `salvarNota` não limpa `status='pendente'`; mesmo após lançar notas, o aluno
  segue contado no alerta de matrícula tardia. Tratado aqui apenas como sinalização (o aluno já
  fica visível e lançável).
