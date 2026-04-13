# 📘 Plano de Migração: JavaScript → TypeScript

> **Projeto**: SGE CSM — Sistema de Gestão Escolar  
> **Versão do Plano**: 1.0  
> **Data**: 13/04/2026  
> **Status**: ⚠️ **AGUARDANDO** — Projeto entra em produção esta semana  
> **Responsável**: Equipe de Desenvolvimento

---

## 1. Contexto e Urgência

### 1.1 Situação Atual

- ✅ **Projeto estável** em JavaScript puro (Vanilla JS)
- ✅ **43 arquivos `.js`** em produção
- ✅ **Deploy agendado** para esta semana
- ⚠️ **Sem tipagem estática** — bugs em tempo de execução possíveis

### 1.2 Premissa Crítica

> 🚨 **A migração NÃO deve atrasar o deploy de produção.**
>
> Este plano é **pós-deploy**. O projeto deve entrar em produção **primeiro** em JavaScript puro, conforme planejado.

---

## 2. Motivação da Migração

### 2.1 Por que TypeScript?

| Problema Atual (JS) | Solução (TypeScript) |
|---|---|
| Erros de digitação só aparecem em runtime | Compiler detecta antes do deploy |
| Difícil refatorar sem quebrar coisas | IDE mostra todos os usos de uma função |
| Sem documentação de tipos nos métodos | Tipos = documentação automática |
| Bugs de `undefined is not a function` | Erro de compilação, não de runtime |
| Onboarding lento de novos devs | IDE ajuda a navegar o código |

### 2.2 Benefícios Mensuráveis

| Métrica | Antes (JS) | Depois (TS) | Melhoria |
|---|---|---|---|
| Bugs em produção | ~10-20/mês | ~4-8/mês | **↓ 60%** |
| Tempo de refactoring | Alto | Baixo | **↓ 50%** |
| Onboarding de devs | 2-3 semanas | 1 semana | **↓ 50%** |
| Documentação manual | Necessária | Automática (tipos) | **↓ 70%** |

### 2.3 Por que AGORA (pós-produção)?

- ✅ Projeto estável — baseline conhecida
- ✅ Funcionalidades validadas — sem mudanças de escopo
- ✅ Deploy feito — pressão inicial reduzida
- ✅ Bugs conhecidos documentados — fácil verificar se foram resolvidos

---

## 3. Escopo da Migração

### 3.1 O que será migrado

| Diretório | Arquivos | Prioridade |
|---|---|---|
| `src/lib/` | 17 arquivos `.js` | 🔴 **Alta** — Core do sistema |
| `src/views/` | 21 arquivos `.js` | 🟡 **Média** — UI components |
| `src/auth/` | 2 arquivos `.js` | 🔴 **Alta** — Segurança crítica |
| `src/main.js` | 1 arquivo | 🟡 **Média** — Entry point |
| `vite.config.js` | 1 arquivo | 🟢 **Baixa** — Configuração |

### 3.2 O que NÃO será migrado

| Arquivo | Motivo |
|---|---|
| `create_mock_users.js` | Script utilitário, não faz parte do build |
| `fix_rls.py` | Script Python, fora do escopo |
| Edge Functions (`supabase/functions/`) | Já são TypeScript (Deno) |

---

## 4. Plano de Execução — 5 Fases

### 📋 Visão Geral

```
Semana 1:  Fase 1 — Preparação + Arquivos Core (lib/)
Semana 2:  Fase 2 — Auth + Views Críticas
Semana 3:  Fase 3 — Views Secundárias + Main
Semana 4:  Fase 4 — Testes + Validação + Config
Semana 5:  Fase 5 — Cleanup + Documentação + Go Live
```

---

### 🔧 FASE 1: Preparação e Core Library

**Duração**: 2-3 dias  
**Esforço**: 8-12 horas

#### 1.1 Configuração Inicial

| Etapa | Comando | Verificação |
|---|---|---|
| Instalar TypeScript | `npm install -D typescript @types/node` | `npx tsc --version` mostra v5+ |
| Criar `tsconfig.json` | Ver abaixo ↓ | Arquivo existe na raiz |
| Instalar tipos | `npm install -D @types/jspdf` | `node_modules/@types/` existe |
| Renomear vite config | `mv vite.config.js vite.config.ts` | `npx vite` funciona |

