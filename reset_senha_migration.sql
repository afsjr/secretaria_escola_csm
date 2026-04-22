-- Migration: Adicionar coluna primeiro_acesso na tabela perfis
-- Executar no Supabase SQL Editor

-- 1. Adicionar coluna primeiro_acesso (boolean, default true para novos cadastros)
ALTER TABLE perfis 
ADD COLUMN IF NOT EXISTS primeiro_acesso BOOLEAN DEFAULT true;

-- 2. Atualizar todos os usuários existentes para false (já definiram senha)
UPDATE perfis SET primeiro_acesso = false WHERE primeiro_acesso IS NULL;

-- 3. Habilitar RLS na coluna (opcional)
-- ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- 4. Verificar resultado
SELECT id, nome_completo, perfil, primeiro_acesso FROM perfis LIMIT 10;
