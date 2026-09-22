-- =====================================================
-- Prevenção de duplicidade — CPF único e matrícula única
-- Data: 2026-09-22
-- Executar no SQL Editor do Supabase (role postgres).
-- =====================================================
-- Contexto: a deduplicação (scripts/dedup-merge.mjs) desativou as contas
-- duplicadas (status='inativo', cadastro_desativado=true). Este script
-- impede a reincidência de novas contas/matrículas duplicadas.
-- =====================================================

-- 1) RPC para o autocadastro verificar CPF sem depender de RLS.
--    Retorna apenas booleano (não expõe dados pessoais).
CREATE OR REPLACE FUNCTION public.cpf_ja_existe(p_cpf text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.perfis
    WHERE regexp_replace(coalesce(cpf, ''), '\D', '', 'g') = regexp_replace(coalesce(p_cpf, ''), '\D', '', 'g')
      AND regexp_replace(coalesce(p_cpf, ''), '\D', '', 'g') <> ''
      AND coalesce(status, '') <> 'inativo'
      AND coalesce(cadastro_desativado, false) = false
  );
$$;

REVOKE ALL ON FUNCTION public.cpf_ja_existe(text) FROM public;
GRANT EXECUTE ON FUNCTION public.cpf_ja_existe(text) TO anon, authenticated;

-- 2) Índice único de matrícula ativa por (aluno, turma).
--    Impede o mesmo aluno duas vezes na mesma turma.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_matriculas_aluno_turma_ativa
  ON public.matriculas (aluno_id, turma_id)
  WHERE status_aluno = 'ativo';

-- 3) Índice único de CPF (somente dígitos) entre contas ATIVAS.
--    Contas desativadas (status='inativo') ficam de fora, permitindo
--    rematrícula futura da mesma pessoa.
--    Só é criado quando não houver mais CPF duplicado ativo; caso contrário,
--    emite um aviso e não cria (resolva os grupos pendentes e rode de novo).
DO $$
DECLARE
  n integer;
BEGIN
  SELECT count(*) INTO n FROM (
    SELECT regexp_replace(cpf, '\D', '', 'g') AS c
    FROM public.perfis
    WHERE cpf IS NOT NULL
      AND regexp_replace(cpf, '\D', '', 'g') <> ''
      AND coalesce(status, '') <> 'inativo'
      AND coalesce(cadastro_desativado, false) = false
    GROUP BY 1
    HAVING count(*) > 1
  ) x;

  IF n > 0 THEN
    RAISE NOTICE 'Indice unico de CPF NAO criado: % CPF(s) ainda duplicado(s) entre contas ativas.', n;
  ELSE
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS uniq_perfis_cpf_ativo '
         || 'ON public.perfis ((regexp_replace(cpf, ''\D'', '''', ''g''))) '
         || 'WHERE cpf IS NOT NULL '
         || 'AND regexp_replace(cpf, ''\D'', '''', ''g'') <> '''' '
         || 'AND coalesce(status, '''') <> ''inativo'' '
         || 'AND coalesce(cadastro_desativado, false) = false';
    RAISE NOTICE 'Indice unico de CPF ativo criado com sucesso.';
  END IF;
END $$;

-- =====================================================
-- Verificação (rode depois):
--   SELECT regexp_replace(cpf,'\D','','g') cpf_dig, count(*)
--   FROM perfis
--   WHERE coalesce(status,'') <> 'inativo' AND coalesce(cadastro_desativado,false)=false
--   GROUP BY 1 HAVING count(*) > 1;
-- =====================================================
