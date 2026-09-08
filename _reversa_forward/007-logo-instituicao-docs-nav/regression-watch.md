# Regression Watch: Logo da Instituição nos Documentos PDF e na Barra Lateral de Navegação

> Identificador: `007-logo-instituicao-docs-nav`
> Feature: `007-logo-instituicao-docs-nav`

## Itens de vigilância

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|-------------------------|-----------------------------|---------------------|-------------------|
| W001 | `src/lib/instituicao-service.ts` `getPDFHeader()` (RF-02 🟢) | Instituição sem `logo_url` no banco → `/logo.png` é convertido para data URL e usado no cabeçalho dos PDFs | presença | `logo_url` fica null/vazio mesmo com `public/logo.png` presente |
| W002 | `src/lib/instituicao-service.ts` `getPDFHeader()` (RF-06 🟢) | Se o `fetch('/logo.png')` falhar ou `response.ok` for falso, `logo_url` retorna null e o PDF é gerado normalmente, sem erro exibido | presença | Geração de PDF lança erro ou bloqueia por conta da logo |
| W003 | `src/lib/pdf-service.ts` `_renderLogo()` (RF-01 🟢) | Logo desenhada com proporção real (altura 55% do header, largura derivada de `width/height`) e texto do cabeçalho deslocado para a direita da logo | presença | Logo esticada/achatada ou texto sobrepondo a logo |

## Observações

Itens com confidência original 🟡 ou 🔴 — sem peso de regressão:

- **RF-05 (🟡)** — `.sidebar.collapsed .sidebar-logo` em 32×32 e `.sidebar-logo-fallback` em 24×24 (`src/styles/main.css`). Regra nova desta entrega; validada apenas visualmente por humano (ver `onboarding.md`), não coberta por teste unitário.

## Histórico de re-extrações

<!-- Preenchido pelo agente reverso quando `/reversa` rodar novamente sobre o código atualizado. -->

## Arquivadas

<!-- Watch items que deixaram de ser relevantes após mudanças posteriores. -->