# Investigação Técnica: Ata de Resultados Finais (PDF)

> Identificador: `008-ata-resultados-finais`
> Data: `2026-09-07`

## 1. Mapeamento de Código Existente

### Stack de PDF (`src/lib/pdf-service.ts` + `src/lib/certificate-service.ts`)
- O projeto gera PDFs exclusivamente no **frontend** com `jsPDF ^4.2.1` e `jspdf-autotable ^5.0.7` (imports em `pdf-service.ts:1-3`). Não existe backend Python nem uso de ReportLab.
- Padrão de assinatura dos geradores: `generateBoletimPDF(alunoData, notasData, turmaInfo)`, `generateDeclaracaoPDF(alunoData, turmaInfo)`, `generateHistoricalPDF`, `generateDiarioClassePDF(data, turmaInfo)` — todos **recebem payload pronto** e renderizam.
- `_renderHeader()` (`pdf-service.ts:86-128`) e `_renderLogo()` (`pdf-service.ts:134-146`) cuidam do cabeçalho dinâmico (logo proporcional + nome/CNPJ/endereço/contato + título), via `getHeader()` → `InstituicaoService.getPDFHeader()` (com fallback `public/logo.png`).
- `jspdf-autotable` já está em uso nos PDFs existentes para tabelas.

### Dados disponíveis (Supabase + RLS)
- `academic-service.ts`: `getTurmas()`, `getTipoDaTurma(turma_id)`, `getAlunosDaTurma(turma_id)` (matrículas + `perfis` aninhado), `getBoletim(alunoId)`.
- `course-service.ts`: `getMatrizCurricular(cursoId)` → `disciplinas_base` ordered by `modulo, nome`.
- `src/views/gestao-turmas.ts` já carrega turmas, alunos, catálogo por `curso_id` e boletins por disciplina (usando o mesmo padrão de consulta que a Ata precisará). A view tem `canManageTurmas` = `secretaria | coordenacao | admin | master_admin` (portão de emissão desejado).
- `src/lib/grades-utils.ts`: `calcularMediaParcial`, `calcularNotaFinal`, `calcularStatusAluno` (`Aprovado`/`Reprovado` ≥ 6), `disciplinaTemEstagio` — cálculos canônicos reutilizados pelo aluno-notas e por gestao-turmas.
- `matriculas.status_aluno`: `ativo | trancado | evadido | concluido` (`src/types/domain.ts:107`; máquina de estado em `_reversa_sdd/state-machines.md`).
- `boletim`: `aluno_id`, `disciplina_base_id`, `disciplina`, `faltas`, `n1`, `n2`, `n3`, `rec`, `nota_estagio` (`CHECK IN ('AP','REP')`), `status` (`'pendente'` = cursando), `versao`, `UNIQUE(aluno_id, disciplina)`.

### Lacunas identificadas
1. **Nenhum gerador de Ata existe.** Nenhuma função entrega um documento agregado por turma com resultado final por componente.
2. **Situação final global não é persistida.** Só existem `status_aluno` (matrícula) e o status por disciplina (derivado por `grades-utils`). A situação final da Ata precisa ser derivada no payload com o vocabulário existente (ver Premissa P-01 no roadmap).
3. **Não há divisão de carga horária T/P × E/S.** `disciplinas_base.carga_horaria` é um único inteiro; a coluna E/S da Ata usa `boletim.nota_estagio` (AP/REP) quando há estágio.
4. **Frequência sem tabela de presença** (gap conhecido do legado): só `boletim.faltas` existe; % de frequência é derivado (ver Premissa P-03).

## 2. Alternativas Avaliadas

1. **Geração server-side em Python/ReportLab:**
   - *Descartado:* No projeto não existe backend Python nem dependência ReportLab; a Dúvida 1 foi resolvida pelo usuário como "usar o que já funciona" (jsPDF frontend).
2. **Geração em Edge Function (Deno) com `pdf-lib`:**
   - *Descartado:* Adiciona round-trip de rede, custo de execução serverless e foge do padrão consolidado de PDFs client-side (`pdf-service.ts`, `certificate-service.ts`).
3. **Tabela com colunas por componente lado a lado:**
   - *Descartado:* Matrizes de curso técnico (enfermagem) têm 20+ componentes; mesmo em A4 paisagem a largura seria inviável e ilegível.
   - *Escolhido:* Layout empilhado — linhas por aluno×componente com linha consolidada de "Situação final" por aluno (D-04).
4. **Diversão campo `carga_horaria` em `carga_horaria_tp`/`carga_horaria_es` (DDL):**
   - *Descartado:* Fora do escopo; sem requisito de registro de carga por natureza pelo sistema hoje. A Ata exibe a carga total + resultado de estágio (AP/REP) na coluna E/S.
5. **Persistir situação final (DDL + coluna nova):**
   - *Descartado:* RN-02 manda a Ata consumir resultados existentes, sem recalcular nem gravar; derivação com vocabulário existente atende criticamente.

## 3. Padrões Aplicáveis

- **`jspdf-autotable`** com cabeçalho repetido em todas as páginas (`showHead: 'everyPage'` / `headStyles`) e rodapé com numeração via **`didDrawPage`** — atende RF-06 (quebra de página + numeração).
- **Renderer puro recebendo payload** — mesmo contrato dos `generate*PDF` existentes; facilita testes unitários sem Supabase.
- **Derivação concentrada no serviço** (`getDadosAtaTurma`) — mantém a view fina e o PDFService focado em renderizar; os cálculos reutilizam `grades-utils` (fonte única).
- **Bloqueio por perfil na UI** via `canManageTurmas` — mantém RLS do Supabase intacta (dados são somente leitura sob `check_user_is_admin_or_secretaria`).

## 4. Conclusão

A arquitetura atual suporta a Ata com baixo risco: uma função de montagem no `AcademicService`, um renderer no `PDFService` (A4 paisagem, autotable paginado, cabeçalho/rodapé padrão) e um botão na aba Alunos de `gestao-turmas.ts`. Nenhuma migração DDL, nenhum contrato externo novo e nenhuma dependência adicional.