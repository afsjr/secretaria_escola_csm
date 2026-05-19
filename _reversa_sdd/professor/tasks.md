# Gestão de Professores (Professor), Tarefas de Implementação

## Pré-requisitos
- [x] Tabelas: turma_disciplinas, disciplinas_base, turmas, aulas, boleto
- [x] AuditService implementado
- [x] ConcurrencyControl implementado

## Tarefas

- [ ] T-01, Implementar getDisciplinasDoProfessor
  - Origem no legado: `src/lib/professor-service.ts:35-47`
  - Critério de pronto: Retorna ofertas com disciplinas_base, turmas, cursos
  - Confiança: 🟢

- [ ] T-02, Implementar getNotasDaDisciplina
  - Origem no legado: `src/lib/professor-service.ts:79-117`
  - Critério de pronto: Lista de alunos com notas
  - Confiança: 🟡 (N+1 query)

- [ ] T-03, Implementar salvarNota com locking
  - Origem no legado: `src/lib/professor-service.ts:120-157`
  - Critério de pronto: Nota inserida ou atualizada com versionamento
  - Confiança: 🟢

- [ ] T-04, Implementar salvarNotasEmLote
  - Origem no legado: `src/lib/professor-service.ts:160-182`
  - Critério de pronto: Múltiplas notas salvas
  - Confiança: 🟢

- [ ] T-05, Implementar registrarAula com auditoria
  - Origem no legado: `src/lib/professor-service.ts:187-210`
  - Critério de pronto: Aula criada e log de auditoria gerado
  - Confiança: 🟢

- [ ] T-06, Implementar getAulasDaOferta e getAulasDoProfessor
  - Origem no legado: `src/lib/professor-service.ts:213-242`
  - Critério de pronto: Lista de aulas ordenadas por data
  - Confiança: 🟢

- [ ] T-07, Implementar vincularProfessorAOferta
  - Origem no legado: `src/lib/professor-service.ts:65-74`
  - Critério de pronto: Professor vinculado à oferta
  - Confiança: 🟢

- [ ] T-08, Implementar getProfessores
  - Origem no legado: `src/lib/professor-service.ts:246-253`
  - Critério de pronto: Lista de professores ordenada
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Teste de lançamento de nota individual
- [ ] TT-02, Teste de lançamento de notas em lote
- [ ] TT-03, Teste de conflito de versão em notas
- [ ] TT-04, Teste de registro de aula com auditoria

## Lacunas Pendentes (🔴)

- 🟡 Otimizar getNotasDaDisciplina para evitar N+1 queries