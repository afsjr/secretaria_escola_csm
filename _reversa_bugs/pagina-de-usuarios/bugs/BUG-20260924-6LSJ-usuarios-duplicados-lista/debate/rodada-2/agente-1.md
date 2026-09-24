---
protocol_version: 1
debate_id: BUG-20260924-6LSJ-r2
bug_id: BUG-20260924-6LSJ
role: solver
solver_id: agente-1
engine: local
round: 2
status: ok
started_at: 2026-09-24T18:10:00Z
finished_at: 2026-09-24T18:35:00Z
---

# Agente-1 — Rodada 2 (FINAL) — BUG-20260924-6LSJ — proposta consolidada

Três propostas da rodada 1 convergiram no núcleo: **correção 100% de exibição,
módulo puro testável fora da view, chave = nome normalizado escopado por perfil,
CPF nunca é chave de fusão, wrapper de reset multi-contas que CONTINUA agregando
erros, inventário vivo read-only, zero escrita em banco e reversibilidade por diff.**
Restam quatro conflitos de nomeação/semântica; resolvo cada um abaixo com o
argumento mais forte antes de fechar a estratégia.

## Resolução dos conflitos remanescentes

### 1. Nome do módulo puro e API — **`src/lib/person-groups.ts`** (único e coerente)

**Decisão:** arquivo `src/lib/person-groups.ts`, exportando `normalizarNomeIdentidade`,
`agruparPorPessoa(profiles): PersonGroup[]` e o tipo `PersonGroup`.

- Dois dos três solvers (eu e agente-3) já usavam `person-groups.ts`; agente-2 usava
  `person-grouping.ts`. Um substantivo plural descreve o **artefato de domínio** que o
  módulo produz (o "grupo de contas da pessoa"), coerente com a taxonomia de `src/lib/`
  (`cpf-service`, `security`, `authz`); o gerúndio `-grouping` descreve o processo e soaria
  estranho ao lado dos outros módulos que nomeiam entidades.
- API final (fechada, imutável):

```
type PersonGroup = {
  perfil: string;            // seção (parte da chave → grupos sempre homogêneos de perfil)
  nomeExibido: string;       // 1º nome_completo não-vazio do grupo, ordenado; fallback → email
  ids: string[];             // ids das contas (para data-ids do reset)
  emails: string[];          // e-mails distintos, em ordem
  cpfsNaoNulos: string[];    // só para o selo; NUNCA participa da chave
  cpfConflitante: boolean;   // distintos não-nulos > 1 (selo "CPFs divergentes")
}
function normalizarNomeIdentidade(texto): string   // NFD → remove acentos → lowercase → colapsa espaços
function agruparPorPessoa(profiles): PersonGroup[] // chave perfil|nome||email||id
```

- **Consequência que simplifica o privilégio do reset:** como a chave inclui `perfil`,
  todo grupo é **homogêneo de perfil**. Logo a regra `canReset` hoje per-card em
  `directory.ts:51-59` vale **por grupo sem alteração** e sem a cláusula "se qualquer
  membro" — isso neutraliza o ponto que eu mesmo levantei na rodada 1 contra arquiteturas
  com grupos heterogêneos e dá razão ao agente-3. Não há função nova de privilégio.

### 2. Tratamento de resto (fallback exato de nome vazio) e o que Total/badge exibem

**Decisão (regra exata, fechada):**

```
chaveGrupo = `${p.perfil}|${normalizarNomeIdentidade(p.nome_completo)}`
             || `${p.perfil}|${p.email.trim().toLowerCase()}`     // nome vazio → email
             || p.id                                              // nome e email vazios → id
```

- Dois perfis com **nome e email vazios nunca colapsam entre si** (caem no `|| p.id`:
  cada um é seu próprio grupo). Seguro contra "fundir desconhecidos".
- `nomeExibido` do grupo = primeiro `nome_completo` não-vazio (ordem do input já
  ordenada por nome) ; se todos vazios → primeiro email não-vazio; se nada → `"(sem nome)"`.
- Badge **"N contas"** + lista de e-mails distintos: **só quando N > 1**. Grupo singleton
  renderiza exatamente como hoje (zero regressão visual para a maioria).
