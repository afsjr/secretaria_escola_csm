# Evidência estática — BUG-20260908-F74E

## Chamada incorreta em `src/views/professor-turmas.ts:464-479`

```ts
// Gerar PDF consolidado
const doc = await PDFService.generateDeclaracaoPDF(
  { nome_completo: "Relatório de Notas", email: "" },
  turmaInfo || {
    turma_nome: disciplinaNome,
    periodo: "-",
    curso_nome: "Curso Técnico",
  },
  { marcaCopia: true },
);

PDFService.downloadPDF(doc, `notas_${disciplinaNome.replace(/\s+/g, "_")}.pdf`);
```

## O gerador chamado renderiza DECLARAÇÃO DE MATRÍCULA

`src/lib/pdf-service.ts:358` (`generateDeclaracaoPDF`) imprime:

- `doc.text("DECLARAÇÃO DE MATRÍCULA", pageWidth / 2, 55, { align: "center" })` (linha 403)
- corpo: `Declaramos, para os devidos fins, que o(a) aluno(a) ${nomeAluno}...` (linha 421)

Ou seja, o template é fixo de Declaração de Matrícula; a tela de lançamento de notas do professor
espera um relatório de notas da disciplina (alunos com faltas, N1, N2, N3, média, rec, final,
status), dados que são coletados nas linhas 405-446 mas nunca usados no PDF.

## Relato do usuário

- "pedi um pdf de psicologia e o documento foi notas_Psicologia_Aplicada.pdf"
- Conteúdo do arquivo baixado: comprovante de matrícula (não o relatório/ata da disciplina).