# Actions: Visualizar Senha Digitada

> Identificador: `009-visualizar-senha`
> Data: `2026-09-09`
> Roadmap: `_reversa_forward/009-visualizar-senha/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 12 |
| Paralelizáveis (`[//]`) | 8 |
| Maior cadeia de dependência | 5 |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Adicionar ícone `eyeOff` ao `ICONS` em `src/lib/icons.ts`: adicionar chave `eyeOff` com paths SVG para olho riscado (dois traços diagonais sobre o olho), seguindo o padrão `const P = { ... }` e o mesmo estilo de `eye` existente (stroke, viewBox 24x24) | - | `[//]` | `src/lib/icons.ts` | 🟢 | `[X]` |
| T002 | Adicionar regras CSS para o botão toggle em `src/styles/main.css`: (a) `.input-icon-right` espelhado de `.input-icon-left` (position absolute, right 1rem, pointer-events auto, cursor pointer, color var(--text-muted)); (b) `.input-icon-wrapper .input-icon-right svg` com width/height 1.1rem; (c) regra para input sem wrapper: `.form-group .input` com `padding-right: 2.5rem` quando adjacente a botão toggle (criar classe auxiliar `.has-toggle`) | - | `[//]` | `src/styles/main.css` | 🟢 | `[X]` |
| T003 | Criar `src/lib/password-toggle.ts` com a função exportada `addPasswordToggle(input: HTMLInputElement): void`: (a) obter ou criar wrapper apropriado (`.input-icon-wrapper` se existir, senão `.form-group` do input); (b) criar `button` com `type="button"`, classe `input-icon-right`, `aria-label="Mostrar senha"`, innerHTML com `ICONS.eye`; (c) no click: alternar `input.type` entre `"password"` e `"text"`, trocar innerHTML do botão entre `ICONS.eye` e `ICONS.eyeOff`, atualizar `aria-label` entre "Mostrar senha" / "Ocultar senha"; (d) chamar `input.focus()` após alternar (D-05); (e) inserir botão após o input no DOM | T001, T002 | - | `src/lib/password-toggle.ts` | 🟢 | `[X]` |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T004 | Criar `src/lib/password-toggle.test.ts`: (a) mock de `../lib/icons` com `eye` e `eyeOff` retornando strings; (b) teste: `addPasswordToggle` em input dentro de `.form-group` insere botão com `aria-label="Mostrar senha"`; (c) teste: click no botão alterna `input.type` de `"password"` para `"text"` e `aria-label` para "Ocultar senha"; (d) teste: segundo click reverte para `"password"`; (e) teste: input dentro de `.input-icon-wrapper` recebe botão como filho do wrapper (não do form-group) | T003 | `[//]` | `src/lib/password-toggle.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Integrar toggle em `src/views/login.ts`: (a) importar `addPasswordToggle` de `../lib/password-toggle`; (b) após `container.innerHTML = ...`, chamar `addPasswordToggle(container.querySelector('#password')!)` — o input já está dentro de `.input-icon-wrapper`, então o botão será inserido como `.input-icon-right` dentro desse wrapper | T003 | `[//]` | `src/views/login.ts` | 🟢 | `[X]` |
| T006 | Integrar toggle em `src/views/signup.ts`: (a) importar `addPasswordToggle`; (b) após `container.innerHTML = ...`, chamar `addPasswordToggle(container.querySelector('#password')!)` — input dentro de `.form-group`, sem wrapper | T003 | `[//]` | `src/views/signup.ts` | 🟢 | `[X]` |
| T007 | Integrar toggle em `src/views/force-change-password.ts`: (a) importar `addPasswordToggle`; (b) após `container.innerHTML = ...`, chamar `addPasswordToggle` para `#new-password` e `#confirm-password` — dois campos, ambos dentro de `.form-group` | T003 | `[//]` | `src/views/force-change-password.ts` | 🟢 | `[X]` |
| T008 | Integrar toggle em `src/views/dashboard.ts`: localizar o trecho após o modal de troca obrigatória ser renderizado (verificar onde `form-troca-obrigatoria` está no DOM) e chamar `addPasswordToggle` para `#obrigatoria-nova` e `#obrigatoria-confirma` — ambos dentro de `.form-group` com estilos inline `background: white; color: black; border: none;` | T003 | `[//]` | `src/views/dashboard.ts` | 🟡 | `[X]` |
| T009 | Integrar toggle em `src/components/Tabs/CadastroAlunoTab.ts`: (a) importar `addPasswordToggle`; (b) após `container.innerHTML = ...` (ou equivalente de renderização), chamar `addPasswordToggle(container.querySelector('#aluno-senha')!)` | T003 | `[//]` | `src/components/Tabs/CadastroAlunoTab.ts` | 🟢 | `[X]` |
| T010 | Integrar toggle em `src/components/Tabs/CadastroProfessorTab.ts`: (a) importar `addPasswordToggle`; (b) após `container.innerHTML = ...`, chamar `addPasswordToggle(container.querySelector('#professor-senha')!)` | T003 | `[//]` | `src/components/Tabs/CadastroProfessorTab.ts` | 🟢 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T011 | Executar `npm run type-check` e `npm test`; confirmar que os testes novos (T004) estão verdes e que não há regressões além do baseline (4 falhas pré-existentes: GerenciarAlunosTab ×3 e secretaria ×1) | T004, T005, T006, T007, T008, T009, T010 | - | `src/` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T012 | Fechar critério de pronto: atualizar `roadmap.md` (marcar checkboxes de pronto), gerar `regression-watch.md` com baseline 4 falhas pré-existentes, validar que todos os 6 campos de senha têm toggle (login, signup, force-change ×2, dashboard ×2, cadastro-aluno, cadastro-professor) | T011 | - | `_reversa_forward/009-visualizar-senha/roadmap.md` | 🟢 | `[X]` |

## Notas de execução

- T001: `eyeOff` adicionado com paths SVG do Feather Icons (olho riscado com linha diagonal), consistente com `eye` existente.
- T002: CSS espelhado de `.input-icon-left`; `.input-icon-right` para wrapper e `.input-toggle-btn` para inputs soltos.
- T003: Função `addPasswordToggle` detecta `.input-icon-wrapper` automaticamente e usa a classe CSS correta.
- T004: 6 testes passando (form-group, wrapper, toggle, revert, focus, non-password guard).
- T005-T010: Todas as integrações seguem o mesmo padrão: import + chamada após innerHTML/renderTemplate.
- T011: type-check limpo; 314 passados (308 baseline + 6 novos), 4 falhas pré-existentes mantidas, zero regressão.
- T012: regression-watch.md e legacy-impact.md gerados. Watch items sem peso de regressão (feature puramente de UI).

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-09 | Versão inicial gerada por `/reversa-to-do` | reversa |
