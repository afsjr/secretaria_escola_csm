# Roadmap: Central de Notificações no Header

> Identificador: `004-central-notificacoes`
> Data: `2026-05-21`
> Requirements: `_reversa_forward/004-central-notificacoes/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

Feature 100% front-end. O botão sino (`#header-notification-btn`) já existe no HTML do `src/views/dashboard.ts` mas não tem event listener. A abordagem é:

1. Criar um novo componente `NotificationDropdown` em `src/components/` que gerencia o estado (aberto/fechado), busca os dados conforme o perfil, renderiza a lista e o badge.
2. Conectar o componente ao `dashboard.ts` substituindo o placeholder atual.
3. Estilos CSS adicionados ao `main.css` para o dropdown (card flutuante, seta, hover states).
4. Nenhuma mudança no banco, na API ou em contratos externos.

## 2. Princípios aplicados

Nenhum arquivo `.reversa/principles.md` encontrado. Nenhum princípio a verificar.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Componente `NotificationDropdown` em `src/components/` | Padrão do projeto: componentes reutilizáveis em `src/components/` (ex.: `search-palette.ts`, `empty-state.ts`) | Inline no dashboard.ts (viola separação) | 🟢 |
| D-02 | Badge count buscado junto com a lista (uma única query) | Evita duas chamadas Supabase; `getAllOpenRequests` já retorna todos os dados necessários | Query separada para count (mais chamadas) | 🟢 |
| D-03 | Cache simples in-memory de 30s (timestamp + dados) | Evita chamadas repetidas se usuário abrir/fechar o dropdown rapidamente; sem dependência externa | localStorage (persiste dados obsoletos), SWR/library (peso extra) | 🟢 |
| D-04 | Click-outside via `document.addEventListener('click', ...)` no `componentDidMount` | Padrão simples e sem dependências; desregistra no cleanup | Abordagem com `blur` (não funciona em menus) | 🟢 |
| D-05 | Filtro por perfil no client-side após buscar dados | Admin/secretaria já têm acesso a todos os dados via RLS; alunos podem usar `getMyRequests` separado | Três queries diferentes no servidor (desnecessário) | 🟢 |
| D-06 | Hash route `#/dashboard/secretaria?solicitacoes` para abrir aba específica | Experiência melhor que apenas navegar para Secretaria e o usuário ter que clicar na aba | Apenas navegar para Secretaria (o usuário precisa clicar na aba manualmente) | 🟡 |

## 4. Premissas

Nenhuma. Todas as dúvidas foram resolvidas no `/reversa-clarify`.

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Presentation — Views | `src/views/dashboard.ts` | regra-alterada | Adicionar event listener e integração com NotificationDropdown |
| Presentation — Components | `src/components/` | componente-novo | Criar `NotificationDropdown.ts` |
| Presentation — Styles | `src/styles/main.css` | regra-alterada | Adicionar `.notification-dropdown` e classes auxiliares |
| Business Logic — Services | `src/lib/documents-service.ts` | regra-alterada | Adicionar método `getPendingRequestsByUser` para alunos |
| Types | `src/types/domain.ts` | inalterado | `Solicitacao` já atende |

## 6. Delta no modelo de dados

- Resumo das mudanças: **nenhuma mudança no banco.** O modelo `solicitacoes` já tem todos os campos necessários (`status`, `user_id`, `tipo`, `criado_em`).
- Detalhe completo em: `_reversa_forward/004-central-notificacoes/data-delta.md`

## 7. Delta de contratos externos

Nenhum contrato externo é afetado. O Supabase Client já está configurado e as queries usam RLS existente.

## 8. Plano de migração

n/a — sem migração de dados.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Performance da query `getAllOpenRequests` com muitas solicitações | médio | baixo | Já existe índice `idx_solicitacoes_status` no banco |
| Click-outside conflitar com outros handlers | baixo | médio | Usar `stopPropagation` controlado e verificar `contains()` no target |
| Badge não re-renderizar após concluir | médio | baixo | Atualizar o estado local imediatamente (optimistic UI) |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `regression-watch.md` gerado
- [ ] Dropdown abre e fecha com animação suave
- [ ] Badge mostra contagem correta para cada perfil
- [ ] Ação "Concluir" inline funciona sem erro
- [ ] `tsc --noEmit` passa com zero erros
- [ ] Testes passam (mesma base dos 230+ testes existentes)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-05-21 | Versão inicial gerada por `/reversa-plan` | reversa |
