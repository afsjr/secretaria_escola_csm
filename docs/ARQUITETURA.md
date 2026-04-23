# Arquitetura do Sistema de Gestão Escolar - CSM

## 1. Visão Geral

O SGE-CSM é uma aplicação web SPA (Single Page Application) para gestão escolar técnica do Centro de Saúde Monteiro.

### 1.1 Tecnologias

- **Frontend**: Vanilla JavaScript + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Deploy**: Vercel / GitHub Pages
- **Testes**: Vitest

### 1.2 Estrutura de Arquivos

```
src/
├── auth/          # Autenticação (session, signup-handler)
├── lib/           # Services (admin, academic, professor, etc.)
├── views/         # Páginas (login, dashboard, secretaria, etc.)
├── components/    # Componentes reutilizáveis
├── types/         # Definições TypeScript
├── styles/        # CSS global
└── main.ts        # Entry point + Router
```

## 2. Segurança

### 2.1 Camadas de Proteção

| Camada | Implementação |
|--------|---------------|
| Autenticação | Supabase Auth (JWT) |
| Autorização | RBAC por perfil |
| Banco | Row Level Security (RLS) |
| API | Edge Functions para operações privilegiadas |
| Frontend | XSS sanitization, rate limiting |

### 2.2 Perfis de Acesso

- `master_admin` - Proprietário do sistema
- `admin` - Administrador completo
- `secretaria` - Gestão operacional
- `coordenacao` - Coordenação pedagógica
- `professor` - Docente
- `aluno` - Estudante

### 2.3 Edge Functions

| Função | Descrição |
|--------|-----------|
| `admin-create-user` | Criar usuários (apenas admin/secretaria) |
| `admin-reset-password` | Resetar senhas (apenas admin/secretaria) |

## 3. Banco de Dados

### 3.1 Tabelas Principais

- `perfis` - Usuários do sistema
- `cursos` - Cursos oferecidos
- `turmas` - Turmas por curso
- `disciplinas` - Disciplinas vinculadas a turmas
- `matriculas` - Matrículas de alunos
- `aulas` - Aulas registradas pelos professores
- `boletim` - Notas e faltas

### 3.2 RLS Políticas

- **Leitura**: Usuários autenticados
- **Escrita**: Apenas admin/secretaria/coordenacao

## 4. Fluxos Principais

### 4.1 Login
1. Usuário informa email/senha
2. Supabase Auth valida credenciais
3. Session criada com token JWT
4. Redirecionamento para dashboard conforme perfil

### 4.2 Primeiro Acesso
1. Admin reset senha para padrão `csm1983#`
2. Usuário Força mudança de senha
3. SessionStorage marca como trocada
4. Redireciona para dashboard

### 4.3 Reset de Senha via Email
1. Usuário solicita "Esqueci a senha"
2. Supabase envia email com link
3. Token processado via setSession()
4. Usuário define nova senha

## 5. Deploy

### 5.1 Produção
- **Vercel**: https://sistemacsm.vercel.app
- **GitHub Pages**: https://afsjr.github.io/secretaria_escola_csm/

### 5.2 Variáveis de Ambiente
```
VITE_SUPABASE_URL=cfybsocrydeziibonvbd.supabase.co
VITE_SUPABASE_ANON_KEY=...
```

## 6. Testes

- **192 testes** passando com Vitest
- Cobertura: services, utils, autenticação

---

*Última atualização: Abril 2026*