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
| RF-03 | Listar todas as solicitações | Must | Lista completa (admin) |
| RF-04 | Atualizar status | Must | Status alterado para concluído |

## Rastreabilidade

| Arquivo | Função | Cobertura |
|---------|--------|-----------|
| `src/lib/documents-service.ts` | createRequest, getMyRequests | 🟢 |
| `src/lib/documents-service.ts` | getAllOpenRequests, updateStatus | 🟢 |