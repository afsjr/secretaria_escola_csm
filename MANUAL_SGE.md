# Manual de Operação e Treinamento do SGE

**Sistema de Gestão Escolar (CSM)**

Versão: 2.2 (Atualizado em: 01/04/2026)

---

Bem-vindo ao Manual Oficial de Operação do Sistema de Gestão Escolar (SGE) da CSM. Este documento foi elaborado para guiar Alunos, Professores, Secretaria e Administração no uso correto e eficiente de todas as ferramentas da nossa plataforma unificada.

O SGE foi concebido para eliminar o volume de papel, proteger os dados com criptografia na nuvem (Supabase) e desenhar um Espelho Acadêmico em tempo real para todos os envolvidos. Por favor, leia com atenção a sessão pertencente ao seu cargo.

---

## 📋 Registro de Versões

| Versão | Data | Alterações |
|--------|------|-------------|
| 1.0 | - | Versão inicial |
| 2.0 | 01/04/2026 | Revisão geral - adicionado item LGPD, atualizado status acadêmico, ajustado manual do professor |
| 2.1 | 01/04/2026 | Atualização após análise de código - ajustado funcionalidades implementadas vs manual original |
| 2.2 | 01/04/2026 | Adicionado cadastro de alunos via Admin, opção "Outros" em documentos, atualização de CPF/telefone no perfil |

---

## 👩‍🎓 1. Manual do Aluno

O seu portal de acompanhamento acadêmico pessoal.

Como aluno, sua visão no SGE é simplificada e protegida. Você não pode visualizar notas, avisos financeiros ou pendências de outros alunos.

### 1.1 Página "Meus Dados" (Perfil)

Onde você atualiza suas informações pessoais. Os campos disponíveis são:

- **Nome Completo**: Editável. Importante para certificados.
- **CPF**: Editável. Necessário para documentos oficiais.
- **Telefone / WhatsApp**: Editável. Para comunicação da escola.
- **E-mail**: Campo somente leitura (vinculado ao login).
- **Perfil de Acesso**: Exibido automaticamente (aluno/admin).
- **Avatar**: Exibido com inicial do nome (funcionalidade de foto em desenvolvimento).

> ⚠️ **Importante**: Todos os certificados dependem da veracidade dos dados. Mantenha seus dados atualizados.

### 1.2 Aba "Colegas"

Um diretório seguro mostrando os nomes e iniciais (avatar) de todos os usuários do sistema.

- **LGPD Compliance**: E-mails e telefones de outras pessoas NÃO são exibidos para proteger a privacidade.
- Você visualiza: Nome completo e perfil (aluno/admin).

### 1.3 Solicitação de Documentos

Precisa de um Atestado de Matrícula, Histórico Escolar ou passe livre da prefeitura?

1. Clique em "+ Nova Solicitação"
2. Escolha o tipo de documento:
   - Declaração de Matrícula
   - Histórico Acadêmico
   - Atestado de Frequência
   - **Outros** (permite especificar outro tipo de documento)
3. Se selecionar "Outros", descreva o documento desejado no campo de texto
4. Clique em "Solicitar"

**Fluxo do Pedido**:
- O pedido vai direto em tempo real para o balcão virtual da secretaria.
- Status inicial: **Pendente** (amarelo)
- Quando a secretary imprimir e entregar: Status muda para **Concluído** (verde)

### 1.4 Boletim Escolar

Um espelho online 24h.

- Tela de **apenas leitura** para o aluno
- Organizado por **Módulo** (I, II, III)
- Cada módulo contém as disciplinas соответственные
- Você acompanha:
  - Presenças (faltas)
  - 3 notas por disciplina (baterias de ciclo contínuo)
  - Média Teoria (média das 3 notas)
  - Nota de Recuperação
  - Média Final (média entre teoria e recuperação)

> 📊 O sistema calcula automaticamente as médias. Se a média final ficar abaixo de 7.0, aparecerá em vermelho.

### 1.5 Matriz Curricular

Um quadro orientativo contendo:
- Todas as disciplinas do curso
- Descrições e competências esperadas
- Carga horária teórica e de estágio
- Trilha formativa do Técnico em Enfermagem

