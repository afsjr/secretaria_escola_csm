---
protocol_version: 1
debate_id: BUG-20260924-6LSJ-r1
bug_id: BUG-20260924-6LSJ
role: solver
solver_id: agente-1
engine: local
round: 1
status: ok
started_at: 2026-09-24T15:13:54Z
finished_at: 2026-09-24T15:32:00Z
---

# Agente-1 — Rodada 1 — BUG-20260924-6LSJ

## Estratégia de correção

**Mantenho o núcleo da rodada 0: correção só de exibição (opção 1), chave de identidade =
nome normalizado escopado por seção de perfil, CPF nunca usado para fundir, reparo de dados
fora do change set.** Após ler agente-2 e agente-3, a estratégia se **confirma no núcleo**
e **muda em três pontos** (convergência saudável, autoria preservada):

### Chave de agrupamento (inalterada — e por quê)

```
key(p) = perfil | normalizarNome(p.nome_completo)
normalizarNome = NFD -> remove acentos -> lowercase('pt-BR') -> colapsa espacos
fallback: nome vazio -> email trim+lower; ainda vazio -> id (nunca colapsa vazios entre si)
```

Prova de que a chave simples basta: agrupar **primeiro por CPF e depois sub-agrupar por
nome** (a "Camada A" do agente-2) produz **exatamente os mesmos grupos** que agrupar
direto por nome — se CPF e nome casam, 1 grupo nos dois esquemas; se CPF casa e nome difere
(PESSOA 8 x PESSOA 7), split por nome nos dois; se CPF difere e nome casa (PESSOA 5 BEATRIZ-3a),
colapso por nome nos dois. A camada de CPF e **comportamentalmente um no-op de
agrupamento**: so acrescenta flags. Em vez de manter 3 camadas + ponte para obter labels,
adopto os **labels uteis do agente-2/agente-3 calculados de forma trivial sobre o grupo ja
formado** (sinais abaixo). Isso mantem **imunidade estrutural** ao bug da dedup de 22/09:
o codigo de exibicao nunca le CPF para decidir fusao, entao nao existe caminho (esquecer o
sub-agrupamento, inverter ordem das camadas) que reintroduza fusao PESSOA 8 x PESSOA 7 — risco
que qualquer implementacao em camadas carrega como armadilha latente.

### Sinais no card (incorporados das propostas dos pares)

Grupo N>1 exibe:

- badge **"N contas"** + lista discreta de **e-mails distintos** (ideia do agente-3: nada
  fica oculto sem pista — mitiga colisao de homonimos e evita reset "cego");
- selo **"CPFs divergentes"** quando o grupo tem 2+ CPFs nao-nulos distintos (forma
  simplificada e mais ampla das flags do agente-2 / `cpf_conflitante` do agente-3 — pega
  PESSOA 5 BEATRIZ-3a **e** qualquer colisao futura, sem enum fechado);
- **sort usa o nome exibido do grupo** (detalhe do agente-3 — evita regressao de
  ordenacao).

### Reset multi-contas (desenho inalterado, semantica de erro endurecida)

- `data-ids` = todos os ids do grupo; confirmacao "resetar a senha das **N contas** de X";
- **`AdminService.resetarSenhasDaPessoa(ids, nome)`** (wrapper novo, nao loop no handler
  do DOM): itera `resetUserPassword` existente por id, **continua no primeiro erro
  agregando**, retorna `{ ok, resetados: [], erros: [{id, message}] }`, audita por conta;
  **decisao fechada na propria secao: CONTINUA, nao para.**
- Restricao de privilegio **por grupo** (minha regra da rodada 0, mantida — os pares nao a
  trataram): qualquer membro `master_admin` -> sem botao; qualquer membro `admin` e viewer
  nao-master -> sem botao. Recusa conservadora no grupo inteiro, documentada no adendo.

### Inventario vivo (adocao explicita do agente-3)

Etapa **paralela, somente leitura, fora do change set**: rodar
`CpfService.listarInconsistenciasCPF()` + SQL de leitura com a mesma chave de nome, gravar
`evidence/inventario-vivo-YYYYMMDD.md` (ids, e-mails, CPFs, matriculas ativas, selo de CPF
divergente, homonimos suspeitos). Alimenta as decisoes humanas de reparo futuro; nenhuma
escrita. Eu tinha "inventario" como mencao difusa — adoto a forma concreta do agente-3.

