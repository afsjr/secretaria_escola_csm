# 📚 Sistema de Gestão Escolar - Secretaria CSM

## 🎯 Visão Geral

Sistema completo para gestão escolar técnica, desenvolvido para o Centro de Saúde Monteiro (CSM).

### 🚀 Acesso
- **Local:** http://localhost:5173/secretaria_escola_csm/
- **Produção:** (URL de produção após deploy)

---

## 👥 Perfis de Usuário

### 📋 Menu por Perfil

#### 👨‍🎓 ALUNO
| Menu | Descrição |
|------|-----------|
| 📌 Início | Dashboard com estatísticas e avisos |
| 📄 Documentos | Solicitar e acompanhar documentos |
| 👥 Usuários | Ver todos os membros do sistema |
| 📚 Matriz Curricular | Grade curricular do curso |
| ⚙️ Meus Dados | Editar perfil completo (dados, endereço, contato) |

#### 👨‍🏫 PROFESSOR
| Menu | Descrição |
|------|-----------|
| 📌 Início | Dashboard com estatísticas |
| 📄 Documentos | Solicitar documentos |
| 👥 Usuários | Ver todos os membros |
| 📚 Matriz Curricular | Grade curricular |
| 📚 Minhas Turmas | Lançar notas em lote, registrar aulas, frequência |
| 👤 Meus Alunos | Busca + ficha completa individual |
| 📅 Registrar Aula | Formulário centralizado para registrar aulas |
| ⚙️ Meus Dados | Editar perfil completo |

#### 🏫 ADMIN/SECRETARIA
| Menu | Descrição |
|------|-----------|
| 📌 Início | Dashboard geral |
| 📄 Documentos | Gerenciar solicitações de documentos |
| 👥 Usuários | Lista completa de usuários |
| 📚 Matriz Curricular | Visualizar matriz dos cursos |
| 📋 Painel Secretaria | Cadastros, gerenciamento, solicitações |
| 🎓 Gestão de Turmas | Criar turmas, matricular alunos, status |
| ⚙️ Meus Dados | Editar perfil |

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

#### `perfis`
Dados pessoais e de acesso de todos os usuários.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK (mesmo ID do auth.users) |
| `nome_completo` | text | Nome completo |
| `email` | text | E-mail de acesso |
| `cpf` | text | CPF do usuário |
| `telefone` | text | Telefone principal |
| `perfil` | perfil_acesso | admin, professor, aluno, secretaria |
| `bloqueio_financeiro` | boolean | Bloqueio de serviços acadêmicos |
| `genero` | text | masculino, feminino, outro, prefiro_nao_informar |
| `data_nascimento` | date | Data de nascimento |
| `estado_civil` | text | solteiro, casado, divorciado, viuvo, uniao_estavel |
| `cidade_natal` | text | Cidade onde nasceu |
| `nacionalidade` | text | Nacionalidade |
| `estrangeiro` | boolean | Se é estrangeiro |
| `profissao` | text | Profissão/ formação |
| `empresa_trabalho` | text | Empresa/local de trabalho |
| `classificacao` | text | Classificação acadêmica |
| `permite_biblioteca` | boolean | Permite empréstimo na biblioteca |
| `cadastro_desativado` | boolean | Se o cadastro está desativado |
| `rg` | text | Número do RG |
| `orgao_expedidor` | text | Órgão expedidor do RG |
| `data_expedicao_rg` | date | Data de expedição do RG |
| `titulo_eleitor` | text | Título de eleitor |
| `zona_eleitoral` | text | Zona eleitoral |
| `secao_eleitoral` | text | Seção eleitoral |
| `passaporte` | text | Número do passaporte |
| `doc_militar` | text | Documento militar |
| `num_doc_militar` | text | Número do documento militar |
| `certidao_civil` | text | Certidão de nascimento/casamento |
| `telefone_comercial` | text | Telefone comercial |
| `celular` | text | Celular |
| `operadora` | text | Operadora de celular |
| `whatsapp` | text | Número WhatsApp |
| `prefere_nao_receber_email` | boolean | Opt-out de e-mails |
| `prefere_nao_receber_sms` | boolean | Opt-out de SMS |
| `preferencia_contato` | jsonb | Preferências de contato |

#### `perfis_enderecos`
Endereço completo dos usuários (1:1 com perfis).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `user_id` | uuid | FK → perfis.id |
| `cep` | text | CEP |
| `logradouro` | text | Rua/Avenida |
| `numero` | text | Número |
| `complemento` | text | Complemento |
| `bairro` | text | Bairro |
| `cidade` | text | Cidade |
| `uf` | char(2) | Estado |

