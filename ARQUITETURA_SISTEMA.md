# Arquitetura do Sistema de Gestao Escolar - CSM

## 1. Visao Geral do Sistema

### 1.1 Nome e Proposito

O Sistema de Gestao Escolar - CSM e uma aplicacao web SPA (Single Page Application) desenvolvida para o Centro de Saude Monteiro (CSM), com o objetivo de automatizar os processos administrativos e academicos de uma instituicao de ensino tecnico na area de saude. O sistema gerencia usuarios, turmas, matriculas, disciplinas, notas, aulas e solicitacoes de documentos, oferecendo uma interface unificada para alunos, professores, secretaria e administradores.

A arquitetura foi projetada com foco em seguranca, escalabilidade e manutenibilidade, utilizando tecnologias modernas e boas praticas de desenvolvimento. O sistema segue o modelo de aplicacao client-side com comunicacao API-first, onde toda a logica de apresentacao e executada no navegador do usuario, enquanto o backend age como uma camada de dados e servicos.

### 1.2 Tecnologias Principais

A stack tecnologica do projeto foi cuidadosamente selecionada para equilibrar performance, seguranca e facilidade de manutencao. O frontend utiliza Vanilla JavaScript com Vite como bundler, o que permite um desenvolvimento rapido sem a complexidade de frameworks como React ou Vue, mantendo o codigo leve e de facil compreensao. A comunicacao com o backend e feita atraves do Supabase, uma plataforma open-source que combina PostgreSQL, autenticacao, armazenamento de arquivos e funcoes serverless.

O banco de dados PostgreSQL oferece robustez e conformidade com ACID, enquanto o Row Level Security (RLS) garante que os dados sejam acessados apenas por usuarios autorizados. As Edge Functions do Supabase executam logica server-side para operacoes privilegiadas, protegendo credenciais sensiveis. Para implantacao, o projeto utiliza GitHub Actions para CI/CD e pode ser hospedado em qualquer servico estatico compativel com Vite.

### 1.3 Fluxo de Dados Geral

```
+------------------------------------------------------------------+
|                         USUARIO                                  |
|                  (Navegador Web)                                 |
+---------------------------+--------------------------------------+
                            |
                            v
+---------------------------+--------------------------------------+
|                      FRONTEND (SPA)                              |
|  +-------------+    +-------------+    +---------------------+  |
|  |   Views     |<-->|  Services   |<-->|  Router (Hash)     |  |
|  | (HTML/JS)   |    |  (API)       |    |  #/dashboard       |  |
|  +-------------+    +-------------+    +---------------------+  |
|         |                  |                                     |
|         v                  v                                     |
|  +------------------------------------------+                    |
|  |         Supabase Client (JS)            |                    |
|  |   - Auth (JWT)                           |                    |
|  |   - RLS (Row Level Security)             |                    |
|  +------------------------------------------+                    |
+---------------------------+--------------------------------------+
                            |
          +-----------------+-----------------+
          |                                   |
          v                                   v
+------------------+              +------------------------+
|  SUPABASE        |              |  EDGE FUNCTIONS        |
|  AUTH            |              |  (Server-side)        |
|  - Login         |              |  - admin-create-user  |
|  - Signup        |              |  - Operacoes Admin    |
|  - Session       |              +------------------------+
+------------------+                          |
          |                                   |
          v                                   v
+------------------+              +------------------------+
|  POSTGRESQL      |              |  SERVICE ROLE KEY      |
|  - Dados         |              |  (Admin Privileges)    |
|  - RLS Policies |              +------------------------+
+------------------+
```

## 2. Arquitetura de Frontend

### 2.1 Stack Tecnologico

O frontend do sistema foi construtor utilizando tecnologias que priorizam simplicidade e performance. O Vanilla JavaScript com ES6 Modules permite organizacao clara do codigo sem a necessidade de transpiladores complexos ou configuracoes elaboradas. O Vite e responsavel pelo build e desenvolvimento, oferecendo Hot Module Replacement (HMR) para uma experiencia de desenvolvimento fluida e builds otimizados para producao.

As dependencias principais incluem o @supabase/supabase-js para comunicacao com o backend, jspdf e jspdf-autotable para geracao de documentos PDF, zod para validacao de dados e vite como bundler. O terser e utilizado em modo de producao para minificacao e remocao de console logs, reduzindo o tamanho do bundle final e eliminando possiveis vazamentos de informacao em ambiente de producao.

### 2.2 Estrutura de Diretorios

A organizacao do codigo segue um padrao de modularidade que separa claramente as responsabilidades de cada camada. O diretorio src contem todos os arquivos fontes da aplicacao, subdivididos em quatro pastas principais que serao descritas a seguir.

```
secretaria_escola_csm/
|
+-- src/
|   +-- auth/
|   |   +-- session.js        # Gerenciamento de sessao e login/logout
|   |   +-- signup-handler.js # Tratamento de cadastro de usuarios
|   |
|   +-- lib/
|   |   +-- supabase.js       # Cliente do banco de dados
|   |   +-- security.js       # Protecao XSS e sanitizacao
|   |   +-- authz.js          # Camada de autorizacao RBAC
|   |   +-- validation.js     # Validacao de formularios com Zod
|   |   +-- rate-limiter.js  # Protecao contra forca bruta
|   |   +-- error-handler.js # Tratamento centralizado de erros
|   |   +-- toast.js         # Notificacoes visuais
|   |   +-- academic-service.js    # Servicos academicos
|   |   +-- admin-service.js       # Servicos administrativos
|   |   +-- course-service.js      # Servicos de cursos
|   |   +-- documents-service.js    # Servicos de documentos
|   |   +-- professor-service.js   # Servicos de professor
|   |   +-- student-details-service.js # Servicos de detalhes do aluno
|   |   +-- professor-details-service.js # Servicos de detalhes do professor
|   |   +-- pdf-service.js      # Geracao de PDFs
|   |
|   +-- views/
|   |   +-- login.js           # Tela de login
|   |   +-- signup.js          # Tela de cadastro
|   |   +-- dashboard.js       # Layout principal do dashboard
|   |   +-- home.js            # Pagina inicial
|   |   +-- profile.js         # Perfil do usuario
|   |   +-- directory.js       # Diretorio de usuarios
|   |   +-- documents.js       # Solicitacao de documentos
|   |   +-- matriz.js         # Matriz curricular
|   |   +-- secretaria.js     # Painel da secretaria
|   |   +-- gestao-turmas.js  # Gestao de turmas
|   |   +-- professor.js       # Visao geral do professor
|   |   +-- professor-turmas.js   # Turmas do professor
|   |   +-- professor-alunos.js   # Alunos do professor
|   |   +-- professor-registrar-aula.js # Registro de aulas
|   |   +-- professor-details.js   # Detalhes do professor
|   |   +-- student-details.js    # Detalhes do aluno
|   |
|   +-- styles/
|   |   +-- main.css          # Estilos globais
|   |
|   +-- main.js               # Ponto de entrada e router
|
+-- public/
|   +-- _headers              # Headers de seguranca para CDN
|
+-- supabase/
|   +-- functions/
|   |   +-- admin-create-user/
|   |       +-- index.ts      # Edge Function para criar usuarios
|   +-- schema.sql            # Definicao do schema do banco
|   +-- migration.sql         # Script de migracao
|   +-- config.toml           # Configuracao do Supabase
|
+-- package.json              # Dependencias do projeto
+-- vite.config.js           # Configuracao do Vite
+-- .env.example             # Exemplo de variaveis de ambiente
```

### 2.3 Padrao de Arquitetura SPA com Hash Router

O sistema implementa um router client-side basado em hash URL, o que elimina a necessidade de configuracao de servidor para rotas e permite que a aplicacao funcione em qualquer servidor estatico. O arquivo main.js e o ponto de entrada da aplicacao e funciona como o controlador principal que gerencia a navegacao entre as diferentes visualizacoes.

