---
protocol_version: 1
debate_id: BUG-20260924-6LSJ-r1
bug_id: BUG-20260924-6LSJ
role: solver
solver_id: agente-2
engine: local
round: 1
status: ok
started_at: 2026-09-24T16:10:00-03:00
finished_at: 2026-09-24T16:40:00-03:00
---

# Solver agente-2 — BUG-20260924-6LSJ (rodada 1) — revisão da estratégia

## Estratégia de correção

**Confirma-se: correção 100% de exibição, desacoplada de reparo de dados (item separado com aprovação humana), reset-all multi-contas e regra de identidade pura/testável fora da view.**

**O que eu ABANDONO da rodada 0:** o enquadramento "CPF como camada primária". Após analisar a evidência com rigor, chegou-se ao seguinte (numa frase): **toda partição correta sobre os dados conhecidos é idêntica entre nome-como-chave simples e CPF-como-camada A com sub-agrupamento por nome** — porque o que decide a fusão é sempre o par de nomes normalizados, nunca o CPF sozinho. Manter "CPF primário" como *label conceitual* é convidativo ao atalho que gerou o bug da dedup de 22/09. Então a regra revisada é:

> **A chave de fusão é o nome normalizado (escopo: seção de perfil). O CPF não funde — o CPF só SPLITA e só AVISA.**

Papéis exatos do CPF na regra revisada:
1. **SPLIT protetor (herdado da minha Camada A, agora implementado por construção):** nunca há fusão entre linhas cujos nomes normalizados diferem, ainda que o CPF seja idêntico (PESSOA 8×PESSOA 7 continuam 2 linhas — o defeito da dedup de 22/09 não reproduz).
2. **QUALIFICADOR de ambiguidade:** grupo de nome único com **2+ CPFs não-nulos distintos** recebe bandeira `possiveis-homonimos` (selo visual não-bloqueante + entrada garantida no inventário humano); grupo com CPF repetido ou "1 CPF + 1 NULL" recebe bandeira `contas-duplicadas` (colapso confiável, ex.: PESSOA 12, PESSOA 5 BEATRIZ).
3. **NUNCA é chave primária, nunca funde dois nomes distintos silenciosamente.**

Isso é uma **convergência substantiva com agente-1 e agente-3** (nome normalizado + escopo por seção), mantendo da minha rodada 0 o sub-agrupamento como *garantia testada* (teste dedicado PESSOA 8×PESSOA 7) e a semântica do selo de CPF divergente.

### Regra final de agrupamento (módulo puro novo `src/lib/person-grouping.ts`)

```
chaveGrupo = normalizarNome(p.nome_completo)        // NFD + acentos off + lowercase + colapsa espaços
             || p.email.trim().toLowerCase()         // fallback nome vazio (nunca colapsa vazios entre si)
             || p.id                                 // fallback final
grupo = contas com mesma chave, MESMA seção de perfil
```

- `flag == 'contas-duplicadas'` quando N>1 e (CPFs iguais, ou 1 CPF + 1 NULL, ou CPF NULL repetido) — colapso, selo "N contas · IDs/emails distintos" (nada fica oculto).
- `flag == 'possiveis-homonimos'` quando N>1 e há 2+ CPFs não-nulos **distintos** — colapso mantido (decisão do usuário: PESSOA 5 BEATRIZ é UMA linha), mas selo de revisão + entrada no inventário. Este é o único caso em que a linha única pode, de fato, conter duas pessoas distintas com CPF correto; o selo é a costura para decisão humana.
- Sub-linha com os e-mails dos membros e a contagem de contas em TODA linha com N>1 (exigência de não ocultar informação).
- `Total` e badges contam **pessoas** (soma de grupos por seção), não linhas de `perfis`.

### Mudanças no código (idênticas à rodada 0, com os refinamentos absorvidos)

