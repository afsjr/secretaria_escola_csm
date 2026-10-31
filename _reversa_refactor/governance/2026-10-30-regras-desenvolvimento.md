# Regras de desenvolvimento: análise e complementação aplicada

> Gerado em 2026-10-30. Aplicado em `AGENTS.md` e `.agents/skills/**` após liberação de caminho.
> Status: aplicada em 2026-10-30 após liberação de `AGENTS.md` e `.agents/skills/**` em `.reversa/reversa-config.json`.

## 1. Melhorias analisadas

| OPP | Verbo | Melhoria realizada | Lição de desenvolvimento |
|-----|-------|--------------------|--------------------------|
| 1 | prune | 2 botões de UI sem handler removidos | Código morto de UI deve ser provado sem referência antes de remover |
| 2 | prune | Função de 63 linhas com `console.log` removida | Remover debug junto com o código morto |
| 3 | modularize | Monolito de 942 linhas dividido em view + 4 módulos + tipos | Extração precisa de testes dos consumidores e do type-check |
| 4 | simplify | Fórmula manual do PDF trocada por `grades-utils` | Cálculo de negócio tem fonte única |
| 5 | simplify | Alerta mirava ID errado e usava `document.getElementById` | Query de DOM deve ser escopada no container |
| 6 | standardize | `getPerfil` duplicado em 6 arquivos virou helper testado | Duplicação de parsing deve virar utilitário com teste |
| 7 | standardize | 79 estilos inline viraram classes `.pt-*` | Padronização só termina com varredura de resíduos |
| 8 | evolve | Concorrência/realtime registrada como feature | Nem toda melhoria é refactor; feature vai para o ciclo forward |
| 9 | decouple | IDs globais de frequência escopados por card | Componente repetido não pode depender de ID global |
| 10 | decouple (proposta) | Estado de versões em `window.__notasVersoes` | Estado entre módulos deve ser explícito e tipado |
| 11 | optimize (proposta) | N+1 de consultas ao salvar notas | Consulta por item em lista é gargalo mensurável |
| 12 | restructure (proposta) | Leitura de linha duplicada em notas, PDF e alertas | Estrutura lida em vários módulos pede leitor único |
| 13 | simplify | Média exibida passou a usar a mesma regra do recálculo | Arredondamento é decisão de borda de exibição |
| sessão | processo | Baseline de falhas pré-existentes provado com `git stash` | Não atribuir falha antiga à mudança nova |
| sessão | processo | Testes de caracterização antes e regressão depois | Transformação precisa de oráculo antes de tocar código |

## 2. Regras ausentes e destino

| Regra | Evidência | Destino |
|-------|-----------|---------|
| Verificação antes de concluir | OPP-4/5/9/13 | `AGENTS.md` + `verification-protocol.md` |
| Baseline de falhas pré-existentes | suíte com 4 falhas alheias | `AGENTS.md` + `verification-protocol.md` |
| Refactor não muda comportamento; bug é correção rotulada | OPP-9 e OPP-13 | `AGENTS.md` + `reversa-refactor/SKILL.md` |
| Caracterização verde antes e regressão vermelha antes | OPP-9 e OPP-13 | `AGENTS.md` + `verification-protocol.md` |
| Escopo cirúrgico por oportunidade | OPP-7 deixou resíduos | `AGENTS.md` + `reversa-refactor/SKILL.md` |
| DOM escopado, ID único por instância | OPP-5 and OPP-9 | `AGENTS.md` + `reversa-decouple` + `reversa-refactor` |
| Fonte única de cálculo de negócio | OPP-4 and OPP-13 | `AGENTS.md` + `reversa-simplify` |
| Arredondamento na borda de exibição | OPP-13 | `AGENTS.md` + `reversa-simplify` |
| Estado explícito, sem `window.__...` | OPP-10 | `AGENTS.md` + `reversa-decouple` |
| Sem N+1; medir consultas | OPP-11 and OPP-15 | `AGENTS.md` + `reversa-optimize` |
| Varredura completa do padrão | OPP-7 | `reversa-standardize` |
| Teste de DOM em jsdom precisa de `<table><tbody>` | teste da OPP-13 | `verification-protocol.md` |
| Trilha de evidência e Definition of Done | todas as OPPs | `reversa-refactor/SKILL.md` |

