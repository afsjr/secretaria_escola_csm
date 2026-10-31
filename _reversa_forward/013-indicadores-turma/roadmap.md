# Roadmap: Indicadores Pedagógicos da Turma

> Identificador: `013-indicadores-turma`
> Data: `2026-10-30`
> Requirements: `_reversa_forward/013-indicadores-turma/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A feature é um delta somente leitura sobre o módulo Academic. Um novo método `AcademicService.getIndicadoresPedagogicosTurma(turmaId)` consulta a turma, as disciplinas ofertadas (`turma_disciplinas`), os alunos ativos e o boletim em lote, e devolve um payload tipado com médias, presença, ranges e quebra por disciplina. A fórmula de frequência da Ata é extraída para `grades-utils.ts` e passa a ser compartilhada pelos dois consumidores. Na apresentação, `gestao-turmas.ts` ganha a aba Indicadores depois de Calendário, oculta para cursos de formação, com cards e tabela renderizados por classes CSS novas. Nenhuma tabela, migração ou contrato externo é criado.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| Nenhum princípio formal em `.reversa/principles.md` | Aplicam-se as regras de qualidade do `AGENTS.md`: fonte única de cálculo, DOM escopado, sem N+1 e verificação antes de concluir | respeita |
| Fonte única de cálculo | Média usa `grades-utils`; frequência usa helper compartilhado com a Ata | respeita |
| Refactor não muda comportamento | A extração do helper preserva a saída da Ata, coberta por testes existentes | respeita |
| Escopo cirúrgico | Alterações restritas a Academic, tipos, gestao-turmas, CSS e testes | respeita |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Criar `AcademicService.getIndicadoresPedagogicosTurma(turmaId)` com payload tipado | Mantém a leitura testável e evita duplicar consultas na view | Calcular na view; reaproveitar `getDadosAtaTurma` | 🟢 |
| D-02 | Usar apenas disciplinas ofertadas em `turma_disciplinas` | O indicador deve refletir a turma real, não a matriz inteira do curso | `getMatrizCurricular`; `getDisciplinasDaTurma` sem carga horária | 🟢 |
| D-03 | Extrair `calcularPercentualFrequencia(faltas, cargaHoraria)` para `grades-utils.ts` e usar na Ata e nos indicadores | Evita a divergência de fórmula já vista no histórico e mantém a Ata como oráculo | Duplicar a fórmula no novo serviço | 🟢 |
| D-04 | Considerar apenas alunos com `status_aluno = 'ativo'` e somente notas com `n1`, `n2` ou `n3` maior que zero | Evita médias puxadas por notas não lançadas e presença inflada por aluno sem boletim | Incluir todos os alunos; tratar zero como nota lançada | 🟡 |
| D-05 | Média da turma = média das médias dos alunos com dados; range = maior e menor média entre alunos | Atende ao pedido de entender a distribuição da turma | Média de todas as avaliações; média por disciplina apenas | 🟢 |
| D-06 | Exibir a aba quando `tipo_curso` não for `formacao`, tratando nulo como técnico | Mantém o mesmo critério já usado por Grade e Notas | Exigir `tipo_curso = 'tecnico'` e esconder turmas legadas com nulo | 🟡 |
| D-07 | Recarregar os indicadores ao selecionar a turma e ao ativar a aba | Reflete lançamentos feitos em outras telas sem exigir refresh da página | Carregar uma única vez por seleção | 🟡 |
| D-08 | Fazer quatro consultas em lote, com `.in` para alunos e disciplinas | Evita N+1 em turmas grandes | Consultar boletim por aluno ou por disciplina | 🟢 |
| D-09 | Criar classes `gt-indicadores-*` em `src/styles/main.css` | Evita novos estilos inline e mantém o padrão visual | Reutilizar apenas inline styles existentes | 🟢 |
| D-10 | Arredondar notas para uma casa decimal e presença para inteiro na apresentação | Mantém legibilidade sem alterar os valores usados em cálculo | Arredondar para múltiplos de 0,5 antes de calcular | 🟢 |

## 4. Premissas

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| `tipo_curso` nulo é tratado como técnico | RN-01 | Turma de formação sem tipo configurado exibiria a aba |
| Estágio (AP/REP) fica fora da média numérica | RN-06 | Média da turma excluiria uma avaliação que o usuário esperava ver |
| Alunos sem boletim ficam fora da média e da presença | RN-03, RN-07, RN-08 | Turma recém-criada mostraria média 0 em vez de estado vazio |
| A quebra por disciplina é complementar, não substitui os cards | RN-10 | Usuário pode esperar apenas os cards; a tabela adiciona detalhe |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Academic | `_reversa_sdd/architecture.md#academic` | contrato-novo | Novo read model `getIndicadoresPedagogicosTurma` |
| Academic | `_reversa_sdd/architecture.md#academic` | regra-alterada | `_montarComponenteResultado` passa a usar o helper compartilhado de frequência |
| Utilitários de notas | `_reversa_sdd/architecture.md#academic` | componente-alterado | `grades-utils.ts` ganha `calcularPercentualFrequencia` |
| Tipos de domínio | `_reversa_sdd/architecture.md#camadas` | componente-alterado | Novos tipos do payload de indicadores |
| Presentation | `_reversa_sdd/architecture.md#camadas` | componente-alterado | `gestao-turmas.ts` ganha a aba e a função de carga |
| Estilos | `_reversa_sdd/architecture.md#camadas` | componente-alterado | Classes `gt-indicadores-*` em `main.css` |

