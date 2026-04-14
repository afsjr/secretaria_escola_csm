-- ============================================================================
-- SCRIPT PARA POPULAR DISCIPLINAS DO CURSO TÉCNICO EM ENFERMAGEM
-- Colégio Santa Mônica - SGE
-- ============================================================================
-- Este script insere as disciplinas organizadas por módulo no curso de Enfermagem.
-- As disciplinas são essenciais para o plano de curso completo.
-- ============================================================================

-- PASSO 1: Verificar/Obter o ID do curso de Técnico em Enfermagem
-- Execute este SELECT primeiro para pegar o curso_id correto:
-- SELECT id, nome FROM cursos WHERE nome ILIKE '%Enfermagem%' AND ativo = true;

-- Supondo que o curso de Enfermagem tenha o ID abaixo (AJUSTE conforme seu banco):
-- Você pode substituir o UUID genérico pelo ID real do curso de Enfermagem

DO $$
DECLARE
  v_curso_enfermagem UUID;
  v_curso_instrumentacao UUID;
BEGIN
  -- Obter ID do curso Técnico em Enfermagem
  SELECT id INTO v_curso_enfermagem 
  FROM cursos 
  WHERE nome ILIKE '%Técnico em Enfermagem%' 
    AND ativo = true
  LIMIT 1;

  -- Obter ID do curso Instrumentação Cirúrgica
  SELECT id INTO v_curso_instrumentacao 
  FROM cursos 
  WHERE nome ILIKE '%Instrumentação Cirúrgica%' 
    AND ativo = true
  LIMIT 1;

  -- Se não encontrar o curso de Enfermagem, sair com aviso
  IF v_curso_enfermagem IS NULL THEN
    RAISE NOTICE '⚠️  Curso Técnico em Enfermagem não encontrado. Cadastre o curso primeiro!';
    RETURN;
  END IF;

  -- ============================================================================
  -- PASSO 2: Inserir disciplinas do I MÓDULO - Técnico em Enfermagem
  -- ============================================================================
  
  -- I Módulo: Fundamentos Biológicos e Científicos
  
  INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
  VALUES 
    (gen_random_uuid(), 'Anatomia e Fisiologia Humana', 'I Módulo', v_curso_enfermagem, NULL, NULL)
  ON CONFLICT DO NOTHING;
  
  INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
  VALUES 
    (gen_random_uuid(), 'Psicologia Aplicada', 'I Módulo', v_curso_enfermagem, NULL, NULL)
  ON CONFLICT DO NOTHING;
  
  INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
  VALUES 
    (gen_random_uuid(), 'Nutrição e Dietética', 'I Módulo', v_curso_enfermagem, NULL, NULL)
  ON CONFLICT DO NOTHING;
  
  INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
  VALUES 
    (gen_random_uuid(), 'Microbiologia e Parasitologia', 'I Módulo', v_curso_enfermagem, NULL, NULL)
  ON CONFLICT DO NOTHING;
  
  INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
  VALUES 
    (gen_random_uuid(), 'Higiene e Profilaxia', 'I Módulo', v_curso_enfermagem, NULL, NULL)
  ON CONFLICT DO NOTHING;
  
  INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
  VALUES 
    (gen_random_uuid(), 'Ética Profissional', 'I Módulo', v_curso_enfermagem, NULL, NULL)
  ON CONFLICT DO NOTHING;
  
  INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
  VALUES 
    (gen_random_uuid(), 'Português Instrumental', 'I Módulo', v_curso_enfermagem, NULL, NULL)
  ON CONFLICT DO NOTHING;
  
  -- ★ DISCIPLINA QUE FALTAVA: Matemática Instrumental
  INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
  VALUES 
    (gen_random_uuid(), 'Matemática Instrumental', 'I Módulo', v_curso_enfermagem, NULL, NULL)
  ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- PASSO 3: Inserir disciplinas do II MÓDULO - Técnico em Enfermagem
  -- ============================================================================
  
  -- II Módulo: Princípios do Cuidar e Clínicas
  
  INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
  VALUES 
    (gen_random_uuid(), 'Introdução à Enfermagem', 'II Módulo', v_curso_enfermagem, NULL, NULL)
  ON CONFLICT DO NOTHING;
  
  INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
  VALUES 
    (gen_random_uuid(), 'Enfermagem Cirúrgica', 'II Módulo', v_curso_enfermagem, NULL, NULL)
  ON CONFLICT DO NOTHING;
  
  INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
  VALUES 
    (gen_random_uuid(), 'Enfermagem Médica', 'II Módulo', v_curso_enfermagem, NULL, NULL)
  ON CONFLICT DO NOTHING;
  
  INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
  VALUES 
    (gen_random_uuid(), 'Noções de Farmacologia', 'II Módulo', v_curso_enfermagem, NULL, NULL)
  ON CONFLICT DO NOTHING;
  
  INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
  VALUES 
    (gen_random_uuid(), 'Noções de Adm. em Unidade Hospitalar', 'II Módulo', v_curso_enfermagem, NULL, NULL)
  ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- PASSO 4: Inserir disciplinas do III MÓDULO - Técnico em Enfermagem
  -- ============================================================================
  
  -- III Módulo: Urgências e Saúde Pública
  
  INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
  VALUES 
    (gen_random_uuid(), 'Enfermagem Materno Infantil', 'III Módulo', v_curso_enfermagem, NULL, NULL)
  ON CONFLICT DO NOTHING;
  
  INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
  VALUES 
    (gen_random_uuid(), 'Enfermagem em Pronto Socorro', 'III Módulo', v_curso_enfermagem, NULL, NULL)
  ON CONFLICT DO NOTHING;
  
  INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
  VALUES 
    (gen_random_uuid(), 'Enfermagem em Saúde Pública', 'III Módulo', v_curso_enfermagem, NULL, NULL)
  ON CONFLICT DO NOTHING;
  
  INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
  VALUES 
    (gen_random_uuid(), 'Enfermagem Neuro Psiquiátrica', 'III Módulo', v_curso_enfermagem, NULL, NULL)
  ON CONFLICT DO NOTHING;

  -- ============================================================================
  -- PASSO 5: Inserir disciplinas de Instrumentação Cirúrgica (se o curso existir)
  -- ============================================================================
  
  IF v_curso_instrumentacao IS NOT NULL THEN
    -- I Módulo
    INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
    VALUES 
      (gen_random_uuid(), 'Anatomia Aplicada à Cirurgia', 'I Módulo', v_curso_instrumentacao, NULL, NULL)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
    VALUES 
      (gen_random_uuid(), 'Biossegurança e Esterilização', 'I Módulo', v_curso_instrumentacao, NULL, NULL)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
    VALUES 
      (gen_random_uuid(), 'Materiais e Instrumentais Cirúrgicos', 'I Módulo', v_curso_instrumentacao, NULL, NULL)
    ON CONFLICT DO NOTHING;
    
    -- II Módulo
    INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
    VALUES 
      (gen_random_uuid(), 'Técnicas de Instrumentação em Centro Cirúrgico', 'II Módulo', v_curso_instrumentacao, NULL, NULL)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
    VALUES 
      (gen_random_uuid(), 'Procedimentos Cirúrgicos Básicos', 'II Módulo', v_curso_instrumentacao, NULL, NULL)
    ON CONFLICT DO NOTHING;
    
    -- III Módulo
    INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
    VALUES 
      (gen_random_uuid(), 'Especialidades Cirúrgicas', 'III Módulo', v_curso_instrumentacao, NULL, NULL)
    ON CONFLICT DO NOTHING;
    
    INSERT INTO disciplinas (id, nome, modulo, curso_id, professor_id, turma_id)
    VALUES 
      (gen_random_uuid(), 'Estágio em Instrumentação', 'III Módulo', v_curso_instrumentacao, NULL, NULL)
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✅ Disciplinas de Instrumentação Cirúrgica inseridas com sucesso!';
  ELSE
    RAISE NOTICE '⚠️  Curso Instrumentação Cirúrgica não encontrado. Apenas Enfermagem foi processado.';
  END IF;

  RAISE NOTICE '✅ DISCIPLINAS DO CURSO TÉCNICO EM ENFERMAGEM INSERIDAS COM SUCESSO!';
  RAISE NOTICE '📋 Resumo:';
  RAISE NOTICE '   I Módulo: 8 disciplinas (incluindo Matemática Instrumental)';
  RAISE NOTICE '   II Módulo: 5 disciplinas';
  RAISE NOTICE '   III Módulo: 4 disciplinas';
  
END $$;

-- ============================================================================
-- PASSO 6: Verificar as disciplinas inseridas
-- ============================================================================

-- Execute este SELECT para ver todas as disciplinas do curso de Enfermagem:
/*
SELECT 
  d.nome AS disciplina,
  d.modulo,
  c.nome AS curso,
  p.nome_completo AS professor
FROM disciplinas d
LEFT JOIN cursos c ON d.curso_id = c.id
LEFT JOIN perfis p ON d.professor_id = p.id
WHERE c.nome ILIKE '%Enfermagem%'
ORDER BY 
  CASE d.modulo
    WHEN 'I Módulo' THEN 1
    WHEN 'II Módulo' THEN 2
    WHEN 'III Módulo' THEN 3
    ELSE 4
  END,
  d.nome;
*/

-- ============================================================================
-- PASSO 7: Contar disciplinas por módulo (verificação)
-- ============================================================================

-- Execute para contar disciplinas por módulo:
/*
SELECT 
  d.modulo,
  COUNT(*) AS total_disciplinas
FROM disciplinas d
LEFT JOIN cursos c ON d.curso_id = c.id
WHERE c.nome ILIKE '%Técnico em Enfermagem%'
GROUP BY d.modulo
ORDER BY d.modulo;
*/