- **Total e badges de seção contam grupos** (`Σ person-groups`), nunca `profiles.length`.
  `Total` quebra de 154 → nº de pessoas únicas no banco vivo (esperado; comunicar).

### 3. Loop de reset — **confirma-se CONTINUAR agregando; única parada prévia é por privilégio de grupo**

Os três solvers convergiram para CONTINUAR no erro. Confirmo e **refino a minha rodada 1**:
**abandono a cláusula de "break por erro de permissão no meio do loop"** que eu havia
proposto. Justificativa:

- A única parada é **prévia**: o botão nem é emitido se o grupo contém conta privilegiada
  (`master_admin` sempre; `admin` quando o viewer não é master). Como grupos são homogêneos
  de perfil, essa checagem prévia **cobre o caso inteiro** — não existe cenário legítimo de
  permissão bloqueada no meio de um loop que já passou a guarda.
- Classificar a classe do erro retornado pela Edge Function é frágil (o contrato retorna
  `{ message }` genérico em `admin-service.ts:84-105,386`); codificar um aborto por classe
  adicionaria teste/matutenção para um caminho que a regra prévia já elimina.
- Comportamento fechado: **itera todos os ids, continua em qualquer erro, deduplica ids
  antes do loop**, retorna `{ ok: ids.length === resetados.length, resetados: string[],
  erros: { id, message }[] }`, audita por conta (já feito dentro de `resetUserPassword`).
  Toast: `"Senha de X de N contas de {nome} resetada"` + detalhe dos falhos — **nunca**
  sucesso pleno com falha presente.

### 4. Inventário vivo — **faz parte deste bug como etapa de verificação READ-ONLY (fora do change set)**

**Decisão:** incluído na **execução/validação do bug**, mas **não no change set/commit**.
Racional: a evidência que temos é de backup **PRÉ-dedup**; o banco vivo é a única fonte da
contagem real (CAMILLY e MARIA BEATRIZ mudaram de 191→154 e podem ter divergido de novo), e
o bug exige alimentar decisão humana de reparo caso a caso. Um passo de leitura pura tem
custo ~zero e valor de fechamento da causa raiz.

Comandos de leitura (sem escrita, sem transação):

```sql
-- (1) SQL de leitura com a MESMA chave da tela (perfil|nome-normalizado)
SELECT id, nome_completo, email, cpf, perfil, status, cadastro_desativado, created_at
FROM perfis
WHERE (status IS NULL OR status <> 'inativo')
  AND cadastro_desativado IS NOT TRUE
ORDER BY nome_completo;
```

```ts
// (2) CpfService.listarInconsistenciasCPF()  — read-only, cobre CPFs duplicados + sem CPF
```

O resultado é agrupado em memória por `agruparPorPessoa` (mesma função da tela) e gravado em
`evidence/inventario-vivo-YYYYMMDD.md`: por grupo → ids, e-mails, CPFs, matrículas ativas
(leitura em `matriculas` se necessário), `cpfConflitante`, homônimos suspeitos com CPF
divergente. **Zero escrita** em `perfis`; reparo/fusão/desativação permanecem item de
produto com decisão humana, fora do bug.

## Estratégia de correção (consolidada e final)

Keep a menor mudança coerente, reversível, sem escrita em banco:

1. **`src/lib/person-groups.ts` (NOVO, puro):** `normalizarNomeIdentidade` +
   `agruparPorPessoa` + tipo `PersonGroup`, conforme seção 1/2.
2. **`src/views/directory.ts`:** `renderProfileSection` agrupa por `agruparPorPessoa` →
   um card por grupo; badge "N contas · e-mails" e selo "CPFs divergentes" quando couber;
   sort por `nomeExibido` do grupo; Total e badges de seção = Σ grupos; botão carrega
   `data-ids` (JSON) e `data-nome`; `canReset` reusa a regra atual por grupo (homogêneo).
3. **`src/lib/admin-service.ts`:** novo `resetarSenhasDaPessoa(ids, nome)` — deduplica ids,
   itera `resetUserPassword` (assinatura intocada) continuando em erro, retorna
   `{ ok, resetados, erros }`; nenhuma FK/matrícula tocada.
