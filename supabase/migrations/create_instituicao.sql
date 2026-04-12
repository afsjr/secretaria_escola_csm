-- ================================================================
-- MIGRATION: Tabela de Configurações da Instituição
-- Execute no Supabase Dashboard > SQL Editor
-- Criado em: 2026-04-12
-- Autor: SGE CSM Team
-- ================================================================

-- 1. Criar tabela
CREATE TABLE IF NOT EXISTS public.instituicao (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome         TEXT NOT NULL,
  cnpj         TEXT,
  email        TEXT,
  telefone     TEXT,
  site         TEXT,

  -- Endereço
  cep          TEXT,
  logradouro   TEXT,
  numero       TEXT,
  complemento  TEXT,
  bairro       TEXT,
  cidade       TEXT,
  uf           CHAR(2),

  -- Identidade Visual
  logo_url     TEXT,
  cor_primaria TEXT DEFAULT '#1E3A5F',

  -- Auditoria
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_instituicao_updated_at
  BEFORE UPDATE ON public.instituicao
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 3. RLS (Row Level Security)
ALTER TABLE public.instituicao ENABLE ROW LEVEL SECURITY;

-- Qualquer usuário autenticado pode LER os dados da instituição
CREATE POLICY "Leitura pública para usuários autenticados"
  ON public.instituicao FOR SELECT
  TO authenticated
  USING (true);

-- Apenas admins podem ESCREVER (INSERT/UPDATE/DELETE)
CREATE POLICY "Apenas admin pode gerenciar a instituição"
  ON public.instituicao FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND perfil = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND perfil = 'admin'
    )
  );

-- 4. Inserir dados iniciais do Colégio Santa Mônica
-- (Pode alterar os dados abaixo antes de executar)
INSERT INTO public.instituicao (
  nome, cnpj, email, telefone, site,
  cep, logradouro, numero, bairro, cidade, uf,
  cor_primaria
) VALUES (
  'Colégio Santa Mônica',
  '',
  'secretaria@csm.edu.br',
  '(81) 3621-0000',
  '',
  '55700-000',
  'Rua Principal',
  '123',
  'Centro',
  'Limoeiro',
  'PE',
  '#1E3A5F'
) ON CONFLICT DO NOTHING;

-- 5. Bucket para a logo (execute separadamente se não existir)
-- No Supabase Dashboard > Storage > New Bucket:
-- Nome: instituicao-assets
-- Público: SIM (para que a logo apareça nos PDFs)

-- ================================================================
-- VERIFICAÇÃO FINAL
-- ================================================================
SELECT 'Tabela instituicao criada com sucesso!' AS status;
SELECT * FROM public.instituicao LIMIT 1;
