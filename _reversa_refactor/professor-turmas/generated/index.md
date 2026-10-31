# Índice de Oportunidades — professor-turmas

> Contexto: `professor-turmas`
> Última atualização: `2026-10-30T22:39:04-03:00`

## Oportunidades

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
| 9 | OPP-20261030-F24H | decouple | IDs globais de frequência colidem entre turmas | 🟡 | Lançamento de presença na disciplina errada com 2+ turmas | low | applied |
| 10 | OPP-20261030-HX4X | decouple | Versões de notas em variável global window | 🟡 | Estado oculto, risco de versão obsoleta, trava OPP-8 | low | applied |
| 11 | OPP-20261030-4HGA | optimize | Salvar notas em lote refaz consultas por aluno | 🟢 | Latência linear no hotpath de gravação | low | proposed |
| 12 | OPP-20261030-SIHI | restructure | Leitura e cálculo de linhas duplicados entre notas, PDF e alertas | 🟡 | Três cópias da regra propensas a divergir | medium | proposed |
| 13 | OPP-20261030-FZIH | simplify | Média exibida diverge entre render inicial e recálculo | 🟢 | Coluna Média oscila de 6.8 para 7.0 sem edição de nota | low | applied |
| 14 | OPP-20261030-FUYJ | standardize | Estilos inline remanescentes no badge e alerta de notas | 🟢 | Badge e alerta fora do tema CSS | low | proposed |
| 15 | OPP-20261030-OFZQ | optimize | Alunos da turma consultados uma vez por disciplina e por frequência | 🟡 | Rajada de consultas idênticas ao abrir a tela | low | proposed |

## Ordem de ataque sugerida

1. ~~**OPP-1** (prune botões)~~ → **aplicado**
2. ~~**OPP-2** (prune função morta)~~ → **aplicado**
3. ~~**OPP-4** (bug de média no PDF)~~ → **aplicado**
4. ~~**OPP-5** (alerta não renderiza)~~ → **aplicado**
5. ~~**OPP-3** (modularize)~~ → **aplicado** — view-orquestrador + 4 módulos + tipos
6. ~~**OPP-6** (getPerfil helper)~~ → **aplicado** — `extrairPerfilPrimeiro` + 4 testes
7. ~~**OPP-7** (inline styles)~~ → **aplicado** — classes `.pt-*` em main.css

### Rodada atual (propostas)

1. ~~**OPP-9** (frequência usa o card errado)~~ → **aplicado** com `/reversa-decouple` (2 testes novos, type-check verde)
2. ~~**OPP-13** (média oscila na tela)~~ → **aplicado** com `/reversa-simplify` (1 regra de arredondamento, final e status intactos)
3. ~~**OPP-10** (estado global de versões)~~ → **aplicado** com `/reversa-decouple` (contexto tipado, 2 testes novos)
4. **OPP-11** (N+1 ao salvar notas) → `/reversa-optimize` — hotpath de escrita
5. **OPP-15** (N+1 de alunos ao abrir) → `/reversa-optimize` — hotpath de leitura
6. **OPP-12** (três cópias da leitura de linha) → `/reversa-restructure` — encadear após OPP-13
7. **OPP-14** (inline styles restantes) → `/reversa-standardize` — cosmético
8. **OPP-8** (realtime/concorrência) → `/reversa-forward` — feature, não refactor na mesma janela

## Resumo

- 7 oportunidades aplicadas na rodada anterior (2 prune, 2 simplify de bugs, 2 standardize, 1 modularize)
- 1 evolve proposto para o ciclo forward (realtime/merge multi-professor)
- 3 aplicadas nesta rodada: OPP-9 (frequência por card), OPP-13 (média exibida) e OPP-10 (contexto de versões)
- 4 oportunidades novas propostas: 2 otimizações, 1 deduplicação de leitura, 1 padronização
- Nenhuma alteração de regra de negócio registrada nesta rodada