### Passos de implementacao

1. **`src/lib/person-groups.ts` (NOVO, puro):** `normalizarNomeIdentidade`,
   `agruparPorPessoa(profiles)` -> `GrupoPessoa { nomeExibido, ids, emails, cpfs,
   cpfDivergente: boolean }`.
2. **`src/views/directory.ts`:** `renderProfileSection` -> agrupa -> 1 card por grupo;
   badges e `totalUsers` contam grupos; sort por `nomeExibido`; botao com `data-ids`;
   handler chama o wrapper (sem logica de loop no DOM).
3. **`src/lib/admin-service.ts`:** `resetarSenhasDaPessoa(ids, nome)` sobre
   `resetUserPassword` (assinatura existente intocada).
4. **Testes:** `src/lib/person-groups.test.ts` + `src/lib/admin-service.pessoa.test.ts`
   (casos novos da rodada 1 nas secoes abaixo).
5. **Nao tocar:** `session.ts`, `signup-handler.ts`, banco/schema/migracoes.

## Causa raiz proposta

Confirmada, sem mudanca (nao e a disputa): nascenza em `signup-handler.ts:18-28`
(`if (cpf)`), persistencia sem unique de identidade (indice de 22/09 cobre so CPF
nao-nulo), apariicao em `session.ts:134-142` (`getAllProfiles` cru) + `directory.ts:100-150`
(render 1:1, `Total = profiles.length`); a dedup de 22/09 (`dedup-merge.mjs:139`,
`if (!c) continue`) ignora CPF `NULL`, deixando PESSOA 12 e PESSOA 5 BEATRIZ-3a em producao
(Total 154 = 191-37). O fix alvo e a **apariicao**; prevencao (signup) fica como item
separado.

## Teste

**`src/lib/person-groups.test.ts`** (puro, vitest):

1. Mesmo nome + mesmo CPF -> 1 grupo, 2 ids (regressao principal).
2. PESSOA 12 (mesmo nome; 1 conta CPF `***.***.***-**`, 1 conta CPF `NULL`, perfil aluno)
   -> 1 grupo, `cpfDivergente = false` (requisito b; caso que a dedup de 22/09 nao cobriu).
3. PESSOA 5 BEATRIZ: mesmo nome, CPFs nao-nulos distintos -> **1 grupo**,
   `cpfDivergente = true` (requisito a + sinal para inventario).
4. PESSOA 8 x PESSOA 7, CPF `***.***.***-**` igual, nomes distintos -> **2 grupos** (prova
   estrutural de que CPF nao funde — restricao c; regressao do espirito 22/09).
5. PESSOA 13 x PESSOA 14, CPF igual, nome com 1 letra de diferenca -> **2 grupos**
   (falso-negativo seguro preservado; vai ao inventario).
6. Normalizacao: acento/caixa/espaco duplo -> 1 grupo; nome vazio -> email; 2 nomes vazios
   sem email nao colapsam.
7. Escopo: mesmo nome em `aluno` x `professor` -> 2 grupos (chave inclui perfil).
8. Contagem: 2 linhas da PESSOA 12 -> total de pessoas = 1 (bloqueia regressao do `Total`).

**`src/lib/admin-service.pessoa.test.ts`** (mock `./supabase`, `./audit-service`):

9. `resetarSenhasDaPessoa(['a','b'])` -> 2 chamadas de `resetUserPassword`, 2 auditorias
   (decisao do usuario: TODAS as contas).
10. **Erro parcial:** id `a` falha, id `b` OK -> `b` **ainda e resetado**,
    `erros=[{id:'a',...}]`, `ok=false` — teste que fecha a decisao CONTINUAR vs PARAR.
11. Erro em **todos** -> `resetados=[]`, `erros` completo; re-execucao do mesmo call e
    segura (reset e idempotente: grava a senha conhecida) — cobre retry pelos ids falhos.
12. Erro de permissao (classe deterministica) -> aborta o loop mas preserva agregacao dos
    ja tentados (excecao a regra CONTINUAR, justificada na decisao).
