-- =====================================================
-- MIGRACAO DO BANCO DE DADOS - SISTEMA CSM
-- Data: 2026-04-01
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- =====================================================
-- 1. TABELA PERFIS
-- =====================================================

-- Adicionar coluna 'perfil' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'perfis' AND column_name = 'perfil'
    ) THEN
        ALTER TABLE perfis ADD COLUMN perfil TEXT DEFAULT 'aluno';
        RAISE NOTICE 'Coluna perfil adicionada à tabela perfis';
    ELSE
        RAISE NOTICE 'Coluna perfil já existe na tabela perfis';
    END IF;
END
$$;

-- Adicionar coluna 'bloqueio_financeiro' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'perfis' AND column_name = 'bloqueio_financeiro'
    ) THEN
        ALTER TABLE perfis ADD COLUMN bloqueio_financeiro BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Coluna bloqueio_financeiro adicionada à tabela perfis';
    ELSE
        RAISE NOTICE 'Coluna bloqueio_financeiro já existe na tabela perfis';
    END IF;
END
$$;

-- Adicionar coluna 'created_at' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'perfis' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE perfis ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
        RAISE NOTICE 'Coluna created_at adicionada à tabela perfis';
    ELSE
        RAISE NOTICE 'Coluna created_at já existe na tabela perfis';
    END IF;
END
$$;

-- =====================================================
-- 2. TABELA TURMAS
-- =====================================================

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS turmas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    periodo TEXT NOT NULL,
    status_ingresso TEXT DEFAULT 'aberta',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Adicionar coluna 'status_ingresso' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'turmas' AND column_name = 'status_ingresso'
    ) THEN
        ALTER TABLE turmas ADD COLUMN status_ingresso TEXT DEFAULT 'aberta';
        RAISE NOTICE 'Coluna status_ingresso adicionada à tabela turmas';
    ELSE
        RAISE NOTICE 'Coluna status_ingresso já existe na tabela turmas';
    END IF;
END
$$;

-- =====================================================
-- 3. TABELA MATRICULAS
-- =====================================================

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS matriculas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
    turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
    status_aluno TEXT DEFAULT 'ativo',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Adicionar coluna 'status_aluno' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matriculas' AND column_name = 'status_aluno'
    ) THEN
        ALTER TABLE matriculas ADD COLUMN status_aluno TEXT DEFAULT 'ativo';
        RAISE NOTICE 'Coluna status_aluno adicionada à tabela matriculas';
    ELSE
        RAISE NOTICE 'Coluna status_aluno já existe na tabela matriculas';
    END IF;
END
$$;

-- Índices para matrículas
CREATE INDEX IF NOT EXISTS idx_matriculas_aluno ON matriculas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_turma ON matriculas(turma_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_status ON matriculas(status_aluno);

-- =====================================================
-- 4. TABELA BOLETIM
-- =====================================================

-- Criar tabela se não existir
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

-- Adicionar coluna 'rec' se não existir (alguns bancos antigos podem não ter)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'boletim' AND column_name = 'rec'
    ) THEN
        ALTER TABLE boletim ADD COLUMN rec DECIMAL DEFAULT 0;
        RAISE NOTICE 'Coluna rec adicionada à tabela boletim';
    ELSE
        RAISE NOTICE 'Coluna rec já existe na tabela boletim';
    END IF;
END
$$;

-- Adicionar coluna 'created_at' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'boletim' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE boletim ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
        RAISE NOTICE 'Coluna created_at adicionada à tabela boletim';
    ELSE
        RAISE NOTICE 'Coluna created_at já existe na tabela boletim';
    END IF;
END
$$;

-- Constraint unique se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'boletim' AND constraint_name = 'boletim_aluno_id_disciplina_key'
    ) THEN
        ALTER TABLE boletim ADD CONSTRAINT boletim_aluno_id_disciplina_key UNIQUE(aluno_id, disciplina);
        RAISE NOTICE 'Constraint unique adicionada à tabela boletim';
    ELSE
        RAISE NOTICE 'Constraint unique já existe na tabela boletim';
    END IF;
END
$$;

-- Índices para boletim
CREATE INDEX IF NOT EXISTS idx_boletim_aluno ON boletim(aluno_id);
CREATE INDEX IF NOT EXISTS idx_boletim_disciplina ON boletim(disciplina);

-- =====================================================
-- 5. TABELA SOLICITACOES (Documentos)
-- =====================================================

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS solicitacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    status TEXT DEFAULT 'pendente',
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Adicionar coluna 'criado_em' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'solicitacoes' AND column_name = 'criado_em'
    ) THEN
        ALTER TABLE solicitacoes ADD COLUMN criado_em TIMESTAMP DEFAULT NOW();
        RAISE NOTICE 'Coluna criado_em adicionada à tabela solicitacoes';
    ELSE
        RAISE NOTICE 'Coluna criado_em já existe na tabela solicitacoes';
    END IF;
END
$$;

-- Índices para solicitações
CREATE INDEX IF NOT EXISTS idx_solicitacoes_user ON solicitacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes(status);

-- =====================================================
-- 6. TABELA DISCIPLINAS - IMPORTANTE!
-- =====================================================

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS disciplinas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    modulo TEXT,
    turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES perfis(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Adicionar coluna 'professor_id' se não existir (COLUNA PRINCIPAL!)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'disciplinas' AND column_name = 'professor_id'
    ) THEN
        ALTER TABLE disciplinas ADD COLUMN professor_id UUID REFERENCES perfis(id) ON DELETE SET NULL;
        RAISE NOTICE 'Coluna professor_id adicionada à tabela disciplinas';
    ELSE
        RAISE NOTICE 'Coluna professor_id já existe na tabela disciplinas';
    END IF;
