-- =====================================================
-- SCHEMA DO SISTEMA DE GESTÃO ESCOLAR CSM
-- Versão: 4.0 - Atualizado em 2026-05-21
-- =====================================================
-- Este arquivo documenta a estrutura ATUAL do banco de dados.
-- Reflete o estado real verificado via information_schema.
-- Para migrações, use arquivos separados em supabase/
-- =====================================================

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

CREATE TABLE IF NOT EXISTS perfis (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo TEXT NOT NULL,
    email TEXT NOT NULL,
    cpf TEXT,
    telefone TEXT,
    perfil TEXT DEFAULT 'aluno', -- 'aluno', 'admin', 'secretaria', 'professor', 'financeiro', 'coordenacao', 'master_admin'
    bloqueio_financeiro BOOLEAN DEFAULT FALSE,
    data_nascimento DATE,
    genero TEXT,
    estado_civil TEXT,
    cidade_natal TEXT,
    nacionalidade TEXT DEFAULT 'Brasileira',
    profissao TEXT,
    graduacao TEXT,
    data_conclusao_graduacao DATE,
    rg TEXT,
    orgao_expedidor TEXT,
    data_expedicao_rg DATE,
    whatsapp TEXT,
    primeiro_acesso BOOLEAN DEFAULT TRUE,
    versao INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS perfis_enderecos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
    cep TEXT,
    logradouro TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    uf TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    tipo TEXT DEFAULT 'tecnico' CHECK (tipo IN ('saude', 'tecnico', 'outro', 'formacao')),
    ativo BOOLEAN DEFAULT TRUE,
    versao INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS turmas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    periodo TEXT NOT NULL,
    status_ingresso TEXT DEFAULT 'aberta',
    curso_id UUID REFERENCES cursos(id) ON DELETE SET NULL,
    versao INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS disciplinas_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    modulo TEXT,
    curso_id UUID REFERENCES cursos(id),
    carga_horaria INTEGER DEFAULT 40,
    ordem INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS turma_disciplinas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turma_id UUID REFERENCES turmas(id),
    disciplina_base_id UUID REFERENCES disciplinas_base(id),
    professor_id UUID REFERENCES perfis(id),
    data_inicio DATE,
    data_fim DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_turma_disciplina UNIQUE (turma_id, disciplina_base_id)
);

CREATE TABLE IF NOT EXISTS matriculas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
    turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
    status_aluno TEXT DEFAULT 'ativo',
    data_matricula DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS boletim (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
    disciplina TEXT NOT NULL,
    disciplina_base_id UUID REFERENCES disciplinas_base(id),
    faltas INTEGER DEFAULT 0,
    n1 DECIMAL DEFAULT 0,
    n2 DECIMAL DEFAULT 0,
    n3 DECIMAL DEFAULT 0,
    rec DECIMAL DEFAULT 0,
    nota_estagio TEXT CHECK (nota_estagio IN ('AP', 'REP')),
    estagio_parecer TEXT,
    status TEXT DEFAULT NULL,
    versao INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(aluno_id, disciplina)
);

CREATE TABLE IF NOT EXISTS aulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disciplina_id UUID REFERENCES disciplinas(id) ON DELETE CASCADE,
    turma_disciplina_id UUID REFERENCES turma_disciplinas(id),
    professor_id UUID REFERENCES perfis(id) ON DELETE SET NULL,
    data DATE NOT NULL,
    conteudo TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS solicitacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    status TEXT DEFAULT 'pendente',
    criado_em TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELAS LEGADO (NÃO USADAS NO CÓDIGO ATUAL)
-- =====================================================

CREATE TABLE IF NOT EXISTS disciplinas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    modulo TEXT,
    turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES perfis(id) ON DELETE SET NULL,
    curso_id UUID REFERENCES cursos(id) ON DELETE SET NULL,
    versao INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELAS DE SUPORTE
-- =====================================================

