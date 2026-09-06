# Relacionamentos — Sistema CSM

> 🟢 **CONFIRMADO** — Extraído de DDL (`schema.sql` v4.0, `migration.sql`, migrations)

---

## Sumário de Relacionamentos

| # | Tabela Origem | Coluna | Cardinalidade | Tabela Destino | ON DELETE | Observação |
|---|--------------|--------|--------------|----------------|-----------|-----------|
| 1 | `perfis` | `id` | 1:1 | `auth.users` | CASCADE | PK = FK de auth |
| 2 | `perfis_enderecos` | `user_id` | N:1 | `perfis` | CASCADE | — |
| 3 | `turmas` | `curso_id` | N:1 | `cursos` | SET NULL | — |
| 4 | `disciplinas_base` | `curso_id` | N:1 | `cursos` | — | — |
| 5 | `turma_disciplinas` | `turma_id` | N:1 | `turmas` | — | — |
| 6 | `turma_disciplinas` | `disciplina_base_id` | N:1 | `disciplinas_base` | — | — |
| 7 | `turma_disciplinas` | `professor_id` | N:1 | `perfis` | — | Perfil = professor |
| 8 | `matriculas` | `aluno_id` | N:1 | `perfis` | CASCADE | Perfil = aluno |
| 9 | `matriculas` | `turma_id` | N:1 | `turmas` | CASCADE | — |
| 10 | `aulas` | `turma_disciplina_id` | N:1 | `turma_disciplinas` | — | FK principal |
| 11 | `aulas` | `disciplina_id` | N:1 | `disciplinas` | CASCADE | FK legado |
| 12 | `aulas` | `professor_id` | N:1 | `perfis` | SET NULL | — |
| 13 | `boletim` | `aluno_id` | N:1 | `perfis` | CASCADE | — |
| 14 | `boletim` | `disciplina_base_id` | N:1 | `disciplinas_base` | — | nullable |
| 15 | `solicitacoes` | `user_id` | N:1 | `perfis` | CASCADE | — |
| 16 | `responsaveis` | `aluno_id` | N:1 | `perfis` | CASCADE | — |
| 17 | `observacoes_aluno` | `aluno_id` | N:1 | `perfis` | CASCADE | — |
| 18 | `observacoes_aluno` | `criado_por` | N:1 | `perfis` | — | nullable |
| 19 | `audit_log` | `usuario_id` | N:1 | `perfis` | — | nullable |
| 20 | `pagamentos` | `aluno_id` | N:1 | `perfis` | CASCADE | — |
| 21 | `financeiro_acordos` | `aluno_id` | N:1 | `perfis` | CASCADE | — |
| 22 | `conteudo_programatico` | `curso_id` | N:1 | `cursos` | CASCADE | — |
| 23 | `certificados` | `aluno_id` | N:1 | `perfis` | — | NOT NULL |
| 24 | `certificados` | `curso_id` | N:1 | `cursos` | — | NOT NULL |
| 25 | `certificados` | `emitido_por` | N:1 | `perfis` | — | NOT NULL |
| 26 | `certificados` | `template_id` | N:1 | `certificados_modelos` | — | nullable |
| 27 | `disciplinas` | `turma_id` | N:1 | `turmas` | CASCADE | LEGADO |
| 28 | `disciplinas` | `professor_id` | N:1 | `perfis` | SET NULL | LEGADO |
| 29 | `disciplinas` | `curso_id` | N:1 | `cursos` | SET NULL | LEGADO |

---

## Relacionamentos N:M (via tabelas de junção)

### aluno ↔ turma (via matriculas)
```
perfis (aluno) ──< matriculas >── turmas
```
- Um aluno pode estar em **múltiplas turmas** (ex: repetência, cursos paralelos)
- Uma turma pode ter **múltiplos alunos**
- Status da matrícula é armazenado na própria tabela de junção

### turma ↔ disciplina_base ↔ professor (via turma_disciplinas)
```
turmas ──< turma_disciplinas >── disciplinas_base
                  |
               perfis (professor)
```
- Uma turma pode ter **múltiplas disciplinas** ofertadas
- Uma disciplina pode ser ofertada em **múltiplas turmas**
- Cada oferta tem um professor responsável específico
- **UNIQUE** em `(turma_id, disciplina_base_id)` — impede duplicidade de oferta

---

## Polimorfismo e Auto-referências

### perfis — tabela central polimórfica
A tabela `perfis` centraliza **todos os tipos de usuário** no mesmo registro.
O campo `perfil` (TEXT) define o papel:

| Valor | Papel |
|-------|-------|
| `aluno` | Aluno do curso |
| `professor` | Professor |
| `secretaria` | Funcionário da secretaria |
| `admin` | Administrador da escola |
| `financeiro` | Funcionário do financeiro |
| `coordenacao` | Coordenador |
| `master_admin` | Super-administrador |

> 🟡 **INFERIDO** — Não há tabela separada por papel; a distinção é feita por RLS policies via `perfil IN (...)`.

### observacoes_aluno — auto-referência
```
perfis (aluno)     ──< observacoes_aluno
perfis (criado_por) ──< observacoes_aluno
```
O criador da observação também é um `perfis` (normalmente admin/secretaria).

---

## Relacionamentos Transitivos Relevantes

### professor → alunos que ele leciona
```
perfis (professor)
  └─> turma_disciplinas (professor_id)
        └─> matriculas.turma_id = turma_disciplinas.turma_id
              └─> perfis (aluno)
```
Usado na RLS policy `check_professor_can_view_student()`.

### professor → notas que ele pode editar
```
perfis (professor)
  └─> turma_disciplinas (professor_id)
        └─> JOIN matriculas ON matriculas.turma_id = turma_disciplinas.turma_id
              └─> boletim (aluno_id = matriculas.aluno_id AND disciplina_base_id = turma_disciplinas.disciplina_base_id)
```
Implementado via RLS policy `Professores manage specific grades`.

---

## Tabelas sem Relacionamentos Externos (independentes)

| Tabela | Motivo |
|--------|--------|
| `financeiro_config` | Configuração global — sem FK |
| `audit_log` | FK para perfis é nullable (log pode existir sem usuário vinculado) |

---

## Observação: Duplicidade de FK em `aulas`

A tabela `aulas` possui **duas FKs para disciplinas**:
- `disciplina_id` → `disciplinas` (tabela legada, CASCADE)
- `turma_disciplina_id` → `turma_disciplinas` (tabela atual)

> 🔴 **LACUNA** — Não está claro se registros novos usam apenas `turma_disciplina_id` ou ambos. Requer validação humana ao analisar dados reais.
