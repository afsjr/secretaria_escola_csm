# Requirements: Ata de Resultados Finais (PDF)

> Identificador: `008-ata-resultados-finais`
> Data: `2026-09-07`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Esta feature gera a **Ata de Resultados Finais** (documento oficial de escrituração escolar exigido pelo CEE/PE) em PDF, para turmas do Curso Técnico em Enfermagem. O documento reúne, em A4 paisagem, o registro individual dos alunos de uma turma ao final do ano letivo: componentes curriculares da matriz do curso, nota/conceito, faltas, percentual de frequência e situação final (reutilizando a nomenclatura existente: `status_aluno` e status acadêmico `Aprovado`/`Reprovado`/`Cursando`), encerrando com texto cartorial de abertura, campo para assinaturas do Diretor e do Secretário e dados da instituição. A Ata **consome resultados já calculados** pelo sistema — a feature não recalcula aprovação nem grava dados no banco; ela produz apenas o artefato PDF.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#módulos-principais` | Documents module gera PDFs no frontend via jsPDF (`pdf-service.ts`, `certificate-service.ts`); stack é Vite + TypeScript + Supabase BaaS (sem backend Python) | 🟢 |
| `_reversa_sdd/inventory.md#frameworks-e-bibliotecas-principais` | `jspdf ^4.2.1` é a única biblioteca de geração de PDF do projeto | 🟢 |
| `_reversa_sdd/documents/requirements.md#rf-05` | Certificados em PDF gerados com jsPDF + autotable conforme o tipo do curso | 🟢 |
| `_reversa_sdd/code-analysis.md#módulo-course` | `getMatrizCurricular` retorna `disciplinas_base` de um curso ordenadas por módulo/nome — fonte natural dos componentes curriculares da Ata | 🟢 |
| `_reversa_sdd/academic/requirements.md#rf-07` | `getAlunosDaTurma` retorna matrículas + perfis dos alunos da turma (nome dos alunos) | 🟢 |
| `_reversa_sdd/code-analysis.md#módulo-student` | `calcularMediaParcial`, `calcularNotaFinal`, `calcularStatusAluno` (`grades-utils.ts`) derivam status Aprovado/Reprovado | 🟡 |
| `_reversa_sdd/domain.md#rb13` | Cursos técnicos avaliam numericamente (0 a 10); cursos de formação avaliam por conceito (A, B, C) | 🟢 |
| `_reversa_sdd/database/business-rules.md#4` | `boletim` tem UNIQUE(aluno_id, disciplina); `nota_estagio` aceita apenas `AP`/`REP` | 🟢 |
| `_reversa_sdd/domain.md#aluno` | Status de aluno existentes em `matriculas`: ativo, trancado, evadido, concluido | 🟢 |
| `src/types/domain.ts:107` | `status_aluno` existente: `ativo`, `trancado`, `evadido`, `concluido` — nomenclatura a reutilizar na situação final da Ata | 🟢 |
| `src/lib/grades-utils.ts:72-75` + `src/views/aluno-notas.ts:88-101` | Status acadêmico por disciplina: `Aprovado` (final ≥ 6), `Reprovado` e `Cursando` (`boletim.status = 'pendente'`) | 🟢 |
| `_reversa_sdd/addenda/006-lancamento-notas-estagio.md` | Notas de estágio supervisionado são registradas em lote pela secretaria e coordenação no campo `nota_estagio` do boletim | 🟢 |
| `src/lib/pdf-service.ts:86-146` | `_renderHeader()` e `_renderLogo()` compartilham cabeçalho institucional com logo proporcional, usados por todos os PDFs — base a reutilizar na Ata | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| **Secretaria** | Gerar e arquivar a Ata de Resultados Finais de uma turma ao fim do ano letivo | Ao final do período, a secretaria seleciona a turma, confere os resultados já lançados e emite o PDF da Ata para impressão e registro cartorial (CEE/PE). |
| **Coordenação** | Conferir os resultados e a situação final antes da oficialização | Revisa o PDF gerado, valida a coerência das situações e assina como autoridade pedagógica. |
| **Direção** | Assinar o documento oficial da instituição | Assina o campo destinado ao Diretor após a conferência da secretaria. |
| **Aluno** | (indireto) Comprovar sua situação acadêmica | Não dispara a geração; recebe a situação final quando solicitada à secretaria. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01 (Componentes da matriz curricular):** Os componentes curriculares da Ata devem ser obtidos da matriz curricular do curso da turma (`disciplinas_base` via `getMatrizCurricular`), nunca hardcoded. 🟡
   - Tipo: nova
   - Justificativa: Garante fidelidade à grade oficial e adapta-se automaticamente a alterações de matriz.
