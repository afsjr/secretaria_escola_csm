# Autenticação e Sessão (Auth), Design Técnico

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `login` | `(email: string, password: string)` | `{ data, error }` | Autentica usuário |
| `logout` | `()` | `{ error }` | Limpa sessão e para timer |
| `getSession` | `()` | `{ session, error }` | Verifica sessão com timeout |
| `resetPassword` | `(email: string)` | `{ data, error }` | Envia email de recovery |
| `updatePassword` | `(newPassword: string)` | `{ data, error }` | Atualiza senha |
| `getUserProfile` | `(userId?: string)` | `Promise<{ data, error }>` | Busca perfil |
| `updateUserProfile` | `(userId: string, updates: Partial<UserProfile>)` | `{ data, error }` | Atualiza perfil |
| `getAllProfiles` | `()` | `{ data, error }` | Lista todos perfis |

## Fluxo Principal

### Login
1. Chama `supabase.auth.signInWithPassword({ email, password })`
2. Se sucesso e sessão criada, inicia `startSessionTimeout()`
3. Retorna dados da sessão

### Session Timeout
1. `startSessionTimeout()` configura `setInterval` de 60s
2. A cada ciclo, chama `getSession()` para verificar validade
3. Se sessão inválida, para timer e redireciona para `/#/`

### Reset Password
1. Constrói `redirectTo` dinamico: `origin + /#/reset-password`
2. Chama `supabase.auth.resetPasswordForEmail(email, { redirectTo })`
3. Retorna resultado

## Fluxos Alternativos

- **Recovery Flow:** Se URL contém `type=recovery` ou `type=email`, ignora verificação de timeout
- **Logout durante timeout:** Para o interval antes de fazer signOut

## Dependências
- `supabase` (cliente) — autenticação e queries
- `toast` — notificações de erro/sucesso

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Timeout de 30min via setInterval de 60s | `session.ts:6,75-81` | 🟢 |
| Redirect dinâmico para recovery | `session.ts:29-30` | 🟢 |
| Fallback de logout após recovery | `session.ts:54-63` | 🟡 |
| Rollback parcial em registro falha | `signup-handler.ts:54-60` | 🟡 |

## Estado Interno

- `sessionCheckInterval: ReturnType<typeof setInterval> | null` — referência do timer
- `SESSION_TIMEOUT_MS: 30 * 60 * 1000` — constante de timeout

## Observabilidade

- Log console em reset password: `'Reset password redirectTo: ...'`
- Toast em sessão expirada: `"Sessão expirada por inatividade. Faça login novamente."`

## Riscos e Lacunas
- 🟡 Rollback de registro não deleta usuário do Auth de forma confiável
- 🔴 Não há verificação de força de senha no client (apenas no servidor via Zod)