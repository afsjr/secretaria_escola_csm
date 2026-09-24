---
protocol_version: 1
debate_id: BUG-20260924-6LSJ-r1
bug_id: BUG-20260924-6LSJ
role: solver
solver_id: agente-3
engine: local
round: 1
status: ok
started_at: 2026-09-24T16:30:00Z
finished_at: 2026-09-24T16:48:00Z
---

# Agente-3 — Rodada 1 (revisão após crítica)

## Estratégia de correção

**Confirmada: correção SÓ de exibição (Opção 1), reversível, com reset multi-contas
agregando erros e inventário vivo somente-leitura desacoplado.** Incorporo três melhorias
da rodada 0/1: (a) wrapper de reset em `AdminService` (não loop solto na view);
(b) loop de reset **continua agregando erros** (reavaliação da minha postura de parar — ver
seção "Decisão do reset loop"); (c) flag explícito por grupo, no espírito da taxonomia do
agente-2, mas como **metadado de um único passe**, não como camadas de classificação.

Regra de identidade — **chave única por perfil + nome normalizado** (`perfil` faz parte da
chave; agrupar é sempre por seção). CPF **não participa da chave em nenhuma camada**:

```
key(p) = `${p.perfil}|${normalizarNome(p.nome_completo)}`
         || `${p.perfil}|${p.email.trim().toLowerCase()}`
         || p.id                                 // fallback: vazios nunca colapsam entre si
```

Cada grupo carrega metadado calculado em uma passada: `{ key, perfil, nomeExibido, ids,
emails, cpfsNaoNulos, cpfConflitante }`, com
`cpfConflitante = (distinct de normalizarCPF(cpf) não-nulos no grupo) > 1` — **sinal** para a
secretaria e para o inventário humano (caso PESSOA 5 BEATRIZ), jamais uma segunda regra de
fusão. PESSOA 12 (CPF NULL na 2ª conta) colapsa porque tem a **mesma chave de nome**; a 3ª
conta da PESSOA 5 BEATRIZ (CPF divergente) idem, com o selo `⚠ revisar · CPFs divergentes`.

Arquivos a tocar — idêntico à rodada 0:
1. **NOVO `src/lib/person-groups.ts`** (puro, sem DOM/Supabase): `normalizarNomeIdentidade`,
   `agruparPorPessoa(profiles): PersonGroup[]` com os metadados acima.
2. **`src/views/directory.ts`**: `renderProfileSection` filtra por perfil → `agruparPorPessoa`
   → um card por grupo; sort por `nomeExibido` do grupo; badge da seção e `Total:` = Σ grupos;
   botão lê `data-ids` (JSON) e chama o wrapper; em grupo com `N>1`, linha discreta
   "N contas · e-mails: …" e selo de conflito quando `cpfConflitante`.
3. **`src/lib/admin-service.ts`**: novo `resetUserPasswords(userIds, nome)` iterando o
   `resetUserPassword` existente (sem alterar a assinatura dele), auditando por conta e
   agregando. `resetUserPassword` é chamado **sequencialmente**; falha num id **não corta** os
   demais.
4. Reversibilidade: remover `person-groups.ts` + reverter `directory.ts` (Δ ~40 linhas);
   `session.ts`, `signup-handler.ts`, banco e FKs intocados.

## Causa raiz proposta

Inalterada e fora da disputa — confirmo `problema.md` e `bug.md`: nascença em
`signup-handler.ts:20` (`if (cpf)`); linhas duplicadas ativas em `perfis` sem unique por
identidade até 22/09; aparecimento em `session.ts:134-142` (cru) + `directory.ts:100,117,150`
(render 1:1 e `Total = profiles.length`); dedup de 22/09 (`dedup-merge.mjs:139`) agrupou só
por CPF e pulou CPF `NULL`. O alvo do fix é a camada de apresentação; a proliferação é
prevenção futura separada.

## Teste

Novo `src/lib/person-groups.test.ts` (puro, padrão `cpf-service.test.ts`):
1. PESSOA 12 (1ª com CPF `***.***.***-**`, 2ª CPF `NULL`, mesmo nome, mesmo `perfil`) → 1 grupo,
   `ids.length = 2` (reprodução + requisito b).
2. PESSOA 5 BEATRIZ (mesmo nome, CPFs distintos não-nulos) → 1 grupo, `cpfConflitante = true`.
3. PESSOA 8 × PESSOA 7 (CPF `***.***.***-**` igual, nomes **diferentes**) → 2 grupos (CPF nunca
   funde — restrição c).
