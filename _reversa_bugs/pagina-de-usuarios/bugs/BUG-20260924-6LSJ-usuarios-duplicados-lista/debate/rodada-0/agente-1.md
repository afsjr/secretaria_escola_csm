---
protocol_version: 1
debate_id: BUG-20260924-6LSJ-r0
bug_id: BUG-20260924-6LSJ
role: solver
solver_id: agente-1
engine: local
round: 0
status: ok
started_at: 2026-09-24T09:00:00Z
finished_at: 2026-09-24T09:30:00Z
---

# Agente-1 — Estratégia de correção BUG-20260924-6LSJ

## Estratégia de correção

**Decisão: correção SÓ de exibição (opção 1 da disputa), sem reparo de dados no change set.**

A causa raiz da *aparência* do defeito (exibição 1:1 + `Total = profiles.length`) é eliminada
numa única camada onde o dado é consumido, sem refatoração de `session.ts`, sem mudança de schema
e sem migração. Reparo de dados fica **fora** deste change set (só com decisão humana por caso,
conforme Agent Notes e decisão do usuário): o fix entrega a lista correta sobre o mesmo banco e
deixa duplicatas históricas para um inventário separado, o que torna o código rever-ível sem efeito
colateral no banco.

### Regra de identidade de agrupamento (a parte crítica)

Grupo = contas da **mesma pessoa**, definido por **nome normalizado**, escopado por seção de perfil:

```
key(p) = normalizarNome(p.nome_completo)  // NFD + remove acentos + lowercase('pt-BR')
        || p.email.trim().toLowerCase()   // fallback se nome vazio
        || p.id                            // fallback final (nunca colapsa vazios entre si)
```

- **CPF NÃO é usado para fundir grupos.** Por quê: CPF compartilhado entre pessoas distintas
  (evidência: `108.908.174-05` em Gessica × Iara; `120.069.054-06` em ANDREIA × ANDREA×2) prova que
  CPF como chave de fusão esconde pessoas reais — viola a restrição (c). Grupos de CPF duplicado
  *da mesma pessoa* já são capturados porque a mesma pessoa tem o mesmo nome.
- **Nome normalizado resolve os dois casos reais que a dedup de 22/09 não cobriu:**
  - CAMILLY (CPF `NULL` na 2ª conta): mesmo nome → colapsa (requisito b). ✓
  - 3ª conta da MARIA BEATRIZ (CPF divergente `110.032.444-59`): mesmo nome → colapsa. ✓
- **Custo conhecido (aceito):** pessoas que digitaram o nome diferente entre contas (ANDREIA ×
  ANDREA) NÃO colapsam na tela — falso-negativo **seguro** (não esconde ninguém; comportamento igual
  ao atual para esses casos). Esse grupo vai para o inventário de reparo humano como item separado.
- **Risco residual (aceito e mitigado):** duas pessoas distintas com o **mesmo nome exato** colapsam
  em uma linha. Mitigação: o card exibe badge "**N contas**" (não é fusão silenciosa), os ids ficam
  visíveis para a secretaria e o reset audita conta a conta. É o melhor que nome+CPF permitem;
  cada grupo de nome único com N>1 entra no inventário de confirmação humana.

Escopo do agrupamento: **por seção de perfil** (Alunos, Professores, …). Quem é professor E aluno
pode aparecer nas duas seções — esconder isso seria outra mudança de produto, não este defeito.

### O que o Total passa a contar

`Total = Σ de grupos únicos por seção` (pessoas, não linhas). Secção badge = nº de grupos daquela
seção. Ex.: 2 linhas da CAMILLY → 1 pessoa.

### Comportamento do Resetar Senha

- Botão passa a carregar `data-ids` = **todos os ids do grupo**.
- Confirmação: "Deseja resetar a senha das **N contas** de {nome} para csm1983#?".
- Dispara `AdminService.resetarSenhasDaPessoa(ids, nome)` (método novo) que itera o
  `resetUserPassword` existente por id, agrega `{ ok, erros: [{id, message}] }` e gera auditoria
  por conta (`reset_senha`). Um id com erro não corta os demais.
- Restrição de privilégio avaliada **por grupo**: se qualquer membro é `master_admin` → sem botão;
  se qualquer membro é `admin` e o viewer não é master → sem botão. (Comportamento conservador:
  recusa reset para o grupo inteiro em vez de interar um alvo protegido.)

