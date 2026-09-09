# Índice de Oportunidades — professor-turmas

> Contexto: `professor-turmas`
> Última atualização: `2026-09-09T11:30:00-03:00`

| # | ID | Verbo | Título | Confiança | Impacto | Custo | Estado |
|---|-----|-------|--------|-----------|---------|-------|--------|
| 1 | OPP-20260909-A1B2 | prune | Botões mortos btn-alertas-geral e btn-export-geral | 🟢 | UX confuso | low | applied |
| 2 | OPP-20260909-C3D4 | prune | Função loadAulasDaDisciplina nunca chamada | 🟢 | 63 linhas mortas + debug logs | low | applied |
| 3 | OPP-20260909-E5F6 | modularize | Arquivo monolítico 942 linhas | 🟡 | Manutenção difícil | medium | proposed |

## Ordem sugerida de ataque

1. ~~**OPP-1** (prune botões)~~ → **aplicado** `/reversa-prune OPP-20260909-A1B2`
2. ~~**OPP-2** (prune função morta)~~ → **aplicado** `/reversa-prune OPP-20260909-C3D4`
3. **OPP-3** (modularize) → `/reversa-modularize OPP-20260909-E5F6` — superfície reduzida de 942 → 866 linhas, pronto para atacar

## Resumo

- 2 oportunidades de **prune** (código morto): **aplicadas** — 76 linhas removidas (942 → 866), 2 botões mortos e 1 função morta eliminados, import órfão `formatDateBR` removido
- 1 oportunidade de **modularize**: pendente (OPP-3) — confiança parcial, precisa testes antes
- Nenhuma alteração de regra de negócio — todas as transformações são estruturais
