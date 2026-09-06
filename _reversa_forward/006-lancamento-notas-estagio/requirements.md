# Requirements: Lançamento de Notas de Disciplinas Regulares e Estágio Supervisionado por Lote

> Identificador: `006-lancamento-notas-estagio`
> Data: `2026-09-06`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Esta funcionalidade estabelece a segregação estrita de responsabilidades no lançamento de notas acadêmicas, definindo que professores lançam notas de disciplinas regulares enquanto a secretaria e coordenação realizam o lançamento por lote de notas de estágio supervisionado (exclusivo para cursos técnicos). Além disso, garante a visibilidade do estágio ao aluno e assegura que o bloqueio financeiro por inadimplência nunca impeça o registro de notas no sistema.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#módulos-principais` | Academic, Professor e Student gerenciam a atribuição de notas e visualização do boletim | 🟢 |
| `_reversa_sdd/domain.md#rb09-disciplinas-com-estágio-têm-lógica-separada` | Estágio utiliza o campo `nota_estagio` na tabela `boletim` | 🟢 |
| `_reversa_sdd/domain.md#rb13-tipos-de-curso-determinam-sistema-de-avaliação` | Diferenciação de regras de avaliação entre Curso Técnico e Formação | 🟢 |
| `_reversa_sdd/domain.md#rb15-acesso-de-alunos-ao-boletim` | Acesso somente leitura ao boletim pessoal (`aluno_id = auth.uid()`) | 🟢 |
| `_reversa_sdd/adrs/002-notas-estagio.md` | Notas de estágio mantidas na tabela `boletim` via `upsertNotaEstagio` | 🟢 |
| `_reversa_sdd/professor/requirements.md#requisitos-funcionais` | Professor responsável por listar disciplinas e lançar notas regulares | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| **Professor** | Lançar e gerenciar notas de disciplinas regulares | Acessa suas turmas ativas e registra avaliações parciais (N1, N2, N3, Rec). |
| **Secretaria / Coordenação** | Lançar notas de estágio em lote enviadas por preceptores | Recebe o consolidado do preceptor e realiza a digitação/salvamento em lote para a turma técnica. |
| **Aluno (Curso Técnico)** | Acompanhar seu desempenho em disciplinas e no estágio | Acessa a tela "Minhas Notas" e visualiza a nota de estágio supervisionado assim que lançada. |

## 4. Regras de negócio novas ou alteradas

1. **RN-01 (Segregação de Lançamento por Perfil):** Professores lançam exclusivamente notas de disciplinas regulares. O lançamento de notas de estágio supervisionado é restrito aos perfis de Secretaria e Coordenação (`admin`, `secretaria`, `coordenacao`). 🟢
   - Origem no legado: `_reversa_sdd/domain.md#regras-de-domínio-por-tipo-de-entidade`

2. **RN-02 (Estágio Exclusivo para Curso Técnico):** A opção e campo de nota de estágio supervisionado são ativados e válidos apenas para ofertas pertencentes a cursos do tipo técnico (`tipo_curso = 'tecnico'`). 🟢
   - Origem no legado: `_reversa_sdd/domain.md#rb13-tipos-de-curso-determinam-sistema-de-avaliação`

3. **RN-03 (Visualização Aluno):** A nota de estágio supervisionado registrada fica imediatamente visível para o aluno na view de boletim (`AlunoNotasView` / "Minhas Notas") quando disponibilizada. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#rb15-acesso-de-alunos-ao-boletim`

4. **RN-04 (Lançamento por Lote com Feedback Visual):** Na interface da Secretaria, o lançamento de estágio deve permitir a inserção por lote dos alunos da oferta. O salvamento deve disparar feedback visual claro via **toast flutuante** indicando o sucesso do registro. 🟢

