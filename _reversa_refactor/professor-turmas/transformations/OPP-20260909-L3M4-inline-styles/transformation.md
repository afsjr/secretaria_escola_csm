---
schema_version: 1
id: OPP-20260909-L3M4
verb: standardize
state: applied
safety_net:
  kind: existing
  green_before: true
  green_after: true
preservation:
  method: tests
  evidence: ["CHG-001.diff", "before.ts", "after.css"]
measurement:
  before: "~79 style= inline no template (padding/cores/layout repetidos) e cores hardcoded (#f0f4f8, #f8fafc, #2a4a7f, #DC2626)"
  after: "0 style= dentro da view; classes .professor-turmas-view .pt-* em main.css usando tokens CSS; #DC2626 substituído por var(--danger)"
change_set:
  - chg: CHG-001
    file: src/styles/main.css
    purpose: "Adiciona 52 classes escopadas .professor-turmas-view .pt-* (header, cards, tabs, tabela, status, inputs, alertas, frequência) + media query 768px para tabs"
  - chg: CHG-001
    file: src/views/professor-turmas.ts
    purpose: "Remove todos os style= do template; template passa a usar apenas classes pt-* (seletores antigos .input-n1/.aluno-nome/[data-final] mantidos como ganchos JS)"
  - chg: CHG-001
    file: src/views/professor-turmas-notas.ts
    purpose: "renderLinhaAluno gera a linha de notas sem style=, com classes pt-td/pt-td-hl/pt-num-input/pt-status-ok/pt-status-fail"
  - chg: CHG-001
    file: src/views/professor-turmas-frequencia.ts
    purpose: "Bloco de frequência sem style=, com classes pt-freq-*"
approval:
  by: user
  at: 2026-09-09T18:40:00-03:00
reversible_via: ["CHG-001.diff"]
---

## O que foi feito

Todos os `style=` inline do template foram movidos para classes CSS escopadas
em `.professor-turmas-view .pt-*` no `main.css`, usando os tokens já existentes
(`--primary`, `--secondary`, `--danger`, `--success`, `--text-muted`,
`--warning-bg`, `--warning-text`, `--radius-lg`, `--shadow-sm`, `--white`).

Correspondências principais:

| Inline (antes) | Classe (depois) |
| --- | --- |
| `padding: 0.5rem` (6 `<td>`) | `.pt-td`, `.pt-td-center`, `.pt-td-hl` |
| `background: #f0f4f8; font-weight: bold` (média/final) | `.pt-td-hl`, `.pt-th-center-hl` |
| `width: 50px; text-align: center; padding: 0.3rem` (5 `<input>`) | `.pt-num-input` |
| `color: ${statusColor}` (green/red JS) | `.pt-status-ok` / `.pt-status-fail` (tokens) |
| Gradiente `var(--primary) → #2a4a7f` (summary) | `.pt-turma-summary` |
| `background: #f8fafc` (frequência) | `.pt-freq-box` |
| Abas/tab-content (legado `.tabs-container`/`.tab-btn`) | `.pt-tabs` / `.pt-tab-btn` / `.pt-tab-content` + media query 768px |

O hex `#DC2626` do status XSS-escapado saiu do template: a cor agora é
`var(--danger)` via classe.

## Rede de segurança

- `npm run type-check` → verde antes e depois
- `npm test` → 318 passed / 4 failed (baseline inalterada)
- Verificação pré-edição: tokens e classes base (`.tab-btn`, `.tab-enter`,
  `@keyframes fadeIn`, `.input`, `.btn-sm`, `.btn-primary`, `.badge`) já
  existiam em `main.css`

## Observações

- Executada na mesma janela que a OPP-20260909-E5F6 (monolith), conforme
  recomendado.
- `.pt-tabs` replica o comportamento do legado `.tabs-container` (flex, gap,
  fundo, border-radius, overflow-x, scrollbar oculto) sem reutilizar a classe
  legada, para não vazar estilos fora do escopo da view.