4. PESSOA 13 × PESSOA 14 (`***.***.***-**` igual, nomes quase iguais) → 2 grupos (falso-negativo
   seguro preservado; NÃO regride para o jeito da dedup 22/09).
5. Mesmo nome em `perfil` diferente (aluno × professor) → 2 grupos (chave inclui perfil).
6. Nome com acento/caixa/espaço duplo → 1 grupo; nome vazio → fallback email, depois id;
   dois vazios sem email não colapsam.
7. Total = Σ `grupos.length` por seção ≠ `profiles.length` com duplicata (bloqueia regressão
   do badge e do `Total:`).

Novo `src/lib/admin-service.pessoa.test.ts` (mock `./supabase` e `./audit-service`):
8. `resetUserPasswords(['a','b'], nome)` chama `resetUserPassword` p/ **a e b**, gera 2
   auditorias, retorna `resetados: 2`.
9. **Continua-agregando**: `b` falha, `c` ainda é resetado → `resetados: ['a','c']`,
   `erros: [{id:'b', message}]`, sem abortar (prova da decisão revisada).
10. Grupo com membro `admin`/`master_admin` → botão oculto (teste do handler/helper de
    privilégio por grupo; grupos são homogêneos por perfil, então a regra do card atual vale).

Regressão: `npm run test` e `npm run type-check`.

## Impacto sobre a spec

`spec-gap` confirmado (`_reversa_sdd/admin/requirements.md` não cobre a listagem). **Adendo
recomendado**: (1) uma linha por pessoa por perfil, chave = nome normalizado, CPF **não é
chave de fusão**; (2) Total/badges contam pessoas; (3) grupo com CPFs divergentes ou N>1
recebe sinal visível não-bloqueante; (4) Resetar Senha na linha reseta **todas** as contas do
grupo, com erro de um id não interrompendo as demais; (5) reparo/deativação de duplicatas
históricas (decisão humana caso a caso) e campo de inativos **fora** do escopo. Não altera
RF-01..RF-08.

## Riscos e efeitos colaterais

- **Homônimos** (pessoas distintas, mesmo nome): colapsam em 1 linha → mitigações visíveis —
  "N contas · e-mails: …" + selo `⚠ revisar` quando CPFs divergem — e inventário humano
  desacoplado. É o residual aceito em qualquer regra de identidade sobre esses dados, e a
  chave só o funde quando a grafia é **idêntica**.
- **Reset parcial**: agregado e auditado por conta; a mensagem lista quem resetou e quem
  falhou. N falsos: com N≤3 por grupo, custo de continuar é trivial.
- **Total cai** (154 → nº de pessoas): esperado; documentar no adendo.
- **Pessoa em 2 perfis** aparece em 2 seções (escopo por perfil; mesmo comportamento de hoje).
- **Sem risco de FK/matrícula/RLS**: nenhuma escrita em `perfis`; reset reusa o caminho de
  Edge por id já existente.
- **Performance**: agrupamento O(n) por seção em ~200 linhas — irrelevante.

## Evidências

- `evidence/contas-duplicadas-PESSOA 12.md`, `evidence/reproduction.md`, `problema.md` (rubrica,
  restrições b/c/d/e), `bug.md` (AC, agent notes).
- `src/views/directory.ts:100-117,150,169-198` (render 1:1, badge, `Total`, handler do reset
  por `id` único — alvo do fix).
- `src/auth/session.ts:134-142` (`getAllProfiles` cru, mantido).
- `src/auth/signup-handler.ts:20` (`if (cpf)`), `src/lib/admin-service.ts:343-438`
  (`resetUserPassword` por id + `AuditService.log`, reusado).
- `src/lib/validation.ts:177-180` (`normalizarCPF` para o metadado `cpfConflitante`).
- `src/lib/cpf-service.ts:75-104` (`listarInconsistenciasCPF` p/ inventário read-only).

## Confiança

**alta** — mecanismo: chave única por perfil+nome repartiu os grupos corretamente para todos os
casos confirmados (PESSOA 12, PESSOA 8×PESSOA 7, PESSOA 13×PESSOA 14, PESSOA 5 BEATRIZ; equivalência de
partição demonstrada na crítica ao agente-2), sem banco, sem CPF na chave, sem FK; reset
contínuo e agregado cumpre "reseta TODAS as contas" mesmo com falha parcial. Residual: homônimo
de grafia idêntica, mitigado por sinal visível + inventário humano, nunca eliminável com os
dados disponíveis (média-alta no overall).

## Crítica às demais propostas (agente-1 e agente-2)

