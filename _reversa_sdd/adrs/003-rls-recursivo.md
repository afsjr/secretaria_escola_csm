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

---

## Status de Implementação

✅ Completo — helpers implementados, RLS funcionando para casos documentados.