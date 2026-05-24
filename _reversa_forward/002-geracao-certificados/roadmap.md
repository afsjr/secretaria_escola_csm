# Roadmap: Geração de Certificados

> Identificador: `002-geracao-certificados`
> Data: `2026-05-23`
> Requirements: `_reversa_forward/002-geracao-certificados/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

Criar módulo de certificados usando `jsPDF` (já presente no projeto) para geração de PDF sob demanda. Imagens (logo e assinatura) serão armazenadas no Supabase Storage com RLS restrito a `master_admin`. A validação de conclusão usará a máquina de estado `status_aluno = 'concluido'` da matrícula. O hash de autenticação será gerado via `crypto.randomUUID`. Não haverá persistência do arquivo PDF — apenas metadados na tabela `certificados`.

## 2. Princípios aplicados

Nenhum princípio definido em `.reversa/principles.md`.

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | `jsPDF` para geração do PDF | Biblioteca já presente no projeto, sem dependência extra | pdf-lib, Puppeteer, API externa | 🟢 |
| D-02 | Supabase Storage para imagens | Bucket dedicado com RLS, integração nativa | Base64 no banco, CDN externo | 🟢 |
| D-03 | Hash alfanumérico com `crypto.randomUUID` | Simples, sem dependência externa, colisão improvável | QR code com URL pública, API de hash terceira | 🟢 |
| D-04 | Sem persistência do PDF | Geração sob demanda economiza storage; registro na tabela garante rastreabilidade | Storage permanente do PDF | 🟢 |
| D-05 | Templates separados para Formação e Técnico | Comportamento do verso difere por tipo de curso | Template único genérico | 🟢 |
| D-06 | Serviço dedicado `certificate-service.ts` | Isolamento da lógica de geração e validação | Dentro de `documents-service.ts` | 🟢 |
| D-07 | Geração em lote via loop no client-side | Simplicidade; lote pequeno (até 50 alunos) | Edge Function para processamento paralelo | 🟡 |

## 4. Premissas

Nenhuma — marcadores `[DÚVIDA]` resolvidos no `/reversa-clarify`.

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Documents | `_reversa_sdd/documents/requirements.md` | componente-novo | Certificados como novo sub-módulo de Documents |
| Audit | `_reversa_sdd/audit/requirements.md` | contrato-alterado | Novas ações de auditoria (gerar_certificado, upload_logo) |
| Course | `_reversa_sdd/course/requirements.md` | regra-alterada | Conteúdo programático usado no verso do certificado |
| Admin | `_reversa_sdd/admin/requirements.md` | regra-alterada | Upload de imagens restrito a master_admin |

## 6. Delta no modelo de dados

- 3 novas tabelas: `certificados`, `certificados_modelos`, `conteudo_programatico`
- 1 novo bucket Storage: `certificados-imagens`
- Detalhe completo em: `_reversa_forward/002-geracao-certificados/data-delta.md`

## 7. Delta de contratos externos

Nenhum contrato externo afetado.

## 8. Plano de migração

1. Migration SQL: criar tabela `certificados_modelos` (logo_path, assinatura_path, nome, timestamps)
2. Migration SQL: criar tabela `conteudo_programatico` (curso_id, disciplina, carga_horaria)
3. Migration SQL: criar tabela `certificados` (aluno_id, curso_id, data_conclusao, carga_horaria, codigo_autenticacao, emitido_por, emitido_em)
4. Criar bucket `certificados-imagens` no Supabase Storage com RLS (master_admin only)
5. Criar `src/lib/certificate-service.ts` com lógica de validação, geração de hash, geração de PDF
6. Atualizar `src/types/domain.ts` com interfaces das novas tabelas
7. Criar view de administração de imagens (upload/delete logo e assinatura)
8. Criar view de geração de certificados (individual e lote)
9. Integrar auditoria nas ações sensíveis

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Aluno sem conclusão formal no sistema | alto | médio | Validar `status_aluno = 'concluido'` e notas lançadas |
| Imagem de logo/assinatura em formato não suportado pelo jsPDF | médio | baixo | Validar formato no upload (PNG/JPEG) |
| Hash colide com certificado existente | baixo | baixo | Gerar hash + verificar unicidade na tabela |
| Performance em lote grande | médio | baixo | Limitar lote a 50 alunos por operação |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] `regression-watch.md` gerado
- [ ] PDF gerado corretamente com frente e verso
- [ ] Upload de logo/assinatura funcional no storage
- [ ] Certificado gerado apenas para alunos com conclusão validada
- [ ] Hash de autenticação único por certificado
- [ ] Log de auditoria para geração e upload

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-05-23 | Versão inicial gerada por `/reversa-plan` | reversa |
