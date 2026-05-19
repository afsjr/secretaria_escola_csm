# Gráficos na Página de Logs — Requisitos

> Feature: Dashboard com gráficos de barras e linha de tendência na página de auditoria
> Versão: 1.0

## 1. Visão Geral

**Problema:** Página de logs atual mostra apenas tabela filtrável, sem visualização consolidada de dados.

**Solução:** Adicionar gráficos de barras por tipo de ação e linha de tendência temporal, com filtros por período.

**Escopo:** Módulo Audit

---

## 2. Requisitos Funcionais

### 2.1. Gráficos

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|------------|-------------------|
| RF-01 | Gráfico de barras por tipo de ação | Must | Exibir contagem por ação |
| RF-02 | Linha de tendência temporal | Must | Evolução ao longo do período |
| RF-03 | Legenda interativa | Must | Clicável para filtrar |
| RF-04 | Tooltip com detalhes | Must | Ao hover, mostrar contagem exata |

### 2.2. Filtros de Período

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|------------|-------------------|
| RF-05 | Período: últimos 12 meses | Must | Aggregação mensal |
| RF-06 | Período: últimos 6 meses | Must | Aggregação mensal |
| RF-07 | Período: últimos 3 meses | Must | Aggregação semanal |
| RF-08 | Período: últimos 30 dias | Must | Aggregação diária |
| RF-09 | Período: semana atual | Must | Aggregação diária |
| RF-10 | Selector de período | Must | Dropdown com opções |

### 2.3. Cards Consolidados

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|------------|-------------------|
| RF-11 | Total de ações no período | Must | Card com número grande |
| RF-12 | Ações por severidade | Must | 3 cards: Alta, Média, Baixa |
| RF-13 | Ação mais frequente | Must | Card indicando maior ocorrência |

---

## 3. Estrutura de Dados

### API: getLogsAgrupados(periodo)

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| periodo | string | '12meses' | '6meses' | '3meses' | '30dias' | 'semana' |

**Retorno:**

```json
{
  "periodo": "6meses",
  "total": 150,
  "por_severidade": { "alta": 5, "media": 45, "baixa": 100 },
  "por_acao": [
    { "acao": "login_sucesso", "count": 80 },
    { "acao": "lancar_nota", "count": 30 },
    { "acao": "matricular_aluno", "count": 25 }
  ],
  "tendência": [
    { "mes": "2025-11", "alta": 2, "media": 8, "baixa": 20 },
    { "mes": "2025-12", "alta": 1, "media": 10, "baixa": 25 }
  ]
}
```

---

## 4. Regras de Negócio

| Regra | Descrição | Confiança |
|-------|-----------|-----------|
| RN-01 | Apenas admin e master_admin podem visualizar gráficos | 🟢 |
| RN-02 | Dados agregados não expõem dados sensíveis | 🟢 |
| RN-03 | Cache de 5 minutos para não sobrecarregar DB | 🟡 |

---

## 5. Interface Visual

### Layout Recomendado

```
+---------------------------------------------------------------+
|  Log de Auditoria                                             |
+---------------------------------------------------------------+
|  [12 meses ▼] [6 meses] [3 meses] [30 dias] [semana]         |
+---------------------------------------------------------------+
|  [Total: 150]  [Alta: 5]  [Média: 45]  [Baixa: 100]           |
+---------------------------------------------------------------+
|  GRÁFICO DE BARRAS (por ação)                                 |
|  ████████████ login_sucesso (80)                               |
|  ██████ lancar_nota (30)                                      |
|  ██████ matricular_aluno (25)                                  |
+---------------------------------------------------------------+
|  GRÁFICO DE LINHA (tendência por severidade)                  |
|  ____ Alta                                                     |
|  ____ Média                                                    |
|  ____ Baixa                                                    |
+---------------------------------------------------------------+
|  TABELA DE LOGS (detalhamento)                                 |
+---------------------------------------------------------------+
```

---

## 6. Requisitos Não Funcionais

| Requisito | Descrição | Critério |
|-----------|-----------|----------|
| RNF-01 | Responsivo | Funciona em desktop e tablet |
| RNF-02 | Performance | Carregamento < 2 segundos |
| RNF-03 | Biblioteca | Highcharts ou similar |

---

## 7. Critérios de Aceite

```gherkin
Dado admin acessando página de logs
When Seleciona período "6 meses"
Then Exibe gráficos de barras + tendência

Dado hover sobre barra
When Passa mouse sobre barra
Then Exibe tooltip com contagem exata

Dado admin sem acesso
When Tenta acessar página
Then Retorna erro 403
```

---

## 8. Rastreabilidade

| Origem | Artefato |
|--------|----------|
| Audit atual | `_reversa_sdd/audit/requirements.md` |

---

## 9. Pendências

Nenhuma — requisitos definidos.