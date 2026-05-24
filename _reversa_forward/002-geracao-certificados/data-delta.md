# Data Delta — Geração de Certificados

> Gerado por `/reversa-plan` em 2026-05-23
> Delta sobre o modelo extraído em `_reversa_sdd/`

## Novas tabelas

### certificados

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK DEFAULT gen_random_uuid() | ID único |
| aluno_id | uuid | FK → perfis(id) NOT NULL | Aluno certificado |
| curso_id | uuid | FK → cursos(id) NOT NULL | Curso concluído |
| data_conclusao | date | NOT NULL | Data de conclusão |
| carga_horaria | int | NOT NULL | Carga horária total |
| codigo_autenticacao | text | UNIQUE NOT NULL | Hash de autenticação (ex: CERT-2026-ABC123) |
| emitido_por | uuid | FK → perfis(id) NOT NULL | Quem emitiu |
| emitido_em | timestamptz | DEFAULT now() | Data de emissão |
| template_id | uuid | FK → certificados_modelos(id) | Template usado |

### certificados_modelos

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK DEFAULT gen_random_uuid() | ID único |
| nome | text | NOT NULL | Nome do modelo (ex: "Formação", "Técnico") |
| tipo_curso | text | CHECK IN ('tecnico','formacao') NOT NULL | Tipo de curso associado |
| logo_path | text | | Path no storage (ex: `logos/colegio.png`) |
| assinatura_path | text | | Path no storage (ex: `assinaturas/diretor.png`) |
| ativo | boolean | DEFAULT true | Se o modelo está ativo |
| created_at | timestamptz | DEFAULT now() | Data de criação |
| updated_at | timestamptz | DEFAULT now() | Última atualização |

### conteudo_programatico

| Coluna | Tipo | Restrições | Descrição |
|--------|------|------------|-----------|
| id | uuid | PK DEFAULT gen_random_uuid() | ID único |
| curso_id | uuid | FK → cursos(id) NOT NULL | Curso vinculado |
| disciplina | text | NOT NULL | Nome da disciplina |
| carga_horaria | int | NOT NULL | Carga horária |
| modulo | text | | Módulo/período |
| ordem | int | DEFAULT 0 | Ordem de exibição no verso |
| created_at | timestamptz | DEFAULT now() | |

## Storage

### Bucket: `certificados-imagens`

| Propriedade | Valor |
|-------------|-------|
| Público | Não (apenas autenticados podem ler) |
| RLS Insert | `auth.role() = 'master_admin'` |
| RLS Delete | `auth.role() = 'master_admin'` |
| RLS Select | `auth.role() IN ('master_admin', 'admin', 'secretaria', 'professor')` |

Pastas esperadas:
- `logos/` — Logos do colégio (PNG, JPEG)
- `assinaturas/` — Assinaturas escaneadas (PNG, JPEG)

## Migrations necessárias

### Migration 1: certificados_modelos + conteudo_programatico

```sql
CREATE TABLE certificados_modelos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo_curso text NOT NULL CHECK (tipo_curso IN ('tecnico', 'formacao')),
  logo_path text,
  assinatura_path text,
  ativo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE conteudo_programatico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id uuid NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  disciplina text NOT NULL,
  carga_horaria int NOT NULL,
  modulo text,
  ordem int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

### Migration 2: certificados

```sql
CREATE TABLE certificados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id uuid NOT NULL REFERENCES perfis(id),
  curso_id uuid NOT NULL REFERENCES cursos(id),
  data_conclusao date NOT NULL,
  carga_horaria int NOT NULL,
  codigo_autenticacao text UNIQUE NOT NULL,
  emitido_por uuid NOT NULL REFERENCES perfis(id),
  emitido_em timestamptz DEFAULT now(),
  template_id uuid REFERENCES certificados_modelos(id)
);

-- Índices
CREATE INDEX idx_certificados_aluno ON certificados(aluno_id);
CREATE INDEX idx_certificados_curso ON certificados(curso_id);
CREATE INDEX idx_certificados_codigo ON certificados(codigo_autenticacao);
CREATE INDEX idx_conteudo_programatico_curso ON conteudo_programatico(curso_id);
```

## RLS Policies

### certificados

| Operação | Policy | Role |
|----------|--------|------|
| SELECT | próprio aluno vê seus certificados; admin/master_admin/secretaria vê todos | autenticado |
| INSERT | apenas admin, master_admin, secretaria | autenticado |

### certificados_modelos

| Operação | Policy | Role |
|----------|--------|------|
| SELECT | todos autenticados | autenticado |
| INSERT | apenas master_admin | autenticado |
| UPDATE | apenas master_admin | autenticado |
| DELETE | apenas master_admin | autenticado |

### conteudo_programatico

| Operação | Policy | Role |
|----------|--------|------|
| SELECT | todos autenticados | autenticado |
| INSERT | admin, master_admin, secretaria | autenticado |
| UPDATE | admin, master_admin, secretaria | autenticado |
| DELETE | admin, master_admin, secretaria | autenticado |
