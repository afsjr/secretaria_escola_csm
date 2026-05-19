# ERD Completo — secretary_escola_csm

> Modelo de Dados com Relacionamentos

---

```mermaid
erDiagram
    PERFIS {
        uuid id PK
        text email
        text nome_completo
        text perfil
        text cpf
        text telefone
        date data_nascimento
        text genero
        boolean bloqueio_financeiro
        timestamp created_at
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

    CURSOS {
        uuid id PK
        text nome
        text descricao
        boolean ativo
        timestamp created_at
    }

    TURMAS {
        uuid id PK
        text nome
        text periodo
        text status_ingresso
        uuid curso_id FK
        timestamp created_at
    }

    DISCIPLINAS_BASE {
        uuid id PK
        text nome
        text modulo
        uuid curso_id FK
        int carga_horaria
        timestamp created_at
    }

    TURMA_DISCIPLINAS {
        uuid id PK
        uuid turma_id FK
        uuid disciplina_base_id FK
        uuid professor_id FK
        timestamp created_at
    }

    MATRICULAS {
        uuid id PK
        uuid aluno_id FK
        uuid turma_id FK
        text status_aluno
        timestamp created_at
    }

    BOLETIM {
        uuid id PK
        uuid aluno_id FK
        uuid disciplina_base_id FK
        text disciplina
        numeric n1
        numeric n2
        numeric n3
        numeric rec
        numeric nota_estagio
        int faltas
        int versao
        timestamp created_at
    }

    AULAS {
        uuid id PK
        uuid turma_disciplina_id FK
        uuid professor_id FK
        date data
        text conteudo
        timestamp created_at
    }

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

    SOLICITACOES {
        uuid id PK
        uuid user_id FK
        text tipo
        text status
        timestamp criado_em
    }

    PAGAMENTOS {
        uuid id PK
        uuid aluno_id FK
        text descricao
        numeric valor_original
        numeric valor_pago
        date data_vencimento
        text status
        timestamp created_at
    }

    FINANCEIRO_ACORDOS {
        uuid id PK
        uuid aluno_id FK
        numeric total_debito
        numeric total_com_desconto
        int numero_parcelas
        numeric valor_parcela
        text status
        timestamp created_at
    }

    AUDIT_LOG {
        uuid id PK
        uuid usuario_id FK
        text usuario_nome
        text usuario_perfil
        text acao
        text tabela_afetada
        uuid registro_id FK
        text descricao
        jsonb dados_antigos
        jsonb dados_novos
        text user_agent
        timestamp created_at
    }

    PERFIS ||--o| PERFIS_ENDERECOS : "tem"
    CURSOS ||--o{ TURMAS : "possui"
    CURSOS ||--o{ DISCIPLINAS_BASE : "tem"
    TURMAS ||--o{ MATRICULAS : "possui"
    TURMAS ||--o{ TURMA_DISCIPLINAS : "tem"
    DISCIPLINAS_BASE ||--o{ TURMA_DISCIPLINAS : "oferecida_em"
    PERFIS ||--o{ TURMA_DISCIPLINAS : "leciona"
    PERFIS ||--o{ MATRICULAS : "possui"
    PERFIS ||--o{ BOLETIM : "tem"
    PERFIS ||--o{ AULAS : "registra"
    TURMA_DISCIPLINAS ||--o{ AULAS : "possui"
    PERFIS ||--o{ RESPONSAVEIS : "tem"
    PERFIS ||--o{ OBSERVACOES_ALUNO : "recebe"
    PERFIS ||--o{ SOLICITACOES : "faz"
    PERFIS ||--o{ PAGAMENTOS : "tem"
    PERFIS ||--o{ AUDIT_LOG : "gera"
```

---

## Detalhamento de Entidades

### Entidades Centrais

| Entidade | Descrição | Qtd Campos |
|----------|-----------|------------|
| **perfis** | Usuários do sistema | 15+ |
| **turmas** | Turmas por curso | 6 |
| **matriculas** | Matrículas aluno-turma | 5 |
| **boletim** | Notas e frequência | 12 |
| **turma_disciplinas** | Ofertas (disciplina+turma+professor) | 5 |

### Entidades de Suporte

| Entidade | Descrição |
|----------|-----------|
| **perfis_enderecos** | Endereços de usuários |
| **responsaveis** | Responsáveis de alunos |
| **observacoes_aluno** | Anotações sobre alunos |
| **solicitacoes** | Pedidos de documentos |
| **pagamentos** | Débitos e pagamentos |
| **financeiro_acordos** | Acordos de pagamento |
| **audit_log** | Logs de auditoria |

---

## Chaves e Índices

### Primary Keys
- Todas as tabelas têm `id` como UUID PK

### Foreign Keys
- `matriculas.aluno_id` → `perfis.id`
- `matriculas.turma_id` → `turmas.id`
- `boletim.aluno_id` → `perfis.id`
- `turma_disciplinas.turma_id` → `turmas.id`
- `turma_disciplinas.disciplina_base_id` → `disciplinas_base.id`

### Índices Importantes
- `perfis.perfil` — para filtrar alunos, professores
- `matriculas.aluno_id + status_aluno` — para verificar matrícula ativa
- `boletim.aluno_id + disciplina_base_id` — para buscar notas
- `audit_log.created_at` — para ordenação temporal