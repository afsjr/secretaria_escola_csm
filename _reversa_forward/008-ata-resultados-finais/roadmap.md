# Roadmap: Ata de Resultados Finais (PDF)

> Identificador: `008-ata-resultados-finais`
> Data: `2026-09-07`
> Requirements: `_reversa_forward/008-ata-resultados-finais/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A feature adiciona a geração de um novo documento oficial em PDF — a **Ata de Resultados Finais** — reutilizando a stack de PDF já consolidada do projeto (jsPDF + `jspdf-autotable`). A montagem dos dados será centralizada num novo método de serviço (`AcademicService.getDadosAtaTurma`) que combina dados já persistidos — turma, curso, catálogo de `disciplinas_base` (matriz), matrículas/`status_aluno` e registros de `boletim` — e é consumido por uma nova função do `PDFService` (`generateAtaResultadosPDF`) que age como **renderer puro** (padrão dos demais `generate*PDF` do legado). A emissão é disparada pela secretaria na aba **Alunos** de `src/views/gestao-turmas.ts`. O PDF é A4 paisagem, com cabeçalho institucional reutilizando `_renderLogo`, tabela com quebra de página automática (cabeçalho repetido + numeração), rodapé com local/data e assinaturas, legenda de siglas e nome padrão `ata_resultados_{turma}_{ano}.pdf`. Nenhum DDL ou migração é necessária; a feature é somente leitura (não grava no banco).

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| n/a | Não foram definidos princípios em `.reversa/principles.md` | respeita |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Gerar o PDF no frontend com **jsPDF + jspdf-autotable** (stack existente em `pdf-service.ts`/`certificate-service.ts`) | Dúvida 1 resolvida: "usar o que já funciona no projeto"; não há backend Python e não há contrato externo de geração | Python/ReportLab (inexistente no projeto); Edge Function em Deno com pdf-lib (round-trip, custo, foge do padrão) | 🟢 |
| D-02 | **`PDFService.generateAtaResultadosPDF(payload)`** recebe dados prontos (renderer puro); a montagem fica em **`AcademicService.getDadosAtaTurma(turmaId)`** | Padrão do legado: `generateBoletimPDF(alunoData, notasData, turmaInfo)` recebe payload e `_renderHeader`/`getHeader` cuidam do cabeçalho | `pdf-service` consultando Supabase diretamente (acopla renderer ao repositório) | 🟢 |
| D-03 | Componentes = catálogo `disciplinas_base` do `curso_id` da turma (ordem `modulo, nome`); carga horária = `carga_horaria` (total); coluna E/S usa `boletim.nota_estagio` (AP/REP) para componentes com estágio (`disciplinaTemEstagio`) | RN-01/RF-05 (matriz, sem hardcode); não existe split T/P no banco (`disciplinas_base.carga_horaria` é único) | DDL novo (`carga_horaria_tp/es`) — desnecessário para o escopo | 🟢 |
| D-04 | Layout empilhado: **linhas por aluno×componente** + linha consolidada "Situação final" ao fim de cada aluno | Matriz de Técnico em Enfermagem tem ~20+ componentes; colunas por componente lado a lado explodem a largura do A4 paisagem | Colunas por componente (largura inviável); página por aluno (não é ata) | 🟡 |
| D-05 | Situação final por aluno derivada com vocabulário existente: `status_aluno` diferente de `ativo` prevalece (`evadido`, `trancado`, `concluido`); para `ativo`, agregar status por componente (`Aprovado` em todos → Aprovado; algum `Reprovado` → Reprovado; algum `Cursando` → Cursando) reusando `calcularNotaFinal`/`calcularStatusAluno` | RN-02/RN-03 (consumir resultados e nomenclatura existente); não é decisão nova, é apresentação dos status canônicos | Enum novo persistido (DDL + decisão educacional fora do escopo) | 🟡 |
| D-06 | Percentual de frequência por componente derivado de `boletim.faltas` vs `carga_horaria`: `clamp(100 - faltas*100/carga_horaria, 0, 100)` | Não há tabela de presença (gap conhecido em `_reversa_sdd/domain.md#gaps-identificados`); frequência é dado calculado de exibição | Criar tabela de presença (fora do escopo desta feature) | 🟡 |
| D-07 | Ano letivo derivado de `turmas.periodo` (token `YYYY` com fallback ano corrente); polo/local facultativo informado na emissão | Não existem colunas `ano_letivo`/`turno`/`polo` em `turmas`; evita DDL | Novas colunas em `turmas` (DDL desnecessário) | 🟡 |
| D-08 | Cabeçalho paisagem reutiliza `_renderLogo` + cor primária de `getHeader()`; tabela com paginação automática (`headStyles` repetido por página) e numeração via `didDrawPage` | Mesmo padrão dos PDFs existentes; atende RF-06 | Paginação manual por página (frágil) | 🟢 |
| D-09 | Botão "Emitir Ata de Resultados Finais" na aba **Alunos** de `gestao-turmas.ts`, gate `canManageTurmas` (`admin`, `secretaria`, `coordenacao`, `master_admin`) com campo opcional "Polo/Local" | RF-12 + Dúvida 3 resolvida ("geração pela secretaria na aba de gestão de turmas"); `canManageTurmas` já é o gate da view | Nova view dedicada (sem necessidade) | 🟢 |

