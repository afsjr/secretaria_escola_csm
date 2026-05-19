# 📋 Plano de Limpeza e Consolidação do Sistema de Notas

Com base na análise detalhada do codebase, identifiquei os problemas que estão causando erros de compilação e funcionalidades quebradas. Este plano guia a próxima sessão de implementação.

---

## 🎯 Objetivo Principal

Restaurar a funcionalidade de Notas de Estágio e eliminar os erros de TypeScript para que o sistema compile limpo.

---

## 🔍 Problemas Identificados e Soluções

### 1. AcademicService - Função upsertNotaEstagio deletada
**Problema**: A função que salvava notas de estágio foi removida durante a normalização. O NotasEstagioTab.ts tenta chamar algo que não existe.

**Solução**: Adicionar dois métodos ao AcademicService:

```typescript
// No arquivo src/lib/academic-service.ts, adicionar:

// Buscar nota de estágio de uma disciplina
async getNotaEstagio(aluno_id: string, disciplina_base_id: string) {
  const { data } = await supabase
    .from('boletim')
    .select('*')
    .eq('aluno_id', aluno_id)
    .eq('disciplina_base_id', disciplina_base_id)
    .single()
  return { data, error: data ? null : { message: 'Não encontrada' } }
}

// Salvar nota de estágio
async upsertNotaEstagio(aluno_id: string, disciplina_base_id: string, valor: number) {
  const { error } = await supabase
    .from('boletim')
    .upsert({
      aluno_id,
      disciplina_base_id,
      disciplina: null,
      nota_estagio: valor
    }, { onConflict: 'aluno_id,disciplina_base_id' })
  return { error }
}
```

---

### 2. NotasEstagioTab.ts - Usar o novo modelo
**Problema**: O componente ainda usa nomes de disciplinas como referência. Agora precisa usar `disciplina_base_id`.

**Arquivo**: `src/components/Tabs/NotasEstagioTab.ts`

**Solução**:
- Mudar o seletor de disciplinas para usar `disciplina_base_id` como value
- Na hora de salvar, chamar `AcademicService.upsertNotaEstagio(alunoId, disciplinaBaseId, valor)`

---

### 3.Mocks desatualizados no secretaria.test.ts
**Problema**: O mock do AcademicService não inclui os novos métodos.

**Arquivo**: `src/views/secretaria.test.ts`

**Solução**: Atualizar o mock para incluir:
```typescript
vi.mock('../lib/academic-service', () => ({
  AcademicService: {
    getTurmas: vi.fn().mockResolvedValue({ data: [], error: null }),
    getAlunosDaTurma: vi.fn().mockResolvedValue({ data: [], error: null }),
    getBoletim: vi.fn().mockResolvedValue({ data: [], error: null }),
    updateNotaEstagio: vi.fn().mockResolvedValue({ data: null, error: null }),
    getNotaEstagio: vi.fn().mockResolvedValue({ data: null, error: null }),
    upsertNotaEstagio: vi.fn().mockResolvedValue({ error: null }),
  }
}))
```

---

### 4.Métodos faltando no ProfessorService
**Problema**: Vários métodos que as views usam foram removidos durante a normalização:
- `contarAlunosTurma`
- `getAulasDaDisciplina`
- `atualizarAula`
- `excluirAula`
- `salvarFrequencia`

**Arquivo**: `src/lib/professor-service.ts`

**Solução**: Restaurar esses métodos com a nova estrutura de ofertas/turma_disciplina_id. Verificar as chamadas em:
- `src/views/professor-turmas.ts`
- `src/views/professor-registrar-aula.ts`

---

### 5.AcademicoView - Código órfão e com erros
**Problema**: O arquivo `src/views/academico.ts`:
- Não está sendo usado em lugar nenhum (verificar com grep)
- Tem erros de variáveis indefinidas (`nota`)
- Usa serviços antigos deletados

**Solução**:
1. Verificar se é usado: `grep -r "AcademicoView" src/`
2. Se não for usado → **DELETAR** o arquivo

