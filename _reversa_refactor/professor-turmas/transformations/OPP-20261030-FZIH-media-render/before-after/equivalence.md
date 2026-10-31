# Equivalência de saída - OPP-20261030-FZIH

Média exibida arredondada com `arredondarNota`; nota final e status calculados
com a média crua, como antes.

| N1 | N2 | N3 | Rec | Média crua | Média antes | Média depois | Final antes | Final depois | Status antes | Status depois |
|----|----|----|-----|-----------|-------------|--------------|-------------|--------------|--------------|---------------|
| 7 | 7 | 6,4 | 0 | 6,800 | 6,8 | 7,0 | 7,0 | 7,0 | Aprovado | Aprovado |
| 5 | 6 | 6,2 | 0 | 5,733 | 5,7 | 6,0 | 6,0 | 6,0 | Aprovado | Aprovado |
| 4 | 4 | 4 | 0 | 4,000 | 4,0 | 4,0 | 4,0 | 4,0 | Reprovado | Reprovado |
| 10 | 10 | 10 | 0 | 10,000 | 10,0 | 10,0 | 10,0 | 10,0 | Aprovado | Aprovado |
| 0 | 0 | 0 | 0 | 0,000 | - | - | - | - | Reprovado | Reprovado |
| 5 | 5 | 5 | 7 | 5,000 | 5,0 | 5,0 | 6,0 | 6,0 | Aprovado | Aprovado |
| 7 | 7 | 6,9 | 0 | 6,967 | 7,0 | 7,0 | 7,0 | 7,0 | Aprovado | Aprovado |

## Conclusão

- Final e status idênticos em todos os casos.
- Média exibida muda apenas quando a média crua não é múltipla de 0,5. Nesses
  casos o novo valor coincide com o que o recálculo e o PDF já exibiam.
- `recDisabled` passa a seguir a mesma média exibida. O caso 7, 7, 6,4 deixa de
  habilitar a Rec com média final 7,0; o caso 5, 5, 6,2 continua habilitando
  porque a média é 6,0.
- Casos de borda preservados: média zero mostra traço, médias exatas não mudam,
  recuperação não é recalculada com valor arredondado.
