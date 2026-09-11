# Legacy Impact: Vincular e Desvincular Professores em Disciplinas de Turmas

> Feature: `011-vincular-professor-disciplina`
> Data: `2026-09-11`
> Política de edição: `allowLegacyEdits: true`, `allowedPaths: ["src/**"]`

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|------------|------|------------|---------------|
| `src/lib/course-service.ts` | Course Service | regra-nova | MEDIUM | Novos métodos `vincularProfessorDisciplina`, `desvincularProfessorDisciplina` e `ofertaPossuiHistorico` |
| `src/views/gestao-turmas.ts` | Academic / Gestão de Turmas | regra-alterada | MEDIUM | Aba Grade passa a permitir vincular/substituir/desvincular professor inline |
| `src/lib/audit-service.ts` | Audit | regra-nova | LOW | Novas severidades `vincular_professor` e `desvincular_professor` |
| `src/lib/course-service.test.ts` | Course Service | regra-nova | LOW | Testes dos novos métodos |

## Diff conceitual por componente

### Course Service (`src/lib/course-service.ts`)

Antes, a criação de oferta (`criarOfertaDisciplina`) e a troca de professor (`atribuirProfessorAEstrutura`) existiam, mas não havia operação de desvínculo nem detecção de histórico. Agora o serviço concentra a regra: localiza a oferta por (turma, disciplina), cria se ausente, atualiza se presente e registra auditoria. `desvincularProfessorDisciplina` zera `professor_id` preservando a oferta. `ofertaPossuiHistorico` verifica aulas e notas para orientar a confirmação.

### Gestão de Turmas (`src/views/gestao-turmas.ts`)

A coluna "Professor" da aba Grade deixou de ser somente leitura. Para perfis com `canManageTurmas` (secretaria, coordenação, admin, master_admin), cada disciplina exibe um seletor de professor e um botão "Desvincular". Substituição é confirmada; desvínculo com histórico avisa que notas e aulas serão preservadas. Perfis sem permissão continuam vendo apenas o nome.

### Audit (`src/lib/audit-service.ts`)

As ações `vincular_professor` e `desvincular_professor` foram classificadas como severidade `media`.

## Preservadas

- RB01: Um aluno pode ter apenas uma matrícula ativa por vez 🟢
- RB02: Notas devem estar entre 0 e 10 🟢
- RB03: Controle de concorrência em notas (optimistic locking) 🟢
- RB04: Não é possível excluir turma com matrículas ativas 🟢
- RB10: CPF deve validar algoritmo brasileiro 🟢
- RB12: Matriz curricular dedup por nome + módulo 🟢
- RB13: Tipos de Curso determinam sistema de avaliação 🟢
- RB14: Requisitos de Conclusão e Emissão de Certificados 🟢
- RB15: Acesso de Alunos ao Boletim (somente leitura) 🟢
- RB16: Notificações de Documentos no Header 🟢

## Modificadas

- **Vínculo de professor a ofertas** (`_reversa_sdd/domain.md#Regras de Domínio por Tipo de Entidade`): antes descrito como "Professor vinculado a ofertas (turma_disciplinas)", agora explicitamente opcional — `professor_id` pode ser `null` após desvínculo, com a oferta preservada.
- **Grade da turma** (`src/views/gestao-turmas.ts`): antes somente leitura com indicação para usar "Gerenciar Professores"; agora é o ponto de gestão do vínculo.
