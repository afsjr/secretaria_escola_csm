# Adendo — Toggle de Visibilidade de Senha Digitada

> Feature: `009-visualizar-senha`
> Data ISO 8601: `2026-09-09T11:27:00-03:00`
> Cenário: **legado**

## Vigência

Vigente desde 2026-09-09.

## Resumo da entrega

Adiciona botão de toggle (olho aberto/fechado) em todos os campos de senha do sistema, permitindo ao usuário alternar entre texto oculto e visível. Feature puramente de UI — sem alteração de regras de negócio nem dados persistidos. Novo utilitário reutilizável `addPasswordToggle()` em `src/lib/password-toggle.ts`, integrado em 6 campos de senha: login, signup, troca forçada (×2), modal troca obrigatória (×2), cadastro aluno e cadastro professor.

**Ações concluídas:** 12/12 (`progress.jsonl`). Etapa coding fechada.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/architecture.md` | `#módulos-principais` (Auth) | regra-nova | Novo utilitário compartilhado `password-toggle.ts` serve o módulo Auth com toggle de visibilidade em campos de senha |
| `_reversa_sdd/domain.md` | `#regras-de-negócio-implícitas` | — | Nenhuma regra alterada. RB06 (validação de senha) e RB07 (reset de senha) preservadas integralmente |

## Regras sob vigilância

Nenhum item de regressão — feature puramente de UI, sem regras de negócio afetadas.
Ver `_reversa_forward/009-visualizar-senha/regression-watch.md` para observações de manutenção.

## Fontes

- `_reversa_forward/009-visualizar-senha/legacy-impact.md`
- `_reversa_forward/009-visualizar-senha/regression-watch.md`
- `_reversa_forward/009-visualizar-senha/requirements.md`
- `_reversa_forward/009-visualizar-senha/actions.md`
- `_reversa_forward/009-visualizar-senha/progress.jsonl`
