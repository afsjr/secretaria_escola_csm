---
schema_version: 1
id: BUG-20261001-RFHD
display_number: 4
title: "Ata de Resultados Finais não exibe o nome dos alunos (linhas de aluno em branco)"
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

area: documentos
module: documents
feature: emissao-documentos-pdf
labels: []

visibility: normal
security_suspected: false

reproduction:
  classification: deterministic
  rate: "1/1"
  suspected_triggers: []

blocking: []

relationships: []

traceability:
  specs:
    - "_reversa_forward/008-ata-resultados-finais/requirements.md#rf-04"
    - "_reversa_forward/008-ata-resultados-finais/requirements.md#rf-06"
  affected_code:
    - "src/lib/pdf-service.ts:1098"
    - "src/lib/pdf-service.ts:1102"
  root_cause:
    state: confirmed
    hypothesis: "Em generateAtaResultadosPDF, a linha de cabeçalho de cada aluno é enviada ao jspdf-autotable como objeto solto ({ colSpan: 8, content: '...' }). O autotable só renderiza o conteúdo de uma linha com colSpan quando a linha é um array de células; o objeto solto gera uma linha vazia, omitindo o nome do aluno."
    causal_path:
      - "getDadosAtaTurma retorna os 29 alunos (verificado)"
      - "body do autoTable recebe 29 linhas de aluno como objetos soltos (verificado)"
      - "jspdf-autotable ignora o content do objeto solto e desenha a linha vazia"
      - "PDF final não exibe o nome de nenhum aluno (0 em 33 páginas)"
    evidence:
      - ref: evidence/reproduction.md
        observation: "Experimento de controle: objeto solto -> linha vazia; array [{content,colSpan}] -> conteúdo renderizado"
      - ref: evidence/ata-pagina1-linhas-aluno-vazias.png
        observation: "Linha de aluno em branco logo abaixo do cabeçalho da tabela"
    code_refs:
      - file: src/lib/pdf-service.ts
        symbol: generateAtaResultadosPDF
        commit: null
  reproduction_tests:
    - src/lib/pdf-service.test.ts
  regression_tests:
    - src/lib/pdf-service.test.ts

spec_verdict: spec-correta

change_set:
  - id: CHG-001
    kind: code
    artifact: src/lib/pdf-service.ts
    purpose: "Envolver a linha de aluno em um array de células [{ content, colSpan, styles }] para o autotable renderizar o nome"
    diff: fix/CHG-001.diff
  - id: CHG-002
    kind: test
    artifact: src/lib/pdf-service.test.ts
    purpose: "Regressão: garantir que a linha de aluno é um array de células com colSpan (nome renderizável)"
    diff: fix/CHG-002.diff

closure:
  policy: local-software
  satisfied: true
resolution_kind: fixed
---

# Ata de Resultados Finais não exibe o nome dos alunos (linhas de aluno em branco)

## Summary

Na emissão da **Ata de Resultados Finais** (aba Gestão de Turmas), o PDF é gerado e
lista os componentes curriculares de cada aluno, mas a **linha de identificação do aluno
(nome, situação final e frequência geral) sai em branco**. O usuário percebeu que "não
estão aparecendo todas as pessoas matriculadas na turma" — na prática, **nenhum** nome de
aluno é exibido. Reproduzido na turma `Enfermagem - Noite - 2026/2027` (29 matriculados).

## Expected Behavior

Conforme `_reversa_forward/008-ata-resultados-finais/requirements.md`:

- **RF-04** — a tabela de resultados finais contém, entre outras colunas, o **nome completo
  do aluno**.
- **RF-06** — ao estourar uma página, a tabela quebra com cabeçalho repetido, preservando
  a identificação de cada aluno.

Cada aluno deve aparecer identificado por uma linha de cabeçalho com o nome completo,
a situação final e a frequência geral, seguida das linhas dos componentes curriculares.

## Actual Behavior

- O PDF é gerado sem erro e contém todos os componentes.
- As linhas de cabeçalho de aluno são renderizadas **vazias** (sem nome, situação ou
  frequência).
- Resultado: impossível identificar a quem pertencem as notas; o documento oficial perde
  validade.
- Verificado: `getDadosAtaTurma` retorna os 29 alunos e o `body` contém 29 linhas de aluno;
  a perda ocorre na renderização.

## Steps to Reproduce

1. Acessar a aba **Gestão de Turmas** e selecionar a turma `Enfermagem - Noite - 2026/2027`.
2. Clicar em **Emitir Ata de Resultados Finais**.
3. Abrir o PDF gerado.
4. Observar que, acima de cada bloco de componentes, a linha do aluno está em branco.

## Evidence

- `evidence/ata-pagina1-linhas-aluno-vazias.png` — página 1 renderizada, com a linha de
  aluno em branco logo abaixo do cabeçalho da tabela.
- `evidence/reproduction.md` — método de reprodução, extração de texto (0 nomes de aluno
  em 33 páginas) e experimento de controle que isola a causa.