### Passos de implementação (arquivos/funções)

1. **`src/lib/person-groups.ts` (NOVO, 100% puro):**
   - `normalizarNomeIdentidade(nome): string`
   - `agruparPorPessoa(profiles: UserProfile[]): GrupoPessoa[]` (`{ nome, ids, perfis }`)
2. **`src/views/directory.ts`:** `renderProfileSection` filtra por perfil → `agruparPorPessoa` →
   um card por grupo; badge "N contas" quando N>1; header/Total contam grupos; handler do botão lê
   `data-ids` e chama `resetarSenhasDaPessoa`; `totalUsers = Σ grupos`.
3. **`src/lib/admin-service.ts`:** adicionar `resetarSenhasDaPessoa(ids, nome)` reusando
   `resetUserPassword` (sem alterar sua assinatura).
4. **Testes novos:** `src/lib/person-groups.test.ts` e
   `src/lib/admin-service.pessoa.test.ts` (mock `./supabase`, `./audit-service`).
5. **Não tocar:** `session.ts` (`getAllProfiles` continua cru; a view é quem agrupa e precisamos
   das linhas brutas para resetar por id) e `signup-handler.ts` (a *nascença* de duplicatas é outra
   feature — prevenção já iniciada em 22/09; registrar como adendo separado, não neste repair).

Justificativa "menor mudança coerente": uma única camada de apresentação (+helper puro testável),
reutilização integral do reset de conta única, zero alteração de dado/schema, escopo restrito ao
sintoma que o usuário relatou.

## Causa raiz proposta

Confirma a causa raiz já registrada (não é a disputa): nascença em `signup-handler.ts:18`
(`if (cpf)` só dispara a guarda com CPF) + ausência de unique por identidade até 22/09; aparecimento
em `session.ts:134-142` (sem distinct/grupo) e `directory.ts:100,150` (render 1:1 + `Total` bruto).
A dedup de 22/09 (`dedup-pendencias.mjs:82`, `dedup-merge.mjs:139`) agrupou só por CPF e ignorou
CPF `NULL`, deixando CAMILLY e MARIA BEATRIZ-3ª fora. Nada a alterar na hipótese.

## Teste

**`src/lib/person-groups.test.ts`** (puro, sem jsdom):
1. Duas contas mesmo nome + mesmo CPF → **1 grupo**, `ids = [ambos]` (regressão principal).
2. CAMILLY (nome igual; 1ª conta CPF, 2ª conta CPF `NULL`) → **1 grupo** (prova do caso
   CPF-NULL, requisito b).
3. Gessica × Iara (CPF `108.908.174-05` igual, nomes **diferentes**) → **2 grupos** (prova de que
   CPF não funde pessoas distintas — restrição c).
4. ANDREIA × ANDREA (CPF `120.069.054-06` igual, nome com diferença mínima) → **2 grupos**
   (falso-negativo preservado, não oculta ninguém).
5. Nomes com acento/caixa/espaços extra normalizam igual (`"Maria  BEATRIZ"` = `"MARIA beatriz"`) →
   1 grupo (prova da chave).
6. Nome vazio → fallback email, depois id; dois nomes vazios sem email **não** colapsam.
7. Contagem: 2 linhas da CAMILLY → total de pessoas = 1 (não 2) — bloqueia regressão do `Total`.

**`src/lib/admin-service.pessoa.test.ts`** (mock de `./supabase`/`./audit-service`, função edge
mockada):
8. `resetarSenhasDaPessoa(['a','b'], nome)` chama `resetUserPassword` p/ **a e b**, retorna `ok`,
   gera 2 registros de auditoria (prova da decisão do usuário: reseta TODAS as contas).
9. Um id falha (erro no edge) → `ok=false`, `erros=[{id,message}]`, o outro id ainda é resetado
   (não corta; robustez).

**Opcional (jsdom, `vitest` browser não requerido):** render de `renderProfileSection` com os
grupos → um card por pessoa; badge "2 contas" presente. Marcado opcional porque a lógica já é
coberta pelos testes puros; usar se o time quiser cobertura de `innerHTML`.

## Impacto sobre a spec

