---
schema_version: 1
id: BUG-20261001-23DG
display_number: 5
title: "Aluno não vê as próprias notas por contas duplicadas ativas (histórico dividido entre logins)"
status: resolved
phase: patching
severity: high
priority: P1
created: 2026-10-01
updated: 2026-10-01

origin:
  type: manual-report
  external_ref: null

area: administrativo
module: admin
feature: listagem-usuarios
labels:
  - spec-gap

visibility: normal
security_suspected: false

reproduction:
  classification: deterministic
  rate: "1/1"
  suspected_triggers: []

blocking: []

data_repair:
  executed: true
  applied_at: 2026-10-01T12:16:00-03:00
  backup: scripts/backups/backup-dedup-2026-10-01T12-15-15.json
  script: scripts/dedup-contas-ativas.mjs
  groups:
    - canonical: conta-C1 (mascarada)
      duplicate: conta-C2 (mascarada)
      actions: "6 boletins duplicados descartados, 1 matrícula reatribuída, conta duplicada desativada"
      verification: "canônica ativa com 1 matrícula e 7 boletins; duplicada inativa sem matrícula/boletim"
  not_merged:
    - group: "maria beatriz da costa santos"
      reason: "CPFs divergentes (***.***.***-** x ***.***.***-**) -> pessoas distintas (decisão humana)"

relationships:
  - bug: BUG-20260924-6LSJ
    type: related-to
    state: proposed
    evidence: []

traceability:
  specs:
    - "_reversa_sdd/addenda/005-aluno-notas.md#resumo-da-entrega"
  affected_code:
    - "src/lib/academic-service.ts:226"
    - "src/views/aluno-notas.ts:36"
  root_cause:
    state: confirmed
    hypothesis: "Contas duplicadas ativas da mesma pessoa (sem CPF ou com CPF divergente) não foram mescladas pelo dedup por CPF; o boletim e a matrícula ficam em contas diferentes. Ao logar pela conta sem notas, getBoletim(profile.id) retorna vazio e a aba Minhas Notas aparece sem disciplinas."
    causal_path:
      - "Dedup agrupa identidade só por CPF (scripts/dedup-merge.mjs)"
      - "Contas sem CPF/CPF divergente permanecem ativas e não mescladas"
      - "boletim e matricula ficam em contas distintas do mesmo aluno"
      - "getBoletim(profile.id) da conta sem notas retorna vazio"
    evidence:
      - ref: evidence/reproduction.md
        observation: "Duas contas ativas para a mesma pessoa; notas só em uma delas"
    code_refs:
      - file: src/lib/academic-service.ts
        symbol: getBoletim
        commit: null
  reproduction_tests:
    - scripts/dedup-contas-ativas.mjs
  regression_tests:
    - scripts/dedup-contas-ativas.mjs

spec_verdict: spec-gap

change_set:
  - id: CHG-001
    kind: data-repair
    artifact: scripts/dedup-contas-ativas.mjs
    purpose: "Script explícito de consolidação de contas ativas duplicadas (dry-run por padrão, --apply executa)"
    diff: fix/CHG-001.diff
  - id: CHG-002
    kind: data-repair
    artifact: "perfis/boletim/matriculas (produção)"
    purpose: "Consolidar conta-C2 (mascarada) em conta-C1 (mascarada) e desativar a duplicada"
    diff: fix/CHG-002.md
  - id: CHG-003
    kind: specification
    artifact: _reversa_sdd/addenda/bug-20261001-23DG-v001.md
    purpose: "Especifica a consolidação de contas duplicadas ativas (RB16)"
    diff: fix/CHG-003.md

closure:
  policy: local-software
  satisfied: true
resolution_kind: fixed
---

# Aluno não vê as próprias notas por contas duplicadas ativas (histórico dividido entre logins)

## Summary

Alunos relatam não ver as próprias notas na aba **Minhas Notas**. A investigação mostrou que
não é falha da view nem RLS: existem **contas duplicadas ativas** da mesma pessoa (sem CPF ou
com CPF divergente) que o dedup por CPF não mesclou. As notas (boletim) e a matrícula ficam
em contas diferentes; quando o aluno entra pela conta sem notas, a lista aparece vazia.

## Expected Behavior

Conforme `_reversa_sdd/addenda/005-aluno-notas.md` (RB15): o aluno visualiza as disciplinas em
que está matriculado com N1/N2/N3/Rec/Média/Status, em modo somente leitura. Um cadastro por
pessoa deve concentrar matrícula e boletim, de forma que o login do aluno exiba suas notas.

## Actual Behavior

