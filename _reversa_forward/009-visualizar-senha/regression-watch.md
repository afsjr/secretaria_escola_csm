# Regression Watch: Visualizar Senha Digitada

> Feature: `009-visualizar-senha`

## Watch Principal

Nenhum item — a feature não altera regras de negócio, apenas adiciona UI. Não há regras 🟢 do `_reversa_sdd/domain.md` que ficaram comprometidas.

## Observações

- **RF-01 (toggle de visibilidade):** implementado em 6 campos de senha. Regressão futura possível se novos campos de senha forem adicionados sem chamar `addPasswordToggle`.
- **RF-02 (componente reutilizável):** `src/lib/password-toggle.ts` é o ponto único de verdade. Alteração nele afeta todas as 6 integrações.
- **RF-04 (layout wrapper):** CSS `.input-icon-right` espelhado de `.input-icon-left`. Regressão possível se o layout de `.input-icon-wrapper` for alterado em `main.css`.

## Histórico de re-extrações

Nenhuma re-extração executada ainda.

## Arquivadas

Nenhum item arquivado.