#### `cursos`
Cursos oferecidos pela instituição.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `nome` | text | Nome do curso |
| `descricao` | text | Descrição |
| `ativo` | boolean | Se está ativo |

#### `turmas`
Turmas/categorias de alunos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `nome` | text | Nome da turma |
| `periodo` | text | Período letivo |
| `status_ingresso` | text | aberta, fechada |
| `curso_id` | uuid | FK → cursos.id |

#### `disciplinas`
Disciplinas dos cursos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `nome` | text | Nome da disciplina |
| `modulo` | text | Módulo (I, II, III) |
| `curso_id` | uuid | FK → cursos.id |
| `turma_id` | uuid | FK → turmas.id |
| `professor_id` | uuid | FK → perfis.id |

#### `matriculas`
Matrículas de alunos em turmas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `aluno_id` | uuid | FK → perfis.id |
| `turma_id` | uuid | FK → turmas.id |
| `status_aluno` | text | ativo, trancado, evadido, concluido |
| `ra` | text | Registro Acadêmico (único) |
| `codigo_barras` | text | Código de barras |
| `login_portal` | text | Login do portal (único) |
| `senha_portal` | text | Senha do portal |

#### `boletim`
Notas e faltas dos alunos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK (auto) |
| `aluno_id` | uuid | FK → perfis.id |
| `disciplina` | text | Nome da disciplina |
| `faltas` | numeric | Quantidade de faltas |
| `n1` | numeric | Nota 1 |
| `n2` | numeric | Nota 2 |
| `n3` | numeric | Nota 3 |
| `rec` | numeric | Nota de recuperação |

#### `aulas`
Aulas registradas pelos professores.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `disciplina_id` | uuid | FK → disciplinas.id |
| `professor_id` | uuid | FK → perfis.id |
| `data` | date | Data da aula |
| `conteudo` | text | Conteúdo ministrado |

#### `solicitacoes`
Solicitações de documentos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `user_id` | uuid | FK → perfis.id |
| `tipo` | text | Tipo de documento |
| `status` | text | pendente, concluido |
| `criado_em` | timestamptz | Data da solicitação |

#### `responsaveis`
Responsáveis legais de alunos menores.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `aluno_id` | uuid | FK → perfis.id |
| `nome` | text | Nome do responsável |
| `parentesco` | text | Pai, Mãe, Tutor, etc |
| `cpf` | text | CPF |
| `telefone` | text | Telefone |
| `email` | text | E-mail |
| `whatsapp` | text | WhatsApp |
| `principal` | boolean | Responsável principal |

#### `observacoes_aluno`
Observações e follow-ups sobre alunos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | PK |
| `aluno_id` | uuid | FK → perfis.id |
| `texto` | text | Texto da observação |
| `categoria` | text | geral, follow, importante, saude |
| `criado_por` | uuid | FK → perfis.id |
| `criado_em` | timestamptz | Data de criação |

---

## 🔐 Segurança

### Implementada
- ✅ **Edge Functions** para operações administrativas (Service Role Key segura)
- ✅ **Row Level Security (RLS)** em todas as tabelas
- ✅ **Sanitização XSS** em todas as views
- ✅ **Validação de inputs** com Zod (email, CPF, telefone, senha)
- ✅ **Headers de segurança** (CSP, HSTS, X-Frame-Options)
- ✅ **Tratamento centralizado de erros**
- ✅ **Camada de autorização RBAC**

### Edge Functions
| Função | Finalidade |
|--------|-----------|
| `admin-create-user` | Criar usuário com perfil (com rollback) |

### RLS - Políticas Principais
| Tabela | Quem pode ler | Quem pode escrever |
|--------|--------------|-------------------|
| `perfis` | Todos | Próprio usuário, admin |
| `perfis_enderecos` | Próprio, admin | Próprio, admin |
| `disciplinas` | Professor (suas), admin | Admin, professor (suas) |
| `matriculas` | Próprio aluno, admin | Admin |
| `boletim` | Aluno (seu), professor, admin | Professor, admin |
| `aulas` | Professor (suas), admin | Professor |
| `responsaveis` | Aluno, admin | Admin |
| `observacoes_aluno` | Aluno, professor, admin | Professor, admin |

---

## 📁 Estrutura de Arquivos