- NOVO `src/lib/person-grouping.ts` — funções puras (`normalizarNomeIdentidade`, `agruparPorPessoa(profiles): PessoaDiretorio[]` com `{ contas, flag, cpfConflitante }`).
- `src/views/directory.ts` — `renderProfileSection` consome grupos, não linhas; um card por grupo; badge "N contas · emails" e selo "⚠ revisar" quando `possiveis-homonimos`; ordenação por nome exibido do **grupo** (não linha crua — absorvido do agente-3); botão "Resetar Senha" carrega `data-ids` (array JSON dos ids do grupo) e confirma listando os e-mails; `totalUsers` = Σ grupos.
- `src/lib/admin-service.ts` — novo `resetarSenhasDaPessoa(ids, nome)` **wrapper fino** que itera o `resetUserPassword` existente por id, audita por conta e **agrega erros sem abortar** o restante (ver decisão abaixo). Edge Function, contrato e auditoria existentes intocados.
- Restrição de privilégio por GRUPO (adotado do agente-1): se qualquer membro do grupo for `master_admin` → sem botão; se qualquer for `admin` e o viewer não for master → sem botão. Recusa conservadora para o grupo inteiro.
- NÃO tocar: `session.ts` (`getAllProfiles` continua cru — a view precisa das linhas brutas para resetar por id), `signup-handler.ts` (prevenção de nascença = item separado), banco/schema/FKs (nada escrito).

### Inventário vivo (etapa paralela read-only, absorvido do agente-3)

Rodar `CpfService.listarInconsistenciasCPF()` + SQL de leitura agrupado pela MESMA chave e emitir `evidence/inventario-vivo-20260924.md` com cada grupo: ids, emails, CPFs, matrículas ativas, flag. Alimenta decisão humana caso a caso (desativação/fusão futura). Zero escrita neste bug; reparo de dados = item de produto separado.

## Causa raiz proposta

Mantida, sem alteração (não é a disputa): (1) nascença — `src/auth/signup-handler.ts:18-28` só dispara a guarda `if (cpf)`; autocadastro sem CPF cria livremente (origem da 2ª conta da PESSOA 12); (2) `uniq_perfis_cpf_ativo` só desde 22/09 e só cobre CPF não-nulo; (3) `src/auth/session.ts:134-142` devolve linhas cruas; (4) `src/views/directory.ts:100,150` renderiza/conta 1:1 (`Total = profiles.length`); (5) dedup de 22/09 (`dedup-merge.mjs:139` `if (!c) continue`) agrupou só por CPF e deixou de fora quem tinha CPF NULL ou divergente. A causa raiz **alvo do fix** é especificamente a camada 4 (aparição); ninguém propôs divergência nisso.

## Teste

- NOVO `src/lib/person-grouping.test.ts` (puro, padrão `cpf-service.test.ts`):
  1. PESSOA 12 (CPF + CPF NULL, mesmo nome, mesma seção) → 1 pessoa, flag `contas-duplicadas`.
  2. PESSOA 5 BEATRIZ (mesmo nome, CPFs válidos distintos) → 1 pessoa, flag `possiveis-homonimos`, `cpfConflitante=true`, todos os ids em `contas`.
  3. **Regressão anti-22/09:** PESSOA 8 × PESSOA 7 (mesmo CPF, nomes distintos) → **2 pessoas** (prova de que CPF jamais funde nomes distintos).
  4. PESSOA 13 × PESSOA 14×2 (mesmo CPF, nome com diferença mínima) → 2 grupos (falso-negativo seguro preservado).
  5. Normalização (acento/caixa/espaço duplo) → 1 grupo; nome vazio → fallback email/depois id; dois vazios sem email não colapsam.
  6. Mesmo nome em seções diferentes (aluno × professor) → 2 grupos (chave inclui seção).
  7. Total = Σ grupos ≠ `profiles.length` na presença de duplicata.
