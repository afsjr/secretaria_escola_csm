---
protocol_version: 1
debate_id: BUG-20260924-6LSJ-r0
bug_id: BUG-20260924-6LSJ
role: solver
solver_id: agente-3
engine: local
round: 0
status: ok
started_at: 2026-09-24T15:10:50Z
finished_at: 2026-09-24T15:22:00Z
---

## Estratégia de correção

**Correção só de exibição (Opção 1) com agrupamento por nome normalizado DENTRO da seção de perfil, reset-all no botão e inventário vivo como etapa paralela somente-leitura. Zero mutação de dados neste fix.**

Racional de simplicidade: o defeito está na renderização (`directory.ts` conta e desenha linhas brutas). Toda a evidência confirmada de duplicidade compartilha `nome_completo` idêntico (CAMILLY 2x, MARIA BEATRIZ 2x) dentro da mesma seção; os falsos positivos de CPF (Gessica × Iara) têm **nomes diferentes**, justamente o caso em que CPF não é identidade. Portanto agrupar por `perfil + nome normalizado` resolve os casos reais **sem** fundir pessoas com CPF colidido e nome distinto — que é o risco que a dedup por CPF de 22/09 demonstrou ser perigoso.

Passos de implementação (menor mudança coerente):

1. **Novo módulo puro** `src/lib/directory-grouping.ts` (funções puras, sem Supabase):
   - `normalizePersonName(nome)`: `trim` → `normalize('NFD')` remove acentos → lowercase → colapsa espaços (mesmo padrão de `search-palette.ts:62`).
   - `groupProfilesByPerson(profiles: UserProfile[]): PersonGroup[]` — agrupa por chave `${perfil}|${nomeNormalizado}`; cada grupo carra `{ key, perfil, nome_exibido, ids: string[], emails: string[], cpfs: string[], cpf_conflitante: boolean }` (`cpf_conflitante = true` quando o grupo tem 2+ CPFs não-nulos distintos — sinal para o inventário humano, NÃO impede o agrupamento, cf. MARIA BEATRIZ com CPF divergente).
   - Grupo de 1 conta permanece grupo de 1 (nenhuma mudança visual).
2. **`src/views/directory.ts`** (único arquivo de UI alterado):
   - `DirectoryView` chama `groupProfilesByPerson(profiles)` uma vez; `renderProfileSection` itera grupos (não linhas); badge da seção = `grupos.length`; `totalUsers = gruposSomados` (Total = pessoas).
   - `renderProfileCard` recebe o grupo: se `ids.length > 1`, exibe sob o nome uma linha discreta `2 contas · emails distintos` (nenhuma informação fica oculta — atende à restrição (c) mesmo em colisão de nome entre pessoas diferentes) e, se `cpf_conflitante`, um selo `⚠ revisar` que **não** bloqueia a ação.
   - Botão "Resetar Senha" ganha `data-ids="${JSON.stringify(grupo.ids)}"`; o handler chama `AdminService.resetUserPassword` **para cada id do grupo** (loop sequencial, para no primeiro erro, toast agregado: "Senha de N contas de X resetada"). Mantém Edge Function + `AuditService.log` por conta — auditoria existente é reaproveitada, nada de novo em `admin-service.ts` além de, opcionalmente, um wrapper `resetUserPasswords(ids, nome)` se o loop ficar melhor lá.
3. **Inventário vivo (etapa paralela, somente leitura)** — usa o acesso do usuário ao banco:
   - Rodar `CpfService.listarInconsistenciasCPF()` + SQL de leitura agrupando por nome normalizado (mesma chave do grouping) e emitir `evidence/inventario-vivo-YYYYMMDD.md` listando cada grupo: ids, emails, CPFs, matrículas ativas, `cpf_conflitante`.
   - Esse inventário **alimenta decisões humanas caso a caso** para reparo de dados futuro (desativação da conta duplicada etc.). Nenhuma escrita acontece neste bug; reparo de dados é item separado com aprovação humana, como decidiu o usuário.
4. **Reversibilidade**: apagar `directory-grouping.ts` e reverter as ~40 linhas de `directory.ts` restaura o comportamento 1:1 exato. Nenhum dado, FK, RPC ou migração é tocado. O inventário é um arquivo markdown, inofensivo.

Por que não corrigir os dados primeiro: a 2ª conta da CAMILLY tem matrícula ativa; apagar/desativar sem caso-a-caso viola restrição explícita. E mesmo com dados limpos, a tela continuaria frágil (autocadastro sem CPF ainda cria duplicado — `signup-handler.ts:20` `if (cpf)`), então a correção de exibição é a única que elimina o sintoma de forma permanente e independente do reparo.

## Causa raiz proposta

A causa raiz do bug (exibição 1:1 sem identidade de pessoa) é a mesma do problema congelado — não há disputa. Para a estratégia escolhida, a causa-raiz-alvo do fix é especificamente: `getAllProfiles()` devolve linhas cruas (`session.ts:134-142`) e `DirectoryView` renderiza/conta `profiles.length` sem agrupar pessoas (`directory.ts:100-117,150`). A origem das duplicatas (guarda condicional a CPF em `signup-handler.ts:18-28`) fica **fora deste change set** como prevenção futura, item separado.

## Teste

Framework: **vitest** (já configurado em `package.json`; seguir o padrão de mock de `cpf-service.test.ts` — módulo puro não precisa nem de mock de Supabase).

Novo arquivo `src/lib/directory-grouping.test.ts`:

