# Onboarding: Indicadores Pedagógicos da Turma

> Identificador: `013-indicadores-turma`
> Data: `2026-10-30`
> Objetivo: permitir que uma pessoa teste a feature pela primeira vez sem conhecer o código.

## 1. Pré-requisitos

- Node e dependências instaladas (`npm install`).
- Acesso ao projeto Supabase configurado no ambiente.
- Usuário com perfil de secretaria, coordenação ou administração.
- Uma turma de curso técnico com alunos ativos e notas lançadas.

## 2. Subir a aplicação

```sh
npm run dev
```

Abra a URL exibida pelo Vite (por padrão `http://localhost:3000`).

## 3. Caminho manual

1. Faça login com um usuário administrativo.
2. Abra **Gestão de Turmas**.
3. Clique em uma turma de curso técnico na lista de turmas ativas.
4. Confira a barra de abas: **Alunos**, **Grade (Ofertas)**, **Notas**, **Calendário**, **Indicadores**.
5. Clique em **Indicadores**.
6. Verifique os cards:
   - **Média da turma** com média, maior e menor média.
   - **Presença** com percentual, maior e menor presença.
   - **Alunos** com total ativo e quantos entraram no cálculo.
   - **Disciplinas** com o total ofertado.
7. Verifique a tabela por disciplina com média, maior nota, menor nota e presença média.

## 4. Conferência com a Ata

1. Na mesma turma, clique em **Alunos** e gere a **Ata de Resultados Finais**.
2. Compare a nota final e o percentual de frequência de um aluno em uma disciplina.
3. O valor da Ata e o valor usado nos indicadores devem coincidir para o mesmo aluno e disciplina.

## 5. Casos de teste manuais

| Caso | Como reproduzir | Resultado esperado |
|------|-----------------|--------------------|
| Turma técnica | Selecionar turma com `tipo_curso = 'tecnico'` | Aba Indicadores visível |
| Turma de formação | Selecionar turma com `tipo_curso = 'formacao'` | Aba Indicadores oculta e aba Alunos ativa |
| Turma técnica com tipo nulo | Selecionar turma cujo curso não tem tipo preenchido | Aba visível, tratada como técnica |
| Turma sem alunos | Selecionar turma sem matrícula ativa | Estado vazio, sem média zero enganosa |
| Disciplina sem nota | Turma com disciplina ofertada e sem nota maior que zero | Disciplina fora da média e traço na tabela |
| Aluno sem boletim | Aluno ativo sem registro em `boletim` | Aluno fora da média e da presença |
| Troca de turma | Selecionar turma A, abrir Indicadores, selecionar turma B | Cards passam a refletir a turma B |
| Recarregar aba | Abrir Indicadores, sair e voltar | Indicadores atualizados com lançamentos recentes |

## 6. Dados de exemplo para conferência

Suponha uma turma com dois alunos ativos e uma disciplina com carga horária 40:

| Aluno | N1 | N2 | N3 | Rec | Faltas | Nota final | Presença |
|-------|----|----|----|-----|--------|------------|----------|
| A | 8 | 7 | 6 | 0 | 4 | 7,0 | 90% |
| B | 5 | 5 | 5 | 7 | 12 | 6,0 | 70% |

Resultado esperado:

- Média da turma: 6,5.
- Maior média: 7,0; menor média: 6,0.
- Presença da turma: 80%.
- Maior presença: 90%; menor presença: 70%.

## 7. Testes automatizados

```sh
npm test -- academic-service
npm test -- grades-utils
npm run type-check
```

O teste do serviço deve cobrir:

- turma técnica com dois alunos e duas disciplinas;
- exclusão de aluno inativo;
- exclusão de disciplina não ofertada;
- exclusão de estágio da média numérica;
- ausência de notas e de boletim;
- presença limitada entre 0 e 100;
- contagem de consultas em lote, sem N+1.

## 8. Problemas comuns

| Sintoma | Causa provável | Ação |
|---------|----------------|------|
| Aba não aparece | Curso marcado como `formacao` | Conferir `tipo_curso` em Gestão de Cursos |
| Todos os indicadores com traço | Turma sem aluno ativo ou sem boletim | Conferir matrículas e lançamentos |
| Presença 100% em tudo | Disciplina com `carga_horaria` zero | Conferir a carga horária em `disciplinas_base` |
| Valores diferentes da Ata | Dados alterados entre as duas leituras | Recarregar a aba e comparar novamente |
