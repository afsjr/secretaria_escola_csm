# Matriz de Permissões — secretary_escola_csm

> Gerado pelo Detective em 2026-05-19

---

## Papéis (Roles)

| Role | Descrição | Hierarquia |
|------|-----------|------------|
| `master_admin` | Proprietário do Sistema — Acesso Total + Configurações | 1 (maior) |
| `admin` | Administrador — Acesso Total exceto Configurações | 2 |
| `secretaria` | Pedagógico Total, Zero Financeiro | 3 |
| `coordenacao` | Coordenação Pedagógica — Acesso Total Pedagógico | 3 |
| `financeiro` | Financeiro Total, Pedagógico Consulta | 4 |
| `professor` | Notas/Faltas, Consulta Aluno | 5 |
| `aluno` | Consulta Própria | 6 (menor) |

---

## Matriz de Permissões

| Permissão | master_admin | admin | secretaria | coordenacao | financeiro | professor | aluno |
|-----------|:------------:|:-----:|:----------:|:-----------:|:----------:|:---------:|:-----:|
| **VIEW** |
| view_dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| view_colegas | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| view_documentos | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| view_matriz | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ |
| view_secretaria | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| view_turmas | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| view_academico | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| view_professor | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| view_perfil | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| view_financeiro | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **MANAGE** |
| manage_users | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| manage_turmas | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| manage_matriculas | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| manage_notas | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| manage_cursos | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| manage_documentos | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| manage_professores | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| manage_financeiro | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| manage_aulas | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **CONFIG** |
| manage_instituicao | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Legenda

- ✅ = Permitido
- ❌ = Negado

---

## Restrições Adicionais

### Via RLS (Row Level Security)

| Tabela | Restrição |
|--------|-----------|
| `perfis` | Usuários veem apenas seus próprios dados, exceto admin |
| `boletim` | Professores veem apenas suas disciplinas |
| `matriculas` | Apenas admins/secretaria/coordenacao podem modificar |
| `audit_log` | Apenas admin e master_admin podem acessar |

### Via Código

| Restrição | Evidência |
|-----------|-----------|
| Admin não pode escalar privilégios | `admin-service.ts:304-308` (remove perfil, email, id) |
| Sessão 30min | `session.ts:6` |
| Recovery ignora timeout | Verificação de hash recovery |

---

## Funções Helper (authz.ts)

```typescript
isMasterAdmin(role)      // master_admin
isAdmin(role)           // admin ou master_admin
isSecretaria(role)      // secretaria
isCoordenacao(role)     // coordenacao
isFinanceiro(role)      // financeiro
isProfessor(role)       // professor
isAluno(role)           // aluno
```

---

## Verificações de Permissão

```typescript
hasPermission(role, 'manage_users')  // Boolean
hasRole(role, ['admin', 'master_admin'])  // Boolean
canViewFinanceiro(role)  // Boolean
canViewSecretaria(role) // Boolean
canManageInstituicao(role) // Boolean
```