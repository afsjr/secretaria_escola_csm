---
schema_version: 1
id: OPP-20260909-L3M4
display_number: 7
context: professor-turmas
verb: standardize
title: ~79 estilos inline no professor-turmas.ts que deveriam ser classes CSS
target:
  files: ["src/views/professor-turmas.ts", "src/styles/main.css"]
  symbol: "style="
smell: O template HTML usa style= inline em 79 pontos (padding, cores, layout repetidos), em vez de classes CSS reutilizáveis. Padrão dominante do projeto é CSS no main.css (var(--primary), .input, .btn, .badge já existem). Inline dificulta tema dark, responsividade e manutenção.
roi:
  confidence: yellow
  impact: Consistência visual e capacidade de tema; reduz duplicação (ex. padding:0.5rem repetido em 6 <td>)
  cost: medium
  est_return: Componentes padronizados; dark mode e responsivo funcionam sem retrabalho por view
state: applied
applied_at: 2026-09-09T18:40:00-03:00
transformation: "transformations/OPP-20260909-L3M4-inline-styles/transformation.md"
traceability:
  soul: ["auth: controle de acesso"]
  specs: ["professor/requirements.md"]
---

## Observado

`style=` aparece 79 vezes no arquivo. Padrões repetidos:
- `style="padding: 0.5rem;"` em 6 `<td>` da tabela de notas
- `style="width: 50px; text-align: center; padding: 0.3rem;"` em 5 `<input>`
- `style="padding: 1.5rem;"` no summary e no body do card
- Cores hardcoded (`#f0f4f8`, `#f8fafc`, `#2a4a7f`, `#DC2626`) fora dos tokens CSS

O projeto já tem tokens em `main.css` (`--primary`, `--secondary`, `--text-muted`, `--success`, `--danger`, `--radius-lg`, `--shadow-sm`).

## Transformação proposta

Criar classes em `main.css`: `.notas-table`, `.notas-input`, `.turma-summary`, `.alertas-box`, `.freq-list-row` etc. e substituir os `style=` no template. Juntar à OPP-3 (modularize) dentro da mesma janela, pois ambos tocam o arquivo inteiro.

## Risco

Médio — exige conferência visual antes/depois. Recomenda-se aplicar depois da OPP-4/OPP-5 (bug fixes) e junto da OPP-3, para não conflitar diffs.