## 3. Patch proposto para `AGENTS.md`

Anexar ao final do arquivo, depois da seção "Regra não-negociável":

```markdown
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
```

## 4. Patch proposto para `.agents/skills/reversa-refactor/SKILL.md`

### 4.1 Inserir depois de "Antes de começar"

```markdown
## Etapa 0.5: baseline de verificação (obrigatória)

Antes de inventariar ou aplicar qualquer oportunidade:

1. Rode `npm test` e `npm run type-check`; guarde a saída em `_reversa_refactor/<contexto>/baseline/`.
2. Classifique cada falha como pré-existente, do alvo ou intermitente.
3. Para provar que uma falha é pré-existente, reverta apenas os arquivos do alvo (`git stash push -- <arquivos>`), rode a mesma suíte e restaure.
4. Nunca atribua uma falha à transformação sem essa prova.
5. Se o alvo não tiver teste, a confiança fica 🔴 até criar caracterização.
```

### 4.2 Inserir antes de "Etapa 1"

```markdown
## Regras de alvo

- Um verbo por oportunidade. Correção de bug não entra no mesmo change set de refactor estrutural.
- DOM: escopo no container, ID único por instância, zero `document.getElementById` para componentes repetidos.
- Cálculo: fonte única em `grades-utils` ou equivalente; arredondamento só na borda de exibição.
- Estado: proibido `window.__...` para transportar estado entre módulos.
- Consultas: sem N+1; usar lote quando a entrada é lista e medir a contagem antes/depois.
- Padronização: fechar com varredura do padrão antigo e zero ocorrências residuais no alvo.
```

### 4.3 Inserir antes de "Etapa 4"

```markdown
## Etapa 3.5: Definition of Done

Nenhuma oportunidade é concluída sem:

- testes do alvo verdes e `npm run type-check` verde;
- caracterização verde antes e depois;
- correção de bug com teste de regressão vermelho antes e verde depois;
- diff e saídas em `transformations/OPP-.../`;
- `transformation.md` com `approval`, `safety_net` e `measurement`;
- `opportunities/<id>.md` com `state: applied`;
- `generated/index.md` atualizado;
- falhas pré-existentes documentadas com prova de baseline;
- nenhum arquivo fora do alvo alterado.
```

### 4.4 Adicionar referência em "Antes de começar"

```markdown
5. Leia `references/verification-protocol.md` e siga o baseline e o Definition of Done.
```

## 5. Novo arquivo `.agents/skills/reversa-refactor/references/verification-protocol.md`

```markdown
# Protocolo de verificação do time Code Quality

## 1. Baseline

1. Rode `npm test` e `npm run type-check`. Guarde em `_reversa_refactor/<contexto>/baseline/before.txt`.
2. Classifique falhas: pré-existente, do alvo ou intermitente.
3. Prove pré-existente revertendo só o alvo:
   `git stash push -- <arquivos do alvo>`
   `<mesma suíte>`
   `git stash pop`
4. Registre a prova no `transformation.md`. Nunca atribua falha antiga à mudança nova.

## 2. Rede de segurança

- Caracterização: fixa o comportamento atual e fica verde antes.
- Regressão: falha antes da correção e fica verde depois.
- Equivalência: tabela entrada para saída, com bordas: vazio, zero, nulo, limites 0 e 10, concorrência.
- Não use snapshot amplo para esconder mudança. Asserte o campo afetado.
- Em jsdom, monte `<table><tbody>` antes de inserir `<tr>`.

## 3. Gate e evidência

- `plan.html` antes de tocar código.
- `CHG-NNN.diff` mostrado e aprovado antes de aplicar.
- `safety-net/before.txt` e `safety-net/after.txt`.
- `before-after/measurement.md` ou `before-after/equivalence.md`.
- `transformation.md` com `approval`, `safety_net`, `measurement` e `reversible_via`.
- Estado da oportunidade e `generated/index.md` atualizados.

## 4. Definition of Done

- Testes do alvo verdes.
- `npm run type-check` verde.
- Caracterização verde antes e depois.
- Regressão do bug vermelha antes e verde depois.
- Nenhum arquivo fora do alvo alterado.
- Falhas pré-existentes documentadas.
- Registro e views atualizados.

## 5. Template de falha pré-existente

```text
Falha: <arquivo> > <teste>
Comando de baseline: <comando>
Alterações do alvo revertidas: git stash push -- <arquivos>
Resultado: <número> falhas antes e depois
Conclusão: pré-existente, fora do escopo da OPP
```
```

