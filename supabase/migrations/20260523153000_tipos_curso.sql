-- Tipos de Curso: diferenciar cursos técnicos (notas) de formação (conceitos)
-- Data: 2026-05-23

ALTER TABLE cursos ADD COLUMN tipo_curso text NOT NULL DEFAULT 'tecnico'
  CHECK (tipo_curso IN ('tecnico', 'formacao'));

ALTER TABLE boletim ADD COLUMN conceito text
  CHECK (conceito IN ('A', 'B', 'C'));
