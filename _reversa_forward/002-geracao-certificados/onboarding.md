# Onboarding — Geração de Certificados

> Passo a passo para testar a feature manualmente.

## Pré-requisitos

- Migration SQL aplicada (tabelas `certificados`, `certificados_modelos`, `conteudo_programatico`)
- Bucket `certificados-imagens` criado no Supabase Storage
- Pelo menos um curso com tipo `formacao` e um aluno com `status_aluno = 'concluido'`

## Teste 1 — Upload de imagem (master_admin)

1. Faça login como `master_admin`
2. Navegue para a seção de configurações de certificados
3. Faça upload de uma logo (PNG ou JPEG)
4. Verifique se a imagem aparece no storage
5. Faça upload de uma assinatura
6. Tente fazer upload como `secretaria` — deve ser bloqueado

## Teste 2 — Geração individual

1. Navegue para a lista de alunos concluídos
2. Selecione um aluno de curso `formacao`
3. Clique em "Gerar Certificado"
4. Verifique se:
   - PDF é gerado e baixado
   - Frente contém: logo, nome do colégio, nome do aluno, curso, carga horária, data, hash
   - Verso contém: tabela de disciplinas com carga horária, assinatura
   - Hash no formato `CERT-2026-XXXXXXXX`

## Teste 3 — Geração em lote

1. Selecione múltiplos alunos da mesma turma
2. Clique em "Gerar Certificados em Lote"
3. Verifique se um PDF por aluno é gerado (ou ZIP com múltiplos PDFs)
4. Verifique se cada certificado tem hash único

## Teste 4 — Validação de conclusão

1. Tente gerar certificado para aluno com `status_aluno <> 'concluido'`
2. Deve retornar erro: "Aluno não pode receber certificado"
3. Tente gerar para aluno com pendência financeira
4. Deve retornar erro

## Teste 5 — Template Técnico

1. Selecione um aluno de curso `tecnico` com `status_aluno = 'concluido'`
2. Gere o certificado
3. Verifique se o template é o correto para técnico

## Teste 6 — Auditoria

1. Verifique na tabela `audit_log` se as ações foram registradas:
   - `gerar_certificado` (geração)
   - `upload_logo` / `upload_assinatura`
   - `download_certificado`
