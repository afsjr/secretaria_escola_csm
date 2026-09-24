---
protocol_version: 1
debate_id: BUG-20260924-6LSJ-r0
bug_id: BUG-20260924-6LSJ
role: solver
solver_id: agente-2
engine: local
round: 0
status: ok
started_at: 2026-09-24T14:22:00-03:00
finished_at: 2026-09-24T14:45:00-03:00
---

# Solver agente-2 — BUG-20260924-6LSJ (rodada 0)

## Estratégia de correção

**Correção 100% de exibição, identidade em camadas com flag de conflito explícito,
reset multi-contas, e reparo de dados desacoplado (item separado de produto).**

O defeito é de aparição, não de dados: a tela renderiza 1:1 as linhas de `perfis`.
A causa é `getAllProfiles()` cru + `DirectoryView` sem deduplicação. Como CPF não é
identidade segura (falsos positivos PESSOA 8×PESSOA 7 via CPF `***.***.***-**`) e o usuário
proibiu apagar contas sem decisão humana, **a identidade de pessoa não é decidível na
camada de exibição**. Então a correção faz o melhor colapso possível sem esconder ninguém
silenciosamente, marca o que é ambíguo, e empurra a consolidação real para um fluxo de
fusão com aprovação humana (fora do bug).

### Regra de identidade (3 camadas, pura e testável)

Toda a lógica mora em um módulo puro novo, sem DOM, `src/lib/person-grouping.ts`,
exportando `agruparPessoas(perfis: UserProfile[]): PessoaDiretorio[]`, com
`PessoaDiretorio = { contas: UserProfile[], flag: 'unica' | 'mesmo-cpf' | 'cpf-nulo-mesmo-nome' | 'nome-igual-cpf-divergente' }`.

1. **Camada A — mesmo CPF normalizado (não-nulo):** agrupa por `normalizarCPF`. Dentro
   desses buckets, **sub-agrupa por nome normalizado** (UPPERCASE, sem acentos, espaços
   colapsados): se o mesmo CPF aparece com nomes distintos, são pessoas diferentes
   (evidência PESSOA 8×PESSOA 7) → vira mais de uma pessoa no bucket. Nunca funde nomes
   diferentes silenciosamente.
2. **Camada B — CPF `NULL`:** agrupa por nome normalizado (caso PESSOA 12 10/09 +
   qualquer outra conta sem CPF com o mesmo nome).
3. **Ponte A↔B (caso PESSOA 12):** um grupo B (cpf-nulo) com nome normalizado idêntico ao
   nome de um grupo A unipes soa-oal é **fundido** nele → 1 card, flag `mesmo-cpf`.
4. **Casal crítico — mesmo nome, CPFs não-nulos DIFERENTES (3ª conta PESSOA 5 BEATRIZ,
   CPF `***.***.***-**`):** aqui eu divirjo da leitura mais purista da opção 1. Manter 2
   cards contraria a decisão explícita do usuário ("uma pessoa por linha" — PESSOA 5 BEATRIZ
   está no print dele). Colapse em **1 card com flag `nome-igual-cpf-divergente`** e aviso
   visual "N contas · CPFs divergentes". O risco de ocultar duas pessoas distintas com nome
   idêntico exato é baixíssimo nas listas da escola e fica **evidente**, não silencioso: a
   secretaria vê o badge e resolve via o fluxo de fusão com aprovação humana.

### Mudanças no código

- **NOVO** `src/lib/person-grouping.ts` — módulo puro: `normalizarNome`, `normalizarCPF`
  (reusa `src/lib/validation.ts`), algoritmo de 3 camadas e flag. **Nada de join no DOM.
  Regra de negócio fora da view.**
- `src/views/directory.ts` — `renderProfileSection` passa a consumir `PessoaDiretorio[]`:
  um card por pessoa; badge da seção e `Total:` contam **pessoas únicas**; o card exibe
  sub-rótulo "N contas" quando `flag !== 'unica'`; botão "Resetar Senha" carrega
  `data-ids` (JSON array) e confirma com a lista de e-mails afetados.
- `src/lib/admin-service.ts` — novo método `resetUserPasswords(userIds: string[], nome)`
  que itera o `resetUserPassword` existente por id, audita cada um e agrega erros. Satisfaz
  a decisão do usuário ("resetar TODAS as contas da pessoa") sem tocar na Edge Function.
- **INTENCIONALMENTE NÃO toco** `src/auth/session.ts` (`getAllProfiles` continua cru) nem
  `src/auth/signup-handler.ts`, nem banco: reduz superfície de regressão e preserva
  reversibilidade total (reverter = remover a chamada a `agruparPessoas`).

### Reparo de dados (desacoplado, fora do bug)

Inventário no banco vivo (o usuário tem acesso): rodar `CpfService.listarInconsistenciasCPF`
+ extensão por nome/CPF-NULL para listar os grupos residuais (PESSOA 12, PESSOA 5 BEATRIZ).
Fusão/deativação só por caso, com dry-run, backup e aprovação humana — item de produto
separado (mesma linha do campo de inativos). A tela passa a funcionar corretamente **antes**
do reparo, satisfazendo a rubrica "reversibilidade (código defensivo separado de reparo de
dados)".

## Causa raiz proposta

Confirmo a hipótese do bug.md (fora da disputa):

