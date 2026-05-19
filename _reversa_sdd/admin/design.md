# Administração de Usuários (Admin), Design Técnico

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `createUserByAdmin` | `(params: CreateUserParams)` | `{ data, error }` | Cria usuário via admin |
| `resetUserPassword` | `(userId: string, userName: string)` | `{ data, error }` | Reset senha via Edge Function |
| `getTurmas` | `()` | `{ data, error }` | Lista turmas ordenadas |
| `matricularAluno` | `(alunoId: string, turmaId: string)` | `{ data, error }` | Matricula com verificação |
| `listAlunos` | `()` | `{ data, error }` | Lista alunos (perfil=aluno) |
| `getAlunoById` | `(alunoId: string)` | `{ data, error }` | Busca aluno por ID |
| `getUserById` | `(userId: string)` | `{ data, error }` | Busca usuário por ID |
| `updateAluno` | `(alunoId: string, updates: Record)` | `{ data, error }` | Update com proteção |

## Fluxo Principal

### createUserByAdmin (Fallback Chain)
1. Se `supabaseAdmin` disponível → usa direto
2. Senão, se `EDGE_FUNCTIONS_BASE_URL` → chama Edge Function
3. Senão → retorna erro (modo desenvolvimento)

### matricularAluno
1. Verifica se aluno tem matrícula ativa em outra turma
2. Se tiver → retorna erro
3. Se não → insere nova matrícula
4. Faz log de auditoria

### updateAluno (Proteção)
1. Copia updates recebidos
2. Remove campos: perfil, email, id, bloqueio_financeiro
3. Executa update com filtro: id=X AND perfil='aluno'

## Fluxos Alternativos

- **Reset Password:** Primeira tenta Edge Function, depois fallback supabaseAdmin
- **Create User com rollback:** Se perfil falhar, tenta deletar usuário Auth

## Dependências
- `supabaseAdmin` — cliente admin (serviço)
- `supabase` — cliente normal (Edge Functions)
- `AuditService` — logging de auditoria

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Fallback chain de 3 níveis | `admin-service.ts:116-197` | 🟢 |
| Proteção contra escalada de privilégios | `admin-service.ts:304-308` | 🟢 |
| Verificação de matrícula ativa | `admin-service.ts:218-230` | 🟢 |
| Senha padrão 'csm1983#' | `admin-service.ts:400` | 🟢 |

## Estado Interno

- `EDGE_FUNCTIONS_BASE_URL` — URL base das Edge Functions
- Parâmetros de CreateUserParams: email, password, nomeCompleto, cpf, telefone, perfil

## Observabilidade

- Log de auditoria para: criar_usuario, matricular_aluno, reset_senha
- Console.warn em modo fallback de desenvolvimento

## Riscos e Lacunas
- 🟢 Sem lacunas significativas identificadas
- 🟡 Fallback em modo desenvolvimento não deve ser usado em produção