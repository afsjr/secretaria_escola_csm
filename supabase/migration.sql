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
-- 9. TABELA CURSOS (Suporte a Múltiplos Cursos)
-- =====================================================

-- Criar tabela de cursos
CREATE TABLE IF NOT EXISTS cursos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Adicionar coluna 'curso_id' na tabela turmas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'turmas' AND column_name = 'curso_id'
    ) THEN
        ALTER TABLE turmas ADD COLUMN curso_id UUID REFERENCES cursos(id) ON DELETE SET NULL;
        RAISE NOTICE 'Coluna curso_id adicionada à tabela turmas';
    ELSE
        RAISE NOTICE 'Coluna curso_id já existe na tabela turmas';
    END IF;
END
$$;

-- Adicionar coluna 'curso_id' na tabela disciplinas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'disciplinas' AND column_name = 'curso_id'
    ) THEN
        ALTER TABLE disciplinas ADD COLUMN curso_id UUID REFERENCES cursos(id) ON DELETE SET NULL;
        RAISE NOTICE 'Coluna curso_id adicionada à tabela disciplinas';
    ELSE
        RAISE NOTICE 'Coluna curso_id já existe na tabela disciplinas';
    END IF;
END
$$;

-- Índices para cursos
CREATE INDEX IF NOT EXISTS idx_cursos_ativo ON cursos(ativo);
CREATE INDEX IF NOT EXISTS idx_turmas_curso ON turmas(curso_id);
CREATE INDEX IF NOT EXISTS idx_disciplinas_curso ON disciplinas(curso_id);

-- =====================================================
-- 10. INSERIR CURSO PADRÃO (Técnico em Enfermagem)
-- =====================================================

DO $$
DECLARE
    count_cursos INTEGER;
    enfermagem_id UUID;
BEGIN
    SELECT COUNT(*) INTO count_cursos FROM cursos;
    
    IF count_cursos = 0 THEN
        -- Criar curso de Enfermagem
        INSERT INTO cursos (nome, descricao) 
        VALUES ('Técnico em Enfermagem', 'Curso técnico em enfermagem com foco em saúde pública e hospitalar.')
        RETURNING id INTO enfermagem_id;
        
        RAISE NOTICE 'Curso Técnico em Enfermagem criado com ID: %', enfermagem_id;
        
        -- Atualizar turmas existentes para vincular ao curso (se houver)
        UPDATE turmas SET curso_id = enfermagem_id WHERE curso_id IS NULL;
        
        -- Atualizar disciplinas existentes para vincular ao curso (se houver)
        UPDATE disciplinas SET curso_id = enfermagem_id WHERE curso_id IS NULL;
        
        RAISE NOTICE 'Turmas e disciplinas existentes vinculadas ao curso de Enfermagem';
    ELSE
        RAISE NOTICE 'Já existem cursos cadastrados (% registros encontrados)', count_cursos;
    END IF;
END
$$;

-- =====================================================
-- 11. INSERIR OUTROS CURSOS PADRÃO
-- =====================================================

DO $$
DECLARE
    count_cursos INTEGER;
    instrumentacao_id UUID;
BEGIN
    -- Verificar se já existe Instrumentação Cirúrgica
    SELECT COUNT(*) INTO count_cursos FROM cursos WHERE nome = 'Instrumentação Cirúrgica';
    
    IF count_cursos = 0 THEN
        INSERT INTO cursos (nome, descricao) 
        VALUES ('Instrumentação Cirúrgica', 'Curso técnico em instrumentação cirúrgica com foco em centro cirúrgico e materiais.')
        RETURNING id INTO instrumentacao_id;
        
        RAISE NOTICE 'Curso Instrumentação Cirúrgica criado com ID: %', instrumentacao_id;
    END IF;
