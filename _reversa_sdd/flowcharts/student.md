# Fluxograma — Student Details

> Módulo: student
> Complexity: medium

---

## saveEndereco (Upsert)

```mermaid
flowchart TD
    A[saveEndereco] --> B[getEndereco userId]
    B --> C{existe?}
    C -->|Sim| D[Update endereco]
    C -->|Não| E[Insert new endereco]
    D --> F[Return {data, error}]
    E --> F
```

---

## getAlunoCompleto

```mermaid
flowchart TD
    A[getAlunoCompleto] --> B[Get perfil by id]
    B --> C{error?}
    C -->|Sim| D[Return {error}]
    C -->|Não| E[Get endereco]
    E --> F[Get responsaveis]
    F --> G[Get observacoes]
    G --> H[Get matricula (active)]
    H --> I[Return {data: {perfil, endereco, responsaveis, observacoes, matricula}}]
```

---

## getObservacoes

```mermaid
flowchart TD
    A[getObservacoes] --> B[Query observacoes_aluno]
    B --> C[Include criado_por_perfis (nested)]
    C --> D[Filter by aluno_id]
    D --> E[Order by criado_em DESC]
    E --> F[Return {data, error}]
```