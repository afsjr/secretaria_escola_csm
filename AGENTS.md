# Reversa

> Framework de Engenharia Reversa instalado neste projeto.

## Como usar

Use o fluxo adequado no chat:

- `reversa` — descobrir e documentar um sistema existente
- `reversa-new` — criar PRD e specs para um projeto novo
- `reversa-forward` — implementar ou evoluir código a partir das specs
- `reversa-migrate` — planejar a migração de um sistema legado
- `reversa-docs` — gerar o mini-site visual da documentação
- `impeccable` — design de front-end: criticar, auditar e polir interfaces (Impeccable, Apache 2.0)
- `reversa-agents-help` — consultar o catálogo completo de agentes

## Comportamento ao ativar

Quando o usuário digitar `reversa` sozinho em uma mensagem:

1. Ative o skill `reversa` disponível em `.agents/skills/reversa/SKILL.md`
2. Leia o SKILL.md na íntegra e siga exatamente as instruções do Reversa

## Regra não-negociável

Por padrão, nunca apague, modifique ou sobrescreva arquivos pré-existentes do projeto legado:
o Reversa escreve apenas em `.reversa/`, `_reversa_sdd/`, `_reversa_docs/`, `_reversa_forward/`, `_reversa_bugs/` e `_reversa_refactor/`.
A única exceção é a política configurável abaixo, controlada exclusivamente pelo usuário.

Antes de criar, modificar ou apagar qualquer arquivo fora das pastas próprias do Reversa, leia `.reversa/reversa-config.json` e obedeça ao resultado:

- Arquivo ausente, JSON inválido ou campo com tipo errado: trate como `allowLegacyEdits: false` (falha segura, nenhuma escrita fora das pastas do Reversa).
- `allowLegacyEdits: false`: recuse a escrita, informando o caminho recusado, o estado atual da config e o que o usuário deve editar para liberar.
- `allowLegacyEdits: true` com `allowedPaths` não vazio: escreva apenas em caminhos que casem com algum glob da lista (globs relativos à raiz do projeto, com `/`, suportando `*` e `**`).
- `allowLegacyEdits: true` com `allowedPaths` vazio ou ausente: projeto liberado; avise uma vez por sessão que a liberação é irrestrita.

Nunca crie nem edite `.reversa/reversa-config.json` por iniciativa própria: pedido na conversa não é liberação implícita, alterações nesse arquivo são ato exclusivo do usuário.

## Regras de qualidade de código (obrigatórias)

Valem para qualquer implementação, correção ou refatoração, além das regras do Reversa.

1. **Verificação antes de concluir**: rode os testes do alvo e `npm run type-check`. Não declare concluído com falha não explicada.
2. **Baseline de falhas**: antes de atribuir uma falha à sua mudança, reverta apenas os arquivos do alvo (`git stash push -- <arquivos>`), rode a mesma suíte e restaure. Registre as falhas pré-existentes com a prova.
3. **Refactor não muda comportamento**: se a mudança corrige um bug, rotule como correção e peça aprovação explícita. Change set de refactor não altera saída observável.
4. **Caracterização e regressão**: antes de transformar, fixe o comportamento atual com teste verde. Para correção, adicione teste que falha antes e passa depois.
5. **Escopo cirúrgico**: toque apenas nos arquivos do alvo aprovado. Não faça limpeza oportunista no mesmo change set.
6. **DOM sem acoplamento global**: não use `document.getElementById` para elementos que podem existir em mais de uma instância. Use `container.querySelector`, IDs únicos por instância e classes estáveis, com fallback para o container.
7. **Fonte única de cálculo**: média, arredondamento e status ficam em `src/lib/grades-utils.ts` ou módulo equivalente. View, PDF e alertas consomem a mesma função.
8. **Arredondamento na borda**: arredonde para exibição, não antes de cálculo persistido ou de outra regra, salvo quando a regra de negócio exigir. Documente a escolha.
9. **Estado explícito**: não transporte estado entre módulos por `window.__...`. Use parâmetro, contexto tipado ou store com ciclo de vida e limpeza.
10. **Sem N+1**: não repita a mesma consulta por item de lista quando um lote resolve. Em alvos de performance, conte consultas antes e depois.
11. **Testes de DOM**: em jsdom, `<tr>` só é parseado dentro de `<table><tbody>`. Monte a estrutura completa antes de consultar células.
12. **Trilha de evidência**: toda transformação deixa diff, saída de testes antes/depois, tabela de equivalência quando aplicável e registro atualizado em `_reversa_refactor/`.
