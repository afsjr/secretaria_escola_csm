# Dados do Aluno (Student Details), Tarefas de Implementação

## Pré-requisitos
- [x] Tabelas: perfis_enderecos, responsaveis, observacoes_aluno, matriculas
- [x] RPC: aluno_eh_menor (ou criar)

## Tarefas

- [ ] T-01, Implementar getEndereco e saveEndereco (upsert)
  - Origem no legado: `src/lib/student-details-service.ts:50-79`
  - Critério de pronto: Endereço criado ou atualizado
  - Confiança: 🟢

- [ ] T-02, Implementar deleteEndereco
  - Origem no legado: `src/lib/student-details-service.ts:81-88`
  - Critério de pronto: Endereço removido
  - Confiança: 🟢

- [ ] T-03, Implementar CRUD de responsáveis
  - Origem no legado: `src/lib/student-details-service.ts:90-132`
  - Critério de pronto: CRUD completo funcional
  - Confiança: 🟢

- [ ] T-04, Implementar CRUD de observações
  - Origem no legado: `src/lib/student-details-service.ts:134-185`
  - Critério de pronto: Observações com dados do criador
  - Confiança: 🟢

- [ ] T-05, Implementar getAlunoCompleto
  - Origem no legado: `src/lib/student-details-service.ts:189-222`
  - Critério de pronto: Dados agregados retornados
  - Confiança: 🟡 (sequencial)

- [ ] T-06, Implementar updateDadosPessoais com locking
  - Origem no legado: `src/lib/student-details-service.ts:224-227`
  - Critério de pronto: Dados atualizados com versionamento
  - Confiança: 🟢

- [ ] T-07, Verificar/criar RPC aluno_eh_menor
  - Origem no legado: `src/lib/student-details-service.ts:229-234`
  - Critério de pronto: Função retorna boolean
  - Confiança: 🔴

## Lacunas Pendentes (🔴)

- 🔴 RPC `aluno_eh_menor` precisa ser verificada/criada no banco