# Roadmap: Logo da Instituição nos Documentos PDF e na Barra Lateral de Navegação

> Identificador: `007-logo-instituicao-docs-nav`
> Data: `2026-09-07`
> Requirements: `_reversa_forward/007-logo-instituicao-docs-nav/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A implementação central da feature já existe no legado e está comitted (commits `d2d6850`, `120eee5`, `24b0888`). Verificação direta do código:

- `getPDFHeader()` (`src/lib/instituicao-service.ts:161-196`) já converte `/logo.png` para data URL quando `inst.logo_url` é null/vazio e, se o `fetch` falhar, retorna `logo_url: null` — cobre RF-01, RF-02 e RF-06.
- Os 7 PDFs (Boletim, Declaração, Declaração de Vínculo, Histórico, Termo de Acordo, Diário de Classe e Ata de Resultados Finais) passam por `_renderHeader` → `_renderLogo` (proporção preservada) — cobre RF-01, inclusive a Ata da feature 008 (`src/lib/pdf-service.ts:1059`).
- A sidebar (`src/views/dashboard.ts:102-106`) já usa `<img src="/logo.png" class="sidebar-logo">` com fallback SVG via `onerror` e preserva o texto "Secretaria CSM" — cobre RF-03 e RF-04.

O delta real do pipeline é: (1) fechar RF-05 — a logo permanece 44×44 no estado colapsado, mas a decisão de esclarecimento exige versão 32×32; (2) adicionar testes unitários que fixam os critérios de aceite Gherkin (fallback de `getPDFHeader`, proporção de `_renderLogo`, logo na Ata); (3) corrigir no requirements o contexto desatualizado sobre o fallback (linha que afirmava sua ausência).

## 2. Princípios aplicados

Não há `.reversa/principles.md` no projeto — o `/reversa-principles` ainda não foi executado. Nenhum princípio registrado para confrontar; nenhum conflito reportado.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Reusar a implementação já comitted no legado (sem reescrever `_renderHeader`, `_renderLogo`, `getPDFHeader`, markup da sidebar) | A reversa valida o que existe; reimplementar duplica lógica e arrisca regressão visual | Reimplementar do zero em novo componente (descartada: duplicação, custo, risco) | 🟢 |
| D-02 | Fechar RF-05 via regra CSS `.sidebar.collapsed .sidebar-logo { width: 32px; height: 32px; }` em `src/styles/main.css` | Estado colapsado já centraliza `.sidebar-brand` (64px); basta reduzir a logo; não toca markup nem JS | Esconder a logo quando colapsada (descartada: contradiz decisão 2a do esclarecimento); novo componente de logo (overkill) | 🟢 |
| D-03 | Adicionar testes unitários: (a) `getPDFHeader()` — fallback `/logo.png` → data URL e falha → `logo_url: null`; (b) `_renderLogo` — 0 sem logo, largura proporcional com data URL, 0 em erro de imagem; (c) cabeçalho da Ata desenha a logo | Fixa os cenários Gherkin (RF-02/RF-06 e RF-01 p/ Ata) sem abrir navegador; jsdom já fornece Blob/FileReader/fetch | E2E Playwright (descartado por custo: fallbacks unitários cobrem os critérios); teste de snapshot de PDF (frágil) | 🟢 |
| D-04 | Sem mudança no modelo de dados nem migração — `logo_url` já existe na tabela `instituicao`; RLS de `instituicao-assets` já vigente (commit `d2d6850`) | A feature é apresentação + uso de asset existente (`public/logo.png`) | Ampliar schema para múltiplas logos (descartado: fora de escopo) | 🟢 |
| D-05 | Corrigir o contexto do requirements.md (linha sobre `instituicao-service.ts` "sem fallback para /logo.png") apontando o estado atual do código | Mantém o documento da feature coerente com o legado; evita inconsistência que o `/reversa-audit` ou `/reversa-quality` flagraria como CRITICAL | Deixar como está (descartado: documento factualmente incorreto) | 🟢 |

## 4. Premissas

Nenhuma. Não há marcador `[DÚVIDA]` pendente no requirements (sessão de esclarecimentos de 2026-09-07 zerou).

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Documents · Cabeçalho PDF (`_renderHeader`/`_renderLogo`) | `src/lib/pdf-service.ts` | regra-alterada (validação) | Já desenha logo proporcional nos 7 documentos; o pipeline adiciona testes de proporção e da Ata |
| Documents · Fallback de logo (`getPDFHeader`) | `src/lib/instituicao-service.ts` | regra-alterada (validação) | Já implementa fallback `/logo.png` e tolerância a falha; adicionar testes de sucesso e falha |
| Documents · Testes de fallback | `src/lib/instituicao-service.test.ts` (novo) | componente-novo | Cobrir conversão `/logo.png` → data URL e `logo_url: null` em falha |
| UI · Sidebar (RF-05) | `src/views/dashboard.ts` + `src/styles/main.css` | regra-alterada | Markup já aprovado; falta a regra CSS 32×32 no estado colapsado |

## 6. Delta no modelo de dados

- Resumo: nenhuma mudança de schema, campos ou tabelas.
- Detalhe completo em: `_reversa_forward/007-logo-instituicao-docs-nav/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| `GET /logo.png` (origem única, `public/`) | arquivo estático same-origin | n/a — `fetch` interno ao `getPDFHeader`; sem contrato externo novo |

Nenhum contrato externo (HTTP de terceiros, fila, gRPC) é afetado. Não há diretório `interfaces/` — omitido por não haver contrato externo a documentar.

## 8. Plano de migração

n/a — sem migração de banco, dados ou schema. O único artefato novo de deploy é a regra CSS e os arquivos de teste.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Teste de `getPDFHeader` sensível a jsdom (FileReader/fetch) | médio | médio | Ambiente é jsdom v29 (fornece Blob/FileReader); se instável, usar `vi.stubGlobal` p/ fetch retornando `Response` com Blob |
| Regra CSS 32×32 conflitar com `object-fit`/largura 64px da colapsada | baixo | médio | Usar `object-fit: contain` e validar visualmente no onboarding; largura 64px acomoda 44px (expandida) e 32px (colapsada) |
| Cache `_cachedHeader` mascarar troca de logo em runtime | baixo | baixo | Comportamento pré-existente (cache de sessão, `clearCache` no logout); registrar em `regression-watch.md` |
| Regressão visual da Ata (008) ao mexer em `_renderLogo` | médio | médio | Ata usa o mesmo `_renderHeader`; rodar a suite completa de testes e conferir o PDF no onboarding |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] RF-05 fechado: `.sidebar.collapsed .sidebar-logo` em 32×32
- [ ] Testes novos verdes: fallback `getPDFHeader` (data URL e falha→null), `_renderLogo` (0/sem logo e proporcional), logo na Ata
- [ ] `npm run type-check` e `npm run test` sem novas regressões (as 4 falhas pré-existentes documentadas se mantêm)
- [ ] `legacy-impact.md` e `regression-watch.md` gerados
- [ ] Requisitos RF-01, RF-02, RF-06 confirmados contra o código comitted (sem alteração produtiva)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-07 | Versão inicial gerada por `/reversa-plan` | reversa |
| 2026-09-07 | Implementação concluída por `/reversa-coding`: RF-05 fechado (CSS 32×32 colapsada), 9 testes novos verdes (fallback `getPDFHeader`, `_renderLogo`, logo na Ata), type-check limpo, sem regressões novas | reversa |