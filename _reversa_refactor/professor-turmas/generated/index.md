# Índice de Oportunidades — professor-turmas

> Contexto: `professor-turmas`
> Última atualização: `2026-09-09T19:10:00-03:00`

| # | ID | Verbo | Título | Confiança | Impacto | Custo | Estado |
|---|-----|-------|--------|-----------|---------|-------|--------|
| 1 | OPP-20260909-A1B2 | prune | Botões mortos btn-alertas-geral e btn-export-geral | 🟢 | UX confuso | low | applied |
| 2 | OPP-20260909-C3D4 | prune | Função loadAulasDaDisciplina nunca chamada | 🟢 | 63 linhas mortas + debug logs | low | applied |
| 3 | OPP-20260909-E5F6 | modularize | Arquivo monolítico 866 linhas | 🟡 | Manutenção difícil | medium | applied |
| 4 | OPP-20260909-F7G8 | simplify | Cálculo de média do export PDF diverge de grades-utils (bug) | 🟢 | PDF com situação errada (Reprovado em vez de Aprovado) | low | applied |
| 5 | OPP-20260909-H8I9 | simplify | Alerta de matrícula tardia mira ID errado e nunca renderiza | 🟢 | Feedback perdido para o professor | low | applied |
| 6 | OPP-20260909-J1K2 | standardize | getPerfil duplicado em 6 arquivos (15 ocorrências) | 🟢 | Risco de divergência | low | applied |
| 7 | OPP-20260909-L3M4 | standardize | 79 estilos inline vs classes CSS padrão | 🟡 | Consistência visual e tema | medium | applied |
| 8 | OPP-20260909-N5O6 | evolve | Conflitos de escrita multi-professor exigem realtime + merge | 🟡 | Perda de trabalho e divergência entre abas | high | proposed |

## Ordem de ataque

1. ~~**OPP-1** (prune botões)~~ → **aplicado**
2. ~~**OPP-2** (prune função morta)~~ → **aplicado**
3. ~~**OPP-4** (bug de média no PDF)~~ → **aplicado**
4. ~~**OPP-5** (alerta não renderiza)~~ → **aplicado**
5. ~~**OPP-3** (modularize)~~ → **aplicado** — view-orquestrador + 4 módulos + tipos
6. ~~**OPP-6** (getPerfil helper)~~ → **aplicado** — `extrairPerfilPrimeiro` + 4 testes
7. ~~**OPP-7** (inline styles)~~ → **aplicado** — classes `.pt-*` em main.css
8. **OPP-8** (realtime/concorrência) → **proposta**, candidata a `/reversa-forward`

## Resumo

- 2 **prune** aplicados (76 linhas removidas)
- 2 **simplify** de bugs reais aplicados (PDF e alerta)
- 2 **standardize** aplicados (getPerfil helper + inline styles → classes)
- 1 **modularize** aplicado (monolito 942 → view 259 + 4 módulos + tipos)
- 1 **evolve** proposto (realtime/merge para conflitos multi-professor)
- Nenhuma alteração de regra de negócio