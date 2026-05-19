# Spec Impact Matrix — secretary_escola_csm

> Matriz de impacto entre componentes e funcionalidades

---

## Legenda

- 🔴 Impacto ALTO: Componente central para esta funcionalidade
- 🟡 Impacto MÉDIO: Componente participa indiretamente
- 🟢 Impacto BAIXO: Suporte ou opcional

---

## Matriz de Impacto

| Funcionalidade | Auth | Admin | Academic | Professor | Course | Student | Documents | Financeiro | Audit | RBAC |
|----------------|:----:|:-----:|:--------:|:---------:|:------:|:-------:|:---------:|:----------:|:-----:|:----:|
| **Autenticação** | 🔴 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 |
| **Login/Logout** | 🔴 | 🟡 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 |
| **Criar Usuário** | 🟡 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟡 | 🟢 |
| **Reset Senha** | 🟡 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟡 | 🟢 |
| **CRUD Turmas** | 🟢 | 🟡 | 🔴 | 🟡 | 🟡 | 🟢 | 🟢 | 🟢 | 🟡 | 🟢 |
| **Matricular Aluno** | 🟢 | 🟡 | 🔴 | 🟢 | 🟡 | 🟡 | 🟢 | 🟢 | 🟡 | 🟢 |
| **Lançar Notas** | 🟢 | 🟡 | 🟡 | 🔴 | 🟡 | 🟢 | 🟢 | 🟢 | 🟡 | 🟢 |
| **Registrar Aula** | 🟢 | 🟢 | 🟡 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟡 | 🟢 |
| **CRUD Cursos** | 🟢 | 🟡 | 🟡 | 🟢 | 🔴 | 🟢 | 🟢 | 🟢 | 🟡 | 🟢 |
| **Matriz Curricular** | 🟢 | 🟢 | 🟡 | 🟡 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 |
| **Ver Dados Aluno** | 🟢 | 🟡 | 🟡 | 🟡 | 🟢 | 🔴 | 🟡 | 🟢 | 🟢 | 🟢 |
| **Responsáveis** | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟢 | 🟢 | 🟢 | 🟢 |
| **Solicitar Doc** | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟡 | 🔴 | 🟢 | 🟢 | 🟢 |
| **Controle Financeiro** | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟡 | 🟢 |
| **Acordos Pagamento** | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🟢 | 🔴 | 🟡 | 🟢 |
| **Auditar Ações** | 🟢 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🔴 | 🟢 |
| **Ver Dashboard** | 🟢 | 🟡 | 🟡 | 🟡 | 🟢 | 🟢 | 🟢 | 🟡 | 🟢 | 🟡 |

---

## Impacto por Componente

### Auth (session.ts)
- **Alta impactância**: Autenticação, Login, Logout, Session Timeout
- **Média impactância**: Reset Password, Profile

### AdminService
- **Alta impactância**: Criar usuário, Reset senha
- **Média impactância**: Matricular aluno, Update aluno

### AcademicService
- **Alta impactância**: Turmas, Matrículas
- **Média impactância**: Notas, Disciplinas

### ProfessorService
- **Alta impactância**: Notas, Aulas
- **Média impactância**: Disciplinas do professor

### CourseService
- **Alta impactância**: Cursos, Matriz Curricular, Ofertas

### StudentDetailsService
- **Alta impactância**: Dados completos do aluno, Endereço, Responsáveis, Observações

### DocumentsService
- **Alta impactância**: Solicitações de documentos

### FinanceiroService
- **Alta impactância**: Pagamentos, Acordos, Inadimplentes

### AuditService
- **Alta impactância**: Todas as ações que precisam de log

---

## Dependências Críticas

| Componente | Depende de | Tipo |
|------------|------------|------|
| AdminService | supabaseAdmin | Chave de serviço |
| AdminService | Edge Functions | Fallback |
| ProfessorService | Concurrency Control | Versão em notas |
| StudentDetailsService | RPC `aluno_eh_menor` | Função DB |
| AuditService | Session | Usuario atual |

---

## Pontos de Integração

| Integração | Componentes | Tipo |
|------------|-------------|------|
| Auth → RBAC | session → authz.ts | Verificação de role |
| Admin → Audit | admin-service → audit-service | Log de operações |
| Professor → Audit | professor-service → audit-service | Log de notas/aulas |
| Academic → Course | Turmas e disciplinas | Foreign Keys |
| Student → Financeiro | bloqueio_financeiro | Campo em perfis |