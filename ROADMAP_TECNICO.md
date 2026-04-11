# 🚀 Roadmap de Evolução Técnica - SGE CSM

Este documento lista as melhorias de segurança, arquitetura e infraestrutura planejadas para as próximas fases de desenvolvimento.

---

## 🔒 Segurança e Robustez (Prioridade 1)

- [ ] **Migração para Edge Functions**: Mover toda a lógica administrativa (criação de usuários, reset de senhas, exclusões em massa) do front-end para funções de servidor no Supabase. 
    - *Objetivo*: Eliminar o uso da `SERVICE_ROLE_KEY` no navegador.
- [ ] **Auditoria de RLS (Row Level Security)**: Revisar e endurecer as políticas do banco de dados para garantir que um perfil não acesse dados de outro sem autorização.
- [ ] **Ofuscação de Build**: Configurar o Vite para realizar uma ofuscação mais agressiva do código final de produção.

## 🏗️ Infraestrutura e Deploy (Prioridade 2)

- [ ] **Migração para Vercel/Netlify**: Mover a hospedagem do GitHub Pages para uma plataforma que suporte repositórios privados e gerenciamento nativo de Variáveis de Ambiente.
- [ ] **Domínio Próprio**: Configurar o domínio oficial `csm.edu.br` ou similar.
- [ ] **Monitoramento de Erros**: Implementar uma ferramenta como Sentry para capturar erros dos usuários em tempo real.

## 🎨 Experiência do Usuário e Funcionalidades (Prioridade 3)

- [ ] **Módulo Acadêmico Completo**: Diário de classe digital para professores (frequência e conteúdos).
- [ ] **Auto-Matrícula**: Fluxo para novos alunos se inscreverem e anexarem documentos sem intervenção imediata da secretaria.
- [ ] **Notificações Push/WhatsApp**: Avisos automáticos de vencimento financeiro e mensagens da secretaria.

---

## ✅ Concluído Recentemente

- [x] Padronização da Política de Senhas (8+ caracteres, alfanumérica).
- [x] Reset de Senha Administrativo com Troca Obrigatória no primeiro acesso.
- [x] Gerador de Termos de Acordo Financeiro em PDF.
- [x] Sidebar e Dashboard com visualização neutra (por perfil).
- [x] Fallback Administrativo direto para evitar bloqueio na criação de usuários.

---
*Este documento deve ser atualizado periodicamente em conjunto com a equipe de coordenação e TI.*
