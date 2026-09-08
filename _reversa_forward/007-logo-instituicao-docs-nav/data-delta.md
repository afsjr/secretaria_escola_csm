# Data Delta: Logo da Instituição nos Documentos PDF e na Barra Lateral de Navegação

> Identificador: `007-logo-instituicao-docs-nav`
> Data: `2026-09-07`
> Base: `_reversa_sdd/database/data-dictionary.md`, `_reversa_sdd/database/relationships.md`

## 1. Resumo

A feature não altera o modelo de dados. O fallback usa um asset estático do front-end (`public/logo.png`, 613KB), não um registro de banco.

## 2. Campos

| Tabela | Campo | Situação | Ação |
|--------|-------|----------|------|
| `instituicao` | `logo_url` | Já existente (data URL ou URL pública do bucket `instituicao-assets`) | Nenhuma |

Nenhum campo novo, removido ou renomeado.

## 3. Migrações

n/a — sem scripts de migração necessários.

## 4. Política de armazenamento (contexto)

- Upload de logo pela tela de Configurações grava em bucket `instituicao-assets` via `uploadLogo` (`instituicao-service.ts:140-155`), com `upsert` e RLS já migrado no commit `d2d6850`.
- Quando `logo_url` é null/vazio, o fallback `GET /logo.png` (pasta `public/`) é usado — fora do banco, sem impacto em RLS nem em storage.

## 5. Impacto em índices e constraints

Nenhum.