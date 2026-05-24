# Investigation — Geração de Certificados

> Gerado por `/reversa-plan` em 2026-05-23

## Bibliotecas de PDF disponíveis

### jsPDF (já instalada)
- `jspdf` + `jspdf-autotable` — presente em `src/lib/pdf-service.ts`
- Suporta: texto, imagens (PNG/JPEG), tabelas, fontes customizadas
- Usado atualmente para: exportação de boletins, relatórios de notas
- Compatível com: geração 100% client-side, sem servidor

### Alternativas descartadas

| Biblioteca | Motivo do descarte |
|------------|--------------------|
| pdf-lib | Mais verbosa para templates fixos, sem suporte nativo a tabelas |
| Puppeteer | Exige servidor Node.js, incompatível com SPA client-side |
| API externa (Docuseal, PDF.co) | Dependência externa, custo, latência de rede |

## Armazenamento de imagens

### Supabase Storage
- Bucket `certificados-imagens` com RLS
- Apenas `master_admin` pode inserir/remover arquivos
- Qualquer usuário autenticado pode ler (para renderizar no PDF)
- Tamanho máximo por arquivo: 2MB (PNG/JPEG)

### Alternativas descartadas

| Opção | Motivo |
|-------|--------|
| Base64 no banco | Aumenta tamanho do banco sem necessidade |
| CDN externo (Cloudinary) | Dependência externa desnecessária |
| Assets do Vite | Exige rebuild para trocar imagem |

## Geração do hash de autenticação

### `crypto.randomUUID()`
- Disponível nativamente no browser
- Gera UUID v4: `550e8400-e29b-41d4-a716-446655440000`
- Formato amigável: `CERT-${ano}-${randomUUID.slice(0,8).toUpperCase()}`
- Sem dependências externas

## Validação de conclusão

A máquina de estado da matrícula (`_reversa_sdd/state-machines.md`) define:
- `concluido` — estado terminal da matrícula
- Para cursos técnicos: média >= 6.0 em todas as disciplinas
- Para cursos de formação: conceito >= C em todos os componentes

A validação deve checar:
1. `status_aluno = 'concluido'` na matrícula
2. Nenhuma pendência financeira
3. Notas/conceitos lançados para todas as disciplinas da matriz

## Padrões aplicáveis

- **Template Method** — template de certificado com implementações para Formação e Técnico
- **Strategy** — validação de conclusão por tipo de curso
- **Service Layer** — `certificate-service.ts` como camada de domínio