END
$$;

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================
-- =====================================================
-- NOTAS DE ESTÁGIO - SOLUÇÃO A
-- Aplicar no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. Adicionar colunas na tabela bulletin
-- =====================================================
ALTER TABLE bulletin ADD COLUMN IF NOT EXISTS nota_estagio TEXT CHECK (nota_estagio IN ('AP', 'REP'));
ALTER TABLE bulletin ADD COLUMN IF NOT EXISTS estagio_parecer TEXT;

-- =====================================================
-- 2. Adicionar tipo de curso (se não existir)
-- =====================================================
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS tipo TEXT DEFAULT 'tecnico';
ALTER TABLE cursos ADD COLUMN IF NOT EXISTS tipo TEXT CHECK (tipo IN ('saude', 'tecnico', 'outro', 'formacao'));

-- =====================================================
-- 3. Atualizar cursos de saúde existentes
-- =====================================================
UPDATE cursos SET tipo = 'saude' 
WHERE nome ILIKE '%enfermagem%' 
   OR nome ILIKE '%enfermeiro%'
   OR nome ILIKE '%enfermagem%'
   OR nome ILIKE '%enfermagem%';

-- =====================================================
-- 3.1. Atualizar cursos de formação
-- =====================================================
UPDATE cursos SET tipo = 'formacao' 
WHERE nome ILIKE '%flebotomia%';

-- =====================================================
-- 4. Criar índice para performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_boletim_estagio ON bulletin(aluno_id, disciplina);

-- =====================================================
-- 5. Verificar colunas criadas
-- =====================================================
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'boletim' 
AND column_name IN ('nota_estagio', 'estagio_parecer');-- =====================================================
-- MÓDULO FINANCEIRO - SGE CSM
-- Versão: 1.1 - 2026-04-11 (Proteção contra duplicidade)
-- =====================================================

-- 1. Tabelas
CREATE TABLE IF NOT EXISTS pagamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    valor_original DECIMAL(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    valor_pago DECIMAL(10,2),
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

INSERT INTO financeiro_config (chave, valor) VALUES 
('multa_atraso', 0.02),
('juros_mensal', 0.01)
ON CONFLICT (chave) DO NOTHING;

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_pagamentos_aluno ON pagamentos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_vencimento ON pagamentos(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_acordos_aluno ON financeiro_acordos(aluno_id);

-- 3. RLS (Ativação)
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_acordos ENABLE ROW LEVEL SECURITY;
ALTER TABLE financeiro_config ENABLE ROW LEVEL SECURITY;

-- 4. Políticas (Garantir que não dupliquem)
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admin e Financeiro podem gerenciar pagamentos" ON pagamentos;
    DROP POLICY IF EXISTS "Admin e Financeiro podem gerenciar acordos" ON financeiro_acordos;
    DROP POLICY IF EXISTS "Alunos podem ver seus próprios pagamentos" ON pagamentos;
    DROP POLICY IF EXISTS "Todos podem ver configs financeiras" ON financeiro_config;
END $$;

CREATE POLICY "Admin e Financeiro podem gerenciar pagamentos" ON pagamentos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM perfis 
            WHERE perfis.id = auth.uid() 
            AND perfis.perfil IN ('admin', 'financeiro')
        )
    );

CREATE POLICY "Admin e Financeiro podem gerenciar acordos" ON financeiro_acordos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM perfis 
            WHERE perfis.id = auth.uid() 
            AND perfis.perfil IN ('admin', 'financeiro')
        )
    );

CREATE POLICY "Alunos podem ver seus próprios pagamentos" ON pagamentos
    FOR SELECT USING (aluno_id = auth.uid());

CREATE POLICY "Todos podem ver configs financeiras" ON financeiro_config
    FOR SELECT USING (true);
-- =====================================================
-- SUPABASE RLS HARDENING - CSM
-- Data: 16/05/2026
-- Objetivo: Proteger tabelas core contra acesso não autorizado via Anon Key
-- =====================================================

