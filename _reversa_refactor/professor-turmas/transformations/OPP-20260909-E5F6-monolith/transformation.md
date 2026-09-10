---
schema_version: 1
id: OPP-20260909-E5F6
verb: modularize
state: applied
safety_net:
  kind: existing
  green_before: true
  green_after: true
preservation:
  method: tests
  evidence: ["CHG-001.diff", "before.ts", "after.ts"]
measurement:
  before: "1 arquivo monolítico com 942 linhas e 6 responsabilidades"
  after: "1 view-orquestrador (259 linhas) + 4 módulos coesos (notas, frequência, alertas, pdf) + 1 arquivo de tipos compartilhados"
change_set:
  - chg: CHG-001
    file: src/views/professor-turmas.ts
    purpose: "Reescrito como orquestrador: container .professor-turmas-view, agrupamento por turma, abas Notas/Frequência; delega renderização e handlers aos módulos"
  - chg: CHG-001
    file: src/views/professor-turmas-types.ts
    purpose: "Novo — tipos compartilhados DisciplinaTurma, TurmaGroup, NotaExistente, AlunoBaixaMedia"
  - chg: CHG-001
    file: src/views/professor-turmas-notas.ts
    purpose: "Novo — renderLinhaAluno, loadAlunosDaDisciplina, recalcularMedia, bindSalvarNotas"
  - chg: CHG-001
    file: src/views/professor-turmas-frequencia.ts
    purpose: "Novo — loadFrequenciaAlunos, carregarFrequenciaExistente"
  - chg: CHG-001
    file: src/views/professor-turmas-alertas.ts
    purpose: "Novo — verificarAlertasBaixa"
  - chg: CHG-001
    file: src/views/professor-turmas-pdf.ts
    purpose: "Novo — bindExportPdfButtons"
approval:
  by: user
  at: 2026-09-09T18:40:00-03:00
reversible_via: ["CHG-001.diff"]
---

## O que foi feito

O monolito de 942 linhas foi dividido em módulos com responsabilidade única:

| Módulo | Responsabilidade | Funções exportadas |
| --- | --- | --- |
| `professor-turmas-notas.ts` | Lançamento de notas | `renderLinhaAluno`, `loadAlunosDaDisciplina`, `recalcularMedia`, `bindSalvarNotas` |
| `professor-turmas-frequencia.ts` | Frequência | `loadFrequenciaAlunos`, `carregarFrequenciaExistente` |
| `professor-turmas-alertas.ts` | Alertas de média baixa | `verificarAlertasBaixa` |
| `professor-turmas-pdf.ts` | Exportação PDF | `bindExportPdfButtons` |
| `professor-turmas-types.ts` | Tipos compartilhados | `DisciplinaTurma`, `TurmaGroup`, `NotaExistente`, `AlunoBaixaMedia` |
| `professor-turmas.ts` | Orquestração/view | `ProfessorTurmasView` |

A view mantém o mesmo DOM e os mesmos seletores/handlers (`.pt-tab-btn`,
`#tab-<id>`, `.btn-salvar-notas`, `.btn-salvar-frequencia`, `.btn-export-pdf`),
apenas delegando a renderização e os bindings aos módulos.

## Rede de segurança

- `npm run type-check` → verde antes e depois
- `npm test` → 318 passed / 4 failed (4 falhas pré-existentes inalteradas,
  baseline)
- Comportamento observável preservado: mesma estrutura DOM, mesmo fluxo de
  eventos de abas/notas/frequência/alerta/PDF

## Observações

- Executada na mesma janela que a OPP-20260909-L3M4 (inline-styles), conforme
  recomendado, pois ambas tocam o arquivo inteiro.
- Código morto previsto na OPP (loadAulasDaDisciplina, btn-alertas-geral,
  btn-export-geral) não faz parte desta transformação; ficou fora do escopo
  aprovado e pode ser tratado por uma PRUNE futura.