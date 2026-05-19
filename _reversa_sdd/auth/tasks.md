# Autenticação e Sessão (Auth), Tarefas de Implementação

## Pré-requisitos
- [x] Dependências: supabase-js, zod instaladas
- [x] Schema 'perfis' existe no banco
- [x] Supabase Auth configurado

## Tarefas

- [ ] T-01, Implementar função login com Supabase Auth
  - Origem no legado: `src/auth/session.ts:9-20`
  - Critério de pronto: Usuário autenticado retorna session válida
  - Confiança: 🟢

- [ ] T-02, Implementar logout com limpeza de timer
  - Origem no legado: `src/auth/session.ts:22-26`
  - Critério de pronto: Usuário desautenticado, redirecionado
  - Confiança: 🟢

- [ ] T-03, Implementar verificação de sessão com timeout
  - Origem no legado: `src/auth/session.ts:47-67`
  - Critério de pronto: Retorna sessão válida ou erro após 30min
  - Confiança: 🟢

- [ ] T-04, Implementar session timeout automático
  - Origem no legado: `src/auth/session.ts:72-82`
  - Critério de pronto: Verificação a cada 60s com logout automático
  - Confiança: 🟢

- [ ] T-05, Implementar reset password com redirect dinâmico
  - Origem no legado: `src/auth/session.ts:28-38`
  - Critério de pronto: Email enviado com URL de redirect válida
  - Confiança: 🟢

- [ ] T-06, Implementar getUserProfile
  - Origem no legado: `src/auth/session.ts:94-106`
  - Critério de pronto: Retorna dados do perfil ou erro
  - Confiança: 🟢

- [ ] T-07, Implementar updateUserProfile
  - Origem no legado: `src/auth/session.ts:108-117`
  - Critério de pronto: Dados atualizados no banco
  - Confiança: 🟢

- [ ] T-08, Implementar registerUser com rollback
  - Origem no legado: `src/auth/signup-handler.ts:17-71`
  - Critério de pronto: Usuário criado no Auth + perfil
  - Confiança: 🟡 (rollback incompleto)

## Tarefas de Teste

- [ ] TT-01, Teste de login com credenciais válidas
- [ ] TT-02, Teste de login com credenciais inválidas
- [ ] TT-03, Teste de expiração de sessão após 30min
- [ ] TT-04, Teste de reset password
- [ ] TT-05, Teste de registro de novo usuário

## Lacunas Pendentes (🔴)

- Não há endpoint de verificação de força de senha (apenas Zod no client)
- Rollback em registro falha precisa de Edge Function para delete confiável