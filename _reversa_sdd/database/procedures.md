# Stored Procedures e Functions — Sistema CSM

> 🟢 **CONFIRMADO** — Extraído de `schema.sql` v4.0 e `migration.sql`
> Banco: Supabase (PostgreSQL) — todas as funções estão no schema `public`

---

## Funções Registradas

| # | Nome | Tipo | Retorno | Segurança | Tabelas Envolvidas |
|---|------|------|---------|-----------|-------------------|
| 1 | `increment_versao` | Trigger Function | TRIGGER | INVOKER | `boletim`, `perfis`, `disciplinas`, `turmas`, `cursos` |
| 2 | `handle_new_user` | Trigger Function | TRIGGER | DEFINER | `perfis` |
| 3 | `check_user_is_admin_or_secretaria` | Helper Function | BOOLEAN | DEFINER | `perfis` |
| 4 | `check_professor_can_view_student` | Helper Function | BOOLEAN | DEFINER | `turma_disciplinas`, `matriculas` |

---

## 1. increment_versao()

**Propósito:** Implementar Optimistic Locking (Bloqueio Otimista) — detecta e previne conflitos de edição simultânea.

```sql
CREATE OR REPLACE FUNCTION increment_versao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.versao := OLD.versao + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**Parâmetros:** Nenhum (trigger function — recebe OLD/NEW implicitamente)

**Lógica:**
- Ao atualizar um registro, incrementa `versao` automaticamente
- O trigger só dispara quando `OLD.versao IS NOT DISTINCT FROM NEW.versao` (o frontend não alterou a versão)
- Se o frontend enviar `versao` diferente da armazenada → o trigger não dispara → UPDATE retorna 0 linhas → conflito detectado

**Triggers associados:**

| Trigger | Tabela | Evento | Condição |
|---------|--------|--------|----------|
| `trigger_increment_versao_boletim` | `boletim` | BEFORE UPDATE | OLD.versao = NEW.versao |
| `trigger_increment_versao_perfis` | `perfis` | BEFORE UPDATE | OLD.versao = NEW.versao |
| `trigger_increment_versao_disciplinas` | `disciplinas` | BEFORE UPDATE | OLD.versao = NEW.versao |
| `trigger_increment_versao_turmas` | `turmas` | BEFORE UPDATE | OLD.versao = NEW.versao |
| `trigger_increment_versao_cursos` | `cursos` | BEFORE UPDATE | OLD.versao = NEW.versao |

---

## 2. handle_new_user()

**Propósito:** Criar automaticamente um perfil de aluno para cada novo usuário registrado no Supabase Auth.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfis (id, email, nome_completo, perfil, primeiro_acesso)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    'aluno',
    TRUE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Parâmetros:** Nenhum (trigger function — recebe `new` de `auth.users`)

**Lógica:**
- Disparada AFTER INSERT em `auth.users`
- Lê `raw_user_meta_data->>'full_name'` do JWT/metadata do Auth
- Se não houver nome, usa `'Novo Usuário'` como fallback
- `ON CONFLICT (id) DO NOTHING` previne erro se o perfil já existir (ex.: import manual)
- Perfil criado sempre como `'aluno'` com `primeiro_acesso = TRUE`

**Trigger associado:**

| Trigger | Tabela alvo | Evento |
|---------|-------------|--------|
| `on_auth_user_created` | `auth.users` | AFTER INSERT FOR EACH ROW |

---

## 3. check_user_is_admin_or_secretaria()

**Propósito:** Guard de autorização reutilizável para políticas RLS — evita recursão infinita.

```sql
CREATE OR REPLACE FUNCTION public.check_user_is_admin_or_secretaria()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.perfis
        WHERE id = auth.uid()
        AND perfil IN ('admin', 'secretaria', 'master_admin', 'financeiro')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

**Parâmetros:** Nenhum

**Retorno:** TRUE se o usuário autenticado tem perfil administrativo, FALSE caso contrário

**Segurança:** `SECURITY DEFINER` + `SET search_path = public`
- Executa com os privilégios do owner da função (não do usuário chamador)
- Evita recursão: policies de `perfis` chamariam `perfis` novamente sem SECURITY DEFINER

**Tabelas acessadas (somente leitura):** `public.perfis`

**Usada em:** ~12 políticas RLS nas tabelas `perfis`, `boletim`, `matriculas`, `solicitacoes`, `cursos`, `turmas`, `disciplinas`, `aulas`, `disciplinas_base`, `turma_disciplinas`

**Versões da função:**

| Data | Perfis autorizados |
|------|-------------------|
| 2026-05-16 (rls_fix.sql) | `admin`, `secretaria`, `master_admin` |
| 2026-05-16 (security_hardening_v4.sql) | `admin`, `secretaria`, `master_admin`, **`financeiro`** |

> 🟡 A versão vigente é a do `security_hardening_v4.sql` (inclui `financeiro`).

---

## 4. check_professor_can_view_student(student_id UUID)

**Propósito:** Verificar se um professor tem acesso a um aluno específico — para RLS em `perfis`.

```sql
CREATE OR REPLACE FUNCTION public.check_professor_can_view_student(student_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.turma_disciplinas td
        JOIN public.matriculas m ON m.turma_id = td.turma_id
        WHERE td.professor_id = auth.uid()
        AND m.aluno_id = student_id
    );
END;
$$;
```

**Parâmetros:**
| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `student_id` | UUID | ID do aluno a verificar |

**Retorno:** TRUE se o professor autenticado leciona em alguma turma onde o aluno está matriculado

**Lógica de join:**
```
turma_disciplinas (professor_id = auth.uid())
  JOIN matriculas ON matriculas.turma_id = turma_disciplinas.turma_id
  WHERE matriculas.aluno_id = student_id
```

**Tabelas acessadas (somente leitura):** `turma_disciplinas`, `matriculas`

**Usada em:** Política `Professores view students from their turmas` em `public.perfis`

**Criada em:** Migration `20260523145009_rls_professor_perfis.sql` (2026-05-23)

---

## Sem Stored Procedures / Views

> 🟢 O sistema **não utiliza** stored procedures com lógica de negócio complexa (INSERT/UPDATE/DELETE encapsulados).
> Toda a lógica de escrita fica no frontend (TypeScript/React) via Supabase JS client.

> 🔴 **LACUNA** — Não há views materializadas. O cálculo de situação do aluno (aprovado/reprovado por média) e de inadimplência (juros + multa) são feitos **no frontend via iteração manual** — conforme gap identificado pelo Archaeologist.