1. `src/auth/signup-handler.ts:18` `if (cpf)` — guarda anti-duplicidade só com CPF; sem CPF,
   o autocadastro cria conta livremente (origem da 2ª conta da PESSOA 12, 10/09).
2. Linhas duplicadas ativas persistem em `perfis`; índice `uniq_perfis_cpf_ativo` só desde
   22/09, e SÓ cobre CPF não-nulo.
3. `src/auth/session.ts:134-142` — `getAllProfiles()` devolve linhas cruas, sem distinct/grupo.
4. `src/views/directory.ts:100,150` — agrupa por `perfil`, ordena por nome, renderiza 1:1,
   `Total = profiles.length`. É aqui que a duplicata vira DEFEITO visível.
5. A dedup de 22/09 (`dedup-merge.mjs:139`) agrupa só por CPF e pula CPF `NULL`
   (`if (!c) continue;`) — por isso PESSOA 12 e a conta de CPF divergente restaram.

## Teste

- **NOVO** `src/lib/person-grouping.test.ts` (igual estilo de `cpf-service.test.ts`, puro):
  - PESSOA 12 (CPF `***.***.***-**` + CPF `NULL`, mesmo nome) → 1 pessoa.
  - PESSOA 8 × PESSOA 7 (CPF `***.***.***-**`, nomes distintos) → **2 pessoas preservadas**.
  - PESSOA 13/PESSOA 14 (`***.***.***-**`, nomes quase iguais ×2) → decide por nome normalizado;
    assert do comportamento de sub-agrupamento.
  - Mesmo nome + mesmo CPF → 1 pessoa.
  - Mesmo nome + CPFs válidos divergentes → 1 pessoa com flag `nome-igual-cpf-divergente`,
    com TODOS os ids em `contas`.
  - CPF `NULL` + mesmo nome 2x → 1 pessoa; CPF `NULL` + nomes diferentes → 2 pessoas.
  - Total = `agruparPessoas(...).length`, não `profiles.length`.
- **NOVO** teste unitário de `resetUserPasswords` (mock do supabase, padrão do
  `cpf-service.test.ts`): chama por id, falha parcial agrega erro sem abortar o resto.
- Regressão: `npm run test` e `npm run type-check` (vitest + tsc já existem no
  `package.json`).

## Impacto sobre a spec

`spec-gap` confirmado: `_reversa_sdd/admin/requirements.md` não tem RF para a listagem
"Usuários do Sistema" (RF-05 é só "Listar alunos"). **Precisa de adendo**
(`_reversa_sdd/admin/addenda/`): (1) uma linha por pessoa com a regra de identidade em
camadas; (2) Total/badges contam pessoas; (3) conflito de CPF divergente é colapsado com
flag explícito; (4) Reset de Senha na linha atinge todas as contas da pessoa; (5) fluxo de
fusão aprovação-humana e campo de inativos declarados FORA do bug.

## Riscos e efeitos colaterais

- **Falso-colapso residual:** duas pessoas distintas com nome idêntico exato e ambos CPF
  `NULL` viram 1 card. Mitigação: flag visível + reparo desacoplado + reversível (exibição
  não grava nada). Tolerado em favor do critério "uma pessoa por linha".
- **Pessoa em 2 perfis diferentes** (ex.: aluno + professor) aparece uma vez em cada seção —
  comportamento idêntico ao atual; aceito e documentado no adendo.
- **Reset parcial:** se um id do grupo falhar, outros resetam. Mitigação: agregação de erros
  + mensagem listando quais e-mails foram resetados; auditoria por id preservada.
- **Botões duplicados de reset no DOM:** cada pessoa emite um único botão; contas agrupadas
  NÃO emitem botão individual — evita reset duplo acidental.
- **Performance:** agrupamento em memória O(n) sobre ~200 linhas — irrelevante.
- **master_admin/admin** intocado: restrição de reset continua por perfil; se contas do
  grupo tiverem perfis diferentes, a restrição do card é calculada sobre o perfil do grupo
  (todos os membros compartilham seção, salvo o caso multi-perfil acima).

## Evidências

- `evidence/reproduction.md`: 25 grupos duplicados por nome; 27 colisões de CPF com falsos
  positivos PESSOA 8×PESSOA 7 e PESSOA 13/PESSOA 14 — base da "Camada A sub-agrupada por nome".
- `evidence/contas-duplicadas-PESSOA 12.md`: PESSOA 12 (CPF `***.***.***-**` 14/04 + CPF `NULL`
  10/09 com matrícula ativa) — base da "Ponte A↔B".
- `bug.md §Suspected Area`: `signup-handler.ts:18`, `directory.ts:100,150`,
  `session.ts:134-142`, `dedup-merge.mjs:139` (`if (!c) continue`) — causa raiz fechada.
- Código lido: `directory.ts`, `session.ts`, `admin-service.ts:343-439`,
  `cpf-service.ts`, `cpf-service.test.ts` (padrão de teste), `validation.ts`
  (`normalizarCPF`), `package.json` (vitest/tsc).

## Confiança

**Alta** para o mecanismo (módulo puro testável, exibição-only, reversível, sem tocar em
dados nem em FKs). Média-alta para a decisão de colapso com flag de CPF divergente, porque
é escolha de produto dentro de um `spec-gap` — mitigada pelo flag e pela ponte para o fluxo
de fusão aprovação-humana.

## Crítica às demais propostas

Sem snapshot ainda.