---
protocol_version: 1
debate_id: BUG-20260924-6LSJ-r2
bug_id: BUG-20260924-6LSJ
role: solver
solver_id: agente-3
engine: local
round: 2
status: ok
started_at: 2026-09-24T18:10:00Z
finished_at: 2026-09-24T18:35:00Z
---

# Agente-3 — Rodada 2 (final) — BUG-20260924-6LSJ

## Estratégia de correção

**Fechamento: correção 100% de exibição (Opção 1), módulo puro novo, reset multi-contas com
CONTINUAR-agregando, inventário vivo somente-leitura como parte do bug (sem nenhuma escrita).**
A rodada 1 convergiu os três agentes no mesmo mecanismo (chave por nome normalizado escopado por
perfil; CPF nunca chave); abaixo fecho as quatro resoluções disputadas com nome/assinatura únicos.

### 1. Módulo puro e API (nome único final)

NOVO `src/lib/person-groups.ts` (sem DOM/Supabase):

```ts
normalizarNomeIdentidade(s: string): string
// NFD -> remove acentos -> lowercase('pt-BR') -> colapsa espaços múltiplos/trim

agruparPorPessoa(profiles: UserProfile[]): PersonGroup[]
// um passe, Map por chave; preserva ordem de entrada para o sort estável da view

type PersonGroup = {
  key: string
  perfil: string
  nomeExibido: string        // nome do primeiro membro não-vazio (para sort e card)
  ids: string[]              // todos os ids (base do reset-all)
  emails: string[]           // distintos, ordem de entrada
  cpfConflitante: boolean    // 2+ CPFs não-nulos distintos normalizados no grupo (sinal, não regra)
}
```

Adoto `person-groups.ts` (a minha rodada 0/1 e a do agente-1) — não `person-grouping.ts`
(agente-2): o adjetivo gerúndio não reflete o contrato, que entrega grupos prontos.

### 2. Chave do grupo e fallback de nome vazio; Total e badges (decidido)

```
key(p) = `${p.perfil}|${normalizarNomeIdentidade(p.nome_completo)}`
         || `${p.perfil}|${p.email.trim().toLowerCase()}`   // fallback nome vazio
         || p.id                                            // fallback final: vazios NUNCA colapsam entre si
```

- **Total (`directory.ts:150`) e badge por seção (`directory.ts:117`) contam PESSOAS** = Σ grupos
  (único `PersonGroup` por chave), não linhas de `perfis`. Regressão do `Total` (154 → pessoas)
  é o efeito esperado e correto, documentado como correção no adendo.
- Fallback id garante que duas contas sem nome e sem email não se fundem (falso-colapso evitado).

### 3. Loop de reset — CONTINUAR agregando (confirmado firmemente) + assinatura do wrapper

**Confirmo a mudança da rodada 1: CONTINUAR, não parar.** Parar no primeiro erro viola a decisão
do usuário ("reseta TODAS as contas"), deixa senhas misturadas dentro do grupo e apaga do admin a
visão de quem mudou e quem não mudou. CONTINUAR entrega numa passada o estado completo e reexecutável.

Assinatura final no `AdminService` (`src/lib/admin-service.ts`), plural adjacente à função
existente `resetUserPassword`:

```ts
async resetUserPasswords(
  userIds: string[],
  nome: string,
): Promise<{ ok: boolean; resetados: string[]; erros: { id: string; message: string }[] }>
```

Comportamento:
1. Deduplica ids antes do loop.
2. Chamada sequencial de `resetUserPassword` existente (assinatura intocada), 1 tentativa por id.
3. **Falha por id NÃO corta os demais** — agrega em `erros` e segue (regra geral).
4. **Cláusula de parada única:** erro de permissão determinístico (401/403 / "não autenticado",
   classe não-retryable e idêntica para todo o grupo) → `break`, preservando a agregação dos já
   tentados. É a exceção tecnicamente correta (agente-1 arg. 5): continuar numa classe de erro que
   falhará em todos os ids só queimaria round-trips sem informação nova.
5. Auditoria por conta via `AuditService.log` (acao `reset_senha`) em cada sucesso.
6. `ok = erros.length === 0`. A view exibe toast honesto `"X de N"` + lista de falhas; **nunca**
   sucesso pleno com falha presente.