## 4. Premissas

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| P-01 A situação final global do aluno não é persistida; é derivada no payload a partir do vocabulário existente | §4 RN-03; §9 Dúvida 2 | Divergência futura se o critério de aprovação oficial mudar (mitigação: fonte única `grades-utils` + `status_aluno`) |
| P-02 Turno e ano letivo são derivados de `turmas.periodo`; polo/local é entrada opcional na tela de emissão | §5 RF-03, RF-11; §9 Dúvidas 2 e 3 | `periodo` não padronizado (ex.: "Tec. Enf. 12A" sem ano) exige fallback ano corrente |
| P-03 Percentual de frequência é derivado de `faltas` vs `carga_horaria` (não há cadastro de presenças) | §6 Usabilidade; `_reversa_sdd/domain.md#gaps-identificados` | Percentual impreciso se faltas não forem alimentadas por disciplina |
| P-04 Componentes sempre vêm da matriz do curso (catálogo `disciplinas_base`), nunca hardcoded | §4 RN-01; §5 RF-05 | Curso sem catálogo torna a emissão bloqueada por validação (falha amigável) |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `PDFService` | `_reversa_sdd/architecture.md#módulos-principais` (Documents, jsPDF) | contrato-alterado | Adicionar `generateAtaResultadosPDF(payload)` — renderer puro A4 paisagem com cabeçalho, tabela paginada, rodapé oficial e legenda |
| `AcademicService` | `_reversa_sdd/architecture.md#módulos-principais` (Academic) | contrato-alterado | Adicionar `getDadosAtaTurma(turmaId)` — montagem do payload: turma, curso, catálogo, matrículas e boletim com derivações (status por componente, situação final, % frequência) |
| `GestaoTurmasView` | `src/views/gestao-turmas.ts` | regra-alterada | Botão de emissão da Ata + campo "Polo/Local" na aba Alunos, gate `canManageTurmas` |
| Testes | `src/lib/pdf-service.test.ts` / `academic-service.test.ts` | componente-novo | Casos Vitest para montagem do payload e renderização (payload mínimo reproduzindo a Ata) |

## 6. Delta no modelo de dados

- Resumo das mudanças: **Nenhuma alteração DDL.** Tabelas apenas lidas: `turmas`, `cursos`, `disciplinas_base`, `matriculas`, `boletim`, `perfis`. Campos derivados no payload (situação final, status por componente, % frequência, ano letivo) não são persistidos.
- Detalhe completo em: `_reversa_forward/008-ata-resultados-finais/data-delta.md`

## 7. Delta de contratos externos

> n/a — Nenhum contrato externo novo (HTTP, fila, gRPC, GraphQL). A Ata usa apenas o Supabase Client JS já existente (leituras sob RLS) e geração local de PDF.

## 8. Plano de migração

> n/a — Sem migração de dados e sem scripts DDL.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Situação final derivada divergir de critério oficial futuro (não persistida) | médio | médio | Fonte única `grades-utils` + `status_aluno`; criar teste de contrato do payload; registrar risco no `regression-watch.md` |
| Layout empilhado com ~20+ componentes gerar PDF extenso | médio | baixa | Paginação automática com cabeçalho repetido (autotable) + arquivo limitado a uma turma |
| Turma sem catálogo/notas gerar PDF vazio | médio | média | Guard amigável na view: não emite PDF e exibe erro orientando a conclusão dos lançamentos |
| `periodo` sem token `YYYY` gerar ano letivo errado | baixo | média | Fallback para ano corrente e possibilidade de ajuste manual futuro |
| Regressão visual nos PDFs existentes ao reutilizar `_renderLogo` | médio | baixa | Testes do payload + verificação manual no onboarding; manter `_renderLogo` intacto |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `regression-watch.md` gerado
- [ ] Testes Vitest passando para `AcademicService.getDadosAtaTurma` (payload puro) e `PDFService.generateAtaResultadosPDF` (renderização com payload mínimo)
- [ ] `npm run type-check` e `npm test` sem novos erros introduzidos pela feature
- [ ] Fluxo manual validado conforme `onboarding.md` (A4 paisagem, paginação, rodapé, nome do arquivo, falha amigável)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-07 | Versão inicial gerada por `/reversa-plan` | reversa |