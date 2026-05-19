# Análise de Código — secretary_escola_csm

> Gerado pelo Archaeologist em 2026-05-19
> Nível de documentação: detalhado
> Confidence: 🟢 ALTA para 8/9 módulos, 🟡 MÉDIA para financeiro

---

## Visão Geral do Sistema

Sistema de gestão escolar CSM (Secretaria) com arquitetura SPA + Backend-as-a-Service (Supabase).  
Linguagem: TypeScript (strict mode)  
Stack: Vite + Supabase (Auth + PostgreSQL + Edge Functions) + Vitest

---

## 🔐 Módulo: Auth

**Arquivos:** `src/auth/session.ts`, `src/auth/signup-handler.ts`

### Fluxo de Controle

```
Login:
  email + password → supabase.auth.signInWithPassword → startSessionTimeout()

Logout:
  stopSessionTimeout → supabase.auth.signOut

Reset Password:
  email → redirectTo dinâmico → supabase.auth.resetPasswordForEmail

Get Session:
  getSession() → verifica timeout (30min) → se expired → logout + toast
```

### Algoritmos Importantes

1. **Session Timeout** (30 minutos)
   - `SESSION_TIMEOUT_MS = 30 * 60 * 1000`
   - Verificação periódica a cada 60s via `setInterval`
   - Tratamento especial para recovery flow (ignora timeout)

2. **Redirect URL dinâmico**
   ```typescript
   const basePath = window.location.pathname.replace(/\/$/, '')
   const redirectTo = `${window.location.origin}${basePath}/#/reset-password`
   ```

3. **Rollback em registro**
   - Se perfil não for criado, tenta deletar usuário auth (implementação parcial)

### Estruturas de Dados

| Entidade | Campos |
|----------|--------|
| Session | access_token, refresh_token, expires_at, user |
| UserProfile | id, email, nome_completo, perfil, cpf, telefone, etc. |

---

## 👥 Módulo: Admin

**Arquivos:** `src/lib/admin-service.ts`

### Fluxo de Controle

```
createUserByAdmin:
  tenta supabaseAdmin direto
  senão → Edge Function (admin-create-user)
  senão → fallback desenvolvimento

matricularAluno:
  verifica se já está ativo em outra turma
  → insert + auditoria

updateAluno:
  remove campos sensíveis (perfil, email, id, bloqueio_financeiro)
  → update com filtro perfil='aluno'

resetUserPassword:
  tenta Edge Function (admin-reset-password)
  senão → supabaseAdmin (fallback)
  → senha padrão: csm1983#
  → marca force_password_change
```

### Algoritmos Importantes

1. **Fallback Chain de 3 níveis**
   ```typescript
   if (supabaseAdmin) → admin direto
   else if (EDGE_FUNCTIONS_BASE_URL) → Edge Function
   else → modo desenvolvimento (aviso)
   ```

2. **Proteção contra Escalada de Privilégios**
   ```typescript
   delete safeUpdates.perfil
   delete safeUpdates.email
   delete safeUpdates.id
   delete safeUpdates.bloqueio_financeiro
   ```

3. **Auditoria de Operações**
   - Todas as operações admin logam via `AuditService.log()`

---

## 📚 Módulo: Academic

**Arquivos:** `src/lib/academic-service.ts`

### Fluxo de Controle

```
Turmas:
  getTurmas → supabase (ordered by periodo desc, nome asc)
  createTurma → insert
  updateTurma → update
  deleteTurma → delete (verifica matrículas ativas)

Matrículas:
  matricularAluno → verifica se já ativo em outra turma → insert
  getAlunosDaTurma → matriculas + perfis (nested)
  atualizarStatusAdministrativo → update perfis.bloqueio_financeiro + matriculas.status_aluno

Notas:
  getDisciplinasDaTurma → deduplicação por Nome + Módulo
  getNotasCompletasTurma → matriculas + notas (map by aluno_id)
  upsertNotaEstagio → verifica existência → update ou insert (com versao)
```

### Algoritmos Importantes

1. **Deduplicação de Disciplinas**
   ```typescript
   const normalizedName = disc.nome.toLowerCase().trim().replace(/\s+/g, ' ')
   const normalizedModulo = (disc.modulo || '').toLowerCase().trim()
   const key = `${normalizedName}-${normalizedModulo}`
   ```

2. **Controle de Versão em Notas**
   ```typescript
   versao: (existente.versao || 1) + 1
   ```

3. **Validação de Matrícula**
   - Impede aluno ativo em outra turma

---

## 👨‍🏫 Módulo: Professor

**Arquivos:** `src/lib/professor-service.ts`

### Fluxo de Controle

```
Disciplinas/Ofertas:
  getDisciplinasDoProfessor → turma_disciplinas + disciplinas_base + turmas + cursos
  getAllOfertas → todas as ofertas (para secretaria)
  vincularProfessorAOferta → update professor_id

Notas:
  getNotasDaDisciplina → matriculas + bulletin (disciplina_base_id)
  salvarNota → verifica existência → update (com lock) ou insert
  salvarNotasEmLote → Promise.all de salvarNota

Aulas:
  registrarAula → insert + auditoria
  getAulasDaOferta → aulas + perfis
  getAulasDoProfessor → aulas + turma_disciplinas + disciplinas_base + turmas
```

### Algoritmos Importantes

1. **Controle de Concorrência (Optimistic Lock)**
   ```typescript
   const resultado = await updateWithLock('boletim', notaExistente.id, dados, versaoAtual)
   ```

2. **Busca de Notas por disciplina_base_id**
   - Substitui busca por nome antigo

3. **Batch de Notas**
   ```typescript
   const results = await Promise.all(promises)
   const error = results.find(r => r.error)?.error
   ```

---

## 📖 Módulo: Course

**Arquivos:** `src/lib/course-service.ts`

### Fluxo de Controle

```
Cursos:
  getCursos → todos
  getCursosAtivos → filtro ativo=true
  createCurso → insert
  desativarCurso / reativarCurso → update ativo

