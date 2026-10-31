# Requirements: Indicadores Pedagógicos da Turma

> Identificador: `013-indicadores-turma`
> Data: `2026-10-30`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Adiciona uma aba **Indicadores** na gestão de turmas, logo após **Calendário**, visível apenas para turmas de curso técnico. A aba apresenta, em modo somente leitura, a média final da turma, o percentual de presença e, para cada indicador numérico, a maior e a menor média entre os alunos, permitindo entender rapidamente a distribuição da turma. Também mostra a quebra por disciplina e quantos alunos e disciplinas entraram no cálculo. A feature reutiliza as regras já vigentes de média (`grades-utils`) e de frequência da Ata (`faltas` do boletim sobre a carga horária), sem gravar nada no banco.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/domain.md#rb02` | Notas devem estar entre 0 e 10, com validação via Zod | 🟢 |
| `_reversa_sdd/domain.md#rb13` | `tipo_curso` define avaliação numérica para técnico e conceito para formação | 🟢 |
| `_reversa_sdd/academic/requirements.md#rf-12` | Consulta ao boletim do aluno, notas por disciplina | 🟢 |
| `_reversa_sdd/academic/design.md#interface` | `getAlunosDaTurma`, `getDisciplinasDaTurma` e `getNotasCompletasTurma` já existem no Academic | 🟢 |
| `_reversa_sdd/code-analysis.md#academic` | Módulo Academic concentra turmas, matrículas, boletim e médias | 🟡 |
| `_reversa_sdd/addenda/008-ata-resultados-finais.md#impacto` | Percentual de frequência derivado de `faltas` do boletim: `clamp(100 - faltas*100/carga_horaria, 0, 100)` | 🟢 |
| `_reversa_sdd/addenda/010-calculo-medias-notas.md#impacto` | `calcularMediaParcial` considera apenas notas maiores que zero | 🟢 |
| `src/views/gestao-turmas.ts#130-260` | Tabs atuais: Alunos, Grade, Notas, Calendário, com ocultação de Grade/Notas para formação | 🟢 |
| `src/lib/academic-service.ts#357-500` | `getDadosAtaTurma` já calcula nota final e percentual de frequência por componente | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Coordenação / Secretaria | Acompanhar o desempenho pedagógico da turma | Seleciona uma turma técnica e vê média, presença e amplitude das médias |
| Professor | Entender a distribuição da turma | Consulta a maior e a menor média para identificar alunos em risco |
| Direção | Diagnóstico rápido por turma | Compara a média e a presença da turma com o range apresentado |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** A aba **Indicadores** existe apenas para turmas cujo `tipo_curso` não é `formacao`. Turmas com `tipo_curso` nulo são tratadas como técnicas, preservando o mesmo comportamento atual de Grade e Notas. Em turmas de `formacao`, a aba e o conteúdo ficam ocultos, com fallback para a aba Alunos. 🟡
   - Origem no legado: `_reversa_sdd/domain.md#rb13`
   - Tipo: nova
2. **RN-02:** A aba é somente leitura. Nenhum indicador é persistido; todo cálculo acontece na leitura. 🟢
   - Origem no legado: `_reversa_sdd/addenda/008-ata-resultados-finais.md#impacto` (Ata também é read-only)
   - Tipo: nova
3. **RN-03:** Entram no cálculo apenas alunos com `status_aluno = 'ativo'` na turma. Alunos trancados, evadidos ou concluídos não compõem os indicadores. 🟡
   - Tipo: nova
4. **RN-04:** Entram no cálculo apenas as disciplinas ofertadas na turma (`turma_disciplinas`). A matriz curricular completa do curso não é usada. 🟢
   - Origem no legado: `_reversa_sdd/code-analysis.md#academic` e tabela `turma_disciplinas`
   - Tipo: nova
5. **RN-05:** A nota final de um aluno em uma disciplina é `calcularNotaFinal(calcularMediaParcial(n1, n2, n3), rec)`. A disciplina só entra na média se pelo menos uma das notas `n1`, `n2` ou `n3` for maior que zero. 🟢
   - Origem no legado: `_reversa_sdd/addenda/010-calculo-medias-notas.md#impacto`
   - Tipo: preservada
