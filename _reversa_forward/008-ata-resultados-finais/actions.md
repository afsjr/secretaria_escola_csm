# Actions: Ata de Resultados Finais (PDF)

> Identificador: `008-ata-resultados-finais`
> Data: `2026-09-07`
> Roadmap: `_reversa_forward/008-ata-resultados-finais/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 7 |
| Paralelizáveis (`[//]`) | 5 |
| Maior cadeia de dependência | 4 |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Definir contratos de tipo do payload da Ata em `src/types/domain.ts`: `AtaResultadosData` (turma, curso, anoLetivo, polo?, alunos[] e componentes[] com `statusAluno`, status por componente, `percentualFrequencia`, `situacaoFinal`), `AtaAlunoResultado` e `AtaComponenteResultado` — reutilizando os literais de `status_aluno` e os rótulos de status já existentes no arquivo | - | `[//]` | `src/types/domain.ts` | 🟡 | `[X]` |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T002 | Testes unitários de `AcademicService.getDadosAtaTurma` (TDD do contrato): situação final preferente (`status_aluno` evadido/trancado/concluido prevalece), agregado por componente (todos Aprovado → Aprovado; algum Reprovado → Reprovado; senão Cursando), evadido sem nota → "—", % frequência clampado `100 - faltas*100/carga_horaria`, ordem por `modulo, ordem`, ano letivo com fallback do `periodo` | T004 | `[//]` | `src/lib/academic-service.test.ts` | 🟡 | `[X]` |
| T003 | Testes unitários de `PDFService.generateAtaResultadosPDF`: retorna `jsPDF` com `orientation: 'landscape'` a partir de payload mínimo; não lança exceção; configuração de tabela repete cabeçalho por página e numera via `didDrawPage` (RF-06) | T005 | `[//]` | `src/lib/pdf-service.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T004 | Implementar `AcademicService.getDadosAtaTurma(turmaId)`: carrega turma (nome, `periodo`, `curso_id`) e curso, `getMatrizCurricular` (componentes por `modulo, ordem`), `getAlunosDaTurma` (`matriculas.status_aluno` + `perfis`) e boletins por aluno; deriva `statusPorComponente` via `grades-utils` (`calcularNotaFinal`/`calcularStatusAluno`, `boletim.status='pendente'` → Cursando, `nota_estagio` AP/REP p/ `disciplinaTemEstagio`), `percentualFrequencia` clampado, `situacaoFinal` e `anoLetivo` (token `YYYY` do `periodo` com fallback ano corrente) | T001 | `[//]` | `src/lib/academic-service.ts` | 🟡 | `[X]` |
| T005 | Implementar `PDFService.generateAtaResultadosPDF(payload): jsPDF`: A4 paisagem reutilizando `_renderHeader`/`_renderLogo`; texto cartorial de abertura com data por extenso (RN-05); tabela `jspdf-autotable` com nº de ordem, nome completo, componentes (carga T/P e E/S), nota/conceito, faltas, % frequência e situação final; paginação com cabeçalho repetido (`showHead`) e numeração (`didDrawPage`); rodapé com local/data e linhas de assinatura Diretor(a)/Secretário(a); legenda de siglas; retorna o documento (download fica a cargo do chamador, padrão `downloadPDF`) | T001 | `[//]` | `src/lib/pdf-service.ts` | 🟢 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T006 | Adicionar o botão "Emitir Ata de Resultados Finais" e o campo opcional "Polo/Local" na aba Alunos de `gestao-turmas.ts`, visíveis somente sob o gate `canManageTurmas` (admin/secretaria/coordenação/master_admin); no clique, orquestrar `getDadosAtaTurma` + `generateAtaResultadosPDF` + `downloadPDF` com nome padrão `ata_resultados_{turma}_{ano}.pdf` (RF-10); guard de falha amigável quando turma sem alunos/componentes (nenhum PDF vazio) e toast de sucesso/erro | T004, T005 | - | `src/views/gestao-turmas.ts` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T007 | Sanitizar o nome do arquivo para download reutilizando `sanitizeFilename` de `src/lib/security.ts`; validar critério de pronto do roadmap: `npm run type-check` e `npm test` sem novos erros introduzidos pela feature | T005, T006 | - | `src/views/gestao-turmas.ts` | 🟢 | `[X]` |

## Notas de execução

- T001: tipos adicionados em `src/types/domain.ts` reutilizando os literais de `status_aluno` de `Matricula` (sessão MATRÍCULA) e rótulos de status já usados no legado.
- T004: `getDadosAtaTurma` reutiliza `grades-utils` (nada de lógica nova de aprovação); `boletim.status='pendente'` sem notas é tratado como Cursando naturalmente (nota 0). Diferencial de design: agregação por componente segue `disciplinas_base` (matriz do curso) e não as ofertas da turma.
- T005: renderer A4 paisagem; data por extenso via helpers próprios (`_numeroPorExtenso`/`_anoPorExtenso`); instituição lida de `getHeader()` (sem hardcode de nome); `polo` opcional (null) não é impresso.
- T003: teste de conteúdo de aluno/situação usa o corpo da tabela (`autoTable` mock) porque nomes de alunos não passam por `doc.text`.
- T007: `npm run type-check` limpo; `npm test` — 4 falhas pré-existentes confirmadas via `git stash` (GerenciarAlunosTab e secretaria), não introduzidas pela feature; `npm run build` ok.
- Nenhum `[DÚVIDA]` aberto na execução.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-07 | Versão inicial gerada por `/reversa-to-do` | reversa |