Matriz Curricular:
  getMatrizCurricular → disciplinas_base where curso_id → order by modulo, nome

Ofertas:
  getOfertasDaTurma → turma_disciplinas + disciplinas_base + perfis (professor)
  criarOfertaDisciplina → insert (turma_id + disciplina_base_id + professor_id)
  atribuirProfessorAEstrutura → update professor_id
  removerOfertaDisciplina → delete
```

### Estrutura de Dados

| Entidade | Descrição |
|----------|------------|
| Curso | id, nome, descricao, ativo |
| DisciplinaBase | id, nome, modulo, curso_id, carga_horaria |
| TurmaDisciplina | id, turma_id, disciplina_base_id, professor_id |

---

## 🎓 Módulo: Student

**Arquivos:** `src/lib/student-details-service.ts`

### Fluxo de Controle

```
Endereço:
  getEndereco → perfis_enderecos (user_id)
  saveEndereco → upsert (get → insert ou update)
  deleteEndereco → delete

Responsáveis:
  getResponsaveis → responsaveis (aluno_id) → order by principal desc, nome asc
  addResponsavel → insert
  updateResponsavel → update
  deleteResponsavel → delete

Observações:
  getObservacoes → observacoes_aluno + criado_por_perfis (nested)
  addObservacao → insert (com usuario_id do session)
  updateObservacao → update
  deleteObservacao → delete

Dados Completos:
  getAlunoCompleto → perfil + endereco + responsaveis + observacoes + matricula
  (paralelo via Promise não utilizado - sequencial)
```

### Algoritmos Importantes

1. **Upsert de Endereço**
   ```typescript
   const { data: existing } = await this.getEndereco(userId)
   if (existing) → update else → insert
   ```

2. **Menor de Idade via RPC**
   ```typescript
   await supabase.rpc('aluno_eh_menor', { aluno_id })
   ```

---

## 📄 Módulo: Documents

**Arquivos:** `src/lib/documents-service.ts` | Complexity: LOW

### Fluxo de Controle

```
createRequest → insert (user_id, tipo='pendente')
getMyRequests → select where user_id
getAllOpenRequests → select * (admin)
updateStatus → update status
```

---

## 💰 Módulo: Financeiro

**Arquivos:** `src/lib/financeiro-service.ts` | Confidence: 🟡 MÉDIO

### Fluxo de Controle

```
getResumo → pagamentos (todos) → itera para somar
getInadimplentes → perfis + pagamentos (join) where status='atrasado'
getHistoricoAluno → pagamentos where aluno_id
criarAcordo → insert acordo + update pagamentos para 'acordo'
getConfig → financiero_config → transforma em key-value object
```

### Algoritmos Importantes

1. **Resumo sem SQL Aggregation**
   ```typescript
   pagamentos.forEach((p: any) => {
     if (p.status === 'atrasado') { ... }
     if (p.status === 'pago') { ... }
   })
   ```

2. **Acordo em 2 fases**
   - Cria acordo
   - Atualiza pagamentos para 'acordo'

---

## 📋 Módulo: Audit

**Arquivos:** `src/lib/audit-service.ts`

### Fluxo de Controle

```
log → try-catch → getUserProfile → insert (não-bloqueante)
getLogs → query com filtros + paginação
getUniqueActions → extract unique from array
getCountsBySeverity → itera para contar
getHighSeverityLogs → filtra por severity mapping
```

### Algoritmos Importantes

1. **Log Não-Bloqueante**
   ```typescript
   if (error) { console.error(...); return { error: null } }
   ```

2. **Mapeamento de Severidade**
   ```typescript
   const ACTION_SEVERITY = {
     "reset_senha": "alta",
     "delete_usuario": "alta",
     "lancar_nota": "media",
     "login_sucesso": "baixa"
   }
   ```

3. **Helper withAudit**
   ```typescript
   export async function withAudit(fn, { acao, tabela_afetada, descricao }) {
     return async function(...args) {
       const result = await fn(...args)
       if (!result.error) { await AuditService.log(...) }
       return result
     }
   }
   ```

---

## 🔗 Padrões Transversais

### Controle de Concorrência

Arquivo: `src/lib/concurrency-control.ts`
- Optimistic locking via campo `versao`
- `updateWithLock(table, id, data, expectedVersion)`

### Validação

Arquivo: `src/lib/validation.ts`
- Zod schemas para validação runtime

### Autenticação/Autorização

Arquivo: `src/lib/authz.ts`
- RBAC via `hasPermission(role, action)`

### Rate Limiting

Arquivo: `src/lib/rate-limiter.ts`
- Limite de requisições por IP/session

---

## 📊 Métricas

| Métrica | Valor |
|---------|-------|
| Total Módulos | 9 |
| Total LOC (serviços) | ~2256 |
| Complexidade Alta | admin, academic, professor |
| Complexidade Média | auth, course, student, financeiro, audit |
| Complexidade Baixa | documents |

---

## ⚠️ Observações

1. **Financeiro**: Sem agregações SQL, iteração manual (performance)
2. **Student**: getAlunoCompleto() não usa Promise.all (sequencial)
3. **Auth**: Rollback de registro incompleto
4. **Frequência**: Implementação simplificada (log-only)

---

## Próximo Passo

O Detetive vai extrair regras de negócio implícitas, ADRs retroativos e matriz de permissões.