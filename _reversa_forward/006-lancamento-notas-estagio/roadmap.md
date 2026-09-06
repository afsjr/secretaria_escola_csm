# Roadmap: Lançamento de Notas de Disciplinas Regulares e Estágio Supervisionado por Lote

> Identificador: `006-lancamento-notas-estagio`
> Data: `2026-09-06`
> Requirements: `_reversa_forward/006-lancamento-notas-estagio/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A abordagem implementa a segregação funcional entre docentes e secretaria no registro de avaliações acadêmicas. O painel do docente (`professor-service.ts` e views associadas) opera exclusivamente com notas de disciplinas regulares (N1, N2, N3, Rec). A Secretaria e Coordenação (`admin`, `secretaria`, `coordenacao`) recebem a nova interface `SecretariaEstagioLoteView` para carga e persistência em lote de notas de estágio supervisionado para turmas de cursos técnicos (`tipo_curso = 'tecnico'`). O processamento em lote é executado via `academicService.upsertNotaEstagioLote()`, que gera feedback visual imediato na UI por meio de um **toast flutuante**. As políticas de RLS e validações de lançamento de notas não verificam a flag `bloqueio_financeiro = true`, garantindo o registro desimpedido. O boletim do aluno (`aluno-notas.ts`) é atualizado para exibir a nota de estágio supervisionado assim que registrada.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| n/a | Não foram definidos princípios em `.reversa/principles.md` | respeita |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Reutilizar campo `nota_estagio` na tabela `boletim` | Modelo de dados já padronizado conforme ADR 002 | Criar nova tabela `notas_estagio` | 🟢 |
| D-02 | Criar `upsertNotaEstagioLote` em `academic-service.ts` | Permitir o salvamento eficiente de múltiplos alunos em lote recebidos do preceptor | Chamadas individuais sequenciais no frontend | 🟢 |
| D-03 | Restringir notas de estágio na UI do Professor | Manter segregação de responsabilidades entre regência de classe e supervisão de estágio | Liberar edição de estágio para qualquer docente | 🟢 |
| D-04 | Exibir confirmação via Toast Flutuante na Secretaria | Atender ao requisito explícito de sinalização visual imediata após salvar lote | Alertas nativos `alert()` ou badges discretas em tabela | 🟢 |
| D-05 | Isentar lançamento de notas da checagem de `bloqueio_financeiro` | Bloqueio financeiro deve impactar apenas rematrícula/certificados, não o registro acadêmico | Impedir lançamento de nota de inadimplentes | 🟢 |

## 4. Premissas

> Nenhuma premissa pendente (todas as dúvidas foram resolvidas na fase de requisitos).

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| `Academic Service` | `_reversa_sdd/architecture.md#módulos-principais` | contrato-alterado | Adicionar `upsertNotaEstagioLote` e validar elegibilidade por `tipo_curso`. |
| `Professor Service` | `_reversa_sdd/professor/requirements.md#requisitos-funcionais` | regra-alterada | Restringir operações de lançamento às notas regulares (N1, N2, N3, Rec). |
| `Secretaria View` | `_reversa_sdd/architecture.md#módulos-principais` | componente-novo | Criar `SecretariaEstagioLoteView` para digitação e gravação em lote de estágio com Toast flutuante. |
| `Student View` | `_reversa_sdd/student/requirements.md` | contrato-alterado | Exibir nota de estágio supervisionado em `AlunoNotasView` para turmas técnicas. |

## 6. Delta no modelo de dados

- Resumo das mudanças: Nenhuma alteração DDL exigida no banco PostgreSQL. Utilização dos campos pré-existentes `nota_estagio` (tabela `boletim`), `tipo_curso` (tabela `cursos`) e `bloqueio_financeiro` (tabela `perfis`).
- Detalhe completo em: `_reversa_forward/006-lancamento-notas-estagio/data-delta.md`

## 7. Delta de contratos externos

> n/a — A aplicação utiliza Supabase Client JS sem integrações HTTP de terceiros adicionais para este fluxo.

## 8. Plano de migração

> n/a — Sem migração de dados ou scripts DDL necessários.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Falha parcial durante salvamento de notas em lote da turma | médio | baixa | Processar batch via `Promise.allSettled` ou transação isolada e exibir no Toast os alunos salvos vs falhas. |
| Tentativa de lançamento de estágio em curso não técnico | baixo | baixa | Omitir a opção de estágio e aplicar validação de backend que rejeita `upsertNotaEstagio` para cursos que não são do tipo `tecnico`. |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `regression-watch.md` gerado
- [ ] Testes unitários com Vitest passando para `upsertNotaEstagioLote` e para a isenção de bloqueio financeiro

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-06 | Versão inicial gerada por `/reversa-plan` | reversa |
