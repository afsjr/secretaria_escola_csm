# Onboarding: Tipos de Curso

> Feature: `001-tipos-curso`
> Testar esta feature pela primeira vez

## Pré-requisitos

- Supabase linked rodando (`supabase db push --linked` aplicado)
- Migration SQL executada (criar migration file + push)
- Servidor dev rodando (`npm run dev`)

## Passo a passo

### 1. Verificar migration

```bash
supabase db push --linked
```

Confirme que a migration adiciona `cursos.tipo_curso` e `boletim.conceito`.

### 2. Testar criação de curso técnico

1. Acesse `#/secretaria` como admin
2. Vá em "Gerenciar Cursos"
3. Clique "Novo Curso"
4. Preencha nome e selecione tipo "Técnico"
5. Salve
6. Verifique: badge "Técnico" aparece na listagem

### 3. Testar criação de curso de formação

1. Repita o passo 2 com tipo "Formação"
2. Verifique: badge "Formação" aparece

### 4. Testar bloqueio de edição de tipo

1. Crie uma turma para o curso de formação
2. Tente editar o tipo do curso para "Técnico"
3. Verifique: erro "Não é possível mudar tipo com turmas ativas"

### 5. Testar boletim de curso técnico

1. Matricule um aluno no curso técnico
2. Como professor, acesse a turma e discipline
3. Verifique: inputs de nota aceitam 0-10
4. Lance nota 8.5
5. Verifique: nota salva, exibida numericamente

### 6. Testar boletim de curso de formação

1. Matricule um aluno no curso de formação
2. Como professor, acesse a turma e discipline
3. Verifique: inputs são select com A/B/C (não números)
4. Selecione conceito "B"
5. Verifique: conceito salvo, exibido como "B (Bom)"

### 7. Verificar relatório/conversão

1. Na exportação de notas, verifique se conceitos são convertidos (A=10, B=7.5, C=5)
2. Cursos técnicos exportam notas numericamente

### 8. Smoke test geral

```bash
npm run type-check
npm test
```

Nenhum teste existente deve quebrar.
