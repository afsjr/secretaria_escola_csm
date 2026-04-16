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
    EXECUTE FUNCTION increment_versao();