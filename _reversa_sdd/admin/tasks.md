# Administração de Usuários (Admin), Tarefas de Implementação

## Pré-requisitos
- [x] Edge Functions: admin-create-user, admin-reset-password deployadas
- [x] Tabela 'perfis' com RLS configurada
- [x] Supabase Admin key configurada (ou Edge Functions)

## Tarefas

- [ ] T-01, Implementar createUserByAdmin com fallback chain
  - Origem no legado: `src/lib/admin-service.ts:115-198`
  - Critério de pronto: Usuário criado no Auth + perfil
  - Confiança: 🟢

- [ ] T-02, Implementar matricularAluno com verificação
  - Origem no legado: `src/lib/admin-service.ts:216-256`
  - Critério de pronto: Matrícula criada ou erro se ativo em outra turma
  - Confiança: 🟢

- [ ] T-03, Implementar resetUserPassword
  - Origem no legado: `src/lib/admin-service.ts:325-420`
  - Critério de pronto: Senha resetada com force_password_change
  - Confiança: 🟢

- [ ] T-04, Implementar listAlunos e getAlunoById
  - Origem no legado: `src/lib/admin-service.ts:261-283`
  - Critério de pronto: Lista de alunos ordenada por nome
  - Confiança: 🟢

- [ ] T-05, Implementar updateAluno com proteção
  - Origem no legado: `src/lib/admin-service.ts:302-319`
  - Critério de pronto: Campos sensíveis removidos antes do update
  - Confiança: 🟢

- [ ] T-06, Implementar getTurmas
  - Origem no legado: `src/lib/admin-service.ts:203-211`
  - Critério de pronto: Lista de turmas ordenada
  - Confiança: 🟢

- [ ] T-07, Configurar Edge Functions (deploy)
  - Origem no legado: `supabase/functions/admin-create-user/`, `supabase/functions/admin-reset-password/`
  - Critério de pronto: Functions deployadas e funcionando
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Teste de criação de usuário admin
- [ ] TT-02, Teste de matrícula de aluno em turma vazia
- [ ] TT-03, Teste de matrícula falhando (aluno já ativo)
- [ ] TT-04, Teste de reset de senha
- [ ] TT-05, Teste de update com campos protegidos removidos

## Lacunas Pendentes (🔴)

- Sem lacunas significativas. semua functionality sudah jelas dari kode.