## 6. Delta no modelo de dados

- Resumo das mudanças: nenhuma tabela, coluna, índice ou migração. A feature apenas lê `turmas`, `cursos`, `turma_disciplinas`, `disciplinas_base`, `matriculas` e `boletim`, e deriva os indicadores em memória.
- Detalhe completo em: `_reversa_forward/013-indicadores-turma/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| n/a | n/a | n/a |

A feature não cria endpoint, fila, evento ou arquivo de contrato externo. O único contrato novo é interno ao `AcademicService`.

## 8. Plano de migração

1. Adicionar `calcularPercentualFrequencia` em `grades-utils.ts` e refatorar a Ata para consumi-lo, mantendo a saída atual.
2. Adicionar os tipos do payload em `src/types/domain.ts`.
3. Implementar `getIndicadoresPedagogicosTurma` em `academic-service.ts` com quatro consultas em lote.
4. Adicionar a aba, o conteúdo, a função de carga e o controle de visibilidade em `gestao-turmas.ts`.
5. Criar as classes CSS `gt-indicadores-*` em `main.css`.
6. Cobrir o serviço com testes de cálculo e bordas; rodar `npm test` do alvo e `npm run type-check`.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Divergência entre indicadores e Ata | alto | média | Helper único de frequência e teste comparando os dois consumidores |
| Presença inflada por aluno sem boletim | médio | alta | Excluir alunos sem boletim do denominador de presença |
| Média puxada por nota não lançada | médio | média | Só considerar disciplinas com pelo menos uma nota maior que zero |
| N+1 em turmas grandes | médio | baixa | Quatro consultas em lote com `.in` |
| Aba aparecer em curso de formação | alto | baixa | Reutilizar `selectedCursoTipo` e ocultar no `toggleTabsPorTipo` |
| Quebra visual em telas pequenas | baixo | média | Grid responsivo e tabela com rolagem horizontal |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)
- [ ] Testes do serviço de indicadores verdes
- [ ] `npm run type-check` verde
- [ ] Aba oculta para formação e visível para técnico validada manualmente
- [ ] Indicadores comparados com a Ata para uma turma real

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-10-30 | Versão inicial gerada por `/reversa-plan` | reversa |
