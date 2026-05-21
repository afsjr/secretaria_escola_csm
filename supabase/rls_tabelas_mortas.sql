-- =====================================================
-- RLS para tabelas órfãs (sem uso no app atual)
-- Data: 21/05/2026
-- =====================================================

ALTER TABLE IF EXISTS diarios_classe ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notas_faltas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Block all diarios_classe" ON diarios_classe;
CREATE POLICY "Block all diarios_classe" ON diarios_classe
  FOR ALL TO authenticated
  USING (public.check_user_is_admin_or_secretaria());

DROP POLICY IF EXISTS "Block all horarios" ON horarios;
CREATE POLICY "Block all horarios" ON horarios
  FOR ALL TO authenticated
  USING (public.check_user_is_admin_or_secretaria());

DROP POLICY IF EXISTS "Block all notas_faltas" ON notas_faltas;
CREATE POLICY "Block all notas_faltas" ON notas_faltas
  FOR ALL TO authenticated
  USING (public.check_user_is_admin_or_secretaria());
