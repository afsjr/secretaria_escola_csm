# Índice de Oportunidades — professor-turmas

> Contexto: `professor-turmas`
> Última atualização: `2026-09-09T17:50:00-03:00`

| # | ID | Verbo | Título | Confiança | Impacto | Custo | Estado |
|---|-----|-------|--------|-----------|---------|-------|--------|
| 1 | OPP-20260909-A1B2 | prune | Botões mortos btn-alertas-geral e btn-export-geral | 🟢 | UX confuso | low | applied |
| 2 | OPP-20260909-C3D4 | prune | Função loadAulasDaDisciplina nunca chamada | 🟢 | 63 linhas mortas + debug logs | low | applied |
| 3 | OPP-20260909-E5F6 | modularize | Arquivo monolítico 866 linhas | 🟡 | Manutenção difícil | medium | proposed |
| 4 | OPP-20260909-F7G8 | simplify | Cálculo de média do export PDF diverge de grades-utils (bug) | 🟢 | PDF com situação errada (Reprovado em vez de Aprovado) | low | applied |
| 5 | OPP-20260909-H8I9 | simplify | Alerta de matrícula tardia mira ID errado e nunca renderiza | 🟢 | Feedback perdido para o professor | low | applied |
| 6 | OPP-20260909-J1K2 | standardize | getPerfil duplicado em 6 arquivos (15 ocorrências) | 🟢 | Risco de divergência | low | proposed |
| 7 | OPP-20260909-L3M4 | standardize | 79 estilos inline vs classes CSS padrão | 🟡 | Consistência visual e tema | medium | proposed |

## Ordem sugerida de ataque

1. ~~**OPP-1** (prune botões)~~ → **aplicado**
2. ~~**OPP-2** (prune função morta)~~ → **aplicado**
3. ~~**OPP-4** (bug de média no PDF)~~ → **aplicado**
4. ~~**OPP-5** (alerta não renderiza)~~ → **aplicado**
5. **OPP-3** (modularize) → próximo, reduzir o monolito
6. **OPP-6** (getPerfil helper) → baixo risco, multi-arquivo
7. **OPP-7** (inline styles) → junto da OPP-3, no fim

## Resumo

- 2 **prune** aplicados (76 linhas removidas)
- 2 **simplify** de bugs reais aplicados (PDF e alerta)
- 3 pendentes: 1 modularize (OPP-3) e 2 standardize (OPP-6, OPP-7)
- Nenhuma alteração de regra de negócio