CREATE TABLE IF NOT EXISTS responsaveis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    cpf TEXT,
    telefone TEXT,
    email TEXT,
    parentesco TEXT,
    financeiro BOOLEAN DEFAULT FALSE,
    principal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS observacoes_aluno (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    categoria TEXT,
    criado_por UUID REFERENCES perfis(id),
    criado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES perfis(id),
    usuario_nome TEXT,
    usuario_perfil TEXT,
    acao TEXT NOT NULL,
    tabela_afetada TEXT,
    registro_id UUID,
    descricao TEXT,
    dados_antigos JSONB,
    dados_novos JSONB,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELAS DO MÓDULO FINANCEIRO
-- =====================================================

CREATE TABLE IF NOT EXISTS pagamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    valor_original DECIMAL(10,2) NOT NULL,
    valor_pago DECIMAL(10,2),
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status TEXT DEFAULT 'pendente',
    metodo_pagamento TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financeiro_acordos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
    total_debito DECIMAL(10,2) NOT NULL,
    total_com_desconto DECIMAL(10,2) NOT NULL,
    numero_parcelas INTEGER NOT NULL,
    valor_parcela DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'ativo',
    termo_assinado_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financeiro_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chave TEXT UNIQUE NOT NULL,
    valor DECIMAL(10,4) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_cursos_ativo ON cursos(ativo);
CREATE INDEX IF NOT EXISTS idx_turmas_curso ON turmas(curso_id);
CREATE INDEX IF NOT EXISTS idx_disciplinas_curso ON disciplinas(curso_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_aluno ON matriculas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_turma ON matriculas(turma_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_status ON matriculas(status_aluno);
CREATE INDEX IF NOT EXISTS idx_boletim_aluno ON boletim(aluno_id);
CREATE INDEX IF NOT EXISTS idx_boletim_disciplina ON boletim(disciplina);
CREATE INDEX IF NOT EXISTS idx_boletim_status ON boletim(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_user ON solicitacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes(status);
CREATE INDEX IF NOT EXISTS idx_disciplinas_professor ON disciplinas(professor_id);
CREATE INDEX IF NOT EXISTS idx_disciplinas_turma ON disciplinas(turma_id);
CREATE INDEX IF NOT EXISTS idx_aulas_professor ON aulas(professor_id);
CREATE INDEX IF NOT EXISTS idx_aulas_disciplina ON aulas(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_aulas_turma_disciplina_id ON aulas(turma_disciplina_id);
CREATE INDEX IF NOT EXISTS idx_aulas_data ON aulas(data);
CREATE INDEX IF NOT EXISTS idx_turma_disciplinas_prof_id ON turma_disciplinas(professor_id);
CREATE INDEX IF NOT EXISTS idx_turma_disciplinas_datas ON turma_disciplinas(data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS idx_boletim_versao ON boletim(versao);
CREATE INDEX IF NOT EXISTS idx_perfis_versao ON perfis(versao);
CREATE INDEX IF NOT EXISTS idx_disciplinas_versao ON disciplinas(versao);
CREATE INDEX IF NOT EXISTS idx_pagamentos_aluno ON pagamentos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_vencimento ON pagamentos(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_acordos_aluno ON financeiro_acordos(aluno_id);

-- =====================================================
-- FUNCTIONS E TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION public.check_user_is_admin_or_secretaria()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.perfis 
        WHERE id = auth.uid() 
        AND perfil IN ('admin', 'secretaria', 'master_admin', 'financeiro')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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

CREATE OR REPLACE FUNCTION increment_versao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.versao := OLD.versao + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS trigger_increment_versao_boletim ON boletim;
CREATE TRIGGER trigger_increment_versao_boletim
    BEFORE UPDATE ON boletim
    FOR EACH ROW
    WHEN (OLD.versao IS NOT DISTINCT FROM NEW.versao)
    EXECUTE FUNCTION increment_versao();

DROP TRIGGER IF EXISTS trigger_increment_versao_perfis ON perfis;
CREATE TRIGGER trigger_increment_versao_perfis
    BEFORE UPDATE ON perfis
    FOR EACH ROW
    WHEN (OLD.versao IS NOT DISTINCT FROM NEW.versao)
    EXECUTE FUNCTION increment_versao();

DROP TRIGGER IF EXISTS trigger_increment_versao_disciplinas ON disciplinas;
CREATE TRIGGER trigger_increment_versao_disciplinas
    BEFORE UPDATE ON disciplinas
    FOR EACH ROW
    WHEN (OLD.versao IS NOT DISTINCT FROM NEW.versao)
    EXECUTE FUNCTION increment_versao();

DROP TRIGGER IF EXISTS trigger_increment_versao_turmas ON turmas;
CREATE TRIGGER trigger_increment_versao_turmas
    BEFORE UPDATE ON turmas
    FOR EACH ROW
    WHEN (OLD.versao IS NOT DISTINCT FROM NEW.versao)
    EXECUTE FUNCTION increment_versao();

DROP TRIGGER IF EXISTS trigger_increment_versao_cursos ON cursos;
CREATE TRIGGER trigger_increment_versao_cursos
    BEFORE UPDATE ON cursos
    FOR EACH ROW
    WHEN (OLD.versao IS NOT DISTINCT FROM NEW.versao)
    EXECUTE FUNCTION increment_versao();
