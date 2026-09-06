# ERD — Sistema de Gestão Escolar CSM

> 🟢 **CONFIRMADO** — Extraído diretamente de DDL (`schema.sql` v4.0, `migration.sql`, migrations em `supabase/migrations/`)
> Fonte: Supabase (PostgreSQL) — última atualização do schema: 2026-05-21

---

## ERD Geral (simplificado)

```mermaid
erDiagram
    AUTH_USERS ||--|| PERFIS : "cria via trigger"
    PERFIS ||--o{ PERFIS_ENDERECOS : "possui"
    PERFIS ||--o{ MATRICULAS : "aluno matriculado em"
    PERFIS ||--o{ BOLETIM : "aluno possui notas em"
    PERFIS ||--o{ SOLICITACOES : "aluno solicita"
    PERFIS ||--o{ RESPONSAVEIS : "aluno tem"
    PERFIS ||--o{ OBSERVACOES_ALUNO : "aluno tem observações"
    PERFIS ||--o{ PAGAMENTOS : "aluno possui"
    PERFIS ||--o{ FINANCEIRO_ACORDOS : "aluno possui"
    PERFIS ||--o{ TURMA_DISCIPLINAS : "professor leciona"
    PERFIS ||--o{ AULAS : "professor ministra"
    PERFIS ||--o{ CERTIFICADOS : "aluno recebe"
    PERFIS ||--o{ AUDIT_LOG : "gera log"

    CURSOS ||--o{ TURMAS : "possui"
    CURSOS ||--o{ DISCIPLINAS_BASE : "possui catálogo"
    CURSOS ||--o{ DISCIPLINAS : "(legado) possui"
    CURSOS ||--o{ CERTIFICADOS : "certifica"
    CURSOS ||--o{ CONTEUDO_PROGRAMATICO : "possui"

    TURMAS ||--o{ MATRICULAS : "possui alunos via"
    TURMAS ||--o{ TURMA_DISCIPLINAS : "oferta disciplinas via"
    TURMAS ||--o{ DISCIPLINAS : "(legado) possui"

    DISCIPLINAS_BASE ||--o{ TURMA_DISCIPLINAS : "é ofertada via"
    DISCIPLINAS_BASE ||--o{ BOLETIM : "referenciada em"

    TURMA_DISCIPLINAS ||--o{ AULAS : "possui"

    CERTIFICADOS_MODELOS ||--o{ CERTIFICADOS : "origina"
```

---

## ERD por Domínio

### Domínio: Identidade e Acesso

```mermaid
erDiagram
    AUTH_USERS {
        uuid id PK
        text email
        jsonb raw_user_meta_data
    }
    PERFIS {
        uuid id PK
        text nome_completo
        text email
        text cpf
        text telefone
        text perfil
        boolean bloqueio_financeiro
        date data_nascimento
        text genero
        text estado_civil
        text cidade_natal
        text nacionalidade
        text profissao
        text graduacao
        date data_conclusao_graduacao
        text rg
        text orgao_expedidor
        date data_expedicao_rg
        text whatsapp
        boolean primeiro_acesso
        integer versao
        timestamp created_at
        timestamp updated_at
    }
    PERFIS_ENDERECOS {
        uuid id PK
        uuid user_id FK
        text cep
        text logradouro
        text numero
        text complemento
        text bairro
        text cidade
        text uf
        timestamp created_at
    }
    AUTH_USERS ||--|| PERFIS : "trigger on_auth_user_created"
    PERFIS ||--o{ PERFIS_ENDERECOS : "user_id"
```

### Domínio: Acadêmico

```mermaid
erDiagram
    CURSOS {
        uuid id PK
        text nome
        text descricao
        text tipo
        boolean ativo
        integer versao
        timestamp created_at
    }
    TURMAS {
        uuid id PK
        text nome
        text periodo
        text status_ingresso
        uuid curso_id FK
        integer versao
        timestamp created_at
    }
    DISCIPLINAS_BASE {
        uuid id PK
        text nome
        text modulo
        uuid curso_id FK
        integer carga_horaria
        integer ordem
        timestamp created_at
    }
    TURMA_DISCIPLINAS {
        uuid id PK
        uuid turma_id FK
        uuid disciplina_base_id FK
        uuid professor_id FK
        date data_inicio
        date data_fim
        timestamp created_at
    }
    MATRICULAS {
        uuid id PK
        uuid aluno_id FK
        uuid turma_id FK
        text status_aluno
        date data_matricula
        timestamp created_at
    }
    AULAS {
        uuid id PK
        uuid disciplina_id FK
        uuid turma_disciplina_id FK
        uuid professor_id FK
        date data
        text conteudo
        timestamp created_at
    }
    BOLETIM {
        uuid id PK
        uuid aluno_id FK
        text disciplina
        uuid disciplina_base_id FK
        integer faltas
        decimal n1
        decimal n2
        decimal n3
        decimal rec
        text nota_estagio
        text estagio_parecer
        text status
        integer versao
        timestamp created_at
    }
    CURSOS ||--o{ TURMAS : "curso_id"
    CURSOS ||--o{ DISCIPLINAS_BASE : "curso_id"
    TURMAS ||--o{ TURMA_DISCIPLINAS : "turma_id"
    TURMAS ||--o{ MATRICULAS : "turma_id"
    DISCIPLINAS_BASE ||--o{ TURMA_DISCIPLINAS : "disciplina_base_id"
    TURMA_DISCIPLINAS ||--o{ AULAS : "turma_disciplina_id"
```

