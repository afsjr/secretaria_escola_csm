# Investigation: Logo da Instituição nos Documentos PDF e na Barra Lateral de Navegação

> Identificador: `007-logo-instituicao-docs-nav`
> Data: `2026-09-07`
> Fase: `/reversa-plan`

## 1. Estado de partida

A investigação começou com a suspeita de que a feature já estivesse implementada no legado. Confirmação via histórico git:

| Commit | Data | Conteúdo |
|--------|------|----------|
| `d2d6850` | 2026-09-06 | "geração de documentos com logo": conversão HTTP→base64 para `logo_url` no `instituicao-service.ts`, migração RLS `instituicao-assets` |
| `120eee5` | 2026-09-06 | "ajuse emissao documento": ajustes em `pdf-service.ts` (emissão com logo) |
| `24b0888` | 2026-09-07 | "logo proporcional nos documentos e sidebar": `_renderLogo` proporcional, fallback `/logo.png` em `getPDFHeader`, `<img src="/logo.png">` na sidebar com fallback SVG, CSS `.sidebar-logo`, versionamento do `requirements.md` da 007 |

O estado comitted já cobre RF-01 a RF-04 e RF-06. Restam RF-05 (CSS colapsada) e cobertura de testes.

## 2. Pontos de implementação mapeados

### 2.1 Fallback de logo nos PDFs — `src/lib/instituicao-service.ts:161-196`

`getPDFHeader()`:
1. Busca a instituição (cache de sessão em `sessionStorage`, chave `sge_instituicao`).
2. Converte `inst.logo_url` HTTP para base64 via `fetch` + `FileReader` (se não for `data:`).
3. Se `logoBase64` continuar vazio, faz `fetch('/logo.png')` — sucesso vira data URL, falha (catch ou `!response.ok`) deixa `null`.
4. Retorna `{ ..., logo_url: logoBase64, cor_primaria }`.

Esse fluxo já satisfaz RF-02 (fallback) e RF-06 (fetch falho → `logo_url: null`, PDF sem logo, sem erro).

### 2.2 Cabeçalho compartilhado — `src/lib/pdf-service.ts:87-147`

- `_renderHeader(doc, inst, pageWidth, marginLeft, title)` desenha o fundo colorido (altura 38), chama `_renderLogo`, posiciona o texto do cabeçalho deslocado pela largura da logo (`textX = inst.logo_url ? marginLeft + logoWidth + 5 : marginLeft`) e imprime o título do documento.
- `_renderLogo(doc, inst, marginLeft, headerHeight)` preserva a proporção: `logoTargetHeight = headerHeight * 0.55`, `logoWidth = (width/height) * logoTargetHeight`, `logoY` centraliza verticalmente; retorna 0 (sem logo ou erro de imagem).

Os 7 documentos passam por esse caminho: Boletim (`:176`), Declaração (`:377`), Declaração de Vínculo (`:475`), Histórico (`:583`), Termo de Acordo (`:778`), Diário de Classe (`:935`) e Ata de Resultados Finais (`:1059`, feature 008).

### 2.3 Sidebar — `src/views/dashboard.ts:102-110` + `src/styles/main.css`

Markup atual:
```html
<img src="/logo.png" alt="Logo CSM" class="sidebar-logo"
  onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';" />
<svg class="sidebar-logo-fallback" ... style="display:none;">...</svg>
<span>Secretaria CSM</span>
```
- RF-03: OK (imagem ao lado do texto, 44×44 por padrão).
- RF-04: OK (falha → esconde imagem, mostra SVG; texto é elemento independente e permanece).

CSS atual de colapso (`src/styles/main.css:773-790`): `.sidebar.collapsed` tem 64px, `.sidebar-brand` centraliza (`justify-content: center; gap: 0`), esconde `span` e `#sidebar-toggle`. A logo (`44px`) continua visível com o tamanho padrão — **falta a versão 32×32** (RF-05).

## 3. Alternativas avaliadas

| Caminho | Prós | Contras | Decisão |
|---------|------|---------|---------|
| Reimplementar a logo do zero | Controle total | Duplicação, custo, risco de regressão visual | Descartada |
| Esconder a logo na sidebar colapsada | Simples | Contradiz RF-05 (decisão 2a do esclarecimento) | Descartada |
| CSS dedicado `.sidebar.collapsed .sidebar-logo` (32×32) | Mínimo, não toca markup/JS, reutiliza `object-fit: contain` | Requer validação visual | **Adotada** |
| Testes unitários de fallback + `_renderLogo` | Fixam os Gherkin sem navegador | jsdom precisa de Blob/FileReader/fetch estáveis | **Adotada** (com `vi.stubGlobal` como contingência) |

## 4. Fontes e padrões

- **jsPDF `doc.addImage`**: exige data URL ou canvas; formato nativo para raster. Referência: docs jsPDF v2 (`addImage(imageData, format, x, y, w, h)`).
- **Padrão data URL via `FileReader.readAsDataURL`**: já usado no legado em `instituicao-service.ts`; mantido no fallback para consistência.
- **Fallback de imagem via `onerror` + elemento irmão**: padrão DOM leve, sem JS extra; já adotado no login (`src/views/login.ts:19,49`).
- **Cache de sessão** (`_cachedHeader` em `pdf-service.ts:7`, `sessionStorage` em `instituicao-service`): comportamento pré-existente; o fallback herda o mesmo ciclo de vida.

## 5. Conclusão

O delta real é enxuto: fechar RF-05 (uma regra CSS), adicionar testes unitários (fallback `getPDFHeader`, `_renderLogo`, logo na Ata) e corrigir o contexto desatualizado do requirements. Nenhuma mudança produtiva em `_renderHeader`/`_renderLogo`/`getPDFHeader`/markup da sidebar é necessária para os RFs atuais, salvo achados do `/reversa-coding`.