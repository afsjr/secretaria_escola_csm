-- =====================================================
-- FIX SUPABASE: RECURSIVIDADE RLS + COLUNAS FALTANTES (v3)
-- Data: 16/05/2026
-- =====================================================

-- 1. ADICIONAR COLUNAS FALTANTES NA TABELA PERFIS
ALTER TABLE IF EXISTS public.perfis 
ADD COLUMN IF NOT EXISTS primeiro_acesso BOOLEAN DEFAULT TRUE;

ALTER TABLE IF EXISTS public.perfis 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 2. CRIAR FUNÇÃO PARA VERIFICAR PERFIL SEM RECURSÃO (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.check_user_is_admin_or_secretaria()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.perfis 
        WHERE id = auth.uid() 
        AND perfil IN ('admin', 'secretaria', 'master_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. LIMPAR POLÍTICAS ANTIGAS (DROP ANTES DE CREATE)
DROP POLICY IF EXISTS "Admin/Secretaria total access" ON perfis;
DROP POLICY IF EXISTS "Users can view own profile" ON perfis;
DROP POLICY IF EXISTS "Users can update own profile" ON perfis;
DROP POLICY IF EXISTS "Admin/Secretaria boletim access" ON boletim;
DROP POLICY IF EXISTS "Professores can manage grades" ON boletim;
DROP POLICY IF EXISTS "Students view own grades" ON boletim;
DROP POLICY IF EXISTS "Admin/Secretaria matriculas access" ON matriculas;
DROP POLICY IF EXISTS "Students view own matriculas" ON matriculas;
DROP POLICY IF EXISTS "Admin/Secretaria solicitacoes access" ON solicitacoes;
DROP POLICY IF EXISTS "Students manage own requests" ON solicitacoes;
DROP POLICY IF EXISTS "Admin manage courses" ON cursos;
DROP POLICY IF EXISTS "Admin manage turmas" ON turmas;
DROP POLICY IF EXISTS "Admin manage disciplinas" ON disciplinas;
DROP POLICY IF EXISTS "View tables authenticated" ON cursos;
DROP POLICY IF EXISTS "View turmas authenticated" ON turmas;
DROP POLICY IF EXISTS "View disciplinas authenticated" ON disciplinas;
DROP POLICY IF EXISTS "Admin manage technical tables" ON cursos;

-- 4. RECRIAR POLÍTICAS USANDO A FUNÇÃO SEGURA

-- PERFIS
CREATE POLICY "Admin/Secretaria total access" ON perfis FOR ALL TO authenticated USING (check_user_is_admin_or_secretaria());
CREATE POLICY "Users can view own profile" ON perfis FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON perfis FOR UPDATE TO authenticated USING (auth.uid() = id);

-- BOLETIM
CREATE POLICY "Admin/Secretaria boletim access" ON boletim FOR ALL TO authenticated USING (check_user_is_admin_or_secretaria());
CREATE POLICY "Professores can manage grades" ON boletim FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND perfil = 'professor'));
CREATE POLICY "Students view own grades" ON boletim FOR SELECT TO authenticated USING (auth.uid() = aluno_id);

-- MATRICULAS
CREATE POLICY "Admin/Secretaria matriculas access" ON matriculas FOR ALL TO authenticated USING (check_user_is_admin_or_secretaria());
CREATE POLICY "Students view own matriculas" ON matriculas FOR SELECT TO authenticated USING (auth.uid() = aluno_id);

-- SOLICITACOES
CREATE POLICY "Admin/Secretaria solicitacoes access" ON solicitacoes FOR ALL TO authenticated USING (check_user_is_admin_or_secretaria());
CREATE POLICY "Students manage own requests" ON solicitacoes FOR ALL TO authenticated USING (auth.uid() = user_id);

-- TABELAS TÉCNICAS
CREATE POLICY "Admin manage courses" ON cursos FOR ALL TO authenticated USING (check_user_is_admin_or_secretaria());
CREATE POLICY "Admin manage turmas" ON turmas FOR ALL TO authenticated USING (check_user_is_admin_or_secretaria());
CREATE POLICY "Admin manage disciplinas" ON disciplinas FOR ALL TO authenticated USING (check_user_is_admin_or_secretaria());

CREATE POLICY "View tables authenticated" ON cursos FOR SELECT TO authenticated USING (true);
CREATE POLICY "View turmas authenticated" ON turmas FOR SELECT TO authenticated USING (true);
CREATE POLICY "View disciplinas authenticated" ON disciplinas FOR SELECT TO authenticated USING (true);

-- 5. GARANTIR RLS ATIVO
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis_enderecos ENABLE ROW LEVEL SECURITY;
ALTER TABLE boletim ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS PARA perfis_enderecos
DROP POLICY IF EXISTS "Admin/Secretaria perfis_enderecos access" ON perfis_enderecos;
DROP POLICY IF EXISTS "Users view own endereco" ON perfis_enderecos;
DROP POLICY IF EXISTS "Users manage own endereco" ON perfis_enderecos;

CREATE POLICY "Admin/Secretaria perfis_enderecos access" ON perfis_enderecos FOR ALL TO authenticated USING (check_user_is_admin_or_secretaria());
CREATE POLICY "Users view own endereco" ON perfis_enderecos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage own endereco" ON perfis_enderecos FOR ALL TO authenticated USING (auth.uid() = user_id);
