# Onboarding: Central de Notificações no Header

> Identificador: `004-central-notificacoes`
> Data: `2026-05-21`

## Pré-requisitos

- Servidor local rodando (`npm run dev`)
- Um usuário com perfil admin, secretaria ou coordenação logado
- Pelo menos uma solicitação de documento pendente (criar como aluno)

## Passo a passo para testar

### 1. Criar solicitações pendentes (como aluno)

1. Faça login como um aluno
2. Navegue para Documentos
3. Clique em "+ Nova Solicitação"
4. Selecione "Declaração de Matrícula" e confirme
5. Repita 2-3 vezes para ter múltiplas pendências

### 2. Verificar badge no header (como admin/secretaria)

1. Faça logout e login como admin ou secretaria
2. Observe o badge no ícone do sino no header — deve mostrar o número de solicitações pendentes (ex.: "3")
3. Se não houver pendências, o badge deve estar invisível

### 3. Abrir dropdown de notificações

1. Clique no ícone do sino
2. Deve abrir um dropdown com:
   - Lista das solicitações pendentes (máx 10)
   - Cada item mostra: nome do aluno, tipo do documento, data relativa ("há 2 min")
   - Link "Ver todas (N mais)" se houver mais de 10

### 4. Ação "Concluir" inline

1. No dropdown, clique em "Concluir" em uma solicitação
2. A solicitação deve desaparecer da lista
3. O contador do badge deve decrementar

### 5. Link "Ver todas"

1. Clique em "Ver todas" no rodapé do dropdown
2. Deve navegar para `#/dashboard/secretaria` com a aba Solicitações ativa

### 6. Testar como aluno

1. Faça logout e login como aluno
2. Clique no sino
3. Deve ver apenas suas próprias solicitações pendentes

### 7. Testar como professor

1. Faça logout e login como professor
2. Clique no sino
3. Deve ver a mensagem "Nenhuma pendência"

### 8. Fechar dropdown

- Clique fora do dropdown → fecha
- Pressione Escape → fecha
- Clique em um item de ação → fecha

## Verificação técnica

```bash
# Verificar se não há erros de tipo
npx tsc --noEmit

# Rodar testes
npm test
```