13. Priviligio por grupo: grupo contendo `master_admin` -> view nao emite botao (funcao de
    decisao de privilegio extraida pura, se possivel).

Verificacao: `npm run test` + `npm run type-check` + manual (PESSOA 12 1x com badge
"2 contas"; Total cai; reset de grupo de 2 -> login das duas contas com `csm1983#`).

## Impacto sobre a spec

- `spec-gap` confirmado (`_reversa_sdd/admin/requirements.md` nao tem RF de listagem;
  RF-02 de reset por ID continua valida — o wrapper chama a mesma funcao por conta).
- **Adendo em `_reversa_sdd/addenda/`** (mudanca em relacao a rodada 0: incorporo os
  pontos que os pares expuseram melhor):
  1. "Uma linha por pessoa por secao" com chave = perfil + nome normalizado; **CPF nao e
     chave de fusao** (falsos positivos documentados);
  2. Total/badges contam pessoas; sort por nome do grupo;
  3. Card N>1 exibe badge "N contas" + e-mails; selo "CPFs divergentes" quando couber;
  4. Reset na linha unica reseta **todas** as contas; falha parcial **nao interrompe**,
     toast relata `X de N` e lista ids/e-mails com erro; re-execucao dos falhos e segura;
  5. Restricao admin/master avaliada por grupo (recusa total — comportamento novo
     documentado);
  6. **Fora do bug:** inventario vivo (read-only), reparo/fusao de dados com decisao humana
     caso a caso, campo de inativos, prevencao em `signup-handler`.
- AC do bug.md: AC1, AC2, AC4, AC5 atendidos por este change set; AC3 (inativos) e AC6
  (fluxo de matricula) pertencem a itens separados — registrar no adendo.

## Riscos e efeitos colaterais

- **Falso positivo (homonimos distintos, mesmo nome exato):** aceito, mitigado por badge +
  e-mails visiveis + selo quando CPF diverge + inventario como gate de reparo. Nao
  eliminavel com os dados existentes (CPF comprovadamente nao serve).
- **Falso negativo (PESSOA 13/PESSOA 14, typo):** continua 2x — seguro, igual ao hoje; vai ao
  inventario. Preferivel a ocultar gente.
- **Reset parcial:** CONTINUAR + agregacao + toast honesto `X de N` (nunca "sucesso" se
  houve falha); re-run idempotente. Nenhuma FK/matricula tocada (escrita de senha via edge
  existente).
- **Grupo com admin/master perde o botao** (regra conservadora minha): mudanca de
  comportamento documentada no adendo; alternativa (resetar so contas nao-protegidas)
  rejeitada por criar reset seletivo silencioso.
- **Total muda (154 -> nº de pessoas):** esperado, comunicar como correcao.
- **Reversibilidade:** apagar `person-groups.ts` + reverter trecho de `directory.ts` +
  remover wrapper -> estado anterior exato; zero dado mutado; inventario e markdown.
- **Performance:** O(n), n~=154 — irrelevante.

## Evidencias

- `bug.md` (AC, Agent Notes: nao apagar contas; reset todas; efeito no reset).
- `debate/problema.md` (rubrica; restricoes a-e; decisao do usuario; dados 191/25/27).
- `evidence/reproduction.md` (25 grupos por nome = mesma pessoa; 27 colisoes de CPF com
  falsos positivos; Total 154 = pos-dedup).
- `evidence/contas-duplicadas-PESSOA 12.md` (2 contas, CPF `NULL`, matricula ativa; motivo
  da dedup de 22/09 falhar).
- `src/views/directory.ts:100-150`, `src/auth/session.ts:134-142`,
  `src/auth/signup-handler.ts:18-28`, `src/lib/admin-service.ts:343-439`,
  `src/lib/cpf-service.ts` (`listarInconsistenciasCPF` p/ inventario),
  `src/components/search-palette.ts:62` (padrao de normalizacao de nome ja usado),
  `scripts/dedup-merge.mjs:139`.
- `_reversa_sdd/admin/requirements.md` (spec-gap da listagem).
- `debate/rodada-0/agente-2.md`, `debate/rodada-0/agente-3.md` (objeto da critica).

## Confianca

