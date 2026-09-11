# Roadmap: Vincular e Desvincular Professores em Disciplinas de Turmas

> Identificador: `011-vincular-professor-disciplina`
> Data: `2026-09-11`
> Requirements: `_reversa_forward/011-vincular-professor-disciplina/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A mudança é confinada à camada de apresentação da grade da turma e a um par de métodos de serviço. Na aba **Grade (Ofertas)** de `gestao-turmas.ts`, cada linha de disciplina passa a ter um seletor de professor e uma ação de desvincular, disponíveis apenas para quem tem `canManageTurmas`. A lógica de criar/atualizar oferta e limpar vínculo é centralizada em `CourseService`, que passa a registrar auditoria em `audit_log`. Não há alteração de schema: `turma_disciplinas.professor_id` já é opcional, então `null` representa "sem professor". Notas (`boletim`) e aulas (`aulas`) referenciam a oferta/aluno e permanecem intactas.

## 2. Princípios aplicados

Nenhum arquivo `.reversa/principles.md` encontrado no projeto. Nada a aplicar ou conflitar.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Controlar vínculo na aba Grade de `gestao-turmas.ts` | Resposta do esclarecimento; é onde a grade da turma já é exibida | Manter só em `GerenciarProfessoresTab` | 🟢 |
| D-02 | Centralizar regra em `CourseService.vincularProfessorDisciplina` e `desvincularProfessorDisciplina` | Evita duplicar a lógica hoje embutida no componente de professores | Duplicar no view; criar serviço novo só para isso | 🟢 |
| D-03 | Desvincular = `professor_id = null`, sem remover a oferta | Resposta do esclarecimento; preserva notas e aulas | Remover a oferta da turma | 🟢 |
| D-04 | Exigir confirmação antes de desvincular quando houver notas/aulas | Resposta do esclarecimento; protege histórico | Desvincular direto | 🟢 |
| D-05 | Registrar `vincular_professor` e `desvincular_professor` em `audit_log` via `AuditService.log` | Resposta do esclarecimento; `AuditService` já é o padrão do projeto | Log local sem persistência | 🟢 |
| D-06 | Reutilizar `ProfessorService.getProfessores()` para popular o seletor | Método já existe e filtra `perfil = 'professor'` | Nova query em `perfis` no view | 🟢 |
| D-07 | Gate de permissão pelo `canManageTurmas` já existente no view | Alinha com `manage_turmas` da matriz de permissões | Criar novo checador de permissão | 🟢 |
| D-08 | Não alterar a FK `aulas.professor_id` ao desvincular | Histórico da aula pertence a quem a registrou | Atualizar aulas para o substituto | 🟡 |

## 4. Premissas

Nenhuma. Todas as dúvidas do `requirements.md` foram resolvidas em `/reversa-clarify` (sessão 2026-09-11).

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Gestão de Turmas (view) | `_reversa_sdd/architecture.md#Camadas` / `src/views/gestao-turmas.ts` | regra-alterada | Aba Grade ganha seletor de professor e ação desvincular por disciplina |
| Course Service | `_reversa_sdd/code-analysis.md` / `src/lib/course-service.ts` | contrato-novo | Novos métodos `vincularProfessorDisciplina` e `desvincularProfessorDisciplina` com auditoria |
| Professor Service | `_reversa_sdd/architecture.md#Módulos Principais` / `src/lib/professor-service.ts` | contrato-reutilizado | `getProfessores()` alimenta o seletor da grade |
| Audit Service | `_reversa_sdd/architecture.md#Módulos Principais` / `src/lib/audit-service.ts` | contrato-reutilizado | Recebe as novas ações e suas severidades |

## 6. Delta no modelo de dados

- Resumo das mudanças: nenhuma mudança de schema. `turma_disciplinas.professor_id` passa a ser esvaziado explicitamente (`null`) em desvínculo, o que já é suportado por ser campo opcional.
- Detalhe completo em: `_reversa_forward/011-vincular-professor-disciplina/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| n/a | n/a | Sem contrato externo novo; escrita continua via tabela Supabase `turma_disciplinas` sujeita a RLS |

## 8. Plano de migração

n/a. Não há migração de dados nem alteração de schema. Dados existentes permanecem válidos.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| RLS de `turma_disciplinas` não permitir update para secretaria/coordenação | alto | baixo | O fluxo atual de `GerenciarProfessoresTab` já atualiza a tabela; validar em teste manual com perfil secretaria |
| Perda de acesso do professor à disciplina após desvínculo | médio | alto | Comportamento esperado; aulas/registros anteriores permanecem e o professor pode ser revinculado |
| Duplicação de lógica entre `GerenciarProfessoresTab` e a nova grade | médio | médio | D-02 centraliza no serviço; refatorar o componente para consumir os mesmos métodos em passo de follow-up |
| Auditoria falhar silenciosamente | baixo | médio | `AuditService.log` não bloqueia o fluxo por design; aceitável e documentado no `regression-watch.md` |
| Seletor com muitos professores degradar a UI | baixo | baixo | Lista já é paginada implicitamente pela quantidade do corpo docente; sem N+1 (uma query única) |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-11 | Versão inicial gerada por `/reversa-plan` | reversa |
