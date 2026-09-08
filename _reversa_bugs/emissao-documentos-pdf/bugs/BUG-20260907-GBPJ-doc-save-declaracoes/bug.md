---
schema_version: 1
id: BUG-20260907-GBPJ
display_number: 1
title: Geração de Declaração de Matrícula e Declaração de Vínculo falha com doc.save is not a function
status: resolved
phase: patching
severity: medium
priority: P1
created: 2026-09-07
updated: 2026-09-08
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
    - "_reversa_sdd/addenda/007-logo-instituicao-docs-nav.md#resumo-da-entrega"
  affected_code:
    - "src/components/Tabs/DocumentosTab.ts:134"
    - "src/components/Tabs/DocumentosTab.ts:137"
    - "src/components/Tabs/DocumentosTab.ts:154"
    - "src/components/Tabs/DocumentosTab.ts:162"
    - "src/lib/pdf-service.ts:358"
    - "src/lib/pdf-service.ts:456"
    - "src/lib/pdf-service.ts#downloadPDF"
  root_cause:
    state: confirmed
    hypothesis: "Os geradores `generateDeclaracaoPDF`/`generateDeclaracaoVinculoPDF` tornaram-se `async` quando a feature de logo (commits d2d6850, 120eee5, 24b0888) passou a buscar o cabeçalho institucional; o caller `DocumentosTab.ts` não foi atualizado e chamava sem `await`, atribuindo uma Promise a `doc`, e `downloadPDF` invocava `doc.save` sobre a Promise."
    causal_path:
      - "src/lib/pdf-service.ts:358 / :456 — geradores `async` (buscam logo via getPDFHeader)"
      - "src/components/Tabs/DocumentosTab.ts:134/137/154 — chamadas SEM `await` (doc = Promise)"
      - "src/components/Tabs/DocumentosTab.ts:162 — PDFService.downloadPDF(doc, ...)"
      - "src/lib/pdf-service.ts:1330 (downloadPDF) — doc.save(filename) sobre uma Promise → TypeError"
    evidence:
      - ref: "evidence/reproduction.md"
        observation: "Reprodução estática do caminho causal + teste vermelho (Promise recebida no downloadPDF) → verde com o fix"
    code_refs:
      - file: "src/lib/pdf-service.ts"
        symbol: "generateDeclaracaoPDF"
        commit: "24b0888"
      - file: "src/lib/pdf-service.ts"
        symbol: "generateDeclaracaoVinculoPDF"
        commit: "24b0888"
      - file: "src/components/Tabs/DocumentosTab.ts"
        symbol: "gerarDocumento"
        commit: "working tree"
  reproduction_tests:
    - "src/components/Tabs/DocumentosTab.test.ts (Declaração de Matrícula / Declaração de Vínculo com mocks async)"
  regression_tests:
    - "src/components/Tabs/DocumentosTab.test.ts — downloadPDF recebendo doc com `.save` (objectContaining) e nome de arquivo; mocks `async` pegam caller sem await"

spec_verdict: spec-correta

change_set:
  - id: CHG-001
    kind: code
    artifact: src/components/Tabs/DocumentosTab.ts
    purpose: "Acrescenta `await` nas chamadas aos geradores async de Declaração de Matrícula/Vínculo (linhas 134, 137, 154)"
    diff: fix/CHG-001.diff
  - id: CHG-002
    kind: test
    artifact: src/components/Tabs/DocumentosTab.test.ts
    purpose: "Mocks dos geradores passam a ser `async` e a asserção de downloadPDF exige doc com `save`, de modo que um caller sem await seja pego pelos testes"
    diff: fix/CHG-002.diff

closure:
  policy: local-software
  satisfied: true
  resolution_kind: fixed
---

# Geração de Declaração de Matrícula e Declaração de Vínculo falha com doc.save is not a function

## Summary