4. **Testes:** `src/lib/person-groups.test.ts` + `src/lib/admin-service.pessoa.test.ts`.
5. **NÃO tocar:** `session.ts`, `signup-handler.ts`, banco/schema/migrações, Edge Functions.

Reversibilidade: apagar `person-groups.ts` + reverter os dois pontos de `directory.ts` +
remover o wrapper → estado anterior exato; zero dado mutado.

## Causa raiz proposta

Inalterada (não é a disputa), agora **fechada por evidência do banco vivo** via inventário:
nascença em `signup-handler.ts:18` (`if (cpf)`); persistência sem unique por identidade
(`uniq_perfis_cpf_ativo` só cobre CPF não-nulo e só desde 22/09); aparição em
`session.ts:134-142` (linhas cruas) + `directory.ts:100,117,150,169` (render 1:1, badge e
`Total = profiles.length`, reset por id único); dedup de 22/09 (`dedup-merge.mjs:139`
`if (!c) continue`) pulou CPF NULL/divergente → CAMILLY e MARIA BEATRIZ-3a restam em
produção. O fix alvo é a camada de aparição; prevenção em `signup-handler` e reparo de dados
são itens separados.

## Teste

**`src/lib/person-groups.test.ts`** (puro, vitest):

1. CAMILLY (mesmo nome; CPF + CPF NULL, perfil aluno) → 1 grupo, `ids.length=2`,
   `cpfConflitante=false`, `nomeExibido` não-vazio (requisito b; caso da dedup de 22/09).
2. MARIA BEATRIZ (mesmo nome, CPFs não-nulos distintos) → 1 grupo, `cpfConflitante=true`
   (requisito a + sinal para inventário).
3. Gessica × Iara (CPF igual, nomes distintos) → **2 grupos** (prova estrutural: CPF nunca
   funde — regressão anti-22/09).
4. ANDREIA × ANDREA (CPF igual, nome com 1 letra de diferença) → 2 grupos (falso-negativo
   seguro preservado; vai ao inventário).
5. Normalização: acento/caixa/espaço duplo → 1 grupo; **nome vazio → email; nome vazio e
   email vazio → id (2 vazios-sem-email NUNCA colapsam)**; `nomeExibido` coerente.
6. Mesmo nome em `aluno` × `professor` → 2 grupos (chave inclui perfil; homogeneidade de
   grupo verificada).
7. Total = Σ grupos ≠ `profiles.length` com duplicata (bloqueia regressão do badge/Total).

**`src/lib/admin-service.pessoa.test.ts`** (mock `./supabase`, `./audit-service`):

8. `resetarSenhasDaPessoa(['a','a','b'])` → ids deduplicados (2 chamadas), 2 auditorias.
9. **Continua-agregando:** `a` falha, `b` e `c` ainda resetados → `resetados=['b','c']`,
   `erros=[{id:'a'}]`, `ok=false` (fecha a decisão CONTINUAR).
10. Erro em todos → `resetados=[]`, `erros` completo; re-execução é segura (idempotente).
11. Privilégio por grupo: grupo com `master_admin` → nenhum botão emitido; grupo `admin`
    com viewer não-master → nenhum botão (helper de view testado).

Regressão: `npm run test` + `npm run type-check`; validação manual no banco vivo via
inventário (CAMILLY 1x com badge "2 contas"; Total cai; reset de grupo de 2 → login das duas
contas com `csm1983#`).

## Impacto sobre a spec

- `spec-gap` confirmado: `_reversa_sdd/admin/requirements.md` tem RF-02 `resetUserPassword`
  e RF-05 `Listar alunos`, mas **nenhuma RF da listagem de usuários** — o adendo é
  obrigatório (senão `/reversa-audit` futuro reinforma o gap).
