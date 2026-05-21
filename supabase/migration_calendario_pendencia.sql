-- =====================================================
-- MIGRAÇÃO: Calendário Acadêmico + Disciplinas Pendentes
-- Data: 20/05/2026
-- =====================================================

-- 1. Datas nas ofertas (turma_disciplinas)
ALTER TABLE turma_disciplinas ADD COLUMN IF NOT EXISTS data_inicio DATE;
ALTER TABLE turma_disciplinas ADD COLUMN IF NOT EXISTS data_fim DATE;

-- 2. Data de matrícula do aluno
ALTER TABLE matriculas ADD COLUMN IF NOT EXISTS data_matricula DATE;

-- 3. Status no boletim (NULL=normal, 'pendente'=falta cursar)
ALTER TABLE boletim ADD COLUMN IF NOT EXISTS status TEXT DEFAULT NULL;

-- 4. Ordem sequencial nas disciplinas base
ALTER TABLE disciplinas_base ADD COLUMN IF NOT EXISTS ordem INT DEFAULT 0;

-- 5. Preencher ordem para disciplinas existentes (I=1, II=2, III=3)
UPDATE disciplinas_base SET ordem = 1 WHERE modulo = 'I Módulo' AND (ordem IS NULL OR ordem = 0);
UPDATE disciplinas_base SET ordem = 2 WHERE modulo = 'II Módulo' AND (ordem IS NULL OR ordem = 0);
UPDATE disciplinas_base SET ordem = 3 WHERE modulo = 'III Módulo' AND (ordem IS NULL OR ordem = 0);
UPDATE disciplinas_base SET ordem = 4 WHERE modulo = 'IV Módulo' AND (ordem IS NULL OR ordem = 0);

-- 6. Preencher data_matricula a partir de created_at para registros existentes
UPDATE matriculas SET data_matricula = created_at::date WHERE data_matricula IS NULL;

-- 7. Índices para performance
CREATE INDEX IF NOT EXISTS idx_boletim_status ON boletim(status);
CREATE INDEX IF NOT EXISTS idx_turma_disciplinas_datas ON turma_disciplinas(data_inicio, data_fim);