-- 1. ATIVAR RLS EM TODAS AS TABELAS
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE boletim ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS PARA A TABELA 'PERFIS'
-- Admin e Secretaria podem ver e gerenciar tudo
CREATE POLICY "Admin/Secretaria total access" ON perfis
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM perfis p 
            WHERE p.id = auth.uid() AND p.perfil IN ('admin', 'secretaria')
        )
    );

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile" ON perfis
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

-- 3. POLÍTICAS PARA A TABELA 'BOLETIM'
-- Admin/Secretaria total
CREATE POLICY "Admin/Secretaria boletim access" ON boletim
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM perfis p 
            WHERE p.id = auth.uid() AND p.perfil IN ('admin', 'secretaria')
        )
    );

-- Professores podem ver e editar notas
CREATE POLICY "Professores can manage grades" ON boletim
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM perfis p 
            WHERE p.id = auth.uid() AND p.perfil = 'professor'
        )
    );

-- Alunos só veem suas próprias notas
CREATE POLICY "Students view own grades" ON boletim
    FOR SELECT TO authenticated
    USING (auth.uid() = aluno_id);

-- 4. POLÍTICAS PARA 'MATRICULAS'
-- Admin/Secretaria total
CREATE POLICY "Admin/Secretaria matriculas access" ON matriculas
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM perfis p 
            WHERE p.id = auth.uid() AND p.perfil IN ('admin', 'secretaria')
        )
    );

-- Alunos veem suas matrículas
CREATE POLICY "Students view own matriculas" ON matriculas
    FOR SELECT TO authenticated
    USING (auth.uid() = aluno_id);

-- 5. POLÍTICAS PARA 'SOLICITACOES'
-- Admin/Secretaria total
CREATE POLICY "Admin/Secretaria solicitacoes access" ON solicitacoes
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM perfis p 
            WHERE p.id = auth.uid() AND p.perfil IN ('admin', 'secretaria')
        )
    );

-- Alunos gerenciam suas próprias solicitações
CREATE POLICY "Students manage own requests" ON solicitacoes
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);

-- 6. POLÍTICAS PARA TABELAS DE APOIO (Cursos, Turmas, Disciplinas)
-- Todos os autenticados podem ver
CREATE POLICY "Authenticated users view courses/classes" ON cursos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users view turmas" ON turmas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users view disciplinas" ON disciplinas FOR SELECT TO authenticated USING (true);

-- Apenas Admin/Secretaria gerencia
CREATE POLICY "Admin manage technical tables" ON cursos FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil IN ('admin', 'secretaria')));
CREATE POLICY "Admin manage turmas" ON turmas FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil IN ('admin', 'secretaria')));
CREATE POLICY "Admin manage disciplinas" ON disciplinas FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM perfis WHERE id = auth.uid() AND perfil IN ('admin', 'secretaria')));
-- =====================================================
-- MIGRATION: Adicionar controle de versão para Bloqueio Otimista
-- Versão: 1.0 - Data: 2026-04-16
-- =====================================================
-- Este arquivo adiciona coluna 'versao' às tabelas críticas para detectar
-- conflitos de edição simultânea entre múltiplos usuários.
-- =====================================================

-- Adicionar coluna versao à tabela boletim (notas dos alunos)
ALTER TABLE IF EXISTS boletim 
ADD COLUMN IF NOT EXISTS versao INTEGER DEFAULT 1;

-- Adicionar coluna versao à tabela perfis (dados de alunos)
ALTER TABLE IF EXISTS perfis 
ADD COLUMN IF NOT EXISTS versao INTEGER DEFAULT 1;

-- Adicionar coluna versao à tabela disciplinas
ALTER TABLE IF EXISTS disciplinas 
ADD COLUMN IF NOT EXISTS versao INTEGER DEFAULT 1;

-- Adicionar coluna versao à tabela turmas
ALTER TABLE IF EXISTS turmas 
ADD COLUMN IF NOT EXISTS versao INTEGER DEFAULT 1;

-- Adicionar coluna versao à tabela cursos
ALTER TABLE IF EXISTS cursos 
ADD COLUMN IF NOT EXISTS versao INTEGER DEFAULT 1;

