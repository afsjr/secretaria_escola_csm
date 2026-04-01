-- =====================================================
-- SCHEMA DO SISTEMA DE GESTÃO ESCOLAR CSM
-- =====================================================
-- Este arquivo documenta todas as tabelas do banco de dados
-- Use IF NOT EXISTS para evitar erros ao executar novamente

-- =====================================================
-- 1. TABELAS EXISTENTES (Principais)
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
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(aluno_id, turma_id)
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
-- 2. TABELAS DO MÓDULO PROFESSOR
-- =====================================================

-- Tabela de disciplinas
CREATE TABLE IF NOT EXISTS disciplinas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  modulo TEXT NOT NULL, -- 'I Módulo', 'II Módulo', 'III Módulo'
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
  conteudo TEXT NOT NULL, -- conteúdo ministrado na aula
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 3. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para matrículas
CREATE INDEX IF NOT EXISTS idx_matriculas_aluno ON matriculas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_turma ON matriculas(turma_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_status ON matriculas(status_aluno);

-- Índices para boletim
CREATE INDEX IF NOT EXISTS idx_boletim_aluno ON boletim(aluno_id);
CREATE INDEX IF NOT EXISTS idx_boletim_disciplina ON boletim(disciplina);

-- Índices para solicitações
CREATE INDEX IF NOT EXISTS idx_solicitacoes_user ON solicitacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes(status);

-- Índices para disciplinas
CREATE INDEX IF NOT EXISTS idx_disciplinas_professor ON disciplinas(professor_id);
CREATE INDEX IF NOT EXISTS idx_disciplinas_turma ON disciplinas(turma_id);

-- Índices para aulas
CREATE INDEX IF NOT EXISTS idx_aulas_professor ON aulas(professor_id);
CREATE INDEX IF NOT EXISTS idx_aulas_disciplina ON aulas(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_aulas_data ON aulas(data);

-- =====================================================
-- 4. COMENTÁRIOS NAS TABELAS
-- =====================================================

COMMENT ON TABLE perfis IS 'Perfis de usuários do sistema (aluno, admin, secretaria, professor)';
COMMENT ON TABLE turmas IS 'Turmas do curso';
COMMENT ON TABLE matriculas IS 'Matrículas de alunos em turmas';
COMMENT ON TABLE boletim IS 'Boletim escolar com notas e frequências';
COMMENT ON TABLE solicitacoes IS 'Solicitações de documentos pelos alunos';
COMMENT ON TABLE disciplinas IS 'Disciplinas do curso com professor vinculado';
COMMENT ON TABLE aulas IS 'Registro de aulas ministradas pelos professores';

-- =====================================================
-- 5. INSERÇÃO DE DISCIPLINAS PADRÃO (Técnico em Enfermagem)
-- =====================================================
-- Execute este bloco apenas se as disciplinas não existirem ainda

-- I Módulo
-- INSERT INTO disciplinas (nome, modulo, turma_id, professor_id) VALUES
-- ('Psicologia Aplicada', 'I Módulo', NULL, NULL),
-- ('Nutrição e Dietética', 'I Módulo', NULL, NULL),
-- ('Português Instrumental', 'I Módulo', NULL, NULL),
-- ('Matemática Instrumental', 'I Módulo', NULL, NULL),
-- ('Microbiologia e Parasitologia', 'I Módulo', NULL, NULL),
-- ('Higiene e Profilaxia', 'I Módulo', NULL, NULL),
-- ('Ética Profissional', 'I Módulo', NULL, NULL),
-- ('Anatomia e Fisiologia Humana', 'I Módulo', NULL, NULL);

-- II Módulo
-- INSERT INTO disciplinas (nome, modulo, turma_id, professor_id) VALUES
-- ('Introdução à Enfermagem', 'II Módulo', NULL, NULL),
-- ('Enfermagem Médica', 'II Módulo', NULL, NULL),
-- ('Noções de Farmacologia', 'II Módulo', NULL, NULL),
-- ('Enfermagem Cirúrgica', 'II Módulo', NULL, NULL),
-- ('Noções de Adm. em Unidade Hospitalar', 'II Módulo', NULL, NULL);

-- III Módulo
-- INSERT INTO disciplinas (nome, modulo, turma_id, professor_id) VALUES
-- ('Enfermagem Materno Infantil', 'III Módulo', NULL, NULL),
-- ('Enfermagem em Pronto Socorro', 'III Módulo', NULL, NULL),
-- ('Enfermagem Neuro Psiquiátrica', 'III Módulo', NULL, NULL),
-- ('Enfermagem em Saúde Pública', 'III Módulo', NULL, NULL);
