# ADR 001: Arquitetura de Ofertas Baseada em Catálogo

> **Status:** ACEITO
> **Data:** 2026-04-15
> **Autor:** Evidência via Git commits

## Contexto

O sistema original usava disciplinas vinculadas diretamente a turmas sem referência a um catálogo central. Isso causava:
- Duplicação de disciplinas com nomes iguais em turmas diferentes
- Dificuldade em manter consistência de nomes
- Impossibilidade de rastrear uma disciplina "do curso" vs "da turma"

## Decisão

Migrar para arquitetura de **disciplinas base** (catálogo) + **ofertas** (turma_disciplinas):

```
disciplinas_base (catálogo do curso)
    ↓
turma_disciplinas (oferta: qual disciplina base, qual turma, qual professor)
```

### Evidência de Implementação

```bash
b3b8533 refactor: migrate to offer-based data structure
c14f337 feat: add teacher display and deletion functionality
```

**Tabelanova:** `turma_disciplinas` com campos:
- `turma_id` → FK para `turmas`
- `disciplina_base_id` → FK para `disciplinas_base`
- `professor_id` → FK para `perfis`

## Alternativas Consideradas

1. **Manter disciplinas por turma** — Rejeitado por manter inconsistência
2. **Disciplinas vinculadas apenas ao curso** — Rejeitado por não permitir turmas com subsets

## Consequências

### Positivas
- ✅ deduplicação natural de disciplinas
- ✅ professor vinculado à oferta (não à turma)
- ✅ histórico de ofertas por turma

### Negativas
- ❌ refatoração em múltiplos serviços
- ❌ migração de dados necessária

---

## Status de Implementação

✅ Completo — campos `disciplina_base_id` adicionados, código migrado.