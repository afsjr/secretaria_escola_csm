# Regression Watch: Central de Notificações no Header

> Identificador: `004-central-notificacoes`
> Data: `2026-05-21`

## Watch Items

| ID | Origem | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|--------|----------------------------|---------------------|-------------------|
| W001 | `_reversa_sdd/domain.md#RB01` | Aluno continua podendo ter apenas 1 matrícula ativa | presença | Matrícula duplicada sem bloqueio |
| W002 | `src/views/dashboard.ts:204` | Botão `#header-notification-btn` existe no header com `aria-haspopup="true"` | presença | Botão removido ou sem atributos de acessibilidade |
| W003 | `src/styles/main.css` | Classes `.notification-dropdown`, `.notification-badge-count`, `.notification-item` existem | presença | Classes removidas ou renomeadas |
| W004 | `src/components/NotificationDropdown.ts` | Dropdown busca dados de acordo com o perfil (admin/secretaria → todas; aluno → próprias) | presença | Arquivo removido ou comportamento de perfil quebrado |
| W005 | `src/views/secretaria.ts` | Hash param `?solicitacoes` ativa a aba Solicitações | presença | Hash param ignorado ou aba não encontrada |

## Observações

Itens com confidência 🟡 ou 🔴 no requirements original, sem peso de regressão:

- Cache de 30s em memória é implementação interna do componente, sem contrato externo — não requer watch
- Ação "Concluir" inline no dropdown é Should (não Must) — não requer watch

## Histórico de re-extrações

### Re-extração 2026-09-06 15:28

| ID | Veredito | Observação |
|----|----------|------------|
| W001 | 🟢 verde | Regra de apenas 1 matrícula ativa preservada em `_reversa_sdd/domain.md#RB01` |
| W002 | 🟢 verde | Botão `#header-notification-btn` com `aria-haspopup="true"` preservado em `src/views/dashboard.ts` |
| W003 | 🟢 verde | Classes CSS `.notification-dropdown`, `.notification-badge-count` preservadas em `main.css` |
| W004 | 🟢 verde | Dropdown adaptado por perfil de usuário preservado em `NotificationDropdown.ts` |
| W005 | 🟢 verde | Hash param `?solicitacoes` preservado em `src/views/secretaria.ts` |

## Arquivadas

*(watch items que não se aplicam mais são movidos para cá)*