**alta.** A rodada 1 nao enfraqueceu a proposta: a analise de equivalencia mostra que a
chave por nome e comportamentalmente tao completa quanto a arquitetura em camadas do
agente-2, com metade do codigo e imunidade estrutural a repeticao do bug de 22/09; a
decisao CONTINUAR-no-erro fecha o unico ponto onde o agente-3 divergia de forma
operacionalmente perigosa; inventario e sinais no card vem dos pares e tornam o falso
positivo gerenciavel. Residual: homonimos reais com mesma grafia (mitigado, nao
eliminavel).

## Critica as demais propostas

### Agente-2 (identidade em 3 camadas + ponte + enum de flags)

**Bom:**

- Modulo puro separado da view (igual ao meu), exibicao-only, reversibilidade declarada,
  wrapper de reset multi-id em `admin-service` (mesma conclusao que eu);
- Correta recusa de CPF como fusao silenciosa (PESSOA 8 x PESSOA 7) e coragem de tratar o casal
  "mesmo nome + CPFs divergentes" como colapso com sinal — mesma conclusao que a minha;
- Reparo desacoplado com inventario + fusao sob aprovacao humana: alinhado a rubrica.

**Fragil:**

1. **Complexidade sem contrapartida comportamental.** Como demonstrado na secao Estrategia,
   Camada A + sub-grupo por nome + Ponte A-B + regra do item 4 produz *os mesmos grupos*
   que `perfil|nomeNormalizado`. Sao 3 camadas, 2 regras de ponte e um enum de 4 flags para
   obter labels que calculo com `new Set(cpfsNaoNulos).size > 1`. Maior `change_risk` e
   superficie de teste por zero ganho de agrupamento.
2. **Armadilha do bug de 22/09 embutida na arquitetura.** Qualquer deslize de
   implementacao (esquecer o sub-agrupamento por nome, fundir bucket A antes de olhar nome,
   ponte mal especificada) reintroduz *exatamente* a fusao por CPF que ja fracassou em
   producao. Minha chave e imune por construcao; a dele depende de cuidado procedural em
   toda camada. Nao e risco teorico: foi o bug que deixou PESSOA 12 fora do plano.
3. **Especificacao ambigua da ponte/regra 4.** "Grupo B fundido em grupo A unipes" (texto
   corrompido: `unipes soa-oal`) nao define o que acontece com 2+ grupos A de mesmo nome,
   nem B duplicado sem A. O item 4 chega como remendo fora da numeracao das camadas. Dois
   devs implementariam coisas diferentes; o meu e o do agente-3 tem uma linha de chave cada.
