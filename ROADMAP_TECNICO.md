# 🚀 Roadmap de Evolução Técnica - SGE CSM

Este documento lista as melhorias de segurança, arquitetura e infraestrutura planejadas para as próximas fases de desenvolvimento.

---

## 🔒 Segurança e Robustez (Prioridade 1)

- [ ] **Migração para Edge Functions**: Mover toda a lógica administrativa (criação de usuários, reset de senhas, exclusões em massa) do front-end para funções de servidor no Supabase. 
    - *Objetivo*: Eliminar o uso da `SERVICE_ROLE_KEY` no navegador.
- [ ] **Auditoria de RLS completa**: Revisar e endurecer as políticas do banco de dados em todas as tabelas.
- [ ] **Ofuscação de Build**: Configurar o Vite para realizar uma ofuscação mais agressiva do código final de produção.
- [ ] **Logs de Auditoria**: Implementar tabela `audit_log` para registrar quem fez o quê e quando (notas, acordos financeiros, resets de senha).

## 🏗️ Infraestrutura e Deploy (Prioridade 2)

- [ ] **Migração para Vercel/Netlify**: Mover a hospedagem do GitHub Pages para uma plataforma que suporte repositórios privados e gerenciamento nativo de Variáveis de Ambiente.
- [ ] **Domínio Próprio**: Configurar o domínio oficial `csm.edu.br` ou similar.
- [ ] **Monitoramento de Erros**: Implementar uma ferramenta como Sentry para capturar erros dos usuários em tempo real.

## 🎨 Experiência do Usuário e Funcionalidades (Prioridade 3)

- [ ] **Módulo Acadêmico Completo**: Diário de classe digital para professores (frequência e conteúdos).
- [ ] **Auto-Matrícula**: Fluxo para novos alunos se inscreverem e anexarem documentos sem intervenção imediata da secretaria.
- [ ] **Notificações Push/WhatsApp**: Avisos automáticos de vencimento financeiro e mensagens da secretaria.
- [ ] **Exportação para Excel**: Botão de exportação em relatórios de alunos e financeiro.
- [ ] **Landing Page do Produto**: Página de apresentação institucional do SGE para venda.

## 📈 Comercialização (Prioridade 4)

- [ ] **Multi-tenancy (school_id)**: Adicionar `school_id` em todas as tabelas para suportar múltiplas escolas.
- [ ] **Painel Super Admin**: Para gerenciar múltiplas instituições clientes.
- [ ] **Refatorar secretaria.js**: Dividir o arquivo de 54KB em módulos menores.
- [ ] **Testes automatizados**: Implementar testes de integração nos fluxos críticos.

---

## ✅ Concluído

### 12/04/2026 — Sessão de Comercialização e Segurança
- [x] **Perfil master_admin** — Nova camada hierárquica exclusiva para proprietário do sistema.
- [x] **Painel de Configurações da Instituição** — Nome, CNPJ, endereço, telefone, cor e upload de logo.
- [x] **PDFService dinâmico** — Cabeçalhos de documentos agora lidos do banco (não mais hard-coded).
- [x] **InstituicaoService** — Service com cache, upload e helper para PDF.
- [x] **Aviso de área restrita** — Banner de segurança na tela de configurações.
- [x] **Diretório de Usuários por perfil** — Lista agrupada: Alunos → Professores → Secretaria → Admin.

### 11/04/2026 — Sessão de Estabilização
- [x] Padronização da Política de Senhas (8+ caracteres, alfanumérica).
- [x] Reset de Senha Administrativo com Troca Obrigatória no primeiro acesso.
- [x] Proteção de contas Admin contra reset por Secretaria.
- [x] Gerador de Termos de Acordo Financeiro em PDF.
- [x] Sidebar e Dashboard com visualização neutra (por perfil).
- [x] Fallback Administrativo direto para evitar bloqueio na criação de usuários.
- [x] Troca de senha pelo próprio usuário na tela "Meus Dados".

---
*Atualizado em 12/04/2026. Revisar periodicamente com a equipe de coordenação e TI.*