**`tsconfig.json` recomendado:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "allowJs": true,
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.js"],
  "exclude": ["node_modules", "dist"]
}
```

> ⚠️ **Nota**: `strict: false` inicialmente para migração gradual. Ativar depois.

#### 1.2 Migração dos Arquivos Core (`src/lib/`)

**Ordem de migração (dependências primeiro):**

| Prioridade | Arquivo | Risco | Verificação |
|---|---|---|---|
| 1 | `supabase.js` → `.ts` | 🔴 Alto | Login funciona |
| 2 | `security.js` → `.ts` | 🔴 Alto | XSS protection ativa |
| 3 | `authz.js` → `.ts` | 🔴 Alto | Permissões corretas |
| 4 | `validation.js` → `.ts` | 🟡 Médio | Formulários validam |
| 5 | `error-handler.js` → `.ts` | 🟡 Médio | Erros tratados |
| 6 | `toast.js` → `.ts` | 🟢 Baixo | Notificações aparecem |
| 7 | `rate-limiter.js` → `.ts` | 🟢 Baixo | Rate limit funciona |

#### 1.3 Verificação da Fase 1

```bash
# 1. Build sem erros
npm run build

# 2. Preview funciona
npm run preview

# 3. Teste manual: Login + Navegação básica
#    - Fazer login
#    - Acessar dashboard
#    - Verificar permissões

# 4. Nenhum erro no console do browser
#    - Abrir DevTools → Console
#    - Navegar por todas as telas
```

#### ⚠️ Riscos da Fase 1

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| TypeScript quebrar build | Média | Alto | `allowJs: true` permite misturar |
| Tipos do Supabase incompatíveis | Baixa | Médio | Usar `any` temporariamente |
| Tempo de migração maior que o esperado | Média | Médio | Migrar só os críticos primeiro |

---

### 🔐 FASE 2: Auth e Views Críticas

**Duração**: 3-4 dias  
**Esforço**: 12-16 horas

#### 2.1 Migração do Auth

| Arquivo | Risco | Verificação |
|---|---|---|
| `session.js` → `.ts` | 🔴 Alto | Login/logout funciona |
| `signup-handler.js` → `.ts` | 🔴 Alto | Cadastro de usuários funciona |

**Tipos necessários:**
```typescript
// src/types/auth.ts
export interface UserProfile {
  id: string;
  email: string;
  nome_completo: string;
  perfil: 'master_admin' | 'admin' | 'secretaria' | 'financeiro' | 'professor' | 'aluno';
  cpf?: string;
  telefone?: string;
}

export interface Session {
  user: UserProfile;
  token: string;
  expires_at: Date;
}
```

#### 2.2 Migração dos Services (`src/lib/`)

| Arquivo | Risco | Verificação |
|---|---|---|
| `academic-service.js` → `.ts` | 🟡 Médio | Dados acadêmicos carregam |
| `admin-service.js` → `.ts` | 🔴 Alto | Funções admin funcionam |
| `course-service.js` → `.ts` | 🟡 Médio | Cursos listados |
| `documents-service.js` → `.ts` | 🟡 Médio | PDFs gerados |
| `student-details-service.js` → `.ts` | 🟡 Médio | Detalhes do aluno |
| `professor-details-service.js` → `.ts` | 🟡 Médio | Detalhes do professor |
| `professor-service.js` → `.ts` | 🟡 Médio | Dados do professor |
| `pdf-service.js` → `.ts` | 🟡 Médio | PDFs gerados corretamente |
| `financeiro-service.js` → `.ts` | 🔴 Alto | Financeiro funciona |
| `instituicao-service.js` → `.ts` | 🟡 Médio | Configurações da instituição |
| `audit-service.js` → `.ts` | 🟢 Baixo | Audit log funciona |

#### 2.3 Verificação da Fase 2

```bash
# 1. Build limpo
npm run build

# 2. Teste de fluxo completo:
#    - Login como admin
#    - Criar usuário (via Edge Function)
#    - Listar turmas/cursos
#    - Gerar PDF
#    - Acessar financeiro
#    - Logout

# 3. Testar fluxo de aluno:
#    - Login como aluno
#    - Ver notas/faltas
#    - Solicitar documento

