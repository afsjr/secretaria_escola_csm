# Investigation: Aluno — Minhas Notas

> Identificador: `005-aluno-notas`
> Data: `2026-05-23`

## Pesquisa de fundo

### Cálculo da média

O cálculo de média parcial e final já está implementado em `src/lib/grades-utils.ts` com as funções `calcularMediaParcial(n1, n2, n3)` e `calcularNotaFinal(mediaParcial, rec)`. Essas funções são usadas pelo professor em `professor-turmas.ts` (linhas 430-433) e `gestao-turmas.ts` (linhas 800-801). Reuso direto.

Fórmula:
- Média parcial = (N1 + N2 + N3) / 3
- Nota final = se média >= 7 → média; senão → (média + Rec) / 2
- Arredondamento: X.1–X.4 → X.5; X.6–X.9 → (X+1).0

### RLS existente

Policy `"Students view own grades"` em `migration.sql:951`:
```sql
CREATE POLICY "Students view own grades" ON boletim
FOR SELECT TO authenticated USING (auth.uid() = aluno_id);
```

Nenhuma ação necessária. A chamada `getBoletim(alunoId)` com `alunoId = auth.uid()` já respeita a policy.

### Tabela boletim — campos

Schema em `schema.sql:103-119` com campos adicionais em `migration.sql`:
- `id`, `aluno_id`, `disciplina`, `disciplina_base_id`, `faltas`, `n1`, `n2`, `n3`, `rec`, `nota_estagio`, `estagio_parecer`, `status`, `versao`, `created_at`
- As constraints incluem UNIQUE(aluno_id, disciplina)

### Tipo Boletim no TypeScript

O tipo `Boletim` em `src/types/domain.ts:123-134` está desatualizado — faltam campos `disciplina_base_id`, `nota_estagio`, `estagio_parecer`, `status`, `versao` e o join aninhado `disciplinas_base`. A view deverá usar `any` ou interface estendida localmente.

## Alternativas avaliadas

| Alternativa | Veredito |
|-------------|----------|
| Criar método específico `getNotasDoAluno` no AcademicService | Descartada — `getBoletim` já atende com o join necessário |
| Calcular média em stored procedure | Descartada — não há coluna `media` no banco e a lógica front-end já está consolidada |
| Badge de status via lookup table | Descartada — `calcularStatusAluno` já funciona deterministicamente |
| Agrupamento via SQL com `order by` | Descartada — client-side sorting é suficiente e mais simples |

## Padrões aplicáveis

- **Service-View pattern** do projeto: view chama service, service retorna dados, view renderiza (documentado em `_reversa_sdd/architecture.md#fluxo-de-dados-típico`)
- **Conditional sidebar items** já usado em `dashboard.ts` para links de `_isAdmin`, `_isProfessor` etc.
- **Hash routing** em `dashboard.ts` linhas 259-290: cada sub-rota tem `else if` com guard de perfil
