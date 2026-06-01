-- =====================================================
-- MIGRATION: Frequencia table RLS policies
-- Data: 2026-05-29
-- Execute no SQL Editor do Supabase APÓS criar a tabela
-- =====================================================

-- 1. Ativar RLS
ALTER TABLE frequencia ENABLE ROW LEVEL SECURITY;

-- 2. Políticas
DROP POLICY IF EXISTS "Admin/Secretaria full access" ON frequencia;
CREATE POLICY "Admin/Secretaria full access" ON frequencia
  FOR ALL TO authenticated
  USING (check_user_is_admin_or_secretaria());

DROP POLICY IF EXISTS "Professores manage frequencia" ON frequencia;
CREATE POLICY "Professores manage frequencia" ON frequencia
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil = 'professor')
  );

DROP POLICY IF EXISTS "Students view own frequencia" ON frequencia;
CREATE POLICY "Students view own frequencia" ON frequencia
  FOR SELECT TO authenticated
  USING (auth.uid() = aluno_id);

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_frequencia_aula ON frequencia(aula_id);
CREATE INDEX IF NOT EXISTS idx_frequencia_aluno ON frequencia(aluno_id);