END
$$;

-- Adicionar coluna 'modulo' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'disciplinas' AND column_name = 'modulo'
    ) THEN
        ALTER TABLE disciplinas ADD COLUMN modulo TEXT;
        RAISE NOTICE 'Coluna modulo adicionada à tabela disciplinas';
    ELSE
        RAISE NOTICE 'Coluna modulo já existe na tabela disciplinas';
    END IF;
END
$$;

-- Adicionar coluna 'turma_id' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'disciplinas' AND column_name = 'turma_id'
    ) THEN
        ALTER TABLE disciplinas ADD COLUMN turma_id UUID REFERENCES turmas(id) ON DELETE CASCADE;
        RAISE NOTICE 'Coluna turma_id adicionada à tabela disciplinas';
    ELSE
        RAISE NOTICE 'Coluna turma_id já existe na tabela disciplinas';
    END IF;
END
$$;

-- Adicionar coluna 'created_at' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'disciplinas' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE disciplinas ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
        RAISE NOTICE 'Coluna created_at adicionada à tabela disciplinas';
    ELSE
        RAISE NOTICE 'Coluna created_at já existe na tabela disciplinas';
    END IF;
END
$$;

-- Índices para disciplinas
CREATE INDEX IF NOT EXISTS idx_disciplinas_professor ON disciplinas(professor_id);
CREATE INDEX IF NOT EXISTS idx_disciplinas_turma ON disciplinas(turma_id);

-- =====================================================
-- 7. TABELA AULAS
-- =====================================================

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS aulas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disciplina_id UUID REFERENCES disciplinas(id) ON DELETE CASCADE,
    professor_id UUID REFERENCES perfis(id) ON DELETE SET NULL,
    data DATE NOT NULL,
    conteudo TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Adicionar coluna 'disciplina_id' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'aulas' AND column_name = 'disciplina_id'
    ) THEN
        ALTER TABLE aulas ADD COLUMN disciplina_id UUID REFERENCES disciplinas(id) ON DELETE CASCADE;
        RAISE NOTICE 'Coluna disciplina_id adicionada à tabela aulas';
    ELSE
        RAISE NOTICE 'Coluna disciplina_id já existe na tabela aulas';
    END IF;
END
$$;

-- Adicionar coluna 'professor_id' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'aulas' AND column_name = 'professor_id'
    ) THEN
        ALTER TABLE aulas ADD COLUMN professor_id UUID REFERENCES perfis(id) ON DELETE SET NULL;
        RAISE NOTICE 'Coluna professor_id adicionada à tabela aulas';
    ELSE
        RAISE NOTICE 'Coluna professor_id já existe na tabela aulas';
    END IF;
END
$$;

-- Adicionar coluna 'data' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'aulas' AND column_name = 'data'
    ) THEN
        ALTER TABLE aulas ADD COLUMN data DATE;
        RAISE NOTICE 'Coluna data adicionada à tabela aulas';
    ELSE
        RAISE NOTICE 'Coluna data já existe na tabela aulas';
    END IF;
END
$$;

-- Adicionar coluna 'conteudo' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'aulas' AND column_name = 'conteudo'
    ) THEN
        ALTER TABLE aulas ADD COLUMN conteudo TEXT;
        RAISE NOTICE 'Coluna conteudo adicionada à tabela aulas';
    ELSE
        RAISE NOTICE 'Coluna conteudo já existe na tabela aulas';
    END IF;
END
$$;

-- Adicionar coluna 'created_at' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'aulas' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE aulas ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
        RAISE NOTICE 'Coluna created_at adicionada à tabela aulas';
    ELSE
        RAISE NOTICE 'Coluna created_at já existe na tabela aulas';
    END IF;
END
$$;

-- Índices para aulas
CREATE INDEX IF NOT EXISTS idx_aulas_professor ON aulas(professor_id);
CREATE INDEX IF NOT EXISTS idx_aulas_disciplina ON aulas(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_aulas_data ON aulas(data);

-- =====================================================
-- 8. INSERIR DISCIPLINAS PADRÃO (se não existirem)
-- =====================================================

-- Verificar se já existem disciplinas
DO $$
DECLARE
    count_disciplinas INTEGER;
BEGIN
    SELECT COUNT(*) INTO count_disciplinas FROM disciplinas;
    
    IF count_disciplinas = 0 THEN
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
        
        RAISE NOTICE 'Disciplinas padrão inseridas com sucesso';
    ELSE
        RAISE NOTICE 'Disciplinas já existem (% registros encontrados)', count_disciplinas;
    END IF;
END
$$;

-- =====================================================
-- 9. VERIFICAÇÃO FINAL
-- =====================================================

-- Listar todas as tabelas e suas colunas
SELECT 
    t.table_name,
    json_agg(
        json_build_object(
            'column', c.column_name,
            'type', c.data_type,
            'nullable', c.is_nullable
        ) ORDER BY c.ordinal_position
    ) as columns
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name
ORDER BY t.table_name;

-- Contar registros nas tabelas principais
SELECT 
    'perfis' as tabela, COUNT(*) as registros FROM perfis
UNION ALL
SELECT 
    'turmas' as tabela, COUNT(*) as registros FROM turmas
UNION ALL
SELECT 
    'matriculas' as tabela, COUNT(*) as registros FROM matriculas
UNION ALL
SELECT 
    'boletim' as tabela, COUNT(*) as registros FROM boletim
UNION ALL
SELECT 
    'solicitacoes' as tabela, COUNT(*) as registros FROM solicitacoes
UNION ALL
SELECT 
    'disciplinas' as tabela, COUNT(*) as registros FROM disciplinas
UNION ALL
SELECT 
    'aulas' as tabela, COUNT(*) as registros FROM aulas;

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================
