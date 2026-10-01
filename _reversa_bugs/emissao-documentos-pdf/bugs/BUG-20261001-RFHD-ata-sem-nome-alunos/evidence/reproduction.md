# Reprodução — Ata de Resultados Finais sem nome dos alunos

## Ambiente e método

- Fonte: `src/lib/pdf-service.ts` → `PDFService.generateAtaResultadosPDF` (linha 1058).
- Dados reais da turma `Enfermagem - Noite - 2026/2027`
  (id `ab2b0028-b0a6-4d36-96b0-8d7b04f340db`), obtidos via `AcademicService.getDadosAtaTurma`.
- Renderização reproduzida em teste temporário (Vitest/jsdom) com o `jspdf` e
  `jspdf-autotable` reais; `autoTable` foi envolvido apenas para capturar o `body`,
  preservando a renderização real.

## Observações

- `getDadosAtaTurma` retornou `data.alunos.length = 29` (todas as matrículas da turma),
  incluindo ALUNA A, ALUNA B e ALUNA C.
- O `body` montado contém `522` linhas e `29` linhas de aluno (objetos com `colSpan: 8`).
- O PDF gerado (33 páginas) foi extraído com PyMuPDF e **não contém o nome de nenhum
  aluno**; a regex de cabeçalho de aluno encontrou `0` ocorrências.
- A página 1 renderizada (`ata-pagina1-linhas-aluno-vazias.png`) mostra a linha de
  cabeçalho de aluno **em branco**, logo abaixo do cabeçalho da tabela.

## Experimento de controle (isola a causa)

Mesma tabela, duas formas de linha de aluno:

| Forma | Resultado |
|---|---|
| Objeto solto `{ colSpan: 4, content: 'ALUNA B...' }` | conteúdo **descartado** (linha em branco) |
| Array de célula `[{ colSpan: 4, content: 'ALUNA B...' }]` | conteúdo **renderizado** |

Conclusão: o `jspdf-autotable` só renderiza o conteúdo de uma linha com `colSpan`
quando a linha é um array de células. O código atual passa um objeto solto.

## Comandos de verificação (após a correção)

```
npx vitest run src/lib/pdf-service.test.ts
npm run type-check
```
