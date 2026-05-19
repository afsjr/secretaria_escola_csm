# Fluxograma — Admin

> Módulo: admin
> Complexity: high

---

## createUserByAdmin

```mermaid
flowchart TD
    A[createUserByAdmin] --> B{supabaseAdmin disponível?}
    B -->|Sim| C[1. createUser in Auth]
    B -->|Não| D{EDGE_FUNCTIONS_BASE_URL?}
    C --> E{authError?}
    E -->|Sim| F[Return {error}]
    E -->|Não| G[2. Check existing profile]
    G --> H{exists?}
    H -->|Sim| I[Delete user]
    I --> J[Return {error: 'Perfil já existe'}]
    H -->|Não| K[3. Create perfil in tabel]
    K --> L{profileError?}
    L -->|Sim| M[Delete user created]
    M --> N[Return {error}]
    L -->|Não| O[4. AuditService.log]
    O --> P[Return {data: {userId}}]
    D -->|Sim| Q[callEdgeFunction admin-create-user]
    Q --> R[Return {data, error}]
    D -->|Não| S[Fallback: console.warn]
    S --> T[Return {error: 'Edge Functions não configuradas'}]
```

---

## matricularAluno

```mermaid
flowchart TD
    A[matricularAluno] --> B[Check active matriculas]
    B --> C{exists?}
    C -->|Sim| D[Return {error: 'Aluno já ativo'}]
    C -->|Não| E[Insert into matriculas]
    E --> F{error?}
    F -->|Sim| G[Return {error}]
    F -->|Não| H[AuditService.log]
    H --> I[Return {data, error}]
```

---

## updateAluno (Proteção)

```mermaid
flowchart TD
    A[updateAluno] --> B[Copy updates]
    B --> C[Delete: perfil, email, id, bloqueio_financeiro]
    C --> D[Update where id=alunoId AND perfil='aluno']
    D --> E[Return {data, error}]
```

---

## resetUserPassword

```mermaid
flowchart TD
    A[resetUserPassword] --> B{EDGE_FUNCTIONS_BASE_URL?}
    B -->|Sim| C[1. Get session]
    C --> D{session?}
    D -->|Não| E[Return {error: 'Não autenticado'}]
    D -->|Sim| F[2. POST admin-reset-password]
    F --> G{response.ok?}
    G -->|Não| H[Return {error: message}]
    G -->|Sim| I[3. AuditService.log]
    I --> J[Return {data, error}]
    B -->|Não| K{supabaseAdmin?}
    K -->|Não| L[Return {error}]
    K -->|Sim| M[1. Get current user data]
    M --> N[2. updateUserById password=csm1983#]
    N --> O[3. AuditService.log]
    O --> P[Return {data, error}]
```