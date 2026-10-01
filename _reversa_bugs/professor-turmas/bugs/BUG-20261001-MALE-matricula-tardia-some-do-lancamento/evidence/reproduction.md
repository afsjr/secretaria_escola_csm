# Reprodução — matrícula tardia some do lançamento de notas e do PDF

## Método

- Teste unitário `src/views/professor-turmas-notas.test.ts` (novo): monta um container com
  `.notas-tbody` e dois alunos ativos, sendo um com `boletim.status='pendente'`.
- Verificação em base real (somente leitura) do `boletim` por disciplina.

## Vermelho (antes da correção)

```
npx vitest run src/views/professor-turmas-notas.test.ts
AssertionError: expected '<tr data-aluno-id="a1" ...' to contain 'Aluno Tardio'
Tests  1 failed
```

O aluno com `status='pendente'` não entra no `tbody`; logo não é enviado ao
`generateRelatorioNotasDisciplinaPDF` (que lê as linhas `.notas-tbody`).

## Base real (turma Enfermagem - Noite - 2026/2027, disciplina Psicologia Aplicada)

Oferta: 2026-02-09 a 2026-03-12. Quatro alunas ativas com `boletim.status='pendente'`:

| Aluna (mascarada) | data_matricula | n1 |
|---|---|---|
| ALUNA B | 2026-04-13 | 10 |
| ALUNA A | 2026-04-13 | 10.01 |
| PESSOA C | null | 10 |
| ALUNA C | 2026-05-07 | null |

## Verde (após a correção)

```
npx vitest run src/views/professor-turmas-notas.test.ts
Tests  1 passed
```

A tabela passa a listar o aluno tardio (com selo "matrícula tardia"); o PDF passa a incluí-lo.