- NOVO `src/lib/admin-service.pessoa.test.ts` (mock `./supabase`/`./audit-service`):
  8. Grupo com 2 ids → `resetUserPassword` chamado para ambos, 2 auditorias.
  9. **Erro no 1º id NÃO corta o 2º** (continuidade); retorno `{ ok:false, resetados:[...], erros:[{id,message}] }`.
 10. Grupo com id duplicado → ids deduplicados antes do loop.
- Regressão: `npm run test` e `npm run type-check`.

## Impacto sobre a spec

`spec-gap` confirmado (RF-05 de `_reversa_sdd/admin/requirements.md` é só "Listar alunos"). **Adendo necessário** em `_reversa_sdd/addenda/`: listagem "uma linha por pessoa por seção" (nome normalizado como chave; CPF como divisor/qualificador, não chave); Total/badges contam pessoas; colapso com bandeira `possiveis-homonimos` quando há CPFs divergentes; Resetar Senha na linha única reseta TODAS as contas do grupo (não corta em erro) e audita por conta; inventário/consulta de inativos/reparo de dados declarados FORA do bug. Sem adendo, um `/reversa-audit` futuro reinforma o gap; com ele, a semântica fica rastreável.

## Riscos e efeitos colaterais

- **Falso-colapso de homônimos reais** (2 pessoas distintas, mesmo nome exato, CPFs distintos e corretos): risco real e residual — a decisão do usuário (PESSOA 5 BEATRIZ = 1 linha) força o colapso. Mitigação: selo `possiveis-homonimos` obrigatório + e-mails visíveis + inventário. Nenhuma estratégia resolve localmente: é impossível distinguir "mesma pessoa com CPF digitado errado" de "homônimos com CPF correto" sem outra fonte de verdade.
- **CPF primário rejeitado em prol de nome-chave:** elimina a classe de erro da dedup de 22/09 por construção, não por disciplina.
- **Reset multi-contas:** resetar todas as contas é decisão do usuário; risco de "reset parcial" com CONTINUE é coberto pela agregação (relatório lista resetados × falhos). Sem risco de FK/matrícula: nada é escrito em `perfis`/matrículas; mesmo caminho RPC de reset por id.
- **Total cai (154 → pessoas únicas do banco vivo):** esperado e desejado; comunicar como correção (adendo).
- **Pessoa em 2 seções** aparece nas duas — igual ao atual; documentado.
- **Performance:** O(n) em memória (~200 linhas) — irrelevante.
- **Reversibilidade:** reverter = remover chamada a `agruparPorPessoa` + apagar módulo puro e wrapper; nenhum dado/schema alterado.

## Evidências

- `bug.md` (AC, Agent Notes: não apagar contas sem decisão humana; "Resetar Senha... sem ambiguidade de alvo"; decisão do usuário de resetar TODAS as contas).
- `debate/problema.md` (rubrica, opções 1-4, restrições b/c/d/e).
- `evidence/reproduction.md` (25 grupos por nome; 27 colisões de CPF com falsos positivos PESSOA 8×PESSOA 7/PESSOA 13-PESSOA 14).
- `evidence/contas-duplicadas-PESSOA 12.md` (PESSOA 12 CPF NULL 10/09 com matrícula ativa; PESSOA 5 BEATRIZ 2x).
- `src/views/directory.ts:100-150`, `src/auth/session.ts:134-142`, `src/auth/signup-handler.ts:18-28`, `src/lib/admin-service.ts:343-439` (`resetUserPassword`), `src/lib/cpf-service.ts` (`listarInconsistenciasCPF` p/ inventário), `src/lib/cpf-service.test.ts` (padrão de mock).
- Snapshot das rodadas 0: `rodada-0/agente-1.md`, `rodada-0/agente-3.md`.

## Confiança

**Alta** para o mecanismo revisado: nome-normalizado como chave é mais simples que minha rodada 0, produz a MESMA partição em todos os casos evidenciados, elimina o risco de reproduzir o bug de 22/09 por construção (CPF nunca funde nomes distintos) e é 100% testável, reversível e sem escrita. Média-alta no caso `possiveis-homonimos`, porque é escolha de produto em `spec-gap` limitada por decisão humana posterior — mitigada pelo selo e pelo inventário.

