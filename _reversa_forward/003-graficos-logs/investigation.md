# Investigation — Gráficos na Página de Logs

## 1. Pesquisa de Fundo

### 1.1. Estado Atual do Módulo Audit

O sistema atual tem:
- Tabela `audit_log` com registros de ações
- Função `getCountsBySeverity()` que já faz contagem por severidade
- View `AuditLogView` com tabela filtrável

**Referência:** `_reversa_sdd/audit/requirements.md`

### 1.2. Limitações Identificadas

1. `getCountsBySeverity()` faz iteração em JS (não escalável)
2. Não há endpoint para dados agregados por período
3. Não há visualização gráfica

### 1.3. Alternativas Avaliadas

| Alternativa | Prós | Contras |
|-------------|------|---------|
| Highcharts | Já no projeto, rico | Licença para produção |
| Chart.js | Opensource, leve | Menos recursos |
| D3.js | Totalmente customizável | Curva de aprendizado |
| CSS-only bars | Sem biblioteca | Limitado |

**Escolha:** Highcharts (prioritário) ou Chart.js (fallback)

---

## 2. Padrões Aplicáveis

### 2.1. Aggregação de Dados

Padrão: Server-side aggregation para evitar transmissão de dados brutos.

```sql
-- Exemplo de agregação por período
SELECT 
  DATE_TRUNC('month', created_at) as mes,
  acao,
  COUNT(*) as total
FROM audit_log
WHERE created_at >= NOW() - INTERVAL '6 months'
GROUP BY 1, 2
ORDER BY 1;
```

### 2.2. Cache Strategy

Padrão: Client-side cache com TTL de 5 minutos.

```typescript
const cache = new Map<string, { data: any, timestamp: number }>();
const TTL = 5 * 60 * 1000; // 5 minutos
```

---

## 3. Fontes Externas

- Documentação Highcharts: https://www.highcharts.com/docs/
- Supabase JSON functions: https://supabase.com/docs

---

## 4. Decisões de Implementação

### 4.1. Dados por Período

| Período | Granularidade | Intervalo |
|---------|---------------|-----------|
| 12 meses | Mensal | 12 pontos |
| 6 meses | Mensal | 6 pontos |
| 3 meses | Semanal | ~12 pontos |
| 30 dias | Diário | 30 pontos |
| Semana | Diário | 7 pontos |

### 4.2. Gráficos

- **Barras:** Eixo Y = contagem, Eixo X = nome da ação
- **Linha:** Eixo X = tempo, Eixo Y = contagem, 3 linhas (alta/média/baixa)

---

## 5. Premissas

| Premissa | Origem |
|----------|--------|
| Highcharts já disponível | Verificar package.json |
| RLS funcionando | Já implementado no legacy |
| Logging já ativo | Já implementado no legacy |

---

## 6. Conclusão

A solução é viável com baixo impacto:
- Não altera schema do banco
- Adiciona apenas 1 função SQL
- Reutiliza componentes existentes

**Recomendação:** Prosseguir para implementação.