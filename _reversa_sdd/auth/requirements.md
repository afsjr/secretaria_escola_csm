# Autenticação e Sessão (Auth)

> Módulo de autenticação do sistema CSM

## Visão Geral
Gerencia ciclo de vida de sessões de usuários: login, logout, recuperação de senha e verificação de perfil. Integra com Supabase Auth para autenticação JWT.

## Responsabilidades
- Autenticar usuários com email/senha
- Manter sessão ativa com timeout de 30 minutos
- Gerenciar recuperação de senha via email
- Buscar e atualizar perfil do usuário logado

## Regras de Negócio
- Sessão expira após 30 minutos de inatividade 🟢
- Fluxo de recovery ignora verificação de timeout 🟢
- Reset de senha define senha padrão configurável + força mudança 🟢
- Registro de usuário cria perfil automaticamente com perfil 'aluno' 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Login com email e senha | Must | Usuário autenticado e sessão iniciada |
| RF-02 | Logout com limpeza de sessão | Must | Usuário desautenticado e redirecionado |
| RF-03 | Verificar sessão ativa com timeout | Must | Retorna sessão válida ou erro de expirado |
| RF-04 | Recuperar senha via email | Must | Email de reset enviado com link válido |
| RF-05 | Atualizar senha após recovery | Must | Senha atualizada e sessão mantida |
| RF-06 | Buscar perfil do usuário | Must | Retorna dados completos do perfil |
| RF-07 | Atualizar perfil do usuário | Should | Dados atualizados no banco |
| RF-08 | Listar todos os perfis | Should | Retorna lista ordenada por nome |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Timeout de sessão: 30min | `session.ts:6` | 🟢 |
| Performance | Verificação periódica a cada 60s | `session.ts:81` | 🟢 |
| Segurança | Redirect URL dinâmico para recovery | `session.ts:29-30` | 🟢 |
| Segurança | Tratamento especial para recovery flow | `session.ts:52-53` | 🟡 |

## Critérios de Aceitação

```gherkin
Dado usuário autenticado com credenciais válidas
Quando executar login(email, password)
Então sessão é criada e timer de timeout iniciado

Dado usuário inativo por 30 minutos
Quando getSession() for chamado
Então retorna erro de sessão expirada e redireciona para login

Dado usuário com link de recovery na URL
Quando acessar página de reset password
Então o timeout é ignorado e fluxo prossegue normalmente
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Login/Logout | Must | Caminho crítico para todo o sistema |
| Session Timeout | Must | Segurança sem alternativa |
| Reset Password | Must | Funcionalidade essencial de recuperação |
| GetUserProfile | Must | Base para dados do usuário em toda app |
| UpdateUserProfile | Should | Importante mas não bloqueante |
| GetAllProfiles | Could | Uso administrativo редко |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/auth/session.ts` | `login`, `logout`, `getSession` | 🟢 |
| `src/auth/session.ts` | `resetPassword`, `updatePassword` | 🟢 |
| `src/auth/session.ts` | `getUserProfile`, `updateUserProfile` | 🟢 |
| `src/auth/session.ts` | `startSessionTimeout`, `stopSessionTimeout` | 🟢 |
| `src/auth/signup-handler.ts` | `registerUser` | 🟢 |
| `src/types/domain.ts` | `UserProfile`, `PerfilCompleto` | 🟢 |