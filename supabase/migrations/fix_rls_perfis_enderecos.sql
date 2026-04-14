-- =====================================================
-- CORREÇÃO RLS - PERFIS_ENDERECOS
-- Execute no SQL Editor do Supabase
-- =====================================================

-- 1. Remover política anterior
DROP POLICY IF EXISTS "Usuários podem gerenciar seu próprio endereço" ON perfis_enderecos;

-- 2. Criar política permissiva: qualquer usuário autenticado
CREATE POLICY "Usuários autenticados podem gerenciar endereços" ON perfis_enderecos
    FOR ALL 
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- VERIFICAR POLÍTICAS RLS EXISTENTES
-- =====================================================

SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;