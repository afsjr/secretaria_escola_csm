-- =====================================================
-- NOTAS DE ESTÁGIO - SOLUÇÃO A
-- Aplicar no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. Adicionar colunas na tabela bulletin
-- =====================================================
ALTER TABLE bulletin ADD COLUMN IF NOT EXISTS nota_estagio TEXT CHECK (nota_estagio IN ('AP', 'REP'));
ALTER TABLE bulletin ADD COLUMN IF NOT EXISTS estagio_parecer TEXT;

-- =====================================================
-- 2. Adicionar tipo de curso (se não existir)
-- =====================================================
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'tecnico';
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS tipo TEXT CHECK (tipo IN ('saude', 'tecnico', 'outro'));

-- =====================================================
-- 3. Atualizar cursos de saúde existentes
-- =====================================================
UPDATE cursos SET tipo = 'saude' 
WHERE nome ILIKE '%enfermagem%' 
   OR nome ILIKE '%enfermeiro%'
   OR nome ILIKE '%enfermagem%'
   OR nome ILIKE '%enfermagem%';

-- =====================================================
-- 4. Criar índice para performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_boletim_estagio ON bulletin(aluno_id, disciplina);

-- =====================================================
-- 5. Verificar colunas criadas
-- =====================================================
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'boletim' 
AND column_name IN ('nota_estagio', 'estagio_parecer');