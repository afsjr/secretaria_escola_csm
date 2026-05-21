# Requirements: Central de Notificações no Header

> Identificador: `004-central-notificacoes`
> Data: `2026-05-21`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Criar um dropdown de notificações no header da aplicação que exibe solicitações de documentos pendentes com contador no badge, adaptado por perfil. Atualmente o botão do sino existe mas não tem funcionalidade. A feature unifica o acesso às pendências para todos os perfis — cada um vendo o que lhe compete — sem precisar navegar até o dashboard ou a aba de solicitações.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#Módulos Principais` | Módulo **Documents**: solicitações documentos (`src/lib/documents-service.ts`) | 🟢 |
| `_reversa_sdd/architecture.md#Camadas` | **Views** (`src/views/*.ts`) + **Components** (`src/components/*.ts`) + **Styles** (`src/styles/main.css`) | 🟢 |
| `_reversa_sdd/domain.md#RB01` | Aluno pode ter uma matrícula ativa por vez | 🟢 |
| `src/views/dashboard.ts:204-207` | Botão `#header-notification-btn` já existe no HTML do header com ícone de sino e `badge-dot`, sem event listener | 🟢 |
| `src/styles/main.css:581-610` | `.header-btn` e `.badge-dot` já estilizados | 🟢 |
| `src/lib/documents-service.ts:29-38` | `DocumentsService.getAllOpenRequests()` — retorna todas solicitações com join em `perfis(nome_completo, email)` | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Secretaria/Admin/Coordenação | Ver rapidamente todas solicitações de documentos pendentes | Ao clicar no sino no header, vê dropdown com lista de solicitações pendentes, nome do aluno, tipo de documento e data |
| Secretaria/Admin/Coordenação | Acessar a tela de gestão de solicitações a partir do dropdown | Clica em "Ver todas" no dropdown e é levado à aba Solicitações do painel Secretaria |
| Aluno | Ver status de suas próprias solicitações pendentes | Vê no dropdown apenas solicitações onde `user_id = auth.uid()` |
| Professor | (futuro) Ver notificações relevantes ao seu perfil | Por ora o dropdown exibe "Nenhuma pendência" |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** O contador do badge no sino reflete apenas solicitações com `status = 'pendente'` 🟢
   - Origem no legado: `src/lib/documents-service.ts#getAllOpenRequests` + `src/types/domain.ts#Solicitacao.status`
   - Tipo: nova
2. **RN-02:** O dropdown fecha ao clicar fora dele (click outside), ao pressionar Escape, ou ao clicar em um item de ação 🟢
   - Tipo: nova
3. **RN-03:** O dropdown exibe no máximo 10 solicitações mais recentes; se houver mais, mostra link "Ver todas (N mais)" 🟢
   - Tipo: nova
4. **RN-04:** Cada perfil vê as notificações que lhe competem: admin/secretaria/coordenação veem todas as solicitações pendentes; alunos veem apenas as próprias; professores veem estado vazio (extensível no futuro) 🟢
   - Origem no legado: RLS policy `"Students manage own requests"` no `supabase/migration.sql` + `check_user_is_admin_or_secretaria()` para admin/secretaria/coordenação
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Badge dinâmico: exibir contador de solicitações pendentes no `badge-dot` | Must | Ao carregar o dashboard, o badge mostra o número de pendências; atualiza ao abrir/fechar dropdown | 🟢 |
| RF-02 | Dropdown ao clicar no sino: lista as N solicitações pendentes mais recentes (máx 10) com nome do aluno, tipo de documento e data relativa | Must | Clicar no sino abre um dropdown estilizado com a lista; clicar fora ou Escape fecha | 🟢 |
| RF-03 | Link "Ver todas" no dropdown redireciona para `#/dashboard/secretaria` (aba Solicitações). Exibido apenas para admin/secretaria/coordenação | Must | Clicar em "Ver todas" fecha dropdown e navega para a tela de Secretaria com a aba Solicitações ativa | 🟢 |
| RF-04 | Conteúdo adaptado por perfil: admin/secretaria/coordenação veem todas as solicitações pendentes; alunos veem apenas as próprias; professores veem estado vazio | Should | Cada perfil logado vê no dropdown somente as notificações pertinentes ao seu papel | 🟢 |
| RF-05 | Ação rápida "Concluir" no dropdown para admin/secretaria (confirmação inline) | Should | Clicar em "Concluir" ao lado de uma solicitação no dropdown muda o status sem sair da página | 🟢 |
| RF-06 | Indicador de "vazio": quando não há pendências, o badge fica oculto e o dropdown mostra "Nenhuma pendência" | Must | Badge invisível quando count = 0; dropdown vazio exibe mensagem amigável | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | Dropdown busca dados no Supabase a cada abertura (lazy) com cache de 30s para evitar chamadas repetidas | 🟢 | `getAllOpenRequests` faz query com join; evitar chamadas em loop |
| Acessibilidade | Dropdown deve ter `role="menu"`, itens como `role="menuitem"`, foco gerenciado com arrow keys | 🟡 | DR-01 estabeleceu padrão de acessibilidade |
| Acessibilidade | Badge de contagem deve usar `aria-label` tipo "3 notificações pendentes" no botão do sino | 🟢 | DR-01 e DR-03 estabeleceram aria-labels |
| CSS | Dropdown segue o design system (variáveis CSS, sem framework) | 🟢 | Projeto não usa framework CSS |
| Tempo real | (Não escopo) Dropdown não usa polling ou subscription; count só atualiza ao abrir o dropdown manualmente | 🟢 | Simplificação intencional |

