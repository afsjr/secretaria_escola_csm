# Fluxograma — Audit

> Módulo: audit
> Complexity: medium

---

## log (Non-blocking)

```mermaid
flowchart TD
    A[log] --> B[try-catch block]
    B --> C[Get current user]
    C --> D{user?}
    D -->|Não| E[console.warn, return {error: null}]
    D -->|Sim| F[Get user profile]
    F --> G[Get userAgent]
    G --> H[Insert into audit_log]
    H --> I{error?}
    I -->|Sim| J[console.error, return {error: null}]
    I -->|Não| K[Return {error: null}]
    B --> L[catch err]
    L --> M[console.error, return {err}]
    J --> K
```

---

## getLogs (Filtered & Paginated)

```mermaid
flowchart TD
    A[getLogs] --> B[Build base query]
    B --> C{acao?}
    C -->|Sim| D[Add .eq('acao', acao)]
    C -->|Não| E[Skip]
    D --> F{tabela_afetada?}
    F -->|Sim| G[Add .eq('tabela_afetada', value)]
    F -->|Não| H[Skip]
    G --> I{usuario_id?}
    I -->|Sim| J[Add .eq('usuario_id', value)]
    I -->|Não| K[Skip]
    J --> L{data_inicio?}
    L -->|Sim| M[Add .gte('created_at', value)]
    L -->|Não| N[Skip]
    M --> O{data_fim?}
    O -->|Sim| P[Add .lte('created_at', value)]
    O -->|Não| Q[Skip]
    P --> R[Order by created_at DESC]
    R --> S[Range offset, limit]
    S --> T[Return {data, error, count}]
```

---

## getCountsBySeverity

```mermaid
flowchart TD
    A[getCountsBySeverity] --> B[Query all audit_log]
    B --> C[Initialize counts: {alta:0, media:0, baixa:0}]
    C --> D[For each item]
    D --> E[Get severity from ACTION_SEVERITY]
    E --> F[Increment count]
    F --> G{More items?}
    G -->|Sim| D
    G -->|Não| H[Return {data: counts}]
```