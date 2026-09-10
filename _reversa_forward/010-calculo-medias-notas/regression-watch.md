# Regression Watch: Cálculo de Médias com Notas Variáveis

> Identificador: `010-calculo-medias-notas`
> Data: `2026-09-10`

## Watch Principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|--------------------------|-----------------------------|--------------------|--------------------|
| W001 | `grades-utils.ts#calcularMediaParcial` | Média parcial usa contagem dinâmica de notas > 0, não divisão fixa por 3 | redação | `calcularMediaParcial(8, 0, 0)` retorna valor diferente de 8 |
| W002 | `grades-utils.ts#calcularMediaParcial` | Todas notas = 0 retorna 0 (não NaN) | presença | `calcularMediaParcial(0, 0, 0)` retorna NaN ou valor != 0 |
| W003 | `pdf-service.ts#_calcularMediaTeoria` | Delega para `calcularMediaParcial` de `grades-utils` | redação | `_calcularMediaTeoria` contém lógica de contagem própria em vez de importar |
| W004 | `professor-turmas-notas.ts#recalcularMedia` | Usa `calcularMediaParcial` em vez de divisão manual por 3 | redação | Divisão `(n1+n2+n3)/3` aparece no código |
| W005 | `professor-turmas-notas.ts#loadAlunosDaDisciplina` | Alerta "Nenhuma avaliação registrada" exibido quando todas notas = 0 | presença | Ausência de alerta quando notasExistentes existe e todas são 0 |

## Histórico de re-extrações

| Data | Extrator | Itens verificados | Observação |
|------|----------|-------------------|------------|
| (nenhuma re-extração ainda) | | | |

## Arquivadas

<!-- Itens que deixaram de ser relevantes em re-extrações futuras -->

## Observações

- Regras W001-W004 são 🟢 confirmadas no `_reversa_sdd/domain.md` (RB02: notas entre 0 e 10) e `_reversa_sdd/academic/requirements.md` (grades-utils.ts como utilitário de notas)
- A regra original de "média = soma/3" não estava documentada explicitamente no domain.md, mas era comportamento implícito do código — agora formalizada como RN-01 no requirements
