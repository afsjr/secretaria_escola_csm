# 💎 Standard Skill: Padrão de Engenharia e Design CSM

Este documento define as melhores práticas e padrões arquiteturais estabelecidos durante o desenvolvimento do SGE CSM (Sistema de Gestão Escolar). Utilize estas diretrizes para manter a consistência em todos os projetos do ecossistema.

---

## 🎨 1. Estética e Design (Premium UX)
- **Paleta de Cores**: Usar contrastes profundos. Preferência por `#C41E3A` (Vermelho Institucional), tons de cinza escuro para componentes e branco puro para texto sobre fundo escuro.
- **Micro-animações**: Sempre implementar `animate-in` nas transições de visualização.
- **Feedback Visual**: Uso obrigatório do `toast` para qualquer ação assíncrona (sucesso/erro).
- **Glassmorphism**: Modais devem usar `backdrop-filter: blur(5px)` e fundos semi-transparentes.

## 🔐 2. Segurança e Autenticação
- **Política de Senhas**: Mínimo 8 caracteres, obrigatório conter letras e números.
- **Primeiro Acesso**: Sempre implementar a flag `force_password_change`. Bloquear o sistema até que o usuário defina uma senha pessoal.
- **Proteção Admin**: Nunca permitir que usuários de nível inferior (Secretaria/Staff) alterem ou resetem credenciais de nível superior (Admin).
- **Gestão de Chaves**: Jamais commitar arquivos `.env`. Usar `.gitignore` rigorosamente.

## 🏗️ 3. Arquitetura de Código (Pattern)
- **Service Layer**: Toda interação com Banco de Dados/API deve estar em arquivos `*-service.js` (Ex: `AdminService`, `FinanceiroService`). Nunca chamar o Supabase diretamente de dentro da View.
- **View Pattern**: Views devem ser funções assíncronas que retornam um elemento `DOM` (container), facilitando o carregamento dinâmico sem reloads de página.
- **Fallback Administrativo**: Em sistemas baseados em Supabase, sempre prever um `supabaseAdmin` (Service Role) isolado para ações que o usuário comum não tem permissão de realizar via RLS.

## 📄 4. Geração de Documentos
- **PDFService**: Centralizar geradores de PDF usando `jsPDF` e `autoTable`.
- **Branding**: Documentos devem ter cabeçalho institucional e rodapé de autenticidade (gerado eletronicamente).

## 📊 5. Gestão de Projeto
- **ROADMAP_TECNICO.md**: Manter um backlog ativo na raiz do projeto para separar melhorias imediatas de débitos técnicos.
- **Backlog First**: Questionar sempre o custo-benefício de novas melhorias antes da implementação.

---
*Este manual é uma "Skill" para o assistente de IA. Ao carregar este arquivo, a IA deve priorizar estes padrões sobre qualquer sugestão genérica.*