Ideal para se planejar ao longo do curso.

---

## 👨‍🏫 2. Manual dos Professores

O Portal de Lançamento de Presenças e Desempenho.

> **Nota Importante**: No momento, o SGE não possui um perfil separado de "Professor". O lançamento de notas é feito através do perfil **Admin** (Secretaria/Gestão). Os professores devem solicitar à секретария o lançamento de notas no sistema.

### 2.1 Acesso ao Controle Acadêmico

Acesse: Menu lateral > "Controle Acadêmico" (ou "Boletim Escolar" para professores)

### 2.2 Funcionalidades

- **Seleção de Aluno**: Escolha o aluno no menu suspenso para carregar seu boletim.
- **Lançamento de Notas**: Preencha as médias das avaliações formativas e somativas.
- **Cálculo Automático**: O formulário faz a matemática automaticamente na hora.

### 2.3 Estrutura do Boletim

Cada lacuna ("1ª Nota", "2ª Nota", "3ª Nota") serve como uma bateria de ciclo contínuo de desempenho.

- O professor digita (Ex: 8.5)
- O sistema calcula a **Média Teoria** automaticamente
- Se a média da Teoria ficar vermelha (< 7.0), o sistema permitirá lançamento na aba **Recuperação** para corrigir a **Média Final**

### 2.4 Presenças (Faltas)

O campo "Faltas" permite registro do número de ausências por disciplina.

---

## 💻 3. Manual da Secretaria e Gestão Central

Administrando o coração financeiro e acadêmico da instituição com precisão.

O SGE dá ferramentas de bloqueio sumário e permissões fortes ao perfil de **"Admin/Secretaria"**. O seu manuseio deve ser cauteloso pois dita a base de dados de todos.

### 3.0 Cadastrar Novo Aluno

O painel da secretaria permite cadastrar novos alunos diretamente no sistema, sem necessidade do aluno fazer seu próprio cadastro.

1. Acesse **Painel da Secretaria**
2. Clique na aba **"Cadastrar Aluno"**
3. Preencha os campos:
   - **Nome Completo** (obrigatório)
   - **E-mail** (obrigatório) - será usado para login
   - **CPF** (opcional)
   - **Telefone/WhatsApp** (opcional)
   - **Senha** (obrigatório, mínimo 6 caracteres)
   - **Turma** (opcional) - selecione para matricular automaticamente
4. Clique em **"Cadastrar Aluno"**

O sistema cria automaticamente:
- Conta no Supabase Auth (usuário pode fazer login imediatamente)
- Registro na tabela de perfis com perfil "aluno"
- Matrícula na turma selecionada (se informada)

> ⚠️ **Importante**: O admin deve guardar a senha criada e comunicar ao aluno. O aluno pode alterar sua senha depois.

### 3.1 Painel da Secretaria (Solicitações de Documentos)

Aqui mora a **"Fila de Atendimento Digital"**.

1. Todos os pedidos (ofícios, declarações) dos estudantes aparecem nesta tela.
2. Imprima o documento, recolha as assinaturas físicas.
3. Clique no botão azul **"Concluir"** quando entregar o papel na mão do aluno.
4. O status mudará para concluído, limpando a fila.

**Tabela de Solicitações**:
| Campo | Descrição |
|-------|------------|
| Aluno | Nome e e-mail do solicitante |
| Documento | Tipo solicitado |
| Status | Pendente (amarelo) / Concluído (verde) |
| Ações | Botão "Concluir" para finalizar |

### 3.2 Gestão de Turmas e Matrículas (O Motor Genuíno)

Esta é a base estrutural de toda a escola. É aqui que você amarra a logística.

#### 3.2.1 Abrir Turmas Novas

1. Preencha "Nome da Turma" (Ex: Técnico Enfermagem Manhã - 10A)
2. Preencha o "Período Letivo" (Ex: 2026.1)
3. Clique em "Registrar Turma"
4. A turma aparecerá na lista lateral com status "aberta" ou "fechada"

#### 3.2.2 Moldar a Caderneta Oficial

