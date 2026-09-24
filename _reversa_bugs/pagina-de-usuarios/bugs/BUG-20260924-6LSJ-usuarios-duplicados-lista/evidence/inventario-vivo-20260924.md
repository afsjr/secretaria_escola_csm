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

- **PESSOA 10** — 2 contas (`<id-mascarado>`, `<id-mascarado>`), 1 matrícula
  ativa. Confirma o caso da notificação: a 2ª conta tem matrícula ativa → o botão "Resetar Senha"
  agora reseta as 2 contas juntas; **nada** foi apagado/desativado.
- **PESSOA 11** — 3 contas, CPFs divergentes (`***.***.***-**` e `***.***.***-**`)
  → vira 1 card com o selo "⚠ revisar · CPFs divergentes".
- **PESSOA 14/PESSOA 15** (mesmo CPF) — seguem 2 linhas **de propósito** (falso-negativo
  seguro; CPF indemonstrável como identidade).
- **PESSOA 8 × PESSOA 7** (mesmo CPF) — seguem 2 linhas de propósito.

## Grupos com 2+ contas (25)

1. **PESSOA 17** — 3 contas (ids: `<id-mascarado>`, `<id-mascarado>`, `<id-mascarado>`) · e-mails: <e-mail-mascarado> | <e-mail-mascarado> | <e-mail-mascarado> · cpfs: ***.***.***-**
2. **PESSOA 18** — 3 contas (ids: `<id-mascarado>`, `<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
3. **PESSOA 11** — 3 contas (ids: `<id-mascarado>`, `<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**, ***.***.***-** [CPFs divergentes]
4. **PESSOA 19** — 3 contas (ids: `<id-mascarado>`, `<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
5. **PESSOA 20** — 3 contas (ids: `<id-mascarado>`, `<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
6. **PESSOA 21** — 3 contas (ids: `<id-mascarado>`, `<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
7. **PESSOA 22** — 3 contas (ids: `<id-mascarado>`, `<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
8. **PESSOA 23** — 3 contas (ids: `<id-mascarado>`, `<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
9. **PESSOA 24** — 2 contas (`<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
10. **PESSOA 25** — 2 contas (`<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
11. **PESSOA 26** — 2 contas (`<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
12. **PESSOA 10** — 2 contas (`<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-** · **1 matrícula ativa**
13. **PESSOA 27** — 2 contas (`<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
14. **PESSOA 28** — 2 contas (`<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
15. **PESSOA 29** — 2 contas (`<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
16. **PESSOA 30** — 2 contas (`<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
17. **PESSOA 2** — 2 contas (`<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
18. **PESSOA 31** — 2 contas (`<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
19. **PESSOA 1** — 2 contas (`<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**, ***.***.***-** [CPFs divergentes]
20. **PESSOA 32** — 2 contas (`<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
21. **PESSOA 33** — 2 contas (`<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
22. **PESSOA 34** — 2 contas (`<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
23. **PESSOA 35** — 2 contas (`<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
24. **PESSOA 16** — 2 contas (`<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**
25. **PESSOA 36** — 2 contas (`<id-mascarado>`, `<id-mascarado>`) · cpfs: ***.***.***-**

## Colisões de CPF entre pessoas distintas (8) — CPF NUNCA funde

- `***.***.***-**` -> PESSOA 37 | PESSOA 35
- `***.***.***-**` -> PESSOA 38 | PESSOA 32
- `***.***.***-**` -> PESSOA 2 | PESSOA 1
- `***.***.***-**` -> PESSOA 15 | PESSOA 16
- `***.***.***-**` -> PESSOA 39 | PESSOA 40
- `***.***.***-**` -> PESSOA 41 | PESSOA 42
- `***.***.***-**` -> PESSOA 43 | PESSOA 44
- `***.***.***-**` -> PESSOA 3 | PESSOA 4

## Próximo passo (decisão humana, fora deste bug)

Reparo de dados (fusão/desativação de contas duplicadas) é **item separado**: usar este
inventário + o relatório `scripts/backups/dedup-relatorio-2026-09-22T13-59-37.*` como base, nunca
apagar conta com matrícula ativa ou com atividade (boletim/frequência/pagamentos) sem decisão
humana explícita.