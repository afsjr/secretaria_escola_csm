# Solicitações de Documentos (Documents)

> Módulo de gestão de solicitações de documentos

## Visão Geral
Permite que alunos solicitem documentos (declarações, histórico, etc.) e que a secretaria gerencie essas solicitações.

## Responsabilidades
- Criar solicitação de documento (aluno)
- Listar próprias solicitações (aluno)
- Listar todas as solicitações (secretaria/admin)
- Atualizar status da solicitação (secretaria)

## Tipos de Documento

- Catálogo flexível (declaração, histórico, certificado, atestado, etc.)
- Campo para upload de modelo customizado (futuro)
- Modo atual: exibe nome do arquivo, data, status e aluno 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Criar solicitação | Must | Solicitação criada com status pendente |
| RF-02 | Listar próprias solicitações | Must | Lista do aluno |
| RF-03 | Listar todas as solicitações | Must | Lista completa (admin/secretaria) |
| RF-04 | Atualizar status | Must | Status alterado para concluído |
| RF-05 | Gerar Certificado em PDF | Must | PDF frente e verso gerado com jsPDF + autotable conforme tipo do curso |
| RF-06 | Validar conclusão do aluno | Must | Verifica 100% de aprovação nas disciplinas obrigatórias e estágio antes da emissão |
| RF-07 | Código de Autenticidade | Must | Hash SHA-256 único impresso no verso do certificado para validação pública |
| RF-08 | Gestão de Modelos e Assinaturas | Should | Upload e exclusão de logos e assinaturas no bucket 'certificados-imagens' (master_admin) |
| RF-09 | Central de Notificações no Header | Must | Dropdown com badge de contagem de solicitações pendentes para secretaria e aluno |

## Rastreabilidade

| Arquivo | Função / Componente | Cobertura |
|---------|---------------------|-----------|
| `src/lib/documents-service.ts` | createRequest, getMyRequests, getAllOpenRequests, updateStatus, getPendingByUser | 🟢 |
| `src/lib/certificate-service.ts` | validateConclusao, generateHash, gerarCertificadoPDF, uploadLogo | 🟢 |
| `src/components/NotificationDropdown.ts` | NotificationDropdown (badge + listagem rápida) | 🟢 |
| `src/components/Tabs/GerenciarCertificadosTab.ts` | GerenciarCertificadosTab (emissão individual/lote) | 🟢 |