---

### 6.Erros de literais em arquivos de teste
**Problema**: O TypeScript reclama de comparações impossíveis como `if (x === 5)` quando `x` é literal `3`.

**Arquivos afetados**:
- `src/lib/concurrency-control.test.ts`
- `src/lib/professor-service.test.ts`
- `src/lib/student-details-service.test.ts`

**Solução**: Usar tipos genéricos:
```typescript
// De:
const esperado = 3
// Para:
const esperado: number = 3
```

---

### 7.Professor-alunos.ts - Campos desatualizados
**Problema**: O arquivo usa `getTurmasDoProfessor` (deletado) em vez de `getDisciplinasDoProfessor`.

**Arquivo**: `src/views/professor-alunos.ts`

**Solução**:
- Atualizar para usar `getDisciplinasDoProfessor`
- Ajustar para ler `turmas` do join (não mais singular)
- Ajustar para iterar com o novo modelo

---

### 8.Professor-registrar-aula.ts - Campos desatualizados
**Problema**: Usa `disciplina_id` em vez de `turma_disciplina_id`.

**Arquivo**: `src/views/professor-registrar-aula.ts`

**Solução**:
- Mudar `disciplina_id` para `turma_disciplina_id` nos formulários
- Atualizar `registrarAula` para usar o novo campo
- Corrigir acesso no `loadHistoricoAulas`: `disc.disciplinas_base.nome`

---

### 9.RequestTable.ts - Chamada de serviço desatualizada
**Problema**: Usa `getDisciplinasDoCurso` que foi renomeado.

**Arquivo**: `src/components/RequestTable.ts`

**Solução**:
```typescript
// Mudar de:
CourseService.getDisciplinasDoCurso(...)
// Para:
CourseService.getMatrizCurricular(...)
```

---

### 10.Validation.test.ts - Acesso a propriedade errada
**Problema**: Tentando acessar `.errors` quando o tipo não garante essa propriedade.

**Solução**: Usar guards de tipo:
```typescript
if (!result.success) {
  expect(result.errors).toBeDefined()
}
```

---

## 📊 Estatísticas da Análise

| Métrica | Valor |
|---------|-------|
| Erros type-check iniciais | ~50 |
| Erros após correção estimada | ~7 |
| Arquivos com problemas | 10 |
| Linhas modificadas (estimado) | ~300 |

---

## ✅ Checklist de Execução

- [ ] Adicionar `getNotaEstagio` e `upsertNotaEstagio` ao AcademicService
- [ ] Atualizar NotasEstagioTab.ts para usar disciplina_base_id
- [ ] Atualizar mocks no secretaria.test.ts
- [ ] Restaurar métodos faltando no ProfessorService
- [ ] Verificar se AcademicoView é usado → deletar se não for
- [ ] Corrigir erros de literais em 3 arquivos de teste
- [ ] Atualizar professor-alunos.ts para nova estrutura
- [ ] Atualizar professor-registrar-aula.ts para nova estrutura
- [ ] Corrigir RequestTable.ts para usar getMatrizCurricular
- [ ] Corrigir validation.test.ts com guards de tipo
- [ ] Rodar `npm run type-check` para validar
- [ ] Rodar `npm test -- --run` para validar testes

---

## 📝 Comandos Úteis

```bash
# Verificar erros de type-check
npm run type-check

# Rodar testes
npm test -- --run

# Verificar se arquivo é usado
grep -r "AcademicoView" src/

# Ver erros específicos de um arquivo
npx tsc --noEmit 2>&1 | grep arquivo.ts
```

---

## 🔗 Contexto Anterior

Este plano é continuação do trabalho de:
1. Extração da função `disciplinaTemEstagio` para TypeScript (removida do script inline)
2. Criação dos handlers de notas de estágio na SecretariaView
3. Criação dos testes para a nova funcionalidade

**Arquivo afetado**: `src/views/secretaria.ts`

---

*Plano criado em: 16/05/2026*