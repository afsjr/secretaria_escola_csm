# 🎓 Sistema de Gestão Escolar - CSM

## Guia de Funcionalidades e Permissões por Perfil

**Colégio Santa Mônica** - Limoeiro/PE  
**Versão:** 5.0  
**Última Atualização:** Abril 2026

---

## 📋 Sumário

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Como Acessar](#como-acessar)
3. [Perfis de Usuário](#perfis-de-usuário)
4. [Funcionalidades por Perfil](#funcionalidades-por-perfil)
5. [Matrícula de Alunos](#matrícula-de-alunos)
6. [Lançamento de Notas](#lançamento-de-notas)
7. [Registro de Aulas](#registro-de-aulas)
8. [Solicitação de Documentos](#solicitação-de-documentos)
9. [Segurança e Proteção de Dados](#segurança-e-proteção-de-dados)
10. [Material de Treinamento](#material-de-treinamento)
11. [Solução de Problemas](#solução-de-problemas)

---

## 👥 Visão Geral do Sistema

O **Sistema de Gestão Escolar (SGE)** é uma plataforma digital desenvolvida especialmente para o **Colégio Santa Mônica** que permite gerenciar todas as atividades acadêmicas de forma organizada, segura e eficiente.

### 🎯 Objetivos do Sistema

- ✅ Centralizar informações acadêmicas em um único lugar
- ✅ Facilitar a comunicação entre alunos, professores e secretaria
- ✅ Automatizar processos como lançamento de notas e emissão de documentos
- ✅ Garantir segurança e privacidade dos dados
- ✅ Permitir acesso de qualquer lugar com internet

### 🌐 Acesso ao Sistema

**URL:** <https://afsjr.github.io/secretaria_escola_csm/>

Ou acesse localmente durante o desenvolvimento:  
**Local:** <http://localhost:5173/secretaria_escola_csm/>

---

## 🔐 Perfis de Usuário

O sistema possui **3 perfis de acesso**, cada um com permissões e funcionalidades específicas:

| Perfil | Quem Usa | Acesso Principal |
|--------|----------|------------------|
| 👨‍🎓 **Aluno** | Estudantes matriculados | Notas, documentos, matriz curricular |
| 👨‍🏫 **Professor** | Docentes que ministram aulas | Lançar notas, registrar aulas, frequência |
| 🏫 **Secretaria/Admin** | Funcionários da secretaria | Acesso total ao sistema |

---

## 📚 Funcionalidades por Perfil

### 👨‍🎓 ALUNO

| Menu | Descrição |
|------|-----------|
| 📌 **Início** | Painel de Controle com estatísticas pessoais e avisos |
| 📄 **Documentos** | Solicitar Declaração de Matrícula, Histórico, Atestado |
| 👥 **Usuários** | Ver lista de colegas (apenas nomes, por privacidade) |
| 📚 **Matriz Curricular** | Ver todas as disciplinas do curso |
| ⚙️ **Meus Dados** | Editar perfil completo (dados, endereço, contato) |

**O que o Aluno pode fazer:**

- ✅ Visualizar suas notas e frequência
- ✅ Solicitar documentos acadêmicos
- ✅ Editar seus dados pessoais
- ✅ Ver matriz curricular do curso
- ✅ Acompanhar status de solicitações

**O que o Aluno NÃO pode fazer:**

- ❌ Lançar ou modificar notas
- ❌ Registrar aulas
- ❌ Gerenciar turmas ou matrículas
- ❌ Acessar dados de outros alunos

---

### 👨‍🏫 PROFESSOR

| Menu | Descrição |
|------|-----------|
| 📌 **Início** | Painel de Controle com estatísticas das turmas |
| 🎓 **Minhas Turmas** | Ver turmas, lançar notas em lote, registrar frequência |
| 👤 **Meus Alunos** | Busca de alunos + ficha completa individual |
| 📅 **Registrar Aula** | Registrar conteúdo ministrado em cada aula |
| 📚 **Matriz Curricular** | Visualizar grade curricular dos cursos |
| ⚙️ **Meus Dados** | Editar perfil completo |
| 📚 **Treinamento** | Acessar material de treinamento |

**O que o Professor pode fazer:**

- ✅ Lançar notas dos alunos (N1, N2, N3, Recuperação)
- ✅ Registrar aulas com conteúdo ministrado
- ✅ Registrar frequência dos alunos
- ✅ Ver ficha completa dos alunos
- ✅ Exportar notas em PDF
- ✅ Ver alertas de alunos com média baixa
- ✅ Buscar alunos por nome

**O que o Professor NÃO pode fazer:**

- ❌ Cadastrar novos alunos ou professores
- ❌ Gerenciar turmas (criar/excluir)
- ❌ Processar solicitações de documentos
- ❌ Alterar dados de outros usuários

---

### 🏫 SECRETARIA / ADMIN

| Menu | Descrição |
|------|-----------|
| 📌 **Início** | Painel de Controle geral com estatísticas do sistema |
| 📋 **Painel Secretaria** | Cadastros, gerenciamento, solicitações |
| 🎓 **Gestão de Turmas** | Criar turmas, matricular alunos, status acadêmico |
| 📚 **Matriz Curricular** | Visualizar matriz dos cursos e disciplinas |
| 👥 **Usuários** | Lista completa de todos os usuários |
| 📄 **Documentos** | Gerenciar solicitações e gerar PDFs |
| ⚙️ **Meus Dados** | Editar perfil |
| 📚 **Treinamento** | Acessar material de treinamento |

**O que a Secretaria/Admin pode fazer:**

- ✅ Cadastrar alunos e professores
- ✅ Gerenciar turmas e matrículas
- ✅ Processar solicitações de documentos
- ✅ Gerar PDFs de documentos oficiais
- ✅ Vincular professores a disciplinas
- ✅ Editar dados de qualquer usuário
- ✅ Controlar status acadêmico e financeiro
- ✅ Gerenciar cursos e disciplinas
- ✅ Acesso total ao sistema

---

## 🎓 Matrícula de Alunos

### Na Secretaria (Painel Secretaria → Gerenciar Alunos)

1. Acesse **Painel da Secretaria** → **Gerenciar Alunos**
2. Encontre o aluno na lista ou use a busca
3. Clique no botão **🎓 Matricular** (destaque amarelo)
4. Selecione a turma desejada
5. Clique em **Confirmar Matrícula**

### Na Gestão de Turmas

1. Acesse **Gestão de Turmas** no menu lateral
2. Selecione uma turma na lista à esquerda
3. No painel direito, use a seção **"🎓 Matricular Aluno Existente"** (destaque amarelo)
4. Selecione o aluno no dropdown
5. Clique em **✓ Matricular na Turma**

### Status Acadêmico dos Alunos

| Status | Descrição | Quando Usar |
|--------|-----------|-------------|
| 🟢 **Ativo** | Aluno regular | Frequentando aulas normalmente |
| 🟡 **Trancado** | Matrícula trancada | Aluno trancou temporariamente |
| 🔴 **Evadido** | Abandonou o curso | Aluno não retorna mais às aulas |
| 🔵 **Concluído** | Formado com sucesso | Aluno completou todas as disciplinas |

**⚠️ Importante:** NUNCA exclua um aluno da turma! Sempre altere o status para preservar o histórico.

---

## 📊 Lançamento de Notas

### Para Professores

1. Acesse **Minhas Turmas** no menu lateral
2. Selecione a disciplina desejada
3. Preencha para cada aluno:
   - **Faltas:** Quantidade de ausências
   - **N1:** Primeira nota (0 a 10)
   - **N2:** Segunda nota (0 a 10)
   - **N3:** Terceira nota (0 a 10)
   - **Rec.:** Nota de recuperação (se necessário)

4. Clique em **Salvar Todas as Notas**

### Sistema de Cálculo Automático

**Média Teórica:**

```
Média = (N1 + N2 + N3) ÷ 3
```

**Média Final:**

```
Se há recuperação: Final = (Média + Recuperação) ÷ 2
Senão: Final = Média
```

### Status do Aluno

| Média Final | Status | Cor |
|-------------|--------|-----|
| ≥ 7.0 | ✅ Aprovado | 🟢 Verde |
| 5.0 - 6.9 | 🟡 Recuperação | 🟡 Amarelo |
| < 5.0 | 🔴 Reprovado | 🔴 Vermelho |

---

## 📅 Registro de Aulas

### Para Professores

1. Acesse **Registrar Aula** no menu lateral
2. Selecione a disciplina
3. Preencha:
   - **Data:** Data da aula (pré-preenchida com hoje)
   - **Conteúdo Ministrado:** Descreva o que foi ensinado
4. Clique em **Registrar**

**Exemplo:**

```
Data: 01/04/2026
Conteúdo: Introdução à Anatomia Humana - Sistema Esquelético
```

**Por que registrar aulas?**

- Mantém histórico organizado do conteúdo ministrado
- Facilita o acompanhamento do progresso da turma
- Ajuda em caso de substituição de professor
- Documenta o cumprimento do plano de ensino

---

## 📄 Solicitação de Documentos

### Para Alunos

1. Acesse **Documentos** no menu lateral
2. Clique em **+ Nova Solicitação**
3. Escolha o tipo de documento:
   - Declaração de Matrícula
   - Histórico Acadêmico
   - Atestado de Frequência
   - Outros
4. Clique em **Solicitar**

### Para Secretaria (Processar Solicitações)

1. Acesse **Painel Secretaria** → **Solicitações**
2. Encontre o pedido na lista
3. Clique em **Gerar PDF** para criar o documento
4. O PDF será baixado automaticamente
5. Imprima e entregue ao solicitante
6. Clique em **Concluir** para finalizar

### Tipos de Documentos

| Tipo | Quem Solicita | O que é Gerado |
|------|---------------|----------------|
| Declaração de Matrícula | Aluno | PDF com dados do curso e turma |
| Histórico Acadêmico | Aluno | PDF com todas as notas |
| Atestado de Frequência | Aluno | PDF com frequência |
| Declaração de Vínculo | Professor/Admin | PDF com função exercida |

---

## 🔒 Segurança e Proteção de Dados

### Proteções Implementadas

| Proteção | Descrição |
|----------|-----------|
| 🔐 **Autenticação Segura** | Login com e-mail e senha criptografados |
| ⏱️ **Session Timeout** | Sessão expira após 30 min de inatividade |
| 🚫 **Rate Limiting** | 5 tentativas de login → bloqueio de 15 min |
| 👤 **Controle por Perfil** | Cada usuário vê apenas o que tem permissão |
| 🔒 **Criptografia** | Dados transmitidos com HTTPS |
| 🛡️ **Row Level Security** | Políticas de segurança no banco de dados |

### LGPD - Lei Geral de Proteção de Dados

O sistema está em conformidade com a LGPD. Os dados dos alunos e professores são tratados com sigilo e utilizados apenas para fins acadêmicos.

---

## 📚 Material de Treinamento

### Como Acessar

O material de treinamento está disponível em **3 locais**:

1. **Tela de Login:** Botão "📚 Material de Treinamento"
2. **Home Page:** Opção "📚 Material de Treinamento"
3. **Painel de Controle (todos os perfis):** Link "📚 Treinamento" na barra lateral

### O que o Material Inclui

- ✅ Funcionalidades de cada perfil
- ✅ Permissões e restrições
- ✅ Passo a passo de cada operação
- ✅ Dicas importantes para cada perfil
- ✅ Sistema de cálculo de notas
- ✅ Fluxo de solicitação de documentos
- ✅ Segurança e proteção de dados

**URL Direta:**  
`/secretaria_escola_csm/apresentacao_treinamento.html`

---

## 🆘 Solução de Problemas

### Não consigo fazer login

**Possíveis causas:**

- E-mail ou senha incorretos
- Usuário não cadastrado
- Conta bloqueada por muitas tentativas

**Solução:**

1. Verifique se o e-mail está correto (sem espaços)
2. Verifique se a senha está correta (atenção a maiúsculas)
3. Se bloqueado, aguarde 15 minutos
4. Contate a secretaria para recuperar a senha

### Não aparecem notas no boletim

**Possíveis causas:**

- Professor ainda não lançou as notas
- Aluno não está matriculado em nenhuma turma

**Solução:**

1. Verifique com o professor se as notas foram lançadas
2. Confirme com a secretaria se está matriculado na turma

### Botão "Matricular" não aparece

**Solução:**

- O botão está na cor **amarela** com ícone 🎓
- Localizado na coluna "Ações" da tabela de alunos
- Se não aparecer, faça refresh da página (F5)

### Material de treinamento dá erro 404

**Solução:**

- Certifique-se de que o sistema está atualizado
- Acesse através dos botões: Login, Home ou Painel de Controle
- URL direta: `/secretaria_escola_csm/apresentacao_treinamento.html`

---

## 📞 Suporte Técnico

### Como Obter Ajuda

| Perfil | Responsabilidade |
|--------|------------------|
| **Aluno** | Contatar a secretaria da escola |
| **Professor** | Contatar a secretaria ou coordenação |
| **Secretaria** | Contatar suporte técnico administrativo |
| **Admin** | Contatar desenvolvedor do sistema |

### Horário de Atendimento

**Secretaria:** 08h às 18h - Campus Central  
**E-mail:** (contatar diretamente)

---

## 🎨 Identidade Visual do Sistema

O sistema utiliza as cores oficiais do **Colégio Santa Mônica**:

- 🔴 **Vermelho** (#C41E3A) - Cor primária
- 🟡 **Amarelo/Ouro** (#FFD700) - Cor de destaque
- ⚫ **Cinza Escuro** (#4A4A4A) - Texto principal
- ⚪ **Branco** (#FFFFFF) - Fundo

---

*Documento atualizado em Abril 2026*  
**Colégio Santa Mônica** - Limoeiro/PE
