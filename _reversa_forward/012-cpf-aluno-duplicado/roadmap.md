# Roadmap: Validação e Unicidade de CPF no Cadastro (aluno e professor)

> Identificador: `012-cpf-aluno-duplicado`
> Data: `2026-09-11`
> Requirements: `_reversa_forward/012-cpf-aluno-duplicado/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A entrega concentra a regra de CPF em um novo serviço `CpfService`, que normaliza o CPF e responde duas perguntas: "este CPF já existe?" e "quais são as inconsistências atuais?". Os formulários de cadastro de aluno e professor passam a exigir CPF, validar os dígitos com o `validarCPF` existente e consultar o serviço antes de chamar `AdminService.createUserByAdmin`. O painel de inconsistências é embutido na aba **Gerenciar Alunos** e exporta para Excel via `ExcelService.exportMultipleSheets`. Não há migração nem alteração de dados legados.

## 2. Princípios aplicados

Nenhum arquivo `.reversa/principles.md` encontrado no projeto. Nada a aplicar ou conflitar.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Adicionar `normalizarCPF` em `src/lib/validation.ts` | Centraliza a normalização junto da validação de CPF já existente | Helper local duplicado em cada formulário | 🟢 |
| D-02 | Criar `src/lib/cpf-service.ts` com `cpfJaExiste` e `listarInconsistenciasCPF` | Mantém a regra de negócio fora da view e permite testes unitários | Embutir queries nas views; inflar `AdminService` | 🟢 |
| D-03 | CPF obrigatório nos formulários de aluno e professor | Decisão do usuário em `/reversa-clarify` | Manter opcional | 🟢 |
| D-04 | Bloquear com toast de alerta e focar o campo de CPF ao detectar duplicidade | Padrão de feedback já usado no projeto | Erro inline sem toast | 🟢 |
| D-05 | Verificação de duplicidade carregando os CPFs de `perfis` e comparando em memória, normalizado | Sem migração (allowedPaths em `src/**`), funciona com dados legados em formatos variados | `eq('cpf', ...)` direto (falha com máscara); `UNIQUE` no banco (fora do allowedPaths) | 🟡 |
| D-06 | Painel de inconsistências dentro de `GerenciarAlunosTab`, carregado sob demanda por botão | Fica no local pedido pelo usuário sem onerar o carregamento padrão | Nova aba dedicada na Secretaria | 🟢 |
| D-07 | Exportação com `ExcelService.exportMultipleSheets` em duas abas (sem CPF / duplicados) | Serviço existente já suporta multi-abas | PDF; duas exportações separadas | 🟢 |
| D-08 | Não alterar registros legados; o corte é o bloqueio nos formulários | Decisão do usuário; preserva a base | Backfill/corrigir automaticamente | 🟢 |

## 4. Premissas

Nenhuma. Todas as dúvidas foram resolvidas em `/reversa-clarify` (sessão 2026-09-11).

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Validation | `_reversa_sdd/architecture.md#Camadas` / `src/lib/validation.ts` | contrato-novo | Ganha `normalizarCPF` |
| CPF Service | (novo) | componente-novo | Serviço de consulta de duplicidade e montagem do passivo |
| Cadastro de Aluno | `src/components/Tabs/CadastroAlunoTab.ts` | regra-alterada | CPF passa a ser obrigatório e é checado contra duplicidade |
| Cadastro de Professor | `src/components/Tabs/CadastroProfessorTab.ts` | regra-alterada | Mesmo comportamento do cadastro de aluno |
| Gestão de Alunos | `src/components/Tabs/GerenciarAlunosTab.ts` | regra-alterada | Ganha o painel de inconsistências com exportação |
| Excel Service | `src/lib/excel-service.ts` | contrato-reutilizado | `exportMultipleSheets` usado pelo painel |

## 6. Delta no modelo de dados

- Resumo das mudanças: nenhuma. `perfis.cpf` permanece `TEXT` sem `UNIQUE`; a unicidade é aplicada na aplicação (client-side). Nenhuma migração.
- Detalhe completo em: `_reversa_forward/012-cpf-aluno-duplicado/data-delta.md`

## 7. Delta de contratos externos

| Contrato | Tipo | Arquivo de detalhe |
|----------|------|--------------------|
| n/a | n/a | Sem contrato externo novo; leitura/escrita em `perfis` segue via Supabase com RLS |

## 8. Plano de migração

n/a. Não há migração de dados nem de schema. O passivo existente é apenas listado, não corrigido.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Cadastros simultâneos escaparem da checagem client-side | médio | médio | Documentar como limitação; futura constraint `UNIQUE` no banco quando `supabase/**` for liberado |
| RLS impedir a leitura de `perfis` para quem cadastra | alto | baixo | `AcademicService.getAlunos` já lê `perfis` com RLS normal; validar com perfil secretaria |
| Volume de perfis tornar a checagem lenta | médio | baixo | Selecionar apenas `id, cpf`; considerar RPC/índice em evolução futura |
| CPF legado em formatos variados gerar falso negativo/positivo | médio | médio | Normalização por dígitos em ambos os lados da comparação |
| Exposição indevida de CPF no painel | médio | baixo | Acesso restrito a perfis de gestão; listagem operacional |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `cross-check.md` (se executado) sem CRITICAL nem HIGH
- [ ] `regression-watch.md` gerado
- [ ] Re-extração reversa executada e sem regressão vermelha (recomendado, não obrigatório)

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-11 | Versão inicial gerada por `/reversa-plan` | reversa |
