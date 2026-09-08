# Actions: Logo da Instituição nos Documentos PDF e na Barra Lateral de Navegação

> Identificador: `007-logo-instituicao-docs-nav`
> Data: `2026-09-07`
> Roadmap: `_reversa_forward/007-logo-instituicao-docs-nav/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 6 |
| Paralelizáveis (`[//]`) | 4 |
| Maior cadeia de dependência | 4 |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Verificação de pré-voo (sem alteração): confirmar presença de `public/logo.png` (613KB) e que `getPDFHeader()` (`instituicao-service.ts:161-196`), `_renderHeader`/`_renderLogo` (`pdf-service.ts:87-147`) e o markup da sidebar (`dashboard.ts:102-110`) já atendem RF-01/02/03/04/06; capturar baseline rodando `npm run type-check` e `npm test` e anotando as 4 falhas pré-existentes já documentadas | - | `[//]` | `public/logo.png` | 🟢 | `[X]` |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T002 | Criar `src/lib/instituicao-service.test.ts` (TDD do fallback RF-02/RF-06): mock de `./supabase` (`getInstituicao`) e stub de `fetch`; (a) instituição sem `logo_url` + `fetch('/logo.png')` ok → `logo_url` vira data URL `data:image/png;base64,...`; (b) `fetch` rejeitado → `logo_url: null`; (c) `response.ok` falso → `logo_url: null` | T001 | `[//]` | `src/lib/instituicao-service.test.ts` | 🟢 | `[X]` |
| T003 | Adicionar em `src/lib/pdf-service.test.ts` testes de `_renderLogo`/cabeçalho/Ata: estender o mock de jsPDF com `getImageProperties`; (a) `_renderLogo` retorna 0 sem `logo_url`; (b) com `data:` retorna largura proporcional e chama `addImage`; (c) erro de imagem → 0; (d) `generateAtaResultadosPDF` com `getPDFHeader` mockado com `logo_url` → `addImage` chamada (logo presente na Ata) | T001 | `[//]` | `src/lib/pdf-service.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T004 | Fechar RF-05: adicionar regra `.sidebar.collapsed .sidebar-logo { width: 32px; height: 32px; }` em `src/styles/main.css` mantendo `object-fit: contain` (estado colapsado já centraliza `.sidebar-brand` em 64px); ajustar, se necessário, o tamanho do `.sidebar-logo-fallback` no estado colapsado | T001 | `[//]` | `src/styles/main.css` | 🟡 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Executar `npm run type-check` e `npm test`; confirmar que os testes novos (T002/T003) estão verdes e que não há regressões além do baseline registrado em T001 (4 falhas pré-existentes) | T002, T003, T004 | - | `src/` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T006 | Fechar critério de pronto: confirmar RF-05 aplicado, atualizar o histórico do `roadmap.md` e registrar nas notas de execução as observações de cache (`_cachedHeader`/`sessionStorage`), do CSS colapsado e da validação visual pendente de humano via onboarding.md | T005 | - | `_reversa_forward/007-logo-instituicao-docs-nav/roadmap.md` | 🟢 | `[X]` |

## Notas de execução

- T001: baseline capturado — type-check limpo; 4 falhas pré-existentes confirmadas (GerenciarAlunosTab ×3 e secretaria ×1), mesmo cenário documentado na feature 008.
- T002: `instituicao-service.test.ts` criado com mock do `./supabase` via `vi.hoisted`/`mockFrom` e `vi.stubGlobal('fetch')`; jsdom fornece Blob/FileReader — conversão para data URL funcionou sem stubs extras.
- T003: mock de jsPDF ganhou `getImageProperties` (retornando 100×100 por padrão). O teste da Ata com logo exigiu `vi.resetModules()` + import fresco porque o `_cachedHeader` do módulo já havia sido populado por testes anteriores — `mockResolvedValueOnce` caso contrário jamais seria consumido.
- T004: regras `.sidebar.collapsed .sidebar-brand img.sidebar-logo { 32×32 }` e `.sidebar.collapsed .sidebar-brand .sidebar-logo-fallback { 24×24 }` adicionadas em `src/styles/main.css`; nenhuma mudança em markup/JS da sidebar.
- T005: `npm run type-check` limpo; `npm test` — 303 passed (294 baseline + 9 novos), 4 falhas pré-existentes mantidas (mesmos 2 arquivos), zero regressões novas.
- Validação visual (logo 32×32 na sidebar colapsada e PDFs com logo) fica a cargo de humano via `onboarding.md`.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-07 | Versão inicial gerada por `/reversa-to-do` | reversa |