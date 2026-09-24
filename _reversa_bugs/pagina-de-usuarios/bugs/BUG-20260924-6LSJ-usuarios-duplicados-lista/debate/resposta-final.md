---
protocol_version: 1
debate_id: BUG-20260924-6LSJ
judge: isolado
role: judge
round: adjudicação
status: ok
---

# Veredito do juiz

## Síntese

As três propostas finais (D1, D2, D3) emitem **exatamente a mesma partição** para todos os
cenários evidenciados e adotam o mesmo núcleo: correção **100% de exibição**, módulo puro novo
`src/lib/person-groups.ts`, chave de identidade `perfil | nomeNormalizado` com fallback
`nome → email → id`, **CPF fora da chave** (apenas metadado de selo `cpfConflitante`), badges e
`Total` = Σ de grupos, wrapper multi-contas que **continua agregando erros**, única parada prévia
por privilégio (grupo homogêneo de perfil), inventário vivo **read-only** como etapa do bug,
zero escrita em banco e reversibilidade por diff. Não há disputa de mecanismo remanescente.

As divergências reais são quatro e menores: (i) nome do módulo — convergiu majoritariamente para
`person-groups.ts`; (ii) assinatura do wrapper — D1 isola em `resetarSenhasDaPessoa`, D2/D3 em
`resetUserPasswords`; (iii) cláusula de `break` por classe de permissão — **D3 a mantém**, D1/D2 a
abandonaram; (iv) detalhes de fechamento — `nomeExibido` de grupo totalmente vazio (só D1 define),
filtro do SQL de inventário (D1/D3 reproduzem o filtro real de `getAllProfiles()`; D2 é mais estreito).

Veredito: **D1 vence** por ser a proposta mais completa e coerente — define todos os fallbacks com
forma fechada, elimina o `break` frágil por completo, amarra o inventário ao filtro real da tela e o
mantém fora do change set (menor diff), e traz o conjunto de testes mais fechado. D2 é quase
idêntica; D3 acumula as duas únicas deficiências substantivas: o `break` por classe de erro e o
`nomeExibido` de nome-vazio indefinido.

## Vencedora (D1 — por critério da rubrica)

### 1. Elimina a causa raiz confirmada e o caso PESSOA 12-CPF-NULL

Todas as três eliminam. D1 é a que o faz de forma mais verificável: a chave `perfil|nome` colapsa a
PESSOA 12 (idem grafia, CPF `NULL`) e a PESSOA 5 BEATRIZ (grafia idem, CPFs divergentes) em um único
grupo com `ids` completos; e os testes 1–7 da proposta bloqueiam explicitamente os dois casos e as
anti-regressões (PESSOA 8×PESSOA 7 e PESSOA 13×PESSOA 14 seguem como 2 grupos, provando que CPF nunca funde).
`Total = Σ grupos` corrige a contagem de linhas brutas em `directory.ts:117,150`. O fallback
`email → id` para nome vazio fecha o caso extremo sem fundir desconhecidos.

### 2. Menor mudança coerente

D1 toca apenas 3 pontos: **1 arquivo novo** puro (`person-groups.ts`), um trecho de `directory.ts`
(~45 linhas) e o wrapper em `admin-service.ts` — e explicita o que **não** toca (`session.ts`,
`signup-handler.ts`, banco/schema/Edge). D2 é equivalente. D3 é maior: adiciona `scripts/inventario-pessoas.mjs`
e codifica uma cláusula de `break` classificando a classe de erro — mais superfície para o mesmo
resultado. D1 vence neste critério.

### 3. Menor risco de regressão (FKs de matrícula e Resetar Senha)

