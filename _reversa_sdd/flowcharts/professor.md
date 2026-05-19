# Fluxograma — Professor

> Módulo: professor
> Complexity: high

---

## getNotasDaDisciplina

```mermaid
flowchart TD
    A[getNotasDaDisciplina] --> B[Query active matriculas]
    B --> C{error?}
    C -->|Sim| D[Return {error}]
    C -->|Não| E[For each matricula]
    E --> F[Get perfil from nested]
    F --> G[Query boletim by aluno_id + disciplinaBaseId]
    G --> H[Build AlunoComNotas object]
    H --> I{More matriculas?}
    I -->|Sim| E
    I -->|Não| J[Return {data: alunosComNotas}]
```

---

## salvarNota (Optimistic Lock)

```mermaid
flowchart TD
    A[salvarNota] --> B[Get disciplina_base nome]
    B --> C[Check existing nota]
    C --> D{existe?}
    D -->|Sim| E[updateWithLock: table=boletim, versao=versaoAtual]
    D -->|Não| F[Insert with versao=1]
    E --> G[Return {data, error}]
    F --> G
```

---

## salvarNotasEmLote

```mermaid
flowchart TD
    A[salvarNotasEmLote] --> B[Get disciplina_base nome once]
    B --> C[Map notas to promises]
    C --> D[salvarNota for each item]
    D --> E[Promise.all(promises)]
    E --> F[Find first error]
    F --> G[Return {data: results, error}]
```

---

## registrarAula

```mermaid
flowchart TD
    A[registrarAula] --> B[Insert into aulas]
    B --> C{error?}
    C -->|Sim| D[Return {error}]
    C -->|Não| E[AuditService.log: registrar_aula]
    E --> F[Return {data: aulaData, error}]
```