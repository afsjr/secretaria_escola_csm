---
type: evidence
bug_id: BUG-20260924-6LSJ
title: Inventário vivo (pessoas x contas) na listagem "Usuários do Sistema"
collected_at: 2026-09-24
readonly: true
---

# Inventário pessoas x contas — listagem "Usuários do Sistema"

> **Modo**: somente leitura — nenhuma escrita em banco. Recurso de decisão humana para reparos.

## Fonte e limitação

- Tentei conectar no banco vivo, mas esta rede não resolve o host direto
  (`db.<projeto>.supabase.co` — restrição típica do Supabase: conexão direta só de
  IP liberado). Internet OK, `supabase.co` resolve.
- **Inventário gerado do snapshot local mais recente**:
  `scripts/backups/backup-dedup-2026-09-22T14-37-58.sql` (pré/analisado, 191 perfis).
- As consultas (tentativa de execução read-only) e este documento não alteram dados.

## Números

| Métrica | Valor | Observação |
| --- | --- | --- |
| Perfis ativos (filtro `getAllProfiles`) | 191 | status não-inativo e não desativado |
| **Pessoas únicas** (chave `perfil\|nomeNormalizado`) | **158** | = Total que a tela passará a exibir |
| Grupos com 2+ contas | 25 | serão agrupados pela tela |
| Homônimos suspeitos (grupo com CPFs divergentes) | 2 | PESSOA 5 BEATRIZ e PESSOA 1 |
| Colisões de CPF entre pessoas **distintas** | 8 | CPF nunca é usado como chave |

## Destaques

- **PESSOA 10** — 2 contas (`2c7a0cbb-…`, `a3dcc2cc-…`), 1 matrícula
  ativa. Confirma o caso da notificação: a 2ª conta tem matrícula ativa → o botão "Resetar Senha"
  agora reseta as 2 contas juntas; **nada** foi apagado/desativado.
- **PESSOA 11** — 3 contas, CPFs divergentes (`17335810493` e `11003244459`)
  → vira 1 card com o selo "⚠ revisar · CPFs divergentes".
- **PESSOA 14/PESSOA 15** (mesmo CPF) — seguem 2 linhas **de propósito** (falso-negativo
  seguro; CPF indemonstrável como identidade).
- **PESSOA 8 × PESSOA 7** (mesmo CPF) — seguem 2 linhas de propósito.

## Grupos com 2+ contas (25)

1. **PESSOA 17** — 3 contas (ids: `ff6e564c-…`, `dd521b7e-…`, `8b08307c-…`) · e-mails: <e-mail-mascarado> | <e-mail-mascarado> | <e-mail-mascarado> · cpfs: 10621800465
2. **PESSOA 18** — 3 contas (ids: `cddb36ff-…`, `e73ceb52-…`, `5e03daf6-…`) · cpfs: 17540388404
3. **PESSOA 11** — 3 contas (ids: `327dfc10-…`, `24281f9d-…`, `b0740742-…`) · cpfs: 17335810493, 11003244459 [CPFs divergentes]
4. **PESSOA 19** — 3 contas (ids: `1a07df47-…`, `a35a21f8-…`, `9c827ed5-…`) · cpfs: 11955420467
5. **PESSOA 20** — 3 contas (ids: `4497f08f-…`, `88cd601d-…`, `898bcec0-…`) · cpfs: 11884404464
6. **PESSOA 21** — 3 contas (ids: `70171a99-…`, `2ba01723-…`, `ab134a54-…`) · cpfs: 14791281470
7. **PESSOA 22** — 3 contas (ids: `15262316-…`, `e316c6ab-…`, `7faff5e2-…`) · cpfs: 17831979433
8. **PESSOA 23** — 3 contas (ids: `2665e15e-…`, `00d966e0-…`, `cc5f3d9b-…`) · cpfs: 12901773419
9. **PESSOA 24** — 2 contas (`dc4c9442-…`, `be9fcf08-…`) · cpfs: 11766341438
10. **PESSOA 25** — 2 contas (`5c25ce7f-…`, `d36a7d20-…`) · cpfs: 11998187470
11. **PESSOA 26** — 2 contas (`1833a27f-…`, `48728575-…`) · cpfs: 07325524439
12. **PESSOA 10** — 2 contas (`2c7a0cbb-…`, `a3dcc2cc-…`) · cpfs: 15959888408 · **1 matrícula ativa**
13. **PESSOA 27** — 2 contas (`930237d5-…`, `4617b033-…`) · cpfs: 08814313466
14. **PESSOA 28** — 2 contas (`b0c45368-…`, `9cc747a6-…`) · cpfs: 13795344450
15. **PESSOA 29** — 2 contas (`982a4f51-…`, `5adcbe8f-…`) · cpfs: 11539195406
16. **PESSOA 30** — 2 contas (`b2898402-…`, `096d06b2-…`) · cpfs: 15199311409
17. **PESSOA 2** — 2 contas (`508a779f-…`, `d038fcfb-…`) · cpfs: 15376528421
18. **PESSOA 31** — 2 contas (`0d5d1342-…`, `45fda388-…`) · cpfs: 11420436490
19. **PESSOA 1** — 2 contas (`85412f61-…`, `face37fa-…`) · cpfs: 15376528421, 14804510451 [CPFs divergentes]
20. **PESSOA 32** — 2 contas (`dd849677-…`, `7250af75-…`) · cpfs: 39800968822
21. **PESSOA 33** — 2 contas (`88a985d4-…`, `78bf8bb0-…`) · cpfs: 10783943423
22. **PESSOA 34** — 2 contas (`e3260c49-…`, `76de3cfc-…`) · cpfs: 06859520450
23. **PESSOA 35** — 2 contas (`8836708b-…`, `fa7981b0-…`) · cpfs: 07340388281
24. **PESSOA 16** — 2 contas (`f8e399e3-…`, `5173d469-…`) · cpfs: 12006905406
25. **PESSOA 36** — 2 contas (`de7097b0-…`, `e0fc8b98-…`) · cpfs: 17988743422

## Colisões de CPF entre pessoas distintas (8) — CPF NUNCA funde

- `07340388281` -> PESSOA 37 | PESSOA 35
- `39800968822` -> PESSOA 38 | PESSOA 32
- `15376528421` -> PESSOA 2 | PESSOA 1
- `12006905406` -> PESSOA 15 | PESSOA 16
- `14304861476` -> PESSOA 39 | PESSOA 40
- `14343025470` -> PESSOA 41 | PESSOA 42
- `12208900499` -> PESSOA 43 | PESSOA 44
- `10890817405` -> PESSOA 3 | PESSOA 4

## Próximo passo (decisão humana, fora deste bug)

Reparo de dados (fusão/desativação de contas duplicadas) é **item separado**: usar este
inventário + o relatório `scripts/backups/dedup-relatorio-2026-09-22T13-59-37.*` como base, nunca
apagar conta com matrícula ativa ou com atividade (boletim/frequência/pagamentos) sem decisão
humana explícita.