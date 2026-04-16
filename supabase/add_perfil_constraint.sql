-- Migration: Adicionar constraint CHECK na coluna perfil
-- Executar via Supabase SQL Editor ou via CLI: supabase db execute -f supabase/add_perfil_constraint.sql

-- Verifica se a constraint já existe antes de adicionar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'perfil_check'
    ) THEN
        ALTER TABLE public.perfis
        ADD CONSTRAINT perfil_check
        CHECK (perfil IN ('admin', 'master_admin', 'secretaria', 'coordenacao', 'financeiro', 'professor', 'aluno'));

        RAISE NOTICE 'Constraint perfil_check adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Constraint perfil_check já existe';
    END IF;
END $$;

-- Commit automático