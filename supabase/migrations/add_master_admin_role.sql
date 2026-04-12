-- ================================================================
-- MIGRATION: Perfil master_admin + Proteção da tabela instituicao
-- Execute no Supabase Dashboard > SQL Editor
-- Criado em: 2026-04-12
-- ATENÇÃO: Executar APÓS o create_instituicao.sql
-- ================================================================

-- ─────────────────────────────────────────────────────────────────
-- 1. Adicionar 'master_admin' como valor válido na constraint de perfil
--    (Se houver constraint de CHECK no campo perfil, precisa atualizá-la)
-- ─────────────────────────────────────────────────────────────────

-- Verificar se existe constraint (apenas informativo)
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'public.perfis'::regclass;

-- Se existir uma constraint tipo: CHECK (perfil IN ('admin', 'secretaria', ...))
-- Execute este comando para atualizá-la:
ALTER TABLE public.perfis
  DROP CONSTRAINT IF EXISTS perfis_perfil_check;

ALTER TABLE public.perfis
  ADD CONSTRAINT perfis_perfil_check
  CHECK (perfil IN ('master_admin', 'admin', 'secretaria', 'financeiro', 'professor', 'aluno'));

-- ─────────────────────────────────────────────────────────────────
-- 2. Atualizar o perfil do Adelino para master_admin
--    ATENÇÃO: Substitua o e-mail abaixo pelo e-mail real do Adelino
-- ─────────────────────────────────────────────────────────────────

UPDATE public.perfis
SET perfil = 'master_admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'afsjr@hotmail.com'
  LIMIT 1
);

-- Verificar se o update funcionou
SELECT p.id, p.nome_completo, p.perfil, u.email
FROM public.perfis p
JOIN auth.users u ON u.id = p.id
WHERE p.perfil = 'master_admin';

-- ─────────────────────────────────────────────────────────────────
-- 3. Atualizar RLS da tabela instituicao para exigir master_admin
--    (Remove a policy antiga que aceitava 'admin' e cria nova)
-- ─────────────────────────────────────────────────────────────────

-- Remover policies anteriores
DROP POLICY IF EXISTS "Apenas admin pode gerenciar a instituição" ON public.instituicao;
DROP POLICY IF EXISTS "Apenas admin pode gerenciar" ON public.instituicao;

-- Nova policy: apenas master_admin pode ESCREVER
CREATE POLICY "Apenas master_admin pode gerenciar a instituicao"
  ON public.instituicao FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND perfil = 'master_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND perfil = 'master_admin'
    )
  );

-- Policy de leitura permanece para todos os autenticados (necessário para PDFs)
DROP POLICY IF EXISTS "Leitura pública para usuários autenticados" ON public.instituicao;
DROP POLICY IF EXISTS "Leitura pública autenticada" ON public.instituicao;

CREATE POLICY "Leitura para usuarios autenticados"
  ON public.instituicao FOR SELECT
  TO authenticated
  USING (true);

-- ─────────────────────────────────────────────────────────────────
-- 4. Proteger o bucket de storage (logo) para escrita apenas por master_admin
-- ─────────────────────────────────────────────────────────────────

-- No Supabase Storage, vá em Policies do bucket 'instituicao-assets'
-- e crie uma policy de INSERT/UPDATE apenas para master_admin.
-- (Isso é feito via Dashboard, não via SQL diretamente)

-- ─────────────────────────────────────────────────────────────────
-- 5. Verificação Final
-- ─────────────────────────────────────────────────────────────────

SELECT
  p.nome_completo,
  p.perfil,
  u.email,
  CASE
    WHEN p.perfil = 'master_admin' THEN '✅ Proprietário do Sistema'
    WHEN p.perfil = 'admin'        THEN '🔵 Administrador'
    WHEN p.perfil = 'secretaria'   THEN '🟡 Secretaria'
    WHEN p.perfil = 'professor'    THEN '🟢 Professor'
    WHEN p.perfil = 'aluno'        THEN '⚪ Aluno'
    ELSE '❓ Desconhecido'
  END AS nivel_acesso
FROM public.perfis p
JOIN auth.users u ON u.id = p.id
ORDER BY
  CASE p.perfil
    WHEN 'master_admin' THEN 1
    WHEN 'admin'        THEN 2
    WHEN 'secretaria'   THEN 3
    WHEN 'financeiro'   THEN 4
    WHEN 'professor'    THEN 5
    WHEN 'aluno'        THEN 6
    ELSE 7
  END;
