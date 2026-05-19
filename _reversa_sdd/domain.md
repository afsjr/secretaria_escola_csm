# Domínio — secretary_escola_csm

> Gerado pelo Detective em 2026-05-19
> Confidence: 🟡 INFERIDO (baseado em código + git)

---

## Glossário de Termos de Domínio

| Termo | Definição | Código |
|-------|-----------|--------|
| **SGE** | Sistema de Gestão Escolar | — |
| **CSM** | Centro de Serviços Múltiplos (nome do projeto) | — |
| **Matrícula** | Vinculo ativo entre aluno e turma | `matriculas` |
| **Oferta** | Vinculo entre turma e disciplina (com professor) | `turma_disciplinas` |
| **Disciplina Base** | Disciplina do catálogo do curso | `disciplinas_base` |
| **Boletim** | Registro de notas de um aluno | `boletim` |
| **Estágio** | Disciplina especial com notas separadas | — |
| **Turma Fechada** | Turma que não aceita novas matrículas | `status_ingresso='fechada'` |
| **Bloqueio Financeiro** | Impedimento de atividades por inadimplência | `bloqueio_financeiro` |
| **RLS** | Row Level Security — segurança em nível de linha | PostgreSQL |
| **Upsert** | Insert ou Update conforme existência | — |

---

## Regras de Negócio Implícitas

### RB01: Um aluno pode ter apenas uma matrícula ativa por vez

**Evidência:** `admin-service.ts:218-230`
```typescript
const { data: matriculasAtivas } = await supabase
  .from('matriculas')
  .select('id')
  .eq('aluno_id', alunoId)
  .eq('status_aluno', 'ativo')

if (matriculasAtivas && matriculasAtivas.length > 0) {
  return { error: { message: 'Este aluno já está matriculado em outra turma...' } }
}
```

**Trigger:** Ao tentar matricular um aluno
**Consequência:** Bloqueio de matrícula em duas turmas simultâneas

---

### RB02: Notas devem estar entre 0 e 10

**Evidência:** `validation.ts:115-136`
```typescript
.refine((val) => val >= 0 && val <= 10, {
  message: "Nota deve estar entre 0 e 10",
})
```

**Trigger:** Ao salvar qualquer nota (n1, n2, n3, rec)
**Consequência:** Validação client-side + server-side via Zod

---

### RB03: Controle de concorrência em notas (Optimistic Locking)

**Evidência:** `concurrency-control.ts`
```typescript
.eq("versao", currentVersion)
```

**Trigger:** Ao salvar nota que já existe
**Consequência:** Se versão não bater, retorna erro de conflito ("Dados foram modificados por outro usuário")

---

### RB04: Não é possível excluir turma com matrículas ativas

**Evidência:** Git commit `8d6ad53` — "prevent turma deletion if students are enrolled"

**Trigger:** Ao tentar excluir turma via `deleteTurma()`
**Consequência:** Verifica existência de matrículas ativas antes de deletar

---

### RB05: Sessão expira após 30 minutos de inatividade

**Evidência:** `session.ts:6`
```typescript
const SESSION_TIMEOUT_MS = 30 * 60 * 1000
```

**Trigger:** Tempo sem interação
**Consequência:** Logout automático + redirecionamento para login

---

### RB06: Senha deve ter pelo menos 8 caracteres com letras e números

**Evidência:** `validation.ts:56-63`
```typescript
.min(8, "A senha deve ter pelo menos 8 caracteres")
.refine((val) => /[A-Za-z]/.test(val), { message: "Deve conter pelo menos uma letra" })
.refine((val) => /\d/.test(val), { message: "Deve conter pelo menos um número" })
```

---

### RB07: Reset de senha define senha padrão + força mudança

**Evidência:** `admin-service.ts:400`
```typescript
password: 'csm1983#',
user_metadata: { force_password_change: true }
```

**Trigger:** Admin reseta senha de usuário
**Consequência:** Usuário deve trocar senha no próximo login

---

### RB08: Recuperação de senha ignora timeout de sessão

**Evidência:** Git commit `9f48c71` — "allow recovery flows to bypass session timeout"

**Trigger:** URL contém `type=recovery` ou `type=email`
**Consequência:** Fluxo de recovery não verifica timeout

---

### RB09: Disciplinas com estágio têm lógica separada

**Evidência:** Git commits sobre `nota_estagio`, `upsertNotaEstagio`

**Trigger:** Operações em disciplinas de estágio
**Consequência:** Campo separado `nota_estagio` em `boletim`

---

### RB10: CPF deve validar algoritmo brasileiro

**Evidência:** `validation.ts:141-172`
- Verificação de 11 dígitos
- Verificação de dígitos repetidos (111.111.111-11)
- Validação dos dois dígitos verificadores

---

### RB11: Proteção contra escalada de privilégios

**Evidência:** `admin-service.ts:304-308`
```typescript
delete safeUpdates.perfil
delete safeUpdates.email
delete safeUpdates.id
delete safeUpdates.bloqueio_financeiro
```

**Trigger:** Update de perfil via admin
**Consequência:** Admin não pode escalar privilégios de usuário

---

### RB12: Matriz curricular dedup por nome + módulo

**Evidência:** `academic-service.ts:139-152`
```typescript
const normalizedName = disc.nome.toLowerCase().trim().replace(/\s+/g, ' ')
const normalizedModulo = (disc.modulo || '').toLowerCase().trim()
const key = `${normalizedName}-${normalizedModulo}`
```

**Trigger:** Listar disciplinas de uma turma
**Consequência:** Evita duplicatas visuais na UI

---

## Regras de Domínio por Tipo de Entidade

### Aluno (`perfis.perfil = 'aluno'`)
- Pode ter responsável (se menor de idade)
- Pode ter bloqueio financeiro
- Tem status: ativo, trancado, evadido, concluido

### Professor (`perfis.perfil = 'professor'`)
- Vinculado a ofertas (turma_disciplinas)
- Pode registrar aulas
- Pode lançar notas

### Turma (`turmas`)
- Período: matutino, vespetino, noturno
- Status ingresso: aberta, fechada
- Pertence a um curso

---

## Integrações de Negócio

| Integração | Descrição |
|------------|-----------|
| Supabase Auth | Autenticação de usuários |
| Supabase Database | Persistência + RLS |
| Edge Functions | Operações admin (create user, reset password) |
| Vercel | Deploy da aplicação SPA |

---

## Gaps Identificados 🔴

1. **Frequência**: Implementação simplificada (log-only), sem tabela de presença
2. **Menor de idade**: RPC `aluno_eh_menor` existe mas não está documentada
3. **Rollback de registro**: Implementação parcial (try-catch sem delete real)

---

## Próximo Passo

O Arquiteto vai gerar diagramas C4 e ERD completo.