---
protocol_version: 1
debate_id: BUG-20260924-6LSJ-r2
bug_id: BUG-20260924-6LSJ
role: solver
solver_id: agente-2
engine: local
round: 2
status: ok
started_at: 2026-09-24T15:23:29Z
finished_at: 2026-09-24T15:42:00Z
---

# Solver agente-2 — BUG-20260924-6LSJ (rodada 2 — proposta FINAL consolidada)

## Estratégia de correção

**Correção 100% de exibição, reversível, sem escrita em banco.** Um card por pessoa por seção,
chave de identidade = `perfil | nome normalizado` (CPF **nunca** é chave de fusão; só sinaliza),
`Total:`/badges contam **pessoas únicas**, Resetar Senha reseta **todas** as contas do grupo
continuando em erro. Pontos de conflito resolvidos abaixo com decisão única e fechada.

### 1. Nome do módulo puro e API — DECISÃO FINAL

**`src/lib/person-groups.ts`** (arquivo escolhido — mesmo do agente-1 e agente-3; o meu nome da
rodada 1, `person-grouping.ts`, é abandonado por explicitude menor e pela maioria dos pares).

```ts
// src/lib/person-groups.ts  (puro, sem DOM e sem Supabase)
export interface PessoaGrupo {
  chave: string            // `${perfil}|${nomeNormalizado}` (ou fallback)
  perfil: string           // seção do grupo (todo grupo é homogêneo de perfil)
  nomeExibido: string      // primeira linha não-vazia do grupo (para sort e card)
  ids: string[]            // todos os ids, deduplicados, ordem estável
  emails: string[]         // e-mails distintos, para sub-linha "N contas · e-mails"
  cpfsNaoNulos: string[]   // CPFs normalizados não-nulos distintos
  cpfConflitante: boolean  // cpfsNaoNulos.length > 1  (selo "⚠ revisar · CPFs divergentes")
}

export function normalizarNomeIdentidade(n: string): string
// NFD -> remove acentos -> lowercase('pt-BR') -> colapsa espaços/trim

export function agruparPorPessoa(profiles: UserProfile[]): PessoaGrupo[]
// chave = `${p.perfil}|${normalizarNomeIdentidade(p.nome_completo)}`
//         || `${p.perfil}|${p.email.trim().toLowerCase()}`
//         || p.id          // fallback final: vazios NUNCA colapsam entre si
```

`renderProfileSection` filtra por perfil → `agruparPorPessoa` → um card por grupo. O `session.ts`
continua cru (a view precisa das linhas brutas para resetar por id). Assinaturas: `agruparPorPessoa`
(plural, "pessoas") e `normalizarNomeIdentidade` — únicas, sem alias.

### 2. Chave do grupo e fallback de nome vazio; Total/badge

Regra fechada (equivalente nos três — adoto a forma com `perfil` **na** chave, que garante escopo
sem cláusula extra):

```
chave = perfil | nomeNormalizado   (nome normalizado/vazio?)
     || perfil | email(lower, trim)
     || id                          (vazios sem email nunca colapsam: id é único)
```

- **Total:` = Σ grupos** em todas as seções (não `profiles.length` — corrige 154 para o nº de
  pessoas do banco vivo).
- **Badge por seção** = Σ grupos daquela seção.
- **Sort** por `nomeExibido` do grupo (não linha crua).
- Card com N>1 exibe sub-linha discreta **"N contas · e-mails: …"**; quando `cpfConflitante`,
  selo **"⚠ revisar · CPFs divergentes"** (não-bloqueante). Nada fica oculto sem pista.

### 3. Loop de reset — DECISÃO FECHADA: CONTINUAR agregando; única parada prévia por privilégio

**Assinatura única do wrapper no `AdminService`:**

```ts
// src/lib/admin-service.ts
import { resetUserPassword } ...  // assinatura existente INTOCADA

