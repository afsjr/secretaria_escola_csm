# Onboarding — Gráficos na Página de Logs

## 1. Passo a Passo para Teste

### 1.1. Pré-requisitos

- [ ] Acesso como admin ou master_admin
- [ ] Dados de log no banco (mínimo 10 registros)
- [ ] Navegador com suporte a JS (todos modernos)

### 1.2. Teste da Funcionalidade

**Passo 1: Acessar página de logs**
```
URL: /audit-log ou /logs
Usuário: admin@teste.com
```

**Passo 2: Verificar presença dos componentes**
- [ ] Selector de período (dropdown)
- [ ] Cards consolidados (Total, Alta, Média, Baixa)
- [ ] Gráfico de barras
- [ ] Gráfico de tendência

**Passo 3: Testar filtros de período**
- [ ] Clicar em "12 meses" → gráficos atualizam
- [ ] Clicar em "6 meses" → gráficos atualizam
- [ ] Clicar em "3 meses" → gráficos atualizam
- [ ] Clicar em "30 dias" → gráficos atualizam
- [ ] Clicar em "semana" → gráficos atualizam

**Passo 4: Testar interação**
- [ ] Hover sobre barra → tooltip aparece
- [ ] Hover sobre linha → tooltip aparece

**Passo 5: Validar dados**
- [ ] Total de ações corresponde à soma de severidades
- [ ] Valores fazem sentido comparados com tabela

---

## 2. Cenários de Teste

### 2.1. Primeiro Acesso (sem dados)
- Mostrar mensagem: "Nenhum log encontrado para este período"

### 2.2. Dados esparsos (poucos logs)
- Renderizar gráfico com o que houver
- Mostrar aviso se < 5 registros

### 2.3. Muitos dados (>1000)
- Aplicar limite de 1000
- Mostrar "últimos 1000 registros"

---

## 3. Checklist de Validação

| Item | Critério |
|------|----------|
| ✅ Carregamento | Página carrega em < 2 segundos |
| ✅ Responsividade | Layout adapta em tela 768px+ |
| ✅ Dados corretos | Totais batem com tabela |
| ✅ Períodos | Todos os 5 períodos funcionam |
| ✅ Gráficos | Barras e linha renderizam |
| ✅ Tooltip | Hover mostra valores |
| ✅ Sem erros | Console sem erros JS |

---

## 4. Contato para Issues

Se algo não funcionar:
1. Verificar console do navegador (F12)
2. Verificar network para erros de API
3. Reportar com print da tela

---

## 5. Glossário

| Termo | Definição |
|-------|-----------|
| Barras | Gráfico de colunas com contagem por ação |
| Linha | Gráfico temporal de tendência |
| Severidade | Classificação: alta, média, baixa |
| Período | Intervalo de tempo para agregação |