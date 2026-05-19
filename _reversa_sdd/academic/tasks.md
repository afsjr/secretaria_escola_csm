# Gestão Acadêmica (Academic), Tarefas de Implementação

## Pré-requisitos
- [x] Tabelas: turmas, matriculas, turma_disciplinas, disciplinas_base, boleto
- [x] RLS configurada para as tabelas acadêmicas

## Tarefas

- [ ] T-01, Implementar getTurmas com ordenação
  - Origem no legado: `src/lib/academic-service.ts:18-28`
  - Critério de pronto: Lista ordenada por periodo desc, nome asc
  - Confiança: 🟢

- [ ] T-02, Implementar createTurma
  - Origem no legado: `src/lib/academic-service.ts:30-38`
  - Critério de pronto: Turma criada e retornada
  - Confiança: 🟢

- [ ] T-03, Implementar updateTurma
  - Origem no legado: `src/lib/academic-service.ts:40-48`
  - Critério de pronto: Dados atualizados
  - Confiança: 🟢

- [ ] T-04, Implementar deleteTurma com verificação
  - Origem no legado: `src/lib/academic-service.ts:50-62`
  - Critério de pronto: Retorna erro se houver dependências
  - Confiança: 🟢

- [ ] T-05, Implementar matricularAluno com verificação
  - Origem no legado: `src/lib/academic-service.ts:75-95`
  - Critério de pronto: Erro se aluno já ativo em outra turma
  - Confiança: 🟢

- [ ] T-06, Implementar getAlunosDaTurma
  - Origem no legado: `src/lib/academic-service.ts:97-107`
  - Critério de pronto: Lista com dados do perfil
  - Confiança: 🟢

- [ ] T-07, Implementar getDisciplinasDaTurma com deduplicação
  - Origem no legado: `src/lib/academic-service.ts:124-165`
  - Critério de pronto: Lista deduplicada por nome+módulo
  - Confiança: 🟢

- [ ] T-08, Implementar getNotasCompletasTurma
  - Origem no legado: `src/lib/academic-service.ts:168-192`
  - Critério de pronto: Alunos + mapa de notas
  - Confiança: 🟢

- [ ] T-09, Implementar getBoletim
  - Origem no legado: `src/lib/academic-service.ts:194-204`
  - Critério de pronto: Notas com dados da disciplina
  - Confiança: 🟢

- [ ] T-10, Implementar upsertNotaEstagio
  - Origem no legado: `src/lib/academic-service.ts:207-238`
  - Critério de pronto: Nota inserida ou atualizada com versão
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Teste de criação de turma
- [ ] TT-02, Teste de matrícula (sucesso e falha)
- [ ] TT-03, Teste de deduplicação de disciplinas
- [ ] TT-04, Teste de lançamento de notas de estágio

## Lacunas Pendentes (🔴)

- 🟡 getAlunoCompleto não usa Promise.all (pode otimizar)