- `getBoletim(profile.id)` retorna vazio para a conta sem notas.
- `AlunoNotasView` exibe "Nenhuma disciplina cadastrada".
- As notas existem, mas em outra conta ativa da mesma pessoa.

## Steps to Reproduce

1. Identificar duas contas ativas do mesmo aluno (ex.: sem CPF), com boletim em uma e
   matrícula na outra.
2. Logar com a conta que não tem boletim.
3. Abrir **Minhas Notas** (`#/dashboard/aluno/notas`).
4. Observar "Nenhuma disciplina cadastrada".

## Evidence

- `evidence/reproduction.md` — consulta somente-leitura à base (nomes mascarados), com duas
  pessoas afetadas e a distribuição de boletim/matrícula por conta.

## Suspected Area

- `src/lib/academic-service.ts:226` (`getBoletim`) — lê `boletim` por `aluno_id`.
- `src/views/aluno-notas.ts:36` — trata resultado vazio como "sem disciplinas".
- `scripts/dedup-merge.mjs` — dedup por CPF deixa duplicatas sem CPF fora do plano.

## Acceptance Criteria

- [ ] Cadastros duplicados ativos da mesma pessoa são consolidados (decisão humana por caso).
- [ ] O aluno passa a ver suas notas ao logar.
- [ ] Sem perda de histórico (boletim, matrícula, frequência) no merge.

## Traceability

- **Spec efetiva:** `_reversa_sdd/addenda/005-aluno-notas.md#resumo-da-entrega` (aba Minhas
  Notas, leitura das próprias notas). Identidade/unificação de contas não estava especificada
  (label `spec-gap`).
- **Código afetado (onde aparece):** `src/lib/academic-service.ts:226`, `src/views/aluno-notas.ts:36`.
- **Causa raiz (onde nasce):** processo de dedup por CPF insuficiente para contas sem CPF;
  estado de dados duplicado.

## Resolution

**Fechado por:** /reversa-debugger-fix em 2026-10-01 (reparo de dados com decisão humana).

**Causa raiz (estado: confirmed).** Contas ativas duplicadas da mesma pessoa que o dedup por
CPF não mescla dividem o histórico (matrícula em uma conta, boletim em outra). O aluno que
entra pela conta sem notas vê "Nenhuma disciplina cadastrada".

**Veredito de spec: `spec-gap`** (decisão humana). O comportamento de consolidação de contas
sem CPF nunca foi especificado. Adendo aditivo gerado:
`_reversa_sdd/addenda/bug-20261001-23DG-v001.md` (RB16).

**Resolution kind: `fixed`** (reparo de dados verificado).

### Decisões humanas (2026-10-01)

- **PESSOA C:** manter `conta-C1 (mascarada)` (mais informação) e mesclar
  `conta-C2 (mascarada)`.
- **PESSOA M:** **não mesclar** — CPFs divergentes (***.***.***-** x ***.***.***-**) indicam pessoas distintas.

### Change set

| CHG | Kind | Artefato | Propósito |
|-----|------|----------|-----------|
| CHG-001 | data-repair | `scripts/dedup-contas-ativas.mjs` | Consolidação explícita (dry-run/--apply) |
| CHG-002 | data-repair | `perfis`/`boletim`/`matriculas` (produção) | Consolidar PESSOA C e desativar a duplicada |
| CHG-003 | specification | `_reversa_sdd/addenda/bug-20261001-23DG-v001.md` | Especifica a consolidação (RB16) |

### Reparo executado

- Backup: `scripts/backups/backup-dedup-2026-10-01T12-15-15.json` (gitignored).
- `node scripts/dedup-contas-ativas.mjs --apply`.
- Ações: 6 boletins duplicados descartados (mantidos os da canônica), 1 matrícula reatribuída,
  conta `conta-C2 (mascarada)` desativada.
- Verificação: `conta-C1 (mascarada)` ativo com 1 matrícula e 7 boletins; `conta-C2 (mascarada)`
  inativo, sem matrícula e sem boletim. Script idempotente (dry-run posterior = no-op).
- Rollback: restaurar as linhas a partir do backup `.sql`/`.json` citado.

### Testes

- Script de reparo atua como regressão operacional (idempotente; dry-run confirma estado).
- Suíte do app inalterada por este bug (nenhum código de aplicação alterado aqui).

## Agent Notes

- Sintoma relacionado a BUG-20260924-6LSJ (mesma lacuna de identidade). Relação `related-to`
  proposta.
- Correção é **reparo de dados** (merge de contas ativas), não patch de código; exige decisão
  humana de qual conta manter por grupo, backup e dry-run. Não executar merge sem aprovação.
- A view está correta para o contrato; o defeito é de estado de dados.