2. **RN-02 (Somente leitura dos resultados):** A Ata consome os resultados já calculados e persistidos (nota/conceito, faltas, % de frequência, situação final). A feature NÃO recalcula média, nota final ou aprovação. 🟡
   - Tipo: nova
   - Justificativa: Evita divergência entre a Ata e o boletim oficial.
3. **RN-03 (Situação final com nomenclatura existente):** A situação final exibida na Ata reutiliza a nomenclatura já existente no sistema, sem inventar vocabulário novo. Fonte: `matriculas.status_aluno` (`ativo`, `trancado`, `evadido`, `concluido` — `src/types/domain.ts:107`) combinado ao status acadêmico por disciplina (`Aprovado`, `Reprovado`, `Cursando` — `src/lib/grades-utils.ts:72-75`, `src/views/aluno-notas.ts:88-101`). 🟢
   - Tipo: nova
   - Origem no legado: `src/types/domain.ts:107`, `src/lib/grades-utils.ts:72-75`, `_reversa_sdd/domain.md#aluno`
4. **RN-04 (Casos especiais com estados existentes):** Alunos com `status_aluno` diferente de `ativo` têm a situação refletida na Ata conforme o valor já existente (`trancado`, `evadido`, `concluido`, `ativo`); `evadido` exibe "—" na coluna de situação final quando não há nota calculada. Não há vocabulário novo de transferência ou dependência. 🟢
   - Tipo: nova
   - Origem no legado: `src/types/domain.ts:377-379` (labels existentes: Trancado, Evadido, Concluído)
5. **RN-05 (Documento cartorial):** A Ata abre com o texto "Aos [dia] dias do mês de [mês] de [ano]" com data por extenso, seguindo o padrão de escrituração escolar. 🟡
   - Tipo: nova
6. **RN-06 (Perfis autorizados à emissão):** A geração da Ata é restrita a `admin`, `secretaria` e `coordenacao`. 🟡
   - Tipo: nova
   - Origem no legado: `_reversa_sdd/addenda/006-lancamento-notas-estagio.md` (coordenação já autorizada no fluxo de notas)

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Gerar Ata em formato A4 paisagem | Must | O PDF é emitido em `orientation: landscape`, formato A4. | 🟡 |
| RF-02 | Cabeçalho institucional com logo | Must | O PDF reutiliza o cabeçalho padrão (logo, nome, CNPJ, endereço, telefone) via `_renderHeader`/`_renderLogo` de `pdf-service.ts`. | 🟢 |
| RF-03 | Texto cartorial de abertura | Must | O documento exibe abertura com data por extenso e indicação do curso, turma, turno e ano letivo. | 🟡 |
| RF-04 | Tabela de resultados finais | Must | A tabela contém colunas: nº de ordem, nome completo do aluno, componentes curriculares (com carga horária teoria/prática e estágio), nota/conceito, faltas, % de frequência e situação final. | 🟡 |
| RF-05 | Componentes vindos da matriz do curso | Must | Cada componente exibido na tabela existe na matriz curricular do curso da turma (sem hardcode). | 🟢 |
| RF-06 | Paginação com cabeçalho repetido e numeração | Must | Ao estourar uma página, a tabela quebra e o cabeçalho/linha de título se repete; cada página exibe número da página. | 🟡 |
| RF-07 | Formatação dos casos especiais | Should | Alunos com `status_aluno` diferenciado (evadido, trancado, concluido) são formatados na situação final; evadido sem nota exibe "—". | 🟡 |
| RF-08 | Rodapé com local, data e assinaturas | Must | Ao final, o documento exibe local e data, seguidos das linhas de assinatura do Diretor(a) e do Secretário(a). | 🟡 |
| RF-09 | Legenda de siglas | Must | O rodapé ou final do documento explica as siglas usadas (ex.: T, P, E, S e situações). | 🟡 |
| RF-10 | Nome do arquivo padrão | Must | O download gera `ata_resultados_{turma}_{ano}.pdf`. | 🟡 |
| RF-11 | Campo "Polo/Local" facultativo | Should | Se informada, a Ata exibe uma linha de polo/local no bloco de identificação da turma. | 🟡 |
| RF-12 | Emissão na aba Gestão de Turmas, restrita a perfis autorizados | Must | O botão de emissão da Ata fica na view `src/views/gestao-turmas.ts` (aba Gestão de Turmas) e é visível somente para `admin`, `secretaria` e `coordenacao`. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | Geração local em menos de 3s para turmas de até 60 alunos | jsPDF é client-side, sem round-trip ao servidor; paginação via autotable nativo | 🟡 |
| Compatibilidade | Manter stack jsPDF + autotable; não adicionar Python/ReportLab | `src/lib/pdf-service.ts:1-3` importa jsPDF e autotable — única stack de PDF existente | 🟢 |
| Usabilidade | Corpo da tabela com fonte de 7–8pt, legível e repetida em todas as páginas | Formato paisagem exige tipografia reduzida para acomodar todos os componentes | 🟡 |
| Segurança | Documento é apenas leitura dos dados (não grava no banco) e reutiliza RLS existente para acessar matrículas/boletim | `_reversa_sdd/database/business-rules.md#3` | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Ata completa em A4 paisagem
  Dado uma turma do curso técnico com alunos matriculados e resultados finais lançados
  Quando a secretaria dispara a geração da Ata de Resultados Finais
  Então um PDF A4 paisagem é baixado com o nome ata_resultados_{turma}_{ano}.pdf
  E o cabeçalho exibe logo, nome, CNPJ, endereço e contato da instituição

