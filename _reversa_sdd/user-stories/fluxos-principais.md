# User Stories — Fluxos Principais

> Histórias de usuário extraídas do sistema legado

---

## 🚀 FLUXO 1: Login e Autenticação

**Como** usuário do sistema,
**Eu quero** autenticar-me para acessar o painel,
**Para que** possa visualizar e gerenciar minhas informações.

### Critérios de aceite

| Cenário | Dado | Quando | Então |
|---------|------|--------|-------|
| Login válido | Credenciais corretas | Usuário submete formulário | Redirecionado para dashboard |
| Login inválido | Senha incorreta | Usuário submete formulário | Exibe mensagem de erro |
| Sessão expirada | Token JWT expirado | Acesso a página protegida | Redirecionado para login |

---

## 🎓 FLUXO 2: Gestão de Alunos

**Como** administrador/secretária,
**Eu quero** gerenciar dados completos dos alunos,
**Para que** possa manter o registro acadêmico atualizado.

### Critérios de aceite

| Cenário | Dado | Quando | Então |
|---------|------|--------|-------|
| Criar aluno | Dados válidos | Admin preenche formulário | Aluno criado com perfil "aluno" |
| Editar aluno | Campos modificados | Admin salva alterações | Dados atualizados no banco |
| Inativar aluno | Motivo informado | Admin confirma inativação | Aluno marcado como inativo |
| Visualizar 360° | ID do aluno | Admin acessa perfil | Exibe dados completos + responsável |

---

## 📝 FLUXO 3: Lançamento de Notas

**Como** professor,
**Eu quero** lançar notas dos alunos,
**Para que** o desempenho seja registrado no sistema.

### Critérios de aceite

| Cenário | Dado | Quando | Então |
|---------|------|--------|-------|
| Lançar nota | Aluno, disciplina, nota válida | Professor salva | Nota registrada em tabela |
| Alterar nota | Nova nota informada | Professor justifica alteração | Nota atualizada + log de auditoria |
| Publicar notas | Todas prontas | Professor confirma | Alunos visualizam notas |

---

## 💰 FLUXO 4: Gestão Financeira

**Como** administrador,
**Eu quero** gerenciar cobranças e acordos,
**Para que** possa controlar a inadimplência.

### Critérios de aceite

| Cenário | Dado | Quando | Então |
|---------|------|--------|-------|
| Ver dashboard | Acesso ao módulo | Admin abre financeiro | Exibe total inadimplente, recuperado, previsto |
| Criar acordo | Débitos selecionados + desconto | Admin confirma acordo | Registra acordo + atualiza status dos débitos |
| Calcular juros | Débitos atrasados | Sistema calcula | Aplica multa 2% + juros 1% mensal |
| Gerar PDF | Dados do acordo | Admin solicita | Download de termo em PDF |

---

## 📄 FLUXO 5: Solicitação de Documentos

**Como** aluno,
**Eu quero** solicitar documentos oficiais,
**Para que** possa obter declarações e histórico.

### Critérios de aceite

| Cenário | Dado | Quando | Então |
|---------|------|--------|-------|
| Criar solicitação | Tipo de documento | Aluno submete | Solicitação criada com status pendente |
| Acompanhar | own requests | Aluno acessa "meus documentos" | Lista de solicitações com status |
| Processar | Solicitação pendente | Admin altera status | Status atualizado para concluído |

---

## 📋 FLUXO 6: Auditoria de Ações

**Como** administrador,
**Eu quero** visualizar logs de todas as ações sensíveis,
**Para que** possa investigar incidentes e garantir compliance.

### Critérios de aceite

| Cenário | Dado | Quando | Então |
|---------|------|--------|-------|
| Listar logs | Acesso ao módulo | Admin abre auditoria | Tabela com logs, filtros e contadores |
| Filtrar por ação | Ação selecionada | Admin aplica filtro | Resultados filtrados |
| Ver detalhes | Clique na linha | Admin clica | Expande detalhes do log |
| Alta severidade | Ações críticas | View inicia | Contador destaca ações altas |

---

## 📊 FLUXO 7: Relatórios e Exportação

**Como** administrador,
**Eu quero** exportar dados para planilhas,
**Para que** possa analisar خارج do sistema.

### Critérios de aceite

| Cenário | Dado | Quando | Então |
|---------|------|--------|-------|
| Exportar alunos | Filtros aplicados | Admin clica exportar | Download de arquivo .xlsx |
| Exportar financeiro | Dados do módulo | Admin clica exportar | Planilha com nome, CPF, status, valores |
| Exportar notas | turma selecionada | Professor Export | Planilha com notas por aluno |

---

## Priorização MoSCoW

| User Story | Prioridade |
|------------|-----------|
| Login e autenticação | **Must** (bloqueante) |
| Gestão de alunos | **Must** |
| Lançamento de notas | **Must** |
| Gestão financeira | **Should** |
| Solicitação de documentos | **Should** |
| Auditoria de ações | **Should** |
| Relatórios e exportação | **Could** |

---

**Confiança:** 🟢 Extraído do código fonte (services, views, templates)