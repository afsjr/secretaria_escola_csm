# Investigation: Cálculo de Médias com Notas Variáveis

> Identificador: `010-calculo-medias-notas`
> Data: `2026-09-10`

## 1. Contexto do problema

O `calcularMediaParcial` em `grades-utils.ts:54-57` implementa:
```typescript
return (n1 + n2 + n3) / 3
```

Isso assume que **sempre** existem 3 notas. Quando uma disciplina lança apenas 1 ou 2 avaliações, a média é subestimada (ex: nota 8 em 1 única avaliação → média = 2.67).

## 2. Inconsistência identificada

O `pdf-service.ts:1368-1388` já implementa `_calcularMediaTeoria` com a lógica correta:
```typescript
let sum = 0, count = 0;
if (n1 > 0) { sum += n1; count++; }
if (n2 > 0) { sum += n2; count++; }
if (n3 > 0) { sum += n3; count++; }
return count > 0 ? sum / count : 0;
```

Isso prova que o comportamento desejado já é conhecido e validado no projeto — apenas não está aplicado no caminho principal de cálculo (boletim/academic-service).

## 3. Alternativas avaliadas

| Alternativa | Prós | Contras | Decisão |
|-------------|------|---------|---------|
| **A.** Contagem dinâmica em `calcularMediaParcial` | Mínimo impacto, corrige todos os call sites | Nota zero real vs não-lançada indistinguível | **Escolhida** |
| **B.** Campo `qtd_notas` no schema `boletim` | Distinção explícita zero-lançada vs zero-real | Exige migração SQL, mudança de UI, todos os insert/update | Descartada |
| **C.** Configuração por disciplina (qtd esperada de notas) | Flexibilidade máxima | Complexidade alta, requer nova tabela ou campo | Descartada (usuário confirmou que professor decide) |

## 4. Padrão aplicável

O padrão "média dinâmica com contagem de valores válidos" é comum em sistemas acadêmicos brasileiros. A maioria dos SGP (Sistemas de Gestão Pedagógica) considera apenas notas com valor para o denominador da média.

## 5. Arquivos afetados

| Arquivo | Tipo de mudança | Risco |
|---------|-----------------|-------|
| `src/lib/grades-utils.ts` | Alteração de lógica em `calcularMediaParcial` | Baixo — função isolada, bem testada |
| `src/lib/pdf-service.ts` | Substituição de `_calcularMediaTeoria` por import de `grades-utils` | Baixo — alinhamento com lógica já existente |
| `src/views/professor-turmas-notas.ts` | Adição de alerta visual | Baixo — adição não-invasiva |
| `src/lib/grades.test.ts` | Atualização de testes existentes | Baixo — expansão de cobertura |
