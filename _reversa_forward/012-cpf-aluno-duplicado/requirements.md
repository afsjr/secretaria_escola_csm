# Requirements: Validação e Unicidade de CPF no Cadastro (aluno e professor)

> Identificador: `012-cpf-aluno-duplicado`
> Data: `2026-09-11`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

A feature passa a exigir CPF válido e único no cadastro de alunos e professores, bloqueando duplicidade com toast de alerta. Como já existem registros sem CPF e CPFs repetidos, a entrega também inclui um painel que lista esse passivo (perfis sem CPF e CPFs duplicados) com exportação para Excel. O marcador de corte é o próprio bloqueio nos formulários a partir da entrega, sem alterar registros legados e sem migração de banco.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/domain.md#RB10` | "CPF deve validar algoritmo brasileiro" — 11 dígitos, rejeita sequências repetidas, valida 2 dígitos verificadores | 🟢 |
| `_reversa_sdd/data-dictionary.md#Perfil` | `perfis.cpf` é `TEXT` (sem restrição de unicidade) | 🟢 |
| `supabase/schema.sql` (tabela `perfis`) | `id UUID PRIMARY KEY`; `cpf TEXT` sem `UNIQUE` | 🟢 |
| `src/lib/validation.ts#validarCPF` | Função `validarCPF` já implementa o algoritmo | 🟢 |
| `src/components/Tabs/CadastroAlunoTab.ts` | Formulário valida formato/feedback, mas não consulta duplicidade; CPF opcional | 🟢 |
| `src/components/Tabs/CadastroProfessorTab.ts` | Mesmo padrão de validação de CPF, sem checagem de duplicidade | 🟢 |
| `src/components/Tabs/GerenciarAlunosTab.ts` | Listagem de alunos; ponto natural para o painel de inconsistências | 🟢 |
| `src/lib/excel-service.ts#exportToExcel` | Exportação Excel já disponível (SheetJS) | 🟢 |
| `_reversa_sdd/permissions.md#Matriz de Permissões` | Secretaria/coordenação/admin em `manage_users`; visão de dados de alunos | 🟢 |

> Observação de nomenclatura: a chave primária de `perfis` é `id` (uuid); o CPF é atributo candidato a único, não a PK. A feature trata o CPF como chave de negócio para detecção de duplicidade.

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Secretaria / Coordenação | Cadastrar aluno/professor sem duplicidade | Ao informar CPF já existente, recebe alerta e o cadastro é bloqueado |
| Secretaria / Coordenação | Sanear o passivo de CPF | Abre o painel de inconsistências, vê perfis sem CPF e CPFs duplicados e exporta a planilha |
| Gestão (admin/coordenação) | Acompanhar a qualidade do cadastro | Usa o painel como indicador até zerar o passivo |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** O CPF informado no cadastro deve ser válido pelo algoritmo brasileiro. 🟢
   - Origem no legado: `_reversa_sdd/domain.md#RB10`
   - Tipo: mantida
2. **RN-02:** Não é permitido cadastrar aluno ou professor com CPF já existente em qualquer perfil do sistema. 🟢
   - Origem no legado: ausência de regra; deduzida do problema relatado
   - Tipo: nova
3. **RN-03:** A comparação de CPF para duplicidade deve ser insensível à formatação, comparando apenas os 11 dígitos. 🟢
   - Origem no legado: `perfis.cpf` é `TEXT` e registros existentes variam de formato
   - Tipo: nova
4. **RN-04:** Ao detectar CPF duplicado, o cadastro é interrompido e um toast de alerta é exibido. 🟢
   - Origem no legado: padrão de feedback por toast (`src/lib/toast.ts`)
   - Tipo: nova
5. **RN-05:** O CPF passa a ser obrigatório nos cadastros de aluno e professor a partir desta entrega. 🟢
   - Origem no legado: campo hoje opcional em `CadastroAlunoTab`/`CadastroProfessorTab`
   - Tipo: alterada
6. **RN-06:** O sistema disponibiliza um painel de inconsistências que lista perfis sem CPF e CPFs duplicados, com exportação para Excel. 🟢
   - Origem no legado: `ExcelService.exportToExcel`
   - Tipo: nova
