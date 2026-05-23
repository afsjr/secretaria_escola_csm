# ADR 003: RLS Recursivo com Helper Functions

> **Status:** ACEITO
> **Data:** 2026-04-10
> **Autor:** Evidência via Git commits

## Contexto

O PostgreSQL RLS (Row Level Security) do Supabase não suporta JOINs entre tabelas com RLS habilitado — causa recursão infinita.

**Evidência:**
```bash
97f0070 fix: resolve RLS recursion by implementing secure helper functions
```

## Decisão

Criar **Helper Functions** (RPCs) que executam com contexto de segurança elevado (security definer) para queries que precisam de dados de múltiplas tabelas.

### Implementação

```sql
-- Exemplo: get_user_profile(user_id)
-- Executa como security definer
-- Retorna perfil sem filtrar RLS do chamador
```

### Evidência no Código

```typescript
// session.ts:94-106
async getUserProfile(userId?: string) {
  const targetId = userId || (await getSession()).session?.user?.id
  const { data, error } = await supabase
    .from("perfis")
    .select("*")
    .eq("id", targetId)
    .single()
}
```

## Alternativas Consideradas

1. **Desabilitar RLS** — Rejeitado por segurança
2. **Policies por tabela** — Rejeitado por não resolver JOINs

## Consequências

### Positivas
- ✅ RLS funciona para queries simples
- ✅ Queries complexas resolvidas via helpers
- ✅ Código mais explícito

### Negativas
- ❌ Novos helpers precisam ser criados conforme necessidade
- ❌ Documentação de quais queries usam quais helpers

### Caso Concreto: Professor vê alunos das próprias turmas

Em 2026-05-23, uma nova helper function foi criada para resolver recursão RLS:

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

**Problema resolvido:** Professor não conseguia ver `perfis` dos alunos via JOIN em `matriculas` — o RLS da tabela `perfis` bloqueava o SELECT, e tentar usar subquery inline causava recursão infinita (`perfis` policy → `matriculas` RLS → `check_user_is_admin_or_secretaria()` → `perfis`).

**Solução:** A função `check_professor_can_view_student` roda como SECURITY DEFINER, quebrando o ciclo. A política RLS na tabela `perfis` chama esta função:

```sql
CREATE POLICY "Professores view students from their turmas" ON public.perfis
    FOR SELECT TO authenticated
    USING (public.check_professor_can_view_student(id));
```

**Migrações:**
- `supabase/migrations/20260523145009_rls_professor_perfis.sql`
- `supabase/migrations/20260523145100_fix_rls_professor_perfis.sql`

---

## Status de Implementação

✅ Completo — helpers implementados, RLS funcionando para casos documentados.