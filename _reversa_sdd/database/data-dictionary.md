# Dicionário de Dados — Sistema CSM

> 🟢 **CONFIRMADO** — Extraído de `schema.sql` v4.0 + `migration.sql` + migrations
> Banco: Supabase (PostgreSQL)

---

## Resumo de Tabelas

| # | Tabela | Domínio | RLS | Descrição |
|---|--------|---------|-----|-----------|
| 1 | `perfis` | Identidade | ✅ | Perfis de usuários — extensão de auth.users |
| 2 | `perfis_enderecos` | Identidade | ✅ | Endereços dos perfis |
| 3 | `cursos` | Acadêmico | ✅ | Catálogo de cursos oferecidos |
| 4 | `turmas` | Acadêmico | ✅ | Turmas vinculadas a cursos |
| 5 | `disciplinas_base` | Acadêmico | ✅ | Catálogo de disciplinas por curso |
| 6 | `turma_disciplinas` | Acadêmico | ✅ | Oferta: vínculo turma × disciplina × professor |
| 7 | `matriculas` | Acadêmico | ✅ | Matrículas de alunos em turmas |
| 8 | `aulas` | Acadêmico | ✅ | Registro de aulas ministradas |
| 9 | `boletim` | Acadêmico | ✅ | Notas e faltas por aluno/disciplina |
| 10 | `solicitacoes` | Documentos | ✅ | Pedidos de documentos |
| 11 | `responsaveis` | Suporte | ❌ | Responsáveis financeiros/legais do aluno |
| 12 | `observacoes_aluno` | Suporte | ❌ | Observações internas sobre alunos |
| 13 | `audit_log` | Auditoria | ❌ | Log de auditoria de ações |
| 14 | `pagamentos` | Financeiro | ✅ | Parcelas e pagamentos |
| 15 | `financeiro_acordos` | Financeiro | ✅ | Acordos de parcelamento de dívidas |
| 16 | `financeiro_config` | Financeiro | ✅ | Parâmetros financeiros (multa, juros) |
| 17 | `certificados_modelos` | Certificados | ✅ | Templates de certificados |
| 18 | `conteudo_programatico` | Certificados | ✅ | Grade curricular por curso |
| 19 | `certificados` | Certificados | ✅ | Certificados emitidos |
| 20 | `disciplinas` | **Legado** | ✅ | ⚠️ Não usada no código atual |

---

## Detalhamento por Tabela

### 1. perfis

> Extensão da tabela `auth.users` do Supabase. Criada automaticamente via trigger `on_auth_user_created`.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | — | PK = auth.users.id |
| nome_completo | TEXT | NOT NULL | — | Nome completo |
| email | TEXT | NOT NULL | — | Email do usuário |
| cpf | TEXT | NULL | — | CPF |
| telefone | TEXT | NULL | — | Telefone |
| perfil | TEXT | NULL | `'aluno'` | Papel: `aluno`, `admin`, `secretaria`, `professor`, `financeiro`, `coordenacao`, `master_admin` |
| bloqueio_financeiro | BOOLEAN | NULL | `FALSE` | Se TRUE, bloqueia acesso por inadimplência |
| data_nascimento | DATE | NULL | — | Data de nascimento |
| genero | TEXT | NULL | — | Gênero |
| estado_civil | TEXT | NULL | — | Estado civil |
| cidade_natal | TEXT | NULL | — | Cidade natal |
| nacionalidade | TEXT | NULL | `'Brasileira'` | Nacionalidade |
| profissao | TEXT | NULL | — | Profissão |
| graduacao | TEXT | NULL | — | Formação acadêmica |
| data_conclusao_graduacao | DATE | NULL | — | Data de conclusão da graduação |
| rg | TEXT | NULL | — | RG |
| orgao_expedidor | TEXT | NULL | — | Órgão expedidor do RG |
| data_expedicao_rg | DATE | NULL | — | Data de expedição do RG |
| whatsapp | TEXT | NULL | — | WhatsApp |
| primeiro_acesso | BOOLEAN | NULL | `TRUE` | Flag de primeiro acesso |
| versao | INTEGER | NULL | `1` | Controle de concorrência (bloqueio otimista) |
| created_at | TIMESTAMP | NULL | `NOW()` | Data de criação |
| updated_at | TIMESTAMP | NULL | `NOW()` | Data de atualização |

