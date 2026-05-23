-- =====================================================
-- RLS: PROFESSORES VEREM PERFIS DOS ALUNOS DAS TURMAS
-- Data: 23/05/2026
-- =====================================================
-- Motivação: Professores precisam ver id e nome_completo
-- dos alunos matriculados nas turmas que lecionam para
-- lançar notas no boletim.
--
-- Uso de SECURITY DEFINER para evitar recursão infinita:
-- A política do perfis referencia matriculas, que tem
-- políticas que referenciam perfis via a função
-- check_user_is_admin_or_secretaria(). A função SECURITY
-- DEFINER quebra o ciclo de recursão.
-- =====================================================

-- 1. FUNÇÃO AUXILIAR (SECURITY DEFINER) para evitar recursão RLS
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

-- 2. CRIAR POLÍTICA PARA PROFESSORES (usa a função SECURITY DEFINER)
DROP POLICY IF EXISTS "Professores view students from their turmas" ON public.perfis;

CREATE POLICY "Professores view students from their turmas" ON public.perfis
    FOR SELECT TO authenticated
    USING (public.check_professor_can_view_student(id));

-- 3. GARANTIR RLS ATIVO
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
