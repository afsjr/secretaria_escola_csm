# Inventário — secretaria_escola_csm

> Gerado pelo Scout em 2026-05-19
> Sistema de Gestão Escolar - CSM

---

## Estrutura de Pastas

```
secretaria_escola_csm/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── vercel.json
│
├── src/
│   ├── main.ts                 # Entry point SPA
│   ├── vite-env.d.ts
│   ├── styles/
│   │   └── main.css
│   ├── types/
│   │   ├── index.ts
│   │   ├── domain.ts
│   │   └── dom.d.ts
│   ├── auth/
│   │   ├── session.ts
│   │   ├── session.test.ts
│   │   └── signup-handler.ts
│   ├── lib/                    # Camada de serviços (21 arquivos)
│   │   ├── supabase.ts
│   │   ├── admin-service.ts
│   │   ├── academic-service.ts
│   │   ├── professor-service.ts
│   │   ├── course-service.ts
│   │   ├── student-details-service.ts
│   │   ├── professor-details-service.ts
│   │   ├── financeiro-service.ts
│   │   ├── documents-service.ts
│   │   ├── excel-service.ts
│   │   ├── pdf-service.ts
│   │   ├── validation.ts
│   │   ├── authz.ts
│   │   ├── rate-limiter.ts
│   │   ├── security.ts
│   │   ├── toast.ts
│   │   ├── dom-utils.ts
│   │   ├── date-utils.ts
│   │   ├── audit-service.ts
│   │   ├── certificate-service.ts
│   │   ├── certificate-service.test.ts
│   │   ├── grades-utils.ts
│   │   ├── instituicao-service.ts
│   │   ├── concurrency-control.ts
│   │   └── *.test.ts (11 arquivos de teste)
│   ├── hooks/
│   │   └── useAuditStats.ts
│   ├── components/
│   │   ├── index.ts
│   │   ├── modal.ts
│   │   ├── NotificationDropdown.ts
│   │   ├── tabela-alunos.ts
│   │   ├── tabela-professores.ts
│   │   ├── RequestTable.ts
│   │   ├── audit/
│   │   │   ├── AuditBarChart.ts
│   │   │   ├── AuditCards.ts
│   │   │   └── AuditTrendChart.ts
│   │   └── Tabs/
│   │       ├── OverviewTab.ts
│   │       ├── CadastroAlunoTab.ts
│   │       ├── CadastroProfessorTab.ts
│   │       ├── GerenciarAlunosTab.ts
│   │       ├── GerenciarAlunosTab.test.ts
│   │       ├── GerenciarCertificadosTab.ts
│   │       ├── GerenciarProfessoresTab.ts
│   │       ├── GerenciarCursosTab.ts
│   │       └── NotasEstagioTab.ts
│   ├── views/                  # Páginas da aplicação (28 arquivos)
│   │   ├── login.ts
│   │   ├── signup.ts
│   │   ├── home.ts
│   │   ├── dashboard.ts
│   │   ├── dashboard-home.ts
│   │   ├── aluno-notas.ts
│   │   ├── forgot-password.ts
│   │   ├── reset-password.ts
│   │   ├── force-change-password.ts
│   │   ├── secretaria.ts
│   │   ├── secretaria.test.ts
│   │   ├── student-details.ts
│   │   ├── professor-details.ts
│   │   ├── professor.ts
│   │   ├── professor-turmas.ts
│   │   ├── professor-alunos.ts
│   │   ├── professor-registrar-aula.ts
│   │   ├── gestao-turmas.ts
│   │   ├── matriz.ts
│   │   ├── financeiro.ts
│   │   ├── documents.ts
│   │   ├── configuracoes.ts
│   │   ├── directory.ts
│   │   ├── audit-log.ts
│   │   ├── audit-dashboard.ts
│   │   └── profile.ts
│   └── test/
│       ├── setup.ts
│       └── __mocks__/
│           └── supabase.ts
│
├── supabase/
│   ├── schema.sql
│   ├── migrations/
│   │   ├── 20260523153000_tipos_curso.sql
│   │   └── 20260523220000_certificados.sql
│   └── functions/
│       ├── admin-create-user/
│       ├── admin-reset-password/
│       └── get-logs-agrupados/
│   ├── migration.sql
│   ├── rls_fix.sql
│   ├── security_hardening_v4.sql
│   ├── recovery_admin.sql
│   └── functions/
│       ├── admin-create-user/
│       │   ├── index.ts
│       │   └── deno.json
│       └── admin-reset-password/
│           ├── index.ts
│           └── deno.json
│
└── public/
    └── apresentacao_treinamento.html
```

