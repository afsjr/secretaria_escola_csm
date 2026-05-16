   # Manual Completo do Sistema de Gestão Escolar (SGE)

## CSM - Colégio Santa Mônica

**Versão: 5.0 (Edição Modular)**
**Última Atualização: 16/05/2026**

---

## 📖 Índice

1. [Introdução ao Sistema](#1-introdução-ao-sistema)
2. [Acesso ao Sistema](#2-acesso-ao-sistema)
3. [Manual do Aluno](#3-manual-do-aluno)
4. [Manual do Professor](#4-manual-do-professor)
5. [Manual da Secretaria](#5-manual-da-secretaria)
6. [Manual do Administrador](#6-manual-do-administrador)
7. [Tabela de Perfis e Permissões](#7-tabela-de-perfis-e-permissões)
8. [Geração de Documentos PDF](#8-geração-de-documentos-pdf)
9. [Suporte a Múltiplos Cursos](#9-suporte-a-múltiplos-cursos)
10. [Glossário do Sistema](#10-glossário-do-sistema)
11. [Solução de Problemas](#11-solução-de-problemas)
12. [Suporte Técnico](#12-suporte-técnico)

---

## 1. Introdução ao Sistema

### O que é o SGE?

O Sistema de Gestão Escolar (SGE) é uma plataforma digital desenvolvida para o Colégio Santa Mônica (CSM) que permite gerenciar todas as atividades acadêmicas de forma organizada e segura.

### O que o Sistema Faz?

- ✅ **Gerencia matrículas** de alunos em turmas
- ✅ **Controla notas** e frequências dos alunos
- ✅ **Registra aulas** ministradas pelos professores
- ✅ **Gerencia solicitações** de documentos
- ✅ **Controla bloqueios** financeiros de alunos
- ✅ **Gera documentos PDF** para todos os perfis (alunos, professores, admins)
- ✅ **Suporta múltiplos cursos** (Enfermagem, Instrumentação Cirúrgica, etc.)

### Como o Sistema Funciona?

O SGE funciona na nuvem (internet), o que significa que você pode acessar de qualquer computador ou celular com internet. Seus dados ficam protegidos no servidor seguro do Supabase.

### Perfis de Acesso

O sistema possui **4 perfis de acesso diferentes**, cada um com permissões específicas:

| Perfil | Descrição | O que faz |
|--------|-----------|-----------|
| **Aluno** | Estudante | Visualiza notas, solicita documentos |
| **Professor** | Docente | Lança notas, registra aulas |
| **Secretaria** | Funcionário | Gerencia turmas, cadastra pessoas |
| **Admin** | Administrador | Acesso total ao sistema |

---

## 2. Acesso ao Sistema

### Como Acessar?

1. Abra o navegador (Chrome, Firefox, Edge)
2. Digite o endereço: **https://afsjr.github.io/secretaria_escola_csm/**
3. Clique em "Entrar" no menu lateral

### Tela de Login

Na tela de login, você deve informar:

1. **E-mail**: Seu endereço de e-mail cadastrado
2. **Senha**: Sua senha de acesso

> ⚠️ **Importante**: Se você esqueceu a senha, entre em contato com a secretaria para que ela possa cadastrar uma nova senha para você.

### Primeiro Acesso

No primeiro acesso, o sistema pedirá para você completar seu cadastro:

1. Preencha seus dados pessoais (nome, CPF, telefone)
2. Clique em "Salvar"
3. Pronto! Você já pode usar o sistema

---

## 3. Manual do Aluno

### O que o Aluno Pode Fazer?

| Função | Descrição |
|--------|-----------|
| ✅ Visualizar suas notas | Acompanhar o boletim escolar |
| ✅ Ver sua frequência | Quantas faltas tem em cada disciplina |
| ✅ Imprimir boletim em PDF | Gerar documento oficial do boletim |
| ✅ Solicitar documentos | Pedir declarações, atestados, etc. |
| ✅ Editar seus dados | Atualizar nome, CPF, telefone |
| ✅ Ver colegas | Visualizar lista de colegas de classe |

### 3.1 Visualizando o Boletim Escolar

O boletim mostra suas notas e frequências organizadas por módulo.

**Como visualizar:**

1. No menu lateral, clique em **"Boletim Escolar"**
2. O sistema mostrará todas as suas notas organizadas por módulo:
   - **I Módulo**: Primeiro semestre
   - **II Módulo**: Segundo semestre
   - **III Módulo**: Terceiro semestre

**O que você verá no boletim:**

| Campo | Descrição |
|-------|-----------|
| Disciplina | Nome da matéria |
| Faltas | Quantidade de faltas |
| N1 | Primeira nota |
| N2 | Segunda nota |
| N3 | Terceira nota |
| Média Teoria | Média das 3 notas (calculada automaticamente) |
| Rec. | Nota de recuperação |
| Média Final | Nota final (calculada automaticamente) |

**Interpretação das cores:**

- 🟢 **Verde**: Aprovado (nota ≥ 7.0)
- 🔴 **Vermelho**: Reprovado (nota < 7.0)

### 3.2 Imprimindo o Boletim em PDF

Você pode gerar um PDF oficial do seu boletim para imprimir ou guardar.

**Como imprimir:**

1. Acesse **"Boletim Escolar"** no menu lateral
2. Visualize suas notas
3. Clique no botão **"Imprimir Boletim"** (ícone de impressora)
4. O PDF será baixado automaticamente para seu computador

**O que o PDF contém:**

- Cabeçalho oficial do Colégio Santa Mônica - Limoeiro/PE
- Seus dados pessoais (nome, CPF)
- Curso e turma de matrícula
- Notas organizadas por módulo
- Cálculos automáticos (média teoria, média final)
- Situação de cada disciplina (Aprovado/Reprovado)

> 💡 **Dica**: Use o PDF para guardar uma cópia das suas notas ou para apresentar a pais/responsáveis.

### 3.3 Solicitando Documentos

Você pode solicitar documentos como declarações, atestados e históricos.

**Como solicitar:**

1. No menu lateral, clique em **"Documentos"**
2. Clique em **"+ Nova Solicitação"**
3. Escolha o tipo de documento:
   - Declaração de Matrícula
   - Histórico Acadêmico
   - Atestado de Frequência
   - Outros (descreva qual documento precisa)
4. Clique em **"Solicitar"**

**Acompanhando seu pedido:**

- **Pendente** (amarelo): A secretaria ainda não processou
- **Concluído** (verde): O documento está pronto para retirada

**O que acontece quando você solicita:**

1. O pedido é registrado no sistema
2. A secretaria vê o pedido no Painel da Secretaria
3. A secretaria gera o PDF do documento automaticamente
4. O documento é impresso e entregue a você
5. O status muda para "Concluído"

> 💡 **Dica**: A secretaria pode gerar o PDF do seu documento com apenas um clique. O documento já vem com o cabeçalho oficial do Colégio Santa Mônica - Limoeiro/PE.

### 3.4 Editando Seus Dados

É importante manter seus dados atualizados no sistema.

**Como editar:**

1. No menu lateral, clique em **"Meus Dados"**
2. Altere os campos desejados:
   - **Nome Completo**: Seu nome completo
   - **CPF**: Seu número de CPF
   - **Telefone/WhatsApp**: Seu número para contato
3. Clique em **"Salvar Alterações"**

> ⚠️ **Importante**: O e-mail não pode ser alterado, pois é usado para login. Para mudar o e-mail, entre em contato com a secretaria.

### 3.4 Visualizando Colegas

Você pode ver a lista de colegas cadastrados no sistema.

**Como visualizar:**

1. No menu lateral, clique em **"Colegas"**
2. A lista mostrará o nome de todos os colegas

> 🔒 **Privacidade**: Por questões de segurança, você verá apenas os nomes. E-mails e telefones não são exibidos para proteger a privacidade de todos.

### 3.5 Matriz Curricular

A matriz curricular mostra todas as disciplinas do curso.

**Como visualizar:**

1. No menu lateral, clique em **"Matriz Curricular"**
2. Você verá todas as disciplinas organizadas por módulo
3. Cada disciplina mostra:
   - Nome da matéria
   - Carga horária
   - Competências esperadas

---

## 4. Manual do Professor

### O que o Professor Pode Fazer?

| Função | Descrição |
|--------|-----------|
| ✅ Visualizar suas disciplinas | Ver quais matérias leciona |
| ✅ Lançar notas | Registrar notas dos alunos |
| ✅ Registrar aulas | Anotar o conteúdo de cada aula |
| ✅ Ver alunos da turma | Lista de alunos por disciplina |
| ✅ Solicitar documentos | Pedir declarações de vínculo para si |

### 4.1 Acessando o Painel do Professor

**Como acessar:**

1. Faça login com seu e-mail de professor
2. No menu lateral, clique em **"Painel do Professor"**
3. Você verá o painel com 3 abas:
   - **Minhas Disciplinas**: Lista de matérias que você leciona
   - **Lançar Notas**: Para registrar notas dos alunos
   - **Registro de Aulas**: Para anotar o conteúdo das aulas

### 4.2 Visualizando Minhas Disciplinas

Esta aba mostra todas as disciplinas que você leciona, organizadas por período.

**O que você verá:**

- **Período**: 2026.1, 2026.2, etc.
- **Disciplina**: Nome da matéria
- **Módulo**: I, II ou III Módulo
- **Turma**: Nome da turma vinculada
- **Alunos**: Quantidade de alunos na turma

**Botões disponíveis:**

- **Notas**: Leva para a aba de lançamento de notas
- **Aulas**: Leva para a aba de registro de aulas

### 4.3 Lançando Notas dos Alunos

Esta é a função principal do professor. Aqui você registra as notas e frequências dos alunos.

**Como lançar notas:**

1. Clique na aba **"Lançar Notas"**
2. No campo **"Selecione a Disciplina"**, escolha a matéria
3. O sistema mostrará todos os alunos da turma automaticamente
4. Para cada aluno, preencha:
   - **Faltas**: Quantidade de ausências (ex: 2)
   - **N1**: Primeira nota (ex: 8.5)
   - **N2**: Segunda nota (ex: 7.0)
   - **N3**: Terceira nota (ex: 9.0)
   - **Rec.**: Nota de recuperação (se necessário)

**Campos calculados automaticamente:**

- **Média Teoria**: (N1 + N2 + N3) / 3
- **Média Final**: (Média Teoria + Recuperação) / 2 (se houver recuperação)

**Salvando as notas:**

- **Botão "Salvar"** (em cada linha): Salva apenas a nota daquele aluno
- **Botão "Salvar Todas as Notas"**: Salva todas as notas de uma vez

> 💡 **Dica**: Use o botão "Salvar Todas as Notas" para economizar tempo quando terminar de preencher todas as notas da turma.

**Interpretação das cores:**

- 🟢 **Verde**: Média ≥ 7.0 (Aprovado)
- 🔴 **Vermelho**: Média < 7.0 (Reprovado ou em recuperação)

### 4.4 Registrando Aulas

O registro de aulas serve para documentar o conteúdo ministrado em cada aula.

**Como registrar uma aula:**

1. Clique na aba **"Registro de Aulas"**
2. No campo **"Selecione a Disciplina"**, escolha a matéria
3. Preencha o formulário:
   - **Data**: Data da aula (já vem preenchida com a data de hoje)
   - **Conteúdo Ministrado**: Descreva o que foi ensinado
4. Clique em **"Registrar"**

**Visualizando o histórico:**

Abaixo do formulário, você verá todas as aulas já registradas para essa disciplina:
- Data da aula
- Conteúdo ministrado
- Botão "Remover" (para excluir registros incorretos)

**Exemplo de registro:**

```
Data: 01/04/2026
Conteúdo: Introdução à Anatomia Humana - Sistema Esquelético
```

### 4.5 Dicas para Professores

1. **Registre as notas o mais rápido possível** após as provas
2. **Anote o conteúdo de cada aula** para manter um histórico organizado
3. **Verifique as faltas** antes de salvar, pois afetam a aprovação dos alunos
4. **Use a recuperação** apenas para alunos com média abaixo de 7.0

---

## 5. Manual da Secretaria

### O que a Secretaria Pode Fazer?

| Função | Descrição |
|--------|-----------|
| ✅ Cadastrar alunos | Criar contas para novos estudantes |
| ✅ Cadastrar professores | Criar contas para novos docentes |
| ✅ Gerenciar turmas | Criar e organizar turmas |
| ✅ Matricular alunos | Vincular alunos a turmas |
| ✅ Gerenciar professores | Vincular professores a disciplinas e turmas |
| ✅ Processar documentos | Atender solicitações de documentos |
| ✅ Gerenciar alunos | Editar dados dos alunos |
| ✅ Controlar notas | Lançar notas para qualquer aluno |

### 5.1 Acessando o Painel da Secretaria

**Como acessar:**

1. Faça login com e-mail de secretaria/admin
2. No menu lateral, clique em **"Painel da Secretaria"**
3. O painel agora é **totalmente modular**, dividido em abas de fácil acesso:
   - **Visão Geral**: Dashboard com estatísticas em tempo real (Alunos, Professores, Turmas e Solicitações).
   - **Solicitações**: Pedidos de documentos (Declarações, Históricos).
   - **Notas/Estágio**: Lançamento de notas com validação automática de elegibilidade para estágio.
   - **Cadastrar Aluno**: Criar novas contas de alunos.
   - **Gerenciar Alunos**: Busca avançada e **Visão 360°** do status do aluno.
   - **Cadastrar Professor**: Criar novas contas de professores.
   - **Gerenciar Professores**: Vinculação rápida de disciplinas e turmas.
   - **Gerenciar Cursos**: Administração dos ciclos de vida dos cursos técnicos.

### 5.2 Dashboard de Visão Geral (Monitoramento em Tempo Real)

A nova aba "Visão Geral" permite que a secretaria tenha um panorama imediato da escola:
- **KPIs**: Total de alunos ativos, professores vinculados, turmas em andamento e solicitações pendentes.
- **Status dos Cursos**: Lista resumida da situação de cada curso técnico.
- **Ações Rápidas**: Atalhos para as operações mais comuns (Cadastro, Lançamento de Notas).

### 5.3 Processando Solicitações de Documentos

A aba **"Solicitações"** agora utiliza o `RequestTableComponent`, garantindo que os pedidos sejam processados em ordem e com download instantâneo do PDF oficial.

### 5.4 Visão 360° do Aluno (Gerenciar Alunos)

Ao acessar "Gerenciar Alunos", você verá badges visuais coloridos para cada estudante:
- 🟢 **Financeiro**: Indica se o aluno está regular ou bloqueado.
- 🔵 **Estágio**: Informa o status da vida acadêmica prática do aluno.
- 🟡 **Documentos**: Alerta sobre pendências na documentação física.

**Ações Rápidas por Ícone:**
- 👁️ **Ver Ficha**: Abre o perfil completo detalhado.
- ✏️ **Editar**: Atualiza dados cadastrais e endereço.
- 🎓 **Matricular**: Vincula o aluno a uma nova turma instantaneamente.

### 5.5 Gestão de Notas e Elegibilidade para Estágio

Na aba **"Notas/Estágio"**, o sistema implementa regras de negócio automáticas:
- **Bloqueio de Estágio**: Disciplinas do 1º módulo ou Teóricas do 2º módulo são marcadas com ⚠️ **Sem Estágio**.
- **Lançamento Seguro**: O sistema impede o lançamento de notas de estágio para disciplinas não elegíveis, evitando erros de registro no histórico.

> 💡 **Dica**: Você pode vincular um professor a várias disciplinas de uma vez.

**Exemplo de vinculação:**

| Selecionar | Disciplina | Módulo | Turma | Professor Atual |
|------------|------------|--------|-------|-----------------|
| [x] | Anatomia e Fisiologia | I Módulo | Turma 2026.1 | — |
| [x] | Ética Profissional | I Módulo | Turma 2026.1 | — |
| [ ] | Farmacologia | II Módulo | Turma 2026.2 | — |

### 5.7 Gestão de Turmas

Esta é a área mais importante para a organização da escola.

**Criando uma nova turma:**

1. No menu lateral, clique em **"Gestão de Turmas"**
2. Preencha o campo **"Nome da Turma"** (ex: Técnico Enfermagem Manhã - 10A)
3. Preencha o campo **"Período Letivo"** (ex: 2026.1)
4. Clique em **"Registrar Turma"**

**Matriculando alunos em uma turma:**

1. Clique na turma desejada na lista à esquerda
2. No campo **"Matricular Aluno Existente"**, selecione o aluno
3. Clique em **"Adicionar à Turma"**

**Gerenciando status dos alunos:**

Para cada aluno na turma, você pode alterar:

| Status | Quando usar |
|--------|-------------|
| **Ativo** | Aluno regular, frequentando aulas |
| **Trancado** | Aluno trancou a matrícula temporariamente |
| **Evadido** | Aluno abandonou o curso |
| **Concluído** | Aluno formado com sucesso |

**Bloqueio financeiro:**

- Marque a caixa **"Bloqueio Financeiro"** para alunos inadimplentes
- Isso impede a emissão de documentos e participação em estágios

> ⚠️ **Importante**: NUNCA exclua um aluno da turma! Sempre altere o status para "Trancado" ou "Evadido" para preservar o histórico.

### 5.8 Controle Acadêmico

A secretaria tem acesso total ao boletim de qualquer aluno.

**Como lançar notas:**

1. No menu lateral, clique em **"Controle Acadêmico"**
2. Selecione o aluno no campo dropdown
3. Clique em **"Carregar Diário"**
4. Preencha as notas e frequências
5. Clique em **"Salvar Registros"**

> 💡 **Dica**: Use esta função para corrigir notas lançadas incorretamente pelos professores.

---

## 6. Manual do Administrador

### O que o Administrador Pode Fazer?

O administrador tem acesso a **todas as funcionalidades** da secretaria, mais as funções exclusivas de administração do sistema.

| Função | Descrição |
|--------|-----------|
| ✅ Tudo da Secretaria | Todas as funções listadas no capítulo 5 |
| ✅ Gerenciar usuários | Criar, editar e excluir contas |
| ✅ Configurar sistema | Ajustar configurações gerais |
| ✅ Visualizar logs | Acompanhar atividades do sistema |

---

## 7. Tabela de Perfis e Permissões

### Resumo de Permissões por Perfil

| Funcionalidade | Aluno | Professor | Secretaria | Admin |
|----------------|-------|-----------|------------|-------|
| **Visualizar boletim** | Apenas o seu | Seus alunos | Todos | Todos |
| **Lançar notas** | ❌ | ✅ | ✅ | ✅ |
| **Registrar aulas** | ❌ | ✅ | ❌ | ❌ |
| **Solicitar documentos** | ✅ | ✅ | ❌ | ❌ |
| **Processar documentos** | ❌ | ❌ | ✅ | ✅ |
| **Gerar PDF de documentos** | ❌ | ❌ | ✅ | ✅ |
| **Cadastrar alunos** | ❌ | ❌ | ✅ | ✅ |
| **Cadastrar professores** | ❌ | ❌ | ✅ | ✅ |
| **Gerenciar turmas** | ❌ | ❌ | ✅ | ✅ |
| **Gerenciar cursos** | ❌ | ❌ | ✅ | ✅ |
| **Vincular disciplinas** | ❌ | ❌ | ✅ | ✅ |
| **Editar dados próprios** | ✅ | ✅ | ✅ | ✅ |
| **Editar dados de outros** | ❌ | ❌ | ✅ | ✅ |

### Menu por Perfil

| Menu | Aluno | Professor | Secretaria | Admin |
|------|-------|-----------|------------|-------|
| Início | ✅ | ✅ | ✅ | ✅ |
| Documentos | ✅ | ✅ | ❌ | ❌ |
| Colegas | ✅ | ✅ | ✅ | ✅ |
| Matriz Curricular | ✅ | ✅ | ✅ | ✅ |
| Boletim Escolar | ✅ | ❌ | ❌ | ❌ |
| Meus Dados | ✅ | ✅ | ✅ | ✅ |
| Painel do Professor | ❌ | ✅ | ❌ | ❌ |
| Notas e Aulas | ❌ | ✅ | ❌ | ❌ |
| Controle Acadêmico | ❌ | ❌ | ✅ | ✅ |
| Painel da Secretaria | ❌ | ❌ | ✅ | ✅ |
| Gestão de Turmas | ❌ | ❌ | ✅ | ✅ |
| Gerenciar Cursos | ❌ | ❌ | ✅ | ✅ |

---

## 8. Geração de Documentos PDF

### O que são os Documentos PDF?

O sistema gera automaticamente documentos PDF profissionais com o cabeçalho oficial do Colégio Santa Mônica - Limoeiro/PE.

### 8.1 Tipos de Documentos por Perfil

#### Para Alunos
| Tipo de Documento | Descrição |
|-------------------|-----------|
| **Declaração de Matrícula** | Comprova que o aluno está matriculado no curso |
| **Histórico Acadêmico** | Lista todas as notas e situação acadêmica |
| **Boletim Escolar** | Notas por módulo com cálculos automáticos |

#### Para Professores, Admins e Secretaria
| Tipo de Documento | Descrição |
|-------------------|-----------|
| **Declaração de Vínculo** | Comprova o vínculo empregatício com a escola |
| **Atestado de Trabalho** | Comprova a função exercida na instituição |

### 8.2 Como Gerar PDF na Secretaria

**Para a secretaria processar solicitações de documentos:**

1. Acesse o **Painel da Secretaria** → **Solicitações**
2. Encontre o pedido na lista
3. Clique no botão **"Gerar PDF"**
4. O documento será baixado automaticamente
5. Imprima e entregue ao solicitante
6. Clique em **"Concluir"** para finalizar

**O sistema gera automaticamente o documento correto:**
- Se o solicitante é **aluno** → Gera documento acadêmico
- Se o solicitante é **funcionário** → Gera declaração de vínculo

### 8.3 Como o Aluno Gera seu Boletim

1. Acesse **Boletim Escolar** no menu lateral
2. Visualize suas notas
3. Clique no botão **"Imprimir Boletim"**
4. O PDF será baixado automaticamente

### 8.4 Dicas para Documentos PDF

1. **Verifique os dados** antes de gerar o PDF
2. **Imprima em papel timbrado** para documentos oficiais
3. **Carimbe e assine** os documentos antes de entregar
4. **Guarde uma cópia** digital dos documentos gerados

---

## 9. Suporte a Múltiplos Cursos

### O que é o Suporte a Múltiplos Cursos?

O sistema suporta diferentes cursos além do Técnico em Enfermagem, como Instrumentação Cirúrgica e outros cursos livres.

### 9.1 Cadastrando um Novo Curso

**Quem pode usar:** Secretaria, Admin

**Como cadastrar:**

1. Acesse o **"Painel da Secretaria"** → **"Gerenciar Cursos"**
2. Preencha o formulário:
   - **Nome do Curso**: Ex: "Técnico em Enfermagem"
   - **Descrição**: Breve descrição do curso
3. Clique em **"Cadastrar Curso"**

### 9.2 Criando Turmas por Curso

1. Acesse **"Gestão de Turmas"**
2. Selecione o **curso** no campo dropdown
3. Preencha o nome da turma e período
4. Clique em **"Registrar Turma"**

### 9.3 Visualizando Matriz por Curso

A **"Matriz Curricular"** mostra as disciplinas organizadas por curso:

1. Acesse **"Matriz Curricular"** no menu lateral
2. Você verá seções para cada curso cadastrado
3. Cada seção mostra os módulos e disciplinas do curso

---

## 10. Glossário do Sistema

### Termos Utilizados no Sistema

| Termo | Significado |
|-------|-------------|
| **SGE** | Sistema de Gestão Escolar |
| **CSM** | Colégio Santa Mônica |
| **Perfil** | Tipo de acesso do usuário (aluno, professor, secretaria, admin) |
| **Turma** | Grupo de alunos que frequentam as mesmas aulas |
| **Matrícula** | Vínculo de um aluno a uma turma |
| **Boletim** | Documento com notas e frequências do aluno |
| **Disciplina** | Matéria do curso (ex: Anatomia, Farmacologia) |
| **Módulo** | Divisão do curso (I, II, III Módulo) |
| **Período** | Semestre letivo (ex: 2026.1, 2026.2) |
| **Faltas** | Quantidade de ausências do aluno |
| **Média Teoria** | Média das 3 notas (N1, N2, N3) |
| **Recuperação** | Nota para alunos com média abaixo de 7.0 |
| **Média Final** | Nota final considerando recuperação |
| **Bloqueio Financeiro** | Impedimento por inadimplência |
| **PDF** | Portable Document Format - formato de documento digital |
| **Declaração de Vínculo** | Documento que comprova o vínculo empregatício com a escola |
| **Declaração de Matrícula** | Documento que comprova a matrícula do aluno no curso |
| **Histórico Acadêmico** | Documento com todas as notas e situação acadêmica do aluno |
| **LGPD** | Lei Geral de Proteção de Dados |

---

## 9. Solução de Problemas

### Problemas Comuns e Soluções

#### 9.1 Não consigo fazer login

**Possíveis causas:**
- E-mail incorreto
- Senha incorreta
- Usuário não cadastrado

**Solução:**
1. Verifique se o e-mail está correto (sem espaços)
2. Verifique se a senha está correta (atenção a letras maiúsculas)
3. Se persistir, entre em contato com a secretaria

#### 9.2 Não aparecem notas no boletim

**Possíveis causas:**
- Professor ainda não lançou as notas
- Aluno não está matriculado em nenhuma turma

**Solução:**
1. Verifique com o professor se as notas foram lançadas
2. Confirme com a secretaria se você está matriculado na turma correta

#### 9.3 Não consigo solicitar documentos

**Possíveis causas:**
- Bloqueio financeiro ativo
- Sistema temporariamente indisponível

**Solução:**
1. Verifique se há pendências financeiras na secretaria
2. Tente novamente em alguns minutos

#### 9.4 Professor não vê suas disciplinas

**Possíveis causas:**
- Professor não vinculado às disciplinas
- Disciplinas não vinculadas a turmas

**Solução:**
1. A secretaria deve vincular o professor às disciplinas
2. As disciplinas devem estar vinculadas a turmas

#### 9.5 Erro ao registrar aula

**Possíveis causas:**
- Problema no banco de dados
- Campos obrigatórios não preenchidos

**Solução:**
1. Preencha todos os campos obrigatórios
2. Se o erro persistir, contate o suporte técnico

#### 9.6 Erro ao salvar notas

**Possíveis causas:**
- Notas com valores inválidos (maiores que 10)
- Problema de conexão com a internet

**Solução:**
1. Verifique se as notas estão entre 0 e 10
2. Verifique sua conexão com a internet
3. Tente salvar novamente

#### 9.7 Erro ao gerar PDF de documento

**Possíveis causas:**
- Aluno não possui matrícula ativa
- Professor/Admin não possui dados cadastrados corretamente
- Problema de conexão com a internet

**Solução:**
1. Para alunos: Verifique se o aluno está matriculado em uma turma
2. Para funcionários: Verifique se o perfil está cadastrado corretamente
3. Verifique sua conexão com a internet
4. Tente novamente em alguns minutos

#### 9.8 PDF não é baixado automaticamente

**Possíveis causas:**
- Bloqueador de pop-ups do navegador
- Configurações de download do navegador

**Solução:**
1. Verifique se o navegador está bloqueando pop-ups
2. Verifique a pasta de downloads do seu computador
3. Tente usar outro navegador (Chrome, Firefox, Edge)

---

## 10. Suporte Técnico

### Como Obter Ajuda

Em caso de dúvidas ou problemas não descritos neste manual:

1. **Primeiro**: Consulte este manual
2. **Segundo**: Pergunte a um colega que já usa o sistema
3. **Terceiro**: Entre em contato com a secretaria do CSM

### Contatos

| Tipo de Ajuda | Contato |
|---------------|---------|
| Dúvidas sobre cadastros | Secretaria do CSM |
| Dúvidas sobre notas | Professor da disciplina |
| Problemas técnicos | Suporte Técnico |
| Solicitação de documentos | Secretaria do CSM |

---

## 📋 Registro de Versões

| Versão | Data | Alterações |
|--------|------|-------------|
| 1.0 | - | Versão inicial |
| 2.0 | 01/04/2026 | Revisão geral - adicionado item LGPD, atualizado status acadêmico |
| 2.1 | 01/04/2026 | Atualização após análise de código |
| 2.2 | 01/04/2026 | Adicionado cadastro de alunos via Admin |
| 2.3 | 01/04/2026 | Correções de login/auth, timeout de sessão |
| 3.0 | 01/04/2026 | Manual completo reescrito com todos os perfis |
| **4.0** | **02/04/2026** | **Adicionado: Geração de PDF para todos os perfis, Suporte a Múltiplos Cursos** |

---

## 📝 Observações Importantes

### Segurança dos Dados

- Todos os dados são criptografados no servidor
- Cada usuário acessa apenas seus próprios dados
- A secretaria tem acesso total para gestão
- Professores acessam apenas suas disciplinas

### Boas Práticas

1. **Mantenha seus dados atualizados** no sistema
2. **Não compartilhe sua senha** com outras pessoas
3. **Faça logout** ao usar computadores compartilhados
4. **Registre suas aulas** regularmente (professores)
5. **Lance notas** o mais rápido possível (professores)

### Responsabilidades

| Perfil | Responsabilidade |
|--------|------------------|
| **Aluno** | Manter dados atualizados, acompanhar notas, solicitar documentos quando necessário |
| **Professor** | Lançar notas, registrar aulas, acompanhar alunos, solicitar declarações de vínculo |
| **Secretaria** | Gerenciar cadastros, processar documentos, gerar PDFs, organizar turmas e cursos |
| **Admin** | Supervisionar sistema, dar suporte aos usuários, gerenciar cursos |

---

**Documento aprovado pela Diretoria do CSM**
**Limoeiro/PE, 02 de abril de 2026**

*Manual de Treinamento - Sistema de Gestão Escolar*
*Versão 4.0*
