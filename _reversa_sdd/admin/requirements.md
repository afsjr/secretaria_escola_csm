# Administração de Usuários (Admin)

> Módulo de operações administrativas do sistema CSM

## Visão Geral
Gerencia operações privilegiadas de administração: criação de usuários, reset de senha, gerenciamento de turmas e matrículas. Exige permissões elevadas (admin/master_admin).

## Responsabilidades
- Criar usuários via admin (bypass de verificação normal)
- Resetar senha de qualquer usuário
- Listar e buscar alunos
- Matricular alunos em turmas
- Atualizar dados de alunos com proteção contra escalada

## Regras de Negócio
- Um aluno só pode ter uma matrícula ativa por vez 🟢
- Admin não pode escalar privilégios (remove perfil/email/id/bloqueio) 🟢
- Reset de senha define senha padrão 'csm1983#' + força mudança 🟢
- Todas operações admin são auditadas 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Criar usuário via admin | Must | Usuário criado no Auth + perfil |
| RF-02 | Resetar senha de usuário | Must | Senha resetada, force_change=true |
| RF-03 | Listar turmas | Must | Lista de turmas ordenada |
| RF-04 | Matricular aluno em turma | Must | Matrícula criada se não houver outra ativa |
| RF-05 | Listar alunos | Must | Lista de alunos ordenada por nome |
| RF-06 | Buscar aluno por ID | Must | Retorna dados do aluno |
| RF-07 | Atualizar dados do aluno | Must | Dados atualizados com proteção |
| RF-08 | Buscar usuário por ID | Should | Retorna dados do usuário |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Fallback chain: admin → Edge Function → dev mode | `admin-service.ts:36-106` | 🟢 |
| Segurança | Remove campos sensíveis antes de update | `admin-service.ts:304-308` | 🟢 |
| Segurança | Auditoria de todas as operações admin | `admin-service.ts:159-165` | 🟢 |
| Performance | Verificação de matrícula ativa antes de matricular | `admin-service.ts:218-230` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado admin autenticado
Quando criar usuário com email, senha, nome, perfil
Então usuário criado no Auth e perfil criado na tabela 'perfis'

Dado aluno já ativo em outra turma
Quando tentar matricular em nova turma
Então retorna erro "Aluno já está matriculado em outra turma"

Dado admin tentando atualizar perfil de usuário
Quando incluir campos 'perfil', 'email', 'id', 'bloqueio_financeiro'
Então campos são removidos antes do update
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| createUserByAdmin | Must | Caminho crítico para onboarding |
| matricularAluno | Must | Funcionalidade principal da secretaria |
| resetUserPassword | Must | Recuperação de acesso essencial |
| listAlunos/getAlunoById | Should | Query comum em dashboard |
| updateAluno | Should | Atualização dados alunos |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/lib/admin-service.ts` | `createUserByAdmin` | 🟢 |
| `src/lib/admin-service.ts` | `resetUserPassword` | 🟢 |
| `src/lib/admin-service.ts` | `matricularAluno` | 🟢 |
| `src/lib/admin-service.ts` | `listAlunos`, `getAlunoById` | 🟢 |
| `src/lib/admin-service.ts` | `updateAluno` | 🟢 |
| `src/lib/audit-service.ts` | `AuditService.log` | 🟢 |