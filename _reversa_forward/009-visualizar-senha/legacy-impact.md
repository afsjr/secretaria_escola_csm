# Legacy Impact: Visualizar Senha Digitada

> Feature: `009-visualizar-senha`
> Data: `2026-09-09`
> Política de edição: `allowLegacyEdits: true`, `allowedPaths: ["src/**"]`

## Arquivos afetados

| Arquivo | Componente | Tipo | Severidade | Justificativa |
|---------|-----------|------|------------|---------------|
| `src/lib/icons.ts` | Auth / Ícones | componente-novo (eyeOff) | LOW | Adição de ícone SVG, sem alteração de comportamento existente |
| `src/styles/main.css` | Presentation / Styles | regra-nova | LOW | CSS adicional para posicionamento do botão toggle |
| `src/lib/password-toggle.ts` | Auth / Utilitários | componente-novo | MEDIUM | Novo módulo utilitário, core da feature |
| `src/lib/password-toggle.test.ts` | Auth / Testes | componente-novo | LOW | Testes unitários do novo utilitário |
| `src/views/login.ts` | Auth / Login | regra-alterada | MEDIUM | Integração de toggle no campo senha do login |
| `src/views/signup.ts` | Auth / Signup | regra-alterada | LOW | Integração de toggle no campo senha do cadastro |
| `src/views/force-change-password.ts` | Auth / Force Change | regra-alterada | LOW | Integração de toggle nos 2 campos de senha |
| `src/views/dashboard.ts` | Presentation / Dashboard | regra-alterada | LOW | Integração de toggle no modal de troca obrigatória |
| `src/components/Tabs/CadastroAlunoTab.ts` | Academic / Cadastro | regra-alterada | LOW | Integração de toggle no campo senha do cadastro aluno |
| `src/components/Tabs/CadastroProfessorTab.ts` | Academic / Cadastro | regra-alterada | LOW | Integração de toggle no campo senha do cadastro professor |

## Preservadas

Todas as regras 🟢 do `_reversa_sdd/domain.md` permanecem intactas. A feature não altera regras de negócio, apenas adiciona usabilidade na camada de apresentação.

## Modificadas

Nenhuma regra de negócio foi alterada. As mudanças são exclusivamente de UI (botão toggle de visibilidade de senha).