async resetUserPasswords(
  userIds: string[],       // deduplicados ANTES do loop (Set preservando ordem)
  nome: string,            // nome exibido do grupo (para auditoria/toast)
): Promise<{
  ok: boolean;             // ok === erros.length === 0
  resetados: string[];     // ids com reset concluído
  erros: { id: string; message: string }[];
}>
```

Semântica:
- Itera `resetUserPassword` **sequencialmente** por id; **falha num id NÃO corta os demais**
  (continua agregando em `erros`).
- Audita por conta (o próprio `resetUserPassword` já grava `AuditService.log` por id — intocado).
- `ok=false` sempre que houver qualquer erro; toast **nunca** é de sucesso pleno com falha
  presente: `"Senha de X de N contas de {nome} resetada"` + lista clara de ids/e-mails falhos
  (retry cirúrgico e idempotente — `resetUserPassword` grava a senha conhecida `csm1983#`).
- **Única parada é PRÉVIA e por privilégio, não por erro de execução:** o botão nem é emitido
  quando o grupo tem qualquer membro `master_admin` (ou `admin` com viewer não-master) — recusa
  conservadora do grupo inteiro, avaliada antes de iterar. Nenhuma cláusula de aborto por erro
  de endpoint; classe `PermissionError` não existe no caminho porque o privilégio foi barrado na
  renderização.
- O **handler no DOM** apenas lê `data-ids` (JSON array) e chama `resetUserPasswords` — sem
  lógica de loop/agregação no listener (testável).

### 4. Inventário vivo — DECISÃO: PARTE deste bug, somente leitura

É parte do bug como **etapa read-only de evidência** (não do change set de código): sem ela, o
falso-colapso residual fica **invisível para quem opera a tela** e o reparo futuro perde o gate.
Nenhuma escrita; nenhuma linha de `perfis` tocada.

Comando read-only (rodar com o usuário, que tem acesso ao banco vivo):

```bash
# SQL de leitura — mesma chave da view (perfil | nomeNormalizado), agrupando ativos.
# Filtro igual ao de getAllProfiles(): status='ativo' AND cadastro_desativado=false.
SELECT
  p.perfil,
  normalize_nome(p.nome_completo) AS chave_nome,
  COUNT(*) AS n_contas,
  array_agg(p.id)  AS ids,
  array_agg(p.email) AS emails,
  count(DISTINCT NULLIF(btrim(p.cpf), '')) > 1 AS cpf_conflitante
FROM public.perfis p
WHERE p.status = 'ativo' AND p.cadastro_desativado = false
GROUP BY p.perfil, normalize_nome(p.nome_completo)
HAVING COUNT(*) > 1
ORDER BY p.perfil, chave_nome;

# complemento: classes de colisão de CPF (PESSOA 8×PESSOA 7, PESSOA 13×PESSOA 14)
SELECT cpf, array_agg(DISTINCT nome_completo) AS nomes, count(*) AS n
FROM public.perfis
WHERE cpf IS NOT NULL AND cpf <> ''
  AND status = 'ativo' AND cadastro_desativado = false
GROUP BY cpf HAVING count(DISTINCT nome_completo) > 1;
```

(normalize_nome = função SQL equivalente a `normalizarNomeIdentidade`, ou roda local pelo parser
já usado na reprodução; `CpfService.listarInconsistenciasCPF()` cobre o segundo bloco.)

Saída gravada em `evidence/inventario-vivo-20260924.md` (ids, e-mails, CPFs, matrículas ativas,
flag, homônimos suspeitos) — alimenta a decisão humana de reparo futuro, **fora** do change set.

### Passos de implementação (fechados)

1. **`src/lib/person-groups.ts`** (NOVO, puro) — `normalizarNomeIdentidade`, `agruparPorPessoa`.
2. **`src/views/directory.ts`** — `renderProfileSection` → agrupa → 1 card/grupo; badge e
   `totalUsers` = Σ grupos; sort por `nomeExibido`; sub-linha "N contas · e-mails" + selo de
   CPF divergente; botão com `data-ids` JSON; handler chama `resetUserPasswords` (sem loop no
   DOM). Restrição de privilégio por grupo avaliada na renderização.
3. **`src/lib/admin-service.ts`** — `resetUserPasswords(userIds, nome)` (novo; `resetUserPassword`
   intocado).
