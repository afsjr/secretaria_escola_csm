# Legacy Impact: Validação e Unicidade de CPF no Cadastro

> Feature: `012-cpf-aluno-duplicado`
> Data: `2026-09-11`
> Política de edição: `allowLegacyEdits: true`, `allowedPaths: ["src/**"]`

## Arquivos afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|------------|------|------------|---------------|
| `src/lib/validation.ts` | Validation | regra-nova | LOW | Adiciona `normalizarCPF` |
| `src/lib/cpf-service.ts` | CPF Service | componente-novo | MEDIUM | Serviço de duplicidade e passivo de CPF |
| `src/lib/cpf-service.test.ts` | CPF Service | componente-novo | LOW | Testes do novo serviço |
| `src/components/Tabs/CadastroAlunoTab.ts` | Cadastro de Aluno | regra-alterada | HIGH | CPF obrigatório + bloqueio de duplicidade |
| `src/components/Tabs/CadastroProfessorTab.ts` | Cadastro de Professor | regra-alterada | HIGH | CPF obrigatório + bloqueio de duplicidade |
| `src/components/Tabs/GerenciarAlunosTab.ts` | Gestão de Alunos | regra-alterada | MEDIUM | Painel de inconsistências + exportação Excel |

## Diff conceitual por componente

### Validation (`src/lib/validation.ts`)

Ganhou `normalizarCPF`, que reduz qualquer CPF a 11 dígitos. `validarCPF` (RB10) permanece intacto.

### CPF Service (`src/lib/cpf-service.ts`)

Componente novo. `cpfJaExiste` lê `id, cpf` de `perfis`, normaliza e compara, com opção de ignorar um id. `listarInconsistenciasCPF` monta o passivo: perfis sem CPF e CPFs duplicados agrupados pelo valor normalizado. Não escreve nada no banco.

### Cadastro de Aluno / Professor

CPF deixou de ser opcional. No envio, o valor é normalizado, validado pelo algoritmo e checado contra duplicidade; havendo conflito, o cadastro é interrompido com toast de alerta e o campo recebe foco.

### Gestão de Alunos

A aba ganhou um painel sob demanda que mostra "Perfis sem CPF" e "CPFs duplicados" e exporta as duas listas para Excel (abas "Sem CPF" e "Duplicados"). Nenhum registro legado é alterado.

## Preservadas

- RB10: CPF deve validar algoritmo brasileiro 🟢 (reforçada; agora também checada contra duplicidade)
- RB01: Um aluno pode ter apenas uma matrícula ativa por vez 🟢
- RB02: Notas devem estar entre 0 e 10 🟢
- RB04: Não é possível excluir turma com matrículas ativas 🟢
- RB12: Matriz curricular dedup por nome + módulo 🟢
- RB14: Requisitos de Conclusão e Emissão de Certificados 🟢

## Modificadas

- **Cadastro de usuário (`perfis.cpf`)** (`_reversa_sdd/data-dictionary.md#Perfil`): antes opcional e sem checagem; agora obrigatório e sujeito a verificação de unicidade na aplicação (client-side). O banco não ganhou constraint.
- **Regras de Domínio por Tipo de Entidade (Aluno/Professor)**: passam a exigir CPF válido e único no momento do cadastro.
