# Geração de Certificados — Requisitos

> Feature: Geração de certificados de conclusão para cursos de formação
> Versão: 1.0

## 1. Visão Geral

**Problema:** Sistema atual não emite certificados de conclusão para alunos que finalizam cursos de formação.

**Solução:** Criar módulo de geração de certificados com template fixo, verso com conteúdo programático e repositório de imagens controlado por master_admin.

**Escopo:** Módulos Documents, Audit, Admin

---

## 2. Requisitos Funcionais

### 2.1. Gestão de Imagens do Certificado

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|------------|-------------------|
| RF-01 | Upload de logo do colégio | Must | Apenas master_admin pode carregar. Formatos: PNG e JPEG |
| RF-02 | Upload de assinatura | Must | Apenas master_admin pode carregar. Formatos: PNG e JPEG |
| RF-03 | Armazenar imagens em repositório | Must | Bucket/storage dedicado |
| RF-04 | Listar imagens existentes | Must | Apenas master_admin |
| RF-05 | Deletar imagem | Must | Apenas master_admin |

### 2.2. Modelo do Certificado

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|------------|-------------------|
| RF-06 | Definir dados fixos do colégio | Must | Nome, endereço, CNPJ |
| RF-07 | Template fixo com campos variáveis | Must | Dados do aluno, curso, data, carga horária |
| RF-08 | Verso com conteúdo programático | Must | Lista de disciplinas + carga horária |

### 2.3. Geração do Certificado

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|------------|-------------------|
| RF-09 | Gerar certificado PDF | Must | PDF gerado sob demanda (sem persistência do arquivo). Suporta geração individual e em lote |
| RF-10 | Validar conclusão do curso | Must | Aluno sem pendências |
| RF-11 | Listar certificados emitidos | Must | Por aluno, por curso |
| RF-12 | Download do certificado | Must | PDF gerado em memória e servido para download |
| RF-13 | Certificado com código de autenticação | Must | Hash alfanumérico (ex: `CERT-2026-XXXXX`) para validação |

### 2.4. Auditoria

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|------------|-------------------|
| RF-14 | Log de upload de imagens | Must | Registrar usuario, timestamp |
| RF-15 | Log de geração de certificado | Must | Registrar aluno, curso, usuario |
| RF-16 | Log de download | Should | Registrar quem baixou |

---

## 3. Estrutura de Dados

### Tabela: certificados

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| aluno_id | uuid | FK -> perfis |
| curso_id | uuid | FK -> cursos |
| data_conclusao | date | Data de conclusão |
| carga_horaria | int | Carga horária total |
| codigo_autenticacao | string | Hash/QR para validação |
| emitido_por | uuid | FK -> usuarios |
| emitido_em | timestamp | Data de emissão |

### Tabela: certificados_modelos

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| nome | string | Nome do modelo |
| logo_path | string | Path para logo no storage |
| assinatura_path | string | Path para assinatura |
| conteudo_verso_template | json | Template do verso |

### Tabela: conteudo_programatico

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | PK |
| curso_id | uuid | FK -> cursos |
| disciplina | string | Nome da disciplina |
| carga_horaria | int | Horas da disciplina |

---

## 4. Regras de Negócio

| Regra | Descrição | Confiança |
|-------|-----------|-----------|
| RN-01 | Apenas alunos com conclusão validada podem receber certificado | 🟢 |
| RN-02 | Upload de imagens restrito a master_admin | 🟢 |
| RN-03 | Certificado só pode ser gerado uma vez por conclusão | 🟢 |
| RN-04 | Carga horária total = soma do conteúdo programático | 🟢 |

---

## 5. Layout do Certificado

Existem dois templates:

### Template Formação (padrão, com verso)
#### Frente
- Nome do colégio (fixo)
- Logo do colégio
- Título "CERTIFICADO DE CONCLUSÃO"
- Dados do aluno (nome, CPF)
- Nome do curso
- Carga horária total
- Data de conclusão
- Código de autenticação

#### Verso
- Conteúdo programático (tabela)
  - Disciplina | Carga Horária
- Assinatura do diretor
- Nome e endereço do colégio

### Template Técnico (curso técnico)
- Mesmo layout da frente do template Formação
- Verso com conteúdo programático equivalente (adaptado ao formato de notas)
- Ambos os templates usam logo e assinatura do repositório

---

## 6. Requisitos Não Funcionais

| Requisito | Descrição | Critério |
|-----------|-----------|----------|
| RNF-01 | Performance | Geração de PDF < 3 segundos |
| RNF-02 | Segurança | RLS no bucket de imagens: master_admin only |
| RNF-03 | Backup | Manter histórico de modelos |

---

## 7. Critérios de Aceite

```gherkin
Dado master_admin fazendo upload de logo
When Envia arquivo de imagem
Then Imagem armazenada e registrada em log

Dado geração de certificado
When Aluno tem conclusão validada
Then PDF gerado com frente e verso

Given tentativa de gerar certificado sem conclusão
When Aluno com pendências
Then Retorna erro "Aluno não pode receber certificado"
```

---

## 8. Esclarecimentos

### Sessão 2026-05-23

- **Q:** Qual formato de arquivo para logo e assinatura?
  **R:** PNG e JPEG.

- **Q:** O certificado deve ser gerado em lote (vários alunos) ou individual?
  **R:** Ambos — individual e lote. O professor/master_admin pode gerar um certificado por vez ou selecionar múltiplos alunos da mesma turma.

- **Q:** O código de autenticação deve ser hash simples ou QR code com URL?
  **R:** Apenas hash alfanumérico (ex: `CERT-2026-ABC123`).

- **Q:** Comportamento ao gerar certificado para curso técnico (notas 0-10)?
  **R:** Gerar com template diferente para cursos técnicos. O template de formação tem verso com conteúdo programático; o template técnico segue layout similar mas adaptado.

- **Q:** Onde o PDF do certificado deve ficar armazenado?
  **R:** Gerado sob demanda e enviado para download imediato, sem persistência do PDF. O registro na tabela `certificados` persiste os metadados (hash, data, aluno, curso), mas o arquivo PDF é gerado em memória e servido para download.

---

## 10. Rastreabilidade

| Origem | Artefato |
|--------|----------|
| Documents atual | `_reversa_sdd/documents/requirements.md` |
| Audit atual | `_reversa_sdd/audit/requirements.md` |
| Cursos | `_reversa_sdd/course/requirements.md` |

---

## 11. Pendências

Nenhuma — requisitos definidos.