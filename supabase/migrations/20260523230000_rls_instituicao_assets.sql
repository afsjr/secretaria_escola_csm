-- =====================================================
-- RLS Policies para bucket 'instituicao-assets'
-- Permite upload/update/delete apenas para admins
-- =====================================================

-- Permitir leitura pública (para logos serem exibidas nos PDFs)
CREATE POLICY "Public read access for instituicao-assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'instituicao-assets');

-- Permitir upload apenas para admins
CREATE POLICY "Admin upload for instituicao-assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'instituicao-assets'
  AND auth.uid() IN (
    SELECT id FROM perfis WHERE perfil = 'admin'
  )
);

-- Permitir update apenas para admins
CREATE POLICY "Admin update for instituicao-assets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'instituicao-assets'
  AND auth.uid() IN (
    SELECT id FROM perfis WHERE perfil = 'admin'
  )
);

-- Permitir delete apenas para admins
CREATE POLICY "Admin delete for instituicao-assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'instituicao-assets'
  AND auth.uid() IN (
    SELECT id FROM perfis WHERE perfil = 'admin'
  )
);
