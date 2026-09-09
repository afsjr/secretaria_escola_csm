# Roadmap: Visualizar Senha Digitada

> Identificador: `009-visualizar-senha`
> Data: `2026-09-09`
> Requirements: `_reversa_forward/009-visualizar-senha/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

Criar uma função utilitária `addPasswordToggle(input)` em `src/lib/password-toggle.ts` que, dado um `HTMLInputElement` com `type="password"`, insere um botão toggle ao lado direito do campo. O botão usa os ícones `eye` (já existente em `icons.ts`) e `eyeOff` (novo) para alternar entre visível/oculto. A função é chamada após o DOM ser renderizado em cada uma das 4 views/componentes que possuem campos de senha. CSS adicional posiciona o botão à direita do input, com variante para inputs dentro de `.input-icon-wrapper` (login).

## 2. Princípios aplicados

Nenhum princípio definido em `.reversa/principles.md` (arquivo inexistente).

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Função utilitária `addPasswordToggle(input)` em módulo separado | Reutilização em 6 campos, evita duplicação (RF-02) | Componente de classe (overkill para vanilla TS); inline em cada view (viola DRY) | 🟢 |
| D-02 | Ícone `eyeOff` adicionado a `icons.ts` seguindo padrão SVG existente | Já existe `eye` em `icons.ts:26`; padrão `svg(path)` é consistente | Usar Unicode/emoji (menor qualidade); biblioteca de ícones externa (dependência desnecessária) | 🟢 |
| D-03 | Botão inserido como `button` com `type="button"` dentro do `.form-group` ou `.input-icon-wrapper` | Não dispara submit do form; funciona com markup existente | Inserir como `<span>` (menos acessível); usar `position: fixed` (quebra layout) | 🟢 |
| D-04 | CSS: `.input-icon-right` espelha `.input-icon-left` com `right` em vez de `left` | Reutiliza padrão existente de `.input-icon-wrapper` (`main.css:2077-2108`) | Criar classe completamente nova (duplicação de lógica de posicionamento) | 🟢 |
| D-05 | Toggle chama `input.focus()` após alternar type | Alguns browsers perdem foco ao mudar `type` de input programaticamente | Não restaurar foco (UX pior, cursor some) | 🟡 |

## 4. Premissas

Nenhuma premissa. Não há `[DÚVIDA]` no requirements.

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Auth (Login) | `_reversa_sdd/architecture.md#Módulos Principais` | componente-alterado | `login.ts` ganha chamada `addPasswordToggle` + wrapper com `.input-icon-right` |
| Auth (Signup) | `_reversa_sdd/auth/requirements.md#RF-01` | componente-alterado | `signup.ts` ganha chamada `addPasswordToggle` |
| Auth (Force Change) | `_reversa_sdd/code-analysis.md#auth` | componente-alterado | `force-change-password.ts` ganha chamada `addPasswordToggle` ×2 |
| Presentation (Dashboard) | `_reversa_sdd/architecture.md#Camadas` | componente-alterado | `dashboard.ts` ganha chamada `addPasswordToggle` ×2 (modal troca) |
| Cadastro (Aluno) | `_reversa_sdd/architecture.md#Módulos Principais` | componente-alterado | `CadastroAlunoTab.ts` ganha chamada `addPasswordToggle` |
| Cadastro (Professor) | `_reversa_sdd/architecture.md#Módulos Principais` | componente-alterado | `CadastroProfessorTab.ts` ganha chamada `addPasswordToggle` |

## 6. Delta no modelo de dados

- Resumo das mudanças: nenhuma. Feature puramente de apresentação (UI), sem alteração de schema, banco ou API.
- Detalhe completo em: `_reversa_forward/009-visualizar-senha/data-delta.md`

## 7. Delta de contratos externos

Nenhum contrato externo afetado. Feature 100% client-side.

## 8. Plano de migração

n/a — sem migração de dados.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Browser antigo não suporta mudança de `type` em input | baixo | baixo | Fallback: se `input.type` não mudar, esconder botão (degradação graciosa) |
| Toggle quebra autocompletar do browser | baixo | médio | Testar com Chrome/Firefox; `autocomplete` permanece inalterado |
| Layout quebrado em `.input-icon-wrapper` (login) | médio | baixo | CSS espelhado de `.input-icon-left`; teste visual obrigatório |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `regression-watch.md` gerado
- [ ] Testes unitários do `addPasswordToggle` passando
- [ ] Todos os 6 campos de senha com toggle funcionando
- [ ] Acessibilidade: `aria-label` presente e navegação por teclado OK
- [ ] Layout do login (`.input-icon-wrapper`) preservado

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-09 | Versão inicial gerada por `/reversa-plan` | reversa |
