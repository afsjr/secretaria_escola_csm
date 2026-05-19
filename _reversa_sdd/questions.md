# Questions — Lacunas que precisam de validação

> Adelino, encontrei pontos que precisam da sua validação.

---

## 🔴 Lacunas Críticas (bloqueiam reimplementação)

### Q1: Student — Verificação de menor de idade

Na spec `student/requirements.md`:
>
> - Verificação de menor via RPC 🟡

**Dúvida:** O sistema realmente usa uma RPC (Remote Procedure Call) do Supabase para verificar se o aluno é menor de idade? Ou é uma verificação local no frontend?

RESPOSTA - tanto faz. aplique a melhor solução mais segura e eficiente.

**Unidade:** student/requirements.md:19

---

### Q2: Financeiro — Cálculo de resumo

Na spec `financeiro/requirements.md`:
> RNF-01: Cálculos de resumo usam iteração manual sem SQL aggregation 🟡

**Dúvida:** Isso é uma lacuna de implementação (deveria usar SQL mas não usa) ou uma decisão arquitetural intencional? O sistema foi planejado assim ou falta implementação?

RESPOSTA - pode usar sql. de preferencia .

**Unidade:** finance/requirements.md:37

---

## 🟡 Afirmações Inferidas (precisam confirmação)

### Q3: Auth — Senha padrão no reset

Na spec `auth/requirements.md`:
> Reset de senha define senha padrão 'csm1983#' + força mudança 🟡

**Dúvida:** Essa senha padrão 'csm1983#' está hardcoded no código ou vem de variável de ambiente/configuração?

RESPOSTA - pode ser hardcoded. Mas aplique de forma que possa ser alterado facilmente .

**Unidade:** auth/requirements.md:17

---

### Q4: Financeiro — Tabela de configurações

Na spec `financeiro/requirements.md`:
> Configurações armazenadas em tabela 'financeiro_config' 🟡

**Dúvida:** Essa tabela existe no banco de dados atual ou precisa ser criada? Quais campos tem?

RESPOSTA - esta tabela nao existe . CRIE NO SISTEMA.

**Unidade:** finance/requirements.md:47

---

### Q5: Audit — Completude do mapeamento

Na spec `audit/requirements.md`:
> Mapeamento de ações/severidade inferido do código 🟡

**Dúvida:** O mapeamento de ações (alta/média/baixa) está completo? Existe alguma ação no código que não foi mapeada?

RESPOSTA - O mapeamento esta completo.

**Unidade:** audit/requirements.md:45-48

---

### Q6: Documents — Tipos de documento

Na spec `documents/requirements.md`:
> RF-01: Criar solicitação | Must | Solicitação criada com status pendente

**Dúvida:** Quais são os tipos de documento válidos (declaração, histórico, certificado, etc.)? Há um catálogo definido?

RESPOSTA - Os tipos sao todos esses mas deixe espaço para subir um modelo e depois implementar. No modo atual so mostrar o nome do arquivo e data e status e aluno

**Unidade:** documents/requirements.md:18

---

## 🟠 Contradições Cruzadas

Nenhuma contradição direta encontrada entre units.

---

## 📋 Resumo

| Tipo | Quantidade |
|------|-----------|
| 🔴 Crítico | 2 |
| 🟡 Inferido | 4 |
| 🟠 Contras | 0 |

---

**Como responder:**

- Uma pergunta por vez
- ou digite "todas" para responder de uma vez
- Digite `reversa` quando terminar