**Índices:** `idx_perfis_versao` em `(versao)`
**Triggers:** `trigger_increment_versao_perfis` — auto-incrementa `versao` em UPDATE

---

### 2. perfis_enderecos

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | `gen_random_uuid()` | PK |
| user_id | UUID | NULL | — | FK → perfis(id) CASCADE |
| cep | TEXT | NULL | — | CEP |
| logradouro | TEXT | NULL | — | Logradouro |
| numero | TEXT | NULL | — | Número |
| complemento | TEXT | NULL | — | Complemento |
| bairro | TEXT | NULL | — | Bairro |
| cidade | TEXT | NULL | — | Cidade |
| uf | TEXT | NULL | — | UF (estado) |
| created_at | TIMESTAMP | NULL | `NOW()` | Data de criação |

---

### 3. cursos

| Coluna | Tipo | Nullable | Default | Constraint | Descrição |
|--------|------|----------|---------|-----------|-----------|
| id | UUID | NOT NULL | `gen_random_uuid()` | PK | — |
| nome | TEXT | NOT NULL | — | — | Nome do curso |
| descricao | TEXT | NULL | — | — | Descrição |
| tipo | TEXT | NULL | `'tecnico'` | CHECK IN (`saude`,`tecnico`,`outro`,`formacao`) | Tipo do curso |
| ativo | BOOLEAN | NULL | `TRUE` | — | Se está ativo |
| versao | INTEGER | NULL | `1` | — | Bloqueio otimista |
| created_at | TIMESTAMP | NULL | `NOW()` | — | Data de criação |

**Índices:** `idx_cursos_ativo` em `(ativo)`
**Cursos seed:** Técnico em Enfermagem, Instrumentação Cirúrgica
**Triggers:** `trigger_increment_versao_cursos`

---

### 4. turmas

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | `gen_random_uuid()` | PK |
| nome | TEXT | NOT NULL | — | Nome da turma |
| periodo | TEXT | NOT NULL | — | Período letivo |
| status_ingresso | TEXT | NULL | `'aberta'` | Status de ingresso |
| curso_id | UUID | NULL | — | FK → cursos(id) SET NULL |
| versao | INTEGER | NULL | `1` | Bloqueio otimista |
| created_at | TIMESTAMP | NULL | `NOW()` | — |

**Índices:** `idx_turmas_curso` em `(curso_id)`
**Triggers:** `trigger_increment_versao_turmas`

---

### 5. disciplinas_base

> Catálogo de disciplinas por curso. Substituiu a tabela legada `disciplinas`.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | `gen_random_uuid()` | PK |
| nome | TEXT | NOT NULL | — | Nome da disciplina |
| modulo | TEXT | NULL | — | Módulo (I, II, III, etc.) |
| curso_id | UUID | NULL | — | FK → cursos(id) |
| carga_horaria | INTEGER | NULL | `40` | Carga horária em horas |
| ordem | INTEGER | NULL | `0` | Ordem de exibição sequencial |
| created_at | TIMESTAMP | NULL | `NOW()` | — |

**Seed inicial:** 17 disciplinas para Técnico em Enfermagem (I, II e III módulos)

---

### 6. turma_disciplinas

> Oferta: vínculo entre turma, disciplina do catálogo e professor responsável.

