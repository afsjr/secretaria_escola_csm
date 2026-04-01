-- =====================================================
-- SCHEMA DO SISTEMA DE GESTÃO ESCOLAR CSM
-- Versão: 2.0 - Atualizado em 2026-04-01
-- =====================================================
-- Este arquivo documenta a estrutura final do banco de dados
-- Para migrações, use o arquivo migration.sql

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de perfis (usuários do sistema)
CREATE TABLE IF NOT EXISTS perfis (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo TEXT NOT NULL,
    email TEXT NOT NULL,
    cpf TEXT,
    telefone TEXT,
    perfil TEXT DEFAULT 'aluno', -- 'aluno', 'admin', 'secretaria', 'professor'
    bloqueio_financeiro BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de turmas
CREATE TABLE IF NOT EXISTS turmas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    periodo TEXT NOT NULL,
    status_ingresso TEXT DEFAULT 'aberta', -- 'aberta', 'fechada'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de matrículas (relacionamento aluno-turma)
CREATE TABLE IF NOT EXISTS matriculas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
    turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
    status_aluno TEXT DEFAULT 'ativo', -- 'ativo', 'trancado', 'evadido', 'concluido'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de boletim (notas dos alunos)
CREATE TABLE IF NOT EXISTS boletim (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
    disciplina TEXT NOT NULL,
    faltas INTEGER DEFAULT 0,
    n1 DECIMAL DEFAULT 0,
    n2 DECIMAL DEFAULT 0,
    n3 DECIMAL DEFAULT 0,
    rec DECIMAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(aluno_id, disciplina)
);

-- Tabela de solicitações de documentos
CREATE TABLE IF NOT EXISTS solicitacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    status TEXT DEFAULT 'pendente', -- 'pendente', 'concluido'
    criado_em TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- TABELAS DO MÓDULO PROFESSOR
-- =====================================================

-- Tabela de disciplinas
CREATE TABLE IF NOT EXISTS disciplinas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    modulo TEXT, -- 'I Módulo', 'II Módulo', 'III Módulo'
    turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES perfis(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de aulas (registro de aulas)
CREATE TABLE IF NOT EXISTS aulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disciplina_id UUID REFERENCES disciplinas(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES perfis(id) ON DELETE SET NULL,
    data DATE NOT NULL,
    conteudo TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_matriculas_aluno ON matriculas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_turma ON matriculas(turma_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_status ON matriculas(status_aluno);
CREATE INDEX IF NOT EXISTS idx_boletim_aluno ON boletim(aluno_id);
CREATE INDEX IF NOT EXISTS idx_boletim_disciplina ON boletim(disciplina);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_user ON solicitacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes(status);
CREATE INDEX IF NOT EXISTS idx_disciplinas_professor ON disciplinas(professor_id);
CREATE INDEX IF NOT EXISTS idx_disciplinas_turma ON disciplinas(turma_id);
CREATE INDEX IF NOT EXISTS idx_aulas_professor ON aulas(professor_id);
CREATE INDEX IF NOT EXISTS idx_aulas_disciplina ON aulas(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_aulas_data ON aulas(data);

-- =====================================================
-- DISCIPLINAS PADRÃO (Técnico em Enfermagem)
-- =====================================================

-- I Módulo
INSERT INTO disciplinas (nome, modulo) VALUES
('Psicologia Aplicada', 'I Módulo'),
('Nutrição e Dietética', 'I Módulo'),
('Português Instrumental', 'I Módulo'),
('Matemática Instrumental', 'I Módulo'),
('Microbiologia e Parasitologia', 'I Módulo'),
('Higiene e Profilaxia', 'I Módulo'),
('Ética Profissional', 'I Módulo'),
('Anatomia e Fisiologia Humana', 'I Módulo');

-- II Módulo
INSERT INTO disciplinas (nome, modulo) VALUES
('Introdução à Enfermagem', 'II Módulo'),
('Enfermagem Médica', 'II Módulo'),
('Noções de Farmacologia', 'II Módulo'),
('Enfermagem Cirúrgica', 'II Módulo'),
('Noções de Adm. em Unidade Hospitalar', 'II Módulo');

-- III Módulo
INSERT INTO disciplinas (nome, modulo) VALUES
('Enfermagem Materno Infantil', 'III Módulo'),
('Enfermagem em Pronto Socorro', 'III Módulo'),
('Enfermagem Neuro Psiquiátrica', 'III Módulo'),
('Enfermagem em Saúde Pública', 'III Módulo');
