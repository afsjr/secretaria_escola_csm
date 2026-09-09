---
schema_version: 1
id: BUG-20260908-F74E
display_number: 2
title: "PDF de notas da disciplina exporta Declaração de Matrícula em vez do relatório"
status: resolved
phase: patching
severity: medium
priority: P1
created: 2026-09-08
updated: 2026-09-08
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
    - "src/views/professor-turmas.ts:465"
    - "src/lib/pdf-service.ts:358"
  root_cause:
    state: hypothesized
    hypothesis: "O handler do botão de exportação de PDF por disciplina (btn-export-pdf) em professor-turmas.ts chama generateDeclaracaoPDF, que renderiza 'DECLARAÇÃO DE MATRÍCULA', em vez de um gerador do relatório de notas da disciplina."
    causal_path: []
    evidence: []
    code_refs: []

spec_verdict: spec-gap

closure:
  policy: local-software
  satisfied: true
  resolution_kind: fixed
---

# PDF de notas da disciplina exporta Declaração de Matrícula em vez do relatório

## Summary

No Painel do Professor, o botão **PDF** de cada disciplina (class `btn-export-pdf`, legenda "PDF")
exporta um arquivo `notas_<disciplina>.pdf`, mas o **conteúdo** do PDF é o documento
"DECLARAÇÃO DE MATRÍCULA" (comprovante de matrícula). O handler chama
`PDFService.generateDeclaracaoPDF({ nome_completo: 'Relatório de Notas', email: '' }, turmaInfo, { marcaCopia: true })`
que renderiza sempre o template de Declaração de Matrícula, em vez de um relatório de notas da
disciplina. Confirmado pelo usuário com a disciplina Psicologia Aplicada
(`notas_Psicologia_Aplicada.pdf` com conteúdo de declaração de matrícula).

## Expected Behavior

Ao clicar em **PDF** ao lado de uma disciplina no Painel do Professor, o usuário deve baixar um PDF
contendo o relatório de notas daquela disciplina: identificação da disciplina/turma e tabela por
aluno com faltas, N1, N2, N3, média, recuperação, nota final e status — coerente com a tabela de
lançamento exibida na tela (`professor-turmas.ts`). O download deve continuar nomeado
`notas_<disciplina>.pdf`.

## Actual Behavior

- Arquivo baixado: `notas_Psicologia_Aplicada.pdf` (nome correto).
- Conteúdo do PDF: título "DECLARAÇÃO DE MATRÍCULA" e texto de comprovante de matrícula
  (cabeçalho institucional, "Declaramos, para os devidos fins, que o(a) aluno(a)...").
- Nenhuma nota/frequência/status é exibida no documento.

## Steps to Reproduce

1. Acessar o Painel do Professor (`src/views/professor-turmas.ts`).
2. Abrir uma turma com disciplinas e selecionar a aba "Lançar Notas".
3. Numa disciplina (ex.: Psicologia Aplicada), clicar no botão **PDF**
   (`btn-export-pdf`, `professor-turmas.ts:200`).
4. Observar o download de `notas_Psicologia_Aplicada.pdf` com conteúdo de
   **DECLARAÇÃO DE MATRÍCULA**.

## Evidence

- Análise estática de `src/views/professor-turmas.ts:464-479`: o handler monta `notasData`
  (linhas 405-446), busca `turmaInfo` (449-462) e gera o PDF com
  `PDFService.generateDeclaracaoPDF(...)` (465-474), cuja implementação renderiza
  "DECLARAÇÃO DE MATRÍCULA" (`src/lib/pdf-service.ts:403`).
- Relato do usuário: "pedi um pdf de psicologia e o documento foi notas_Psicologia_Aplicada.pdf"
  — o conteúdo exibido não era o relatório de notas, e sim o comprovante de matrícula.
- Imagem anexada pelo usuário não pôde ser visualizada (modelo sem suporte a imagem);
  a análise textual é consistente com a causa estática.

## Suspected Area

- `src/views/professor-turmas.ts:465` (papel do bug): chamada errada de gerador de PDF.
- Causa raiz provável: uso indevido de `generateDeclaracaoPDF` para emitir um relatório de notas;
  o gerador correto deveria reproduzir o conteúdo da tabela de lançamento da disciplina.

## Acceptance Criteria