| Coluna | Tipo | Nullable | Default | Constraint | Descrição |
|--------|------|----------|---------|-----------|-----------|
| id | UUID | NOT NULL | `gen_random_uuid()` | PK | — |
| turma_id | UUID | NULL | — | FK → turmas(id) | Turma |
| disciplina_base_id | UUID | NULL | — | FK → disciplinas_base(id) | Disciplina |
| professor_id | UUID | NULL | — | FK → perfis(id) | Professor responsável |
| data_inicio | DATE | NULL | — | — | Início da oferta |
| data_fim | DATE | NULL | — | — | Fim da oferta |
| created_at | TIMESTAMP | NULL | `NOW()` | — | — |

**Constraints:** `UNIQUE(turma_id, disciplina_base_id)`
**Índices:** `idx_turma_disciplinas_prof_id`, `idx_turma_disciplinas_datas`

---

### 7. matriculas

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | `gen_random_uuid()` | PK |
| aluno_id | UUID | NULL | — | FK → perfis(id) CASCADE |
| turma_id | UUID | NULL | — | FK → turmas(id) CASCADE |
| status_aluno | TEXT | NULL | `'ativo'` | Status: `ativo`, `trancado`, `formado`, etc. |
| data_matricula | DATE | NULL | — | Data da matrícula |
| created_at | TIMESTAMP | NULL | `NOW()` | — |

**Índices:** `idx_matriculas_aluno`, `idx_matriculas_turma`, `idx_matriculas_status`

---

### 8. aulas

> Registro de classe — cada entrada representa uma aula ministrada.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | `gen_random_uuid()` | PK |
| disciplina_id | UUID | NULL | — | FK → disciplinas(id) CASCADE (legado) |
| turma_disciplina_id | UUID | NULL | — | FK → turma_disciplinas(id) (atual) |
| professor_id | UUID | NULL | — | FK → perfis(id) SET NULL |
| data | DATE | NOT NULL | — | Data da aula |
| conteudo | TEXT | NOT NULL | — | Conteúdo ministrado |
| created_at | TIMESTAMP | NULL | `NOW()` | — |

**Índices:** `idx_aulas_professor`, `idx_aulas_disciplina`, `idx_aulas_turma_disciplina_id`, `idx_aulas_data`

---

### 9. boletim

> Notas e frequência por aluno e disciplina. Suporta avaliação numérica (N1/N2/N3/Rec) e avaliação de estágio (AP/REP).

| Coluna | Tipo | Nullable | Default | Constraint | Descrição |
|--------|------|----------|---------|-----------|-----------|
| id | UUID | NOT NULL | `gen_random_uuid()` | PK | — |
| aluno_id | UUID | NULL | — | FK → perfis(id) CASCADE | Aluno |
| disciplina | TEXT | NOT NULL | — | — | Nome da disciplina (texto) |
| disciplina_base_id | UUID | NULL | — | FK → disciplinas_base(id) | Referência ao catálogo |
| faltas | INTEGER | NULL | `0` | — | Número de faltas |
| n1 | DECIMAL | NULL | `0` | — | Nota 1 |
| n2 | DECIMAL | NULL | `0` | — | Nota 2 |
| n3 | DECIMAL | NULL | `0` | — | Nota 3 |
| rec | DECIMAL | NULL | `0` | — | Nota de recuperação |
| nota_estagio | TEXT | NULL | NULL | CHECK IN (`AP`,`REP`) | Resultado do estágio |
| estagio_parecer | TEXT | NULL | — | — | Parecer descritivo do estágio |
| status | TEXT | NULL | NULL | — | NULL=normal, `pendente`=falta cursar |
| versao | INTEGER | NULL | `1` | — | Bloqueio otimista |
| created_at | TIMESTAMP | NULL | `NOW()` | — | — |

**Constraints:** `UNIQUE(aluno_id, disciplina)`
**Índices:** `idx_boletim_aluno`, `idx_boletim_disciplina`, `idx_boletim_status`, `idx_boletim_versao`, `idx_boletim_estagio`
**Triggers:** `trigger_increment_versao_boletim`

---