## 7. Critérios de Aceitação

```gherkin
Cenário: Admin vê notificações pendentes no header
  Dado que existem 3 solicitações de documentos com status "pendente"
  Quando o admin carrega o dashboard
  Então o badge no ícone do sino exibe o número "3"

Cenário: Admin abre dropdown de notificações
  Dado que existem solicitações pendentes
  Quando o admin clica no ícone do sino
  Então um dropdown é exibido com a lista das solicitações
  E cada item mostra nome do aluno, tipo do documento e data relativa

Cenário: Admin conclui solicitação pelo dropdown
  Dado que o dropdown de notificações está aberto
  Quando o admin clica em "Concluir" em uma solicitação
  Então o status da solicitação é atualizado para "concluido"
  E o item é removido da lista do dropdown
  E o contador do badge é decrementado

Cenário: Aluno vê apenas suas próprias solicitações
  Dado que um aluno está logado
  E existem solicitações de outros alunos pendentes
  Quando o aluno abre o dropdown de notificações
  Então ele vê apenas suas próprias solicitações pendentes

Cenário: Nenhuma pendência
  Dado que não há solicitações pendentes
  Quando o admin abre o dropdown de notificações
  Então o dropdown exibe a mensagem "Nenhuma pendência"
  E o badge do sino está oculto

Cenário: Dropdown fecha ao clicar fora
  Dado que o dropdown de notificações está aberto
  Quando o admin clica em qualquer área fora do dropdown
  Então o dropdown é fechado
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 (Badge contador) | Must | Essencial para comunicar visualmente a existência de pendências |
| RF-02 (Dropdown lista) | Must | Núcleo da funcionalidade |
| RF-06 (Estado vazio + badge oculto) | Must | Sem isso o badge fica sempre visível (como hoje) |
| RF-04 (Conteúdo por perfil) | Should | Cada perfil vê o que lhe compete, mas o comportamento base (RF-02) já cobre admin/secretaria |
| RF-05 (Ação Concluir inline) | Should | Evita navegação extra, mas pode ficar para depois |

## 9. Esclarecimentos

### Sessão 2026-05-21

- **Q:** Deve haver permissão para coordenação ver o dropdown de solicitações? Hoje `getAllOpenRequests` é acessível via RLS para admin/secretaria/coordenacao. O botão do sino existe para todos os perfis. Coordenação deve ver pendências ou apenas admin/secretaria?
  **R:** Todos os perfis, cada um vendo o que lhe compete. Admin/secretaria/coordenação veem todas as pendências; alunos veem apenas as próprias; professores veem estado vazio (extensível no futuro).
- **Q:** Onde fica o link "Ver todas" — leva para Secretaria > Solicitações ou deve abrir uma página dedicada? Atualmente a aba Solicitações está em `src/views/secretaria.ts`.
  **R:** Leva para a aba Solicitações dentro do Painel Secretaria (`#/dashboard/secretaria`).

## 10. Lacunas

Nenhuma lacuna em aberto no momento.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-05-21 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-05-21 | Esclarecimentos da sessão `/reversa-clarify`: perfil adaptado por role + link "Ver todas" → Secretaria > Solicitações | reversa |
