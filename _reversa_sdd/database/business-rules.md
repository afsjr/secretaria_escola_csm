# Regras de Negócio no Banco — Sistema CSM

> 🟢 **CONFIRMADO** — Extraído de triggers, functions e RLS policies dos arquivos DDL

---

## 1. Triggers

### trigger_increment_versao_boletim
- **Tabela:** `boletim`
- **Evento:** `BEFORE UPDATE`
- **Condição:** `WHEN (OLD.versao IS NOT DISTINCT FROM NEW.versao)`
- **Ação:** `NEW.versao := OLD.versao + 1`
- **Propósito:** Controle de concorrência (Optimistic Locking). Detecta edições simultâneas — se dois usuários editam o mesmo registro, o segundo recebe erro de versão.

### trigger_increment_versao_perfis
- **Tabela:** `perfis`
- **Evento:** `BEFORE UPDATE`
- **Condição:** `WHEN (OLD.versao IS NOT DISTINCT FROM NEW.versao)`
- **Ação:** `NEW.versao := OLD.versao + 1`
- **Propósito:** Mesmo que acima, para dados de alunos/usuários.

### trigger_increment_versao_disciplinas
- **Tabela:** `disciplinas` (legado)
- **Evento:** `BEFORE UPDATE`
- **Condição:** `WHEN (OLD.versao IS NOT DISTINCT FROM NEW.versao)`
- **Ação:** `NEW.versao := OLD.versao + 1`

### trigger_increment_versao_turmas
- **Tabela:** `turmas`
- **Evento:** `BEFORE UPDATE`
- **Condição:** `WHEN (OLD.versao IS NOT DISTINCT FROM NEW.versao)`
- **Ação:** `NEW.versao := OLD.versao + 1`

### trigger_increment_versao_cursos
- **Tabela:** `cursos`
- **Evento:** `BEFORE UPDATE`
- **Condição:** `WHEN (OLD.versao IS NOT DISTINCT FROM NEW.versao)`
- **Ação:** `NEW.versao := OLD.versao + 1`

### on_auth_user_created
- **Tabela alvo:** `auth.users` (Supabase Auth)
- **Evento:** `AFTER INSERT`
- **Ação:** Insere em `perfis` com `perfil = 'aluno'` e `primeiro_acesso = TRUE`
- **Propósito:** Todo novo usuário criado no Auth automaticamente recebe um perfil de aluno.
- **Código:**
```sql
INSERT INTO public.perfis (id, email, nome_completo, perfil, primeiro_acesso)
VALUES (new.id, new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Usuário'),
        'aluno', TRUE)
ON CONFLICT (id) DO NOTHING;
```

---

## 2. Functions (SECURITY DEFINER)

### check_user_is_admin_or_secretaria()
- **Retorno:** BOOLEAN
- **Segurança:** SECURITY DEFINER (evita recursão RLS)
- **search_path:** public
- **Lógica:**
```sql
EXISTS (
  SELECT 1 FROM public.perfis
  WHERE id = auth.uid()
  AND perfil IN ('admin', 'secretaria', 'master_admin', 'financeiro')
)
```
- **Uso:** Usada por 12+ políticas RLS como guard de acesso administrativo.
- **Versão mais recente** inclui `'financeiro'` no conjunto de perfis autorizados.

### check_professor_can_view_student(student_id UUID)
- **Retorno:** BOOLEAN
- **Segurança:** SECURITY DEFINER (evita recursão RLS)
- **Lógica:**
```sql
EXISTS (
  SELECT 1 FROM public.turma_disciplinas td
  JOIN public.matriculas m ON m.turma_id = td.turma_id
  WHERE td.professor_id = auth.uid()
  AND m.aluno_id = student_id
)
```
- **Uso:** Política `Professores view students from their turmas` em `perfis`. Professores só enxergam alunos das turmas que lecionam.

### increment_versao()
- **Retorno:** TRIGGER
- **Lógica:** `NEW.versao := OLD.versao + 1`
- **Uso:** Chamada por todos os triggers de bloqueio otimista.

---

## 3. Row Level Security (RLS) — Políticas por Tabela

### perfis
| Política | Operação | Perfis Autorizados | Condição |
|----------|----------|-------------------|----------|
| Admin/Secretaria total access | ALL | admin, secretaria, master_admin, financeiro | `check_user_is_admin_or_secretaria()` |
| Users can view own profile | SELECT | qualquer autenticado | `auth.uid() = id` |
| Users can update own profile | UPDATE | qualquer autenticado | `auth.uid() = id` |
| Professores view students from their turmas | SELECT | professor | `check_professor_can_view_student(id)` |

