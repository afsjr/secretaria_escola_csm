# Regression Watch — Ata de Resultados Finais (PDF)

> Feature: `008-ata-resultados-finais` · Criado em: `2026-09-07`

## Items de observação

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|-----------------------------|---------------------|-------------------|
| W001 | `legacy-impact.md` → Modificadas" | `situacaoFinal` derivada por agregação de componente (todos Aprovado → Aprovado; algum Reprovado → Reprovado; senão Cursando) com prevalência do `status_aluno` não-ativo; evadido sem nota vira "—" | presença | Re-extração encontrar regra de aprovação diferente (ex.: coluna `situacao_final` gravada em banco substituindo a derivação, ou status local divergente para o mesmo boletim) |
| W002 | `legacy-impact.md` → Modificadas | `percentualFrequencia` = `clamp(100 - faltas*100/carga_horaria, 0, 100)`, arredondado | presença | Banco novo ganhar tabela de frequência que faz a Ata passar a ler acumulado de presenças (mudança de fonte de verdade) divergente do método atual |
| W003 | `legacy-impact.md` → Modificadas | Ano letivo extraído por token `YYYY` do `periodo` da turma, com fallback para o ano corrente | presença | Novo campo `ano_letivo` na tabela `turmas` divergir do token do `periodo` (fonte duplicada) sem a Ata ser atualizada |

## Histórico de re-extrações

Vazio. Será preenchido pelo agente reverso quando `/reversa` rodar novamente.

## Arquivadas

Vazio.

## Observações

- **Gap legado 🔴 conhecido (sem peso de regressão):** não existe tabela de frequência no legado; `faltas` vive em `boletim` e a Ata deriva o % a partir da carga horária. W002 vigia apenas se/ quando uma nova fonte de verdade de frequência surgir.
- **Read-only estrito:** a feature não grava nada em Supabase (sem coluna de situação final, sem DDL). Se uma futura extração detectar escrita no fluxo da Ata, é regressão de natureza (não-surpresa).
- **RFs implementados:** RF-05 abertura cartorial com data por extenso; RF-06 cabeçalho repetido + numeração; RF-10 nome `ata_resultados_{turma}_{ano}.pdf`; D-02/D-08/D-09 conforme roadmap. Ganharão peso de regressão quando uma extração `/reversa` sobre o código novo os confirmar como 🟢.