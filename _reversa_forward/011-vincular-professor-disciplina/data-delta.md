# Data Delta: Vincular e Desvincular Professores em Disciplinas de Turmas

> Identificador: `011-vincular-professor-disciplina`
> Data: `2026-09-11`
> Base extraída: `_reversa_sdd/data-dictionary.md`, `_reversa_sdd/erd-complete.md`

## 1. Resumo

Não há alteração de schema. A feature usa a estrutura existente de `turma_disciplinas` e passa a escrever `null` em `professor_id` para representar desvínculo. Nenhuma migração é necessária.

## 2. Tabelas afetadas

### turma_disciplinas (Oferta)

| Campo | Tipo | Mudança | Uso pela feature |
|-------|------|---------|------------------|
| `id` | uuid | nenhuma | Identifica a oferta para update/desvínculo |
| `turma_id` | uuid | nenhuma | Escopo da grade |
| `disciplina_base_id` | uuid | nenhuma | Chave lógica (turma, disciplina) para localizar a oferta |
| `professor_id` | uuid | nenhuma (já opcional) | Recebe o professor vinculado ou `null` no desvínculo |
| `created_at` | timestamp | nenhuma | — |

Fonte: `_reversa_sdd/data-dictionary.md#Oferta (turma_disciplinas)`.

## 3. Tabelas consultadas, não alteradas

| Tabela | Uso | Fonte |
|--------|-----|-------|
| `perfis` | Popular o seletor de professores (`perfil = 'professor'`) | `_reversa_sdd/data-dictionary.md#Perfil` |
| `disciplinas_base` | Listar o catálogo do curso da turma | `_reversa_sdd/data-dictionary.md#Disciplina Base` |
| `boletim` | Verificar existência de notas antes de confirmar desvínculo | `_reversa_sdd/data-dictionary.md#Boletim (boletim)` |
| `aulas` | Verificar existência de aulas antes de confirmar desvínculo | `_reversa_sdd/data-dictionary.md#Aula (aulas)` |
| `audit_log` | Registrar vincular/desvincular | `src/lib/audit-service.ts` |

## 4. Relacionamentos

Nenhuma FK nova ou removida. `turma_disciplinas (1) ──< aulas` e `perfis (1) ──< turma_disciplinas` permanecem conforme `_reversa_sdd/erd-complete.md`.

## 5. Migrações

n/a. Nenhuma migração SQL é necessária.

## 6. Impacto em dados existentes

- Ofertas com `professor_id` preenchido não são tocadas até uma ação explícita de desvínculo.
- Aulas antigas mantêm `professor_id` do docente que as registrou (D-08 do roadmap); nenhum backfill.
