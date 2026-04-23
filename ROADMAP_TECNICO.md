# 🚀 Roadmap de Evolução Técnica - SGE CSM

Este documento lista as melhorias de segurança, arquitetura e infraestrutura planejadas para as próximas fases de desenvolvimento.

---

## 🔒 Segurança e Robustez (Prioridade 1)

- [x] **Migração para Edge Functions**: Criadas admin-create-user e admin-reset-password
- [x] **Auditoria de RLS completa**: Políticas configuradas para disciplinas, turmas, cursos, aulas
- [x] **Ofuscação de Build**: Múltiplas passagens de compressão, remoção de código morto
- [x] **Logs de Auditoria**: Tabela audit_log para registrar ações sensíveis
- [x] **Reset de Senha via Edge Function**: Admin pode resetar senhas com segurança

## 🏗️ Infraestrutura e Deploy (Prioridade 2)

- [x] **Deploy no Vercel**: Hospedagem configurada e funcionando
- [ ] **Domínio Próprio**: Configurar csm.edu.br (futuro)
- [ ] **Monitoramento de Erros**: Implementar Sentry (futuro)

## 🎨 Experiência do Usuário e Funcionalidades (Prioridade 3)

- [x] **Diário de Classe**: Registro de aulas pelos professores
- [x] **Exportação para Excel**: Múltiplas abas e exportações por módulo
- [x] **Sistema de Primeiro Acesso**: Forced password change com sessionStorage
- [x] **Recovery de Senha via Email**: Fluxo completo implementado
- [ ] **Notificações Push/WhatsApp**: Futuro

## 📈 Comercialização (Prioridade 4)

- [ ] **Multi-tenancy (school_id)**: Adicionar em todas as tabelas
- [ ] **Painel Super Admin**: Gerenciar múltiplas instituições
- [x] **Refatoração TypeScript**: 100% do código migrado
- [x] **Testes automatizados**: 192 testes com Vitest

---

## ✅ Concluído Recentemente (Abril 2026)

### 23/04/2026 — Sessão de Correções e Segurança
- [x] **Edge Functions**: admin-create-user e admin-reset-password deployadas
- [x] **RLS Corrigido**: Políticas para disciplinas, turmas, aulas, cursos
- [x] **Fluxo Primeiro Acesso**: Correção com sessionStorage
- [x] **Reset de Senha**: Via Edge Function (sem expor Service Role Key)

### 12/04/2026 — Sessão de Comercialização e Segurança
- [x] Perfil master_admin — Nova camada hierárquica exclusiva
- [x] Painel de Configurações da Instituição
- [x] PDFService dinâmico — Cabeçalhos do banco
- [x] InstituicaoService — Service com cache e upload
- [x] Diretório de Usuários por perfil

### 11/04/2026 — Sessão de Estabilização
- [x] Política de Senhas (8+ caracteres, alfanumérica)
- [x] Reset de Senha Administrativo com Troca Obrigatória
- [x] Proteção de contas Admin contra reset por Secretaria
- [x] Gerador de Termos de Acordo Financeiro em PDF
- [x] Sidebar e Dashboard com visualização neutra
- [x] Fallback Administrativo para criação de usuários
- [x] Troca de senha pelo próprio usuário

---

## 📊 Status do Projeto

- **Testes**: 192 passando
- **TypeScript**: 100% migrado
- **Deploy**: Vercel + GitHub Pages
- **Segurança**: RLS + Edge Functions

---

*Atualizado em 23/04/2026*