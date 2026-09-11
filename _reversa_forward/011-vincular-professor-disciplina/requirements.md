# Requirements: Vincular e Desvincular Professores em Disciplinas de Turmas

> Identificador: `011-vincular-professor-disciplina`
> Data: `2026-09-11`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A feature permite à secretaria/coordenação atribuir e remover o professor responsável por cada disciplina ofertada em uma turma, a partir da própria tela de gestão da turma. Hoje o sistema só cria/atualiza vínculos por um fluxo centrado no professor e não oferece remoção explícita, o que dificulta corrigir trocas de docente. A entrega fecha esse ciclo com feedback visual (toast) e preservação do histórico de notas e aulas já lançadas.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#Módulos Principais` | Módulos Academic, Professor e Course concentram turmas, ofertas e vínculo docente | 🟢 |
| `_reversa_sdd/domain.md#Glossário de Termos de Domínio` | "Oferta" = vínculo entre turma e disciplina (com professor); tabela `turma_disciplinas` | 🟢 |
| `_reversa_sdd/domain.md#Regras de Domínio por Tipo de Entidade` | Professor é vinculado a ofertas (`turma_disciplinas`) | 🟢 |
| `_reversa_sdd/data-dictionary.md#Oferta (turma_disciplinas)` | `turma_id`, `disciplina_base_id`, `professor_id` (opcional) | 🟢 |
| `_reversa_sdd/professor/requirements.md#Requisitos Funcionais` | RF-03 "Vincular professor a oferta — Atualiza professor_id na oferta" | 🟢 |
| `_reversa_sdd/professor/design.md#Interface` | `vincularProfessorAOferta(ofertaId, professorId)`; `getAllOfertas()` | 🟢 |
| `_reversa_sdd/permissions.md#Matriz de Permissões` | `manage_turmas`/`manage_professores` para admin, secretaria, coordenação | 🟢 |
| `_reversa_sdd/code-analysis.md` (componentes Academic/Course) | `CourseService.criarOfertaDisciplina`, `atribuirProfessorAEstrutura`, `removerOfertaDisciplina` | 🟡 |
| `_reversa_sdd/addenda/010-calculo-medias-notas.md#Resumo da entrega` | Notas vinculadas à oferta; cálculo de média não pode ser afetado por troca de professor | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Secretaria / Coordenação | Definir quem leciona cada disciplina de uma turma | Ao montar o quadro docente, atribui o professor a cada disciplina ofertada |
| Secretaria / Coordenação | Corrigir ou substituir docente sem perder histórico | Remove o professor de uma disciplina após o término ou em caso de afastamento |
| Professor | Enxergar apenas as disciplinas sob sua responsabilidade | Após a atribuição, a disciplina aparece na lista de ofertas do professor |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** Existe no máximo uma oferta por par (turma, disciplina do catálogo). 🟢
   - Origem no legado: `_reversa_sdd/professor/design.md#Interface` (validação em `criarOfertaDisciplina`)
   - Tipo: nova (regra formalizada a partir do comportamento atual)
2. **RN-02:** Cada oferta tem no máximo um professor responsável; atribuir um novo professor substitui o anterior. 🟢
   - Origem no legado: `_reversa_sdd/data-dictionary.md#Oferta (turma_disciplinas)` (`professor_id` escalar)
   - Tipo: nova (regra formalizada)
3. **RN-03:** Desvincular um professor remove apenas a atribuição (`professor_id = null`), sem excluir a oferta nem apagar notas (`boletim`) ou aulas (`aulas`) já registradas. 🟢
   - Origem no legado: `_reversa_sdd/data-dictionary.md#Aula (aulas)` (aula referencia a oferta, não o vínculo)
   - Tipo: nova
4. **RN-04:** Vincular/desvincular professor exige permissão de gestão de turmas/professores (admin, master_admin, secretaria, coordenação). 🟢
   - Origem no legado: `_reversa_sdd/permissions.md#Matriz de Permissões`
   - Tipo: nova (regra de autorização explícita)
5. **RN-05:** Ao vincular um professor a uma oferta que já possui outro professor, o sistema alerta a substituição antes de confirmar. 🟢
   - Origem no legado: comportamento já presente no modal de vinculação (`GerenciarProfessoresTab`)
   - Tipo: mantida
6. **RN-06:** Se a disciplina ainda não tiver oferta na turma, o vínculo cria a oferta automaticamente. 🟢
   - Origem no legado: `_reversa_sdd/professor/design.md#Interface` (`criarOfertaDisciplina`)
   - Tipo: mantida
7. **RN-07:** Desvincular um professor que já lançou notas ou aulas exige confirmação explícita do usuário, informando que o histórico será preservado. 🟢
   - Origem no legado: `_reversa_sdd/data-dictionary.md#Aula (aulas)` e `#Boletim (boletim)`
   - Tipo: nova
