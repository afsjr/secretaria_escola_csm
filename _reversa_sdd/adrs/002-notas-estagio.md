# ADR 002: Notas de Estágio Separadas do Boletim Regular

> **Status:** ACEITO
> **Data:** 2026-04-20
> **Autor:** Evidência via Git commits

## Contexto

Notas de estágio (estágio supervisionado) têm regras diferentes das disciplinas regulares:
- Uma disciplina pode ter estágio ou não
- Estágio não segue sistema de notas N1/N2/N3/Rec
- É controlado por configuração de quais disciplinas têm estágio

## Decisão

Adicionar campo `nota_estagio` na tabela `boletim`, mantendo estrutura unificada.

### Evidência de Implementação

```bash
82a4c5e feat: implement business rules for internship eligibility
6980c91 feat: add functionality to view and update student internship grades
ca17658 feat: implement teacher, student, and course management tabs
```

**Código:**
```typescript
// academic-service.ts:207
async upsertNotaEstagio(alunoId: string, disciplinaBaseId: string, nota: number) {
  // 1. Verificar se já existe registro
  // 2. Upsert com campo nota_estagio
}
```

## Alternativas Consideradas

1. **Tabela separada `notas_estagio`** — Rejeitado por duplicar lógica
2. **Campo na entidade disciplina_base** — Rejeitado por ser configuração, não nota

## Consequências

### Positivas
- ✅ UI unificada para boleto
- ✅ Validação específica (apenas disciplinas com estágio)
- ✅ Controle de versão unificado

### Negativas
- ❌ Campo pode ser null para disciplinas normais
- ❌ Lógica de visualização deve filtrar por configuração

---

## Status de Implementação

✅ Completo — campo `nota_estagio` existe, UI implementada, método `upsertNotaEstagio`.