4. **Testes:** `src/lib/person-groups.test.ts` + `src/lib/admin-service.pessoa.test.ts`.
5. **Inventário vivo:** rodar SQL/SQL read-only + gravar `evidence/inventario-vivo-YYYYMMDD.md`.
6. **NÃO tocar:** `session.ts`, `signup-handler.ts`, `cpf-service.ts`, banco/schema/FKs/Edge.

## Causa raiz proposta

Confirmada, unânime, fora da disputa — e agora com a divisão explícita que este bug exige:

- **Nascença (prevenção, item separado):** `signup-handler.ts:18-28` — guarda `if (cpf)`; sem CPF
  o cadastro cria conta livremente (origem da 2ª conta PESSOA 12, 10/09). Não é alvo deste fix.
- **Persistência:** `perfis` sem unique por identidade; `uniq_perfis_cpf_ativo` só desde 22/09 e
  só cobre CPF não-nulo.
- **Aparição (alvo do fix):** `session.ts:134-142` devolve cru + `directory.ts:100-150` renderiza
  1:1 e conta `Total = profiles.length`. É aqui que a duplicata vira DEFEITO.
- **Por que restou:** `dedup-merge.mjs:139` (`if (!c) continue`) agrupou só por CPF e pulou CPF
  `NULL` (PESSOA 12) e CPF divergente (3ª PESSOA 5 BEATRIZ) — Total 154 = 191 − 37.

## Teste

**`src/lib/person-groups.test.ts`** (puro, padrão `cpf-service.test.ts`):
1. PESSOA 12 (CPF `***.***.***-**` + CPF `NULL`, mesmo nome, mesmo perfil) → **1 grupo, 2 ids**,
   `cpfConflitante=false` (requisito b; caso que a dedup de 22/09 não cobriu).
2. PESSOA 5 BEATRIZ (mesmo nome, CPFs não-nulos distintos) → **1 grupo, `cpfConflitante=true`**
   (requisito a + sinal; decisão do usuário: 1 linha).
3. **Regressão anti-22/09:** PESSOA 8 × PESSOA 7 (CPF `***.***.***-**` igual, nomes distintos) →
   **2 grupos** (CPF jamais funde nomes distintos — restrição c).
4. PESSOA 13 × PESSOA 14 ×2 (`***.***.***-**` igual, nome com 1 letra de diferença) → **2 grupos**
   (falso-negativo seguro preservado; vai ao inventário).
5. Normalização: acento/caixa/espaço duplo → 1 grupo; **nome vazio → fallback email**, depois id;
   dois vazios sem email **não** colapsam.
6. Escopo: mesmo nome em `aluno` × `professor` → 2 grupos (perfil na chave).
7. **Total/`badge`:** 2 linhas PESSOA 12 → total de pessoas 1 (bloqueia regressão do Total).

**`src/lib/admin-service.pessoa.test.ts`** (mock `./supabase`, `./audit-service`):
8. `resetUserPasswords(['a','b'], nome)` → 2 chamadas de `resetUserPassword`, 2 auditorias
   (decisão do usuário: TODAS as contas).
9. **Continua-agregando:** `a` falha, `b` OK → `b` ainda é resetado; `resetados=['b']`,
   `erros=[{id:'a',...}]`, `ok=false` (prova da decisão CONTINUAR).
10. Erro em todos → `resetados=[]`, `erros` completo; re-execução segura (idempotente).
11. `userIds` com id repetido → deduplicado antes do loop (1 chamada por id).
12. Grupo com `master_admin`/`admin` → removePrivilegiado: botão não é emitido (helper de
    privilégio por grupo — decisão de renderização, testável).

Regressão: `npm run test` + `npm run type-check` + manual (PESSOA 12 1x com badge "2 contas · …";
Total cai; reset de grupo de 2 → login das duas contas com `csm1983#`).

## Impacto sobre a spec

- `spec-gap` confirmado (`_reversa_sdd/admin/requirements.md`: RF-05 é só "Listar alunos"; RF-02
  de reset por id continua válida — o wrapper chama a mesma função por conta).
