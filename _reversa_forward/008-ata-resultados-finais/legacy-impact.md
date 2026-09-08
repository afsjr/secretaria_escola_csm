# Legacy Impact — Ata de Resultados Finais (PDF)

> Feature: `008-ata-resultados-finais` · Data: `2026-09-07`
> Política de edição do legado no momento da execução: `allowLegacyEdits: true` · `allowedPaths: ["src/**"]` (respeitada)

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|-----------|------|------------|---------------|
| `src/types/domain.ts` | Academic (contratos de domínio) | componente-novo | LOW | Novos contratos de payload `AtaResultadosData`/`AtaAlunoResultado`/`AtaComponenteResultado` reutilizando literais de `status_aluno` e rótulos existentes; nenhum tipo alterado |
| `src/lib/academic-service.ts` | Academic | regra-nova | LOW | Novo método **somente leitura** `getDadosAtaTurma`; derivações (`situacaoFinal`, `percentualFrequencia`, ano letivo) reutilizam `grades-utils`/`status_aluno` — nenhuma regra existente alterada |
| `src/lib/academic-service.test.ts` | Academic (testes) | componente-novo | LOW | Novos casos de teste do contrato de montagem |
| `src/lib/pdf-service.ts` | Documents | regra-nova | LOW | Novo gerador `generateAtaResultadosPDF` A4 paisagem + helpers de data por extenso; reutiliza `_renderHeader`/`_renderLogo`/`getHeader` sem alterá-los |
| `src/lib/pdf-service.test.ts` | Documents (testes) | componente-novo | LOW | Novos casos de teste do renderer |
| `src/views/gestao-turmas.ts` | Academic (view Gestão de Turmas) | regra-nova | LOW | Botão "Emitir Ata de Resultados Finais" + campo opcional "Polo/Local" na aba Alunos sob o gate `canManageTurmas`; guarda de erro amigável |
| `src/lib/security.ts` | Shared (segurança) | delta-de-contrato-externo | LOW | Apenas **reuso** de `sanitizeFilename` para nome do arquivo; arquivo não modificado |

## Diff conceitual por componente

**Academic — `getDadosAtaTurma` (novo, read-only).** Adiciona um caminho de leitura que monta o payload da Ata e deriva situação final/frequência na leitura. As derivações não alteram regra alguma existente: reaproveitam exatamente `calcularNotaFinal`/`calcularStatusAluno`/`disciplinaTemEstagio` (grades-utils) e o literal `status_aluno` de `matriculas`. Nenhuma escrita em Supabase; nenhum novo enum; nenhuma DDL.

**Documents — `generateAtaResultadosPDF` (novo).** Segue o padrão dos geradores existentes (retorna `jsPDF`; download pelo chamador via `downloadPDF`). Reusa o cabeçalho institucional (`getHeader`) e desenha a tabela com `jspdf-autotable`. Nova capacidade de documento cartorial com data por extenso, sem tocar boletim/declaração/requerimento existentes.

**gestao-turmas.ts.** Apenas adição de um botão e campo opcional na aba Alunos, condicionados a `canManageTurmas`. Nenhum fluxo pré-existente foi alterado.

## Preservadas

Regras 🟢 do `_reversa_sdd/domain.md` continuam intactas (verificadas durante a execução):

- **RB09** — Disciplinas com estágio têm lógica separada: a Ata lê `nota_estagio` AP/REP e usa `disciplinaTemEstagio`; não cria lógica paralela.
- **RB12** — Matriz curricular por nome+módulo/ordem: componentes da Ata vêm de `disciplinas_base` (`getMatrizCurricular`), deduplicação/ordenação originais intactas.
- **RB13** — Tipos de Curso determinam avaliação: situação final do aluno reutiliza `status_aluno` + `calcularStatusAluno` vigentes; sem nova máquina de aprovação.
- **RB02** — Notas entre 0 e 10: nenhuma transformação nova nos valores lidos.
- **RB04** — Não excluir turma com matrículas ativas: fluxo de exclusão intocado.
- **RB01/RB14** — matrícula única ativa e emissão de certificados: sem interação.

## Modificadas

Nenhuma regra existente foi alterada ou removida. As novidades são **acréscimos de leitura** (tipo `regra-nova`):

- Derivação de `situacaoFinal` por agregação de componente (todos Aprovado → Aprovado; algum Reprovado → Reprovado; senão Cursando) com prevalência do `status_aluno` não-ativo — nova, mas não sobrescreve nenhuma regra; resultado é só de exibição documental.
- Derivação de `percentualFrequencia` clampado `100 - faltas*100/carga_horaria ∈ [0,100]` — nova rota de leitura; a base de faltas (ausência de tabela de frequência) é gap legado já conhecido (`domain.md` Gaps 🔴), apenas materializado no documento.
- Extração do ano letivo por token `YYYY` do `periodo` com fallback ano corrente — nova, sem alterar o campo `periodo`.