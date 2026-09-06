# Impacto no Legado: Lançamento de Notas de Estágio Supervisionado por Lote

> Identificador: `006-lancamento-notas-estagio`
> Data: `2026-09-06`
> Política de Edição: `allowLegacyEdits: true` | `allowedPaths: ["src/**"]`
> Extração de Origem: `_reversa_sdd/`

## 1. Mapeamento de Arquivos Afetados

| Arquivo afetado | Componente | Tipo | Severidade | Justificativa |
|-----------------|------------|------|------------|---------------|
| `src/types/domain.ts` | Types | componente-novo | LOW | Adição das interfaces `NotaEstagioLotePayload` e `NotaEstagioLoteItem`. |
| `src/lib/academic-service.ts` | Academic Service | regra-nova | MEDIUM | Adição do método `upsertNotaEstagioLote` para salvar notas em lote. |
| `src/lib/professor-service.ts` | Professor Service | regra-alterada | LOW | Restrição de gravação de notas pelo professor às avaliações regulares. |
| `src/views/secretaria-estagio.ts` | Secretaria View | componente-novo | MEDIUM | Criação de interface de carga de estágio em lote com Toast Flutuante. |
| `src/views/dashboard.ts` | Main Layout Router | regra-nova | LOW | Registro de rota e item de sidebar `#/dashboard/secretaria/estagio`. |
| `src/views/aluno-notas.ts` | Student View | regra-nova | LOW | Destaque visual da nota de estágio no boletim acadêmico do aluno. |

## 2. Diff Conceitual por Componente

### Academic Service (`src/lib/academic-service.ts`)
- Incluído suporte a gravação em lote de estágio supervisionado via `upsertNotaEstagioLote`.
- Mantida a isenção de bloqueio financeiro para o salvamento e consulta de notas.

### Professor Service (`src/lib/professor-service.ts`)
- Garante que a regência docente opera estritamente sobre avaliações periódicas (N1, N2, N3, Rec).

### Layout & Navegação (`src/views/dashboard.ts` & `src/views/secretaria-estagio.ts`)
- Adicionada rota `/secretaria/estagio` e componente `SecretariaEstagioLoteView` restrito a `admin`, `secretaria` e `coordenacao`.
- Feedback ao salvar notas disparado via Toast Flutuante de sucesso.

## 3. Regras do Domínio Preservadas

- 🟢 **RB02:** Notas devem estar entre 0 e 10 (ou conceitos válidos).
- 🟢 **RB03:** Controle de concorrência em notas via Optimistic Locking (`versao`).
- 🟢 **RB09:** Disciplinas com estágio mantêm separação no campo `nota_estagio` da tabela `boletim`.
- 🟢 **RB13:** Cursos do tipo `tecnico` utilizam sistema de avaliação adequado.
- 🟢 **RB15:** Aluno acessa boletim em modo leitura (`aluno_id = auth.uid()`).

## 4. Regras do Domínio Modificadas ou Adicionadas

- 🟢 **RN-01 (Nova):** Lançamento de nota de estágio é restrito aos perfis Secretaria e Coordenação (`admin`, `secretaria`, `coordenacao`).
- 🟢 **RN-04 (Nova):** Lançamento em lote na Secretaria com confirmação visual por Toast Flutuante.
- 🟢 **RN-05 (Nova):** Alunos com `bloqueio_financeiro = true` aceitam lançamento e consulta de notas normalmente.
