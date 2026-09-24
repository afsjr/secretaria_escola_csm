---
schema_version: 1
id: BUG-20260924-6LSJ
display_number: 3
title: Página de usuários exibe a mesma pessoa mais de uma vez (contas duplicadas na lista)
status: active
phase: awaiting-human
severity: medium
priority: P1
created: 2026-09-24
updated: 2026-09-24
express: true

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
  rate: "10/10"
  suspected_triggers: []

blocking: []
relationships: []

traceability:
  specs:
    - _reversa_sdd/addenda/bug-20260924-6LSJ-v001.md
  affected_code:
    - src/views/directory.ts
    - src/auth/session.ts
    - src/lib/person-groups.ts
    - src/lib/admin-service.ts
  root_cause:
    state: confirmed
    hypothesis: "Contas duplicadas para a mesma pessoa nascem pela guarda de cadastro só rodar
      quando o CPF é informado (src/auth/signup-handler.ts:18-28). A tela exibe 1:1 as linhas de
      perfis (directory.ts:100-150) sem deduplicação, então duas contas ativas da mesma pessoa
      viram dois cards e somam 2 no Total. A dedup de 22/09 (dedup-pendencias.mjs:82,
      dedup-merge.mjs:139) agrupa só por CPF e pula quem não tem CPF, deixando casos como a
      CAMILLY (CPF NULL) e a 3ª conta da MARIA BEATRIZ (CPF divergente) fora do plano."
    causal_path:
      - "Autocadastro/admin sem CPF não dispara cpf_ja_existe (signup-handler.ts:18 if(cpf))"
      - "Linhas duplicadas ativas persistem em perfis (sem unique por nome/identidade)"
      - "getAllProfiles() devolve as linhas cruas (session.ts:134-142, sem distinct/grupo)"
      - "directory.ts agrupa/ordena por perfil e nome mas não deduplica; Total = profiles.length"
    evidence:
      - ref: evidence/reproduction.md
        observation: "191 perfis no backup; 25 grupos duplicados por nome; CPF-falso-positivos entre pessoas distintas (Gessica×Iara) provam que dedup por CPF sozinho não é identidade segura"
      - ref: evidence/contas-duplicadas-camilly.md
        observation: "CAMILLY com 2 linhas ativas (14/04 c/ CPF; 10/09 sem CPF, matrícula ativa)"
      - ref: evidence/inventario-vivo-20260924.md
        observation: "Snapshot: 191 perfis -> 158 pessoas únicas; 25 grupos duplicados; 8 colisões de CPF entre pessoas distintas"
      - ref: src/views/directory.ts:100-150
        observation: "renderização 1:1 e Total bruto"
      - ref: src/auth/session.ts:134-142
        observation: "getAllProfiles sem deduplicação"
    code_refs:
      - file: src/views/directory.ts
        symbol: renderProfileSection / DirectoryView
        commit: "fix implementado (aguardando commit) — render por grupo via agruparPorPessoa"
  reproduction_tests:
    - src/lib/person-groups.test.ts
    - src/lib/admin-service.pessoa.test.ts
  regression_tests:
    - src/lib/person-groups.test.ts
    - src/lib/admin-service.pessoa.test.ts

spec_verdict: spec-gap
change_set:
  - id: CHG-001
    kind: test
    artifact: src/lib/person-groups.test.ts
    purpose: "Reprodução + regressão da identidade (CAMILLY 2->1, MARIA BEATRIZ 3->1, Gessica/Iara e ANDREIA/ANDREA seguem 2 grupos por nome/perfil)"
    diff: fix/plan.html
  - id: CHG-002
    kind: test
    artifact: src/lib/admin-service.pessoa.test.ts
    purpose: "Regressão do reset multi-contas: 2 chamadas por grupo, continua-agregando, dedupe de ids, retorno idempotente"
    diff: fix/plan.html
  - id: CHG-003
    kind: code
    artifact: src/lib/person-groups.ts
    purpose: "Módulo puro: normalizarNomeIdentidade + agruparPorPessoa; chave perfil|nomeNormalizado com fallback email->id; CPF nunca funde; selo cpfConflitante"
    diff: fix/plan.html
  - id: CHG-004
    kind: code
    artifact: src/views/directory.ts
    purpose: "Renderiza 1 card por pessoa; badges e Total = pessoas únicas; sub-linha 'N contas · e-mails'; botão com data-ids; privilégio por grupo"
    diff: fix/plan.html
  - id: CHG-005
    kind: code
    artifact: src/lib/admin-service.ts
    purpose: "resetUserPasswords(userIds, nome): dedup, loop continua em erro agregando {ok, resetados, erros}, assinatura resetUserPassword intocada"
    diff: fix/plan.html
  - id: CHG-006
    kind: specification
    artifact: _reversa_sdd/addenda/bug-20260924-6LSJ-v001.md
    purpose: "Fecha o spec-gap da listagem de usuários e registra o termo de taxonomia listagem-usuarios"
    diff: fix/plan.html

