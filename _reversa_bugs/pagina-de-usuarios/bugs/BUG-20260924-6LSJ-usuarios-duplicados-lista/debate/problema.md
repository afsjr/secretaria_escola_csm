---
protocol_version: 1
debate_id: BUG-20260924-6LSJ-r0
mode: repair
solvers: 3
rounds: 2
judge: 1
participants: agentes-locais
created: 2026-09-24
frozen: true
---

# Problema do debate (congelado)

## Bug alvo

BUG-20260924-6LSJ (display_number 3) — Página de usuários exibe a mesma pessoa mais de uma vez.

Pasta: `_reversa_bugs/pagina-de-usuarios/bugs/BUG-20260924-6LSJ-usuarios-duplicados-lista/`

## Causa raiz (suportada por evidência — ponto de partida, não a disputa)

1. Guarda anti-duplicidade do cadastro só roda quando CPF é informado (`src/auth/signup-handler.ts:18` `if (cpf)`); autocadastro/admin sem CPF cria conta livremente.
2. Linhas duplicadas ativas persistem em `perfis` (sem unique por identidade; índice `uniq_perfis_cpf_ativo` só criado em 22/09/2026).
3. `getAllProfiles()` (`src/auth/session.ts:134-142`) devolve as linhas cruas, sem `distinct`/grupo.
4. `DirectoryView` (`src/views/directory.ts:100-150`) agrupa por `perfil`, ordena por nome, renderiza 1:1 e mostra `Total = profiles.length`. Sem deduplicação.

## Disputa: estratégia de correção (menor mudança coerente × menor risco × reversibilidade)

Restrições obrigatórias (Agent Notes e decisão do usuário):

- Decisão do usuário: na linha única, **Resetar Senha deve resetar TODAS as contas da pessoa**.
- Usuário tem acesso ao banco vivo (pode gerar inventário/consultar duplicatas atuais).
- **Não apagar contas sem decisão humana**: existem duplicatas com matrícula ativa (ex.: 2ª conta da CAMILLY tem matrícula "Enfermagem - Noite - 2026/2027"). CPF não é identidade segura: backup mostra CPF compartilhado entre pessoas com nomes DIFERENTES (ex.: CPF `108.908.174-05` em "Gessica Paloma Januario da silva" e "Iara Myllena de Melo Lima"; CPF `120.069.054-06` em "ANDREIA DA SILVA MELO" e "ANDREA DA SILVA MELO" x2).
- Fato de dados do backup pré-dedup (191 perfis ativos): 25 grupos duplicados por nome (2-3 linhas); 27 grupos de CPF em colisão com falsos positivos entre pessoas distintas.
- A tela atual (Total 154 = 191 - 37) indica que em produção restam os casos que a dedup por CPF não cobre: CPF `NULL` (CAMILLY) e CPF divergente (3ª conta MARIA BEATRIZ, CPF `110.032.444-59`).
- Label `spec-gap`: nenhuma spec define a listagem "Usuários do Sistema".
- Requisito complementar do usuário (NÃO é o defeito): campo para consultar pessoas inativas (concluintes) — fora do escopo do bug.

## Pergunta central para o repair

Qual a menor mudança coerente que faz a lista mostrar uma linha por pessoa, respeitando
(a) contas em CPF duplicado devem colapsar em uma linha; (b) caso de linha com CPF `NULL` duplicada
por nome deve colapsar; (c) sem fundir pessoas distintas (nomes iguais de pessoas diferentes não
podem ser ocultados); (d) Resetar Senha na linha única reseta todas as contas da pessoa;
(e) reverter sem estado — código defensivo + reparo de dados como itens separados com decisão humana?

Opções a disputar (não fechadas):
1. Correção só de exibição: regra de identidade conservadora usada para agrupar cards (CPF normalizado SEMPRE quando existe; caso extremo CPF `NULL` → nome normalizado) dentro da mesma seção de perfil; total = pessoas únicas; Resetar Senha dispara reset para todos os ids do grupo.
2. Correção de exibição + reparo de dados imediato (inventário no banco vivo, dry-run, backup, deativação de contas sob confirmação humana caso a caso).
3. Alternativa: não agrupar na tela, apenas marcar/separação visual + ferramenta admin de fusão. (contraria o desejo do usuário de "um por linha" — avaliar custo.)
4. Outra estratégia que os debatedores propuserem dentro das restrições.

Cada solver deve entregar UMA estratégia decidida, com os passos de implementação no código
(arquivos e funções a tocar), os testes de reprodução/regressão, o impacto da spec (precisa de
adendo?) e os riscos/regressões.

## Rubrica congelada (modo repair)

- Elimina a causa raiz confirmada (exibição 1:1 sem identificar pessoa) e o caso CAMILLY-CPF-NULL;
- Menor mudança coerente (nada de refatoração ampla);
- Menor risco de regressão (change_risk), considerando FKs de matrícula e o Resetar Senha;
- Reversibilidade (código defensivo separado de reparo de dados);
- Aderência à spec efetiva e aos Agent Notes (não apagar contas sem decisão humana).

## Saídas esperadas por debatedor

Front matter obrigatório (`role: solver`, `engine: local`, `round`, `status`) e corpo nas seções
fixas: `## Estratégia de correção`, `## Causa raiz proposta` (quando aplicável),
`## Teste`, `## Impacto sobre a spec`, `## Riscos e efeitos colaterais`, `## Evidências`,
`## Confiança` (baixa|média|alta), `## Crítica às demais propostas` (rodadas 1+).