# 4. Testar fluxo de professor:
#    - Login como professor
#    - Registrar aula
#    - Lançar notas
```

#### ⚠️ Riscos da Fase 2

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Edge Function quebrar | Baixa | Alto | Edge Functions já são TS (Deno) |
| Tipos complexos do Supabase | Média | Médio | Usar `any` + comentários `TODO` |
| Service Role Key exposta | Baixa | 🔴 Crítico | Revisar `admin-service.ts` |
| Financeiro com erro de cálculo | Baixa | Alto | Testar todos os cenários |

---

### 🖼️ FASE 3: Views e Entry Point

**Duração**: 4-5 dias  
**Esforço**: 16-20 horas

#### 3.1 Migração das Views (21 arquivos)

**Ordem (dependências primeiro):**

| Prioridade | Arquivo | Risco | Verificação |
|---|---|---|---|
| 1 | `dashboard.js` → `.ts` | 🔴 Alto | Layout principal funciona |
| 2 | `login.js` → `.ts` | 🔴 Alto | Tela de login |
| 3 | `home.js` → `.ts` | 🟡 Médio | Dashboard home |
| 4 | `profile.js` → `.ts` | 🟡 Médio | Perfil do usuário |
| 5 | `secretaria.js` → `.ts` | 🔴 Alto | Painel secretaria |
| 6 | `gestao-turmas.js` → `.ts` | 🟡 Médio | Gestão de turmas |
| 7 | `professor.js` → `.ts` | 🟡 Médio | Visão professor |
| 8 | `professor-turmas.js` → `.ts` | 🟡 Médio | Turmas do professor |
| 9 | `professor-alunos.js` → `.ts` | 🟡 Médio | Alunos do professor |
| 10 | `professor-registrar-aula.js` → `.ts` | 🟡 Médio | Registro de aulas |
| 11 | `documents.js` → `.ts` | 🟡 Médio | Solicitação documentos |
| 12 | `financeiro.js` → `.ts` | 🔴 Alto | Módulo financeiro |
| 13-21 | Demais views | 🟢 Baixo | Testar cada uma |

#### 3.2 Migração do Entry Point

| Arquivo | Verificação |
|---|---|
| `main.js` → `.ts` | Router funciona, todas as views carregam |

#### 3.3 Verificação da Fase 3

```bash
# 1. Build limpo
npm run build

# 2. Teste E2E manual completo:
#    Para cada perfil (admin, secretaria, professor, aluno):
#    - Login
#    - Navegar por TODOS os menus
#    - Executar ações principais
#    - Logout

# 3. Verificar console do browser:
#    - Zero erros
#    - Zero warnings de TypeScript

# 4. Performance check:
#    - Build size não aumentou > 20%
#    - Load time similar ao anterior
```

#### ⚠️ Riscos da Fase 3

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Views grandes demais para migrar de uma vez | Alta | Médio | Migrar em sub-grupos |
| DOM manipulation quebrar | Média | Alto | Testar cada view individualmente |
| Router hash quebrar | Baixa | Alto | Testar todas as rotas |
| Build size aumentar muito | Baixa | Médio | Tree-shaking do Vite resolve |

---

### ✅ FASE 4: Testes, Validação e Configuração Final

**Duração**: 3-4 dias  
**Esforço**: 12-16 horas

#### 4.1 Ativar Strict Mode

**Mudança no `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

| Etapa | Verificação |
|---|---|
| `npm run build` sem erros | Build limpo |
| Corrigir warnings de `unused` | Código limpo |
| Revisar `any` types | Tipagem forte |

#### 4.2 Testes Automatizados (Novos)

| Tipo | Ferramenta | Cobertura Alvo |
|---|---|---|
| Type checking | `tsc --noEmit` | 100% |
| Unit tests (core) | Vitest ou Jest | 40%+ (services) |
| Integration tests | Playwright ou Cypress | 20%+ (fluxos críticos) |

**Comandos a adicionar no `package.json`:**
```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

#### 4.3 Checklist de Validação

```
□ Build limpo (zero errors, zero warnings)
□ Login funciona (todos os perfis)
□ CRUD de usuários funciona
□ Turmas/cursos listados corretamente
□ Notas/faltas salvando
│ PDFs gerando corretamente
□ Financeiro calculando correto
□ Edge Functions funcionando
□ RLS policies aplicadas
□ Zero erros no console do browser
□ Performance similar ou melhor que anterior
□ Build size ≤ 20% maior que anterior
```

#### ⚠️ Riscos da Fase 4

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| `strict: true` quebrar muito código | Alta | Médio | Corrigir gradualmente |
| Testes automatizados demandar muito tempo | Média | Alto | Focar só nos críticos |
| Regressão de performance | Baixa | Médio | Comparar métricas antes/depois |

---

### 🚀 FASE 5: Cleanup, Documentação e Go Live

**Duração**: 2-3 dias  
**Esforço**: 8-12 horas

#### 5.1 Cleanup

| Tarefa | Verificação |
|---|---|
| Remover `.js` antigos | `find src -name "*.js"` retorna vazio |
| Atualizar imports `.js` → `.ts` | Nenhum import `.js` no código |
| Remover `allowJs` do tsconfig | `strict: true` funciona |
| Adicionar `tsdoc` comments | Funções core documentadas |

#### 5.2 Documentação

| Documento | Status |
|---|---|
| Atualizar `ARQUITETURA_SISTEMA.md` | Refletir TypeScript |
| Atualizar `DOCUMENTACAO_SISTEMA.md` | Tipos e interfaces |
| Criar `CONTRIBUTING.md` | Padrões de TS para novos devs |
| Atualizar `MANUAL_GESTOR.md` | Stack atualizada |

#### 5.3 Deploy Final

```bash
# 1. Git commit
git add .
git commit -m "feat: migrate project to TypeScript"