## Suspected Area

- `src/lib/pdf-service.ts:1098` (`generateAtaResultadosPDF`): montagem do `body` da tabela.
- Linha problemática (registrar como objeto solto):

  ```ts
  body.push({
    colSpan: 8,
    styles: { fontStyle: 'bold', fontSize: 8, fillColor: [245, 245, 250], textColor: [60, 60, 60] },
    content: `${idx + 1}. ${aluno.nome_completo}  —  Situação Final: ${aluno.situacao_final}`,
  })
  ```

  O `jspdf-autotable` descarta o `content` de um objeto que não é array; a forma correta é
  uma célula dentro de um array: `body.push([{ content, colSpan: 8, styles }])`.

## Acceptance Criteria

- [ ] O PDF da Ata exibe o nome completo de cada aluno matriculado na turma.
- [ ] A linha de aluno continua mostrando a situação final e a frequência geral.
- [ ] O restante do documento (cabeçalho, componentes, rodapé, assinaturas, legenda) não
      sofre regressão.
- [ ] Teste de regressão garante que a linha de aluno é um array de células com `colSpan`.
- [ ] `npm test` e `npm run type-check` sem novas falhas (baseline: 4 falhas pré-existentes).

## Traceability

- **Spec efetiva:** `_reversa_forward/008-ata-resultados-finais/requirements.md#rf-04`
  (nome completo do aluno na tabela) e `#rf-06` (paginação preservando a identificação).
- **Código afetado (onde aparece):** `src/lib/pdf-service.ts:1098` e `:1102`.
- **Causa raiz (onde nasceu):** montagem do `body` em `generateAtaResultadosPDF`; linha de
  aluno passada como objeto solto ao `jspdf-autotable`.

## Resolution

**Fechado por:** /reversa-debugger-fix (rota expressa) em 2026-10-01.

**Causa raiz (estado: confirmed).** Em `generateAtaResultadosPDF`
(`src/lib/pdf-service.ts:1103`), a linha de cabeçalho de cada aluno era passada ao
`jspdf-autotable` como objeto solto `{ colSpan: 8, content: '...' }`. O autotable só
renderiza o conteúdo de uma linha com `colSpan` quando a linha é um **array de células**;
com o objeto solto, a linha é desenhada vazia. Como consequência, o nome de **todos** os
alunos era omitido da Ata (0 nomes em 33 páginas).

Evidência do caminho causal: `getDadosAtaTurma` retornou 29 alunos e o `body` 29 linhas de
aluno; o experimento de controle (mesmo conteúdo como objeto solto x array) isolou a causa.

**Veredito de spec: `spec-correta`** (decisão humana). A feature `008-ata-resultados-finais`
já define `RF-04` (nome completo do aluno na tabela) e `RF-06` (paginação preservando a
identificação); o código divergiu. Nenhum adendo é necessário.

**Resolution kind: `fixed`.**

### Change set

| CHG | Kind | Artefato | Propósito |
|-----|------|----------|-----------|
| CHG-001 | code | `src/lib/pdf-service.ts` | Linha de aluno passa a ser `[{ content, colSpan, styles }]` |
| CHG-002 | test | `src/lib/pdf-service.test.ts` | Regressão: linha de aluno é array de células com `colSpan` |

Diffs em `fix/CHG-001.diff` e `fix/CHG-002.diff`.

### Testes

- **Reprodução/regressão:** `npx vitest run src/lib/pdf-service.test.ts`.
  - Vermelho antes do fix: `linhaAluno` era `undefined` (linha não era array).
  - Verde depois: 24/24 testes passando, incluindo o novo.
- **Prova real:** pipeline `getDadosAtaTurma` + `generateAtaResultadosPDF` para a turma
  `Enfermagem - Noite - 2026/2027`; o texto extraído do PDF passou a conter ALUNA A,
  ALUNA B, ALUNA C, ANDREA, STEPHANE e "Situação Final".
- **Suíte completa:** `npm test` -> 349 passados / 4 falhas pré-existentes
  (`GerenciarAlunosTab` x3, `secretaria` x1), nenhuma regressão nova.
- **Tipos:** `npm run type-check` limpo.

Nenhum dado histórico afetado (não houve `data_impact`); nenhum adendo de spec.

## Agent Notes

- Rota expressa (`express: true`): registro mínimo + correção na mesma passada.
- Severidade `high` e prioridade `P1` assumidas na rota expressa: o defeito atinge um
  documento oficial e torna inviável identificar os alunos.
- Sintoma secundário relatado no mesmo intake (aluno não vê as próprias notas por
  **duplicatas ativas sem CPF/CPF divergente**) tem causa distinta e será registrado
  separadamente.
- Anomalia adicional observada: turma `Flebotomia - Maio - 2026` (18 matriculados) tem
  **0 componentes na matriz** do curso; a Ata aborta com "Nenhum componente curricular
  cadastrado na matriz do curso". Fora do escopo deste bug.