8. **RN-08:** Ações de vincular e desvincular professor são registradas em `audit_log` com a tabela `turma_disciplinas` e o professor afetado. 🟢
   - Origem no legado: `_reversa_sdd/professor/requirements.md#Requisitos Não Funcionais` (auditoria já usada em aulas)
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Listar, na aba Grade da gestão de turmas, todas as disciplinas do catálogo do curso com o professor responsável atual (ou "Sem professor") | Must | Para cada disciplina do catálogo da turma, a tela exibe o nome e o professor vinculado quando existir | 🟢 |
| RF-02 | Vincular um professor a uma disciplina da turma selecionando-o em uma lista de professores | Must | Após confirmar, a oferta passa a ter o `professor_id` escolhido e a lista é atualizada | 🟢 |
| RF-03 | Desvincular o professor de uma disciplina da turma | Must | Após confirmação explícita, `professor_id` da oferta fica nulo e a disciplina exibe "Sem professor"; oferta, notas e aulas permanecem | 🟢 |
| RF-04 | Criar a oferta automaticamente ao vincular professor em disciplina ainda não ofertada | Must | Vínculo em disciplina sem oferta cria registro em `turma_disciplinas` com o professor e retorna sucesso | 🟢 |
| RF-05 | Alertar substituição quando a disciplina já tem professor | Should | Antes de confirmar, o sistema informa o professor atual e que ele será substituído | 🟢 |
| RF-06 | Exibir toast de sucesso/erro para vincular e desvincular | Must | Toda ação concluída mostra toast de sucesso; falha mostra toast de erro com a mensagem | 🟢 |
| RF-07 | Restringir a atribuição a usuários do sexo docente (perfil `professor`) | Should | A lista de vínculo contém apenas perfis com `perfil = 'professor'` | 🟡 |
| RF-08 | Registrar em auditoria as ações de vincular e desvincular | Should | Cada ação gera registro em `audit_log` com tabela `turma_disciplinas`, registro e professor afetado | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança | A escrita em `turma_disciplinas` deve respeitar RLS e a matriz de permissões | `_reversa_sdd/permissions.md#Restrições Adicionais`; `_reversa_sdd/architecture.md#Segurança` | 🟢 |
| Integridade | Desvincular não pode remover notas nem aulas existentes | Histórico acadêmico é base de boletim e certificação (`_reversa_sdd/domain.md#RB14`) | 🟢 |
| Desempenho | Listar disciplinas + professor da turma sem N+1 por disciplina | `_reversa_sdd/professor/design.md#Riscos e Lacunas` (N+1 já é dívida conhecida) | 🟡 |
| Observabilidade | Ações de vínculo/desvínculo rastreáveis em auditoria | `_reversa_sdd/professor/requirements.md#Requisitos Não Funcionais` (auditoria já usada em aulas) | 🟡 |
| Usabilidade | Feedback imediato (toast) e estado da lista atualizado sem recarregar a página | Padrão atual de toast em `GerenciarProfessoresTab` e `gestao-turmas` | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Vincular professor a disciplina já ofertada e sem professor
  Dado uma turma com a disciplina "Redes" ofertada e sem professor
  Quando a secretaria seleciona um professor e confirma o vínculo
  Então a oferta passa a ter o professor escolhido
  E a lista de disciplinas da turma exibe o nome do professor
  E um toast de sucesso é exibido

Cenário: Substituir professor responsável
  Dado uma disciplina da turma já vinculada ao professor "Ana"
  Quando a secretaria escolhe o professor "Bruno" e confirma
  Então o sistema alerta que "Ana" será substituída
  E após confirmar a oferta passa a apontar para "Bruno"

Cenário: Vincular professor em disciplina ainda não ofertada
  Dado uma disciplina do catálogo da turma sem registro de oferta
  Quando a secretaria vincula um professor a essa disciplina
  Então uma nova oferta é criada com o professor escolhido

Cenário: Desvincular professor preservando histórico
  Dado uma disciplina da turma vinculada a um professor com notas e aulas lançadas
  Quando a secretaria solicita desvincular
  Então o sistema pede confirmação informando que o histórico será preservado
  E ao confirmar a oferta permanece existente com professor nulo
  E as notas e aulas continuam acessíveis
  E a disciplina exibe "Sem professor"
  E um registro de auditoria é gravado

Cenário: Desvincular professor sem histórico lançado
  Dado uma disciplina da turma vinculada a um professor sem notas nem aulas lançadas
  Quando a secretaria confirma a desvinculação
  Então a oferta permanece existente com professor nulo
  E um toast de sucesso é exibido

Cenário: Usuário sem permissão tenta vincular
  Dado um usuário sem permissão de gestão de turmas
  Quando ele tenta vincular um professor a uma disciplina
  Então a operação é negada
  E um toast de erro é exibido

Cenário: Falha ao persistir vínculo
  Dado que a atualização da oferta falha no servidor
  Quando a secretaria confirma o vínculo
  Então um toast de erro é exibido
  E a lista permanece no estado anterior
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | Base visual para qualquer operação de vínculo |
| RF-02 | Must | Objetivo central da feature |
| RF-03 | Must | Pedido explícito do usuário (desvincular) |
| RF-04 | Must | Cobre disciplinas ainda não ofertadas, evitando erro |
| RF-05 | Should | Evita substituição acidental de docente |
| RF-06 | Must | Padrão de feedback da aplicação |
| RF-07 | Should | Impede vínculo de usuário não docente |
| RF-08 | Should | Rastreabilidade das ações administrativas |
| RNF de integridade | Must | Protege histórico acadêmico |

## 9. Esclarecimentos

### Sessão 2026-09-11

- **Q:** O que "desvincular" deve fazer com a oferta (turma+disciplina)?
  **R:** Apenas limpar o professor. A oferta permanece na turma, com `professor_id` nulo; notas e aulas são preservadas.
- **Q:** Onde deve ficar o controle de vincular/desvincular professor?
  **R:** Na aba Grade da gestão de turmas, com seleção do professor por disciplina.
- **Q:** Ao desvincular professor que já lançou notas/aulas, como proceder?
  **R:** Permitir com confirmação. O sistema avisa que o histórico será preservado e pede confirmação.
- **Q:** As ações de vincular/desvincular devem ser registradas em auditoria?
  **R:** Sim, registrar em `audit_log` (quem atribuiu/removeu e quando).

## 10. Lacunas

Nenhuma lacuna pendente.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-11 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-09-11 | Dúvidas resolvidas por `/reversa-clarify` (RN-03, RN-07, RN-08, UI na aba Grade) | reversa |
