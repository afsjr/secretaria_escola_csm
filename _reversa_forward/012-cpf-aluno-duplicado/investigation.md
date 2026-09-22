# Investigation: Validação e Unicidade de CPF no Cadastro

> Identificador: `012-cpf-aluno-duplicado`
> Data: `2026-09-11`

## 1. Pergunta de investigação

Como impedir novos CPFs duplicados nos cadastros de aluno e professor e, ao mesmo tempo, dar visibilidade ao passivo já existente, sem migração de banco e com o menor delta sobre o legado?

## 2. Estado atual do legado

| Ponto | Evidência | Leitura |
|-------|-----------|---------|
| Validação de CPF | `src/lib/validation.ts:141` `validarCPF` | Algoritmo brasileiro completo, já usado nos formulários |
| Schema de perfis | `supabase/schema.sql:14-38` | `id UUID PRIMARY KEY`; `cpf TEXT` **sem** `UNIQUE` |
| Cadastro de aluno | `src/components/Tabs/CadastroAlunoTab.ts:162` | Valida dígitos, mas CPF é opcional e não checa duplicidade |
| Cadastro de professor | `src/components/Tabs/CadastroProfessorTab.ts:139` | Mesmo padrão |
| Criação de usuário | `src/lib/admin-service.ts:115` `createUserByAdmin` | Insere em `perfis` sem checar CPF |
| Listagem de alunos | `src/lib/academic-service.ts:70` `getAlunos` | Lê `perfis` com RLS normal, prova que a leitura funciona para a secretaria |
| Gestão de alunos | `src/components/Tabs/GerenciarAlunosTab.ts` | Componente de listagem; ponto de ancoragem do painel |
| Exportação | `src/lib/excel-service.ts:64` `exportMultipleSheets` | Suporta múltiplas abas num único `.xlsx` |

## 3. Alternativas avaliadas

### A. Restrição `UNIQUE` em `perfis.cpf` (descartada nesta feature)

Garantiria unicidade real inclusive em concorrência. Descartada porque exige migração em `supabase/**`, fora do `allowedPaths` atual (`src/**`), e porque o passivo existente faria a constraint falhar até ser saneado manualmente.

### B. Checagem com `eq('cpf', valor)` (descartada)

Simples, mas falha com dados legados em formatos diferentes (com/sem máscara), gerando falsos negativos.

### C. Serviço dedicado com normalização em memória (escolhida)

`CpfService` carrega `id, cpf` dos perfis, normaliza para dígitos e compara. Cobre o legado formatado, é testável e não exige migração. Limitação conhecida: não cobre corrida de cadastros simultâneos.

## 4. Padrões aplicáveis

- **Service layer:** views chamam serviços; serviços usam o Supabase Client (`_reversa_sdd/architecture.md#Camadas`).
- **Toast padronizado** para feedback (`src/lib/toast.ts`).
- **Exportação Excel** reaproveitando `ExcelService` (`exportMultipleSheets`, 2 abas).
- **Sem alteração destrutiva:** o passivo é listado, nunca corrigido automaticamente.

## 5. Lacunas remanescentes

- Garantia forte de unicidade (concorrência) fica pendente de uma constraint no banco, condicionada a liberar `supabase/**` em `.reversa/reversa-config.json`.