- **Adendo em `_reversa_sdd/addenda/`** (proposta, fora deste arquivo):
  1. Uma linha por pessoa por seção; chave `perfil | nomeNormalizado`; **CPF não é chave de
     fusão** (falsos positivos documentados); fallback nome vazio → email → id.
  2. Total/badges contam **pessoas** (grupos); sort por `nomeExibido` do grupo.
  3. Card N>1 exibe badge "N contas" + e-mails distintos; selo "CPFs divergentes" quando
     `cpfConflitante`.
  4. Reset na linha reseta **todas** as contas do grupo; erro de um id **não interrompe**;
     toast `X de N` + lista de falhos; re-execução idempotente; privilégio avaliado por
     grupo antes de iterar.
  5. Inventário vivo read-only alimenta decisão humana; reparo/fusão de duplicatas e
     prevenção em `signup-handler` = itens separados (decisão humana); campo de inativos
     = item de produto (já declarado fora do bug no intake).
- AC do bug.md: **AC1** (uma linha por pessoa) e **AC2** (Total por pessoa) e **AC4** (reset
  sem ambiguidade: wrapper por grupo) e **AC5** (testes de regressão) são atendidos por este
  change set; **AC3** (inativos) e **AC6** (fluxo de matrícula) pertencem a itens separados —
  registrado no adendo.

## Riscos e efeitos colaterais

- **Falso colapso de homônimos** (pessoas distintas, mesma grafia exata): residual inevitável
  — CPF comprovadamente não discrimina (Gessica×Iara, ANDREIA/ANDREA). Mitigado por e-mails
  visíveis + selo `cpfConflitante` + inventário como gate de reparo humano. Ninguém fica
  oculto sem pista.
- **Falso negativo** (typo de nome ANDREIA/ANDREA): continua 2 linhas, como hoje — seguro;
  vai ao inventário. Preferível a ocultar gente.
- **Reset parcial:** CONTINUAR + agregado + toast honesto `X de N`; sem estado misturado
  invisível e sem FK/matrícula afetadas (mesma Edge por id).
- **Total cai (154 → pessoas únicas):** esperado e comunicado como correção no adendo.
- **Grupo em 2 perfis** aparece nas 2 seções (igual ao atual; documentado).
- **Reversibilidade:** remover módulo/wrapper/trecho → estado exato; zero dado mutado.
- **Performance:** O(n) em ~200 linhas — irrelevante.

## Evidências

- `bug.md` (AC; Agent Notes: não apagar contas sem decisão humana; reset mira TODAS).
- `debate/problema.md` (rubrica; restrições a–e; dados 191/25/27; decisão do usuário).
- `evidence/reproduction.md` (25 grupos por nome; 27 colisões de CPF com falsos positivos;
  Total 154 = pós-dedup).
- `evidence/contas-duplicadas-camilly.md` (2 contas, CPF NULL 10/09, matrícula ativa; por
  que a dedup de 22/09 falhou).
- `src/views/directory.ts:51-59,100-150,169-198` (canReset; render 1:1; badge/Total; handler
  reset por id único — alvo exato do fix), `src/auth/session.ts:134-142`,
  `src/auth/signup-handler.ts:18`, `src/lib/admin-service.ts:343-438`,
  `src/lib/cpf-service.ts:75-104` (listarInconsistenciasCPF, read-only, p/ inventário),
  `scripts/dedup-merge.mjs:139`.
- `_reversa_sdd/admin/requirements.md` (spec-gap; RF-02/RF-05).
- `debate/rodada-1/agente-2.md`, `debate/rodada-1/agente-3.md` (objeto da crítica).
- `src/lib/validation.ts` (`normalizarCPF`, padrão de normalização usada no selo).

## Confiança

**alta.** Na rodada final os quatro pontos de conflito têm decisão fechada com o argumento
mais forte disponível: nome do módulo por convergência de 2/3 solvers e coerência de
taxonomia; fallback exato de resto com segurança contra fusão de desconhecidos; loop de
reset uniformizado em CONTINUAR com única parada prévia por privilégio; inventário vivo
incluído como leitura pura fora do change set. O mecanismo reparte corretamente todos os
casos evidenciados (CAMILLY, MARIA BEATRIZ, Gessica×Iara, ANDREIA/ANDREA), sem banco, sem
CPF na chave, sem FK e reversível por diff. Residual estrutural: homônimo de grafia idêntica
— mitigado por sinal visível + inventário humano, nunca eliminável com estes dados.

## Crítica às demais propostas

### Agente-2 (rodada 1)