Zero escrita em `perfis`/`matriculas`; reset reusa `resetUserPassword` (id de uma conta por vez,
assinatura intocada). Confirmei no código: o wrapper retorna `{ error: { message } }` genérico
(`src/lib/admin-service.ts:84-105,386`) e **não expõe status/classes** — o `break` por 401/403 do
D3 é indetectável na fronteira do serviço sem alterar o contrato de erro (fora do escopo "assinatura
intocada"), tornando sua prova de teste 11 insustentável. O segundo ponto de risco real é a parada
de privilégio: D1 avalia por grupo homegêneo antes de emitir qualquer botão, cobrindo o grupo
inteiro sem cláusula "qualquer membro" e sem caminho de permissão bloqueada no meio do loop. D1 é o
desenho com menor risco entre os três.

### 4. Reversibilidade

D1 mantém a separação estrita: **código defensivo** (change set, reversível apagando o módulo +
revertendo os dois trechos + removendo o wrapper) **vs. reparo de dados** (inventário, zero escrita,
não entra no commit). Nenhuma das três propostas escreve em banco; D1 é também a que tem o menor
diff reversível (sem script novo). D3 também é reversível, mas com uma peça a mais.

### 5. Aderência à spec efetiva e aos Agent Notes

Todas as três respeitam: não apagam/desativam contas sem decisão humana (reparo e prevenção em
`signup-handler` ficam como itens separados) e o Resetar Senha da linha única reseta **TODAS** as
contas do grupo, continuando em erro (decisão do usuário). D1 fecha ainda os itens que as outras
deixaram soltos: `nomeExibido` de grupo todo-vazio (`email → "(sem nome)"`), toast honesto `X de N`
e adendo obrigatório (spec-gap). Vence por completude de aderência.

**Resultado:** D1 atende os 5 critérios com a menor superfície e o fechamento mais completo.

## Enxertos das demais propostas (item a item)

1. **Assinatura do wrapper `resetUserPasswords(userIds, nome)` (de D2/D3).** Nome adjacente à
   `resetUserPassword` existente no mesmo serviço, vencedor por 2/3. O contrato fechado
   `{ ok, resetados, erros }` de D1 fica mantido integralmente; apenas renomeia.
2. **Teste explícito de dedupe de ids `['a','a','b'] → 2 chamadas` (de D2/D3).** D1 já deduplica
   antes do loop; o teste torna a garantia provável e o retorno idempotente verificável.
3. **Termo de taxonomia `listagem-usuarios` no adendo (de D3; já sugerido no `bug.md`).** Resolve o
   `feature: unclassified` que o próprio bug reporta; zero custo.
4. **Roteamento do inventário pelo mesmo `agruparPorPessoa` da tela (reforçado por D3).** D1 já
   agrupa o resultado do SQL em memória com a mesma função; formaliza-se: a chave do inventário é a
   **mesma** chave da view, garantindo que nada que a tela mostra escape do gate humano.
5. **Nada é adotado de D3 na política de parada do reset.** O `break` por classe de permissão é
   rejeitado (ver critério 3): a guarda prévia por grupo já cobre o caso e a classe não é
   detectável no contrato atual. Não há enxerto apenas o registro de rejeição.
6. **Nada é adotado do SQL de inventário de D2 em sua forma exata.** O filtro `status='ativo' AND
   cadastro_desativado=false` de D2 é mais estreito que o de `getAllProfiles()` (`status IS NULL OR
   status <> 'inativo'` + `cadastro_desativado IS NOT TRUE`); sub-reproduziria a tela. O filtro de
   D1/D3 é o correto e entra na consolidação.
7. **Tipo e semântica de flags (resolução e não-enxerto).** D2 ponderou dois enums de classificação;
   todos convergiram para o único booleano `cpfConflitante` como metadado do card. Mantém-se o
   booleano único (D1/D3). Nada a enxertar.

## Especificações de implementação consolidadas

**Arquivos a tocar (4):**

1. **NOVO `src/lib/person-groups.ts`** (puro, sem DOM/Supabase):
   - `normalizarNomeIdentidade(s): string` — NFD → remove acentos → lowercase('pt-BR') → colapsa
     espaços/trim.
   - `agruparPorPessoa(profiles): PersonGroup[]` — um passe com `Map` por chave, preservando ordem
     de entrada (sort estável da view).
   - `interface PersonGroup { key, perfil, nomeExibido, ids: string[], emails: string[], cpfsNaoNulos: string[], cpfConflitante: boolean }`.
2. **`src/views/directory.ts`**:
   - `renderProfileSection` filtra por perfil → `agruparPorPessoa` → **1 card por grupo**; sort por
     `nomeExibido` do grupo.
   - Badge da seção (`:117`) e `totalUsers` (`:150`) = **Σ grupos**, nunca `profiles.length`.
   - Grupo N > 1: sub-linha `"N contas · e-mails: …"`; `cpfConflitante`: selo `"⚠ revisar · CPFs
     divergentes"` (não-bloqueante). Grupo singleton renderiza **exatamente como hoje** (zero
     regressão visual na maioria).
   - Botão carrega `data-ids` (JSON array) + `data-nome`; `canReset` reusa a regra atual
     (`:51-59`) avaliada **por grupo** (grupo homogêneo de perfil); `master_admin` nunca exibe,
     `admin` sem viewer master não exibe.
   - Handler lê `data-ids` e chama `resetUserPasswords` — **sem lógica de loop no DOM**.
3. **`src/lib/admin-service.ts`**: novo `resetUserPasswords(userIds, nome)`:
   - Deduplica ids preservando ordem (Set) antes do loop.
   - Itera `resetUserPassword` sequencialmente por id (assinatura **intocada**), 1 tentativa por id.
   - **Falha de um id NÃO corta os demais** — agrega em `erros` e segue. **Nenhuma** cláusula de
     parada por classe de erro (a única parada é prévia, na renderização, por privilégio).
   - Audita por conta via `AuditService.log` (já feito dentro de `resetUserPassword`).
   - Retorna `{ ok: erros.length === 0, resetados: string[], erros: { id, message }[] }`.
   - Toast: `"Senha de X de N contas de {nome} resetada"` + lista de falhos; **nunca** sucesso
     pleno com falha presente; retry idempotente (`csm1983#`).
4. **NOVOS testes** `src/lib/person-groups.test.ts` e `src/lib/admin-service.pessoa.test.ts`.

**Chave:** `key = perfil|nomeNormalizado` ; se nome vazio → `perfil|email.lower().trim()` ; se ambos
vazios → `id` (vazios nunca colapsam entre si). CPF **nunca** participa da chave.

**nomeExibido (fechamento D1):** primeiro `nome_completo` não-vazio do grupo; se todos vazios →
primeiro email não-vazio; se nada → `"(sem nome)"`.

**Fallback de chave equal… todas as seções de perfil são escopadas pela chave → grupos sempre
homogêneos de perfil** (mesmo nome em `aluno` × `professor` = 2 grupos).

**NÃO tocar:** `session.ts` (linhas cruas; a view precisa delas para resetar por id),
`signup-handler.ts` (prevenção = item separado), `cpf-service.ts`, banco/schema/FKs/migrações,
Edge Functions.

**Inventário (parte do bug, FORA do change set/commit, zero escrita):**

```sql
SELECT id, nome_completo, email, cpf, perfil, status, cadastro_desativado, created_at
FROM public.perfis
WHERE (status IS NULL OR status <> 'inativo')
  AND NOT COALESCE(cadastro_desativado, false)
ORDER BY nome_completo;
```

Resultado agrupado **em memória pelo mesmo `agruparPorPessoa`** da tela; complementar
`CpfService.listarInconsistenciasCPF()` (classes de colisão PESSOA 8×PESSOA 7 / PESSOA 13×PESSOA 14); gravado
em `evidence/inventario-vivo-YYYYMMDD.md` (ids, e-mails, CPFs, matrículas ativas, `cpfConflitante`,
homônimos suspeitos). Reparo/fusão/desativação = itens separados com decisão humana.

**Adendo em `_reversa_sdd/addenda/` (obrigatório — fecha o spec-gap):** uma linha por pessoa por
seção com chave `perfil|nomeNormalizado`; CPF não é chave de fusão (falsos positivos documentados);
Total/badges contam pessoas; card N>1 com "N contas · e-mails" + selo de CPF divergente; reset por
grupo reseta TODAS as contas, falha não interrompe, toast `X de N`, privilégio por grupo; inventário
read-only no bug; prevenção em signup-handler e campo de inativos (AC3) e fluxo de matrícula (AC6) =
itens separados; termo de taxonomia `listagem-usuarios`. AC1, AC2, AC4, AC5 atendidos.

## Plano de testes consolidado

**`src/lib/person-groups.test.ts`** (puro, vitest):
1. PESSOA 12 (CPF `***.***.***-**` + CPF NULL, mesmo nome/perfil) → 1 grupo, `ids.length=2`,
   `cpfConflitante=false` (caso da dedup de 22/09).
2. PESSOA 5 BEATRIZ (mesmo nome, CPFs não-nulos distintos) → 1 grupo, `cpfConflitante=true`, `ids=3`.
3. PESSOA 8 × PESSOA 7 (CPF igual, nomes distintos) → **2 grupos** (CPF nunca funde).
4. PESSOA 13 × PESSOA 14 (CPF igual, 1 letra de diferença) → **2 grupos** (falso-negativo seguro).
5. Normalização: acento/caixa/espaço duplo → 1 grupo; nome vazio → email; nome+email vazios → id
   (vazios nunca colapsam); `nomeExibido` todo-vazio → `"(sem nome)"`.
6. Mesmo nome em `aluno` × `professor` → 2 grupos.
7. Total = Σ grupos ≠ `profiles.length` com duplicata (bloqueia badge/Total).

**`src/lib/admin-service.pessoa.test.ts`** (mock `./supabase`, `./audit-service`):
8. `resetUserPasswords(['a','b'], nome)` → 2 chamadas de `resetUserPassword`, 2 auditorias,
   `ok=true`.
9. Continua-agregando: `a` falha → `b` e `c` ainda resetados; `resetados=['b','c']`,
   `erros=[{id:'a'}]`, `ok=false`.
10. Erro em todos → `resetados=[]`, `erros` completo; re-execução idempotente.
11. Dedupe: `['a','a','b']` → 2 chamadas.
12. Privilégio por grupo: grupo com `master_admin` → nenhum botão; grupo `admin` com viewer
    não-master → nenhum botão.

Regressão: `npm run test` + `npm run type-check`; manual no banco vivo (PESSOA 12 1x com badge
"2 contas"; Total cai; reset de grupo de 2 → login das duas contas com `csm1983#`).

## Riscos e mitigações finais

- **Homônimos reais de grafia idêntica** colapsam (residual inevitável — CPF comprovadamente não
  discrimina). Mitigado: e-mails visíveis + selo `cpfConflitante` + inventário como gate humano.
- **Falso-negativo** (PESSOA 13/PESSOA 14): segue 2 linhas, como hoje; seguro; vai ao inventário.
- **Reset parcial:** continua-agregando + toast honesto `X de N` + retry idempotente; zero
  FK/matrícula tocada (mesma RPC por id).
- **Total cai (154 → pessoas únicas):** correção esperada, comunicada no adendo.
- **Pessoa em 2 perfis** aparece nas 2 seções (comportamento atual, documentado).
- **Sem risco de deleção/desativação:** nenhuma escrita em `perfis`; Agent Note "não apagar contas
  sem decisão humana" preservado por construção.
- **Reversibilidade:** apagar `person-groups.ts` + reverter ~45 linhas de `directory.ts` + remover
  wrapper → estado anterior exato; inventário é markdown; zero dado mutado.

## Confiança da adjudicação

**alta.** As três propostas são de terceiros solvers independentes na mesma rodada final, com
partição idêntica em todos os cenários discriminantes (PESSOA 12, PESSOA 5 BEATRIZ, PESSOA 8×PESSOA 7,
PESSOA 13/PESSOA 14) e com as decisões de unificação registradas em cada uma. As divergências reais foram
resolvidas a partir de evidência que confirmei por leitura direta: o contrato de erro do
`admin-service` (`admin-service.ts:84-105,386`) não expõe classe de status, o que derruba a cláusula
de `break` do D3 por inviabilidade técnica sem quebrar "assinatura intocada"; e o filtro real de
`getAllProfiles()` (`session.ts:134-142`) valida o SQL de inventário de D1/D3 sobre o de D2. Risco
residual da adjudicação é apenas cosmético (nomenclatura interna), já eliminado pelo enxerto
majoritário.