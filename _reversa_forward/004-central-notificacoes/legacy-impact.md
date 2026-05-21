# Legacy Impact: Central de Notificações no Header

> Identificador: `004-central-notificacoes`
> Data: `2026-05-21`
> Feature: `_reversa_forward/004-central-notificacoes/`

## Arquivos Afetados

| Arquivo | Componente | Tipo | Severidade | Justificativa |
|---------|-----------|------|------------|---------------|
| `src/lib/documents-service.ts` | Documents Service | regra-alterada | LOW | Adicionado método `getPendingByUser` — não altera comportamento existente |
| `src/styles/main.css` | Estilos Globais | regra-alterada | LOW | Adicionadas classes `.notification-dropdown*` e `.notification-badge-count` |
| `src/lib/documents-service.test.ts` | Documents Service | componente-novo | LOW | Testes para o novo método |
| `src/components/NotificationDropdown.ts` | Components | componente-novo | MEDIUM | Novo componente de dropdown de notificações |
| `src/views/secretaria.ts` | Secretaria View | regra-alterada | LOW | Suporte a hash param `?solicitacoes` para ativar aba |
| `src/views/dashboard.ts` | Dashboard View | regra-alterada | MEDIUM | Adicionado event listener do sino e badge dinâmico |

## Diff conceitual por componente

### Documents Service (`src/lib/documents-service.ts`)
- **Antes:** 4 métodos (`createRequest`, `getMyRequests`, `getAllOpenRequests`, `updateStatus`)
- **Depois:** 5 métodos (+ `getPendingByUser` que filtra `user_id` + `status = 'pendente'`)
- **Mudança:** puramente aditiva, sem quebra de compatibilidade.

### Styles (`src/styles/main.css`)
- **Antes:** `.badge-dot` era decorativo estático
- **Depois:** `.notification-badge-count` com contador dinâmico + dropdown completo com animação
- **Mudança:** aditiva.

### Dashboard View (`src/views/dashboard.ts`)
- **Antes:** `#header-notification-btn` sem event listener; `badge-dot` sempre visível
- **Depois:** botão com `aria-haspopup`, `aria-expanded`; badge contador dinâmico; event listener conecta ao `NotificationDropdown`
- **Mudança:** o botão de sino passa a ter funcionalidade ativa.

### Secretaria View (`src/views/secretaria.ts`)
- **Antes:** ignorava hash params
- **Depois:** detecta `?solicitacoes` e ativa a aba automaticamente
- **Mudança:** aditiva, sem impacto em comportamento existente.

## Regras Preservadas

| Regra | Arquivo de origem | Status |
|-------|-------------------|--------|
| RB01: Um aluno pode ter apenas uma matrícula ativa por vez | `_reversa_sdd/domain.md#RB01` | Intacta |
| RB02: Notas devem estar entre 0 e 10 | `_reversa_sdd/domain.md#RB02` | Intacta |
| RB03: Controle de concorrência em notas | `_reversa_sdd/domain.md#RB03` | Intacta |
| RB11: Proteção contra escalada de privilégios | `_reversa_sdd/domain.md#RB11` | Intacta |
| Cursos tipo `'formacao'` escondem Grade/Notas | `src/views/gestao-turmas.ts` | Intacta |
| Backup via pg_dump + OpenSSL + GitHub | `scripts/backup-db.sh` | Intacta |
| Dark mode com CSS vars + localStorage | `src/styles/main.css` | Intacta |
| SVG icons centralizados em `src/lib/icons.ts` | `src/lib/icons.ts` | Intacta |

## Regras Modificadas

Nenhuma regra de negócio do legado foi alterada ou removida. Todas as mudanças são aditivas.
