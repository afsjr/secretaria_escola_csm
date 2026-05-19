# Arquitetura — secretary_escola_csm

> Gerado pelo Architect em 2026-05-19

---

## Visão Geral

Sistema de Gestão Escolar CSM é uma **SPA (Single Page Application)** com backend **BaaS (Backend-as-a-Service)** usando Supabase.

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    SPA (Vite + TypeScript)               │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐   │    │
│  │  │  Auth   │  │  Admin  │  │Academic │  │ Professor │   │    │
│  │  │ Module  │  │ Service │  │ Service │  │  Service  │   │    │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └─────┬────┘   │    │
│  │       └───────────┴───────────┴─────────────┘        │    │
│  │                        │                                │    │
│  │                   ┌────┴────┐                           │    │
│  │                   │Supabase │ (Cliente JS)             │    │
│  │                   │  Client │                           │    │
│  │                   └────┬────┘                           │    │
│  └────────────────────────┼────────────────────────────────┘    │
└───────────────────────────┼──────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
              ▼             ▼             ▼
      ┌───────────┐  ┌───────────┐  ┌────────────┐
      │  Auth     │  │ Database  │  │ Edge       │
      │           │  │ (Postgre) │  │ Functions  │
      │  Users    │  │ + RLS     │  │ (Deno)     │
      └───────────┘  └───────────┘  └────────────┘
```

---

## Estilo Arquitetural

| Aspecto | Decisão |
|---------|---------|
| **Pattern** | Service-Oriented dentro de SPA |
| **Comunicação** | HTTP REST via Supabase Client |
| **Estado** | Client-side (sem Redux/Context visible) |
| **Autenticação** | Supabase Auth (JWT) |
| **Banco** | PostgreSQL com Row Level Security |

---

## Camadas

### 1. Presentation Layer
- **Views** (`src/views/*.ts`) — Páginas SPA
- **Components** (`src/components/*.ts`) — Componentes reutilizáveis
- **Styles** (`src/styles/main.css`) — Estilos globais

### 2. Business Logic Layer
- **Services** (`src/lib/*.ts`) — Lógica de domínio
- **Auth** (`src/auth/*.ts`) — Autenticação e sessão

### 3. Data Layer
- **Supabase Client** — Cliente HTTP
- **Types** (`src/types/*.ts`) — Definições TypeScript
- **Validation** (`src/lib/validation.ts`) — Validação Zod

---

## Módulos Principais

| Módulo | Responsabilidade | Tecnologias |
|--------|------------------|-------------|
| **Auth** | Login, logout, recovery, sessão | Supabase Auth |
| **Admin** | CRUD usuários, reset senha | Edge Functions |
| **Academic** | Turmas, matrículas, notas | Supabase DB |
| **Professor** | Notas, aulas, disciplinas | Supabase DB |
| **Course** | Cursos, matriz, ofertas | Supabase DB |
| **Student** | Dados completos aluno | Supabase DB |
| **Documents** | Solicitações documentos | Supabase DB |
| **Financeiro** | Pagamentos, acordos | Supabase DB |
| **Audit** | Log de auditoria | Supabase DB |

---

## Fluxo de Dados Típico

```
1. View chama Service
       ↓
2. Service valida dados (Zod)
       ↓
3. Service chama Supabase Client
       ↓
4. Supabase executa query com RLS
       ↓
5. Service retorna resultado para View
       ↓
6. View atualiza UI
```

---

## Segurança

| Mecanismo | Implementação |
|-----------|---------------|
| **Auth** | Supabase Auth (JWT) |
| **Autorização** | RBAC via `authz.ts` + RLS policies |
| **Validação** | Zod schemas em `validation.ts` |
| **速率 Limite** | `rate-limiter.ts` (client-side) |
| **Criptografia** | HTTPS (Vercel) |
| **Admin Ops** | Edge Functions com service role |

---

## Deploy

| Ambiente | Plataforma | URL |
|----------|-------------|-----|
| Produção | Vercel | Configure no vercel.json |

---

## Dívidas Técnicas Identificadas

| Item | Severidade | Descrição |
|------|------------|-----------|
| Frequência simplificada | 🔴 ALTA | Implementação log-only, sem tabela de presença |
| Financeiro sem SQL aggregation | 🟡 MÉDIA | Iteração manual em JS, sem views SQL |
| Rollback registro incompleto | 🟡 MÉDIA | Try-catch sem delete real do usuário auth |
| Sem testes E2E | 🟡 MÉDIA | Apenas testes unitários (Vitest) |

---

## Próximo Passo

O Writer vai gerar as especificações SDD por componente.