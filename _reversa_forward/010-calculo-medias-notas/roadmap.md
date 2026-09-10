# Roadmap: Cálculo de Médias com Notas Variáveis

> Identificador: `010-calculo-medias-notas`
> Data: `2026-09-10`
> Requirements: `_reversa_forward/010-calculo-medias-notas/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A mudança é cirúrgica: alterar `calcularMediaParcial` em `grades-utils.ts` para contar dinamicamente notas > 0 em vez de dividir sempre por 3. O `pdf-service.ts` já tem lógica equivalente em `_calcularMediaTeoria` — o alinhamento eliminará duplicação. A UI de lançamento de notas em `professor-turmas-notas.ts` ganha um alerta visual quando todos os campos estiverem vazios. Schema do banco e contratos externos não são afetados.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| (nenhum princípio registrado) | `.reversa/principles.md` não existe neste projeto | n/a |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Alterar `calcularMediaParcial` para contagem dinâmica (filter > 0 + length) | Corrige bug de cálculo com impacto mínimo — uma função, dois parâmetros mantidos | Adicionar campo `qtd_notas` no schema (exige migração SQL) | 🟢 |
| D-02 | `pdf-service._calcularMediaTeoria` passa a importar `calcularMediaParcial` de `grades-utils` | Elimina duplicação; PDF e boletim usam a mesma lógica | Manter duplicação (risco de divergência futura) | 🟡 |
| D-03 | Alerta visual via toast/warning na UI do professor quando todos os campos = 0 | UX leve, sem modal, sem bloqueio — apenas informativo | Validação que impede salvar (bloquearia lançamento parcial legítimo) | 🟢 |
| D-04 | Assinatura da função permanece `(n1, n2, n3)` — sem mudança de contrato | Retrocompatibilidade total; todos os call sites existentes continuam funcionando | Trocar para array dinâmico `(...notas)` (quebraria contratos) | 🟢 |

## 4. Premissas

Nenhuma premissa de `[DÚVIDA]` — todas as dúvidas foram resolvidas no `/reversa-clarify`.

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Academic (grades-utils) | `_reversa_sdd/architecture.md#Módulos Principais` | regra-alterada | `calcularMediaParcial` contagem dinâmica |
| Academic (pdf-service) | `_reversa_sdd/architecture.md#Módulos Principais` | contrato-alterado | `_calcularMediaTeoria` delega para `grades-utils` |
| Professor (UI notas) | `_reversa_sdd/architecture.md#Módulos Principais` | componente-novo | Alerta visual "Nenhuma avaliação registrada" |

## 6. Delta no modelo de dados

- **Sem mudanças no schema.** A tabela `boletim` mantém campos `n1`, `n2`, `n3` como estão. A mudança é puramente na lógica de cálculo client-side.
- Detalhe completo em: `_reversa_forward/010-calculo-medias-notas/data-delta.md`

## 7. Delta de contratos externos

Nenhum contrato externo afetado. A mudança é 100% client-side (lógica de cálculo e UI).

## 8. Plano de migração

n/a — sem mudança de schema.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Regressão em disciplinas com 3 notas (cálculo atual) | alto | baixo | Testes unitários cobrem cenário 3 notas; divisão por 3 com 3 valores > 0 = mesmo resultado |
| `pdf-service` quebra ao delegar para `grades-utils` | médio | baixo | Testes existentes do PDF cobrem cálculo de média; alinhamento com `_calcularMediaTeoria` já validado |
| Alerta visual percussivo em lançamento legítimo | baixo | médio | Alerta é apenas visual (toast), não bloqueia ação |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `regression-watch.md` gerado
- [ ] Testes unitários de `calcularMediaParcial` atualizados e passando
- [ ] Testes do `pdf-service` continuam passando
- [ ] Verificação manual: lançar 1 nota em disciplina → média = nota lançada

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-10 | Versão inicial gerada por `/reversa-plan` | reversa |