7. **RN-07:** O corte da duplicidade é o bloqueio nos formulários a partir desta entrega; registros legados não são alterados nem corrigidos automaticamente, apenas listados no painel. 🟢
   - Origem no legado: passivo de dados existente
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Validar o CPF no envio do cadastro | Must | CPF com dígitos verificadores inválidos bloqueia o envio com toast de erro | 🟢 |
| RF-02 | Consultar se o CPF já existe antes de concluir o cadastro, em qualquer perfil | Must | CPF já cadastrado bloqueia o cadastro e exibe toast de alerta de duplicidade | 🟢 |
| RF-03 | Normalizar o CPF (somente dígitos) para a comparação | Must | "123.456.789-09" e "12345678909" são tratados como o mesmo CPF | 🟢 |
| RF-04 | Exigir CPF no cadastro de aluno e de professor | Must | Envio sem CPF é bloqueado com toast de campo obrigatório | 🟢 |
| RF-05 | Manter o feedback visual do campo de CPF durante a digitação | Should | O campo exibe indicador de válido/inválido conforme os dígitos | 🟢 |
| RF-06 | Exibir painel de inconsistências com dois grupos: perfis sem CPF e CPFs duplicados | Must | O painel lista os dois grupos com nome, e-mail, perfil e CPF (quando houver) | 🟢 |
| RF-07 | Exportar o painel de inconsistências para Excel | Should | Botão gera arquivo `.xlsx` com as duas abas (sem CPF e duplicados) | 🟢 |
| RF-08 | Não alterar automaticamente os registros legados inconsistentes | Must | Perfis sem CPF ou duplicados permanecem intactos; apenas listados | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Segurança | Painel e cadastros restritos a perfis com `manage_users` (admin, secretaria, coordenação, master_admin) | `_reversa_sdd/permissions.md#Matriz de Permissões` | 🟢 |
| Privacidade | A mensagem de duplicidade não deve expor dados do titular já cadastrado | Boas práticas LGPD | 🟡 |
| Consistência | A checagem client-side é best-effort; cadastros simultâneos podem escapar sem restrição no banco | `supabase/schema.sql` (`cpf TEXT` sem `UNIQUE`) | 🟡 |
| Desempenho | A consulta de duplicidade e a montagem do painel devem evitar carregar a base inteira repetidamente | `_reversa_sdd/professor/design.md#Riscos e Lacunas` (evitar N+1) | 🟡 |
| Observabilidade | O bloqueio por duplicidade pode ser registrado em auditoria | `src/lib/audit-service.ts` | 🔴 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Cadastro de aluno bloqueado por CPF duplicado
  Dado que existe um perfil com o CPF "123.456.789-09"
  Quando a secretaria tenta cadastrar um aluno com o mesmo CPF
  Então o cadastro é bloqueado
  E um toast de alerta informa que o CPF já está cadastrado

Cenário: Duplicidade detectada com formatação diferente
  Dado que existe um perfil com o CPF "123.456.789-09"
  Quando a secretaria informa "12345678909"
  Então o cadastro é bloqueado como duplicado

Cenário: CPF obrigatório no cadastro de aluno
  Dado o formulário de cadastro de aluno
  Quando a secretaria tenta concluir sem informar CPF
  Então o cadastro é bloqueado com toast de campo obrigatório

Cenário: Cadastro de professor bloqueado por CPF duplicado
  Dado que existe um perfil com o CPF informado
  Quando a secretaria tenta cadastrar um professor com esse CPF
  Então o cadastro é bloqueado
  E um toast de alerta é exibido

Cenário: Cadastro permitido com CPF inédito e válido
  Dado que não existe perfil com o CPF informado
  E o CPF é válido
  Quando a secretaria conclui o cadastro
  Então o aluno ou professor é cadastrado com sucesso

Cenário: Cadastro bloqueado por CPF inválido
  Dado um CPF com dígitos verificadores inválidos
  Quando a secretaria tenta concluir o cadastro
  Então o cadastro é bloqueado
  E um toast de erro informa que o CPF é inválido

Cenário: Painel de inconsistências lista o passivo
  Dado o painel de inconsistências aberto
  Então são listados os perfis sem CPF
  E são listados os CPFs duplicados agrupados
  E os registros legados permanecem inalterados

Cenário: Exportação do painel para Excel
  Dado o painel de inconsistências aberto
  Quando a secretaria clica em exportar
  Então um arquivo .xlsx é gerado com as abas de sem CPF e duplicados
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | Requisito já parcialmente atendido; formaliza a validação |
| RF-02 | Must | Núcleo da feature: evitar duplicidade |
| RF-03 | Must | Sem normalização a checagem falha com dados legados formatados |
| RF-04 | Must | Decisão do usuário: CPF obrigatório |
| RF-05 | Should | Feedback de UX já existente |
| RF-06 | Must | Decisão do usuário: listar o passivo atual |
| RF-07 | Should | Decisão do usuário: exportar o passivo |
| RF-08 | Must | Não alterar dados legados automaticamente |

## 9. Esclarecimentos

### Sessão 2026-09-11

- **Q:** O CPF deve continuar opcional no cadastro de aluno ou passa a ser obrigatório?
  **R:** Tornar obrigatório.
- **Q:** Com o que o CPF deve ser comparado para detectar duplicidade?
  **R:** Bloqueia se o CPF já existir em qualquer perfil. Também é preciso listar o passivo atual (perfis sem CPF e CPFs duplicados) e estabelecer um marcador de corte para não haver mais duplicidade.
- **Q:** Onde garantir a unicidade do CPF?
  **R:** Só verificação client-side; sem migração no banco.
- **Q:** Aplicar a mesma checagem no cadastro de professor?
  **R:** Sim, aluno e professor.
- **Q:** Qual é a natureza do "marcador"?
  **R:** Bloqueio nos formulários a partir da entrega + listagem do passivo; sem campo novo no banco.
- **Q:** Como o passivo deve ser apresentado?
  **R:** Painel na gestão de alunos com exportação para Excel.

## 10. Lacunas

Nenhuma lacuna pendente.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-11 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-09-11 | Escopo ampliado por `/reversa-clarify`: CPF obrigatório, aluno+professor, painel de inconsistências + export, sem migração | reversa |
