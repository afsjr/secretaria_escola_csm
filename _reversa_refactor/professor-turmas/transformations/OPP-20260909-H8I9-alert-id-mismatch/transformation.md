---
schema_version: 1
id: OPP-20260909-H8I9
verb: simplify
state: applied
safety_net:
  kind: existing
  green_before: true
  green_after: true
preservation:
  method: tests
  evidence: ["CHG-001.diff", "before.ts", "after.ts"]
change_set:
  - chg: CHG-001
    file: src/views/professor-turmas.ts
    purpose: "Corrige seletor do alerta de matrícula tardia (#base_id → #oferta_id) e escopa verificarAlertasBaixa/recalcularMedia no container"
approval:
  by: user
  at: 2026-09-09T18:08:00-03:00
reversible_via: ["CHG-001.diff"]
---

## O que foi feito

1. **Seletor do alerta de matrícula tardia** (linha ~572): `#alertas-${disciplina_base_id}` → `#alertas-${disciplinaId}`. O template cria `<div id="alertas-${disc.id}">`, então o ID da oferta (`disciplinaId`) é o correto. O alerta "⚠️ N aluno(s) com matrícula tardia" voltou a renderizar.

2. **Escopo dos alertas no container**:
   - `verificarAlertasBaixa(tbody, disciplinaId, container)` — `document.getElementById` → `container.querySelector`, evitando colisão de IDs entre múltiplas views montadas
   - `recalcularMedia(tbody, disciplinaId, container)` — mesma mudança de assinatura
   - Três call sites atualizados: save handler (linha 366), loadAlunosDaDisciplina (linha 589) e recalcularMedia (linha 661)

## Rede de segurança

- `npm run type-check` → verde antes e depois
- `npm test` → 314 passed / 4 failed (4 falhas pré-existentes inalteradas, baseline)
- O alerta de média baixa (que já funcionava via `disciplinaId`) serve como oráculo: usa exatamente o mesmo seletor `#alertas-${disciplinaId}` agora convergente com o template.