- [ ] O botão **PDF** da disciplina exporta um documento com o relatório de notas da disciplina
      (não mais "DECLARAÇÃO DE MATRÍCULA").
- [ ] O relatório contém identificação da disciplina/turma e a tabela de alunos (faltas, N1, N2,
      N3, média, rec, final, status) ou equivalente fiel aos dados da tela.
- [ ] O nome do arquivo `notas_<disciplina>.pdf` permanece inalterado.
- [ ] Demais emissores de PDF (Declaração, Boletim, Histórico, etc.) não sofrem regressão.
- [ ] Suite existente (Vitest) permanece sem novas falhas (baseline: 303 passados, 4 falhas
      pré-existentes não relacionadas).

## Traceability

- **Spec efetiva:** não definida para o export PDF do professor. O comportamento esperado é
  inferido do contrato da tela (relatório de notas da disciplina). Rótulo `spec-gap` aplicado;
  o veredito de spec fica para a decisão do fix.
- **Código afetado (onde aparece):** `src/views/professor-turmas.ts:465`, `:200`.
- **Código suspeito (causa):** `src/lib/pdf-service.ts:358` (`generateDeclaracaoPDF`);
  ausência de um `generateRelatorioNotasDisciplinaPDF` (ou equivalente).

## Resolution

**Fechado por:** /reversa-debugger-fix (rota expressa) em 2026-09-08.

**Causa raiz (estado: hypothesized).** O handler `btn-export-pdf` em `professor-turmas.ts:465` chamava
`generateDeclaracaoPDF` — que renderiza "DECLARAÇÃO DE MATRÍCULA" — em vez de um gerador de relatório
de notas da disciplina. Não havia `generateRelatorioNotasDisciplinaPDF` no `PDFService`.

**Veredito de spec: `spec-gap`** (decisão humana). A spec do módulo professor não definia a
exportação de PDF do relatório de notas; o comportamento observado na tela de lançamento tornou-se a
referência. Gerado adendo `bug-20260908-F74E-v001.md` registrando RQ-01/02/03.

**Resolution kind: `fixed`.**

### Change set

| CHG | Kind | Artefato | Propósito |
|-----|------|----------|-----------|
| CHG-001 | code | `src/lib/pdf-service.ts` | Nova função `generateRelatorioNotasDisciplinaPDF` com cabeçalho institucional, tabela autoTable e status colorido |
| CHG-002 | code | `src/views/professor-turmas.ts` | Handler `btn-export-pdf` agora chama `generateRelatorioNotasDisciplinaPDF` com `notasData` mapeado (inclui `nome`, `media_parcial`, `status`) |
| CHG-003 | test | `src/lib/pdf-service.test.ts` | 5 testes: payload válido, título "RELATÓRIO DE NOTAS", disciplina/turma/alunos na tabela, erro sem nome, erro sem alunos |

Diffs salvos em `fix/CHG-001.diff`, `fix/CHG-002.diff` e `fix/CHG-003.diff`.

### Testes

- **Reprodução/regressão:** `npx vitest run src/lib/pdf-service.test.ts`.
  - Verde: 5 testes novos passando (generateRelatorioNotasDisciplinaPDF).
- **Suite completa:** `npm test` → 303 passados / 4 falhas pré-existentes (baseline preservado), nenhuma regressão nova.

Nenhum dado histórico afetado (não houve `data_impact`); adendo de spec gerado separadamente em
`_reversa_sdd/addenda/bug-20260908-F74E-v001.md`.

## Agent Notes

- Rota expressa (`express: true`): registro mínimo + correção na mesma passada.
- Severidade `medium` e prioridade `P1` ASSUMIDAS na rota expressa (funcionalidade de exportação
  quebrada de forma determinística gerando documento oficial errado; sem risco de dados);
  revisar na primeira execução completa do /reversa-debugger.
- `spec-gap`: a spec do módulo professor (`_reversa_sdd/professor/requirements.md`) não define
  o requisito de exportação de PDF do relatório de notas; o fix precisa decidir o veredito de
  spec (spec-gap ou spec-correta com comportamento implícito).
- Obs.: o botão "Exportar PDF Geral" (`btn-export-geral`, linha 156) não possui handler
  registrado em `professor-turmas.ts` (candidato a defeito/feature separado; fora deste bug).