# Gestão de Professores (Professor), Design Técnico

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `getDisciplinasDoProfessor` | `(professorId: string)` | `{ data, error }` | Ofertas com nested |
| `getAllOfertas` | `()` | `{ data, error }` | Todas as ofertas |
| `vincularProfessorAOferta` | `(ofertaId, professorId)` | `{ data, error }` | Update professor_id |
| `getNotasDaDisciplina` | `(disciplinaBaseId, turmaId)` | `{ data, error }` | Notas por aluno |
| `salvarNota` | `(alunoId, disciplinaBaseId, NotaData, versao)` | `{ data, error }` | Com locking |
| `salvarNotasEmLote` | `(disciplinaBaseId, notas[])` | `{ data, error }` | Promise.all |
| `registrarAula` | `(AulaData)` | `{ data, error }` | Com auditoria |
| `getAulasDaOferta` | `(ofertaId)` | `{ data, error }` | Aulas da oferta |
| `getAulasDoProfessor` | `(professorId)` | `{ data, error }` | Todas as aulas |
| `getProfessores` | `()` | `{ data, error }` | Lista professores |
| `getAlunosDaTurma` | `(turmaId)` | `{ data, error }` | Alunos ativos |
| `contarAlunosTurma` | `(turmaId)` | `{ count, error }` | Contagem |

## Fluxo Principal

### getDisciplinasDoProfessor
1. Query em turma_disciplinas com filtros:
   - professor_id = parâmetro
   - Joins: disciplinas_base, turmas, cursos

### salvarNota (Optimistic Lock)
1. Busca nome da disciplina_base para atualização
2. Verifica se nota já existe
3. Se existir → updateWithLock com versão
4. Se não → insert com versao=1

### salvarNotasEmLote
1. Busca nome da disciplina uma vez
2. Mapeia notas para promessas
3. Promise.all de salvarNota
4. Retorna primeiro erro se houver

### registrarAula
1. Insere na tabela aulas
2. Se sucesso → AuditService.log com acao='registrar_aula'

## Fluxos Alternativos

- **getNotasDaDisciplina:** Para cada matrícula, faz query separada no boletín (N+1)
- **contarAlunosTurma:** Usa count='exact' para performance

## Dependências
- `AuditService` — logging de auditoria
- `ConcurrencyControl` — updateWithLock
- `supabase` — cliente

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Optimistic locking em notas | `professor-service.ts:147` + `concurrency-control.ts` | 🟢 |
| Batch via Promise.all | `professor-service.ts:160-181` | 🟢 |
| Auditoria em registro de aula | `professor-service.ts:200-206` | 🟢 |
| Query N+1 em getNotasDaDisciplina | `professor-service.ts:94-114` | 🟡 |

## Estado Interno

- Tipo `AulaData`: { turma_disciplina_id, professor_id, data?, conteudo }
- Tipo `AlunoComNotas`: { matricula_id, aluno_id, aluno_nome, status, nota, versao } (sem email — LGPD)
- Tipo `NotaData`: { faltas, n1, n2, n3, rec } (string ou number)

## Observabilidade

- Log de auditoria para: registrar_aula
- Sem outros logs explícitos

## Riscos e Lacunas
- 🟡 N+1 query em getNotasDaDisciplina (para cada aluno, uma query no boletín)