1. Selecione a turma criada no lado esquerdo
2. No menu suspenso "Matricular Aluno Existente", escolha um aluno
3. Clique em "Adicionar à Turma"
4. O aluno aparecerá na tabela da direita

#### 3.2.3 A Regra Sagrada do "Status Acadêmico"

> ⚠️ **IMPORTANTE**: Quando um aluno tranca a faculdade, abandona, é transferido ou repete o ano...

**NÃO** clique no botão vermelho "X Excluir"!

- O botão **X Excluir** deve ser usado **apenas** quando você enturmar a pessoa errada sem querer e precisar desfazer o erro na hora.
- Se excluir, o histórico acadêmico inteiro dele **evaporará** (perderá todas as notas).

**O correto** para alunos que desistem é:
1. Alterar o menu "Status" de **Ativo** para **Trancado** ou **Evadido** ou **Concluído**
2. Clicar em **"Salvar"**

Essa ação o retira da frente do professor no dia a dia, mas o mantém registrado e gravado no histórico financeiro da escola.

#### 3.2.4 A Caixa Oculta de Inadimplência (Bloqueio Financeiro)

Na linha do aluno existe uma caixa de seleção que mostra:

- **Ok** (verde): Aluno regular
- **INADIMPLENTE** (vermelho): Aluno com pendências financeiras

Ao marcar a caixa, a secretaria alerta o sistema que o fulano está devendo. Essa alavanca:

- Bloqueia a emissão de atestados
- Proíbe o aluno de ingressar nos Estágios Práticos Externos
- Permanece até o aluno ir à Tesouraria e quitar o acordo

### 3.3 Controle Acadêmico (Manipulador Máximo)

Além do professor, você tem acesso irrestrito ao "Boletim" no modo **edição**.

A Secretaria pode:
- Auditar notas de qualquer aluno
- Adulterar notas por ordem judicial ou trâmites acadêmicos
- Recalcular as médias quando o professor errar e perder o prazo

---

## 🔧 4. Configuração Técnica

### 4.1 Variáveis de Ambiente

Para configurar o sistema do zero, crie um arquivo `.env` na raiz do projeto com:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
VITE_SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role  # Opcional - apenas para Admin
```

### 4.2 Variáveis para Deploy (GitHub Pages)

Ao fazer deploy no GitHub Pages, adicione as seguintes secrets em **Settings → Secrets and variables → Actions**:

| Nome da Secret | Descrição |
|----------------|-----------|
| `VITE_SUPABASE_URL` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave pública (Anon Key) |
| `VITE_SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (para功能 de cadastro admin) |

### 4.2 Estrutura do Banco de Dados (Supabase)

O sistema utiliza as seguintes tabelas:

| Tabela | Descrição |
|--------|------------|
| `perfis` | Usuários (nome, email, perfil, CPF, telefone) |
| `turmas` | Turmas (nome, período, status_ingresso) |
| `matriculas` | Vínculo aluno-turma (status_aluno) |
| `boletim` | Notas e presenças por aluno/disciplina |
| `solicitacoes` | Pedidos de documentos |

### 4.3 Perfis de Acesso

| Perfil | Descrição |
|--------|------------|
| `admin` | Acesso total (Secretaria, Gestão) |
| `aluno` | Acesso restrito (somente seus dados) |

---

## 🆘 5. Solução de Problemas

### 5.1 "Erro de acesso" no login
- Verifique se o e-mail e senha estão corretos
- Confirme que o usuário está cadastrado no sistema

### 5.2 "Erro ao carregar turmas"
- Verifique a conexão com a internet
- Confirme que a tabela `turmas` existe no Supabase

### 5.3 Não consigo matricular aluno
- Verifique se o aluno já está ativo em outra turma (regra de negócio)
- O sistema impede dupla-matrícula ativa

### 5.4 Notas não aparecem no boletim
- Confirme que o aluno está matriculado em uma turma
- Verifique se há registros na tabela `boletim`

---

## 📞 Suporte

Em caso de dúvidas ou problemas não descritos neste manual, entre em contato com o administrador do sistema ou abra uma issue no repositório do projeto.

---

**Documento aprovado e redigido para CSM Gestão Escolar**

*Última atualização: 01/04/2026 - Versão 2.2*