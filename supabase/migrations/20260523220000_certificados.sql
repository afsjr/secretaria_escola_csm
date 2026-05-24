  -- Certificados: tabelas, índices e RLS
  -- Data: 2026-05-23

  -- =====================================================
  -- Tabela: certificados_modelos
  -- =====================================================
  CREATE TABLE certificados_modelos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    tipo_curso text NOT NULL CHECK (tipo_curso IN ('tecnico', 'formacao')),
    logo_path text,
    assinatura_path text,
    ativo boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
  );

  ALTER TABLE certificados_modelos ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "certificados_modelos_select_policy" ON certificados_modelos
    FOR SELECT TO authenticated USING (true);

  CREATE POLICY "certificados_modelos_insert_policy" ON certificados_modelos
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil = 'master_admin'));

  CREATE POLICY "certificados_modelos_update_policy" ON certificados_modelos
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil = 'master_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil = 'master_admin'));

  CREATE POLICY "certificados_modelos_delete_policy" ON certificados_modelos
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil = 'master_admin'));

  -- =====================================================
  -- Tabela: conteudo_programatico
  -- =====================================================
  CREATE TABLE conteudo_programatico (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    curso_id uuid NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    disciplina text NOT NULL,
    carga_horaria int NOT NULL,
    modulo text,
    ordem int DEFAULT 0,
    created_at timestamptz DEFAULT now()
  );

  ALTER TABLE conteudo_programatico ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "conteudo_programatico_select_policy" ON conteudo_programatico
    FOR SELECT TO authenticated USING (true);

  CREATE POLICY "conteudo_programatico_insert_policy" ON conteudo_programatico
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
      SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil IN ('master_admin', 'admin', 'secretaria')
    ));

  CREATE POLICY "conteudo_programatico_update_policy" ON conteudo_programatico
    FOR UPDATE TO authenticated
    USING (EXISTS (
      SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil IN ('master_admin', 'admin', 'secretaria')
    ));

  CREATE POLICY "conteudo_programatico_delete_policy" ON conteudo_programatico
    FOR DELETE TO authenticated
    USING (EXISTS (
      SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil IN ('master_admin', 'admin', 'secretaria')
    ));

  -- =====================================================
  -- Tabela: certificados
  -- =====================================================
  CREATE TABLE certificados (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id uuid NOT NULL REFERENCES perfis(id),
    curso_id uuid NOT NULL REFERENCES cursos(id),
    data_conclusao date NOT NULL,
    carga_horaria int NOT NULL,
    codigo_autenticacao text UNIQUE NOT NULL,
    emitido_por uuid NOT NULL REFERENCES perfis(id),
    emitido_em timestamptz DEFAULT now(),
    template_id uuid REFERENCES certificados_modelos(id)
  );

  ALTER TABLE certificados ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "certificados_select_aluno" ON certificados
    FOR SELECT TO authenticated
    USING (aluno_id = auth.uid());

  CREATE POLICY "certificados_select_admin" ON certificados
    FOR SELECT TO authenticated
    USING (EXISTS (
      SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil IN ('master_admin', 'admin', 'secretaria')
    ));

  CREATE POLICY "certificados_insert_policy" ON certificados
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (
      SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil IN ('master_admin', 'admin', 'secretaria')
    ));

  -- Índices
  CREATE INDEX idx_certificados_aluno ON certificados(aluno_id);
  CREATE INDEX idx_certificados_curso ON certificados(curso_id);
  CREATE INDEX idx_certificados_codigo ON certificados(codigo_autenticacao);
  CREATE INDEX idx_conteudo_programatico_curso ON conteudo_programatico(curso_id);
  CREATE INDEX idx_certificados_modelos_ativo ON certificados_modelos(ativo);

  -- Bucket de imagens (criado via storage API)
  -- SELECT storage.create_bucket('certificados-imagens', { public: false });
  -- As RLS policies do bucket são gerenciadas via dashboard do Supabase.
