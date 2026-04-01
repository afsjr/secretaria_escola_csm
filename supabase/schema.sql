-- Schema do Sistema de Gestão Escolar CSM
-- Tabelas existentes e novas

-- =====================================================
-- TABELAS EXISTENTES (já criadas no Supabase)
-- =====================================================

-- Tabela de perfis (já existe)
-- CREATE TABLE perfis (
--   id UUID PRIMARY KEY REFERENCES auth.users(id),
--   nome_completo TEXT NOT NULL,
--   email TEXT NOT NULL,
--   cpf TEXT,
--   telefone TEXT,
--   perfil TEXT DEFAULT 'aluno', -- 'aluno', 'admin', 'secretaria', 'professor'
--   bloqueio_financeiro BOOLEAN DEFAULT FALSE,
--   created_at TIMESTAMP DEFAULT NOW()
-- );

-- Tabela de turmas (já existe)
-- CREATE TABLE turmas (
--   id UUID PRIMARY KEY,
--   nome TEXT NOT NULL,
--   periodo TEXT NOT NULL,
--   status_ingresso TEXT DEFAULT 'aberta',
--   created_at TIMESTAMP DEFAULT NOW()
-- );

-- Tabela de matrículas (já existe)
-- CREATE TABLE matriculas (
--   id UUID PRIMARY KEY,
--   aluno_id UUID REFERENCES perfis(id),
--   turma_id UUID REFERENCES turmas(id),
--   status_aluno TEXT DEFAULT 'ativo', -- 'ativo', 'trancado', 'evadido', 'concluido'
--   created_at TIMESTAMP DEFAULT NOW()
-- );

-- Tabela de boletim (já existe)
-- CREATE TABLE boletim (
--   id UUID PRIMARY KEY,
--   aluno_id UUID REFERENCES perfis(id),
--   disciplina TEXT NOT NULL,
--   faltas INTEGER DEFAULT 0,
--   n1 DECIMAL DEFAULT 0,
--   n2 DECIMAL DEFAULT 0,
--   n3 DECIMAL DEFAULT 0,
--   rec DECIMAL DEFAULT 0,
--   created_at TIMESTAMP DEFAULT NOW(),
--   UNIQUE(aluno_id, disciplina)
-- );

-- Tabela de documentos (já existe)
-- CREATE TABLE documentos (
--   id UUID PRIMARY KEY,
--   aluno_id UUID REFERENCES perfis(id),
--   tipo TEXT NOT NULL,
--   status TEXT DEFAULT 'pendente', -- 'pendente', 'concluido'
--   created_at TIMESTAMP DEFAULT NOW()
-- );

-- =====================================================
-- NOVAS TABELAS (Professor)
-- =====================================================

-- Tabela de disciplinas
CREATE TABLE disciplinas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  modulo TEXT NOT NULL, -- 'I Módulo', 'II Módulo', 'III Módulo'
  turma_id UUID REFERENCES turmas(id),
  professor_id UUID REFERENCES perfis(id), -- professor vinculado
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de aulas (registro de aulas)
CREATE TABLE aulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disciplina_id UUID REFERENCES disciplinas(id),
  professor_id UUID REFERENCES perfis(id),
  data DATE NOT NULL,
  conteudo TEXT NOT NULL, -- conteúdo ministrado na aula
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX idx_disciplinas_professor ON disciplinas(professor_id);
CREATE INDEX idx_disciplinas_turma ON disciplinas(turma_id);
CREATE INDEX idx_aulas_professor ON aulas(professor_id);
CREATE INDEX idx_aulas_disciplina ON aulas(disciplina_id);
CREATE INDEX idx_aulas_data ON aulas(data);

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE disciplinas IS 'Disciplinas do curso Técnico em Enfermagem';
COMMENT ON TABLE aulas IS 'Registro de aulas ministradas pelos professores';
