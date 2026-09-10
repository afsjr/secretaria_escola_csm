# Actions: Cálculo de Médias com Notas Variáveis

> Identificador: `010-calculo-medias-notas`
> Data: `2026-09-10`
> Roadmap: `_reversa_forward/010-calculo-medias-notas/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 6 |
| Paralelizáveis (`[//]`) | 2 |
| Maior cadeia de dependência | 3 (T001 → T003 → T005) |

## Fase 1, Preparação

<!-- Sem preparação necessária — sem migração, sem scaffolding. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| (nenha ação nesta fase) | | | | | | |

## Fase 2, Testes

<!-- Testes atualizados antes ou logo após o núcleo. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Atualizar testes de `calcularMediaParcial` em `grades.test.ts`: adicionar cenários com 1 nota, 2 notas, todos zeros, e nota zero real (n1=0, n2=7, n3=9). Manter teste existente de 3 notas como regressão. | - | `[//]` | `src/lib/grades.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

<!-- Lógica central da feature. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T002 | Alterar `calcularMediaParcial` em `grades-utils.ts`: substituir `(n1 + n2 + n3) / 3` por contagem dinâmica de notas > 0 (filter + length). Manter assinatura `(n1, n2, n3)`. | - | `[//]` | `src/lib/grades-utils.ts` | 🟢 | `[X]` |

## Fase 4, Integração

<!-- Cola com pdf-service e UI do professor. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T003 | Alinhar `pdf-service._calcularMediaTeoria` com `grades-utils`: substituir a implementação local por import de `calcularMediaParcial` de `grades-utils.ts`. Remover o método `_calcularMediaTeoria` se tornar desnecessário. | T002 | - | `src/lib/pdf-service.ts` | 🟡 | `[X]` |
| T004 | Adicionar alerta visual em `professor-turmas-notas.ts`: quando todos os campos (n1, n2, n3) = 0 para uma disciplina, exibir mensagem/warning "Nenhuma avaliação registrada" na aba de notas. Alerta desaparece ao preencher qualquer nota. | - | `[//]` | `src/views/professor-turmas-notas.ts` | 🟢 | `[X]` |

## Fase 5, Polimento

<!-- Verificação e regression-watch. -->

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Rodar suite completa de testes (`npm run test`) e verificar que todos passam, incluindo `grades.test.ts` e `pdf-service.test.ts`. | T002, T003 | - | (terminal) | 🟢 | `[X]` |
| T006 | Gerar `regression-watch.md` com observações de manutenção para a feature. | T005 | - | `_reversa_forward/010-calculo-medias-notas/regression-watch.md` | 🟢 | `[X]` |

## Notas de execução

<!-- Reservado para /reversa-coding. -->

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-10 | Versão inicial gerada por `/reversa-to-do` | reversa |
