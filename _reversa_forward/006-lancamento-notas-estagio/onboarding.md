# Onboarding: Teste e Validação de Notas de Estágio Supervisionado por Lote

> Identificador: `006-lancamento-notas-estagio`
> Data: `2026-09-06`

Este guia fornece o passo a passo para um testador ou desenvolvedor validar manualmente a funcionalidade.

## Pré-requisitos
1. Usuário com perfil `secretaria` ou `admin`.
2. Usuário com perfil `professor`.
3. Usuário com perfil `aluno` pertencente a uma turma de Curso Técnico, com `bloqueio_financeiro = true`.

---

## Passo 1: Validação do Lançamento de Notas Regulares pelo Professor
1. Efetue login como `Professor`.
2. Acesse a lista de turmas/ofertas lecionadas.
3. Abra a tela de lançamento de notas de uma disciplina regular.
4. **Verificação:** Confirme que são exibidas apenas as colunas de notas regulares (N1, N2, N3, Rec). **Não deve existir** o campo "Nota de Estágio".
5. Informe notas válidas e salve.
6. **Resultado:** As notas regulares são salvas com sucesso.

---

## Passo 2: Validação do Lançamento por Lote pela Secretaria (Curso Técnico)
1. Efetue login como `Secretaria` ou `Admin`.
2. Navegue até a aba/tela de **Lançamento de Estágio por Lote**.
3. Selecione uma turma pertencente a um **Curso Técnico**.
4. A lista de alunos matriculados será exibida com campos para preenchimento de `Nota de Estágio`.
5. Preencha as notas de estágio para múltiplos alunos (incluindo um aluno com bloqueio financeiro ativo).
6. Clique no botão **"Salvar Notas em Lote"**.
7. **Resultado esperado:**
   - As notas são salvas no banco de dados.
   - Um **Toast Flutuante de sucesso** é exibido no topo/canto da tela confirmando o registro dos dados.
   - O aluno com `bloqueio_financeiro = true` tem sua nota de estágio gravada sem nenhum erro ou bloqueio.

---

## Passo 3: Visualização do Boletim pelo Aluno
1. Efetue login como o `Aluno` do curso técnico que teve a nota de estágio lançada.
2. Acesse a rota "Minhas Notas" (`#/dashboard/aluno/notas`).
3. **Resultado esperado:** A nota de estágio supervisionado aparece corretamente no boletim acadêmico do aluno.
