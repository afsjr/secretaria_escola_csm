# Onboarding: Validação e Unicidade de CPF no Cadastro

> Identificador: `012-cpf-aluno-duplicado`
> Data: `2026-09-11`

## Pré-requisitos

- Projeto rodando localmente (`npm run dev`)
- Usuário com perfil `secretaria`, `coordenacao`, `admin` ou `master_admin`
- Ao menos um perfil já cadastrado com CPF conhecido (para testar duplicidade)

## Passo a passo de validação

### 1. CPF obrigatório no cadastro de aluno

1. Vá em **Secretaria → Cadastrar Aluno**
2. Preencha nome, e-mail e senha, deixando o CPF vazio
3. Clique em **Cadastrar Aluno**
4. ✅ Toast de erro informando que o CPF é obrigatório
5. ✅ O cadastro não é realizado

### 2. CPF inválido

1. Informe um CPF com dígitos verificadores inválidos (ex.: `111.111.111-11`)
2. Clique em **Cadastrar Aluno**
3. ✅ Toast de erro de CPF inválido; campo recebe foco

### 3. CPF duplicado

1. Informe o CPF de um perfil já existente, em formato diferente (com/sem máscara)
2. Clique em **Cadastrar Aluno**
3. ✅ Toast de alerta informando que o CPF já está cadastrado
4. ✅ O cadastro é bloqueado

### 4. Cadastro válido

1. Informe um CPF inédito e válido
2. Conclua o cadastro
3. ✅ Aluno cadastrado com sucesso

### 5. Cadastro de professor

1. Repita os passos 1 a 4 em **Secretaria → Cadastrar Professor**
2. ✅ Mesmo comportamento do cadastro de aluno

### 6. Painel de inconsistências

1. Vá em **Secretaria → Gerenciar Alunos**
2. Clique em **Verificar inconsistências de CPF**
3. ✅ Aparece o grupo "Perfis sem CPF"
4. ✅ Aparece o grupo "CPFs duplicados" com os perfis agrupados por CPF
5. ✅ Nenhum registro é alterado

### 7. Exportação

1. No painel de inconsistências, clique em **Exportar Excel**
2. ✅ É baixado um `.xlsx` com as abas "Sem CPF" e "Duplicados"

### 8. Testes automatizados

```bash
npm test
```

✅ Todos os testes da feature passam. Testes-alvo: `src/lib/cpf-service.test.ts`, `src/lib/validation.test.ts`.
