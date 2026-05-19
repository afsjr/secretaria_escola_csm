# C4 - Contexto — secretary_escola_csm

> Nível 1: Sistema no Centro

---

```mermaid
graph TD
    subgraph "Sistema: SGE CSM"
        SGE[Sistema de Gestão Escolar<br/>SPA + Supabase]
    end

    subgraph "Usuários"
        ADMIN[Administrador]
        SECRETARIA[Secretaria]
        COORD[Coordenação]
        PROF[Professor]
        ALUNO[Aluno]
        FIN[Financeiro]
    end

    subgraph "Sistemas Externos"
        SUPABASE[Supabase<br/>Auth + Database + Edge Functions]
        VER[Vercel<br/>Hospedagem]
    end

    ADMIN -->|Gerencia| SGE
    SECRETARIA -->|Opera| SGE
    COORD -->|Supervisiona| SGE
    PROF -->|Lança notas| SGE
    ALUNO -->|Consulta| SGE
    FIN -->|Controla| SGE

    SGE -->|Autentica| SUPABASE
    SGE -->|Persiste dados| SUPABASE
    SGE -->|Executa ops admin| SUPABASE

    SGE -->|Deploy| VER
```

---

## Descrição dos Atores

| Ator | Descrição | Capabilities |
|------|-----------|--------------|
| **Admin** | Gestão total do sistema | CRUD usuários, reset senhas, configurações |
| **Secretaria** | Operações pedagógicas | Matrículas, turmas, documentos |
| **Coordenação** | Supervisão pedagógica | Professores, notas, relatórios |
| **Professor** | Operação docente | Notas, frequência, aulas |
| **Aluno** | Consumo | Histórico, documentos, disciplinas |
| **Financeiro** | Controle financeiro | Pagamentos, acordos |

---

## Integrações

| Sistema | Protocolo | Tipo |
|---------|-----------|------|
| Supabase Auth | HTTPS + JWT | Autenticação |
| Supabase Database | HTTPS + PostgreSQL | Dados |
| Supabase Edge Functions | HTTPS + Deno | Operações Admin |
| Vercel | HTTPS | Hospedagem |