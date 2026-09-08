# Adendo: Logo da Instituição nos Documentos PDF e na Barra Lateral de Navegação

> Identificador: `007-logo-instituicao-docs-nav`
> Data: `2026-09-07T18:32:00-03:00`
> Cenário: legado

## Vigência

Vigente desde 2026-09-07.

## Resumo da entrega

Adiciona o logotipo institucional (`public/logo.png`) ao cabeçalho dos 7 PDFs (Boletim, Declaração, Declaração de Vínculo, Histórico, Termo de Acordo, Diário de Classe e Ata de Resultados Finais) e à barra lateral do dashboard. A implementação central já existia comitted no legado (commits `d2d6850`, `120eee5`, `24b0888`); o pipeline fechou o gap RF-05 (logo 32×32 na sidebar colapsada), adicionou 9 testes (fallback `getPDFHeader`, proporção `_renderLogo`, logo na Ata) e corrigiu contexto desatualizado no requirements. 6/6 ações concluídas.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/architecture.md` | `#módulos-principais` (Documents) | componente-novo | `instituicao-service.test.ts` novo fixa o fallback `/logo.png` (RF-02) e a tolerância a falha com `logo_url: null` (RF-06) |
| `_reversa_sdd/architecture.md` | `#módulos-principais` (Documents) | regra-alterada | `PDFService._renderLogo/_renderHeader` agora têm proporção real fixada por teste (largura da logo derivada de `width/height` × 0.55 do header) e cobertura da Ata com logo |
| `_reversa_sdd/architecture.md` | `#camadas` (Presentation Layer) | regra-alterada | Sidebar do dashboard: estado colapsado exibe a logo em 32×32 e o fallback SVG em 24×24 (`src/styles/main.css`) |

Regras de domínio RB14, RB15 e RB16 (`_reversa_sdd/domain.md`) preservadas — nenhuma regra de domínio alterada ou removida.

## Regras sob vigilância

- W001, W002, W003 — ver `_reversa_forward/007-logo-instituicao-docs-nav/regression-watch.md`

## Fontes

- `_reversa_forward/007-logo-instituicao-docs-nav/legacy-impact.md`
- `_reversa_forward/007-logo-instituicao-docs-nav/regression-watch.md`
- `_reversa_forward/007-logo-instituicao-docs-nav/requirements.md`
- `_reversa_forward/007-logo-instituicao-docs-nav/actions.md`
- `_reversa_forward/007-logo-instituicao-docs-nav/progress.jsonl`