**Convergência substantiva:** reframeou da arquitetura em 3 camadas para chave por nome,
adotou reset-continua e privilégio por grupo, e o adendo. Isso elimina praticamente toda a
minha objeção estrutural da rodada 0 (risk de re-elevar CPF a chave via Camada A) — a correção
agora é inconfundível neste agente.

**Pontos que permanecem:**
1. **Nome `person-grouping.ts` e tipo `PessoaDiretorio`:** divergência puramente cosmética;
   voto por `person-groups.ts`/`PersonGroup` por coerência com a taxonomia de `src/lib/` e
   por ser o nome já majoritário (eu + agente-3).
2. **Selo `possiveis-homonimos` como flag binária com load de "decidir depois":** a distinção
   `contas-duplicadas` × `possiveis-homonimos` me parece mais granularidade do que a tela
   precisa: o que diferencia o caso MARIA BEATRIZ do resto é precisamente `cpfs distintos > 1`
   — que é o meu `cpfConflitante` calculado com um `Set`. Dois enums/bandeiras por grupo
   adicionam casos de teste sem comprar decisão nova. Não é defeito, é simplicidade.
3. **Observação correta e endossada:** "nome como chave com sub-agrupamento por CPF =
   equivalente comportamental" — é a mesma prova que usei. Coerente.
4. **Sem ressalva ao loop:** alinhado (CONTINUA). 

Resultado: adoto de novo a taxonomia conceitual por trás dos flags **porém reduzida** à única
grandeza que muda o card (`cpfConflitante`); reconheço que, na forma revisada, agente-2 e eu
estamos emitindo *a mesma* partição com a mesma complexidade, e o único resíduo entre nós é
a granularidade do selo.

### Agente-3 (rodada 1)

**Convergência quase total:** mesma chave `perfil|nome`, mesmo fallback, mesmo wrapper com
loop contínuo (mudou do PARAR da rodada 0 — bem recebido), mesmo inventário read-only, mesmo
sort por nome do grupo, e-mail visível no card. É a proposta que mais se aproxima da minha e
a mais limpa de engrenagem.

**Pontos que permanecem:**
1. **`cpfConflitante` calculado sobre `normalizarCPF` no grupo:** adoto integralmente — é o
   selo "CPFs divergentes" na minha proposta; não é segunda regra de fusão, é metadado. Sem
   ressalva.
2. **Privilégio:** ele nota que grupos homogêneos tornam a cláusula "se qualquer membro"
   redundante — correto, e eu dobro para isso na final (seção 1). Fico de acordo total.
3. **Falha na especificação do fallback de idioma/coleção:** ambos os seus testes cobrem o
   fallback de nome vazio→email→id, mas o `nomeExibido` do grupo no caso "todos com nome
   vazio" não está definido na proposta dele; defino aqui (`email → "(sem nome)"`). Detalhe
   de UI que bloqueia implementação correta.
4. **Robustez da crítica ao agente-2:** a assimetria Camada A × casal-crítico que ele aponta
   ("dois palpites codificados como regras") é o desenho mais preciso da semana sobre o
   defeito da arquitetura em camadas — confirmo e incorporo como justificativa formal da
   chave única.

Resultado: nenhuma divergência operacional restante com o agente-3; o que distingue a final
deles é só o fechamento do `nomeExibido` dos grupos-vazios e a inclusão explícita do SQL de
leitura do inventário (ele citava o `CpfService` + "SQL de leitura" — formalizo o comando).

### Sumário da crítica cruzada

Nenhuma das duas propostas da rodada 1 apresenta falha que mude a partição — os três estamos
emitindo grupos idênticos para todos os cenários evidenciados. As diferenças reais eram:
(1) nome do módulo → resolvido por convergência majoritária; (2) granularidade do selo →
resolvido para a grandeza mínima que muda a tela; (3) parada do loop de reset → já
convergido para CONTINUAR entre os três; (4) inventário vivo → incluído como leitura pura na
execução do bug. A consolidada combina o melhor de cada: robustez da crítica do agente-3,
concessão total do agente-2 ao reframe, e meus testes de fechamento (CONTINUAR, fallbacks,
total-por-grupos).