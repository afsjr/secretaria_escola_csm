  -- =====================================================
  -- FIX RLS: perfis e tabelas órfãs sem RLS
  -- Data: 21/05/2026
  -- =====================================================

  -- 1. ATIVAR RLS
  ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS diarios_classe ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS horarios ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS notas_faltas ENABLE ROW LEVEL SECURITY;

  -- 2. LIMPAR POLÍTICAS ANTIGAS (evitar conflito)
  DROP POLICY IF EXISTS "Admin/Secretaria total access" ON perfis;
  DROP POLICY IF EXISTS "Users can view own profile" ON perfis;
  DROP POLICY IF EXISTS "Users can update own profile" ON perfis;
  DROP POLICY IF EXISTS "Admin/Secretaria perfis access" ON perfis;
  DROP POLICY IF EXISTS "Users view own perfil" ON perfis;
  DROP POLICY IF EXISTS "Users update own perfil" ON perfis;

  -- 3. POLÍTICAS PARA perfis
  -- Admin/Secretaria/Financeiro/Master podem TUDO
  CREATE POLICY "Admin/Secretaria full access" ON perfis
    FOR ALL TO authenticated
    USING (check_user_is_admin_or_secretaria());

  -- Usuários comuns veem apenas o próprio perfil
  CREATE POLICY "Users view own profile" ON perfis
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

  -- Usuários comuns editam apenas dados próprios (não perfil de acesso)
  CREATE POLICY "Users update own data" ON perfis
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

  -- 4. POLÍTICAS PARA tabelas órfãs (bloquear tudo exceto admin)
  DROP POLICY IF EXISTS "Block all diarios_classe" ON diarios_classe;
  CREATE POLICY "Block all diarios_classe" ON diarios_classe
    FOR ALL TO authenticated
    USING (check_user_is_admin_or_secretaria());

  DROP POLICY IF EXISTS "Block all horarios" ON horarios;
  CREATE POLICY "Block all horarios" ON horarios
    FOR ALL TO authenticated
    USING (check_user_is_admin_or_secretaria());

  DROP POLICY IF EXISTS "Block all notas_faltas" ON notas_faltas;
  CREATE POLICY "Block all notas_faltas" ON notas_faltas
    FOR ALL TO authenticated
    USING (check_user_is_admin_or_secretaria());