O router escuta mudancas no hash da URL (por exemplo, de #/ para #/dashboard) e rendering a view correspondente. Todas as views sao funções que retornam elementos DOM, permitindo que sejam renderizadas de forma dinamica sem necessidade de templates externos. O estado de autenticacao e verificado em cada navegacao, redirecionando usuarios nao autenticados para a tela de login.

```
+------------------------------------------------------------------+
|                        main.js (Entry Point)                      |
+------------------------------------------------------------------+
|                                                                   |
|   1. Carrega estilos e dependencias                             |
|   2. Define elemento #app como container principal              |
|   3. Inicializa router                                           |
|                                                                   |
|                          +-----------------------+               |
|                          |    router()           |               |
|                          +-----------------------+               |
|                          |                       |               |
|                          v                       v               |
|   +----------------+   +----------------+   +---------------+    |
|   | #/ (Login)     |   | #/signup       |   | #/dashboard  |    |
|   +----------------+   +----------------+   +---------------+    |
|                                                  |               |
|                                                  v               |
|                                    +-------------------------+   |
|                                    |  DashboardView(session)|   |
|                                    +-------------------------+   |
|                                                  |               |
|                                                  v               |
|                                    +-------------------------+   |
|                                    |  Renderiza sidebar     |   |
|                                    |  conforme perfil       |   |
|                                    +-------------------------+   |
|                                                  |               |
|                                                  v               |
|   Sub-rotas do Dashboard:                                                |
|   #/dashboard          -> HomeView                                       |
|   #/dashboard/perfil   -> ProfileView                                    |
|   #/dashboard/documentos -> DocumentsView                               |
|   #/dashboard/usuarios -> DirectoryView                                  |
|   #/dashboard/secretaria -> SecretariaView (admin/secretaria)           |
|   #/dashboard/turmas   -> GestaoTurmasView (admin/secretaria)           |
|   #/dashboard/professor/turmas -> ProfessorTurmasView (professor)      |
|   #/dashboard/professor/alunos -> ProfessorAlunosView (professor)       |
|                                                                   |
+------------------------------------------------------------------+
```

### 2.4 Diagrama de Componentes do Frontend

A arquitetura de componentes segue um padrao hierarquico onde o dashboard age como container principal e as views sao renderizadas dentro dele. O sistema de navegacao passa o perfil do usuario para o dashboard, que entao configura a barra lateral com os menus apropriados e renderiza a area de conteudo principal.

```
+-------------------+       +-------------------+       +-------------------+
|   Sidebar         |       |   Main Content    |       |   Toast           |
|   (Navegacao)     |       |   (View Area)      |       |   (Notificacoes)  |
+-------------------+       +-------------------+       +-------------------+
| - Logo/Brand      |<----->| - HomeView        |<----->| - success         |
| - Menu Items      |       | - ProfileView     |       | - error           |
|   (role-based)    |       | - DocumentsView   |       | - warning         |
| - User Info       |       | - DirectoryView   |       | - info            |
| - Logout Button   |       | - SecretariaView  |       +-------------------+
+-------------------+       | - GestaoTurmasView|
                            | - ProfessorViews  |
                            +-------------------+
                                    |
                                    v
                            +-------------------+
                            |   Modal           |
                            |   (Formularios)   |
                            +-------------------+
```

## 3. Arquitetura de Backend

### 3.1 Supabase Overview

O Supabase e uma plataforma open-source que substitui o tradicional backend como servico (BaaS), oferecendo uma suite completa de ferramentas para desenvolvimento de aplicacoes. Ele combina um banco de dados PostgreSQL com autenticacao integrada, storage para arquivos, Edge Functions serverless e APIs automaticas geradas a partir do schema do banco.

A arquitetura do Supabase no contexto deste sistema opera em tres camadas principais. A primeira camada e o PostgreSQL com Row Level Security, onde todas as operacoes de dados passam por politicas de seguranca que limitam o acesso baseado na identidade do usuario. A segunda camada e o Auth, que gerencia registr os de usuarios, login, logout e sessoes, gerando tokens JWT que identificam o usuario em todas as requisicoes. A terceira camada sao as Edge Functions, funcoes TypeScript que executam em um ambiente serverless isolado, permitindo operacoes privilegiadas que nao podem ser realizadas no cliente.

```
+------------------------------------------------------------------+
|                      ARQUITETURA SUPABASE                        |
+------------------------------------------------------------------+
|                                                                   |
|   +------------------+        +------------------+                |
|   |   CLIENTE       |        |   EDGE          |                |
|   |   (Browser)      |        |   FUNCTIONS     |                |
|   +------------------+        +------------------+                |
|           |                           |                          |
|           |                           |                          |
|           v                           v                          |
|   +------------------+        +------------------+                |
|   | SUPABASE CLIENT |        | DENO RUNTIME     |                |
|   | - anon key      |        | (Serverless)     |                |
|   | - JWT Token     |        +------------------+                |
|   +------------------+                |                          |
|           |                           |                          |
|           +------------+---------------+                          |
|                        |                                          |
|                        v                                          |
|   +---------------------------------------------------+           |
|   |              SUPABASE PROXY / API                  |           |
|   |  - Valida JWT                                      |           |
|   |  - Aplica RLS Policies                             |           |
|   |  - Proxy requests                                  |           |
|   +---------------------------------------------------+           |
|                        |                                          |
|                        v                                          |
|   +---------------------------------------------------+           |
|   |              POSTGRESQL DATABASE                   |           |
|   |  - Tabelas: perfis, turmas, cursos, disciplinas   |           |
|   |  - Views, Triggers, Functions                       |           |
|   |  - RLS Policies                                    |           |
|   +---------------------------------------------------+           |
|                                                                   |
+------------------------------------------------------------------+
```

### 3.2 Edge Functions

As Edge Functions sao funcoes serverless que executam em um ambiente Deno no edge da rede, proximo ao usuario para garantir baixa latencia. No contexto deste sistema, as Edge Functions sao utilizadas exclusivamente para operacoes administrativas que requerem privilegios especiais, como a criacao de usuarios no sistema de autenticacao.

A principal Edge Function implementada e a admin-create-user, responsavel por criar novos usuarios com perfil de aluno. Esta funcao e critico para a seguranca do sistema pois impede que clientes maliciosos criem usuarios com perfis privilegiados. A funcao valida que o solicitante tem permisso (admin ou secretaria), força o perfil do novo usuario para aluno independentemente do que for enviado na requisicao, e implementa rollback em caso de falha para evitar dados orfaos.

```
+------------------------------------------------------------------+
|              FLUXO: CRIACAO DE USUARIO VIA EDGE FUNCTION         |
+------------------------------------------------------------------+
|                                                                   |
|   1. ADMIN/SECRETARIA                                            |
|      preenche formulario                                         |
|           |                                                      |
|           v                                                      |
|   2. FRONTEND: fetch() com JWT no Authorization header          |
|      POST /functions/v1/admin-create-user                        |
|      Body: { email, password, nomeCompleto, cpf, telefone }     |
|           |                                                      |
|           v                                                      |
|   3. EDGE FUNCTION: Recebe requisicao                           |
|      - Valida CORS                                               |
|      - Extrai token JWT                                          |
|           |                                                      |
|           v                                                      |
|   4. EDGE FUNCTION: Verifica token com Supabase Auth            |
|      - getUser(token)                                            |
|      - Se invalido: 401 Unauthorized                              |
|           |                                                      |
|           v                                                      |
|   5. EDGE FUNCTION: Busca perfil do usuario no banco            |
|      SELECT perfil FROM perfis WHERE id = user.id               |
|      - Se nao for admin/secretaria: 403 Forbidden                |
|           |                                                      |
|           v                                                      |
|   6. EDGE FUNCTION: Cria usuario com Service Role Key           |
|      - Ignora RLS (privilegio total)                             |
|      - Forca perfil = 'aluno' (NAO confia no input)             |
|           |                                                      |
|      +----|---------------------------------------------+        |
|      |    |                                             |        |
|      v    v                                             v        |
|   SUCESSO                                         FALHA          |
|   - Cria perfil                                   - Rollback    |
|   - Retorna userId                                - Delete user |
|           |                                             |        |
|           +------------------+----------------------------+        |
|                            |                                   |
|                            v                                   |
|                    RESPONSE JSON                               |
|                                                                   |
+------------------------------------------------------------------+
```

### 3.3 Fluxo de Requisicoes

O sistema diferencia claramente entre operacoes que podem ser realizadas diretamente pelo cliente e aquelas que requerem intervencao do servidor. Operacoes de leitura e modificacao de dados simples sao executadas diretamente via Supabase Client, passando pelo RLS que garante que apenas dados autorizados sejam retornados ou modificados. Operacoes privilegiadas como criacao de usuarios sao redirecionadas para Edge Functions.

```
+------------------------------------------------------------------+
|              FLUXO DE REQUISICOES - LEITURA                      |
+------------------------------------------------------------------+
|                                                                   |
|   VIEW (JavaScript)                                              |
|         |                                                        |
|         | Chamada ao service                                     |
|         v                                                        |
|   SERVICE (academic-service.js)                                 |
|         |                                                        |
|         | supabase.from('tabela').select()                      |
|         v                                                        |
|   SUPABASE CLIENT (supabase.js)                                  |
|         |                                                        |
|         | Adiciona JWT ao header                                 |
|         | + Authorization: Bearer <token>                       |
|         v                                                        |
|   SUPABASE API GATEWAY                                           |
|         |                                                        |
|         | Valida JWT                                             |
|         | Aplica RLS Policies                                    |
|         v                                                        |
|   POSTGRESQL                                                     |
|         |                                                        |
|         | Executa query com restricao RLS                       |
|         | Retorna dados filtrados                               |
|         v                                                        |
|   RESPONSE: Dados do usuario apenas                              |
|                                                                   |
+------------------------------------------------------------------+


+------------------------------------------------------------------+
|              FLUXO DE REQUISICOES - ESCRITA (ADMIN)              |
+------------------------------------------------------------------+
|                                                                   |
|   VIEW: Admin clica "Criar Usuario"                              |
|         |                                                        |
|         | fetch('/functions/v1/admin-create-user')              |
|         v                                                        |
|   SUPABASE CLIENT: Envia requisicao HTTP                         |
|         |                                                        |
|         | Headers:                                               |
|         | - Authorization: Bearer <token>                       |
|         | - Content-Type: application/json                      |
|         |                                                        |
|         v                                                        |
|   EDGE FUNCTION (Deno)                                           |
|         |                                                        |
|         | Cria supabaseAdmin com:                                |
|         | - SUPABASE_URL                                         |
|         | - SUPABASE_SERVICE_ROLE_KEY (secreto)                 |
|         |                                                        |
|         | Executa operacao privilegiada:                        |
|         | - auth.admin.createUser()                             |
|         | - from('perfis').insert()                             |
|         |                                                        |
|         | ATENCAO: RLS IGNORADO!                                |
|         |                                                        |
|         v                                                        |
|   POSTGRESQL: Operacao executada                                 |
|         | com privilegio total                                  |
|         |                                                        |
|         v                                                        |
|   RESPONSE: Sucesso ou erro                                      |
|                                                                   |
+------------------------------------------------------------------+
```

## 4. Banco de Dados

### 4.1 Schema Conceitual

O banco de dados foi modelado para suportar todas as operacoes do sistema de gestao escolar, desde o cadastro de usuarios ate o registro de notas e aulas. A modelagem segue principios de normalizacao ate a terceira forma normal (3NF), com chaves estrangeiras appropriately configuradas para manter a integridade referencial.

```
+------------------------------------------------------------------+
|                    ESQUEMA DO BANCO DE DADOS                     |
+------------------------------------------------------------------+
|                                                                   |
|   +-----------+         +-----------+                            |
|   |  cursos   |         |   turmas  |                            |
|   +-----------+         +-----------+                            |
|   | id (PK)   |<------->| id (PK)   |                            |
|   | nome      |         | nome      |                            |
|   | descricao |         | periodo   |                            |
|   | ativo     |         | status    |                            |
|   | created   |         | curso_id  |                            |
|   +-----------+         | created   |                            |
|                         +-----------+                            |
|                              |                                   |
|                              | 1:N                               |
|                              v                                   |
|   +-------------+      +-------------+      +-------------+      |
|   | matriculas  |      |disciplinas  |      |    aulas    |      |
|   +-------------+      +-------------+      +-------------+      |
|   | id (PK)     |      | id (PK)     |      | id (PK)     |      |
|   | aluno_id (FK|<---->| turma_id (FK|<----+| disciplina_ |<----+--|professor_id
|   | turma_id (FK|      | professor_id     | data        |      |  |
|   | status      |      | curso_id         | conteudo    |      |
|   | created     |      | modulo            | created     |      |
|   +-------------+      | nome             +-------------+      |
|        |               | created                         |      |
|        | 1:1          +-------------+                    |      |
|        v                      |                          |      |
|   +-----------+               | 1:N                      |      |
|   |  perfis   |               v                          |      |
|   +-----------+        +-------------+                   |      |
|   | id (PK)   |        |  boletim    |                   |      |
|   | nome      |        +-------------+                   |      |
|   | email     |        | id (PK)    |                    |      |
|   | cpf       |        | aluno_id (F|                   |      |
|   | telefone  |        | disciplina |                    |      |
|   | perfil    |        | n1, n2, n3 |                    |      |
|   | bloqueado |        | rec, falta |                    |      |
|   | created   |        | created    |                    |      |
|   +-----------+        +-------------+                   |      |
|                                                       |      |
|   +----------------+                                    |      |
|   | solicitacoes  |                                    |      |
|   +----------------+                                    |      |
|   | id (PK)       |<------------------------------------+      |
|   | user_id (FK)  |                                             |
|   | tipo          |     LEGENDA:                               |
|   | status        |     PK = Primary Key                       |
|   | criado_em     |     FK = Foreign Key                       |
|   +----------------+     1:N = Um para Muitos                  |
|                                                                   |
+------------------------------------------------------------------+
```

### 4.2 Tabelas e Relacionamentos

O banco de dados e composto por oito tabelas principais que armazenam todos os dados do sistema. Cada tabela foi projetada com campos apropriados e indices para garantir performance em consultas frequentes.

A tabela perfis armazena os dados de todos os usuarios do sistema, incluindo alunos, professores, secretaria e administradores. Cada registro nesta tabela esta diretamente linked ao registro correspondente no sistema de autenticacao do Supabase (auth.users), garantindo que apenas usuarios autenticados tenham perfis no sistema.

A tabela turmas representa as turmas ativas da instituicao, vinculadas a um curso especifico. O campo status_ingresso indica se a turma esta aberta para novas matriculas ou fechada. A tabela disciplinas armazena as materias oferecidas em cada turma e modulo, vinculadas ao curso e ao professor responsavel.

A tabela matriculas e uma tabela de relacionamento entre alunos e turmas, armazenando o status do aluno na turma (ativo, trancado, evadido ou concluido). O sistema implementa uma regra de negocio que impede um aluno de estar ativo em mais de uma turma simultaneamente.

A tabela boletim armazena as notas de cada aluno por disciplina, incluindo as tres notas bimestrais (n1, n2, n3), a nota de recuperacao (rec) e o total de faltas. A unicidade e garantida pela constraint UNIQUE(aluno_id, disciplina_id) e uma CHECK constraint valida que todas as notas estejam entre 0 e 10.

```
+------------------------------------------------------------------+
|                    DESCRICAO DAS TABELAS                         |
+------------------------------------------------------------------+
|                                                                   |
|   TABELA: cursos                                                  |
|   Armazena os cursos oferecidos pela instituicao                |
|   ------------------------------------------------------------   |
|   | Campo       | Tipo      | Descricao                          ||
|   | id          | UUID      | PK, identificador unico            ||
|   | nome        | TEXT      | Nome do curso                      ||
|   | descricao   | TEXT      | Descricao detalhada                ||
|   | ativo       | BOOLEAN   | Se o curso esta ativo              ||
|   | created_at  | TIMESTAMP | Data de criacao                    ||
|   ------------------------------------------------------------   |
|                                                                   |
|   TABELA: perfis                                                 |
|   Dados dos usuarios do sistema                                  |
|   ------------------------------------------------------------   |
|   | Campo               | Tipo      | Descricao                  ||
|   | id                  | UUID      | PK, mesmo do auth.users    ||
|   | nome_completo       | TEXT      | Nome completo              ||
|   | email               | TEXT      | Email de acesso            ||
|   | cpf                 | TEXT      | CPF (opcional)             ||
|   | telefone            | TEXT      | Telefone (opcional)       ||
|   | perfil              | TEXT      | admin|secretaria|professor||
|   |                     |           | aluno                      ||
|   | bloqueio_financeiro | BOOLEAN   | Bloqueio por divida        ||
|   | created_at          | TIMESTAMP | Data de criacao            ||
|   ------------------------------------------------------------   |
|                                                                   |
|   TABELA: turmas                                                  |
|   Turmas ativas da instituicao                                  |
|   ------------------------------------------------------------   |
|   | Campo           | Tipo      | Descricao                      ||
|   | id              | UUID      | PK                             ||
|   | nome            | TEXT      | Nome da turma                  ||
|   | periodo         | TEXT      | Manha|Tarde|Noite              ||
|   | status_ingresso | TEXT      | aberta|fechada               ||
|   | curso_id        | UUID      | FK para cursos                 ||
|   | created_at      | TIMESTAMP | Data de criacao                ||
|   ------------------------------------------------------------   |
|                                                                   |
|   TABELA: matriculas                                             |
|   Relacionamento aluno-turma                                    |
|   ------------------------------------------------------------   |
|   | Campo        | Tipo      | Descricao                         ||
|   | id           | UUID      | PK                                ||
|   | aluno_id     | UUID      | FK para perfis                    ||
|   | turma_id     | UUID      | FK para turmas                    ||
|   | status_aluno | TEXT      | ativo|trancado|evadido|concluido ||
|   | created_at   | TIMESTAMP | Data de matricula                 ||
|   ------------------------------------------------------------   |
|                                                                   |
|   TABELA: disciplinas                                            |
|   Materias oferecidas                                           |
|   ------------------------------------------------------------   |
|   | Campo         | Tipo      | Descricao                         ||
|   | id            | UUID      | PK                                ||
|   | nome          | TEXT      | Nome da disciplina               ||
|   | modulo        | TEXT      | I|II|III Modulo                 ||
|   | turma_id      | UUID      | FK para turmas                    ||
|   | professor_id  | UUID      | FK para perfis (professor)        ||
|   | curso_id      | UUID      | FK para cursos                    ||
|   | created_at    | TIMESTAMP | Data de criacao                   ||
|   ------------------------------------------------------------   |
|                                                                   |
|   TABELA: aulas                                                  |
|   Registro de aulasministradas                                  |
|   ------------------------------------------------------------   |
|   | Campo          | Tipo      | Descricao                         ||
|   | id             | UUID      | PK                                ||
|   | disciplina_id  | UUID      | FK para disciplinas               ||
|   | professor_id   | UUID      | FK para perfis                    ||
|   | data           | DATE      | Data da aula                      ||
|   | conteudo       | TEXT      | Conteudo mimstrado                ||
|   | created_at     | TIMESTAMP | Data de criacao                   ||
|   ------------------------------------------------------------   |
|                                                                   |
|   TABELA: boletim                                                |
|   Notas e frequencia dos alunos                                 |
|   ------------------------------------------------------------   |
|   | Campo       | Tipo      | Descricao                         ||
|   | id          | UUID      | PK                                ||
|   | aluno_id    | UUID      | FK para perfis                    ||
|   | disciplina_id | UUID  | FK para disciplinas                 ||
|   | n1          | DECIMAL   | Nota do 1 bimestre (0-10)         ||
|   | n2          | DECIMAL   | Nota do 2 bimestre (0-10)         ||
|   | n3          | DECIMAL   | Nota do 3 bimestre (0-10)         ||
|   | rec         | DECIMAL   | Nota de recuperacao (0-10)        ||
|   | faltas      | INTEGER   | Total de faltas                   ||
|   | CONSTRAINT  |           | CHECK(n1,n2,n3 BETWEEN 0 AND 10) ||
|   ------------------------------------------------------------   |
|                                                                   |
|   TABELA: solicitacoes                                            |
|   Pedidos de documentos academicos                              |
|   ------------------------------------------------------------   |
|   | Campo      | Tipo      | Descricao                          ||
|   | id        | UUID      | PK                                 ||
|   | user_id   | UUID      | FK para perfis                     ||
|   | tipo      | TEXT      | Tipo de documento                  ||
|   | status    | TEXT      | pendente|concluido                ||
|   | criado_em | TIMESTAMP | Data da solicitacao                ||
|   ------------------------------------------------------------   |
|                                                                   |
+------------------------------------------------------------------+
```

### 4.3 Row Level Security (RLS)

O Row Level Security e uma funcionalidade do PostgreSQL que permite controlar o acesso a linhas de tabelas baseado no usuario que executa a consulta. No contexto deste sistema, todas as tabelas possuem politicas RLS habilitadas que garantem que usuarios vejam apenas os dados que estao autorizados a acessar.

As politicas RLS sao aplicadas automaticamente pelo Supabase em todas as consultas, tanto de leitura quanto de escrita. Um usuario comum so pode ver e modificar registros que satisfacam as condicoes definidas nas politicas, tornando o sistema muito mais seguro do que verificacoes manuais no codigo.

```
+------------------------------------------------------------------+
|                    POLITICAS RLS IMPLEMENTADAS                   |
+------------------------------------------------------------------+
|                                                                   |
|   TABELA: perfis                                                 |
|   ------------------------------------------------------------   |
|   LEITURA:                                                       |
|     - policy: "Users can view all profiles"                     |
|     - USING: auth.role() = 'authenticated'                       |
|                                                               |
|   ESCRITA:                                                       |
|     - policy: "Users can update own profile"                    |
|     - WITH CHECK: auth.uid() = id                                |
|     - policy: "Admins can update any profile"                    |
|     - WITH CHECK: perfil IN ('admin', 'secretaria')              |
|                                                               |
|   DELETE:                                                        |
|     - policy: "Apenas admin pode deletar perfis"                |
|     - USING: EXISTS (SELECT 1 FROM perfis p                      |
|                        WHERE p.id = auth.uid()                   |
|                        AND p.perfil = 'admin')                   |
|                                                               |
|   TABELA: turmas                                                 |
|   ------------------------------------------------------------   |
|   LEITURA:                                                       |
|     - policy: "Everyone can view turmas"                         |
|     - USING: true                                                |
|                                                               |
|   ESCRITA:                                                       |
|     - policy: "Only admin/secretaria can modify"                |
|     - WITH CHECK: EXISTS (SELECT 1 FROM perfis p                  |
|                            WHERE p.id = auth.uid()               |
|                            AND p.perfil IN ('admin','secretaria'))|
|                                                               |
|   DELETE:                                                        |
|     - policy: "Apenas admin/secretaria pode deletar turmas"     |
|     - USING: EXISTS (SELECT 1 FROM perfis p                      |
|                        WHERE p.id = auth.uid()                   |
|                        AND p.perfil IN ('admin','secretaria'))   |
|                                                               |
|   TABELA: matriculas                                             |
|   ------------------------------------------------------------   |
|   LEITURA:                                                       |
|     - policy: "Alunos veem suas proprias matriculas"            |
|     - USING: aluno_id = auth.uid()                              |
|     - policy: "Professores veem matriculas de suas turmas"      |
|     - policy: "Admin/Secretaria veem todas"                      |
|                                                               |
|   ESCRITA:                                                       |
|     - policy: "Only admin/secretaria can modify"                |
|     - WITH CHECK: EXISTS (SELECT 1 FROM perfis p                  |
|                            WHERE p.id = auth.uid()               |
|                            AND p.perfil IN ('admin','secretaria'))|
|                                                               |
|   DELETE:                                                        |
|     - policy: "Apenas admin/secretaria pode deletar matriculas" |
|     - USING: EXISTS (SELECT 1 FROM perfis p                      |
|                        WHERE p.id = auth.uid()                   |
|                        AND p.perfil IN ('admin','secretaria'))   |
|                                                               |
|   TABELA: disciplinas                                            |
|   ------------------------------------------------------------   |
|   LEITURA:                                                       |
|     - policy: "Everyone can view"                                |
|     - USING: auth.role() = 'authenticated'                       |
|                                                               |
|   ESCRITA:                                                       |
|     - policy: "Professores gerem suas disciplinas"              |
|     - WITH CHECK: professor_id = auth.uid()                     |
|     - policy: "Admin/secretaria gerem todas"                     |
|                                                               |
|   DELETE:                                                        |
|     - policy: "Apenas admin/secretaria pode deletar disciplinas"|
|     - USING: EXISTS (SELECT 1 FROM perfis p                      |
|                        WHERE p.id = auth.uid()                   |
|                        AND p.perfil IN ('admin','secretaria'))   |
|                                                               |
|   TABELA: aulas                                                  |
|   ------------------------------------------------------------   |
|   LEITURA:                                                       |
|     - policy: "Professores veem suas aulas"                     |
|     - USING: professor_id = auth.uid()                          |
|     - policy: "Admin/secretaria veem todas"                      |
|                                                               |
|   ESCRITA:                                                       |
|     - policy: "Only owner professor can insert"                 |
|     - WITH CHECK: professor_id = auth.uid()                      |
|                                                               |
|   DELETE:                                                        |
|     - policy: "Professor dono ou admin pode deletar aulas"      |
|     - USING: professor_id = auth.uid()                          |
|       OR EXISTS (SELECT 1 FROM perfis p                          |
|                    WHERE p.id = auth.uid()                       |
|                    AND p.perfil = 'admin')                       |
|                                                               |
|   TABELA: boletim                                                |
|   ------------------------------------------------------------   |
|   LEITURA:                                                       |
|     - policy: "Aluno ve proprio boletim"                        |
|     - USING: aluno_id = auth.uid()                              |
|     - policy: "Professor ve boletim de suas disciplinas"        |
|     - policy: "Admin/secretaria veem todos"                      |
|                                                               |
|   ESCRITA:                                                       |
|     - policy: "Professor atualiza notas"                        |
|     - WITH CHECK: EXISTS (SELECT 1 FROM disciplinas d            |
|                            WHERE d.id = disciplina_id             |
|                            AND d.professor_id = auth.uid())      |
|     - policy: "Admin atualiza qualquer"                         |
|                                                               |
|   DELETE:                                                        |
|     - policy: "Apenas admin/secretaria pode deletar"            |
|     - USING: EXISTS (SELECT 1 FROM perfis p                      |
|                        WHERE p.id = auth.uid()                   |
|                        AND p.perfil IN ('admin','secretaria'))   |
|                                                               |
+------------------------------------------------------------------+
```

## 5. Modelo de Seguranca

### 5.1 Autenticacao e Autorizacao

O sistema implementa um modelo de seguranca em camadas que protege os dados em multiplos niveis. A autenticacao e gerenciada pelo Supabase Auth, que utiliza JWTs (JSON Web Tokens) para manter o estado de sessao do usuario. Cada requisicao ao banco de dados inclui o token JWT, que e validado pelo Supabase antes de executar qualquer operacao.

A autorizacao e implementada em duas camadas complementares. A primeira camada e o RBAC (Role-Based Access Control) no frontend, implementado no arquivo authz.js, que controla quais menus e funcionalidades estao disponiveis para cada perfil de usuario. A segunda camada e o RLS no banco de dados, que garante que mesmo que um usuario malicioso evite as verificacoes do frontend, ele ainda assimso podera acessar dados autorizados.

### 5.2 Camada RBAC

O sistema define quatro perfis de usuario com permisscoes distintas. O perfil admin tem acesso completo a todas as funcionalidades do sistema, incluindo gerenciamento de usuarios, turmas, matriculas, cursos e documentos. O perfil secretaria possui permisscoes semelhantes ao admin, exceto para operacoes financeiras. O perfil professor pode gerenciar suas turmas, disciplinas, notas e registrar aulas. O perfil aluno tem acesso apenas as funcionalidades basicas de visualizacao e solicitacao de documentos.

```
+------------------------------------------------------------------+
|                    MATRIZ DE PERMISSOES RBAC                     |
+------------------------------------------------------------------+
|                                                                   |
|   PERMISSAO                    | ADMIN | SECR | PROF | ALUNO     |
|   ----------------------------|-------|------|------|-------     |
|   view_dashboard               |   X   |  X   |  X   |    X       |
|   view_colegas                 |   X   |  X   |  X   |    X       |
|   view_documentos              |   X   |  X   |  X   |    X       |
|   view_matriz                  |   X   |  X   |  X   |    X       |
|   view_secretaria              |   X   |  X   |  -   |    -       |
|   view_turmas                  |   X   |  X   |  -   |    -       |
|   view_academico               |   X   |  X   |  X   |    X       |
|   view_professor               |   -   |  -   |  X   |    -       |
|   view_perfil                  |   X   |  X   |  X   |    X       |
|   manage_users                 |   X   |  X   |  -   |    -       |
|   manage_turmas                |   X   |  X   |  -   |    -       |
|   manage_matriculas            |   X   |  X   |  -   |    -       |
|   manage_notas                 |   -   |  -   |  X   |    -       |
|   manage_cursos                |   X   |  X   |  -   |    -       |
|   manage_documentos            |   X   |  X   |  -   |    -       |
|   manage_professores            |   X   |  X   |  -   |    -       |
|   manage_aulas                  |   -   |  -   |  X   |    -       |
|   manage_financeiro            |   X   |  -   |  -   |    -       |
|                                                                   |
+------------------------------------------------------------------+
```

### 5.3 Protecao contra Ameacas

O sistema implementa multiplas camadas de protecao contra os vetores de ataque mais comuns em aplicacoes web. A protecao contra XSS e implementada atraves da funcao escapeHTML que escapa todos os caracteres especiais antes de inserir dados do usuario no HTML. Essa funcao e utilizada em todas as views do sistema.

A protecao contra forca bruta e implementada em duas camadas. A primeira camada e client-side, executada pelo rate-limiter.js que limita tentativas de login a 5 por janela de 5 minutos, oferecendo feedback imediato ao usuario. A segunda camada e server-side, implementada via Edge Function, que garante protecao real contra ataques automatizados mesmo quando o atacante contorna as restricoes do navegador.

A implementacao server-side utiliza uma tabela `login_attempts` no banco de dados para registrar tentativas falhas por IP e email. A Edge Function `auth-rate-limiter` e chamada antes de cada tentativa de login e verifica se o limite foi excedido. Quando o limite e atingido, o usuario e bloqueado por 15 minutos, independentemente de estar usando o navegador ou scripts automatizados.

A protecao contra sequestro de sessao e implementada atraves de um timeout de 30 minutos de inatividade. Se o usuario nao interagir com o sistema por esse periodo, ele sera automaticamente desconectado. Esse timeout e verificado periodicamente em background.

```
+------------------------------------------------------------------+
|               FLUXO DE PROTECAO CONTRA AMEACAS                   |
+------------------------------------------------------------------+
|                                                                   |
|   XSS (Cross-Site Scripting)                                     |
|   ====================                                           |
|                                                                   |
|   Dado malicioso: <script>alert('xss')</script>                  |
|                        |                                          |
|                        v                                          |
|   escapeHTML(): &lt;script&gt;alert(&#x27;xss&#x27;)            |
|                        |                                          |
|                        v                                          |
|   Renderizado como texto seguro                                  |
|                                                                   |
|   FORCA BRUTA                                                    |
|   ==========                                                      |
|                                                                   |
|   CAMADA 1: CLIENT-SIDE                                         |
|   Tentativa 1 -> ... -> Tentativa 5                              |
|                        |                                          |
|                        v                                          |
|   Bloqueio local: 15 minutos                                     |
|   Mensagem: "Muitas tentativas. Tente novamente em X min."      |
|                                                                   |
|   CAMADA 2: SERVER-SIDE (Edge Function)                         |
|   Requisicao -> Edge Function auth-rate-limiter                  |
|        |                                                         |
|        v                                                         |
|   SELECT COUNT(*) FROM login_attempts                           |
|     WHERE (ip = $1 OR email = $2)                               |
|     AND created_at > NOW() - INTERVAL '5 min'                   |
|        |                                                         |
|        | count >= 5?                                             |
|        +---- SIM -> Retorna 429 Too Many Requests               |
|        |                                                         |
|        NAO                                                       |
|        |                                                         |
|        v                                                         |
|   Prossegue para Supabase Auth                                  |
|        |                                                         |
|        | Falhou?                                                |
|        v                                                         |
|   INSERT INTO login_attempts (ip, email, created_at)           |
|                                                                   |
|   TABELA: login_attempts                                        |
|   ------------------------------------------------------------   |
|   | id        | UUID   | PK                                     ||
|   | ip        | TEXT   | IP do solicitante                     ||
|   | email     | TEXT   | Email tentado                         ||
|   | created_at| TIMESTMP | Data da tentativa                  ||
|   ------------------------------------------------------------   |
|                                                                   |
|   SEQUESTRO DE SESSAO                                            |
|   ===============                                                |
|                                                                   |
|   Login -> Session Criada (JWT) -> Intervalo started (30min)    |
|        |                                     |                   |
|        |    Atividade detectada              |                   |
|        |    (click, hashchange, keypress)     |                   |
|        |             |                       |                   |
|        v             v                       v                   |
|   Session Reset                          Timeout!              |
|   Interval Reset                        Redirect to /          |
|                                                                   |
|   ESCALADA DE PRIVILEGIOS                                        |
|   ======================                                          |
|                                                                   |
|   Cliente malicioso tenta:                                       |
|   POST /functions/v1/admin-create-user                           |
|   Body: { perfil: "admin", ... }                                 |
|                        |                                          |
|                        v                                          |
|   Edge Function recebe:                                          |
|   const { perfil } = await req.json()                           |
|   const perfilForcado = "aluno"  // IGNORA input!              |
|                                                                   |
|   Resultado: Sempre cria como aluno                              |
|                                                                   |
+------------------------------------------------------------------+
```

### 5.4 Fluxo de Login

O fluxo de login e o primeiro ponto de contato do usuario com o sistema e, portanto, um dos mais criticos para a seguranca. O processo comeca quando o usuario submete o formulario de login, que passa por validacao local antes de ser enviado ao servidor.

```
+------------------------------------------------------------------+
|                    FLUXO DE LOGIN                                |
+------------------------------------------------------------------+
|                                                                   |
|   1. USUARIO                                                     |
|      Acessa #/ (pagina de login)                                 |
|      Preenche email e senha                                      |
|      Clica "Entrar"                                              |
|           |                                                      |
|           v                                                      |
|   2. VALIDACAO LOCAL (validation.js)                            |
|      - Email valido? (formato)                                   |
|      - Senha presente? (min 8 chars)                             |
|      Se invalido: mostra erros, NAO envia                       |
|           |                                                      |
|           v                                                      |
|   3. RATE LIMIT CHECK (rate-limiter.js)                        |
|      checkRateLimit(email)                                       |
|      Se bloqueado: mostra mensagem, NAO envia                   |
|           |                                                      |
|           v                                                      |
|   4. SUPABASE AUTH (session.js)                                  |
|      supabase.auth.signInWithPassword({ email, password })    |
|           |                                                      |
|      +----|-------------------------+                           |
|      |    |                         |                           |
|      v    v                         v                           |
|   SUCESSO                     ERRO                               |
|   - Session retornada          - "Credenciais invalidas"         |
|   - JWT token                 - Exibe mensagem erro               |
|           |                                                      |
|           v                                                      |
|   5. INICIAR SESSAO (session.js)                                |
|      - startSessionTimeout()                                     |
|      - Interval: verifica a cada 1min                           |
|           |                                                      |
|           v                                                      |
|   6. REDIRECIONAMENTO                                           |
|      window.location.hash = "#/dashboard"                       |
|           |                                                      |
|           v                                                      |
|   7. ROUTER (main.js)                                           |
|      - Busca perfil do usuario                                   |
|      - Renderiza DashboardView(session)                         |
|      - Sidebar configurada conforme perfil                      |
|                                                                   |
+------------------------------------------------------------------+
```

## 6. Camadas de Servicos

### 6.1 Visao Geral dos Servicos

O sistema e organizado em camadas de servicos que encapsulam a logica de negocio e abstraem o acesso aos dados. Cada servico e responsavel por um dominio especifico do sistema, como administracao, academico ou documentos.

O padrao de servicos segue uma estrutura onde cada arquivo exporta um objeto com metodos asyncronos que realizam operacoes especificas. Todos os servicosutilizam o cliente supabase para comunicacao com o banco de dados, garantindo que as requisicoes passem pelo RLS.

```
+------------------------------------------------------------------+
|                    CAMADAS DE SERVICOS                           |
+------------------------------------------------------------------+
|                                                                   |
|   +------------------+                                           |
|   |   VIEWS          |  Camada de Apresentacao                   |
|   |   (HTML/JS DOM)  |  - Renderiza interface                    |
|   +------------------+  - Captura eventos do usuario            |
|          |                                                    |
|          | Chama                                              |
|          v                                                    |
|   +------------------+                                           |
|   |   SERVICES       |  Camada de Logica de Negocio              |
|   +------------------+  - academic-service.js                   |
|   | academic-service|    - Turmas, matriculas, disciplinas      |
|   | admin-service   |    - admin-service.js                     |
|   | course-service  |      - Gestao de usuarios                  |
|   | documents-svc  |    - course-service.js                     |
|   | professor-svc   |      - Cursos                             |
|   | student-details|    - documents-service.js                 |
|   | professor-detail|     - Solicitacoes de documentos          |
|   +------------------+    - professor-service.js               |
|          |                  - professor-details-service.js      |
|          |                  - student-details-service.js         |
|          |                                                    |
|          | Utiliza                                            |
|          v                                                    |
|   +------------------+                                           |
|   |   SUPABASE      |  Camada de Dados                          |
|   |   CLIENT        |  - Comunicacao com API                   |
|   +------------------+  - Gerenciamento de sessao              |
|          |                                                    |
|          | Requisições HTTP/WebSocket                          |
|          v                                                    |
|   +------------------+                                           |
|   |   POSTGRESQL    |  Camada de Armazenamento                  |
|   |   + RLS         |  - Persistencia de dados                 |
|   +------------------+  - Seguranca em nivel de linha           |
|                                                                   |
+------------------------------------------------------------------+
```

### 6.2 Fluxo de Dados entre Camadas

O fluxo de dados comeca quando uma view precisa exibir ou modificar informacoes. Por exemplo, quando um professor deseja ver a lista de alunos de suas turmas, o seguinte fluxo e executado.

```
+------------------------------------------------------------------+
|            FLUXO DE DADOS: PROFESSOR VISUALIZA ALUNOS            |
+------------------------------------------------------------------+
|                                                                   |
|   1. VIEW: professor-alunos.js                                  |
|      Renderiza formulario de busca                               |
|      Evento: botao "Buscar" clicado                             |
|           |                                                      |
|           | chama professorService.getAlunos()                  |
|           v                                                      |
|   2. SERVICE: professor-service.js                              |
|      getAlunos() {                                               |
|        return supabase                                           |
|          .from('perfis')                                         |
|          .select('*, matriculas(turmas(...))')                   |
|          .eq('perfil', 'aluno')                                 |
|      }                                                           |
|           |                                                      |
|           | Consulta com JWT                                    |
|           v                                                      |
|   3. SUPABASE CLIENT: Adiciona token                            |
|      Authorization: Bearer <jwt_token>                          |
|           |                                                      |
|           | Requisicao HTTP                                      |
|           v                                                      |
|   4. SUPABASE API: Valida JWT                                    |
|      - Se invalido: 401 Unauthorized                            |
|      - Se valido: continua                                       |
|           |                                                      |
|           | Aplica RLS Policies                                  |
|           v                                                      |
|   5. POSTGRESQL: Executa query                                   |
|      SELECT * FROM perfis                                        |
|      JOIN matriculas ON ...                                      |
|      WHERE perfil = 'aluno'                                      |
|      AND ... (RLS filter)                                        |
|           |                                                      |
|           | Retorna dados                                        |
|           v                                                      |
|   6. RESPONSE: Dados retornados ao service                     |
|           |                                                      |
|           | Service retorna para view                            |
|           v                                                      |
|   7. VIEW: Renderiza tabela com dados                           |
|      escapeHTML() aplicado em cada valor                        |
|                                                                   |
+------------------------------------------------------------------+


+------------------------------------------------------------------+
|           FLUXO DE DADOS: SECRETARIA CRIA TURMA                 |
+------------------------------------------------------------------+
|                                                                   |
|   1. VIEW: gestao-turmas.js                                     |
|      Renderiza formulario: nome, periodo                         |
|      Evento: botao "Criar Turma" clicado                        |
|           |                                                      |
|           | chama academicService.createTurma()                |
|           v                                                      |
|   2. SERVICE: academic-service.js                              |
|      createTurma({ nome, periodo }) {                           |
|        return supabase                                           |
|          .from('turmas')                                         |
|          .insert([{ nome, periodo }])                           |
|          .select()                                              |
|      }                                                           |
|           |                                                      |
|           | Consulta com JWT                                     |
|           v                                                      |
|   3. SUPABASE API:                                               |
|      Valida JWT + RLS                                            |
|           |                                                      |
|           | RLS Policy verifica:                                  |
|           | perfil IN ('admin','secretaria')                    |
|           |                                                      |
|           | Se autorizado: executa INSERT                       |
|           | Se nao autorizado: 403                               |
|           v                                                      |
|   4. RESPONSE:                                                  |
|      Sucesso: { data: [turma], error: null }                   |
|      Erro: { data: null, error: ... }                           |
|           |                                                      |
|           | Service retorna para view                            |
|           v                                                      |
|   5. VIEW: Exibe toast sucesso ou erro                          |
|      Atualiza tabela de turmas                                   |
|                                                                   |
+------------------------------------------------------------------+
```

## 7. Implantacao e CI/CD

### 7.1 Pipeline GitHub Actions

O projeto utiliza GitHub Actions para implantacao automatica. O workflow definido no arquivo `deploy.yml` e acionado a cada push para o branch main, executando testes de build e implantando automaticamente em producao.

O pipeline comeca com o checkout do codigo, seguido pela instalacao das dependencias NPM. O proximo passo e o build da aplicacao com Vite, que gera os arquivos estaticos otimizados na pasta dist. Finalmente, os arquivos sao fazer upload para o ambiente de hospedagem configurado.

#### Exemplo de Workflow (.github/workflows/deploy.yml)

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
      continue-on-error: true
    
    - name: Run tests
      run: npm test
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    
    - name: Build project
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    
    - name: Upload to GitHub Pages
      if: github.ref == 'refs/heads/main' && github.event_name == 'push'
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
        publish_branch: gh-pages
        force_orphan: true
```

### 7.2 Ambiente de Producao

O build de producao executa varias otimizacoes alem da minificacao basica. O Vite configura o Terser para remover todos os console.logs e console.errors, garantindo que informacoes de debug nao sejam expostas em producao. O processo tambem remove statements de debugger.

O arquivo public/_headers define headers de seguranca para o CDN de hospedagem, incluindo Content Security Policy (CSP), Strict-Transport-Security (HSTS), X-Content-Type-Options e X-Frame-Options. Esses headers protegem a aplicacao contra ataques comuns como XSS e clickjacking.

```
+------------------------------------------------------------------+
|               PIPELINE DE IMPLANTACAO (GITHUB ACTIONS)           |
+------------------------------------------------------------------+
|                                                                   |
|   EVENTO: Push para main                                         |
|           |                                                      |
|           v                                                      |
|   +------------------+                                           |
|   | 1. Checkout      |  Baixa codigo do repositorio             |
|   +------------------+                                           |
|           |                                                      |
|           v                                                      |
|   +------------------+                                           |
|   | 2. Setup Node   |  Configura Node.js v20.x                  |
|   +------------------+                                           |
|           |                                                      |
|           v                                                      |
|   +------------------+                                           |
|   | 3. Install      |  npm install (package.json)               |
|   +------------------+                                           |
|           |                                                      |
|           v                                                      |
|   +------------------+                                           |
|   | 4. Build        |  npm run build                            |
|   +------------------+  (Vite + Terser)                         |
|           |              - Minificacao                           |
|           |              - Remove console.log                   |
|           |              - Tree shaking                          |
|           |                                                      |
|           v                                                      |
|   +------------------+                                           |
|   | 5. Deploy       |  Upload para hosting                     |
|   +------------------+  (Vercel/Netlify/GH Pages)              |
|                                                                   |
+------------------------------------------------------------------+
```

## 8. Exemplos de Codigo

### 8.1 Router Client-Side

O router e o coracao da navegacao SPA, gerenciando qual view renderizar baseada no hash da URL. Este codigo demonstra a implementacao completa do router com protecao de rotas.

```javascript
// src/main.js (versao simplificada)

import { supabase } from './lib/supabase'
import { LoginView } from './views/login'
import { SignupView } from './views/signup'
import { DashboardView } from './views/dashboard'
import { HomeView } from './views/home'

const app = document.querySelector('#app')

/**
 * Router simple basado em URL hash.
 * Protege o dashboard verificando sessao valida.
 */
async function router() {
  const path = window.location.hash || '#/'
  const { data: { session } } = await supabase.auth.getSession()

  // Limpa app
  app.innerHTML = ''

  // Protecao de rotas: redireciona se nao autenticado
  if (path.startsWith('#/dashboard') && !session) {
    window.location.hash = '#/'
    return
  }

  // Se ja logado, redireciona login/signup para dashboard
  if ((path === '#/' || path === '#/signup') && session) {
    window.location.hash = '#/dashboard'
    return
  }

  // Renderiza view conforme caminho
  try {
    if (path === '#/') {
      app.appendChild(LoginView())
    } else if (path === '#/signup') {
      app.appendChild(SignupView())
    } else if (path === '#/home') {
      app.appendChild(HomeView())
    } else if (path.startsWith('#/dashboard')) {
      const subPath = path.replace('#/dashboard', '') || '/'
      app.appendChild(await DashboardView(session, subPath))
    } else {
      app.innerHTML = '<h1>404 - Pagina nao encontrada</h1>'
    }
  } catch (err) {
    console.error('Render error:', err)
    app.innerHTML = '<p style="padding:20px; color:red;">Erro ao carregar pagina.</p>'
  }
}

// Escuta mudancas de hash
window.addEventListener('hashchange', router)
window.addEventListener('load', router)

// Escuta mudancas de estado de autenticacao
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    window.location.hash = '#/dashboard'
  } else if (event === 'SIGNED_OUT') {
    window.location.hash = '#/'
  }
  router()
})

