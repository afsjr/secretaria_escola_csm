---
schema_version: 1
id: OPP-20260909-E5F6
display_number: 3
context: professor-turmas
verb: modularize
title: professor-turmas.ts com 942 linhas e múltiplas responsabilidades
target:
  files: ["src/views/professor-turmas.ts"]
  symbol: "ProfessorTurmasView, loadAlunosDaDisciplina, recalcularMedia, verificarAlertasBaixa, loadFrequenciaAlunos, carregarFrequenciaExistente"
smell: Arquivo monolítico com 942 linhas acumulando: renderização de view, gerenciamento de notas, cálculo de médias, alertas, frequência, exportação PDF, e handlers de eventos. Responsabilidades misturadas dificultam manutenção e testes.
roi:
  confidence: yellow
  impact: Manutenção mais difícil — qualquer mudança em notas afeta frequência e vice-versa; dificuldade de testar isoladamente
  cost: medium
  est_return: Módulos menores e coesos, mais fáceis de testar e manter
state: applied
applied_at: 2026-09-09T18:40:00-03:00
transformation: "transformations/OPP-20260909-E5F6-monolith/transformation.md"
traceability:
  soul: ["academic: lançamento de notas"]
  specs: ["professor/requirements.md"]
---

## Observado

O arquivo acumula 6 responsabilidades:
1. **View rendering** — HTML do container e cabeçalho
2. **Grade management** — loadAlunosDaDisciplina, recalcularMedia, salvar notas
3. **Alert system** — verificarAlertasBaixa (média baixa)
4. **Frequency** — loadFrequenciaAlunos, carregarFrequenciaExistente
5. **PDF export** — handler btn-export-pdf
6. **Dead code** — loadAulasDaDisciplina, btn-alertas-geral, btn-export-geral

## Transformação proposta

Extrair para módulos separados:
- `professor-turmas-notas.ts` — lógica de notas (loadAlunosDaDisciplina, recalcularMedia, salvarNotas)
- `professor-turmas-frequencia.ts` — lógica de frequência
- `professor-turmas-alertas.ts` — verificarAlertasBaixa
- `professor-turmas-pdf.ts` — handler de exportação PDF
- `professor-turmas.ts` — orquestração e view principal

## Risco

Médio — requer refatoração cuidadosa para preservar o fluxo de eventos. Recomenda executar PRUNE (OPP-1 e OPP-2) antes, para reduzir a superfície.