## Crítica às demais propostas (agente-1 e agente-3)

**Agente-1.** Forte onde é simples e conservadora: regra de nome-normalizado com escopo por seção é a partição correta; fallback email→id é seguro; restrição de privilégio por grupo é a decisão mais defensável para o reset; reset multi-contas **continuando em erro** (igual à minha) alinha à decisão do usuário. Fragilidades: (a) rejeitar CPF *por completo* joga fora o único discriminador disponível no caso de homônimos — o badge genérico "N contas" não diferencia "duplicata da MESMA pessoa" (colapso confiável) de "possíveis pessoas distintas com o mesmo nome" (exige revisão), que é exatamente o caso que restou em produção; (b) sem o selo de CPF divergente, o risco residual de falso-colapso de homônimos fica invisível para quem opera a tela. Isso não muda a partição, mas muda a *auditabilidade* da informação ambígua.

**Agente-3.** Melhor em engenharia de *apresentação* da ambiguidade: selo `cpf_conflitante`/`⚠ revisar` não-bloqueante, sub-linha com e-mails, `cpf_conflitante` sinalizando CPFs distintos dentro do grupo, chave `${perfil}|nome` (equivalente à minha seção), incorporação do inventário vivo read-only como etapa paralela (excelente: fecha a exibição e alimenta o reparo humano no mesmo movimento). Ponto de discordância: o **reset no primeiro erro**. Parar no 1º erro frustra a decisão do usuário ("resetar TODAS as contas"): se a falha ocorre no 1º id, os demais NUNCA são resetados e a pessoa segue com senha antiga em parte das contas — defeito remanescente e silencioso, com recuperação manual pior (perder posição, tirar um a um). Como os resets são independentes por id, sem estado transacional compartilhado e em quantidade pequena (2-5 contas/grupo), o custo de continuar é desprezível e o relatório agregado dá alvo de retry exato.

**Sobre o ponto central da disputa** (CPF como camada primária — a pergunta que fiz à rodada): a resposta rigorosa à crítica dos dois é — *o meu sub-agrupamento por nome dentro do bucket de CPF anula sim o defeito específico de 22/09* (PESSOA 8×PESSOA 7 nunca colapsam, teste 3 o prova), **mas** o rótulo "CPF primário" era um convite ao erro de implementação, e a verdade dos dados é que nome normalizado já produz a mesma partição com metade do código. Portanto aceito a crítica de simplicidade integralmente e reframeio a estratégia: **nome é a chave, CPF é divisor + qualificador de ambiguidade**. O único acréscimo que defenderei até o fim é o selo de CPF divergente como costura para decisão humana — e nisso o agente-3 já veio ao meu encontro.

## Decisão sobre o loop de reset: PARAR no 1º erro ou CONTINUAR agregando?

**Decisão: CONTINUAR agregando erros.** Justificativa: (1) o requisito do usuário é os-meio "Resetar Senha deve resetar TODAS as contas da pessoa" e a AC exige reset "sem ambiguidade de alvo"; parar no 1º erro produz reset parcial silencioso (a pessoa mantém senha antiga em contas residuais), que é o mesmo sintoma de "contas deixadas para trás" que este bug combate; (2) cada id é uma chamada RPC independente e idempotente, sem estado compartilhado que torne o aborto necessário — não há transação a preservar; (3) volume por grupo é pequeno (≤ ~5), então o pior caso de "2+ erros" custa nada; (4) a agregação gera relatório (`resetados` × `erros`) que permite retry cirúrgico e auditoria por conta intacta. A única cláusula de parada é *prévia*, não por erro de execução: se qualquer membro do grupo for privilegiado (master/add apto a exigir reautenticação), nem se inicia o loop — recusa conservadora por grupo (adotada do agente-1). Manter também ids deduplicados antes do loop. Comportamento fechado no teste 9.