5. **RN-05 (Desvinculação de Bloqueio Financeiro):** O estado de `bloqueio_financeiro = true` do aluno NÃO impede a gravação ou alteração de suas notas regulares nem de estágio no banco de dados. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#aluno-perfisperfil--aluno`

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Restringir lançamento de estágio ao perfil Secretaria/Coordenação | Must | Professor não visualiza e não possui permissão para editar campo de estágio supervisionado. | 🟢 |
| RF-02 | Permitir lançamento de notas regulares pelo Professor | Must | Professor consegue lançar N1, N2, N3 e Rec para turmas regulares sob sua docência. | 🟢 |
| RF-03 | Validar elegibilidade de estágio para Cursos Técnicos | Must | O campo de estágio só fica disponível em turmas de cursos cadastrados como `tecnico`. | 🟢 |
| RF-04 | Criar interface de Lançamento por Lote de Estágio na Secretaria | Must | Secretaria consegue informar notas de estágio de múltiplos alunos e salvar em lote em uma única ação. | 🟢 |
| RF-05 | Exibir confirmação e sinalização visual pós-salvamento em lote | Must | Ao concluir o salvamento por lote, exibe toast flutuante de sucesso e atualiza o estado na tela. | 🟢 |
| RF-06 | Exibir nota de estágio no Boletim do Aluno | Must | Aluno de curso técnico visualiza o campo "Nota de Estágio" atualizado em "Minhas Notas". | 🟢 |
| RF-07 | Garantir lançamento de notas para alunos com bloqueio financeiro | Must | Aluno com `bloqueio_financeiro = true` aceita gravação de nota de disciplina e estágio sem exceções de RLS ou validação. | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | O lançamento por lote de notas de estágio deve ser processado de forma atômica ou otimizada em lote | Manter boa experiência ao salvar relatórios de turmas inteiras | 🟢 |
| Segurança / RLS | RLS no Supabase deve aplicar autorização estrita por perfil (`auth.uid()`, roles) sem depender apenas do frontend | `_reversa_sdd/permissions.md` | 🟢 |
| Usabilidade | Feedback imediato via toast flutuante ao usuário da Secretaria ao persistir notas | Evitar duplicidade de envios por dúvida se os dados foram salvos | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Secretaria lança notas de estágio por lote para turma técnica
  Dado que a secretária está autenticada e na tela de Lançamento de Estágio
  E selecionou uma turma do curso técnico
  Quando preencher as notas de estágio recebidas do preceptor para os alunos e clicar em "Salvar Notas em Lote"
  Então as notas de estágio são salvas na tabela boletim
  E um toast flutuante de sucesso é exibido na tela confirmando o registro dos dados

Cenário: Professor tenta lançar nota de estágio
  Dado que o professor está autenticado no painel docente
  Quando acessar a tela de lançamento de notas da sua disciplina
  Então ele visualiza e edita apenas as notas regulares (N1, N2, N3, Rec)
  E não possui opção nem permissão de alterar nota de estágio supervisionado

Cenário: Aluno inadimplente recebe nota de disciplina e estágio
  Dado que o aluno possui bloqueio_financeiro = true
  Quando o professor salva uma nota regular ou a secretaria salva a nota de estágio desse aluno
  Então a nota é gravada com sucesso no banco de dados sem ser bloqueada pela restrição financeira
  E o aluno consegue visualizar a nota no seu boletim

Cenário: Aluno visualiza nota de estágio supervisionado no curso técnico
  Dado que o aluno está matriculado em um curso técnico
  E a secretaria registrou a nota de estágio supervisionado
  Quando o aluno acessar a rota Minhas Notas
  Então a nota de estágio é exibida de forma clara ao lado das demais disciplinas
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | Regra essencial de segregação de acessos (Professor vs Secretaria) |
| RF-02 | Must | Funcionalidade fundamental do docente |
| RF-03 | Must | Restrição de regra de negócio por modalidade de curso |
| RF-04 | Must | Requisito operacional crítico para carga em lote da Secretaria |
| RF-05 | Must | Garantia visual e confirmação de UX exigida pelo usuário (Toast flutuante) |
| RF-06 | Must | Visibilidade para o aluno |
| RF-07 | Must | Requisito explícito: bloqueio financeiro não impede lançamento |

## 9. Esclarecimentos

### Sessão 2026-09-06

- **Q:** Qual componente visual específico (toast flutuante, banner superior ou badge em cada linha) deve ser utilizado como padrão principal de sinalização visual de sucesso no salvamento por lote da secretaria?
- **R:** Toast flutuante.

## 10. Lacunas

> Nenhuma lacuna ou `[DÚVIDA]` pendente.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-06 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-09-06 | Esclarecimento de componente visual (toast flutuante) via `/reversa-clarify` | reversa |
