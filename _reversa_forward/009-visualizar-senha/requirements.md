# Requirements: Visualizar Senha Digitada

> Identificador: `009-visualizar-senha`
> Data: `2026-09-09`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Adiciona um botão toggle (olho/olho-riscado) ao lado de cada campo de senha da aplicação, permitindo ao usuário alternar entre visível (`type="text"`) e oculto (`type="password"`). Afeta 6 campos de senha em 4 views/componentes: login, cadastro, primeiro acesso e cadastro de alunos/professores pela secretaria. Melhora a usabilidade em telas onde o usuário digita senhas longas ou precisa verificar o que está digitando antes de confirmar.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#Módulos Principais` | Auth é módulo de login/logout/recovery; views de auth em `src/views/*.ts` | 🟢 |
| `_reversa_sdd/architecture.md#Camadas` | Presentation Layer com Views (`src/views/*.ts`) e Components (`src/components/*.ts`) | 🟢 |
| `_reversa_sdd/auth/requirements.md#RF-01` | Login com email e senha — campo `type="password"` sem toggle | 🟢 |
| `_reversa_sdd/code-analysis.md#auth` | `login.ts`, `signup.ts`, `force-change-password.ts` usam `type="password"` em inputs | 🟡 |
| `_reversa_sdd/traceability/code-spec-matrix.md` | Views de login/signup não têm spec dedicada (auth genérica cobre) | 🟡 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Aluno / Funcionário | Digitar senha com confiança no login | Ao acessar o sistema, clica no ícone de olho para conferir a senha antes de entrar |
| Secretária (cadastro) | Criar aluno/professor com senha correta | Ao cadastrar um novo usuário, verifica visualmente que a senha digitada está correta antes de enviar |
| Qualquer usuário (primeiro acesso) | Criar nova senha pessoal | Na tela de troca obrigatória, confere a senha nueva antes de confirmar |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** Todo campo de senha (`type="password"`) na aplicação deve exibir um botão toggle de visibilidade ao lado direito do input. 🟢
   - Tipo: nova
   - Sem alteração de regra existente; apenas feature de usabilidade

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Toggle de visibilidade em campo de senha | Must | Botão com ícone de olho aparece ao lado direito de cada `input[type="password"]`. Ao clicar, o campo alterna para `type="text"` e o ícone muda para olho riscado. Segundo clique reverte. | 🟢 |
| RF-02 | Componente reutilizável | Must | Implementação via função utilitária (`addPasswordToggle`) chamada em cada view, sem duplicação de lógica | 🟡 |
| RF-03 | Acessibilidade | Should | Botão possui `aria-label` descritivo ("Mostrar senha" / "Ocultar senha") e é navegável por teclado (Enter/Space alterna) | 🟡 |
| RF-04 | Compatibilidade com wrapper existente | Must | Nos campos dentro de `.input-icon-wrapper` (login), o toggle não deve quebrar o layout do ícone à esquerda | 🟢 |

### Campos afetados

| View / Componente | ID do input | Status atual |
|-------------------|-------------|--------------|
| `src/views/login.ts` | `#password` | `type="password"` em `.input-icon-wrapper` |
| `src/views/signup.ts` | `#password` | `type="password"` |
| `src/views/force-change-password.ts` | `#new-password`, `#confirm-password` | `type="password"` |
| `src/views/dashboard.ts` | `#obrigatoria-nova`, `#obrigatoria-confirma` | `type="password"` (modal troca obrigatória) |
| `src/components/Tabs/CadastroProfessorTab.ts` | `#professor-senha` | `type="password"` |
| `src/components/Tabs/CadastroAlunoTab.ts` | `#aluno-senha` | `type="password"` |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Acessibilidade | Toggle acessível por teclado e leitor de tela | Boa prática WCAG 2.1 — botão interativo precisa de role/label | 🟡 |
| Performance | Impacto mínimo — DOM mutation por input, sem re-render de componente inteiro | SPA sem framework reativo (vanilla TS), manipulação direta de DOM é o padrão | 🟢 |
| Segurança | Toggle afeta apenas visualização client-side; o valor nunca é logado ou persistido | O tipo do input é `text` apenas no DOM, não há exposure adicional | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Toggle mostra a senha no login
  Dado que estou na tela de login com o campo senha vazio
  Quando digito "minha123" no campo senha
  E clico no botão de toggle (olho)
  Entao o campo senha mostra o texto "minha123" (type="text")
  E o ícone do botão muda para olho riscado

Cenário: Toggle oculta a senha no login
  Dado que estou na tela de login com a senha visível
  Quando clico no botão de toggle (olho riscado)
  Entao o campo senha volta a ocultar o texto (type="password")
  E o ícone do botão volta a ser olho

Cenário: Toggle funciona no cadastro de aluno
  Dado que estou na aba de cadastro de aluno na secretaria
  Quando clico no toggle do campo "Senha"
  Entao o campo alterna entre visível e oculto

Cenário: Toggle funciona na tela de primeiro acesso
  Dado que estou na tela de troca obrigatória de senha
  Quando clico no toggle de "Nova Senha"
  Entao o campo alterna entre visível e oculto
  E o toggle de "Confirmar Senha" também funciona independentemente
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | Feature principal — sem ela a feature não existe |
| RF-02 | Must | Manutenibilidade — evitar cópia de código em 6+ locais |
| RF-03 | Should | Acessibilidade — importante mas não bloqueia entrega |
| RF-04 | Must | Regressão — quebrar o layout do login seria regressão visível |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

Nenhuma lacuna identificada. Feature autocontida, sem ambiguidade de escopo.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-09 | Versão inicial gerada por `/reversa-requirements` | reversa |