### 10. solicitacoes

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | `gen_random_uuid()` | PK |
| user_id | UUID | NULL | — | FK → perfis(id) CASCADE |
| tipo | TEXT | NOT NULL | — | Tipo de documento solicitado |
| status | TEXT | NULL | `'pendente'` | Status da solicitação |
| criado_em | TIMESTAMP | NULL | `NOW()` | — |

**Índices:** `idx_solicitacoes_user`, `idx_solicitacoes_status`

---

### 11. responsaveis

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | `gen_random_uuid()` | PK |
| aluno_id | UUID | NULL | — | FK → perfis(id) CASCADE |
| nome | TEXT | NOT NULL | — | Nome do responsável |
| cpf | TEXT | NULL | — | CPF |
| telefone | TEXT | NULL | — | Telefone |
| email | TEXT | NULL | — | Email |
| parentesco | TEXT | NULL | — | Grau de parentesco |
| financeiro | BOOLEAN | NULL | `FALSE` | Responsável financeiro |
| principal | BOOLEAN | NULL | `FALSE` | Responsável principal |
| created_at | TIMESTAMP | NULL | `NOW()` | — |

---

### 12. observacoes_aluno

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | `gen_random_uuid()` | PK |
| aluno_id | UUID | NULL | — | FK → perfis(id) CASCADE |
| texto | TEXT | NOT NULL | — | Texto da observação |
| categoria | TEXT | NULL | — | Categoria da observação |
| criado_por | UUID | NULL | — | FK → perfis(id) |
| criado_em | TIMESTAMP | NULL | `NOW()` | — |

---

### 13. audit_log

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | `gen_random_uuid()` | PK |
| usuario_id | UUID | NULL | — | FK → perfis(id) |
| usuario_nome | TEXT | NULL | — | Nome do usuário (desnormalizado) |
| usuario_perfil | TEXT | NULL | — | Perfil do usuário (desnormalizado) |
| acao | TEXT | NOT NULL | — | Ação realizada |
| tabela_afetada | TEXT | NULL | — | Tabela afetada |
| registro_id | UUID | NULL | — | ID do registro afetado |
| descricao | TEXT | NULL | — | Descrição da ação |
| dados_antigos | JSONB | NULL | — | Snapshot antes da alteração |
| dados_novos | JSONB | NULL | — | Snapshot após a alteração |
| user_agent | TEXT | NULL | — | User-agent do navegador |
| created_at | TIMESTAMP | NULL | `NOW()` | — |

---

### 14. pagamentos

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | `gen_random_uuid()` | PK |
| aluno_id | UUID | NULL | — | FK → perfis(id) CASCADE |
| descricao | TEXT | NOT NULL | — | Descrição da cobrança |
| valor_original | DECIMAL(10,2) | NOT NULL | — | Valor original |
| valor_pago | DECIMAL(10,2) | NULL | — | Valor efetivamente pago |
| data_vencimento | DATE | NOT NULL | — | Data de vencimento |
| data_pagamento | DATE | NULL | — | Data do pagamento |
| status | TEXT | NULL | `'pendente'` | Status: pendente, pago, atrasado |
| metodo_pagamento | TEXT | NULL | — | Forma de pagamento |
| created_at | TIMESTAMP | NULL | `NOW()` | — |

**Índices:** `idx_pagamentos_aluno`, `idx_pagamentos_status`, `idx_pagamentos_vencimento`

---

### 15. financeiro_acordos

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | `gen_random_uuid()` | PK |
| aluno_id | UUID | NULL | — | FK → perfis(id) CASCADE |
| total_debito | DECIMAL(10,2) | NOT NULL | — | Total da dívida |
| total_com_desconto | DECIMAL(10,2) | NOT NULL | — | Total após desconto |
| numero_parcelas | INTEGER | NOT NULL | — | Número de parcelas |
| valor_parcela | DECIMAL(10,2) | NOT NULL | — | Valor de cada parcela |
| status | TEXT | NULL | `'ativo'` | Status do acordo |
| termo_assinado_url | TEXT | NULL | — | URL do termo assinado |
| created_at | TIMESTAMP | NULL | `NOW()` | — |

