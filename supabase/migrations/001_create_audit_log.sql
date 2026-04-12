-- =====================================================
-- AUDIT LOG - Tabela de Registro de Ações
-- Data: 2026-04-12
-- Execute no SQL Editor do Supabase
-- =====================================================

-- Tabela de auditoria
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Quem fez
    usuario_id UUID NOT NULL,
    usuario_nome TEXT,
    usuario_perfil TEXT,
    
    -- O que fez
    acao TEXT NOT NULL,              -- ex: 'reset_senha', 'lancar_nota', 'criar_usuario'
    tabela_afetada TEXT,             -- ex: 'perfis', 'boletim', 'matriculas'
    registro_id UUID,                -- ID do registro afetado (se aplicável)
    descricao TEXT,                  -- Descrição legível da ação
    
    -- Detalhes técnicos
    dados_antigos JSONB,             -- Estado antes da mudança
    dados_novos JSONB,               -- Estado depois da mudança
    ip_address TEXT,                 -- IP do usuário (se disponível)
    user_agent TEXT,                 -- Browser/dispositivo
    
    -- Contexto
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_audit_log_usuario ON audit_log(usuario_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_acao ON audit_log(acao);
CREATE INDEX IF NOT EXISTS idx_audit_log_tabela ON audit_log(tabela_afetada);
CREATE INDEX IF NOT EXISTS idx_audit_log_data ON audit_log(created_at DESC);

-- RLS: Apenas admin e master_admin podem ver logs
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Admin e Master Admin podem ver todos os logs
CREATE POLICY "Admin pode ver todos os logs" ON audit_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM perfis p
            WHERE p.id = auth.uid()
            AND p.perfil IN ('admin', 'master_admin')
        )
    );

-- Policy: O sistema pode INSERT de logs (via service role ou authenticated)
CREATE POLICY "Usuários autenticados podem criar logs" ON audit_log
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Ninguém pode deletar logs (imutabilidade)
-- (Não criamos policy de DELETE)

-- Comentários para documentação
COMMENT ON TABLE audit_log IS 'Registro imutável de todas as ações sensíveis do sistema';
COMMENT ON COLUMN audit_log.acao IS 'Tipo de ação: reset_senha, lancar_nota, criar_usuario, deletar_registro, etc.';
COMMENT ON COLUMN audit_log.dados_antigos IS 'Snapshot dos dados antes da mudança (JSONB)';
COMMENT ON COLUMN audit_log.dados_novos IS 'Snapshot dos dados depois da mudança (JSONB)';