closure:
  policy: local-software
  satisfied: false
resolution_kind: null
---

# Página de usuários exibe a mesma pessoa mais de uma vez (contas duplicadas na lista)

## Summary

A tela "Usuários do Sistema" (`src/views/directory.ts`) lista direto o retorno de `getAllProfiles()`,
que lê a tabela `perfis` sem deduplicação. Contas ativas duplicadas para a mesma pessoa (mesmo
nome/CPF, IDs diferentes) aparecem como duas linhas distintas e contam duas vezes no `Total:`.

Casos confirmados no print do usuário: **CAMILLY VITORIA DA SILVA ALBUQUERQUE** (2x) e
**MARIA BEATRIZ DA COSTA SANTOS** (2x).

## Expected Behavior

**Spec-gap.** Não existe seção de spec que defina o comportamento da listagem "Usuários do
Sistema". Não há requisito em `_reversa_sdd/admin/requirements.md` para a página de diretório de
usuários (RF-05 cobre apenas "Listar alunos"); nenhum adendo em `_reversa_sdd/addenda/` aborda o
assunto.

Comportamento esperado declarado pelo usuário no intake (`intake/relato-20260924-1107.md`):

- A lista principal reflete **apenas pessoas ativas** e exibe **uma única linha por pessoa**.
- Uma pessoa cursando **mais de um curso** não pode aparecer repetida: o curso não duplica a
  pessoa na listagem.
- Pessoas inativas (concluíram o curso) saem da lista principal e passam a uma consulta de
  inativos (**campo novo, ainda não existente na tela** — item de produto, não é o defeito
  relatado).
- Ao cadastrar um aluno novo com CPF já vinculado, o sistema detecta a existência e a pessoa se
  registra no curso normalmente, sem gerar uma segunda entrada na lista de usuários.

Como a regra nunca foi especificada, a pergunta "é bug ou nunca foi especificado?" fica aberta
para o fix.

## Actual Behavior

- `src/views/directory.ts:131` — `getAllProfiles()` retorna linhas brutas da tabela `perfis`.
- `src/views/directory.ts:100` — agrupa por `perfil` em memória, sem deduplicar pessoas.
- `src/views/directory.ts:106-108` — ordena por `nome_completo`, deixando contas duplicadas lado a
  lado com o mesmo nome.
- `src/views/directory.ts:117` — o badge de contagem por seção conta cada linha.
- `src/views/directory.ts:150` — `totalUsers = profiles?.length` é contagem bruta (ex.: `Total: 154`).
- `src/auth/session.ts:134-142` — `getAllProfiles()` não tem `DISTINCT`, `GROUP BY` nem filtro de
  identidade; o filtro cobre apenas `status` e `cadastro_desativado`.

## Steps to Reproduce

1. Autenticar com perfil admin/master_admin/secretaria.
2. Abrir a página "Usuários do Sistema".
3. Percorrer a seção "Alunos".
4. Observar: `CAMILLY VITORIA DA SILVA ALBUQUERQUE` aparece 2x e `MARIA BEATRIZ DA COSTA SANTOS`
   aparece 2x; o `Total:` soma ambas.

## Evidence

- `evidence/contas-duplicadas-camilly.md` — linhas das duas contas ativas da CAMILLY nos backups.
- Relato bruto com o print: `../intake/relato-20260924-1107.md`.

## Suspected Area

Causa raiz **não confirmada** (hipótese do registrador):

- Nascença: cadastro de contas duplicadas para a mesma pessoa. `src/auth/signup-handler.ts:18-28`
  só roda a guarda anti-duplicidade **se o CPF foi informado** (`if (cpf) { ... }`); autocadastro
  sem CPF cria conta livremente. A RPC `cpf_ja_existe` e o índice `uniq_perfis_cpf_ativo` só
  existem desde 2026-09-22 (`scripts/sql/2026-09-22_prevencao_cpf_e_matricula.sql`), então
  duplicados históricos foram criados sem barreira.
- Aparecimento: `src/views/directory.ts:100,150` exibe e conta linhas brutas.
- Por que a dedup de 22/09 não pegou: `scripts/dedup-pendencias.mjs:82` e
  `scripts/dedup-merge.mjs:139` agrupam **só por CPF** e ignoram quem não tem CPF
  (`if (!c) continue;`), então a conta da CAMILLY com CPF `NULL` ficou de fora.

## Acceptance Criteria

- [ ] Uma mesma pessoa aparece **uma única vez** na página, mesmo tendo mais de uma conta ativa.
- [ ] O `Total:` e os badges por seção contam pessoas únicas, não linhas de `perfis`.
- [ ] Pessoas que concluíram o curso não aparecem na lista principal (só na consulta de inativos).
- [ ] O "Resetar Senha" da linha única atinge a conta correta (sem ambiguidade de alvo).
- [ ] Teste de regressão cobrindo listagem sem repetição de pessoa.
- [ ] Fluxo de matrícula em novo curso para quem já tem CPF vinculado continua funcionando.

