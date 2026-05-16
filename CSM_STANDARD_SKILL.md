# 🎯 CSM Standard Skill: Manual de Excelência Técnica e Visual

Este documento define as diretrizes obrigatórias para o desenvolvimento de software no ecossistema do Colégio Santa Mônica (CSM). Qualquer agente de IA ou desenvolvedor deve seguir estes padrões para garantir consistência, segurança e qualidade premium.

---

## 1. 🏗️ Arquitetura e Estrutura de Código
- **Modularização Obrigatória**: Interfaces complexas devem ser decompostas em componentes menores (ex: `src/components/Tabs/`).
- **Orquestradores Leves**: Views principais (ex: `secretaria.ts`) devem atuar apenas como maestros, injetando componentes e gerenciando o estado global.
- **Single Source of Truth**: Funções de lógica de negócio (cálculos, validações) devem residir em `src/lib/` e ser exportadas para uso em componentes e testes.

## 2. 🎨 Design System Premium (Visual Wow)
- **Design Tokens**: Uso obrigatório de variáveis CSS para:
  - `--radius-lg`: 12px a 16px (suavidade).
  - `--shadow-md/lg`: Profundidade e elevação.
  - `--primary`: Vermelho CSM (#C41E3A).
  - `--accent`: Amarelo Ouro (#FFD700).
- **Aesthetics**: Proibido o uso de cores genéricas ou layouts "secos". Use gradientes sutis e fundos em camadas.
- **Micro-interações**: Hover effects em botões e cards são obrigatórios para feedback de interatividade.
- **Ícones e Emojis**: Use ícones (SVG) ou emojis contextuais para facilitar a leitura rápida da interface.

## 3. 📊 UX Orientada a Dados
- **Dashboard Overview**: Todo sistema administrativo deve iniciar com uma aba de "Visão Geral" contendo KPIs (Key Performance Indicators).
- **Visão 360°**: Status multidimensionais (ex: Financeiro + Acadêmico + Documental) devem ser visíveis na listagem principal através de badges coloridos.
- **Ações Rápidas**: Operações comuns devem ser acessíveis via ícones de ação direta na tabela, evitando múltiplos cliques.

## 4. 🛡️ Segurança e Integridade
- **XSS Prevention**: Todos os dados vindos da API devem ser processados via `escapeHTML` antes da inserção no DOM.
- **Validação de Negócio**: Regras críticas (ex: elegibilidade de estágio) devem ser implementadas no código e sinalizadas visualmente com bloqueios proativos (Ex: ícone ⚠️).

## 5. 🧪 Garantia de Qualidade (Testes)
- **Real Code Validation**: Testes devem importar funções do código fonte. Proibido declarar funções "dummy" ou cópias dentro dos arquivos `.test.ts`.
- **Regression Ready**: Toda refatoração deve ser acompanhada pela execução de `npm run build` e suíte de testes unitários.

## 6. 📖 Documentação e Treinamento
- **Manual do Usuário (v5.0+)**: Documentação detalhada e modularizada por perfil de acesso.
- **Guia de Treinamento Rápido**: Documento focado no "Como Fazer" (Workflow) para novos usuários da equipe.

---

*Assinado: Equipe de Desenvolvimento CSM - Maio 2026*