Na aba "Gerar Documento", os tipos "Declaração de Matrícula" e "Declaração de Vínculo" falham com
o toast `Erro ao gerar documento: doc.save is not a function`. As chamadas aos geradores
(`generateDeclaracaoPDF`, `generateDeclaracaoVinculoPDF`) não fazem `await` mesmo os geradores sendo
`async`; o `downloadPDF` então tenta chamar `doc.save` numa Promise.

## Expected Behavior

Segundo a spec efetiva (`_reversa_sdd/addenda/007-logo-instituicao-docs-nav.md#resumo-da-entrega`,
RF-01), os 7 PDFs incluindo Declaração (de Matrícula) e Declaração de Vínculo devem ser gerados com
o cabeçalho institucional e baixados de forma normal: clicar em "Gerar Documento" deve disparar o
download do PDF com a logo. O gerador é `async` (precisa buscar a logo), portanto a chamada de
download só pode acontecer após a Promise resolver.

## Actual Behavior

- Toast de erro: `Erro ao gerar documento: doc.save is not a function`.
- Nenhum download acontece.
- Ocorre com "Declaração de Matrícula" (aluno) e "Declaração de Vínculo" (funcionário/secretaria).
- Histórico Acadêmico e Boletim, na mesma tela, funcionam (usam `await`).

## Steps to Reproduce

1. Abrir a aba "Documentos" da área de gestão / perfil (componente `DocumentosTab`).
2. Selecionar "Declaração de Matrícula" (perfil aluno) ou "Declaração de Vínculo".
3. Clicar em "Gerar Documento".
4. Observar o toast `Erro ao gerar documento: doc.save is not a function` e nenhum arquivo baixado.

## Evidence

- Causa observada estática em `src/components/Tabs/DocumentosTab.ts`:
  - linha 134 `doc = PDFService.generateDeclaracaoVinculoPDF(userData)` (sem `await`)
  - linha 137 `doc = PDFService.generateDeclaracaoPDF(userData, turmaInfo)` (sem `await`)
  - linha 154 `doc = PDFService.generateDeclaracaoVinculoPDF(userData)` (sem `await`)
  - linha 162 `PDFService.downloadPDF(doc, nomeArquivo)` chama `doc.save` quando `doc` é Promise
- Contraste: linhas 144 e 150 usam `await gerarHistorico(...)` / `await gerarBoletim(...)`.
- Geradores async confirmados em `src/lib/pdf-service.ts:358` e `:456`.
- Sem anexo fornecido (print não enviado).

## Suspected Area

- `src/components/Tabs/DocumentosTab.ts` (papel do bug): casos 134/137/154 sem `await`.
- Causa raiz provável: quando a feature de logo tornou os geradores `async` na geração de documentos
  (commits `d2d6850`, `120eee5`, `24b0888`), este caller não foi atualizado.
- O teste `src/components/Tabs/DocumentosTab.test.ts` mascara a falha porque os mocks de
  `generateDeclaracaoPDF` e `generateDeclaracaoVinculoPDF` retornam `{ save: vi.fn() }` de forma
  síncrona, sem exercitar o fluxo async real.

## Acceptance Criteria

- [ ] "Declaração de Matrícula" baixa o PDF com a logo (aluno com matrícula ativa).
- [ ] "Declaração de Vínculo" baixa o PDF com a logo.
- [ ] Sem mudança de comportamento nos demais documentos (Boletim, Histórico, etc.).
- [ ] Teste de reprodução falha no estado atual e passa após o change set (ou equivalente que
      prove o fluxo async do caller).
- [ ] Teste de regressão protege o caller de voltar a chamar sem `await`.
- [ ] Suite existente (Vitest) continua verde (baseline: 303 passados, 4 falhas pré-existentes
      não relacionadas).

## Traceability

- **Spec efetiva:** `_reversa_sdd/addenda/007-logo-instituicao-docs-nav.md#resumo-da-entrega`
  (Adendo 007, RF-01: 7 PDFs com logo; inclui Declaração e Declaração de Vínculo).