```
src/
├── auth/
│   ├── session.js              # Login, logout, getSession
│   └── signup-handler.js       # Cadastro de aluno com rollback
├── lib/
│   ├── supabase.js             # Cliente Supabase (sem admin client)
│   ├── admin-service.js        # Operações admin via Edge Functions
│   ├── academic-service.js     # CRUD turmas, matrículas, boletim
│   ├── course-service.js       # CRUD cursos, disciplinas
│   ├── documents-service.js    # CRUD solicitações de documentos
│   ├── pdf-service.js          # Geração de PDFs (jspdf)
│   ├── professor-service.js    # Operações do professor
│   ├── student-details-service.js    # Endereço, responsáveis, observações
│   ├── professor-details-service.js  # Dados expandidos do professor
│   ├── security.js             # Sanitização XSS
│   ├── validation.js           # Validação com Zod
│   ├── authz.js                # Autorização RBAC
│   ├── error-handler.js        # Tratamento de erros
│   └── toast.js                # Notificações toast
├── styles/
│   └── main.css                # Estilos globais
├── views/
│   ├── home.js                 # Página inicial
│   ├── login.js                # Login com validação
│   ├── signup.js               # Cadastro com validação
│   ├── dashboard.js            # Layout principal + router
│   ├── profile.js              # Meus Dados (expandido)
│   ├── directory.js            # Usuários do sistema
│   ├── documents.js            # Documentos do aluno
│   ├── matriz.js               # Matriz curricular
│   ├── secretaria.js           # Painel da secretaria
│   ├── gestao-turmas.js        # Gestão de turmas e matrículas
│   ├── academico.js            # Boletim escolar
│   ├── student-details.js      # Ficha completa do aluno
│   ├── professor-turmas.js     # Minhas turmas (notas, aulas, frequência)
│   ├── professor-alunos.js     # Meus alunos (busca + ficha)
│   └── professor-registrar-aula.js  # Registrar aula
└── main.js                     # Entry point + router hash
```

---

## 🛠️ Configuração

### Variáveis de Ambiente
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

**⚠️ IMPORTANTE:** Nunca adicione `VITE_SUPABASE_SERVICE_ROLE_KEY` no frontend!

### Instalação
```bash
npm install
npm run dev        # Desenvolvimento
npm run build      # Produção
npm run preview    # Preview do build
```

### Deploy Edge Functions
```bash
supabase login
supabase link --project-ref <ref>
supabase functions deploy admin-create-user
```

---

## 📊 Funcionalidades

### 👨‍🎓 Aluno
- ✅ Solicitar documentos (Declaração, Histórico, Atestado)
- ✅ Editar perfil completo (dados, endereço, contato)
- ✅ Ver usuários do sistema
- ✅ Ver matriz curricular

### 👨‍🏫 Professor
- ✅ Ver turmas atribuídas
- ✅ Lançar notas em lote (cálculo automático de médias)
- ✅ Registrar aulas (data, conteúdo)
- ✅ Registrar frequência
- ✅ Ver ficha completa de alunos
- ✅ Exportar notas em PDF
- ✅ Alertas de alunos com média baixa

### 🏫 Admin/Secretaria
- ✅ Criar alunos e professores (via Edge Functions)
- ✅ Vincular disciplinas a professores
- ✅ Gerenciar alunos (editar, buscar)
- ✅ Gerenciar professores
- ✅ Gestão de turmas e matrículas
- ✅ Gerenciar solicitações de documentos
- ✅ Aprovar e gerar PDFs de documentos
- ✅ Controle de status acadêmico e financeiro
- ✅ Gestão de cursos e disciplinas

---

## 📈 Fórmulas de Cálculo

### Média Teórica
```
Média = soma(notas presentes) / quantidade(notas presentes)
```

### Média Final
```
Se há recuperação: Final = (Média Teórica + Recuperação) / 2
Senão: Final = Média Teórica
```

### Status do Aluno
| Média Final | Status |
|-------------|--------|
| ≥ 7.0 | ✅ Aprovado |
| 5.0 - 6.9 | 🟡 Recuperação |
| < 5.0 | 🔴 Reprovado |

### Menor de Idade
```
menor = idade < 18 anos
```
Responsáveis são **obrigatórios** para menores de idade.

---

## 🐛 Resolução de Problemas

### Edge Functions não configuradas
```bash
supabase functions deploy admin-create-user
```

### Erro de RLS
Execute o SQL de criação de políticas em `DOCUMENTACAO_SEGURANCA.md`

### Build falha
```bash
rm -rf node_modules dist
npm install
npm run build
```

---

*Documentação atualizada em Abril 2026*