-- Criar índice para melhorar performance em consultas de versão
CREATE INDEX IF NOT EXISTS idx_boletim_versao ON boletim(versao);
CREATE INDEX IF NOT EXISTS idx_perfis_versao ON perfis(versao);
CREATE INDEX IF NOT EXISTS idx_disciplinas_versao ON disciplinas(versao);

-- Comentário para documentar o propósito da coluna
COMMENT ON COLUMN boletim.versao IS 'Campo para controle de concorrência - bloquear edições simultâneas';
COMMENT ON COLUMN perfis.versao IS 'Campo para controle de concorrência - bloquear edições simultâneas';
COMMENT ON COLUMN disciplinas.versao IS 'Campo para controle de concorrência - bloquear edições simultâneas';
COMMENT ON COLUMN turmas.versao IS 'Campo para controle de concorrência - bloquear edições simultâneas';
COMMENT ON COLUMN cursos.versao IS 'Campo para controle de concorrência - bloquear edições simultâneas';

-- =====================================================
-- FUNCTION: Função para auto-incrementar versão em updates
-- =====================================================
CREATE OR REPLACE FUNCTION increment_versao()
RETURNS TRIGGER AS $$
BEGIN
    NEW.versao := OLD.versao + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para tabela boletim
DROP TRIGGER IF EXISTS trigger_increment_versao_boletim ON boletim;
CREATE TRIGGER trigger_increment_versao_boletim
    BEFORE UPDATE ON boletim
    FOR EACH ROW
    WHEN (OLD.versao IS NOT DISTINCT FROM NEW.versao)
    EXECUTE FUNCTION increment_versao();

-- Trigger para tabela perfis
DROP TRIGGER IF EXISTS trigger_increment_versao_perfis ON perfis;
CREATE TRIGGER trigger_increment_versao_perfis
    BEFORE UPDATE ON perfis
    FOR EACH ROW
    WHEN (OLD.versao IS NOT DISTINCT FROM NEW.versao)
    EXECUTE FUNCTION increment_versao();

-- Trigger para tabela disciplinas
DROP TRIGGER IF EXISTS trigger_increment_versao_disciplinas ON disciplinas;
CREATE TRIGGER trigger_increment_versao_disciplinas
    BEFORE UPDATE ON disciplinas
    FOR EACH ROW
    WHEN (OLD.versao IS NOT DISTINCT FROM NEW.versao)
    EXECUTE FUNCTION increment_versao();

-- Trigger para tabela turmas
DROP TRIGGER IF EXISTS trigger_increment_versao_turmas ON turmas;
CREATE TRIGGER trigger_increment_versao_turmas
    BEFORE UPDATE ON turmas
    FOR EACH ROW
    WHEN (OLD.versao IS NOT DISTINCT FROM NEW.versao)
    EXECUTE FUNCTION increment_versao();

-- Trigger para tabela cursos
DROP TRIGGER IF EXISTS trigger_increment_versao_cursos ON cursos;
CREATE TRIGGER trigger_increment_versao_cursos
    BEFORE UPDATE ON cursos
    FOR EACH ROW
    WHEN (OLD.versao IS NOT DISTINCT FROM NEW.versao)
    EXECUTE FUNCTION increment_versao();-- =====================================================
-- FIX SUPABASE: RECURSIVIDADE RLS + COLUNAS FALTANTES (v3)
-- Data: 16/05/2026
-- =====================================================

-- 1. ADICIONAR COLUNAS FALTANTES NA TABELA PERFIS
ALTER TABLE IF EXISTS public.perfis 
ADD COLUMN IF NOT EXISTS primeiro_acesso BOOLEAN DEFAULT TRUE;