**Índices:** `idx_acordos_aluno`

---

### 16. financeiro_config

> Tabela de parâmetros financeiros globais (chave-valor).

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | `gen_random_uuid()` | PK |
| chave | TEXT | NOT NULL | — | UNIQUE — Identificador do parâmetro |
| valor | DECIMAL(10,4) | NOT NULL | — | Valor numérico |
| created_at | TIMESTAMP | NULL | `NOW()` | — |

**Seed:** `multa_atraso = 0.02`, `juros_mensal = 0.01`

---

### 17. certificados_modelos

| Coluna | Tipo | Nullable | Default | Constraint | Descrição |
|--------|------|----------|---------|-----------|-----------|
| id | UUID | NOT NULL | `gen_random_uuid()` | PK | — |
| nome | TEXT | NOT NULL | — | — | Nome do modelo |
| tipo_curso | TEXT | NOT NULL | — | CHECK IN (`tecnico`,`formacao`) | Tipo de curso |
| logo_path | TEXT | NULL | — | — | Caminho do logo |
| assinatura_path | TEXT | NULL | — | — | Caminho da assinatura |
| ativo | BOOLEAN | NULL | `true` | — | Modelo ativo |
| created_at | TIMESTAMPTZ | NULL | `now()` | — | — |
| updated_at | TIMESTAMPTZ | NULL | `now()` | — | — |

---

### 18. conteudo_programatico

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | `gen_random_uuid()` | PK |
| curso_id | UUID | NOT NULL | — | FK → cursos(id) CASCADE |
| disciplina | TEXT | NOT NULL | — | Nome da disciplina |
| carga_horaria | INTEGER | NOT NULL | — | Carga horária |
| modulo | TEXT | NULL | — | Módulo |
| ordem | INTEGER | NULL | `0` | Ordem de exibição |
| created_at | TIMESTAMPTZ | NULL | `now()` | — |

---

### 19. certificados

| Coluna | Tipo | Nullable | Default | Constraint | Descrição |
|--------|------|----------|---------|-----------|-----------|
| id | UUID | NOT NULL | `gen_random_uuid()` | PK | — |
| aluno_id | UUID | NOT NULL | — | FK → perfis(id) | Aluno |
| curso_id | UUID | NOT NULL | — | FK → cursos(id) | Curso |
| data_conclusao | DATE | NOT NULL | — | — | Data de conclusão |
| carga_horaria | INTEGER | NOT NULL | — | — | Carga horária total |
| codigo_autenticacao | TEXT | NOT NULL | — | UNIQUE | Código de autenticidade |
| emitido_por | UUID | NOT NULL | — | FK → perfis(id) | Quem emitiu |
| emitido_em | TIMESTAMPTZ | NULL | `now()` | — | Data de emissão |
| template_id | UUID | NULL | — | FK → certificados_modelos(id) | Template usado |

**Índices:** `idx_certificados_aluno`, `idx_certificados_curso`, `idx_certificados_codigo`

---

### 20. disciplinas (LEGADO — NÃO USAR)

> 🟡 **Mantida por compatibilidade.** Substituída por `disciplinas_base` + `turma_disciplinas`.

| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | UUID | NOT NULL | `gen_random_uuid()` | PK |
| nome | TEXT | NOT NULL | — | Nome |
| modulo | TEXT | NULL | — | Módulo |
| turma_id | UUID | NULL | — | FK → turmas(id) CASCADE |
| professor_id | UUID | NULL | — | FK → perfis(id) SET NULL |
| curso_id | UUID | NULL | — | FK → cursos(id) SET NULL |
| versao | INTEGER | NULL | `1` | Bloqueio otimista |
| created_at | TIMESTAMP | NULL | `NOW()` | — |