- **Adendo em `_reversa_sdd/addenda/`** com decisões fechadas:
  1. Listagem "uma linha por pessoa por seção"; chave = `perfil | nome normalizado`; **CPF não é
     chave de fusão** (falsos positivos PESSOA 8×PESSOA 7/PESSOA 13-PESSOA 14 documentados como justificativa).
  2. `Total:`/badges contam **pessoas únicas**; sort por nome do grupo.
  3. Card N>1 → "N contas · e-mails"; selo "⚠ revisar · CPFs divergentes" quando houver.
  4. Reset na linha única reseta **todas** as contas; falha parcial **não interrompe**; toast
     `X de N` + lista de falhos (nunca sucesso pleno com falha); retry idempotente.
  5. Privilégio admin/master avaliado **por grupo** (recusa total; comportamento novo documentado).
  6. **Fora do change set:** prevenção em `signup-handler`, reparo/fusão de dados com decisão
     humana caso a caso, campo de inativos (AC3), pré-requisito da AC6 (fluxo de matrícula).
     **Dentro do bug, read-only:** inventário vivo (evidência que gateia o reparo).
- AC1, AC2, AC4, AC5 atendidos; AC3 e AC6 em itens separados — registrar no adendo.

## Riscos e efeitos colaterais

- **Falso-colapso de homônimos reais** (grafia idêntica, CPFs distintos corretos): residual,
  aceito por decisão do usuário (PESSOA 5 BEATRIZ = 1 linha); mitigado por "N contas · e-mails" +
  selo de CPF divergente + inventário vivo como gate. Não eliminável: distinguir "CPF digitado
  errado da mesma pessoa" de "homônimos com CPF certo" exige fonte de verdade que não existe.
- **Falso-negativo (PESSOA 13/PESSOA 14):** fica 2x — igual a hoje, seguro; vai ao inventário.
- **Reset parcial:** CONTINUAR + agregação + toast honesto `X de N` com falhos explícitos;
  re-run idempotente (grava senha conhecida). Zero FK/matrícula tocada (mesmo caminho RPC).
- **Grupo com admin/master perde o botão** — recusa conservadora; alternativa (reset seletivo
  não-protegido) rejeitada por criar reset parcial silencioso.
- **`Total:` cai (154 → pessoas):** correção esperada; comunicar no adendo.
- **Pessoa em 2 perfis** aparece nas duas seções — igual ao atual, documentado.
- **Performance:** O(n) em memória (~200 linhas) — irrelevante.
- **Reversibilidade:** apagar `person-groups.ts` + reverter trecho de `directory.ts` + remover
  wrapper → estado anterior exato; zero dado/banco mutado; inventário é markdown.

## Evidências

- `bug.md` (AC; Agent Notes: não apagar contas; reset TODAS; atenção ao alvo do reset).
- `debate/problema.md` (rubrica; restrições a–e; decisão do usuário; 191/25/27; Total 154 pós-dedup).
- `evidence/reproduction.md` (25 grupos por nome; 27 colisões de CPF com falsos positivos;
  casos residuais = CPF NULL/divergente).
- `evidence/contas-duplicadas-PESSOA 12.md` (2 contas, CPF `NULL` 10/09, matrícula ativa; por que a
  dedup de 22/09 falhou).
- Código lido nesta rodada: `src/views/directory.ts:95-201` (render 1:1, badge `filtered.length`,
  `Total = profiles.length`, handler reset por `id` único via `data-id` — alvo exato do fix),
  `src/lib/admin-service.ts:343-438` (`resetUserPassword` por id + auditoria — reusado), além de
  `src/auth/session.ts:134-142`, `src/auth/signup-handler.ts:18-28`,
  `src/lib/cpf-service.ts` (`listarInconsistenciasCPF`), `scripts/dedup-merge.mjs:139`,
  `_reversa_sdd/admin/requirements.md` (spec-gap).
- Rodadas 0/1: `debate/rodada-0/agente-2.md` (minha r0), `debate/rodada-1/agente-1.md`,
  `debate/rodada-1/agente-3.md`.

## Confiança

