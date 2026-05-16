# 🚀 Guia de Treinamento: SGE 5.0 (Edição Modular)

Este guia destina-se à capacitação da equipe gestora e docente para o uso da nova plataforma modular do Colégio Santa Mônica.

---

## 1. 🏗️ Nova Arquitetura Modular
O sistema foi completamente reestruturado para ser mais rápido e seguro.
- **Abas Independentes**: Cada seção (Notas, Gerenciamento, Solicitações) funciona como um módulo isolado.
- **Estado Persistente**: A navegação entre abas não recarrega a página, mantendo seu trabalho ativo.
- **Design Premium**: Interface otimizada para leitura e produtividade (High Contrast + Modern Typography).

## 2. 👁️ Visão 360° do Aluno
O grande diferencial desta versão é o monitoramento em tempo real via **Badges de Status**:
- **Financeiro**: Identificação imediata de bloqueios ou regularidade.
- **Estágio**: Indicador visual de conclusão de notas de estágio (AP/REP).
- **Documental**: Alerta de pendências de documentos críticos (CPF, Histórico).

## 3. 🔐 Segurança e Blindagem de Dados
Implementamos o **CSM Shield** para garantir a privacidade total:
- **XSS Prevention**: O sistema agora sanitiza automaticamente qualquer dado antes de exibi-lo (Anti-Hack).
- **RLS Enforcement**: O banco de dados bloqueia acessos transversais. Um aluno só consegue "enxergar" suas próprias notas.
- **Admin Isolation**: Operações de criação de usuários e reset de senhas são processadas em ambiente isolado (Edge Functions).

## 4. 📋 Fluxo de Trabalho na Secretaria
1. **Visão Geral**: Use para monitorar o volume de solicitações e estatísticas rápidas.
2. **Notas/Estágio**: Selecione a turma para visualizar as médias e lançar o parecer de estágio.
3. **Gerenciar Alunos**: Central de inteligência. Clique em 👁️ para ver a ficha completa ou ✏️ para ajustes cadastrais.
4. **Solicitações**: Processamento de documentos em lote. O sistema agora gera PDFs sanitizados e seguros.

---

## 💡 Dicas de Ouro para Usuários Master
- **Busca Global**: Na aba de Gerenciar Alunos, você pode buscar por qualquer parte do nome ou CPF.
- **Custom Events**: O sistema agora comunica ações via eventos. Se algo for atualizado, os componentes refletem a mudança instantaneamente.
- **Mobile First**: O sistema foi otimizado para que você possa conferir indicadores pelo celular com a mesma clareza do desktop.

---
*Atualizado em: 16/05/2026*
*Equipe de Desenvolvimento CSM*
