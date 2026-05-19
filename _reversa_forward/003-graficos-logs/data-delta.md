# Data Delta — Gráficos na Página de Logs

## 1. Visão Geral

Esta feature **não altera** o schema do banco de dados. Adiciona apenas uma camada de agregação via função SQL.

---

## 2. Estrutura Atual (Referência)

### Tabela: audit_log

| Coluna | Tipo | Observação |
|--------|------|------------|
| id | uuid | PK |
| usuario_id | uuid | FK → auth.users |
| usuario_nome | text | |
| usuario_perfil | text | |
| acao | text | |
| tabela_afetada | text | |
| registro_id | uuid | |
| descricao | text | |
| dados_antigos | jsonb | |
| dados_novos | jsonb | |
| user_agent | text | |
| created_at | timestamp | |

**Referência:** `_reversa_sdd/erd-complete.md`

---

## 3. Novas Funções (sem alteração de schema)

### 3.1. get_logs_agrupados(periodo TEXT)

**Parâmetro:** periodo (TEXT)
- '12meses' → último ano
- '6meses' → último semestre
- '3meses' → último trimestre
- '30dias' → último mês
- 'semana' → última semana

**Retorno:** JSONB

```json
{
  "periodo": "6meses",
  "total": 150,
  "por_severidade": {
    "alta": 5,
    "media": 45,
    "baixa": 100
  },
  "por_acao": [
    {"acao": "login_sucesso", "count": 80},
    {"acao": "lancar_nota", "count": 30}
  ],
  "tendencia": [
    {"mes": "2025-11", "alta": 2, "media": 8, "baixa": 20},
    {"mes": "2025-12", "alta": 1, "media": 10, "baixa": 25}
  ]
}
```

### 3.2. get_logs_periodo(periodo TEXT)

Função auxiliar para tendência temporal.

---

## 4. Migração Necessária

**Nenhuma migração de dados requerida.**

A feature usa dados existentes da tabela `audit_log`.

---

## 5. Validações

| Item | Tipo | Observação |
|------|------|------------|
| Performance | Não alterar | Usar índices existentes |
| Cache | Adicionar | 5 minutos no frontend |
| Limite | Adicionar | Max 1000 registros por período |

---

## 6. Rastreabilidade

| Dado | Origem |
|------|--------|
| Mapeamento ação→severidade | `_reversa_sdd/audit/requirements.md` |
| Tabela audit_log | `_reversa_sdd/erd-complete.md` |

---

## 7. Conclusão

**Impacto no banco: Mínimo**
- Sem alteração de schema
- Apenas nova função SQL
- Reutiliza índices existentes