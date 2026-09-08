# Legacy Impact: Logo da Instituição nos Documentos PDF e na Barra Lateral de Navegação

> Identificador: `007-logo-instituicao-docs-nav`
> Data: `2026-09-07`
> Política de edição do legado no momento da execução: `allowLegacyEdits: true`, `allowedPaths: ["src/**"]` — todos os arquivos tocados casam com a política.

## Arquivos afetados

| Arquivo | Componente | Tipo | Severidade | Justificativa |
|---------|------------|------|------------|---------------|
| `src/lib/instituicao-service.test.ts` (novo) | Documents · `getPDFHeader` (fallback) | componente-novo | LOW | Fixa por teste o fallback `/logo.png` (RF-02) e a tolerância a falha (RF-06) já implementados no commit `24b0888` |
| `src/lib/pdf-service.test.ts` | Documents · `PDFService._renderLogo`/`_renderHeader` | regra-alterada (teste) | LOW | Adiciona cobertura de proporção real da logo e do cabeçalho da Ata (RF-01); mock de jsPDF ganhou `getImageProperties` |
| `src/styles/main.css` | UI · Sidebar (estado colapsado) | regra-alterada | LOW | Fecha RF-05: logo 32×32 e fallback SVG 24×24 no `.sidebar.collapsed` (antes permanecia 44×44) |

## Diff conceitual por componente

**Documents · InstituicaoService.getPDFHeader:** comportamento produtivo inalterado — o fallback `/logo.png` e o retorno `logo_url: null` em falha já existiam comitted. O delta é cobertura de teste (4 casos).

**Documents · PDFService._renderLogo/_renderHeader:** comportamento produtivo inalterado. O delta é teste que fixa a proporção (largura = razão real × 0.55 do altura do header) e confirma que a Ata desenha a logo quando presente.

**UI · Sidebar:** única mudança produtiva da feature: duas regras CSS para o estado colapsado (logo 32×32, fallback SVG 24×24). O markup `dashboard.ts` e o JS de toggle permanecem intocados.

## Preservadas

Regras 🟢 de `_reversa_sdd/domain.md` que continuam válidas e intactas:

- RB14 (Requisitos de Conclusão e Emissão de Certificados) — nada aqui altera requisitos de emissão.
- RB15 (Acesso de Alunos ao Boletim somente leitura) — a logo é apresentação, não altera acesso.
- RB16 (Notificações de Documentos no Header) — o header do dashboard (notificações) não foi tocado.
- RB09 (Disciplinas com estágio têm lógica separada) e RB13 (sistema de avaliação por tipo de curso) — fluxos de nota dos documentos preservados.

## Modificadas

Nenhuma regra de domínio foi alterada ou removida. As mudanças são de apresentação (CSS) e de cobertura (testes).