4. **Semantica de privilegio do reset indefinida** ("intocado", "calculada sobre o perfil
   do grupo" — mas o grupo pode conter perfis diferentes): hoje um card admin tem botao
   escondido para nao-master; agrupar sem regra explicita pode **reexpor** botao de reset
   para grupo que contem admin. Eu decido: recusa por grupo.
5. **Falso positivo/negativo:** identicos ao meu (aceitos) — logo, os flags sao o unico
   delta real, e eu os adoto em forma simplificada.

**Risco de reproduzir o bug da dedup de 22/09:** alto se a camada A for implementada como
chave primaria de fusao sem sub-grupo; mitigado so por disciplina. Rejeito a arquitetura,
adozo os sinais.

### Agente-3 (chave `perfil|nome` + inventario — o mais proximo do meu)

**Bom:**

- Mesma chave de identidade que a minha, chega as mesmas conclusoes sobre PESSOA 12, PESSOA 5
  BEATRIZ e PESSOA 8 x PESSOA 7; **menor mudanca coerente** bem argumentada;
- Detalhe valioso do **sort por nome do grupo** (peguei);
- **E-mails distintos visiveis** no card (peguei — melhora minha, que so propunha ids);
- **Inventario vivo concreto** com caminho de arquivo (peguei — a minha mencao era difusa);
- `cpf_conflitante` como sinal nao-bloqueante: base do meu selo "CPFs divergentes";
- Reconhece explicitamente que corrigir dados primeiro nao resolve (tela seguiria fragil
  por `signup-handler`).

**Fragil:**

1. **Loop de reset PARA NO PRIMEIRO ERRO — divergencia critica.** A decisao do usuario e
   resetar **TODAS** as contas da pessoa. Parar no id 1 falho deixa as contas 2..N com
   senha antiga e o resultado fica **indecidivel para o admin**: o toast agregado nao
   distingue "parou no primeiro" de "resetou todas"; a pessoa fica com senhas
   **misturadas** (parte `csm1983#`, parte antiga) — precisamente o estado que a decisao
   quer evitar, e agora invisivel. Pior: uma falha transitoria da edge no primeiro id
   bloqueia o restante sem necessidade. Ver secao propria da decisao: CONTINUAR.
2. **Loop no handler do DOM.** "O handler chama `resetUserPassword` para cada id" com
   wrapper so *opcional* — logica de negocio (agregacao, auditoria, ordem, toast) dentro de
   listener e nao testavel pelos testes unitarios que ele mesmo prevem, e contradiz a
   virtude do modulo puro que ele prega para o grouping. Wrapper em `admin-service` deve
   ser obrigatorio (eu e agente-2 concordamos nisso).
3. **Restricao admin/master ignorada** — mesmo buraco do agente-2; agrupar sem regra de
   privilegio por grupo pode reexpor reset de conta admin protegida.
4. **Selo "revisar" anota, mas nada consumira** ate o inventario virar fluxo; ok como
   esta (sinal para a secretaria), desde que o inventario de fato seja gerado — adotei com
   essa condicao.
5. Confianca declarada **media** vs minha alta: coerente com a lacuna do reset; com a
   semantica CONTINUAR fechada, o delta cai.

**Falso positivo/negativo:** iguais aos meus — homonimos colapsam com pista; typo fica 2x.
Nenhum dos tres e superior aqui; o desempate e complexidade (eu e agente-3 empatados) e
semantica de erro do reset (agente-3 perde).

## Decisao: o loop de reset deve PARAR ou CONTINUAR no primeiro erro?

**Decisao: CONTINUAR, agregando erros (mantenho o teste 10 da rodada 0; rejeito o
agente-3).** Justificativa:

1. **Fidelidade a decisao do usuario (restricao d).** "Resetar TODAS as contas da pessoa"
   e obrigacao do change set. Parar no primeiro erro entrega, por definicao, um resultado
   **parcial sob rotulo de operacao unica** — viola a restricao no modo exato que ela
   existe para prevenir.
2. **Observabilidade da falha parcial.** CONTINUAR produz, numa unica passada, o estado
   completo `{ resetados: [ids], erros: [{id, message}] }`: o admin sabe **quem** mudou e
   **quem** nao mudou. PARAR produz "id 1 falhou; 2..N em estado desconhecido (nem
   tentados)" — o toast tem de mentir ou expor semantica de "abortado", e a secretaria nao
   sabe se a PESSOA 12 loga com a senha nova.
3. **Seguranca da rotacao de credencial.** O proposito do reset e trocar a senha. Senhas
   **misturadas** dentro do mesmo grupo de "uma pessoa" sao pior do que uma troca
   parcialmente comunicada: alguem com a senha antiga de 1 de N contas segue valido sem que
   o admin perceba. CONTINUAR + toast `X de N` + lista de falhos torna o residual visivel e
   reexecutavel.
4. **Idempotencia torna o retry seguro.** `resetUserPassword` grava a senha conhecida
   (`csm1983#`); re-executar ids falhos apos falha transitoria e inocua. O custo de tentar
   os demais e ~1 chamada extra de edge por conta — irrelevante (N tipicamente 2-3) — e o
   ganho e completude.
5. **Contra-argumento do agente-3 (evitar martelar a edge Function falhando) e fraco:**
   N~=2-3, tentativa unica por id, loop sequencial, sem retry em cadeia. Para o unico
   cenario onde abortar seria racional — **erro de permissao/autorizacao** (todos os
   demais ids falhariam igual) — basta tratar classe de erro deterministica: o grupo com
   admin/master nem emite o botao, e no wrapper `PermissionError` aborta o loop
   (break) preservando a agregacao dos ja tentados. Ou seja: **continue por padrao; aborte
   so por erro de permissao**, que e deterministico e nao-retryable.

Toast minimo exigido do wrapper: `"Senha de {resetados.length} de {ids.length} contas de
{nome} resetada"` + detalhe dos erros — **nunca** mensagem de sucesso pleno com falha
presente.
