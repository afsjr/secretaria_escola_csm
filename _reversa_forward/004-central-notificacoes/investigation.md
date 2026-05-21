# Investigation: Central de Notificações no Header

> Identificador: `004-central-notificacoes`
> Data: `2026-05-21`

## Pesquisa de fundo

### 1. Estado atual do botão de notificação

No `src/views/dashboard.ts:204-207`, o HTML já contém:

```html
<button id="header-notification-btn" class="header-btn" title="Notificações">
  <svg><!-- bell icon --></svg>
  <span class="badge-dot"></span>
</button>
```

O `badge-dot` está sempre presente no DOM (nunca oculto) e não há event listener ligado ao botão. O badge não tem contador visível — ele é apenas um ponto vermelho de 8px (`src/styles/main.css:601-610`).

### 2. Dados disponíveis

- `DocumentsService.getAllOpenRequests()` — usado por admin/secretaria/coordenação. Retorna `Solicitacao[]` com join em `perfis(nome_completo, email)`. Já ordena por `criado_em DESC`.
- `DocumentsService.getMyRequests(userId)` — usado por alunos. Retorna apenas as solicitações do próprio usuário.
- `DocumentsService.updateStatus(id, 'concluido')` — usado para marcar como concluído.
- O tipo `Solicitacao` em `src/types/domain.ts:157-164` já tem todos os campos necessários.

### 3. Perfis e visibilidade

- **Admin/Secretaria/Coordenação**: têm acesso RLS a todas as solicitações via `check_user_is_admin_or_secretaria()`. Usarão `getAllOpenRequests()` com filtro client-side `status === 'pendente'`.
- **Aluno**: RLS restringe a `auth.uid() = user_id`. Usarão `getMyRequests()` com filtro client-side.
- **Professor**: RLS não permite acesso a `solicitacoes`. Não há dados para mostrar. O dropdown exibirá "Nenhuma pendência" fixo.

### 4. Referências de UI existentes no projeto

- **Search palette** (`src/components/search-palette.ts`): overlay modal com backdrop, usa `role="dialog"`, gerencia foco, fecha com Escape. Inspiração para comportamento de fechamento.
- **Sidebar collapse**: usa `localStorage` para persistência. Padrão replicável para cache de 30s (session-scoped, não localStorage).
- **Badge no header**: `.badge-dot` com `position: absolute` relativo ao `.header-btn`. Para contador, precisamos de um elemento com texto (não apenas um ponto).

### 5. Padrões de acessibilidade já aplicados

- DR-01 estabeleceu `aria-current="page"`, `aria-label`, `role="navigation"`.
- DR-03 estabeleceu `aria-live` region no toast e `.sr-only` class.
- O dropdown deve seguir o padrão WAI-ARIA Menu Button: `aria-haspopup="true"`, `aria-expanded`, `role="menu"`, `role="menuitem"`.

### 6. Alternativas avaliadas

| Alternativa | Vantagem | Desvantagem | Decisão |
|-------------|----------|-------------|---------|
| Badge inline no HTML do dashboard | Simples | Mistura responsabilidade | Descartada — componente separado |
| WebSocket polling para atualização em tempo real | Dados sempre frescos | Complexidade alta, sem necessidade | Descartada — requisito diz "lazy, sem polling" |
| Badge apenas com ponto (sem contador) | Já existe | Não comunica quantidade | Descartada — RF-01 exige contador |

## Fontes consultadas

- Código-fonte: `src/lib/documents-service.ts`
- Código-fonte: `src/types/domain.ts` (interface `Solicitacao`)
- Código-fonte: `src/views/dashboard.ts` (header template)
- Código-fonte: `src/styles/main.css` (`.header-btn`, `.badge-dot`)
- Código-fonte: `src/components/search-palette.ts` (padrão de modal/overlay)
- Código-fonte: `src/lib/authz.ts` (funções `isAdmin`, `isSecretaria`, etc.)
- Schema: `supabase/schema.sql` (tabela `solicitacoes`)
- Legado: `_reversa_sdd/architecture.md`, `_reversa_sdd/domain.md`