**alta.** O mecanismo fechado (chave `perfil|nome`, CPF só sinaliza, reset continua-agregando,
parada única prévia por privilégio, inventário read-only dentro do bug) produziu a MESMA partição
nos três debates, eliminou a foot-gun do CPF-primeiro por construção, é 100% testável e revertível
sem tocar em dado ou schema. Residual: homônimos de grafia idêntica (mitigado, não eliminável) e a
escolha de produto "PESSOA 5 BEATRIZ = 1 linha" (selo + inventário como costura).

## Crítica às demais propostas

### Agente-1 (rodada 1) — a mais convergente com a minha

**Adoto:** módulo puro `person-groups.ts`; CPF excluído da chave com imunidade estrutural;
fallback email→id; badge "N contas" + e-mails + selo de CPF divergente; privilégio por grupo;
reset multi-contas CONTINUAR-agregando; inventário concerto (ele absorveu do agente-3).

**Divergências que resolvo contra ele:**
1. **Privilégio "por grupo se qualquer membro é master/admin" é mais complexo que o necessário.**
   Como o `perfil` está na chave, todo grupo é **homogêneo de perfil** — a regra existente do
   card se aplica por grupo sem cláusula "se qualquer membro". Mantenho a recusa conservadora de
   resultado (idêntica), mas a implemento como checagem do perfil do grupo, não por varredura de
   membros.
2. **Ele aceitou o selo de CPF divergente apenas como "forma simplificada" e manteve o foco em
   "CPF rejeitado por completo".** Não é só cosmético: é o discriminador que torna o
   falso-colapso **auditável na tela** (PESSOA 5 BEATRIZ visível como "revisar" vs PESSOA 12 como
   "duplicata confiável"). Sem ele, o operador não distingue as duas classes do resíduo. Custo:
   1 linha (`new Set(cpfsNaoNulos).size > 1`).
3. Nada mais: nas demais esta 100% alinhado. Crítica de fundo: a crítica dele à minha r0 era
   sobre a camada de CPF primário — e a rodada 1 mostrou que, com o sub-agrupamento preservado
   por teste, o resultado final dele = o meu resultado final (mesma partição), diferença só em
   número de regras. Aceita a simplificação, eliminou-se a polêmica.

### Agente-3 (rodada 1)

**Adoto:** `person-groups.ts`; chave `perfil|nome` (idêntica à minha); selo `cpfConflitante`;
sort por nome do grupo; inventário read-only concreto com caminho de arquivo; reset contínuo
(reavaliou e trocou PARAR por CONTINUAR — mesma conclusão minha desde a r0).

**Divergências que resolvo contra ele:**
1. **Confiança "alta" com ressalva de homônimo — ok; mas ele deixou duas decisões soltas que a
   rodada 2 precisa fechar:** (a) o arma nome do wrapper varia (`resetUserPasswords`), o do
   agente-3 propõe `resetUserPasswords`; (b) a parada prévia por privilégio foi assumida por
   "grupos homogêneos de perfil" mas sem assinatura explícita do wrapper nem cláusula de
   deduplicação de ids. Fecho: `resetUserPasswords(userIds, nome)` com dedup de ids no topo e
   privilégio avaliado na renderização.
2. **O toast dele fica implícito** ("mensagem lista quem resetou e quem falhou") — necessário
   garantir o formato `X de N` e a proibição de sucesso pleno com falha (minha exigência).
3. Nenhum desacordo substantivo remanescente — a crítica recíproca sobre "CPF fora até como
   metadado" foi resolvida a favor dele: o selo fica.

### Ponto de litígio residual — resolução final

O único desacordo real da rodada 1 foi **PARAR × CONTINUAR no 1º erro do reset** — e fechou
**unânime em CONTINUAR** (agente-3 mudou de lado com justificativa sólida; eu e agente-1 já
estávamos nela). A decisão desta rodada 2 a torna definitiva nos termos: CONTINUAR agregando por
padrão; **nenhuma** parada por erro de execução; a única parada é **prévia, por privilégio**
(grupo com `master_admin`/`admin` vulnerável não emite botão). Assinatura e modelo de retorno
definidos na seção 3 — sem ambiguidade de implementação entre os três solvers.