7. Guarda de privilégio ÉPOCRETA **antes** do loop, na view: grupo com qualquer membro
   `master_admin` → sem botão; com `admin` e viewer não-master → sem botão. Como a chave inclui
   `perfil`, todo grupo é homogêneo de perfil e a regra atual do card vale por grupo (sem cláusula
   de "qualquer membro" extra — ver Crítica ao agente-1).

### 4. Inventário vivo — PARTE deste bug, somente leitura (decidido)

**Sim, é parte do bug** — como etapa de diagnóstico/validação do próprio fix, com **zero escrita**;
o reparo/fusão de dados (escrita) permanece fora, sob decisão humana caso a caso. Razão: a AC e a
causa raiz dependem da verdade do banco vivo (Total 154 não fecha com backup pré-dedup) e o selo
`cpfConflitante` alimenta a decisão humana; comando read-only definido:

```sql
SELECT id, nome_completo, email, perfil, cpf, status, cadastro_desativado, created_at
FROM public.perfis
WHERE (status IS NULL OR status <> 'inativo')
  AND NOT COALESCE(cadastro_desativado, false)
ORDER BY nome_completo, created_at;
```

Roteado pelo MESMO `agruparPorPessoa` (script `scripts/inventario-pessoas.mjs`, read-only) →
`evidence/inventario-vivo-20260924.md` (ids, e-mails, CPFs, matrículas ativas, selo de CPF
divergente, homônimos suspeitos). Complementar: `CpfService.listarInconsistenciasCPF()` situa
`semCpf` e duplicados por CPF, mas **não** emparelha PESSOA 12-por-nome — o SQL por nome é o primário.
Não bloqueia o hotfix (é defensivo); fecha a AC e a rastreabilidade humano.

### Arquivos a tocar (inalterado desde a rodada 1)

1. **NOVO** `src/lib/person-groups.ts` (puro) + `src/lib/person-groups.test.ts`.
2. `src/views/directory.ts`: `renderProfileSection` filtra por perfil → `agruparPorPessoa` → 1 card
   por grupo; sort por `nomeExibido`; badge e `totalUsers` = Σ grupos; botão com `data-ids` (JSON);
   linha "N contas · e-mails…" e selo "CPFs divergentes" quando `cpfConflitante`; handler chama
   `resetUserPasswords` (sem lógica de loop no DOM).
3. `src/lib/admin-service.ts`: wrapper `resetUserPasswords`.
4. **NOVO** `src/lib/admin-service.pessoa.test.ts` (mock `./supabase`, `./audit-service`).
5. **NOVO** `scripts/inventario-pessoas.mjs` (read-only) + saída em `evidence/`.
6. **NÃO tocar:** `session.ts` (getAllProfiles cru — a view precisa das linhas brutas para resetar
   por id), `signup-handler.ts` (prevenção = item separado), banco/schema/FKs/migrações.

Reversibilidade: remover `person-groups.ts` + script de inventário, reverter `directory.ts`
(Δ ~45 linhas) e remover o wrapper → estado anterior exato; nenhum dado mutado em banco.

## Causa raiz proposta

Confirmada sem mudança (não é a disputa): (1) nascença — `signup-handler.ts:18` `if (cpf)` só
dispara a guarda com CPF informado; autocadastro sem CPF (2ª PESSOA 12, 10/09) cria livremente;
(2) persistência sem unique de identidade (índice `uniq_perfis_cpf_ativo` só desde 22/09 e só
cobre CPF não-nulo); (3) `session.ts:134-142` devolve linhas cruas; (4) `directory.ts:100-150`
renderiza/conta 1:1 (`Total = profiles.length`); (5) dedup de 22/09 (`dedup-merge.mjs:139`
`if (!c) continue`) agrupou só por CPF e pulou CPF NULL/divergente. O fix alvo é a camada 4
(aparição); a proliferação fica como prevenção futura separada.

## Teste

`src/lib/person-groups.test.ts` (puro, vitest):
1. PESSOA 12 (CPF `***.***.***-**` + CPF NULL, mesmo nome, mesmo perfil) → 1 grupo, `ids.length=2`,
   `cpfConflitante=false` (requisito b; caso que a dedup de 22/09 não cobriu).