### boletim
| Política | Operação | Perfis Autorizados | Condição |
|----------|----------|-------------------|----------|
| Admin/Secretaria boletim access | ALL | admin, secretaria, master_admin, financeiro | `check_user_is_admin_or_secretaria()` |
| Professores manage specific grades | ALL | professor | join via turma_disciplinas + matriculas (disciplina específica) |
| Students view own grades | SELECT | aluno | `auth.uid() = aluno_id` |

> ⚠️ Professores só editam notas de alunos **das disciplinas que lecionam** — granularidade por `disciplina_base_id`.

### matriculas
| Política | Operação | Condição |
|----------|----------|----------|
| Admin/Secretaria matriculas access | ALL | `check_user_is_admin_or_secretaria()` |
| Students view own matriculas | SELECT | `auth.uid() = aluno_id` |

### solicitacoes
| Política | Operação | Condição |
|----------|----------|----------|
| Admin/Secretaria solicitacoes access | ALL | `check_user_is_admin_or_secretaria()` |
| Students manage own requests | ALL | `auth.uid() = user_id` |

### aulas
| Política | Operação | Condição |
|----------|----------|----------|
| View aulas authenticated | SELECT | aluno matriculado na turma OU admin/secretaria |
| Professores manage own aulas | ALL | `turma_disciplinas.professor_id = auth.uid()` |
| Admin manage all aulas | ALL | `check_user_is_admin_or_secretaria()` |

### pagamentos
| Política | Operação | Condição |
|----------|----------|----------|
| Admin e Financeiro podem gerenciar pagamentos | ALL | perfil IN ('admin', 'financeiro') |
| Alunos podem ver seus próprios pagamentos | SELECT | `aluno_id = auth.uid()` |

### financeiro_acordos
| Política | Operação | Condição |
|----------|----------|----------|
| Admin e Financeiro podem gerenciar acordos | ALL | perfil IN ('admin', 'financeiro') |

### certificados
| Política | Operação | Condição |
|----------|----------|----------|
| certificados_select_aluno | SELECT | `aluno_id = auth.uid()` |
| certificados_select_admin | SELECT | perfil IN ('master_admin', 'admin', 'secretaria') |
| certificados_insert_policy | INSERT | perfil IN ('master_admin', 'admin', 'secretaria') |

### certificados_modelos
| Política | Operação | Condição |
|----------|----------|----------|
| select_policy | SELECT | qualquer autenticado |
| insert/update/delete | ALL | apenas `master_admin` |

---

## 4. Constraints com Lógica de Negócio

### boletim — UNIQUE(aluno_id, disciplina)
> Um aluno só pode ter **um único registro por disciplina** no boletim. Impede duplicidade de notas.

### turma_disciplinas — UNIQUE(turma_id, disciplina_base_id)
> Uma disciplina do catálogo só pode ser ofertada **uma vez por turma**.

### boletim.nota_estagio — CHECK IN ('AP', 'REP')
> A nota de estágio só aceita valores `AP` (Aprovado) ou `REP` (Reprovado). Não há nota numérica para estágio.

### cursos.tipo — CHECK IN ('saude', 'tecnico', 'outro', 'formacao')
> Restringe os tipos de curso aos valores válidos do domínio.

### certificados.codigo_autenticacao — UNIQUE
> Cada certificado emitido tem um código de autenticação único, usado para verificação de autenticidade.

---

## 5. Configurações de Negócio Embutidas no Banco

### financeiro_config (seed)
| Chave | Valor | Significado |
|-------|-------|-------------|
| `multa_atraso` | 0.02 | 2% de multa por atraso |
| `juros_mensal` | 0.01 | 1% de juros mensais |

> 🟡 **INFERIDO** — O cálculo de juros/multa é feito no frontend (iteração manual sem SQL aggregation, conforme checkpoint do Archaeologist).

---

## 6. Problema Detectado — RLS Recursivo (Resolvido)

### Problema original
Políticas de `perfis` referenciavam `matriculas`, que por sua vez referenciavam `perfis` via outras políticas — causando recursão infinita.

### Solução aplicada
Criação de funções `SECURITY DEFINER` com `SET search_path = public`:
- `check_user_is_admin_or_secretaria()` — quebra o ciclo para tabelas administrativas
- `check_professor_can_view_student()` — quebra o ciclo para acesso de professores a alunos

> 🟢 **CONFIRMADO** — Documentado em comentários do `rls_fix.sql` e migrations de 2026-05-23.
