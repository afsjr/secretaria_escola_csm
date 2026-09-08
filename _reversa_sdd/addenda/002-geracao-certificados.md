# Adendo: Geração de Certificados

> Identificador: `002-geracao-certificados`
> Data: `2026-09-08T10:05:00-03:00`
> Cenário: legado

## Vigência

Vigente desde 2026-09-08.

## Resumo da entrega

Cria o módulo de geração de certificados de conclusão para cursos de formação e técnico. Inclui gestão de imagens (logo/assinatura em bucket restrito a `master_admin`), template fixo com frente e verso (conteúdo programático), geração de PDF sob demanda (individual e em lote, sem persistência), código de autenticação `CERT-YYYY-XXXXXXXX`, e auditoria de upload/geração/download. 10/10 ações concluídas.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/domain.md` | `#regras-de-negócio-implícitas` | regra-nova | RB14 "Requisitos de Conclusão e Emissão de Certificados" passa a valer: apenas aluno com conclusão validada (`status_aluno = 'concluido'`) recebe certificado, emitido uma única vez |
| `_reversa_sdd/architecture.md` | `#módulos-principais` (Documents) | componente-novo | `certificate-service.ts`, `GerenciarCertificadosTab.ts` e migração das tabelas `certificados`, `certificados_modelos`, `conteudo_programatico` |
| `_reversa_sdd/architecture.md` | `#módulos-principais` (Documents) | delta-de-contrato-externo | Bucket `certificados-imagens` com RLS restrito a `master_admin` para upload/delete de logo e assinatura |
| `_reversa_sdd/architecture.md` | `#módulos-principais` (Academic) | regra-alterada | Aba "Certificados" adicionada ao painel da secretaria (`src/views/secretaria.ts`) |

Regras RB01 (matrícula), auditoria e RBAC preservadas — nenhuma regra de domínio pré-existente alterada ou removida.

## Regras sob vigilância

- W001, W002, W003 — ver `_reversa_forward/002-geracao-certificados/regression-watch.md`

## Fontes

- `_reversa_forward/002-geracao-certificados/legacy-impact.md`
- `_reversa_forward/002-geracao-certificados/regression-watch.md`
- `_reversa_forward/002-geracao-certificados/requirements.md`
- `_reversa_forward/002-geracao-certificados/actions.md`
- `_reversa_forward/002-geracao-certificados/progress.jsonl`