---

## Contagem de Arquivos por Tipo

| Tipo | Quantidade |
|------|------------|
| `.ts` | 58 |
| `.test.ts` | 9 |
| `.css` | 1 |
| `.html` | 2 |
| `.sql` | 5 |
| `deno.json` | 2 |

---

## Pontos de Entrada

- **Frontend**: `src/main.ts` — SPA com hash-based routing
- **Edge Functions Supabase**: `supabase/functions/*/index.ts`
- **Build**: `vite.config.ts`
- **Testes**: `vitest.config.ts`

---

## Frameworks e Bibliotecas Principais

| Dependência | Versão | Uso |
|-------------|--------|-----|
| **Vite** | (dev) | Bundler/Build |
| **TypeScript** | ^6.0.2 | Linguagem |
| **Vitest** | ^4.1.4 | Testes |
| **@supabase/supabase-js** | ^2.101.0 | Backend-as-a-Service |
| **Zod** | ^4.3.6 | Validação de schemas |
| **xlsx** | ^0.18.5 | Exportar/importar planilhas |
| **jspdf** | ^4.2.1 | Gerar PDFs |

---

## Perfis de Usuário (RBAC)

| Perfil | Descrição |
|--------|-----------|
| `admin` | Administrador do sistema |
| `secretaria` | Operações administrativas |
| `coordenacao` | Coordenação pedagógica |
| `professor` | Docentes |
| `aluno` | Estudantes |

---

## Módulos Identificados

| Módulo | Arquivos Principais | Responsabilidade |
|--------|---------------------|------------------|
| **Auth** | `auth/session.ts`, `auth/signup-handler.ts` | Login, logout, recovery |
| **Admin** | `lib/admin-service.ts` | CRUD de usuários |
| **Academic** | `lib/academic-service.ts` | Turmas, matrículas, notas |
| **Professor** | `lib/professor-service.ts` | Aulas, disciplinas |
| **Course** | `lib/course-service.ts` | Cursos, matriz curricular |
| **Student** | `lib/student-details-service.ts` | Dados completos do aluno |
| **Documents** | `lib/documents-service.ts` | Solicitações de documentos |
| **Financeiro** | `lib/financeiro-service.ts` | Controle financeiro |
| **Audit** | `lib/audit-service.ts` | Log de auditoria |

---

## Views/Pages Identificadas

| View | Arquivo | Descrição |
|------|---------|-----------|
| Login | `login.ts` | Autenticação |
| Signup | `signup.ts` | Registro |
| Dashboard | `dashboard.ts` | Painel principal |
| Secretaria | `secretaria.ts` | Gestão administrativa |
| Student Details | `student-details.ts` | Ficha completa do aluno |
| Professor Details | `professor-details.ts` | Ficha do professor |
| Gestao Turmas | `gestao-turmas.ts` | Matrículas e ofertas |
| Financeiro | `financeiro.ts` | Controle financeiro |
| Documents | `documents.ts` | Solicitações |
| Audit Log | `audit-log.ts` | Log de auditoria |

---

## Banco de Dados (Supabase/PostgreSQL)

### Tabelas Principais

- `perfis` — usuários do sistema
- `perfis_enderecos` — endereços
- `cursos` — cursos disponíveis
- `turmas` — turmas por curso
- `matriculas` — relação aluno-turma
- `disciplinas` — ofertas de disciplinas
- `disciplinas_base` — catálogo de disciplinas
- `boletim` — notas e frequência
- `solicitacoes` — pedidos de documentos
- `aulas` — registro de aulas
- `responsavel` — responsáveis de alunos
- `observacoes` — anotações

### Arquivos SQL

- `supabase/schema.sql` — DDL principal
- `supabase/migration.sql` — Migrações incrementais
- `supabase/rls_fix.sql` — Políticas RLS
- `supabase/security_hardening_v4.sql` — Segurança
- `supabase/recovery_admin.sql` — Recuperação

---

## Infraestrutura

- **Deploy**: Vercel (`vercel.json`)
- **Backend**: Supabase (Edge Functions em Deno)
- **Autenticação**: Supabase Auth
- **Banco**: Supabase PostgreSQL com RLS

---

## Cobertura de Testes

- **Framework**: Vitest
- **Testes unitários**: 6 arquivos na pasta `lib/*.test.ts`
- **Testes de компоненти**: `GerenciarAlunosTab.test.ts`
- **Mocks**: `test/__mocks__/supabase.ts`

---