## 6. Patches pontuais nos especialistas

| Arquivo | Inserir | Texto |
|---------|---------|-------|
| `reversa-decouple/SKILL.md` | depois de "Rede de segurança" | "Para seletor repetido, meça instâncias que compartilham o ID. Prefira `container.querySelector` e ID único por instância. Se a correção mudar o alvo de uma escrita (card B lia card A), trate como correção de bug e prove com regressão vermelha antes. Proíba `window.__...` para estado entre módulos." |
| `reversa-simplify/SKILL.md` | depois de "Rede de segurança e equivalência" | "Arredonde apenas na borda de exibição. A tabela de equivalência cobre todos os campos derivados: média, final, status e habilitação de recuperação. Bordas obrigatórias: zero, nulo, múltiplos de 0,5, limites 0 e 10 e recuperação." |
| `reversa-optimize/SKILL.md` | depois de "Medição" | "Em alvo com banco, conte consultas por item e total antes e depois. N+1 é gargalo mensurável. Reduza a lote quando a entrada é lista, preservando ordem, filtros e semântica de versão." |
| `reversa-standardize/SKILL.md` | depois de "Detecção do padrão" | "Antes de fechar, use grep para contar o padrão antigo no alvo. Padronização só termina com zero ocorrências residuais. Resíduo em outro template vira nova oportunidade registrada." |
| `reversa-restructure/SKILL.md` | depois de "Preservação de comportamento" | "Quando a mesma estrutura de DOM ou objeto é lida em mais de um módulo, extraia um leitor único tipado, que retorna dados e não HTML. Caracterize cada consumidor antes da troca." |
| `reversa-modularize/SKILL.md` | depois de "Preservação de comportamento e fronteiras da alma" | "Após a extração, rode testes do módulo novo, dos módulos extraídos e dos consumidores. Verifique imports, tipos e ordem de inicialização. Reexportação temporária precisa de registro e prazo." |
| `reversa-prune/SKILL.md` | depois de "Prova de morte" | "Busque referência estática, dinâmica (string, handler, eval) e no HTML. Remova logs de debug junto do código morto. Rode type-check e build. Sem prova, a oportunidade fica `proposed`." |

## 7. Aplicação

A config foi liberada com `AGENTS.md` e `.agents/skills/**`. Foram aplicados:

- `AGENTS.md`: seção "Regras de qualidade de código (obrigatórias)".
- `.agents/skills/reversa-refactor/SKILL.md`: Etapa 0.5, Regras de alvo e Etapa 3.5.
- `.agents/skills/reversa-refactor/references/verification-protocol.md`: novo protocolo.
- `reversa-decouple`, `reversa-simplify`, `reversa-optimize`, `reversa-restructure`, `reversa-standardize`, `reversa-prune` e `reversa-modularize`: seções específicas.

A validação foi apenas documental: `git diff --stat` confirma alteração só em markdown, sem tocar código de produção.
