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
- **Service Layer**: Toda interação com Banco de Dados/API deve estar em arquivos `*-service.ts` (Ex: `AdminService`, `FinanceiroService`). Nunca chamar o Supabase diretamente de dentro da View.
- **View Pattern**: Views devem ser funções assíncronas que retornam um elemento `DOM` (container), facilitando o carregamento dinâmico sem reloads de página.
- **Fallback Administrativo**: Em sistemas baseados em Supabase, sempre prever um `supabaseAdmin` (Service Role) isolado para ações que o usuário comum não tem permissão de realizar via RLS.

## 📄 4. Geração de Documentos
- **PDFService**: Centralizar geradores de PDF usando `jspdf` e `jspdf-autotable`.
- **Branding**: Documentos devem ter cabeçalho institucional e rodapé de autenticidade (gerado eletronicamente).
- **Segurança em PDFs**:
  - **Mascaramento de CPF**: Sempre mascarar CPF com `***.444.777-**` (mostrar apenas 3° e 4° blocos).
  - **Marca d'água**: Adicionar "CÓPIA" em diagonal para documentos emitidos eletronicamente.
  - **Dados Sensíveis**: Nunca expor dados pessoais (CPF, RG, conta bancária) em texto claro.

## 🧪 5. Testes Automatizados
- **Framework**: Usar `vitest` para todos os testes.
- **Testes de Unidade**: Funções puras (cálculos, validações) DEVEM ter testes.
- **Nomenclatura**: Arquivos de teste em `*.test.ts` no mesmo diretório.
- **Cobertura Crítica**: Priorizar testes de:
  - Cálculo de notas e médias (`arredondarNota`, `calcularMediaParcial`)
  - Validação de dados (`validarCPF`, `validarTelefone`)
  - Regras de negócio
- **Mockar Dependências**: Services que usam Supabase devem ser mockados usando `vi.mock()`.

## ✅ 6. Validação de Dados
- **Schemas**: Usar `zod` para validação de inputs de formulários.
- **Funções Puras**: Implementar validadores como funções independentes:
  - `validarCPF(cpf: string): boolean` - Algoritmo brasileiro
  - `validarTelefone(telefone: string): boolean` - Formatos brasileiros
- **Retorno Padrão**: Validadores devem retornar `{ success: boolean, errors?: string[] }` ou booleano.
- **Feedback Imediato**: Mostrar erros de validação antes de enviar ao servidor.

## 📡 7. Padrão de Resposta API
- **Formato**: Toda função de serviço deve retornar `{ data: T, error: { message: string } | null }`
- **Nomenclatura**: Usar snake_case em todas as interações com banco/APIs.
- **Tratamento de Erros**: Sempre verificar `error` antes de usar `data`.
- **Tipagem**: Definir interfaces para todas as respostas.

## 📊 8. Gestão de Projeto
- **ROADMAP_TECNICO.md**: Manter um backlog ativo na raiz do projeto para separar melhorias imediatas de débitos técnicos.
- **Backlog First**: Questionar sempre o custo-benefício de novas melhorias antes da implementação.
- **Testes Antes de Bug Fix**: Antes de corrigir, primeiro reproduzir com teste.

---

## 🔄 Padrão de Commits (Conventional Commits)

```
feat:     nova funcionalidade
fix:      correção de bug
docs:     documentação
test:     testes (novos ou corrigidos)
refactor: refatoração sem mudança de comportamento
security: correção de segurança
```

---

*Este manual é uma "Skill" para o assistente de IA. Ao carregar este arquivo, a IA deve priorizar estes padrões sobre qualquer sugestão genérica.*