ALTER TABLE IF EXISTS public.perfis 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- 2. CRIAR FUNÇÃO PARA VERIFICAR PERFIL SEM RECURSÃO (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.check_user_is_admin_or_secretaria()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.perfis 
        WHERE id = auth.uid() 
        AND perfil IN ('admin', 'secretaria', 'master_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. LIMPAR POLÍTICAS ANTIGAS (DROP ANTES DE CREATE)
DROP POLICY IF EXISTS "Admin/Secretaria total access" ON perfis;
DROP POLICY IF EXISTS "Users can view own profile" ON perfis;
DROP POLICY IF EXISTS "Users can update own profile" ON perfis;
DROP POLICY IF EXISTS "Admin/Secretaria boletim access" ON boletim;
DROP POLICY IF EXISTS "Professores can manage grades" ON boletim;
DROP POLICY IF EXISTS "Students view own grades" ON boletim;
DROP POLICY IF EXISTS "Admin/Secretaria matriculas access" ON matriculas;
DROP POLICY IF EXISTS "Students view own matriculas" ON matriculas;
DROP POLICY IF EXISTS "Admin/Secretaria solicitacoes access" ON solicitacoes;
DROP POLICY IF EXISTS "Students manage own requests" ON solicitacoes;
DROP POLICY IF EXISTS "Admin manage courses" ON cursos;
DROP POLICY IF EXISTS "Admin manage turmas" ON turmas;
DROP POLICY IF EXISTS "Admin manage disciplinas" ON disciplinas;
DROP POLICY IF EXISTS "View tables authenticated" ON cursos;
DROP POLICY IF EXISTS "View turmas authenticated" ON turmas;
DROP POLICY IF EXISTS "View disciplinas authenticated" ON disciplinas;
DROP POLICY IF EXISTS "Admin manage technical tables" ON cursos;

-- 4. RECRIAR POLÍTICAS USANDO A FUNÇÃO SEGURA

-- PERFIS
CREATE POLICY "Admin/Secretaria total access" ON perfis FOR ALL TO authenticated USING (check_user_is_admin_or_secretaria());
CREATE POLICY "Users can view own profile" ON perfis FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON perfis FOR UPDATE TO authenticated USING (auth.uid() = id);

-- BOLETIM
CREATE POLICY "Admin/Secretaria boletim access" ON boletim FOR ALL TO authenticated USING (check_user_is_admin_or_secretaria());
CREATE POLICY "Professores can manage grades" ON boletim FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.perfis WHERE id = auth.uid() AND perfil = 'professor'));
CREATE POLICY "Students view own grades" ON boletim FOR SELECT TO authenticated USING (auth.uid() = aluno_id);

-- MATRICULAS
CREATE POLICY "Admin/Secretaria matriculas access" ON matriculas FOR ALL TO authenticated USING (check_user_is_admin_or_secretaria());
CREATE POLICY "Students view own matriculas" ON matriculas FOR SELECT TO authenticated USING (auth.uid() = aluno_id);

-- SOLICITACOES
CREATE POLICY "Admin/Secretaria solicitacoes access" ON solicitacoes FOR ALL TO authenticated USING (check_user_is_admin_or_secretaria());
CREATE POLICY "Students manage own requests" ON solicitacoes FOR ALL TO authenticated USING (auth.uid() = user_id);

-- TABELAS TÉCNICAS
CREATE POLICY "Admin manage courses" ON cursos FOR ALL TO authenticated USING (check_user_is_admin_or_secretaria());
CREATE POLICY "Admin manage turmas" ON turmas FOR ALL TO authenticated USING (check_user_is_admin_or_secretaria());
CREATE POLICY "Admin manage disciplinas" ON disciplinas FOR ALL TO authenticated USING (check_user_is_admin_or_secretaria());

CREATE POLICY "View tables authenticated" ON cursos FOR SELECT TO authenticated USING (true);
CREATE POLICY "View turmas authenticated" ON turmas FOR SELECT TO authenticated USING (true);
CREATE POLICY "View disciplinas authenticated" ON disciplinas FOR SELECT TO authenticated USING (true);

-- 5. GARANTIR RLS ATIVO
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE boletim ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE aulas ENABLE ROW LEVEL SECURITY;