## Traceability

| Item | Valor |
|------|-------|
| Specs | Adendo `_reversa_sdd/addenda/bug-20260924-6LSJ-v001.md` (spec-gap fechado) |
| affected_code | `src/views/directory.ts`, `src/lib/person-groups.ts`, `src/lib/admin-service.ts` |
| root_cause | `confirmed` |
| reproduction_tests | `src/lib/person-groups.test.ts`, `src/lib/admin-service.pessoa.test.ts` |
| regression_tests | `src/lib/person-groups.test.ts`, `src/lib/admin-service.pessoa.test.ts` |

## Resolution

**Fix implementado e testado (Gates 1+2 aprovados pelo usuário em `fix/plan.html`). Aguardando
commit e verificação manual no banco vivo antes da closure.**

Estratégia (vencida no debate multiagente, `debate/resposta-final.md`): correção 100% de exibição,
reversível, **zero escrita em banco**, CPF fora da chave de identidade.

- Novo módulo puro `src/lib/person-groups.ts`: `agruparPorPessoa` com chave
  `perfil | nomeNormalizado` (fallback `perfil | email` → `perfil | id`; vazios nunca colapsam).
  CPF nunca funde pessoas (Gessica×Iara e ANDREIA×ANDREA seguem 2 linhas); grupo com 2+ CPFs
  não-nulos distintos marca `cpfConflitante` (selo "⚠ revisar · CPFs divergentes").
- `src/views/directory.ts`: 1 card por pessoa; badges da seção e `Total:` = pessoas únicas;
  sub-linha "N contas · e-mails"; botão "Resetar Senha" com `data-ids` (JSON) e privilégio por
  grupo (`master_admin` nunca exibe; `admin` sem viewer master não exibe).
- `src/lib/admin-service.ts`: `resetUserPasswords(userIds, nome)` — dedup de ids, loop sequencial
  reusando `resetUserPassword` (assinatura intocada), falha de um id **não corta** os demais,
  retorna `{ ok, resetados, erros }`; toast honesto "X de N contas".
- Adendo: `_reversa_sdd/addenda/bug-20260924-6LSJ-v001.md` (fecha o spec-gap; termo de taxonomia
  `listagem-usuarios`).
- Inventário read-only: `evidence/inventario-vivo-20260924.md` (snapshot; banco vivo não resolvido
  desta rede). 191 perfis → **158 pessoas únicas** → Total da tela passará a 158.

**Testes:** 11/11 verdes (`person-groups.test.ts` + `admin-service.pessoa.test.ts`),
`npm run type-check` limpo. Suíte completa: 4 falhas pré-existentes confirmadas no baseline
(`secretaria.test.ts` e `GerenciarAlunosTab.test.ts`), não relacionadas.

**Pendências para closure (decisão humana / manual):**
1. Commit dos arquivos (não commitei nada).
2. Verificação manual no banco vivo (de um IP liberado): CAMILLY 1x com "2 contas"; `Total: 158`;
   reset de grupo de 2 → login das duas contas com `csm1983#`.
3. Itens separados (não são este bug): prevenção em `signup-handler.ts`, reparo de dados (fusão/
   desativação com decisão humana via inventário), e o campo de consulta de pessoas inativas.

## Agent Notes

- Registrado pela rota expressa do `/reversa-debugger` (`express: true`).
- **Severidade `medium` e prioridade `P1` foram assumidas pelo registrador na rota expressa**
  (o usuário não as informou): sem perda de dados nem falha de segurança, mas a lista engana a
  secretaria e o botão "Resetar Senha" pode mirar a conta errada.
- **`feature: unclassified`**: `taxonomy.yaml` não tem termo para a listagem de usuários. Proposta
  de novo termo: `listagem-usuarios`. Área `administrativo` e módulo `admin` são do catálogo.
- **Pergunta em aberto para o fix:** o "campo para consulta de pessoas inativos" citado pelo
  usuário é um requisito novo, não é defeito. Tratar como item separado (adendo/feature), fora
  deste bug, salvo decisão humana em contrário.
- **Não apagar contas duplicadas sem decisão humana**: a segunda conta da CAMILLY tem matrícula
  ativa ("Enfermagem - Noite - 2026/2027"). Cuidado com `cadastro_desativado` e com vínculos de
  matrícula; dedup por CPF não cobre contas com CPF `NULL`.
- Atenção ao efeito no `Resetar Senha`: decidir qual conta é a canônica antes de consolidar.
- **Debate multiagente (repair) concluído**: vencedora D1 + enxertos — ver
  `debate/resposta-final.md`; convergência em `debate/convergencia.md`.
- **Banco vivo**: tentativa de consulta read-only falhou por DNS do host direto
  (`db.*.supabase.co` não resolve desta rede); inventário ficou **snapshot-based**
  (`evidence/inventario-vivo-20260924.md`). Rodar a verificação manual de um IP liberado.
