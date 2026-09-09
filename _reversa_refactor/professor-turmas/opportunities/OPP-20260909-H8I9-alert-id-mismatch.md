---
schema_version: 1
id: OPP-20260909-H8I9
display_number: 5
context: professor-turmas
verb: simplify
title: Alerta de matrícula tardia mira elemento com ID errado (nunca renderiza)
target:
  files: ["src/views/professor-turmas.ts"]
  symbol: loadAlunosDaDisciplina
smell: O template cria `<div id="alertas-${disc.id}">` (linha 222, disc.id = ID da oferta), mas o alerta de matrícula tardia busca `#alertas-${disciplina_base_id}` (linha 575). IDs diferentes → o alerta nunca aparece. Adicionalmente, verificarAlertasBaixa usa document.getElementById global (linha 671) em vez de escopar no container, arriscando colisão entre views.
roi:
  confidence: green
  impact: Feedback perdido para o professor — aviso de aluno(s) com matrícula tardia (Falta cursar) nunca é exibido
  cost: low
  est_return: Alerta volta a funcionar; consistência no escopo de query (container em vez de document)
state: proposed
traceability:
  soul: ["academic: lançamento de notas"]
  specs: ["professor/requirements.md"]
---

## Observado

- Template: `<div id="alertas-${disc.id}" ...>` → `disc.id` é ID da oferta `turma_disciplinas`
- Alerta matrícula tardia: `container.querySelector(`#alertas-${(disc as any).disciplina_base_id || disciplinaId}`)` → usa `disciplina_base_id`, que é diferente de `disc.id` na maioria dos casos
- `verificarAlertasBaixa` (linha 671): `document.getElementById(`alertas-${disciplinaId}`)` — funciona porque `disciplinaId` = `disc.id`, mas usa escopo global

## Transformação proposta

1. Trocar a busca do alerta de matrícula tardia para `#alertas-${disciplinaId}` (igual ao template)
2. Passar `container` para `verificarAlertasBaixa` e usar `container.querySelector` no lugar de `document.getElementById`

## Risco

Baixo — mudança restrita a seletores de DOM. Os alertas de média baixa (que já funcionam via `disciplinaId`) servem de oráculo de comparação.