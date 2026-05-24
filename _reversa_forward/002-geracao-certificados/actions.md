# Actions: Geração de Certificados

> Identificador: `002-geracao-certificados`
> Data: `2026-05-23`
> Roadmap: `_reversa_forward/002-geracao-certificados/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 10 |
| Paralelizáveis (`[//]`) | 3 |
| Maior cadeia de dependência | 7 (T001 → T003 → T005 → T006 → T007 → T008 → T009) |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Migration SQL: criar tabelas `certificados_modelos`, `conteudo_programatico`, `certificados` + índices + RLS policies | - | `[//]` | `supabase/migrations/` | 🟢 | `[X]` |
| T002 | Criar bucket `certificados-imagens` no Supabase Storage + RLS (master_admin only) | - | `[//]` | `Supabase Storage` | 🟢 | `[X]` |
| T003 | Atualizar `src/types/domain.ts` com interfaces das novas tabelas | T001 | - | `src/types/domain.ts` | 🟢 | `[X]` |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T004 | Escrever testes para `certificate-service.ts`: validação de conclusão, geração de hash, templates | T003 | `[//]` | `src/lib/certificate-service.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Criar `src/lib/certificate-service.ts`: validate conclusão, generateHash, getConteudoProgramatico, buscar imagens do storage | T003 | - | `src/lib/certificate-service.ts` | 🟢 | `[X]` |
| T006 | Implementar geração de PDF com jsPDF: template Formação (frente + verso) e template Técnico | T005 | - | `src/lib/certificate-service.ts` | 🟢 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T007 | Criar view de gestão de imagens: upload/delete logo + assinatura, listagem, restrito a master_admin | T002, T005 | - | `src/components/Tabs/GerenciarCertificadosTab.ts` | 🟢 | `[X]` |
| T008 | Criar view de geração de certificados: seleção de aluno, geração individual e em lote, download do PDF | T005, T006, T007 | - | `src/components/Tabs/GerenciarCertificadosTab.ts` | 🟡 | `[X]` |
| T009 | Integrar auditoria: registrar `gerar_certificado`, `upload_logo`, `upload_assinatura`, `download_certificado` | T008 | - | `src/lib/certificate-service.ts` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T010 | Rodar `tsc --noEmit` + `npm test`, gerar `regression-watch.md` e `legacy-impact.md` | T004, T009 | - | (terminal) | 🟢 | `[ ]` |

## Notas de execução

Nenhuma.

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-05-23 | Versão inicial gerada por `/reversa-to-do` | reversa |