2. PESSOA 5 BEATRIZ (mesmo nome, CPFs não-nulos distintos) → 1 grupo, `cpfConflitante=true`, `ids` = 3.
3. PESSOA 8 × PESSOA 7 (CPF `***.***.***-**` igual, nomes distintos) → **2 grupos** (CPF nunca funde —
   restrição c; regressão estrutural do espírito 22/09).
4. PESSOA 13 × PESSOA 14×2 (CPF `***.***.***-**` igual, nome com 1 letra de diferença) → **2 grupos**
   (falso-negativo seguro preservado; vai ao inventário).
5. Normalização: acento/caixa/espaço duplo → 1 grupo; nome vazio → fallback email; dois vazios sem
   email → cada um com sua chave id (não colapsam).
6. Mesmo nome em perfil aluno × professor → 2 grupos (chave inclui perfil).
7. Total = Σ grupos ≠ `profiles.length` com duplicata (bloqueia regressão do badge e do `Total`).

`src/lib/admin-service.pessoa.test.ts` (mock `./supabase`/`./audit-service`):
8. `resetUserPasswords(['a','b'], nome)` → 2 chamadas de `resetUserPassword`, 2 auditorias,
   `resetados=['a','b']`, `ok=true`.
9. **Continua-agregando (prova da decisão):** `b` falha → `c` ainda resetado,
   `resetados=['a','c']`, `erros=[{id:'b',message}]`, `ok=false` — sem abortar.
10. Dedupe: `['a','a','b']` → `resetUserPassword` chamado 2x.
11. Classe de permissão: `a` retorna 403 → break preserva agregação dos já tentados.
12. Grupo com `master_admin`/`admin` → botão oculto (helper de privilégio por grupo; grupo
    homogêneo de perfil).

Verificação: `npm run test` + `npm run type-check` + manual (PESSOA 12 1x com "2 contas"; Total
cai; reset de grupo de 2 → login das duas contas com `csm1983#`).

## Impacto sobre a spec

`spec-gap` confirmado (`_reversa_sdd/admin/requirements.md` não define a listagem; RF-05 só
"Listar alunos"). **Adendo em `_reversa_sdd/addenda/`**:
1. Uma linha por pessoa por seção; chave = perfil + nome normalizado; **CPF não é chave de fusão**
   (falsos positivos PESSOA 8×PESSOA 7 documentados), só divisor/qualificador via `cpfConflitante`.
2. Total/badges contam pessoas (Σ grupos), não linhas de `perfis`.
3. Card N>1 exibe "N contas · e-mails" + selo "CPFs divergentes" quando `cpfConflitante`.
4. Reset na linha única reseta TODAS as contas do grupo; erro de um id não interrompe os demais
   (obrigação da decisão do usuário); exceção única a classe de permissão (aborta preservando
   agregado); toast honesto `X de N`.
5. Inventário vivo (read-only) é parte do bug; reparo/desativação de duplicatas, consulta de
   inativos (AC3) e fluxo de matrícula (AC6) são itens separados.
6. Novo termo de taxonomia: `listagem-usuarios`.
RF-01..RF-08 intocados. AC1/AC2/AC4/AC5 atendidos por este change set.

## Riscos e efeitos colaterais

- **Homônimos reais de grafia idêntica** colapsam (risco residual, aceito): mitigado por "N contas
  · e-mails" + selo `cpfConflitante` + inventário como gate humano. Ineliminável com os dados
  disponíveis (CPF comprovadamente não é identidade segura).
- **Falso-negativo** (PESSOA 13/PESSOA 14): segue 2x, igual ao hoje; seguro; vai ao inventário.
- **Reset parcial:** CONTINUAR + agregar + toast honesto; retry pelos ids falhos é idempotente
  (senha conhecida). N×~1 chamada por id é trivial (grupos ≤3).
- **Regressão do `Total` (154 → pessoas):** esperada; comunicar como correção no adendo.
- **Pessoa em 2 perfis** aparece nas 2 seções (comportamento atual, documentado).
- **Sem risco de FK/matrícula/RLS:** nenhuma escrita em `perfis`; reset reusa a RPC por id existente.
- **Performance:** agrupamento O(n) em ~200 linhas — irrelevante.

