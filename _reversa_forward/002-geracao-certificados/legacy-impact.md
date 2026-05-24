# Legacy Impact — Geração de Certificados (002)

> Gerado por `/reversa-coding` em 2026-05-23

## Arquivos criados

| Arquivo | Componente | Tipo | Severidade | Justificativa |
|---------|------------|------|------------|---------------|
| `supabase/migrations/20260523220000_certificados.sql` | Database | componente-novo | LOW | Migração das 3 tabelas de certificados |
| `_reversa_forward/002-geracao-certificados/storage-setup.sql` | Database | componente-novo | LOW | Configuração do bucket de imagens |
| `src/lib/certificate-service.ts` | Documents | componente-novo | MEDIUM | Serviço central de geração de certificados |
| `src/lib/certificate-service.test.ts` | Documents | componente-novo | LOW | Testes do serviço |
| `src/components/Tabs/GerenciarCertificadosTab.ts` | Documents | componente-novo | MEDIUM | View de gestão de imagens + geração |

## Arquivos modificados

| Arquivo | Componente | Tipo | Severidade | Justificativa |
|---------|------------|------|------------|---------------|
| `src/types/domain.ts` | Core | delta-de-dados | MEDIUM | Interfaces CertificadoModelo, ConteudoProgramatico, Certificado |
| `src/views/secretaria.ts` | Academic | regra-alterada | LOW | Aba "Certificados" adicionada ao painel |

## Preservadas

- Regras de matrícula (`status_aluno`) — intactas, usadas para validação de conclusão
- Regras de auditoria (`audit-service.ts`) — intactas, chamadas pelo CertificateService
- Regras de permissão (RBAC) — intactas, master_admin controlando uploads

## Modificadas

Nenhuma regra existente foi modificada ou removida.
