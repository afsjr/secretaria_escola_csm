# Actions: Validação e Unicidade de CPF no Cadastro (aluno e professor)

> Identificador: `012-cpf-aluno-duplicado`
> Data: `2026-09-11`
> Roadmap: `_reversa_forward/012-cpf-aluno-duplicado/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 10 |
| Paralelizáveis (`[//]`) | 3 |
| Maior cadeia de dependência | 7 (T002 → T003 → T004 → T007 → T008 → T009 → T010) |

## Fase 1, Preparação

<!-- Sem setup, scaffolding ou migração: não há alteração de schema. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| (nenhuma ação nesta fase) | | | | | | |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Criar testes de `cpfJaExiste` (existente, inexistente, formatos com/sem máscara) e `listarInconsistenciasCPF` (sem CPF, duplicados, sem inconsistências). | - | `[//]` | `src/lib/cpf-service.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T002 | Adicionar `normalizarCPF(cpf)` em `validation.ts`, retornando apenas os 11 dígitos. | - | - | `src/lib/validation.ts` | 🟢 | `[X]` |
| T003 | Criar `CpfService.cpfJaExiste(cpf, ignorarId?)` em `src/lib/cpf-service.ts`: lê `id, cpf` de `perfis`, normaliza e compara; retorna booleano. | T002 | - | `src/lib/cpf-service.ts` | 🟢 | `[X]` |
| T004 | Criar `CpfService.listarInconsistenciasCPF()`: retorna `{ semCpf, duplicados }` a partir dos perfis, agrupando CPFs normalizados repetidos. | T003 | - | `src/lib/cpf-service.ts` | 🟢 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | `CadastroAlunoTab`: tornar CPF obrigatório (label/required) e, no submit, validar dígitos e consultar `CpfService.cpfJaExiste`; bloquear com toast de alerta e focar o campo. | T003 | `[//]` | `src/components/Tabs/CadastroAlunoTab.ts` | 🟢 | `[X]` |
| T006 | `CadastroProfessorTab`: mesmo comportamento do cadastro de aluno (obrigatório + validação + duplicidade + toast). | T003 | `[//]` | `src/components/Tabs/CadastroProfessorTab.ts` | 🟢 | `[X]` |
| T007 | `GerenciarAlunosTab`: adicionar painel de inconsistências sob demanda, carregando `CpfService.listarInconsistenciasCPF()` e renderizando os grupos "sem CPF" e "duplicados". | T004 | - | `src/components/Tabs/GerenciarAlunosTab.ts` | 🟢 | `[X]` |
| T008 | `GerenciarAlunosTab`: botão de exportação do painel para Excel com `ExcelService.exportMultipleSheets` (abas "Sem CPF" e "Duplicados"). | T007 | - | `src/components/Tabs/GerenciarAlunosTab.ts` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T009 | Rodar a suíte completa (`npm test`) e garantir que os testes da feature passam. | T005, T006, T008 | - | (terminal) | 🟢 | `[X]` |
| T010 | Gerar `regression-watch.md` com observações de manutenção da feature. | T009 | - | `_reversa_forward/012-cpf-aluno-duplicado/regression-watch.md` | 🟢 | `[X]` |

## Notas de execução

- Suíte completa: **337 passed, 4 failed**. As 4 falhas são o baseline pré-existente (`GerenciarAlunosTab.test.ts` e `secretaria.test.ts`), já registrado na feature 009; não têm relação com esta feature.
- `src/lib/cpf-service.test.ts`: 6 testes, todos passando. `npm run type-check`: sem erros.
- A checagem de duplicidade é client-side (sem migração); `allowedPaths` segue `src/**`.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-11 | Versão inicial gerada por `/reversa-to-do` | reversa |
| 2026-09-11 | Ações T001–T010 executadas por `/reversa-coding` | reversa |
