# Cápsula de reprodução

- **Bug:** BUG-20260907-GBPJ (display 1)
- **Commit base:** 24b0888 (HEAD), working tree com artefatos 007/008 uncommitted
- **Branch:** (git status: sem branch destacada, padrão do repo)
- **Ambiente:** macOS (darwin), Node via projeto Vite/TypeScript, Vitest 4.1.6, jsdom
- **Classificação:** deterministic
- **Taxa:** 2/2 gravações (verde→bug simulado→verde)

## Reprodução estática (caminho causal)

1. `src/lib/pdf-service.ts:358` e `:456`: `generateDeclaracaoPDF`/`generateDeclaracaoVinculoPDF`
   são `async` (buscam a logo no header via `getPDFHeader`).
2. `src/components/Tabs/DocumentosTab.ts:134,137,154`: chamadas SEM `await` — `doc` recebe
   uma `Promise<jsPDF>`.
3. `src/components/Tabs/DocumentosTab.ts:162`: `PDFService.downloadPDF(doc, nomeArquivo)`.
4. `src/lib/pdf-service.ts:1330`: `downloadPDF` chama `doc.save(filename)` →
   `TypeError: doc.save is not a function` → capturado → `toast.error('Erro ao gerar documento: ' + err.message)`.

## Reprodução por teste (automática)

- Arquivo: `src/components/Tabs/DocumentosTab.test.ts`
- Técnica: mocks dos geradores `async` (fiéis ao comportamento real) + asserção de que
  `downloadPDF` recebe doc com `.save` e nome de arquivo.

### Vermelho (código com o defeito)

```text
npx vitest run src/components/Tabs/DocumentosTab.test.ts
Test Files  1 failed (1)
     Tests  2 failed | 13 passed (15)
- recebido: [Promise {}, "Declaração_de_..._pdf"]  (esperado doc com .save)
  → "deve gerar Declaração de Matrícula com dados do aluno" FALHOU
  → "deve gerar Declaração de Vínculo para não-aluno" FALHOU
```

### Verde (código corrigido)

```text
npx vitest run src/components/Tabs/DocumentosTab.test.ts
Test Files  1 passed (1)
     Tests  15 passed (15)
```

### Suite completa pós-correção

```text
npm test
Test Files  2 failed | 18 passed (20)      ← 2 arquivos de falhas PRÉ-EXISTENTES
     Tests  4 failed | 303 passed (307)    ← 4 falhas pré-existentes (GerenciarAlunosTab ×3, secretaria ×1)
```

Baseline pré-existente preservado: nenhuma falha nova, nenhuma regressão (compare com o baseline
da feature 007: 303 passados / 4 falhas pré-existentes).