-- Configuração do Storage para certificados
-- Execute no SQL Editor do Supabase

-- Criar bucket (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificados-imagens', 'certificados-imagens', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: apenas master_admin pode fazer upload/delete
CREATE POLICY "certificados_imagens_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'certificados-imagens');

CREATE POLICY "certificados_imagens_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'certificados-imagens'
    AND EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil = 'master_admin')
  );

CREATE POLICY "certificados_imagens_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'certificados-imagens'
    AND EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil = 'master_admin')
  );
