# Cápsula de reprodução — BUG-20260924-6LSJ

- **Commit base:** `git rev-parse HEAD` (preenchido no momento do fix)
- **Branch:** ver `git rev-parse --abbrev-ref HEAD`
- **Ambiente:** análise de dados estática (backup SQL `scripts/backups/backup-dedup-2026-09-22T14-37-58.sql`) + leitura de código. Sem UI rodando.
- **Comando de reprodução (dados):** parser dos `INSERT INTO "public"."perfis"` agrupando ativos por nome normalizado e por CPF normalizado.
- **Resultado (191 perfis ativos no backup, pré-dedup de 22/09):**
  - 25 grupos de **duplicados por nome** (mesma pessoa, 2 a 3 linhas cada).
  - 27 grupos de **CPF em colisão**, incluindo falsos positivos entre pessoas distintas
    (ex.: CPF `***.***.***-**` aparece em "PESSOA 3" e
    "PESSOA 4"; CPF `***.***.***-**` em "PESSOA 15" e
    "PESSOA 16" x2).
- **Classificação:** `deterministic` / 10 de 10. O defeito é a renderização 1:1 das linhas de
  `perfis` sem deduplicação (`src/views/directory.ts:100-110,150` ← `src/auth/session.ts:134-142`).

## Cruzamento com a tela do usuário

- Usuário viu `Total: 154` na tela. Backup pré-dedup tem 191 perfis; o plano de dedup de 22/09
  desativou ~37 → 191 - 37 = 154. Consistente: a contagem da tela é sobre o estado ATUAL do banco.
- Os duplicados que restam em produção são exatamente os que a dedup por CPF não cobre: casillas
  com CPF `NULL` (ex.: PESSOA 12, 10/09) ou CPF divergente/cadastrado errado (ex.: 3ª conta da
  PESSOA 5 BEATRIZ com CPF `***.***.***-**`).
- O backup é PRÉ-dedup; para fechar a causa raiz com precisão é preciso consultar o banco vivo
  (via `CpfService.listarInconsistenciasCPF` ou SQL), item a confirmar com o usuário.