- **Código afetado (onde aparece):** `src/components/Tabs/DocumentosTab.ts:134,137,154,162`.
- **Código suspeito (causa):** `src/lib/pdf-service.ts:358` (`generateDeclaracaoPDF`),
  `:456` (`generateDeclaracaoVinculoPDF`), `downloadPDF`.
- **Causa raiz:** 🟢 **CONFIRMADO** — chamadas sem `await` aos geradores `async` (línea causal
  registrada no front matter). Commit de origem da regressão: `24b0888` (logo nos documentos).
- **Testes de reprodução/regressão:** `src/components/Tabs/DocumentosTab.test.ts` (prova vermelho→verde
  e protege o caller contra voltar a chamar sem `await`).

## Resolution

**Fechado por:** /reversa-debugger-fix (rota expressa) em 2026-09-08.

**Causa raiz (estado: confirmed).** Quando a feature de logo (commits `d2d6850`, `120eee5`, `24b0888`)
tornou `generateDeclaracaoPDF` (`pdf-service.ts:358`) e `generateDeclaracaoVinculoPDF`
(`pdf-service.ts:456`) funções `async` (buscam o cabeçalho institucional via `getPDFHeader`), o
caller `DocumentosTab.ts` não foi atualizado: linhas 134, 137 e 154 chamavam sem `await`, atribuindo
uma `Promise<jsPDF>` a `doc`; em `downloadPDF` (`pdf-service.ts:1330`) `doc.save(...)` era invocado
sobre a Promise → `TypeError: doc.save is not a function` → `toast.error`. Os testes mascavam o
defeito porque os mocks dos geradores retornavam `{ save: vi.fn() }` de forma síncrona.

**Veredito de spec: `spec-correta`** (decisão humana). A spec efetiva (adendo 007, RF-01) já definia
que os 7 PDFs — incluindo Declaração e Declaração de Vínculo — devem ser gerados com a logo e
baixados normalmente. O código divergiu da spec; nenhuma mudança de spec é necessária
(nenhum adendo gerado).

**Resolution kind: `fixed`.**

### Change set

| CHG | Kind | Artefato | Propósito |
|-----|------|----------|-----------|
| CHG-001 | code | `src/components/Tabs/DocumentosTab.ts` | `await` nas 3 chamadas aos geradores async de Declaração |
| CHG-002 | test | `src/components/Tabs/DocumentosTab.test.ts` | Mocks `async` + asserção de `downloadPDF` recebendo doc com `save`, pegando caller sem `await` |

Diffs salvos em `fix/CHG-001.diff` e `fix/CHG-002.diff` (código + testes juntos).

### Testes

- **Reprodução/regressão:** `npx vitest run src/components/Tabs/DocumentosTab.test.ts`.
  - Vermelho (código com o defeito): 2 falhas — declarações recebendo `[Promise, nome]`.
  - Verde (código corrigido): 15 passados.
- **Suite completa:** `npm test` → 303 passados / 4 falhas pré-existentes (GerenciarAlunosTab ×3,
  secretaria ×1), nenhuma regressão nova — baseline preservado.
- Re-executado e confirmado em 2026-09-08: `DocumentosTab.test.ts` 15/15 verde; suite 303/307.

Nenhum dado histórico afetado (não houve `data_impact`); nenhuma alteração de spec; processos de
matrícula/auditoria/RBAC intactos.

## Agent Notes

- Rota expressa (`express: true`): registro mínimo + correção na mesma passada.
- Severidade `medium` e prioridade `P1` ASSUMIDAS na rota expressa (funcionalidade central de
  documentos quebrada de forma determinística, sem risco de dados); revisar na primeira execução
  completa do /reversa-debugger.
- Proposta de taxonomia: feature `emissao-documentos-pdf` já semeada em `taxonomy.yaml`.
- O mock síncrono em `DocumentosTab.test.ts` oculta o defeito: o fix deve avaliar se o teste de
  regressão deve atualizar o mock para `async` (retornar Promise) de modo que um caller sem `await`
  passe a ser pego pelos testes.
- Não alterar as 4 falhas pré-existentes de GerenciarAlunosTab/secretaria (fora do escopo).