**Sim, precisa de adendo** em `_reversa_sdd/addenda/` (a listagem nunca foi especificada —
`spec-gap`). O adendo diria:
- Nova RF (listagem de usuários): "Listar usuários por pessoa" — **uma linha por pessoa por seção de
  perfil**; `Total` e badges contam **pessoas únicas**, não linhas de `perfis`.
- Regra de identidade: agrupar por nome normalizado (NFD/acentos/caixa/espaços), escopo por perfil;
  **CPF não é chave de fusão** (falsos positivos documentados).
- Reset de senha: na linha única, reseta **todas as contas da pessoa** e audita por conta.
- **Fora do escopo:** reparo/deativação de duplicatas históricas (decidido por caso pelo usuário) e o
  campo de consulta de pessoas inativas (feature nova, citada no intake — não é defeito).
- Impacto de contagem esperado: `Total` passa de `154` para nº de pessoas únicas (valor a medir no
  banco vivo com o usuário).

## Riscos e efeitos colaterais

- **Falso-positivo de fusão por nome idêntico** (2 pessoas distintas, mesmo nome): aceito com
  mitigação visível — badge "N contas" + auditoria por id + inventário de confirmação humana.
- **Reset múltiplo:** resetar N contas num loop reutiliza fluxo existente (edge/admin); risco de
  "reset parcial" tratado com agregação de erros (teste 9). Nenhuma FK de matrícula é tocada (não
  apagamos nada). Mudança de comportamento: grupo com membro admin/master perde o botão inteiro —
  hoje o card admin seria resetável por master; documentar no adendo.
- **Falso-negativo (nome com digitos/typo):** continua 2x na tela — sem regressão, igual ao atual;
  vai ao inventário de reparo.
- **Total muda de valor (154 → pessoas):** esperado pela AC; comunicar como correção, não como
  regressão.
- **Pessoa em dois perfis** aparece em 2 seções (não colapsa entre seções) — decisão explícita de
  escopo; vira requisito se o usuário quiser linha única global.
- **Performance:** agrupamento O(n) em memória (n≈191 no backup), irrelevante.

## Evidências

- `bug.md` (labels, AC, agent notes: não apagar contas; reset reseta todas).
- `debate/problema.md` (rubrica, opções, restrições b/c/d/e).
- `evidence/reproduction.md` (191 perfis, 25 grupos por nome, falsos positivos Gessica×Iara,
  ANDREIA×ANDREA).
- `evidence/contas-duplicadas-camilly.md` (2 contas CAMILLY, CPF NULL, matrícula ativa).
- `src/views/directory.ts:100-150` (render 1:1, `Total = profiles.length`).
- `src/auth/session.ts:134-142` (`getAllProfiles` cru).
- `src/auth/signup-handler.ts:18-28` (`if (cpf)` guarda só com CPF).
- `src/lib/cpf-service.ts` (`listarInconsistenciasCPF` como ferramenta de inventário read-only).
- `src/lib/admin-service.ts:343-439` (`resetUserPassword` por id, reusado).
- `src/lib/cpf-service.test.ts` (padrão de mock `./supabase` para os novos testes).
- `_reversa_sdd/admin/requirements.md` (RF-01..08; nenhuma cobre a listagem de usuários —
  confirma `spec-gap`).

## Confiança

**Alta.** A regra de identidade resolve com dados confirmados os dois casos reais não cobertos pela
dedup de 22/09 (CAMILLY-CPF-NULL e MARIA BEATRIZ-CPF-divergente), respeita a decisão do usuário
(reset em todas as contas), não toca banco (reversível), reutiliza o reset existente e é testável
de forma pura. Residual de confiança apenas no falso-positivo de nomes idênticos, mitigado mas não
eliminável com os dados disponíveis.

## Crítica às demais propostas

Sem snapshot ainda (rodada 0). Posicionamento antecipado para a rodada 1: a opção 2 (exibição +
reparo imediato) viola a decisão do usuário e os Agent Notes (não apagar contas sem decisão humana
por caso) — só aceitável com inventário read-only separado do change set; a opção 3 (não agrupar,
apenas marcar) contraria o desejo explícito do usuário de "uma linha por pessoa", mas o seu custo
(ferramenta de fusão) merece análise como evolução futura após o inventário de dados.