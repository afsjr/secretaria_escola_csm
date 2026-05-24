# Regression Watch — Geração de Certificados (002)

> Gerado por `/reversa-coding` em 2026-05-23

## Itens de regressão

| ID | Origem | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|--------|----------------------------|---------------------|-------------------|
| W001 | `matriculas.status_aluno` | Aluno precisa ter `status_aluno = 'concluido'` para receber certificado | presença | Certificado gerado para aluno não concluído |
| W002 | `certificate-service.ts:generateHash` | Hash no formato `CERT-YYYY-XXXXXXXX` único por certificado | redação | Hash duplicado ou formato inválido |
| W003 | `certificados-imagens` bucket | Apenas `master_admin` pode fazer upload/delete de imagens | presença | Usuário não-master_admin consegue fazer upload |

## Observações

- Regras originalmente 🟡 ou 🔴 não entram no watch principal
- Testes de regressão cobertos por `certificate-service.test.ts`

## Histórico de re-extrações

(Será preenchido pelo agente reverso ao rodar `/reversa` novamente.)

## Arquivadas

Nenhuma.
