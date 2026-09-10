# Adendo: Cálculo de Médias com Notas Variáveis

> Feature: `010-calculo-medias-notas`
> Data: `2026-09-10`
> Cenário: legado
> Extração base: `_reversa_sdd/`

## Vigência

Vigente desde 2026-09-10.

## Resumo da entrega

A feature corrige o cálculo de médias parciais para usar contagem dinâmica de notas > 0 em vez de divisão fixa por 3. Disciplinas com 1 ou 2 avaliações agora recebem médias corretas. O professor decide quantas notas lançar por disciplina; alerta visual é exibido quando nenhum campo possui nota. Todas as 6 ações do plano foram concluídas.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/architecture.md` | Academic (grades-utils) | regra-alterada | `calcularMediaParcial` agora filtra notas > 0 e divide pela contagem dinâmica; verificar se a seção "Utilitários de Notas" reflete essa mudança |
| `_reversa_sdd/architecture.md` | Academic (pdf-service) | contrato-alterado | `_calcularMediaTeoria` delega para `grades-utils`; verificar se a seção "Serviços PDF" menciona a dependência |
| `_reversa_sdd/domain.md` | RB02 (Notas entre 0 e 10) | regra-nova | Regra adicional: média parcial considera apenas notas > 0; antes era implícito (sempre dividia por 3) |
| `_reversa_sdd/academic/requirements.md` | grades-utils.ts | componente-novo | Testes expandidos: 6 novos cenários cobrindo 1 nota, 2 notas, zeros e notas zero real |

## Regras sob vigilância

W001, W002, W003, W004, W005 — detalhes em `_reversa_forward/010-calculo-medias-notas/regression-watch.md`

## Fontes

- `_reversa_forward/010-calculo-medias-notas/legacy-impact.md`
- `_reversa_forward/010-calculo-medias-notas/regression-watch.md`
- `_reversa_forward/010-calculo-medias-notas/requirements.md`
