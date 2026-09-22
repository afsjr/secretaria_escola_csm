# Regression Watch: Validação e Unicidade de CPF no Cadastro

> Identificador: `012-cpf-aluno-duplicado`
> Data: `2026-09-11`

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|-------------------------|-----------------------------|---------------------|-------------------|
| W001 | `_reversa_sdd/domain.md#RB10` | CPF continua validado pelo algoritmo brasileiro no cadastro de aluno e professor | presença | Cadastro aceita CPF com dígitos verificadores inválidos |
| W002 | `src/components/Tabs/CadastroAlunoTab.ts`, `CadastroProfessorTab.ts` | CPF é obrigatório e não pode duplicar perfil existente (comparação por dígitos) | presença | Cadastro conclui sem CPF, ou aceita CPF já existente |
| W003 | `supabase/schema.sql` (tabela `perfis`) | `perfis.cpf` permanece `TEXT` sem `UNIQUE`; a unicidade é client-side (best-effort) | redação | Constraint `UNIQUE` aparecer sem revisão da feature, ou duplicidade passar silenciosamente |
| W004 | `src/components/Tabs/GerenciarAlunosTab.ts` | Perfis sem CPF e CPFs duplicados são apenas listados; nenhum registro legado é alterado | presença | Rotina automática alterar/apagar CPF de registros existentes |

## Observações

Regras originalmente 🟡/🔴, sem peso de regressão:

- Cadastros simultâneos podem escapar da checagem client-side; a garantia forte depende de uma futura constraint `UNIQUE`/índice no banco (exige liberar `supabase/**` em `.reversa/reversa-config.json`).
- `cpfJaExiste` carrega `id, cpf` de todos os perfis; em bases muito grandes pode valer um RPC/índice.

## Histórico de re-extrações

<!-- Preenchido pelo agente reverso ao rodar /reversa novamente. -->

## Arquivadas

<!-- Nenhuma. -->
