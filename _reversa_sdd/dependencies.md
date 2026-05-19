# Dependências — secretaria_escola_csm

> Gerado pelo Scout em 2026-05-19

---

## Dependências de Produção

| Pacote | Versão | Descrição |
|--------|--------|-----------|
| `@supabase/supabase-js` | ^2.101.0 | Cliente Supabase para autenticação e banco de dados |
| `zod` | ^4.3.6 | Validação de schemas TypeScript |
| `xlsx` | ^0.18.5 | Biblioteca para leitura/escrita de planilhas Excel |
| `jspdf` | ^4.2.1 | Geração de PDFs em JavaScript |
| `jspdf-autotable` | ^5.0.7 | Plugin para criar tabelas em PDFs |

---

## Dependências de Desenvolvimento

| Pacote | Versão | Descrição |
|--------|--------|-----------|
| `vite` | (implícito) | Bundler moderno |
| `typescript` | ^6.0.2 | Superset JavaScript com tipos |
| `vitest` | ^4.1.4 | Framework de testes |
| `@vitejs/plugin-react` | ^6.0.1 | Plugin Vite para React (não usado) |
| `@vitest/browser` | ^4.1.6 | Testes no browser com Vitest |
| `@types/jspdf` | ^1.3.3 | Tipos TypeScript para jspdf |
| `@types/node` | ^25.6.0 | Tipos para Node.js |
| `jsdom` | ^29.1.1 | DOM virtual para testes |
| `terser` | ^5.46.1 | Minificador para produção |

---

## Scripts npm

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "type-check": "tsc --noEmit",
  "test": "vitest run",
  "test:w": "vitest run --watch",
  "test:ui": "vitest --ui",
  "test:coverage": "vitest run --coverage"
}
```

---

## Tecnologias Identificadas

| Tecnologia | Papel |
|------------|-------|
| **TypeScript** | Linguagem principal |
| **Vite** | Bundler e dev server |
| **Supabase** | Backend (Auth + PostgreSQL) |
| **Edge Functions (Deno)** | Lógica server-side |
| **Vitest** | Testes unitários |
| **Zod** | Validação runtime |
| **Vercel** | Deploy |

---

## Variáveis de Ambiente

*Verificar em `.env.example` ou variáveis do Vercel.*

Variáveis típicas do Supabase:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL` (Edge Functions)
- `SUPABASE_SERVICE_ROLE_KEY` (Edge Functions)

---

## Compatibilidade de Versões

O projeto usa:
- **Node.js**: Não especificado (compatível com Vite)
- **NPM**: Padrão do package.json
- **TypeScript**: Strict mode (tsconfig.json)

---