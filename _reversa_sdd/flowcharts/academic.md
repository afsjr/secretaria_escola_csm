# Fluxograma — Academic

> Módulo: academic
> Complexity: high

---

## matricularAluno

```mermaid
flowchart TD
    A[matricularAluno] --> B[Query active matriculas]
    B --> C{hasActive?}
    C -->|Sim| D[Return {error: 'Já ativo na turma X'}]
    C -->|Não| E[Insert matricula status='ativo']
    E --> F[Return {data, error}]
```

---

## getDisciplinasDaTurma (Deduplicação)

```mermaid
flowchart TD
    A[getDisciplinasDaTurma] --> B[Query turma_disciplinas]
    B --> C[Include disciplinas_base, perfis]
    C --> D[Initialize Set seenItems]
    D --> E[Filter duplicates]
    E --> F{disc.nome exists?}
    F -->|Não| G[Skip]
    F -->|Sim| H[Normalize nome + modulo]
    H --> I{key in seenItems?}
    I -->|Sim| G
    I -->|Não| J[Add to seenItems]
    J --> K[Map to uniqueDisciplinas]
    K --> L[Return {data: {disciplinas}}]
```

---

## getNotasCompletasTurma

```mermaid
flowchart TD
    A[getNotasCompletasTurma] --> B[getAlunosDaTurma]
    B --> C{error?}
    C -->|Sim| D[Return {error}]
    C -->|Não| E[Query notas where disciplinaBaseId]
    E --> F{error?}
    F -->|Sim| G[Return {error}]
    F -->|Não| H[Build notasMap by aluno_id]
    H --> I[Return {data: {alunos, notasMap, totalAtivos}}]
```

---

## upsertNotaEstagio

```mermaid
flowchart TD
    A[upsertNotaEstagio] --> B[Check existing record]
    B --> C{existe?}
    C -->|Sim| D[Update: nota_estagio, versao+1]
    C -->|Não| E[Insert: nota_estagio, versao=1]
    D --> F[Return {data, error}]
    E --> F
```