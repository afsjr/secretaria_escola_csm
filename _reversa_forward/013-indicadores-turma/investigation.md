# Investigation: Indicadores Pedagógicos da Turma

> Identificador: `013-indicadores-turma`
> Data: `2026-10-30`

## 1. Pergunta central

Como exibir, na gestão de turmas técnicas, um resumo pedagógico confiável com média, presença e amplitude das médias, sem duplicar as regras de cálculo já usadas pela Ata e pelo boletim?

## 2. Estado atual do legado

### 2.1 Tabs da gestão de turmas

`src/views/gestao-turmas.ts:130-260` define as abas Alunos, Grade, Notas e Calendário. `toggleTabsPorTipo` (`:758-777`) oculta Grade e Notas quando `selectedCursoTipo === 'formacao'`. A constante `TABS` (`:879`) lista `alunos`, `grade`, `notas` e `calendario`. A troca de turma (`:786-808`) carrega alunos, grade e calendário e chama `toggleTabsPorTipo`.

### 2.2 Fontes de notas e presença

- `boletim` guarda `n1`, `n2`, `n3`, `rec`, `faltas`, `nota_estagio` e `status` por aluno e disciplina base (`supabase/schema.sql:103-119`).
- `turma_disciplinas` liga a turma às disciplinas ofertadas (`supabase/schema.sql:83-92`).
- `disciplinas_base` guarda `carga_horaria` (`supabase/schema.sql:73-81`).
- `matriculas` guarda `status_aluno` (`supabase/schema.sql:94-101`).

### 2.3 Cálculo vigente

- `grades-utils.ts` é a fonte única de média parcial, nota final e status.
- `academic-service.ts:459-500` (`_montarComponenteResultado`) calcula a nota final e o percentual de frequência da Ata com `clamp(100 - faltas*100/carga_horaria, 0, 100)`.
- `getDadosAtaTurma` (`academic-service.ts:357-452`) monta a Ata a partir da matriz completa do curso, não das ofertas da turma. É a referência de consistência para a fórmula, mas não para o conjunto de disciplinas.

## 3. Alternativas avaliadas

| Alternativa | Vantagens | Desvantagens | Decisão |
|-------------|-----------|--------------|---------|
| Reutilizar `getDadosAtaTurma` e filtrar no cliente | Reaproveita cálculo pronto | Usa a matriz inteira, não as ofertas; payload grande e voltado a PDF | Descartada |
| Calcular tudo na view | Menos camadas | Duplica queries e fórmulas; difícil testar | Descartada |
| Usar a tabela `frequencia` e `aulas` para presença | Representa aula a aula | O cálculo oficial da Ata usa `boletim.faltas`; a tabela pode estar incompleta | Descartada |
| Novo read model no Academic com helper compartilhado | Testável, quatro queries em lote, consistente com a Ata | Exige um helper novo e refatorar a Ata para usá-lo | Escolhida |

## 4. Padrões aplicáveis

1. **Read model no serviço**: `getDadosAtaTurma` já mostra o padrão de montar um payload de leitura no Academic, sem gravar.
2. **Fonte única de cálculo**: extrair `calcularPercentualFrequencia` para `grades-utils.ts` e consumir na Ata e nos indicadores.
3. **Consultas em lote**: `getNotasCompletasTurma` já usa `getAlunosDaTurma`; para a turma inteira, o novo método usa `.in` em alunos e disciplinas.
4. **Tipagem de domínio**: `src/types/domain.ts` já concentra os tipos da Ata e do boletim.
5. **Classes CSS**: a view de gestão de turmas usa muitos estilos inline; a feature nova deve seguir a regra do `AGENTS.md` e criar classes `gt-indicadores-*` em `main.css`.

## 5. Verificação de consistência com a Ata

Para a mesma turma, aluno e disciplina, a nota final e a presença devem coincidir com a Ata. O teste deve montar um cenário com dois alunos, duas disciplinas e faltas conhecidas e comparar o resultado do novo método com o helper e com a fórmula da Ata.

## 6. Perguntas resolvidas com o usuário

| Pergunta | Resposta |
|----------|----------|
| Como calcular a média da turma? | Média final por aluno, depois média entre alunos |
| Como calcular presença? | Mesma regra da Ata: faltas sobre carga horária |
| O que mostrar no range? | Maior e menor média entre alunos |
| Fluxo de trabalho | Forward, com requirements, plan e coding |

## 7. Pendências

Nenhuma pendência bloqueante. As premissas 🟡 estão registradas no `requirements.md` e no `roadmap.md`.

## 8. Fontes consultadas

- `_reversa_sdd/domain.md#rb02`, `#rb09`, `#rb13`, `#rb15`
- `_reversa_sdd/academic/requirements.md#rf-12`
- `_reversa_sdd/academic/design.md#interface`
- `_reversa_sdd/addenda/008-ata-resultados-finais.md#impacto`
- `_reversa_sdd/addenda/010-calculo-medias-notas.md#impacto`
- `src/views/gestao-turmas.ts:130-260`, `:758-808`, `:879`
- `src/lib/academic-service.ts:357-500`
- `src/lib/grades-utils.ts`
- `src/types/domain.ts:150-190`
- `supabase/schema.sql:73-129`
