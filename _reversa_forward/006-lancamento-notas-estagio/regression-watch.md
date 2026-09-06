# Regression Watch: Lançamento de Notas de Estágio Supervisionado por Lote

> Identificador: `006-lancamento-notas-estagio`
> Data: `2026-09-06`

## 1. Itens de Vigilância contra Regressão

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|-------------------------|-----------------------------|---------------------|-------------------|
| W001 | `_reversa_sdd/domain.md#rb09` | Notas de estágio mantidas via `upsertNotaEstagio` / `upsertNotaEstagioLote` em `boletim` | presença | Campo `nota_estagio` removido ou ignorado no salvamento de boletim |
| W002 | `_reversa_sdd/domain.md#regras-de-domínio` | Professor restrito a notas regulares (N1, N2, N3, Rec) | presença | Professor liberado para alterar `nota_estagio` no painel docente |
| W003 | `_reversa_sdd/domain.md#rb15` | Aluno de curso técnico visualiza a nota de estágio em seu boletim | presença | Ocultação ou omissão do campo de estágio no boletim do aluno |
| W004 | `_reversa_sdd/domain.md#aluno` | Aluno com `bloqueio_financeiro = true` aceita gravação de notas | presença | Erro de RLS ou exceção de validação ao salvar nota de aluno inadimplente |

## 2. Histórico de re-extrações

> Nenhuma re-extração executada após a entrega desta feature.

## 3. Observações

- Sinalização visual do salvamento em lote mantida via Toast Flutuante em `SecretariaEstagioLoteView`.