6. **RN-06:** A nota de estágio (`nota_estagio` AP/REP) não entra na média numérica, por não ser uma nota de 0 a 10. Ela continua representada apenas na Ata. 🟡
   - Origem no legado: `_reversa_sdd/domain.md#rb09` e `_reversa_sdd/addenda/008-ata-resultados-finais.md#impacto`
   - Tipo: nova
7. **RN-07:** A média do aluno é a média aritmética das notas finais das disciplinas com dados. A média da turma é a média aritmética das médias dos alunos com pelo menos uma nota. Exibição com uma casa decimal. 🟢
   - Tipo: nova
8. **RN-08:** O percentual de presença de um aluno em uma disciplina é `clamp(100 - faltas*100/carga_horaria, 0, 100)`, usando `faltas` do boletim e `carga_horaria` da disciplina. A presença do aluno é a média entre as disciplinas com boletim. A presença da turma é a média entre os alunos com pelo menos um boletim. Exibição em inteiro. 🟢
   - Origem no legado: `_reversa_sdd/addenda/008-ata-resultados-finais.md#impacto`
   - Tipo: preservada
9. **RN-09:** O range da média é a maior e a menor média entre os alunos considerados. O range da presença é a maior e a menor presença entre os alunos considerados. Com um único aluno, maior e menor coincidem. Sem dados, exibe traço. 🟢
   - Tipo: nova
10. **RN-10:** A quebra por disciplina mostra, para cada disciplina ofertada, a média das notas finais, a maior e a menor nota e a presença média. 🟡
    - Tipo: nova
11. **RN-11:** Os indicadores são recarregados ao selecionar a turma e ao ativar a aba Indicadores, para refletir lançamentos recentes feitos em outras telas. 🟡
    - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Adicionar a aba Indicadores após Calendário na barra de tabs da gestão de turmas | Must | Turma com tipo diferente de formação exibe a aba depois de Calendário; turma de formação não exibe | 🟡 |
| RF-02 | Carregar os indicadores ao selecionar a turma e ao abrir a aba | Must | Ao trocar de turma, os cards refletem a turma selecionada; ao abrir a aba, os dados são atualizados | 🟢 |
| RF-03 | Exibir card de média da turma com média, maior e menor média entre alunos | Must | Card mostra média com uma casa decimal e o range maior/menor | 🟢 |
| RF-04 | Exibir card de presença com percentual da turma, maior e menor presença entre alunos | Must | Card mostra percentual inteiro e o range maior/menor | 🟢 |
| RF-05 | Exibir contagem de alunos ativos, alunos com dados e disciplinas consideradas | Should | Contadores batem com o conjunto usado no cálculo | 🟡 |
| RF-06 | Exibir tabela por disciplina com média, maior nota, menor nota e presença média | Should | Uma linha por disciplina ofertada, ordenada por módulo e nome | 🟡 |
| RF-07 | Exibir estado vazio quando não houver alunos ativos, disciplinas ou notas | Must | Mensagem clara, sem cards com zero enganoso | 🟢 |
| RF-08 | Exibir estado de erro com mensagem e ação de tentar novamente | Should | Falha de consulta mostra mensagem e botão de recarregar | 🟡 |
| RF-09 | Ocultar a aba e o conteúdo para cursos de formação, garantindo fallback para Alunos | Must | Turma de formação não vê Indicadores nem conteúdo residual | 🟢 |
| RF-10 | Reutilizar as regras de média e frequência existentes, sem duplicar fórmulas | Must | Cálculo usa `grades-utils` e um único helper de frequência compartilhado com a Ata | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | Buscar alunos, disciplinas e boletins em lote, sem N+1 por aluno ou por disciplina | Regra de qualidade do projeto e volume de alunos por turma | 🟢 |
| Consistência | Média e frequência devem coincidir com a Ata para os mesmos alunos e disciplinas | `_reversa_sdd/addenda/008-ata-resultados-finais.md#impacto` | 🟢 |
| Manutenibilidade | Fórmula de frequência em um único helper compartilhado com `academic-service` | Evitar a divergência já vista em `_reversa_sdd/addenda/010-calculo-medias-notas.md#impacto` | 🟢 |
| Segurança | Leitura sujeita às regras de segurança por linha (RLS) existentes; nenhuma escrita nova | `_reversa_sdd/domain.md#rb15` e serviços atuais | 🟢 |
| Acessibilidade | A aba segue o padrão de tabs existente e é acionável por teclado | `src/views/gestao-turmas.ts#130-260` | 🟡 |
| Observabilidade | Erros de consulta exibidos ao usuário; sem log de dados pessoais | Práticas do projeto e `scripts/security/scan-sensitive.mjs` | 🟡 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Turma técnica exibe a aba Indicadores
  Dado uma turma vinculada a um curso com tipo_curso "tecnico" ou nulo
  Quando a turma é selecionada na gestão de turmas
  Então a aba Indicadores aparece depois de Calendário
  E ao ativá-la os cards de média e presença são exibidos

