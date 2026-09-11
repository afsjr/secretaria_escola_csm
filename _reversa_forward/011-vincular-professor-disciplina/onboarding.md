# Onboarding: Vincular e Desvincular Professores em Disciplinas de Turmas

> Identificador: `011-vincular-professor-disciplina`
> Data: `2026-09-11`

## Pré-requisitos

- Projeto rodando localmente (`npm run dev`)
- Usuário com perfil `secretaria`, `coordenacao`, `admin` ou `master_admin`
- Pelo menos uma turma com curso vinculado e disciplinas no catálogo (`disciplinas_base`)
- Pelo menos dois usuários com perfil `professor`

## Passo a passo de validação

### 1. Acessar a grade da turma

1. Faça login e vá em **Gestão de Turmas**
2. Clique em uma turma da lista
3. Abra a aba **Grade (Ofertas)**
4. ✅ Todas as disciplinas do catálogo do curso aparecem com a coluna **Professor**
5. ✅ Disciplinas sem vínculo exibem "Sem professor"

### 2. Vincular professor a uma disciplina existente

1. Na linha de uma disciplina, selecione um professor no seletor
2. Confirme a ação
3. ✅ Toast de sucesso exibido
4. ✅ A coluna Professor passa a exibir o nome escolhido

### 3. Vincular em disciplina sem oferta ainda criada

1. Escolha uma disciplina que apareça sem oferta
2. Selecione um professor e confirme
3. ✅ A oferta é criada automaticamente e a disciplina exibe o professor

### 4. Substituir o professor responsável

1. Numa disciplina já vinculada ao professor A, selecione o professor B
2. ✅ O sistema avisa que A será substituído
3. Confirme
4. ✅ A disciplina passa a exibir B

### 5. Desvincular professor

1. Numa disciplina vinculada, clique em **Desvincular**
2. ✅ Se houver notas/aulas lançadas, o sistema pede confirmação informando que o histórico será preservado
3. Confirme
4. ✅ Toast de sucesso exibido
5. ✅ A disciplina volta a exibir "Sem professor"
6. ✅ As notas continuam visíveis na aba **Notas**
7. ✅ A oferta permanece na grade (não foi removida)

### 6. Perfil sem permissão

1. Faça login com um perfil `professor` ou `aluno`
2. Acesse a grade da turma
3. ✅ Os controles de vincular/desvincular não são exibidos (ou são bloqueados)
4. ✅ Tentativa de operação direta retorna toast de erro

### 7. Auditoria

1. Realize um vínculo e um desvínculo
2. Consulte o log de auditoria (perfil admin)
3. ✅ Existem registros `vincular_professor` e `desvincular_professor` com a tabela `turma_disciplinas`

### 8. Testes automatizados

```bash
npm test
```

✅ Todos os testes devem passar. Testes-alvo recomendados: `src/lib/course-service.test.ts`, `src/lib/professor-service.test.ts`.
