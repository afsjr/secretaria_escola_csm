# Onboarding: Visualizar Senha Digitada

> Identificador: `009-visualizar-senha`
> Data: `2026-09-09`

## Pré-requisitos

- Projeto rodando localmente (`npm run dev`)
- Pelo menos um usuário criado no Supabase (para testar login)

## Passo a passo de validação

### 1. Tela de Login (`#/`)

1. Acesse `http://localhost:5173/#/`
2. Digite qualquer texto no campo **SENHA**
3. Clique no **ícone de olho** à direita do campo
4. ✅ O texto deve ficar visível e o ícone mudar para olho riscado
5. Clique novamente
6. ✅ O texto deve voltar a ficar oculto (bolinhas)

### 2. Tela de Cadastro (`#/signup`)

1. Acesse `http://localhost:5173/#/signup`
2. Digite no campo **Senha**
3. Clique no toggle
4. ✅ Senha fica visível / oculta ao clicar novamente

### 3. Troca Obrigatória de Senha (modal no dashboard)

1. Faça login com um usuário que tenha `force_password_change: true` no `user_metadata`
2. No modal "Segurança em Primeiro Lugar", digite no campo **Nova Senha**
3. ✅ Toggle funciona
4. Repita para **Confirmar Nova Senha**
5. ✅ Toggle funciona independentemente

### 4. Cadastro de Aluno (Secretaria)

1. Faça login como secretária/admin
2. Vá em **Gestão** → **Cadastrar Aluno**
3. Digite no campo **Senha**
4. ✅ Toggle funciona

### 5. Cadastro de Professor (Secretaria)

1. Vá em **Gestão** → **Cadastrar Professor**
2. Digite no campo **Senha**
3. ✅ Toggle funciona

### 6. Acessibilidade

1. Navegue até o campo de senha usando **Tab**
2. Pressione **Enter** ou **Space** no botão toggle
3. ✅ O campo alterna entre visível/oculto

### 7. Testes automatizados

```bash
npx vitest run src/lib/password-toggle.test.ts
npm test
```

✅ Todos os testes devem passar (sem novas falhas além das 4 pré-existentes).