Cenário: Turma de formação não exibe a aba
  Dado uma turma vinculada a um curso com tipo_curso "formacao"
  Quando a turma é selecionada
  Então a aba Indicadores não aparece
  E a aba Alunos permanece ativa

Cenário: Média e range com dois alunos
  Dado uma turma com dois alunos ativos
  E o aluno A com média final 8,0 e o aluno B com média final 6,0
  Quando os indicadores são calculados
  Então a média da turma é 7,0
  E a maior média é 8,0
  E a menor média é 6,0

Cenário: Presença e range com dois alunos
  Dado uma turma com dois alunos ativos
  E o aluno A com presença 90% e o aluno B com presença 70%
  Quando os indicadores são calculados
  Então a presença da turma é 80%
  E a maior presença é 90%
  E a menor presença é 70%

Cenário: Disciplina sem nota lançada
  Dado uma disciplina ofertada sem nenhuma nota maior que zero
  Quando os indicadores são calculados
  Então a disciplina não entra na média do aluno
  E a tabela por disciplina exibe traço no lugar da média

Cenário: Turma sem dados
  Dado uma turma sem alunos ativos ou sem boletim
  Quando a aba Indicadores é aberta
  Então o sistema exibe estado vazio
  E não mostra média zero como se fosse resultado real

Cenário: Troca de turma atualiza os indicadores
  Dado que a turma A está selecionada com média 7,0
  Quando a turma B é selecionada
  Então os cards passam a refletir a média e a presença da turma B
  E nenhum valor da turma A permanece visível

Cenário: Contadores refletem o universo do cálculo
  Dado uma turma com cinco alunos ativos e quatro disciplinas ofertadas
  E apenas três alunos possuem boletim
  Quando os indicadores são calculados
  Então o contador de alunos ativos mostra cinco
  E o contador de alunos com dados mostra três
  E o contador de disciplinas mostra quatro

Cenário: Tabela por disciplina mostra média e range
  Dado uma turma com a disciplina Anatomia ofertada
  E as notas finais dos alunos nessa disciplina são 5,0, 7,0 e 9,0
  Quando a tabela por disciplina é exibida
  Então a linha de Anatomia mostra média 7,0, maior nota 9,0 e menor nota 5,0

Cenário: Falha de consulta mostra erro e permite tentar novamente
  Dado que a consulta de indicadores falha
  Quando a aba Indicadores é aberta
  Então o sistema exibe uma mensagem de erro
  E oferece uma ação para tentar novamente

Cenário: Leitura sem escrita
  Quando os indicadores são carregados
  Então nenhuma operação de insert, update ou delete é executada
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | É o ponto de entrada da feature |
| RF-02 | Must | Garante que os dados correspondem à turma selecionada |
| RF-03 | Must | Indicador central pedido pelo usuário |
| RF-04 | Must | Indicador central pedido pelo usuário |
| RF-09 | Must | Evita exibir avaliação numérica em curso de formação |
| RF-10 | Must | Preserva a fonte única de cálculo definida pelo projeto |
| RF-05 | Should | Contextualiza o universo do cálculo |
| RF-06 | Should | Ajuda a localizar a origem do range |
| RF-07 | Must | Evita leitura enganosa de turma vazia |
| RF-08 | Should | Melhora a recuperação de falhas |
| RNF Desempenho | Must | Evita N+1 em turmas com muitos alunos |
| RNF Consistência | Must | Indicadores precisam bater com a Ata |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Não há marcadores de dúvida em aberto.

## 10. Lacunas

- Nenhuma lacuna bloqueante. As premissas 🟡 estão registradas nas regras de negócio e podem ser ajustadas no `/reversa-clarify`.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-10-30 | Versão inicial gerada por `/reversa-requirements` | reversa |