router()
```

### 8.2 Chamada Edge Function

Este exemplo demonstra como o frontend chama uma Edge Function para criar um novo usuario. Note que o token JWT do usuario atual e includo no header de autorizacao.

```javascript
// Exemplo de chamada a Edge Function

async function criarUsuario(dadosUsuario) {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    throw new Error('Sessao expirada. Faça login novamente.')
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: dadosUsuario.email,
        password: dadosUsuario.senha,
        nomeCompleto: dadosUsuario.nomeCompleto,
        cpf: dadosUsuario.cpf,
        telefone: dadosUsuario.telefone
      })
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(result.error?.message || 'Erro ao criar usuario')
  }

  return result.data
}

// Utilizacao
try {
  const novoUsuario = await criarUsuario({
    email: 'aluno@exemplo.com',
    senha: 'Senha123',
    nomeCompleto: 'Joao Silva',
    cpf: '123.456.789-00',
    telefone: '(11) 99999-9999'
  })
  console.log('Usuario criado:', novoUsuario.userId)
} catch (error) {
  console.error('Erro:', error.message)
}
```

### 8.4 Rate Limiter Server-Side (Edge Function)

Este exemplo demonstra a implementacao da Edge Function que protege contra ataques de forca bruta no servidor:

```typescript
// supabase/functions/auth-rate-limiter/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MAX_ATTEMPTS = 5
const WINDOW_MS = 5 * 60 * 1000 // 5 minutos
const BLOCK_MS = 15 * 60 * 1000 // 15 minutos

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { ip, email } = await req.json()

    // Conecta ao banco com chave anonima
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    // Conta tentativas recentes por IP ou email
    const { data: attempts, error } = await supabase
      .from('login_attempts')
      .select('id', { count: 'exact' })
      .or(`ip.eq.${ip},email.eq.${email}`)
      .gte('created_at', new Date(Date.now() - WINDOW_MS).toISOString())

    if (error) {
      throw new Error('Erro ao verificar tentativas')
    }

    // Se excedeu o limite, retorna bloqueado
    if (attempts && attempts.length >= MAX_ATTEMPTS) {
      return new Response(
        JSON.stringify({
          allowed: false,
          message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
          retryAfter: BLOCK_MS
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Permite login
    return new Response(
      JSON.stringify({ allowed: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

### 8.5 Session Management

O gerenciamento de sessao implementa timeout por inatividade e verificacao periodica. Este codigo demonstra a implementacao completa.

```javascript
// src/auth/session.js

import { supabase } from '../lib/supabase'
import { toast } from '../lib/toast'

// Timeout: 30 minutos de inatividade
const SESSION_TIMEOUT_MS = 30 * 60 * 1000
let sessionCheckInterval = null
let lastActivityTimestamp = Date.now()

/**
 * Inicia sessao do usuario
 */
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (!error && data?.session) {
    resetActivityTimer()
    startSessionTimeout()
  }

  return { data, error }
}

/**
 * Encerra sessao do usuario
 */
export async function logout() {
  stopSessionTimeout()
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Obtem sessao atual e verifica se nao expirou por inatividade
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()

  if (session) {
    const inactiveTime = Date.now() - lastActivityTimestamp
    if (inactiveTime > SESSION_TIMEOUT_MS) {
      await logout()
      toast.error('Sessao expirada por inatividade. Faca login novamente.')
      return { session: null, error: { message: 'Session expired' } }
    }
  }

  return { session, error }
}

/**
 * Reseta o timer de atividade quando usuario interage
 */
function resetActivityTimer() {
  lastActivityTimestamp = Date.now()
}

/**
 * Inicia verificacao periodica de timeout
 */
function startSessionTimeout() {
  stopSessionTimeout()

  // Monitora atividade do usuario
  const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
  
  activityEvents.forEach(event => {
    window.addEventListener(event, resetActivityTimer, { passive: true })
  })

  // Verifica a cada minuto se o timeout foi atingido
  sessionCheckInterval = setInterval(async () => {
    const inactiveTime = Date.now() - lastActivityTimestamp
    
    if (inactiveTime > SESSION_TIMEOUT_MS) {
      stopSessionTimeout()
      await logout()
      window.location.hash = '#/'
      toast.warning('Sessao expirada por inatividade.')
    }
  }, 60000) // Verifica a cada minuto
}

/**
 * Para verificacao de timeout
 */
function stopSessionTimeout() {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval)
    sessionCheckInterval = null
  }
}

/**
 * Busca perfil do usuario
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}
```

### 8.6 Politica RLS Exemplo

Este e um exemplo de como as politicas RLS sao definidas no banco de dados. Cada politica define quem pode executar qual operacao em quais condicoes.

```sql
-- =====================================================
-- EXEMPLOS DE POLITICAS RLS
-- =====================================================

-- Habilitar RLS em uma tabela
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;

-- Policy: Todos podem visualizar turmas
CREATE POLICY "Everyone can view turmas"
ON turmas FOR SELECT
USING (true);

-- Policy: Apenas admin/secretaria pode inserir/atualizar
CREATE POLICY "Admin/Secretaria can manage turmas"
ON turmas FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.perfil IN ('admin', 'secretaria')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.perfil IN ('admin', 'secretaria')
  )
);

-- Policy: Apenas professor pode gerenciar suas disciplinas
CREATE POLICY "Professor manages own disciplines"
ON disciplinas FOR ALL
USING (
  professor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.perfil IN ('admin', 'secretaria')
  )
)
WITH CHECK (
  professor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.perfil IN ('admin', 'secretaria')
  )
);

-- Policy: Aluno ve apenas seu proprio boletim
CREATE POLICY "Aluno ve proprio boletim"
ON boletim FOR SELECT
USING (
  aluno_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM perfis
    WHERE perfis.id = auth.uid()
    AND perfis.perfil IN ('admin', 'secretaria', 'professor')
  )
);
```

### 8.7 Protecao XSS

O modulo de seguranca fornece funcoes para sanitizar dados antes de inseri-los no HTML, prevenindo ataques XSS.

```javascript
// src/lib/security.js

/**
 * Escapa caracteres especiais HTML para prevenir XSS
 */
export function escapeHTML(str) {
  if (str === null || str === undefined) return ''
  if (typeof str !== 'string') str = String(str)
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Template tag seguro para interpolacao de dados
 * Uso: safeHTML`<div>${userData.nome}</div>`
 */
export function safeHTML(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] !== undefined ? values[i] : ''
    return result + str + escapeHTML(String(value))
  }, '')
}

/**
 * Sanitiza URL para prevenir javascript: injection
 */
export function sanitizeURL(url) {
  if (!url) return '#'
  
  if (url.toLowerCase().trim().startsWith('javascript:')) {
    console.warn('URL bloqueada:', url)
    return '#'
  }
  
  if (url.toLowerCase().trim().startsWith('data:')) {
    console.warn('URL bloqueada:', url)
    return '#'
  }
  
  return url
}

/**
 * Exemplo de uso em uma view
 */
import { escapeHTML, safeHTML } from '../lib/security'

function renderUserList(users) {
  // Forma segura usando template literal
  const html = users.map(user => 
    `<li class="user-item">
      <span class="name">${escapeHTML(user.nome)}</span>
      <span class="email">${escapeHTML(user.email)}</span>
    </li>`
  ).join('')
  
  // Ou usando tagged template
  const html2 = users.map(user => 
    safeHTML`<li>
      <span>${user.nome}</span>
      <span>${user.email}</span>
    </li>`
  ).join('')
  
  return html2
}
```

### 8.6 Validacao com Zod

O sistema utiliza Zod para validacao de dados no frontend, garantindo que dados invalidos sejam rejeitados antes mesmo de serem enviados ao servidor.

```javascript
// src/lib/validation.js

import { z } from 'zod'

/**
 * Schema para validacao de login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail e obrigatorio')
    .email('E-mail invalido'),
  password: z
    .string()
    .min(1, 'Senha e obrigatoria')
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
})

/**
 * Schema para validacao de cadastro
 */
export const signupSchema = z.object({
  nomeCompleto: z
    .string()
    .min(1, 'Nome completo e obrigatorio')
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(200, 'Nome muito longo'),
  email: z
    .string()
    .min(1, 'E-mail e obrigatorio')
    .email('E-mail invalido'),
  cpf: z
    .string()
    .optional()
    .refine(val => !val || validarCPF(val), {
      message: 'CPF invalido'
    }),
  telefone: z
    .string()
    .optional()
    .refine(val => !val || validarTelefone(val), {
      message: 'Telefone invalido'
    }),
  password: z
    .string()
    .min(1, 'Senha e obrigatoria')
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(100, 'Senha muito longa')
    .refine(val => /[A-Za-z]/.test(val), {
      message: 'Senha deve conter pelo menos uma letra'
    })
    .refine(val => /\d/.test(val), {
      message: 'Senha deve conter pelo menos um numero'
    })
})

/**
 * Valida dados e retorna resultado formatado
 */
export function validateData(schema, data) {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error.errors) {
      const errors = error.errors.map(err => err.message)
      return { success: false, errors }
    }
    return { success: false, errors: ['Erro de validacao desconhecido'] }
  }
}

/**
 * Exemplo de uso
 */
function handleLogin(event) {
  event.preventDefault()
  
  const formData = {
    email: emailInput.value,
    password: passwordInput.value
  }
  
  const result = validateData(loginSchema, formData)
  
  if (!result.success) {
    // Exibe erros
    result.errors.forEach(err => toast.error(err))
    return
  }
  
  // Dados validos, prossegue com login
  login(result.data.email, result.data.password)
}
```

## 9. Backup e Disaster Recovery

### 9.1 Estrategia de Backup

O Supabase oferece backups automaticos diarios com retencao de 7 dias no plano gratuito e ate 30 dias no plano Pro. No entanto, e essencial implementar uma estrategia complementar de backup para garantir a recuperacao em caso de falhas criticas.

#### Backup Automatizado via Script

```bash
#!/bin/bash
# backup-db.sh - Script para backup manual do banco de dados

# Configuracoes
SUPABASE_PROJECT_ID="seu_project_id"
SUPABASE_ACCESS_TOKEN="${SUPABASE_ACCESS_TOKEN}"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${DATE}.sql"

mkdir -p ${BACKUP_DIR}

# Backup via Supabase CLI
supabase db dump -f ${BACKUP_FILE} \
  --project-id ${SUPABASE_PROJECT_ID}

# Comprime o backup
gzip ${BACKUP_FILE}

# Mantem apenas ultimos 7 dias de backups
find ${BACKUP_DIR} -name "*.sql.gz" -mtime +7 -delete

echo "Backup concluido: ${BACKUP_FILE}.gz"
```

#### Agendamento de Backups (Cron)

```bash
# Backup diario as 2h da manha
0 2 * * * /path/to/backup-db.sh >> /var/log/db-backup.log 2>&1
```

### 9.2 Disaster Recovery

#### Plano de Recuperacao

| Cenário                             | Tempo Rec. (RTO) | Ponto Rec. (RPO) | Procedimento                    |
| ------------------------------------ | ---------------- | ---------------- | ------------------------------- |
| Corrupcao de dados                  | < 1 hora         | < 24 horas       | Restore de backup SQL          |
| Falha no servidor                   | < 30 minutos     | 0 (Supabase HA)  | Failover automatico            |
| Delete acidental                    | < 2 horas        | < 24 horas       | Restore pontual                |
| Ataque malicioso                    | < 4 horas        | < 7 dias         | Audit log + restore completo   |

#### Procedimento de Restore

```bash
# 1. Identificar o backup mais recente
ls -lt backups/*.sql.gz | head -n 1

# 2. Restaurar banco de dados
gunzip backups/backup_20260408_020000.sql.gz
psql -h db.seu-projeto.supabase.co \
     -U postgres.seu-projeto \
     -d postgres \
     -f backups/backup_20260408_020000.sql

# 3. Validar integridade
SELECT COUNT(*) FROM perfis;
SELECT COUNT(*) FROM turmas;
SELECT COUNT(*) FROM matriculas;
```

## 10. Monitoramento e Logging

### 10.1 Logging de Aplicacao

O sistema implementa logging estruturado em multiplas camadas para facilitar o troubleshooting e auditoria.

#### Frontend Logging

```javascript
// src/lib/logger.js

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
}

const CURRENT_LOG_LEVEL = import.meta.env.DEV 
  ? LOG_LEVELS.DEBUG 
  : LOG_LEVELS.WARN

export const logger = {
  debug: (msg, data) => log(LOG_LEVELS.DEBUG, msg, data),
  info: (msg, data) => log(LOG_LEVELS.INFO, msg, data),
  warn: (msg, data) => log(LOG_LEVELS.WARN, msg, data),
  error: (msg, error) => {
    log(LOG_LEVELS.ERROR, msg, error)
    // Envia para servico de monitoramento (ex: Sentry)
    reportToMonitoring(msg, error)
  }
}

function log(level, message, data) {
  if (level >= CURRENT_LOG_LEVEL) {
    const timestamp = new Date().toISOString()
    const logEntry = {
      timestamp,
      level: Object.keys(LOG_LEVELS)[level],
      message,
      ...(data && { data })
    }
    
    if (level >= LOG_LEVELS.ERROR) {
      console.error(JSON.stringify(logEntry))
    } else {
      console.log(JSON.stringify(logEntry))
    }
  }
}

function reportToMonitoring(message, error) {
  // Integracao com Sentry ou similar
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      tags: { context: message }
    })
  }
}
```

### 10.2 Auditoria de Acoes Criticas

A tabela `audit_log` registra todas as acoes administrativas para fins de compliance e investigacao de incidentes.

```sql
-- Tabela de audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  acao TEXT NOT NULL,
  tabela_afetada TEXT,
  registro_id UUID,
  detalhes JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Apenas admin/secretaria podem visualizar logs
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin/Secretaria veem audit logs"
ON audit_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM perfis p
    WHERE p.id = auth.uid()
    AND p.perfil IN ('admin', 'secretaria')
  )
);

-- Trigger para registrar criacao de usuarios
CREATE OR REPLACE FUNCTION log_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (user_id, acao, tabela_afetada, registro_id, detalhes)
  VALUES (
    auth.uid(),
    'CREATE_USER',
    'perfis',
    NEW.id,
    jsonb_build_object('email', NEW.email, 'perfil', NEW.perfil)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER after_perfis_insert
  AFTER INSERT ON perfis
  FOR EACH ROW
  EXECUTE FUNCTION log_user_creation();
```

### 10.3 Health Checks

Endpoint de health check para monitoramento continuo:

```javascript
// src/lib/health-check.js

import { supabase } from './supabase'

export async function healthCheck() {
  const results = {
    database: false,
    auth: false,
    timestamp: new Date().toISOString()
  }

  try {
    // Verifica conexao com banco
    const { data, error } = await supabase
      .from('perfis')
      .select('id')
      .limit(1)
    
    results.database = !error && data !== null
  } catch (err) {
    console.error('Database health check failed:', err)
  }

  try {
    // Verifica autenticacao
    const { data: { session } } = await supabase.auth.getSession()
    results.auth = session !== null
  } catch (err) {
    console.error('Auth health check failed:', err)
  }

  const overall = results.database && results.auth
  
  return {
    status: overall ? 'healthy' : 'degraded',
    details: results
  }
}

// Executa health check a cada 5 minutos
setInterval(async () => {
  const status = await healthCheck()
  if (status.status === 'degraded') {
    // Notifica administradores
    console.warn('System degradation detected:', status.details)
  }
}, 5 * 60 * 1000)
```

## 11. Testes Automatizados

### 11.1 Estrategia de Testes

O projeto adota uma pirâmide de testes com foco em testes unitarios para servicos e integracao para views:

```
        /\
       /  \  E2E Tests (Cypress) - 10%
      /----\
     /      \ Integration Tests (Vitest) - 20%
    /--------\
   /          \ Unit Tests (Vitest) - 70%
  /------------\
```

### 11.2 Exemplo de Testes Unitarios

```javascript
// tests/unit/security.test.js

import { describe, it, expect } from 'vitest'
import { escapeHTML, sanitizeURL, safeHTML } from '../../src/lib/security'

describe('Security - escapeHTML', () => {
  it('deve escapar tags script', () => {
    const input = '<script>alert("xss")</script>'
    const output = escapeHTML(input)
    expect(output).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
  })

  it('deve escapar aspas simples e duplas', () => {
    const input = 'teste "com" \'aspas\''
    const output = escapeHTML(input)
    expect(output).toBe('teste &quot;com&quot; &#x27;aspas&#x27;')
  })

  it('deve retornar string vazia para null/undefined', () => {
    expect(escapeHTML(null)).toBe('')
    expect(escapeHTML(undefined)).toBe('')
  })

  it('deve converter numeros para string', () => {
    expect(escapeHTML(123)).toBe('123')
  })
})

describe('Security - sanitizeURL', () => {
  it('deve bloquear javascript: URLs', () => {
    expect(sanitizeURL('javascript:alert(1)')).toBe('#')
    expect(sanitizeURL('  JAVASCRIPT:alert(1)')).toBe('#')
  })

  it('deve bloquear data: URLs', () => {
    expect(sanitizeURL('data:text/html,<script>')).toBe('#')
  })

  it('deve permitir URLs validas', () => {
    expect(sanitizeURL('https://example.com')).toBe('https://example.com')
    expect(sanitizeURL('/relative/path')).toBe('/relative/path')
  })
})

describe('Security - safeHTML', () => {
  it('deve escapar valores interpolados', () => {
    const userInput = '<b>negrito</b>'
    const result = safeHTML`<div>${userInput}</div>`
    expect(result).toBe('<div>&lt;b&gt;negrito&lt;/b&gt;</div>')
  })
})
```

### 11.3 Exemplo de Testes de Integracao

```javascript
// tests/integration/academic-service.test.js

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { academicService } from '../../src/lib/academic-service'
import { supabase } from '../../src/lib/supabase'

vi.mock('../../src/lib/supabase')

describe('Academic Service Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve buscar turmas ativas', async () => {
    const mockTurmas = [
      { id: '1', nome: 'Turma A', periodo: 'Manha' },
      { id: '2', nome: 'Turma B', periodo: 'Noite' }
    ]

    supabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: mockTurmas, error: null })
    })

    const result = await academicService.getTurmasAtivas()
    
    expect(result).toEqual(mockTurmas)
    expect(supabase.from).toHaveBeenCalledWith('turmas')
  })

  it('deve lancar erro ao falhar busca', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ 
        data: null, 
        error: new Error('Connection timeout') 
      })
    })

    await expect(academicService.getTurmasAtivas())
      .rejects.toThrow('Connection timeout')
  })

  it('deve validar dados de matricula antes de inserir', async () => {
    const matriculaInvalida = {
      aluno_id: null, // Obrigatorio
      turma_id: '123',
      status_aluno: 'status_invalido'
    }

    await expect(academicService.createMatricula(matriculaInvalida))
      .rejects.toThrow('aluno_id e obrigatorio')
  })
})
```

### 11.4 Executando os Testes

```bash
# Instalar dependencias de teste
npm install -D vitest @testing-library/jsdom

# Executar todos os testes
npm test

# Executar com coverage
npm run test:coverage

# Executar em modo watch (desenvolvimento)
npm run test:watch

# Executar testes especificos
npm test -- security.test.js

# Verificar cobertura minima de 80%
npm run test:coverage -- --coverage.thresholds.statements=80
```

## 12. Otimizacao de Queries e Indexing

### 12.1 Indices Implementados

Para garantir performance em consultas frequentes, o banco de dados possui os seguintes indices:

```sql
-- Indices para chaves estrangeiras (automaticos)
-- perfis_pkey, turmas_pkey, etc.

-- Indices para consultas frequentes
CREATE INDEX idx_perfis_email ON perfis(email);
CREATE INDEX idx_perfis_cpf ON perfis(cpf);
CREATE INDEX idx_perfis_perfil ON perfis(perfil);

CREATE INDEX idx_turmas_curso_id ON turmas(curso_id);
CREATE INDEX idx_turmas_status_ingresso ON turmas(status_ingresso);

CREATE INDEX idx_matriculas_aluno_id ON matriculas(aluno_id);
CREATE INDEX idx_matriculas_turma_id ON matriculas(turma_id);
CREATE INDEX idx_matriculas_status_aluno ON matriculas(status_aluno);

CREATE INDEX idx_disciplinas_turma_id ON disciplinas(turma_id);
CREATE INDEX idx_disciplinas_professor_id ON disciplinas(professor_id);
CREATE INDEX idx_disciplinas_curso_id ON disciplinas(curso_id);

CREATE INDEX idx_aulas_disciplina_id ON aulas(disciplina_id);
CREATE INDEX idx_aulas_professor_id ON aulas(professor_id);
CREATE INDEX idx_aulas_data ON aulas(data DESC);

CREATE INDEX idx_boletim_aluno_id ON boletim(aluno_id);
CREATE INDEX idx_boletim_disciplina_id ON boletim(disciplina_id);

CREATE INDEX idx_solicitacoes_user_id ON solicitacoes(user_id);
CREATE INDEX idx_solicitacoes_status ON solicitacoes(status);

-- Indice para audit log
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
```

### 12.2 Query Optimization

Exemplo de otimizacao de consulta usando EXPLAIN ANALYZE:

```sql
-- ANTES (Sem indice, 2000ms)
SELECT * FROM matriculas m
JOIN perfis p ON p.id = m.aluno_id
WHERE m.turma_id = 'abc-123'
  AND m.status_aluno = 'ativo';

-- EXPLAIN ANALYZE mostra:
-- Seq Scan on matriculas  (cost=0.00..250.00 rows=100 width=32)
--   Filter: ((turma_id = 'abc-123') AND (status_aluno = 'ativo'))

-- DEPOIS (Com indice, 10ms)
CREATE INDEX idx_matriculas_turma_status ON matriculas(turma_id, status_aluno);

-- EXPLAIN ANALYZE agora mostra:
-- Index Scan using idx_matriculas_turma_status on matriculas
--   (cost=0.28..8.30 rows=1 width=32)
--   Index Cond: ((turma_id = 'abc-123') AND (status_aluno = 'ativo'))
```

### 12.3 Praticas de Performance

1. **Evitar SELECT \***: Sempre especificar colunas necessarias
2. **Usar JOINs apropriados**: INNER JOIN ao inves de LEFT JOIN quando possivel
3. **Limitar resultados**: Usar LIMIT para consultas grandes
4. **Pagination**: Implementar cursor-based pagination para listas longas
5. **Connection Pooling**: Supabase gerencia automaticamente, mas evitar conexoes simultaneas excessivas

```javascript
// Exemplo de pagination eficiente
async function getAlunosPaginado(page = 1, limit = 20) {
  const offset = (page - 1) * limit
  
  const { data, error, count } = await supabase
    .from('perfis')
    .select('id, nome_completo, email, perfil', { count: 'exact' })
    .eq('perfil', 'aluno')
    .order('nome_completo')
    .range(offset, offset + limit - 1)
  
  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  }
}
```

## 13. Consideracoes Finais

### 13.1 Limitações e Melhorias Futuras

O sistema atualmente implementa uma arquitetura solida para suas necessidades atuais, mas existem areas que podem ser aprimoradas em versões futuras. A primeira melhoria seria mover toda a logica de criação e gerenciamento de usuarios para Edge Functions, eliminando completamente a necessidade de operações administrativas no cliente. Atualmente, o admin-service.js ainda tenta usar um cliente admin que foi removido por segurança.

Outra melhoria seria implementar testes automatizados com Jest ou Vitest para garantir que novas alterações não Quebrem funcionalidades existentes. O sistema também poderia se beneficiar de uma implementação mais robusta de caching no frontend usando Service Workers para funcionar offline.

### 13.2 Referencias

Abaixo estão as referências técnicas utilizadas no desenvolvimento do sistema.

- Supabase Documentation: <https://supabase.com/docs>
- Vite Configuration: <https://vitejs.dev/config/>
- Zod Validation: <https://zod.dev/>
- PostgreSQL RLS: <https://www.postgresql.org/docs/current/ddl-rowsecurity.html>
- OWASP Security: <https://owasp.org/www-project-web-security-testing-guide/>
- Vitest Testing: <https://vitest.dev/>
- GitHub Actions: <https://docs.github.com/en/actions>
- Deno Deploy Edge Functions: <https://deno.com/deploy>
- Sentry Error Tracking: <https://docs.sentry.io/>

---

Documento atualizado em Abril de 2026.
Sistema de Gestão Escolar - Centro de Saúde Monteiro (CSM)
