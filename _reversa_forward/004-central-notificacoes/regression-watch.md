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

*(preenchido pelo agente reverso após executar `/reversa` novamente)*

## Arquivadas

*(watch items que não se aplicam mais são movidos para cá)*
