# Onboarding: Aluno — Minhas Notas

> Identificador: `005-aluno-notas`
> Data: `2026-05-23`

## Pré-requisitos

- Ambiente local rodando (`npm run dev`)
- Banco Supabase local ou remoto com dados de demonstração
- Um usuário com perfil `aluno` que tenha registros na tabela `boletim`

## Passo a passo

### 1. Verificar dados existentes

No SQL Editor do Supabase, confirme que há boletins para o aluno de teste:

```sql
SELECT b.*, db.nome, db.modulo
FROM boletim b
LEFT JOIN disciplinas_base db ON db.id = b.disciplina_base_id
WHERE b.aluno_id = '<aluno-uuid>'
ORDER BY db.modulo, db.nome;
```

### 2. Testar a view

1. Faça login como `aluno` (CPF: `000.000.000-01`, senha: `aluno123` ou similar)
2. No sidebar, clique em **"Minhas Notas"**
3. Observe:
   - Disciplinas agrupadas por módulo (ex: "I Módulo", "II Módulo")
   - Cada linha mostra: Nome da disciplina, N1, N2, N3, Rec, Média Final
   - Badge colorido: 🟢 Aprovado (final ≥ 6), 🔴 Reprovado (final < 6), 🟡 Cursando (status = pendente)

### 3. Testar caso vazio (se houver)

1. Crie um novo aluno sem matrícula/boletim
2. Faça login e acesse "Minhas Notas"
3. Espere mensagem: "Nenhuma disciplina cadastrada"

### 4. Testar rota direta

Navegue manualmente para: `http://localhost:5173/#/dashboard/aluno/notas`

### 5. Verificar permissões

1. Faça login como `admin` ou `professor`
2. O sidebar **não** deve exibir "Minhas Notas"
3. A rota direta `#/dashboard/aluno/notas` deve cair no fallback do router

## Verificação pós-teste

- `tsc --noEmit` sem erros
- `npm run test` passa
- `_reversa_forward/005-aluno-notas/actions.md` com todas as ações marcadas `[X]`
- `_reversa_forward/005-aluno-notas/regression-watch.md` gerado
