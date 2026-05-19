# Code/Spec Matrix

> Mapeamento de arquivos do legado para as specs SDD

## Legenda

- 🟢 **COBERTO** — especificação completa gerada
- 🟡 **PARCIAL** — parcialmente coberto
- 🔴 **NÃO COBERTO** — sem spec gerada

---

## Módulos — Arquivos Fonte → Spec

| Arquivo do Legado | Unit Correspondente | Cobertura |
|-------------------|---------------------|-----------|
| `src/lib/authz.ts` | auth/ | 🟢 |
| `src/auth/session.ts` | auth/ | 🟢 |
| `src/views/login.ts` | auth/ | 🟡 |
| `src/views/signup.ts` | auth/ | 🟡 |
| `src/views/force-change-password.ts` | auth/ | 🟡 |
| `src/views/forgot-password.ts` | auth/ | 🟡 |
| `src/views/reset-password.ts` | auth/ | 🟡 |
| `src/lib/admin-service.ts` | admin/ | 🟢 |
| `src/views/secretaria.ts` | admin/ | 🟡 |
| `src/components/Tabs/GerenciarAlunosTab.ts` | admin/ | 🟡 |
| `src/components/Tabs/GerenciarProfessoresTab.ts` | admin/ | 🟡 |
| `src/components/Tabs/GerenciarCursosTab.ts` | admin/ | 🟡 |
| `src/views/dashboard.ts` | admin/ | 🟡 |
| `src/lib/academic-service.ts` | academic/ | 🟢 |
| `src/lib/grades-utils.ts` | academic/ | 🟡 |
| `src/views/professor.ts` | academic/ | 🟡 |
| `src/components/Tabs/NotasEstagioTab.ts` | academic/ | 🟡 |
| `src/views/professor-registrar-aula.ts` | academic/ | 🟡 |
| `src/lib/professor-service.ts` | professor/ | 🟢 |
| `src/lib/professor-details-service.ts` | professor/ | 🟢 |
| `src/views/professor-details.ts` | professor/ | 🟡 |
| `src/views/professor-turmas.ts` | professor/ | 🟡 |
| `src/views/professor-alunos.ts` | professor/ | 🟡 |
| `src/views/gestao-turmas.ts` | course/ | 🟡 |
| `src/lib/course-service.ts` | course/ | 🟢 |
| `src/views/matriz.ts` | course/ | 🟡 |
| `src/lib/student-details-service.ts` | student/ | 🟢 |
| `src/views/student-details.ts` | student/ | 🟡 |
| `src/views/profile.ts` | student/ | 🟡 |
| `src/lib/documents-service.ts` | documents/ | 🟢 |
| `src/views/documents.ts` | documents/ | 🟡 |
| `src/lib/financeiro-service.ts` | financeiro/ | 🟢 |
| `src/views/financeiro.ts` | financeiro/ | 🟡 |
| `src/lib/audit-service.ts` | audit/ | 🟢 |
| `src/views/audit-log.ts` | audit/ | 🟢 |

---

## Arquivos de Infraestrutura

| Arquivo | Cobertura | Observação |
|---------|-----------|------------|
| `src/lib/supabase.ts` | n/a | Configuração, não especificação |
| `src/types/index.ts` | n/a | Definições de tipos |
| `src/types/domain.ts` | n/a | Tipos de domínio |
| `src/main.ts` | n/a | Entry point |
| `src/vite-env.d.ts` | n/a | Configuração Vite |
| `src/lib/validation.ts` | n/a | Utilitário de validação |
| `src/lib/security.ts` | n/a | Utilitário de segurança |
| `src/lib/toast.ts` | n/a | Notificações |
| `src/lib/pdf-service.ts` | n/a | Geração PDF (utilitário) |
| `src/lib/excel-service.ts` | n/a | Exportação Excel (utilitário) |
| `src/lib/date-utils.ts` | n/a | Utilitário de datas |
| `src/lib/instituicao-service.ts` | 🟡 | Dados instituição |

---

## Testes

| Arquivo | Cobertura | Observação |
|---------|-----------|------------|
| `src/lib/admin-service.test.ts` | n/a | Teste legado |
| `src/lib/professor-service.test.ts` | n/a | Teste legado |
| `src/lib/student-details-service.test.ts` | n/a | Teste legado |
| `src/lib/academic-service.test.ts` | n/a | Teste legado |
| `src/lib/authz.test.ts` | n/a | Teste legado |
| `src/lib/security.test.ts` | n/a | Teste legado |
| `src/lib/validation.test.ts` | n/a | Teste legado |
| `src/lib/concurrency-control.test.ts` | n/a | Teste legado |
| `src/lib/grades.test.ts` | n/a | Teste legado |
| `src/views/secretaria.test.ts` | n/a | Teste legado |
| `src/components/Tabs/GerenciarAlunosTab.test.ts` | n/a | Teste legado |

---

## Estatísticas de Cobertura

| Métrica | Valor |
|---------|-------|
| Total arquivos .ts | 75 |
| Arquivos mapeados a spec | 35 |
| Cobertura efetiva | ~47% |
| Units com spec completa | 9/9 (100%) |

---

## Gaps Identificados

- 🔴 Views de login/signup não têm spec dedicada (embora auth tenha)
- 🔴 Componentes de UI (tabs, modais) não mapeados individualmente
- 🟡 Alguns serviços utilitários não têm spec (pdf-service, excel-service)

**Recomendação:** Para cobertura total, gerar spec dedicada para módulo "shared" com utilitários.

---

**Confiança:** 🟡 Parcial — nem todos os arquivos foram mapeados explicitamente nas specs