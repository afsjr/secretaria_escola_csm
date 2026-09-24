# Template de evidência MASCARADA (obrigatório)

> Toda evidência que citar dados reais de pessoas deve ser mascarada **antes** de qualquer commit.
> Nome → pseudônimo estável (`PESSOA N`); CPF (pontuado ou 11 dígitos) → `***.***.***-**`;
> e-mail → `<e-mail-mascarado>`; id de conta (UUID, completo ou truncado) → `<id-mascarado>`;
> telefone/endereço → remover ou generalizar. Nunca versionar o dado bruto.

---
type: evidence
bug_id: BUG-XXXXXXXX-XXXX
title: <resumo da evidência>
collected_at: YYYY-MM-DD
readonly: true
mascarada: true
---

# <Título>

## Fonte

- <de onde veio: tela, snapshot, consulta read-only, print>
- Limitação / método de coleta

## Achados (mascarados)

| pseudônimo | perfil | contas | CPF | e-mail | vínculo | observação |
|------------|--------|--------|-----|--------|---------|------------|
| PESSOA 1 | aluno | 2 | `***.***.***-**` | `<e-mail-mascarado>` | 1 matrícula ativa | <nota> |

## Consulta usada (read-only)

```sql
-- Substituir segredos por variáveis de ambiente; nunca colar a string de conexão aqui.
```

## Próximo passo (decisão humana)

<o que precisa de decisão; reparo de dados é item separado>
