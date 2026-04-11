-- =====================================================
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
