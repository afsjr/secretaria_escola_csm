# Adendo — Ata de Resultados Finais (PDF)

> Feature: `008-ata-resultados-finais`
> Data ISO 8601: `2026-09-07T20:30:00Z`
> Cenário: **legado**

## Vigência

Vigente desde 2026-09-07.

## Resumo da entrega

Gera a **Ata de Resultados Finais** (documento oficial de escrituração escolar exigido pelo CEE/PE) em PDF para turmas, em A4 paisagem: registro por aluno dos componentes da matriz do curso (nota/conceito, faltas, % de frequência) e situação final usando a nomenclatura existente (`status_aluno` + `Aprovado`/`Reprovado`/`Cursando`), com texto cartorial de abertura (data por extenso), assinaturas de Diretor(a)/Secretário(a) e dados da instituição. A feature **consome resultados já calculados** — read-only, sem gravação em Supabase e sem recalcular aprovação.

**Ações concluídas:** 7/7 (`progress.jsonl`). Etapa coding fechada.

## Impacto por artefato da extração

| Artefato | Seção | Tipo de impacto | Delta |
|----------|-------|-----------------|-------|
| `_reversa_sdd/architecture.md` | `#módulos-principais` (Academic) | regra-nova | Novo caminho read-only `AcademicService.getDadosAtaTurma` monta o payload da Ata e deriva situação final/frequência reutilizando `grades-utils`/`status_aluno`; leia o Academic com a Ata como consumidora adicional, sem regra alterada |
| `_reversa_sdd/architecture.md` | `#módulos-principais` (Documents) | regra-nova | Documents passa a emitir a Ata cartorial via novo `PDFService.generateAtaResultadosPDF` (A4 paisagem), reutilizando `_renderHeader`/`getHeader`/`downloadPDF` |
| `_reversa_sdd/domain.md` | `#regras-de-negócio-implícitas` | regra-nova | Situação final do aluno derivada por agregação por componente (todos Aprovado → Aprovado; algum Reprovado → Reprovado; senão Cursando) com prevalência de `status_aluno` não-ativo; derivada na leitura, não persistida |
| `_reversa_sdd/domain.md` | `#rb09` | regra-nova | A Ata consome `nota_estagio` AP/REP conforme `disciplinaTemEstagio`; RB09 preservada, sem lógica paralela |
| `_reversa_sdd/domain.md` | `#rb12` | regra-nova | Componentes da Ata vêm de `disciplinas_base` via `getMatrizCurricular` (módulo/ordem); RB12 de dedup/ordenação preservada |
| `_reversa_sdd/domain.md` | `#rb13` | regra-nova | A Ata reutiliza a avaliação vigente (0–10 + `calcularStatusAluno`); RB13 preservada, nenhuma nova máquina de aprovação |
| `_reversa_sdd/domain.md` | `#gaps-identificados-🔴` | delta-de-dados | % de frequência derivado de `faltas` do boletim: `clamp(100 - faltas*100/carga_horaria, 0, 100)` — gap legado de tabela de frequência materializado no documento |
| `_reversa_sdd/architecture.md` | `#segurança` | delta-de-contrato-externo | Nome do arquivo `ata_resultados_{turma}_{ano}.pdf` (RF-10) passa por `sanitizeFilename` (`src/lib/security.ts`), reuso sem alteração |

## Regras sob vigilância

- W001 → `_reversa_forward/008-ata-resultados-finais/regression-watch.md`
- W002 → `_reversa_forward/008-ata-resultados-finais/regression-watch.md`
- W003 → `_reversa_forward/008-ata-resultados-finais/regression-watch.md`

## Fontes

- `_reversa_forward/008-ata-resultados-finais/legacy-impact.md`
- `_reversa_forward/008-ata-resultados-finais/regression-watch.md`
- `_reversa_forward/008-ata-resultados-finais/requirements.md`
- `_reversa_forward/008-ata-resultados-finais/progress.jsonl`