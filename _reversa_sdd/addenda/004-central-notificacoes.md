# Adendo: Central de Notificações no Header

> Identificador: `004-central-notificacoes`
> Data: `2026-09-08T10:10:00-03:00`
> Cenário: legado

## Vigência

Vigente desde 2026-09-08.

## Resumo da entrega

Dá funcionalidade ao botão de sino do header (que antes existia apenas visualmente), criando um dropdown de notificações com contador no badge, adaptado por perfil: admin/secretaria/coordenação veem todas as solicitações de documentos pendentes; alunos veem apenas as próprias; professores veem estado vazio. Adiciona `getPendingByUser` ao `documents-service`, o componente `NotificationDropdown`, suporte a hash `?solicitacoes` na secretaria e event listener + badge dinâmico no dashboard. 8/8 ações concluídas.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/domain.md` | `#regras-de-negócio-implícitas` | regra-nova | RB16 "Notificações de Documentos no Header" passa a valer: contador reflete apenas solicitações `status = 'pendente'`, dropdown limite de 10 itens, conteúdo adaptado por perfil |
| `_reversa_sdd/architecture.md` | `#módulos-principais` (Documents) | regra-alterada | `documents-service` ganhou o método aditivo `getPendingByUser(user_id)` (filtra `status = 'pendente'`) — sem quebra de compatibilidade |
| `_reversa_sdd/architecture.md` | `#camadas` (Presentation Layer) | componente-novo | `NotificationDropdown.ts` + classes CSS `.notification-dropdown*` / `.notification-badge-count`; botão `#header-notification-btn` passa a ter funcionalidade ativa |
| `_reversa_sdd/architecture.md` | `#camadas` (Presentation Layer) | regra-alterada | Secretaria aceita hash `?solicitacoes` para ativar a aba Solicitações; dashboard adiciona event listener e badge dinâmico |

## Regras sob vigilância

- W001, W002, W003, W004, W005 — ver `_reversa_forward/004-central-notificacoes/regression-watch.md`

## Fontes

- `_reversa_forward/004-central-notificacoes/legacy-impact.md`
- `_reversa_forward/004-central-notificacoes/regression-watch.md`
- `_reversa_forward/004-central-notificacoes/requirements.md`
- `_reversa_forward/004-central-notificacoes/actions.md`
- `_reversa_forward/004-central-notificacoes/progress.jsonl`