### Domínio: Financeiro

```mermaid
erDiagram
    PAGAMENTOS {
        uuid id PK
        uuid aluno_id FK
        text descricao
        decimal valor_original
        decimal valor_pago
        date data_vencimento
        date data_pagamento
        text status
        text metodo_pagamento
        timestamp created_at
    }
    FINANCEIRO_ACORDOS {
        uuid id PK
        uuid aluno_id FK
        decimal total_debito
        decimal total_com_desconto
        integer numero_parcelas
        decimal valor_parcela
        text status
        text termo_assinado_url
        timestamp created_at
    }
    FINANCEIRO_CONFIG {
        uuid id PK
        text chave UK
        decimal valor
        timestamp created_at
    }
    PERFIS ||--o{ PAGAMENTOS : "aluno_id"
    PERFIS ||--o{ FINANCEIRO_ACORDOS : "aluno_id"
```

### Domínio: Certificados

```mermaid
erDiagram
    CERTIFICADOS_MODELOS {
        uuid id PK
        text nome
        text tipo_curso
        text logo_path
        text assinatura_path
        boolean ativo
        timestamptz created_at
        timestamptz updated_at
    }
    CONTEUDO_PROGRAMATICO {
        uuid id PK
        uuid curso_id FK
        text disciplina
        integer carga_horaria
        text modulo
        integer ordem
        timestamptz created_at
    }
    CERTIFICADOS {
        uuid id PK
        uuid aluno_id FK
        uuid curso_id FK
        date data_conclusao
        integer carga_horaria
        text codigo_autenticacao UK
        uuid emitido_por FK
        timestamptz emitido_em
        uuid template_id FK
    }
    CURSOS ||--o{ CONTEUDO_PROGRAMATICO : "curso_id"
    CURSOS ||--o{ CERTIFICADOS : "curso_id"
    CERTIFICADOS_MODELOS ||--o{ CERTIFICADOS : "template_id"
    PERFIS ||--o{ CERTIFICADOS : "aluno_id emitido_por"
```

### Domínio: Suporte / Auditoria

```mermaid
erDiagram
    RESPONSAVEIS {
        uuid id PK
        uuid aluno_id FK
        text nome
        text cpf
        text telefone
        text email
        text parentesco
        boolean financeiro
        boolean principal
        timestamp created_at
    }
    OBSERVACOES_ALUNO {
        uuid id PK
        uuid aluno_id FK
        text texto
        text categoria
        uuid criado_por FK
        timestamp criado_em
    }
    AUDIT_LOG {
        uuid id PK
        uuid usuario_id FK
        text usuario_nome
        text usuario_perfil
        text acao
        text tabela_afetada
        uuid registro_id
        text descricao
        jsonb dados_antigos
        jsonb dados_novos
        text user_agent
        timestamp created_at
    }
    SOLICITACOES {
        uuid id PK
        uuid user_id FK
        text tipo
        text status
        timestamp criado_em
    }
    PERFIS ||--o{ RESPONSAVEIS : "aluno_id"
    PERFIS ||--o{ OBSERVACOES_ALUNO : "aluno_id"
    PERFIS ||--o{ AUDIT_LOG : "usuario_id"
    PERFIS ||--o{ SOLICITACOES : "user_id"
```

---

## Tabela Legado

> 🟡 **INFERIDO** — Marcada explicitamente como legado no schema.sql

**DISCIPLINAS** — substituída por `disciplinas_base` + `turma_disciplinas`. Mantida por compatibilidade retroativa.

| Coluna | Tipo | Constraint |
|--------|------|-----------|
| id | UUID | PK |
| nome | TEXT | NOT NULL |
| modulo | TEXT | nullable |
| turma_id | UUID | FK → turmas (CASCADE) |
| professor_id | UUID | FK → perfis (SET NULL) |
| curso_id | UUID | FK → cursos (SET NULL) |
| versao | INTEGER | DEFAULT 1 |
| created_at | TIMESTAMP | DEFAULT NOW() |

> ⚠️ Esta tabela existe no banco mas **não é usada no código atual**.
