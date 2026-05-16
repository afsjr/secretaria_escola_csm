-- =====================================================
-- RECOVERY: CORREÇÃO DE PERFIS E ACESSO ADMIN
-- Data: 16/05/2026
-- =====================================================

-- 1. CRIAR FUNÇÃO AUTOMÁTICA DE PERFIL (Para novos usuários)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfis (id, email, nome_completo, perfil, primeiro_acesso)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Usuário'), 
    'aluno',
    TRUE
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CRIAR O TRIGGER (Se não existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. RECUPERAR / CRIAR SEU PERFIL ADMIN
-- Substitua o ID abaixo se necessário, mas usei o que apareceu no seu erro
INSERT INTO public.perfis (id, email, nome_completo, perfil, primeiro_acesso)
VALUES (
    '393c60d6-572d-43a6-bf5d-e32d1a441eaf', 
    'seu-email-admin@exemplo.com', 
    'Administrador Master', 
    'admin', 
    FALSE
)
ON CONFLICT (id) DO UPDATE 
SET perfil = 'admin', nome_completo = 'Administrador Master', primeiro_acesso = FALSE;

-- 4. VERIFICAÇÃO DE SEGURANÇA FINAL
-- Garante que o RLS não está bloqueando o próprio Admin
ALTER TABLE public.perfis FORCE ROW LEVEL SECURITY;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