**agente-1.** Concordo com quase tudo: chave por nome normalizado sem CPF na chave (guarda mais
forte contra a classe de bug de 22/09), escopo por perfil (mantém o privilégio do card trivial),
reset agregado, exibição-only reversível. Objeções: (1) joga o CPF **fora até como metadado** —
perde o sinal `cpfConflitante` que eu e o agente-2 propomos e que **diferenciaria na tela** o
caso PESSOA 5 BEATRIZ (nome igual, CPF divergente) de um homônimo comum; é um incremento de ~2
linhas no helper e de baixo custo. (2) A regra de privilégio "por grupo se qualquer membro é
master/admin" está um pouco mais complicada do que o necessário: como a chave inclui `perfil`,
todo grupo é homogêneo de perfil, então a regra atual do card vale por grupo sem a cláusula "se
qualquer membro". (3) Fallback `email || id`: correto, mas só cosmético. Em suma: aprovo a
base; adoto a flag.

**agente-2.** A pergunta que a tarefa faz — CPF primário em camadas é *mais robusto* que chave
por nome? — a resposta, com a evidência em mãos, é **não**: é igualmente robusto e
significativamente mais caro. No conjunto confirmado, a máquina de camadas do agente-2
**produz exatamente as mesmas partições** que `perfil|nomeNormalizado`: PESSOA 12 (1), PESSOA 8×PESSOA 7
(2), PESSOA 13×PESSOA 14 (2), PESSOA 5 BEATRIZ (1) — para **todos** os cenários enumerados, os grupos
saem idênticos e a única diferença de saída é o metadado de flag, que eu já calculava como
`cpfConflitante` na rodada 0 com um teste de "2+ CPFs não-nulos distintos" — sem camada.
Ou seja, o custo algorítmico extra (Camada A + sub-agrupamento + Camada B + ponte A↔B + flag
`nome-igual-cpf-divergente`, ~5 regras de identidade e 4 estados de flag a testar/manter) não
compra **nenhum** delta de partição nos dados confirmados. Pior, ele **re-eleva CPF a
participante de primeira linha da chave** (Camada A = CPF, ponte A↔B = CPF+nome): qualquer
manutenção futura que "simplifique" a Camada A para "fundir por CPF" reintroduz o
PESSOA 8×PESSOA 7 — o exato foot-gun que a dedup de 22/09 documentou. Na chave por nome puro esse
regresso é estruturalmente impossível: CPF nunca é chave. Há também uma assimetria interna:
Camada A decreta "nomes diferentes (mesmo CPF) ⇒ pessoas diferentes", enquanto o casal crítico
decreta "CPFs diferentes (mesmo nome) ⇒ mesma pessoa, com flag" — dois palpites sobre os mesmos
dados incertos codificados como regras assimétricas; a chave por nome + flag mantém os dois
palpites, mas como **sinal renderizado** e não como segunda regra classificadora. Por fim,
ambigüidade real: `agruparPessoas` não declara escopo por `perfil` (o contrato é `(perfis) →`
sem `perfil` na chave), mas a seção de riscos assume "uma vez por seção igual a hoje" e o reset
multi-perfil fica nebuloso; e o flag `mesmo-cpf` na ponte é semanticamente enganoso (o grupo
PESSOA 12 contém um CPF `NULL`). **Adoto do agente-2:** a taxonomia de flags (conceitualmente),
o reset que continua agregando, e o reconhecimento de que PESSOA 5 BEATRIZ é decisão de produto
sob `spec-gap` — tudo isso com a mecânica de um único passe por nome, sem camadas.

## Decisão do reset loop (parar × continuar)

Reavaliei a minha rodada 0 (onde defendia **parar no primeiro erro**) e **mudo para
continuar agregando**. Justificativas: (1) a decisão do usuário é "Resetar Senha reseta
TODAS as contas da pessoa" — parar no primeiro erro torna essa promessa condicional à
ausência de falha e deixa estado inconsistente (algumas contas do grupo renovadas, outras
não); continuar maximiza a cobertura e produz um relatório completo. (2) Contraste de
segurança: nenhum ganho em parar — o privilégio já é avaliado **por grupo** antes de iterar
(botão oculto se qualquer membro é master/admin; grupo homogêneo de perfil), então continuar
não expõe alvo protegido. (3) N≈2–3 por grupo: falhar em todos não é explosão de round-trips.
(4) Auditoria por conta preservada de qualquer forma (agente-1 e agente-2 chegam ao mesmo
veredito, e o sync com eles reforça). Cenário em que "parar" teria mérito — erro sistêmico da
Edge — ainda é melhor tratado por continuar-agregar, trocando poucas chamadas redundantes por
relatório completo para o operador.