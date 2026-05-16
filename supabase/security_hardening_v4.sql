-- =====================================================
-- SUPABASE SECURITY HARDENING v4 - CSM
-- Data: 16/05/2026
-- Foco: Novas tabelas (disciplinas_base, turma_disciplinas) e refino de acesso
-- =====================================================

-- 0. GARANTIR QUE A FUNÇÃO DE CHECAGEM EXISTA (AUTO-CONTIDO)
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

-- 1. ATIVAR RLS NAS NOVAS TABELAS
ALTER TABLE IF EXISTS public.disciplinas_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.turma_disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.aulas ENABLE ROW LEVEL SECURITY;

-- 2. LIMPAR POLÍTICAS CONFLITANTES (Prevenção de erro de duplicidade)
DROP POLICY IF EXISTS "View disciplinas_base authenticated" ON public.disciplinas_base;
DROP POLICY IF EXISTS "Admin manage disciplinas_base" ON public.disciplinas_base;
DROP POLICY IF EXISTS "View turma_disciplinas authenticated" ON public.turma_disciplinas;
DROP POLICY IF EXISTS "Admin manage turma_disciplinas" ON public.turma_disciplinas;
DROP POLICY IF EXISTS "Professores manage own turma_disciplinas" ON public.turma_disciplinas;
DROP POLICY IF EXISTS "View aulas authenticated" ON public.aulas;
DROP POLICY IF EXISTS "Professores manage own aulas" ON public.aulas;
DROP POLICY IF EXISTS "Admin manage all aulas" ON public.aulas;

-- 3. POLÍTICAS PARA: disciplinas_base (Catálogo)
-- Todos autenticados podem ver o catálogo
CREATE POLICY "View disciplinas_base authenticated" ON public.disciplinas_base
    FOR SELECT TO authenticated USING (true);

-- Apenas Admin/Secretaria pode alterar o catálogo
CREATE POLICY "Admin manage disciplinas_base" ON public.disciplinas_base
    FOR ALL TO authenticated USING (public.check_user_is_admin_or_secretaria());

-- 4. POLÍTICAS PARA: turma_disciplinas (Ofertas/Vínculos)
-- Todos autenticados podem ver as ofertas (necessário para boletins e grades)
CREATE POLICY "View turma_disciplinas authenticated" ON public.turma_disciplinas
    FOR SELECT TO authenticated USING (true);

-- Apenas Admin/Secretaria pode criar/remover ofertas
CREATE POLICY "Admin manage turma_disciplinas" ON public.turma_disciplinas
    FOR ALL TO authenticated USING (public.check_user_is_admin_or_secretaria());

-- 5. POLÍTICAS PARA: aulas (Registro de Classe)
-- Alunos podem ver aulas das turmas onde estão matriculados
CREATE POLICY "View aulas authenticated" ON public.aulas
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.matriculas m
            JOIN public.turma_disciplinas td ON td.turma_id = m.turma_id
            WHERE m.aluno_id = auth.uid() AND td.id = aulas.turma_disciplina_id
        ) OR public.check_user_is_admin_or_secretaria()
    );

-- Professores podem gerenciar apenas suas próprias aulas
CREATE POLICY "Professores manage own aulas" ON public.aulas
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.turma_disciplinas td
            WHERE td.id = aulas.turma_disciplina_id AND td.professor_id = auth.uid()
        )
    );

-- Admin/Secretaria pode gerenciar todas as aulas
CREATE POLICY "Admin manage all aulas" ON public.aulas
    FOR ALL TO authenticated USING (public.check_user_is_admin_or_secretaria());

-- 6. REFINO NA TABELA BOLETIM (Notas)
-- Drop da política antiga genérica
DROP POLICY IF EXISTS "Professores can manage grades" ON public.boletim;

-- Nova política: Professores só editam notas de alunos que estão em suas ofertas
CREATE POLICY "Professores manage specific grades" ON public.boletim
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.turma_disciplinas td
            JOIN public.matriculas m ON m.turma_id = td.turma_id
            WHERE td.professor_id = auth.uid() 
            AND m.aluno_id = boletim.aluno_id 
            AND td.disciplina_base_id = boletim.disciplina_base_id
        )
    );

-- 7. REVISÃO DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_aulas_turma_disciplina_id ON public.aulas(turma_disciplina_id);
CREATE INDEX IF NOT EXISTS idx_turma_disciplinas_prof_id ON public.turma_disciplinas(professor_id);
