# Legacy Impact: Indicadores Pedagógicos da Turma

> Feature: `013-indicadores-turma`
> Data: `2026-10-30`
> Política de edição: `allowLegacyEdits: true`, `allowedPaths: ["src/**", "scripts/**", "supabase/**", "tests/frequencia/e2e/**", "_reversa_refactor/**", "AGENTS.md", ".agents/skills/**"]`

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|------------|------|------------|---------------|
| `src/lib/grades-utils.ts` | Academic, utilitários de notas | componente-alterado | LOW | Adiciona `calcularPercentualFrequencia` compartilhado |
| `src/lib/academic-service.ts` | Academic | regra-nova | MEDIUM | Novo read model de indicadores e reuso do helper na Ata |
| `src/types/domain.ts` | Tipos de domínio | componente-alterado | LOW | Novos tipos `IndicadorDisciplina` e `IndicadoresPedagogicosTurma` |
| `src/views/gestao-turmas.ts` | Presentation, gestão de turmas | componente-alterado | MEDIUM | Nova aba após Calendário, carga e visibilidade por tipo |
| `src/views/gestao-turmas-indicadores.ts` | Presentation | componente-novo | LOW | Renderer puro dos cards e da tabela |
| `src/styles/main.css` | Presentation, estilos | componente-alterado | LOW | Classes `gt-indicadores-*` |
| `src/lib/grades.test.ts` | Academic, testes | componente-alterado | LOW | Testes do helper de frequência |
| `src/lib/academic-service-indicadores.test.ts` | Academic, testes | componente-novo | LOW | Testes do read model |
| `src/views/gestao-turmas-indicadores.test.ts` | Presentation, testes | componente-novo | LOW | Testes do renderer |

## Diff conceitual por componente

### Academic, utilitários de notas (`src/lib/grades-utils.ts`)

Ganhou `calcularPercentualFrequencia`, que reproduz a fórmula da Ata: `clamp(100 - faltas*100/carga_horaria, 0, 100)`, com 100 quando a carga horária é zero. A partir de agora a Ata e os indicadores consomem a mesma função.

### Academic (`src/lib/academic-service.ts`)

Novo método `getIndicadoresPedagogicosTurma(turmaId)`, somente leitura. Ele consulta a turma e o tipo do curso, as disciplinas ofertadas em `turma_disciplinas`, os alunos ativos e o boletim em lote. Calcula médias finais com `grades-utils`, presença com o helper compartilhado, ranges e quebra por disciplina. Turmas de formação retornam erro de indisponibilidade. `_montarComponenteResultado` passou a usar o helper, sem mudar a saída da Ata.

### Presentation, gestão de turmas (`src/views/gestao-turmas.ts`)

Nova aba **Indicadores** depois de Calendário, visível quando o curso não é de formação. A aba carrega o read model ao selecionar a turma e ao ser ativada, exibe cards de média, presença, alunos e disciplinas, tabela por disciplina e estados de vazio e erro. Nenhuma escrita é feita.

### Presentation, renderer (`src/views/gestao-turmas-indicadores.ts`)

Componente novo, puro, que recebe o payload tipado e devolve o HTML dos cards, da tabela e dos estados vazio/erro. Usa `escapeHTML` para nomes e mensagens.

### Tipos (`src/types/domain.ts`)

Novos contratos `IndicadorDisciplina` e `IndicadoresPedagogicosTurma`, com campos anuláveis para indicadores sem dado.

### Estilos (`src/styles/main.css`)

Classes `gt-indicadores-*` para grid, cards, ranges, tabela e estados, usando os tokens de cor existentes. Nenhum estilo inline novo.

## Preservadas

- RB02: Notas devem estar entre 0 e 10 🟢
- RB03: Controle de concorrência em notas (Optimistic Locking) 🟢
- RB09: Disciplinas com estágio têm lógica separada 🟢
- RB13: Tipos de Curso determinam sistema de avaliação (Técnico vs Formação) 🟢
- RB15: Acesso de Alunos ao Boletim (Somente Leitura) 🟢
- Saída da Ata de Resultados Finais: nota final e percentual de frequência continuam iguais para os mesmos dados 🟢
- Nenhuma escrita em `boletim`, `matriculas`, `turmas` ou `turma_disciplinas` 🟢

## Modificadas

Nenhuma regra de negócio confirmada do legado foi alterada. A feature adiciona regras novas de leitura (RN-01 a RN-11 no `requirements.md`) e preserva as regras existentes. A única mudança em código compartilhado é a extração da fórmula de frequência para um helper, com comportamento equivalente ao da Ata.