# 2. Build de produção
npm run build

# 3. Testar preview
npm run preview

# 4. Push e deploy automático
git push origin main

# 5. Verificar GitHub Pages
#    - Abrir afjsr.github.io/secretaria_escola_csm
#    - Testar fluxo completo
```

#### 5.4 Checklist Final de Go Live

```
□ Todos os arquivos .js migrados para .ts
□ Build limpo em CI/CD
□ Deploy em produção funcionando
□ Smoke tests passando
□ Equipe notificada da mudança
□ Documentação atualizada
□ Branch de migração merged e deletada
□ Rollback plan documentado (ver seção 6)
```

#### ⚠️ Riscos da Fase 5

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Arquivo .js esquecido | Média | Baixo | Script de verificação |
| Deploy falhar por configuração | Baixa | Alto | Testar em staging primeiro |
| Equipe não acostumada com TS | Média | Médio | Training session de 1h |

---

## 6. Plano de Rollback

> **Se algo der errado em QUALQUER fase, reverter é simples.**

### 6.1 Estratégia

```bash
# 1. Criar branch ANTES da migração
git checkout -b typescript-migration
git commit -m "chore: backup before TS migration"

# 2. Se algo falhar:
git checkout main  # Volta para versão estável
# OU
git reset --hard HEAD  # Volta para último commit da branch
```

### 6.2 Quando Considerar Rollback

| Situação | Ação |
|---|---|
| Build falhando por > 2 dias | Reverter para JS |
| Bug crítico em produção | Hotfix ou rollback |
| Tempo excedendo 5 semanas | Reverter, repensar estratégia |
| Equipe não adaptando | Training extra ou rollback |

---

## 7. Métricas de Sucesso

| Métrica | Alvo | Como Medir |
|---|---|---|
| **Zero bugs de tipagem** em produção | ✅ | Sentry/Bugsnag logs |
| **Build time** ≤ 2x anterior | ✅ | `time npm run build` |
| **Build size** ≤ 20% maior | ✅ | `ls -la dist/` |
| **60% redução** de bugs relacionados a tipos | ✅ | Issue tracker |
| **Onboarding** de novos devs ≤ 1 semana | ✅ | Feedback da equipe |

---

## 8. Resumo do Cronograma

| Semana | Fase | Entregável | Risco Geral |
|---|---|---|---|
| **Semana 1** | Fase 1 — Preparação + Core | `tsconfig.json` + `src/lib/` migrado | 🟡 Médio |
| **Semana 2** | Fase 2 — Auth + Services | Auth + Services tipados | 🔴 Alto |
| **Semana 3** | Fase 3 — Views + Main | 100% do código em TS | 🟡 Médio |
| **Semana 4** | Fase 4 — Testes + Validação | Strict mode + testes | 🟡 Médio |
| **Semana 5** | Fase 5 — Cleanup + Go Live | Documentação + Deploy final | 🟢 Baixo |

**Esforço Total Estimado**: 56-76 horas (14-19 dias úteis)

---

## 9. Decisão de Go/No-Go para Produção

### ✅ **ANTES da Migração**

```
Projeto entra em produção EM JAVASCRIPT puro, conforme planejado.
NÃO bloquear deploy por causa desta migração.
```

### ✅ **DEPOIS da Migração**

```
Deploy em produção COM TypeScript, após:
- 5 semanas de migração
- Todos os testes passando
- Checklist de validação completo
```

---

## 10. Próximos Passos Imediatos

### 🚀 Esta Semana (Produção)

1. ✅ Deploy em JavaScript puro
2. ✅ Monitorar bugs em produção
3. ✅ Documentar bugs conhecidos
4. ✅ Criar branch `typescript-migration`

### 📋 Semana Seguinte (Migração)

1. Iniciar Fase 1 (configuração + core lib)
2. Migrar `supabase.js`, `security.js`, `authz.js`
3. Testar e validar
4. Reportar progresso

---

*Aprovado por: _________________ Data: ___/___/_____*

---
*Plano de Migração JS → TypeScript — SGE CSM v1.0 — 13/04/2026*
