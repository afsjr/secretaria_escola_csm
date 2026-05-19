# C4 - Componentes — secretary_escola_csm

> Nível 3: Componentes Internos do SPA

---

## Services Layer (Componentes Principais)

```mermaid
graph TD
    subgraph "Services Layer"
        ADMIN_SVC[AdminService<br/>createUser, resetPassword]
        ACADEMIC_SVC[AcademicService<br/>Turmas, Matrículas, Notas]
        PROF_SVC[ProfessorService<br/>Notas, Aulas]
        COURSE_SVC[CourseService<br/>Cursos, Matriz, Ofertas]
        STUDENT_SVC[StudentDetailsService<br/>DadosCompletos]
        DOC_SVC[DocumentsService<br/>Solicitações]
        FIN_SVC[FinanceiroService<br/>Pagamentos, Acordos]
        AUDIT_SVC[AuditService<br/>Logs]
    end

    subgraph "Infraestrutura"
        CLIENT[Supabase Client]
        VALID[Validation<br/>Zod Schemas]
        AUTHZ[Authorization<br/>RBAC]
    end

    ADMIN_SVC --> CLIENT
    ACADEMIC_SVC --> CLIENT
    PROF_SVC --> CLIENT
    COURSE_SVC --> CLIENT
    STUDENT_SVC --> CLIENT
    DOC_SVC --> CLIENT
    FIN_SVC --> CLIENT
    AUDIT_SVC --> CLIENT

    ADMIN_SVC --> VALID
    ACADEMIC_SVC --> VALID
    PROF_SVC --> VALID
    STUDENT_SVC --> VALID

    ADMIN_SVC --> AUTHZ
    PROF_SVC --> AUTHZ
    STUDENT_SVC --> AUTHZ
```

---

## Módulos de Suporte

```mermaid
graph TD
    subgraph "Módulos de Suporte"
        SESSION[Auth/Session<br/>login, logout, getSession]
        CONCURRENCY[Concurrency Control<br/>updateWithLock]
        RATE_LIMITER[Rate Limiter<br/>limitRequests]
        SECURITY[Security<br/>sanitize, encode]
        TOAST[Toast Notifications<br/>success, error]
    end

    subgraph "Types"
        TYPES[Domain Types<br/>UserProfile, Turma, etc.]
    end

    SESSION --> TYPES
    CONCURRENCY --> TYPES
    RATE_LIMITER --> TYPES
    SECURITY --> TYPES
    TOAST --> TYPES
```

---

## Componentes por Módulo

| Serviço | Funções Principais | Dependências |
|---------|-------------------|--------------|
| **AdminService** | createUserByAdmin, matricularAluno, updateAluno, resetUserPassword | supabaseAdmin, AuditService |
| **AcademicService** | getTurmas, matricularAluno, getDisciplinasDaTurma, upsertNotaEstagio | supabase |
| **ProfessorService** | getDisciplinasDoProfessor, salvarNota, registrarAula | supabase, AuditService, Concurrency |
| **CourseService** | getCursos, getMatrizCurricular, criarOfertaDisciplina | supabase |
| **StudentDetailsService** | getAlunoCompleto, getEndereco, getResponsaveis, getObservacoes | supabase, Concurrency |
| **DocumentsService** | createRequest, getMyRequests, getAllOpenRequests | supabase |
| **FinanceiroService** | getResumo, getInadimplentes, criarAcordo | supabase |
| **AuditService** | log, getLogs, getCountsBySeverity | supabase, session |

---

## Views (Pages)

| View | Arquivo | Descrição |
|------|---------|-----------|
| Login | `login.ts` | Autenticação |
| Signup | `signup.ts` | Registro |
| Dashboard | `dashboard.ts` | Painel principal |
| Secretaria | `SecretariaView.ts` | Gestão administrativa |
| Student Details | `student-details.ts` | Dados completos do aluno |
| Professor Details | `professor-details.ts` | Dados do professor |
| Gestao Turmas | `gestao-turmas.ts` | Turmas e matrículas |
| Financeiro | `financeiro.ts` | Controle financeiro |
| Documents | `documents.ts` | Solicitações |
| Audit Log | `audit-log.ts` | Logs de auditoria |