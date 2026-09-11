# Regression Watch: Vincular e Desvincular Professores em Disciplinas de Turmas

> Identificador: `011-vincular-professor-disciplina`
> Data: `2026-09-11`

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|-------------------------|-----------------------------|---------------------|-------------------|
| W001 | `_reversa_sdd/data-dictionary.md#Oferta (turma_disciplinas)` | `turma_disciplinas.professor_id` é opcional; desvínculo grava `null` sem remover a oferta | presença | Oferta some da grade após desvincular, ou erro de FK ao gravar `null` |
| W002 | `_reversa_sdd/professor/design.md#Interface` | Vincular professor em disciplina sem oferta cria a oferta; com oferta existente, atualiza `professor_id` | presença | Erro "já foi ofertada" ao vincular disciplina sem oferta, ou duplicidade de oferta por (turma, disciplina) |
| W003 | `_reversa_sdd/professor/requirements.md#Requisitos Não Funcionais` | Ações de vincular/desvincular geram registro em `audit_log` com a tabela `turma_disciplinas` | presença | Ação concluída sem linha correspondente em `audit_log` |
| W004 | `_reversa_sdd/domain.md#Regras de Domínio por Tipo de Entidade` | `professor_id` nulo não apaga notas (`boletim`) nem aulas (`aulas`) existentes | ausência | Notas ou aulas desaparecem após desvincular |

## Observações

Regras originalmente 🟡/🔴, sem peso de regressão:

- D-08 (roadmap): aulas antigas mantêm o `professor_id` do docente que as registrou; nenhum backfill é executado no desvínculo.
- `getDisciplinasDoProfessor` filtra por `professor_id`, então o professor perde acesso à disciplina ao ser desvinculado (comportamento esperado).

## Histórico de re-extrações

<!-- Preenchido pelo agente reverso ao rodar /reversa novamente. -->

## Arquivadas

<!-- Nenhuma. -->