1. **Reprodução do caso CAMILLY**: duas linhas mesmo `nome_completo`, uma com CPF `159.598.884-08` e outra `cpf: null`, mesmo `perfil: 'aluno'` → `groupProfilesByPerson` retorna 1 grupo com `ids` de comprimento 2. (Teste de reprodução do bug: hoje `profiles.length` daria 2.)
2. **MARIA BEATRIZ / CPF divergente**: mesmo nome, dois CPFs distintos não-nulos → 1 grupo, `cpf_conflitante === true`.
3. **Não funde colisão de CPF entre pessoas distintas**: "Gessica Paloma Januario da silva" e "Iara Myllena de Melo Lima" com CPF `108.908.174-05` → 2 grupos distintos.
4. **Mesmo nome em seções diferentes** (aluno × professor) → 2 grupos (chave inclui `perfil`).
5. **Normalização**: acento/caixa/espaço duplo ("MARIA BEATRIZ DA COSTA  SANTOS" vs "maria beatriz da costa santos") → 1 grupo.
6. **Total**: soma de `grupos.length` por seção = pessoas únicas ≠ `profiles.length` quando há duplicata.
7. **Reset-all (unitário do handler ou do wrapper)**: grupo com 2 ids dispara `resetUserPassword` 2× com os ids corretos; falha no 1º interrompe e reporta erro agregado.

Verificação manual (ambiente dev): abrir "Usuários do Sistema", conferir CAMILLY 1x com selo "2 contas", Total menor que o número de cards antigos, e resetar senha de um grupo de 2 conferindo login das duas contas com `csm1983#`.

Comandos: `npm run test` e `npm run type-check`.

## Impacto sobre a spec

- Bug marcado `spec-gap`: nenhuma spec define a listagem. O fix **não** altera RF-01..RF-08 de `_reversa_sdd/admin/requirements.md` (reset por ID e auditoria continuam válidos por conta).
- **Adendo recomendado (pequeno, não bloqueante)** em `_reversa_sdd/addenda/`: registrar a regra nova de listagem — "uma linha por pessoa (perfil + nome normalizado); Total conta pessoas; Resetar Senha na linha única reseta todas as contas do grupo; grupos com CPF conflitante são sinalizados para revisão humana" — e a semântica do reset-all, que é decisão de produto do usuário. Isso fecha o spec-gap para futuros `/reversa-audit`.
- Reparo de dados (desativar/fundir contas) e campo de consulta de inativos permanecem **fora** da spec deste bug (itens de produto separados).

## Riscos e efeitos colaterais

- **Colisão de nome entre pessoas diferentes** (restrição c): a linha única pode conter 2 pessoas homônimas. Mitigação: a linha exibe "N contas" com e-mails distintos visíveis — nada é oculto sem pista — e o inventário vivo sinaliza homônimos para decisão humana. Risco residual aceito por ser o mais raro (evidência: os 25 grupos por nome no backup foram classificados como mesma pessoa).
- **Reset-all abrange conta "errada"** em grupo homônimo: mesmo risco que já existe hoje (o admin escolhe sem ver e-mail); mitigado por exibir e-mails no grupo e confirm() listando "N contas". Decisão do usuário torna o reset-all obrigatório; o selo "⚠ revisar" dá a pista antes do clique.
- **Total cai** (ex.: 154 → ~151): esperado e desejado; documentar no adendo para a secretaria não achar regressão.
- **Regressão visual**: grupos de 1 devem renderizar identico ao hoje (mesmo card). Cuidado com sort — ordenar por `nome_exibido` do grupo, não por linha crua.
- **Nenhum risco de FK/matrícula**: nenhuma escrita em `perfis`/matrículas. Nenhum risco de RLS/Edge Function: mesmo caminho de reset por id.
- **Equívoco de "dar conta por CPF"** fica delegado ao inventário + reparo futuro, não ao código — evita replicar o bug da dedup 22/09.

## Evidências

- `evidence/contas-duplicadas-camilly.md` — CAMILLY: 2 linhas ativas, mesma grafia, uma com CPF e outra `NULL` (caso que a regra nome-normalizado colapsa e a dedup por CPF nunca pegou).
- `evidence/reproduction.md` — 191 perfis, 25 grupos duplicados por nome (todos "mesma pessoa"); 27 colisões de CPF **entre nomes diferentes** (prova de que CPF não pode ser a chave e de que nome é a chave disponível nos casos reais); tela Total 154 = estado vivo pós-dedup-por-CPF.
- `src/views/directory.ts:100-117,150` — renderização 1:1 e `totalUsers = profiles.length` (alvo do fix).
- `src/auth/session.ts:134-142` — `getAllProfiles()` sem agrupamento (mantida; corrigir aqui afetaria outros consumidores — por isso a correção fica na camada de apresentação).
- `src/auth/signup-handler.ts:18-28` — guarda só com CPF (por que o sintoma pode recorrer; reforça que exibição-defensiva é a correção permanente).
- `src/lib/admin-service.ts:343-398` — `resetUserPassword(id)` por conta + `AuditService.log`, pronto para ser chamado N vezes sem alteração de contrato.
- `src/lib/cpf-service.ts:75-104` — `listarInconsistenciasCPF()` já pronto para o inventário vivo somente-leitura.
- `_reversa_sdd/admin/requirements.md` — RF-02 (reset) e ausência de RF de listagem (spec-gap).
- Padrão de normalização de nome já usado em `src/components/search-palette.ts:62`.

## Confiança (baixa|média|alta)

**alta** — na eficácia do fix para os casos confirmados (CAMILLY, MARIA BEATRIZ: mesmo nome, mesma seção; agrupamento é determinístico e testável sem banco). **média** — na ausência de falso agrupamento de homônimos distintos, mitigada por exibição de contas/e-mails e inventário vivo; por isso a confiança declarada no overall é **média-alta (voto: média)**, com o inventário vivo como gate de qualquer reparo posterior.

## Crítica às demais propostas

sem snapshot ainda