## Evidências

- `bug.md` (AC, Agent Notes: não apagar contas sem decisão humana; "sem ambiguidade de alvo";
  decisão do usuário de resetar TODAS as contas).
- `debate/problema.md` (rubrica; restrições a–e; dados 191/25/27; Total 154 = pós-dedup 22/09).
- `evidence/reproduction.md` (25 grupos por nome; 27 colisões de CPF; falsos positivos PESSOA 8×PESSOA 7
  e PESSOA 13×PESSOA 14; necessidade de consulta ao banco vivo).
- `evidence/contas-duplicadas-PESSOA 12.md` (2 contas ativas 14/04 c/ CPF e 10/09 sem CPF, matrícula
  ativa "Enfermagem - Noite - 2026/2027"; PESSOA 5 BEATRIZ estrutura idêntica).
- `src/views/directory.ts:100-117,150,169-198` (render 1:1, badge, Total bruto, handler reset por
  id único — alvo do fix).
- `src/lib/admin-service.ts:343-438` (`resetUserPassword` + `AuditService.log`, reutilizados;
  assinatura existente intocada).
- `src/auth/session.ts:134-142` (getAllProfiles cru), `src/auth/signup-handler.ts:18-28` (guarda
  `if (cpf)`), `src/lib/cpf-service.ts:75-104` (`listarInconsistenciasCPF` read-only, uso
  comprovado em `GerenciarAlunosTab.ts:186`).
- `src/lib/validation.ts:177-180` (`normalizarCPF` para o metadado `cpfConflitante`).
- Snapshots: `debate/rodada-1/agente-1.md`, `debate/rodada-1/agente-2.md`.

## Confiança

**alta.** O mecanismo (chave perfil+nome, CPF fora da chave, reset contínuo agregado, inventário
read-only) repartiu corretamente todos os casos confirmados com metade do código das alternativas
em camadas e é estruturalmente imune a repetir o bug da dedup de 22/09; as quatro resoluções
disputadas foram fechadas com nome/assinatura únicos. Residual ineliminável: homônimo de grafia
idêntica, mitigado por sinal visível + inventário humano.

## Crítica às demais propostas

**Agente-1.** Núcleo idêntico ao meu (chave por perfil+nome, CPF fora da chave, módulo puro,
reset contínuo; ele chegou ao mesmo nome de módulo `person-groups.ts` e ao mesmo sinal de
"CPFs divergentes"). Dois pontos que não adoto: (a) a regra de privilégio "se *qualquer* membro
for master/admin" é mais complicada que o necessário — como a chave inclui `perfil`, todo grupo é
homogêneo e a regra atual do card vale por grupo; mantive a guarda simples na view e o wrapper
só herda a cláusula de permissão como break defensivo (ponto 11 do teste). (b) Assinatura
`resetarSenhasDaPessoa(ids, nome)` escolhida por ele; fecho em `resetUserPasswords(userIds, nome)`
por ser adjacente à função existente `resetUserPassword` no mesmo serviço — mesmo contrato,
menor ruído de nomenclatura para quem mantém `admin-service.ts`.

**Agente-2.** Grande convergência na rodada 1 (abandonou CPF-camada-primária, adotou nome-chave,
wrapper contínuo, inventário read-only). Restam dois vetores: (a) nome de módulo
`person-grouping.ts` (rejeito em favor de `person-groups.ts`, como acima) e a assinatura do
wrapper (mesma convergência já aplicada); (b) a taxonomia de flags `contas-duplicadas` /
`possiveis-homonimos` como classificador em código — mantenho apenas o booleano
`cpfConflitante` (2+ CPFs não-nulos distintos) calculado em metadado de um passe: a distinção
"mesma pessoa × homônimos" é decisão de domínio sobre dados incertos e deve aparecer como *sinal
renderizado* (selo + inventário) e não como segunda regra classificadora com 4 estados a testar —
mesma assimetria interna (CPF diverge→mesma pessoa; nome diverge→pessoas diferentes) que
apontávamos na rodada 1, agora sob os meus próprios dados. Nota de justiça: os casos de uso de
dedupe de ids (teste 10) e o pre-guard por grupo foram absorvidos dele.