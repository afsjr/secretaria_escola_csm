# Roadmap: Aluno — Minhas Notas

> Identificador: `005-aluno-notas`
> Data: `2026-05-23`
> Requirements: `_reversa_forward/005-aluno-notas/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

Feature 100% front-end. Nenhuma mudança em banco, serviços, RLS ou contratos externos. A abordagem é:

1. Criar view `AlunoNotasView` em `src/views/aluno-notas.ts` que reusa `AcademicService.getBoletim()` e as funções de cálculo em `grades-utils.ts`.
2. Registrar rota `#/dashboard/aluno/notas` no router do `dashboard.ts` e adicionar item "Minhas Notas" no sidebar condicionado ao perfil `aluno`.
3. Exibir tabela com disciplinas agrupadas por módulo, notas N1/N2/N3/Rec/Média e badge de status (aprovado/reprovado/cursando).

## 2. Princípios aplicados

Nenhum arquivo `.reversa/principles.md` encontrado. Nenhum princípio a verificar.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | View dedicada em `src/views/aluno-notas.ts` | Padrão do projeto: cada rota tem sua view em `src/views/` | Inline no dashboard.ts (viola separação) | 🟢 |
| D-02 | Reuso de `AcademicService.getBoletim()` sem wrapper | Função já retorna boletim + join disciplinas_base, suficiente para o caso de uso | Novo método específico (duplicação desnecessária) | 🟢 |
| D-03 | Cálculo da média via `calcularMediaParcial` + `calcularNotaFinal` (grades-utils.ts) | Funções já existentes, testadas e usadas pelo professor | Calcular inline (duplicação de lógica) | 🟢 |
| D-04 | Agrupamento por módulo no client-side | `getBoletim` já retorna `disciplinas_base.modulo`; ordenação e grouping é trivial em JS | Query SQL com ORDER BY + GROUP BY (desnecessário) | 🟢 |
| D-05 | Badge de status derivado do campo `status` do boletim + nota final | `status = pendente` → "Cursando"; senão, derivar de `calcularStatusAluno(notaFinal)` | Apenas confiar no campo status (perde granularidade aprovado/reprovado) | 🟢 |
| D-06 | Sidebar item condicionado a `_isAluno` | Mesmo padrão usado para outros links restritos por perfil no dashboard | Rota sem entrada no sidebar (aluno não descobre a feature) | 🟢 |

## 4. Premissas

Nenhuma. Todas as dúvidas foram resolvidas no `/reversa-clarify`.

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Presentation — Views | `src/views/dashboard.ts` | regra-alterada | Adicionar rota `aluno/notas` + item no sidebar do aluno |
| Presentation — Views | `src/views/` | componente-novo | Criar `aluno-notas.ts` |
| Business Logic — Services | `src/lib/academic-service.ts` | inalterado | `getBoletim` já atende |
| Business Logic — Grades | `src/lib/grades-utils.ts` | inalterado | Funções já existentes |
| Types | `src/types/domain.ts` | inalterado | `Boletim` e `Disciplina` já cobrem |

## 6. Delta no modelo de dados

- Resumo das mudanças: **nenhuma mudança no banco.** Tabela `boletim` já tem todos os campos e RLS já permite SELECT do próprio aluno.
- Detalhe completo em: `_reversa_forward/005-aluno-notas/data-delta.md`

## 7. Delta de contratos externos

Nenhum contrato externo é afetado.

## 8. Plano de migração

n/a — sem migração de dados.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Aluno sem matrícula ativa vê boletim vazio | baixo | médio | Exibir mensagem amigável "Nenhuma disciplina cadastrada" (RF-08) |
| Tipo `Boletim` em `domain.ts` incompleto (faltam campos do banco) | médio | médio | Usar `any` ou estender interface localmente na view; posterior atualização do tipo central |
| Cálculo da média diferir da tela do professor (arredondamento) | médio | baixo | Reusar exatamente `grades-utils.ts` que o professor já usa — mesma lógica |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `regression-watch.md` gerado
- [ ] Rota `#/dashboard/aluno/notas` carrega view correta
- [ ] Sidebar exibe "Minhas Notas" apenas para perfil aluno
- [ ] Tabela lista disciplinas com N1, N2, N3, Rec, Média e badge de status
- [ ] Disciplinas pendentes (`status = pendente`) aparecem como "Cursando"
- [ ] `tsc --noEmit` passa com zero erros
- [ ] Testes passam (mesma base dos 230+ testes existentes)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-05-23 | Versão inicial gerada por `/reversa-plan` | reversa |