Cenário: Componentes a partir da matriz curricular
  Dado uma turma cujo curso possui matriz curricular configurada
  Quando a Ata é gerada
  Então cada componente da tabela corresponde a uma disciplina_base da matriz do curso
  E nenhum componente é hardcoded

Cenário: Quebra de página com cabeçalho repetido
  Dado uma turma cujos componentes e alunos ultrapassam uma página A4
  Quando a Ata é gerada
  Então a tabela é dividida entre páginas
  E o cabeçalho da tabela se repete em cada página junto com a numeração

Cenário: Situação especial com status_aluno diferente de ativo
  Dado um aluno com status_aluno 'evadido' e outro 'trancado' escolhidos na turma
  Quando a Ata é gerada
  Então a situação final reflete o status_aluno existente (ex.: Evadido)
  E o evadido exibe "—" na coluna de situação final quando não há nota calculada

Cenário: Rodapé oficial
  Dado a geração da Ata
  Quando o documento termina
  Então exibe local e data por extenso e linhas de assinatura para Diretor(a) e Secretário(a)

Cenário: Turma sem dados gera falha amigável
  Dado uma turma sem alunos ou sem componentes curriculares
  Quando a geração é disparada
  Então o sistema não emite um PDF vazio e exibe mensagem de erro orientando a conclusão dos lançamentos
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | Formato exigido pelo documento oficial |
| RF-02 | Must | Identidade institucional obrigatória em escrituração |
| RF-03 | Must | Estrutura cartorial é requisito normativo |
| RF-04 | Must | Conteúdo central do artefato |
| RF-05 | Must | Integridade com a matriz oficial |
| RF-06 | Must | Viabiliza turmas/extensões maiores que uma página |
| RF-07 | Should | Situações especiais existem no domínio mas em menor volume |
| RF-08 | Must | Validade legal do documento |
| RF-09 | Must | Compreensibilidade das siglas |
| RF-10 | Must | Padronização de arquivamento |
| RF-11 | Should | Polos são opcionais na operação atual |
| RF-12 | Must | Autenticidade/validade do documento exige origem e perfil corretos |
| RNF de desempenho | Should | Volume por turma é pequeno; não é bloqueante |
| RNF de compatibilidade | Must | Evita dependência não existente no projeto |

## 9. Esclarecimentos

Respostas diretas do usuário em `2026-09-07`, integradas ao corpo do documento:

| # | Dúvida | Resposta | Impacto no documento |
|---|--------|----------|----------------------|
| 1 | Stack de geração (Python/ReportLab vs stack existente) | "Use a melhor solução ou o que já está funcionando no projeto" | Geração client-side via **jsPDF + autotable** (padrão já usado em `pdf-service.ts`). Nenhuma dependência Python/ReportLab. (RNF de compatibilidade) |
| 2 | Fonte e vocabulário de `situacao_final` | "Use a nomenclatura já existente" | Situação final usa `matriculas.status_aluno` (`ativo`, `trancado`, `evadido`, `concluido`) e status por disciplina (`Aprovado`/`Reprovado`/`Cursando`). Sem vocabulário novo. (RN-03, RN-04, RF-07) |
| 3 | Origem e disparo dos dados de entrada | "Geração pela secretaria na aba de gestão de turmas" | Botão de emissão na view `src/views/gestao-turmas.ts`, visível a `admin`/`secretaria`/`coordenacao`. Payload montado sobre os lançamentos existentes (notas/boletim/status). (RF-12) |

## 10. Lacunas

> Nenhuma lacuna ou `[DÚVIDA]` pendente. As três dúvidas iniciais foram respondidas pelo usuário em `2026-09-07` (ver seção 9).

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-07 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-09-07 | Dúvidas 1–3 respondidas pelo usuário e integradas: jsPDF (stack existente), nomenclatura existente de situação final, emissão na aba Gestão de Turmas | reversa |