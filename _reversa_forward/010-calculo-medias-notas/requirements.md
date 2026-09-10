# Requirements: Cálculo de Médias com Notas Variáveis

> Identificador: `010-calculo-medias-notas`
> Data: `2026-09-10`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

O cálculo de médias parciais do sistema sempre considera 3 notas (n1, n2, n3), dividindo a soma por 3 independentemente de quantas notas foram de fato lançadas. Disciplinas que utilizam apenas 1 ou 2 avaliações recebem médias subestimadas, prejudicando alunos e distorcendo resultados. A feature corrige o cálculo para considerar dinamicamente apenas as notas lançadas (valores > 0), alinhando o comportamento do `grades-utils.ts` ao que o `pdf-service.ts` já faz corretamente via `_calcularMediaTeoria`. O professor decide livremente quantas notas lançar por disciplina; o sistema mantém os 3 campos (n1, n2, n3) mas só inclui no cálculo os valores > 0, exibindo alerta visual quando campos estiverem vazios.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/architecture.md#Módulos Principais` | Módulo Academic gerencia notas e boletim via `academic-service.ts` | 🟢 |
| `_reversa_sdd/domain.md#RB02` | Notas devem estar entre 0 e 10, validadas via Zod | 🟢 |
| `_reversa_sdd/domain.md#RB13` | Tipos de curso determinam sistema de avaliação (numérico vs conceito) | 🟢 |
| `_reversa_sdd/academic/requirements.md#Rastreabilidade de Código` | `grades-utils.ts` listado como utilitário de notas com cobertura 🟡 | 🟡 |
| `_reversa_sdd/professor/requirements.md#RF-05` | Professor lança nota individual com versionamento | 🟢 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Professor | Lançar notas com quantidades variáveis por disciplina | Professor de Farmácia lança apenas 1 nota no bimestre; professor de Anatomia lança 3 |
| Coordenador | Verificar médias corretas no boletim | Ao gerar boletim, as médias refletem apenas as notas lançadas |
| Aluno | Consultar notas em "Minhas Notas" | Aluno vê média calculada corretamente com 1 ou 2 notas lançadas |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** A média parcial deve ser calculada como a soma das notas lançadas dividida pela quantidade de notas com valor > 0 🟢
   - Origem no legado: altera comportamento implícito em `grades-utils.ts:calcularMediaParcial`
   - Tipo: alterada
   - Substitui a divisão fixa por 3 por uma contagem dinâmica
2. **RN-02:** Nota com valor 0 (zero) não deve ser considerada como nota lançada para fins de cálculo de média 🟡
   - Racional: nota zero real (aluno tirou zero) e nota não lançada (campo vazio/zero padrão) são indistinguíveis no schema atual — tratamento idêntico ao `_calcularMediaTeoria` do `pdf-service.ts`
   - Tipo: nova
3. **RN-03:** Se nenhuma nota foi lançada (todas = 0), a média parcial permanece 0 🟢
   - Origem no legado: comportamento existente preservada
   - Tipo: preservada
4. **RN-04:** O professor decide livremente quantas notas lançar por disciplina; o sistema não impõe quantidade mínima ou máxima de avaliações por disciplina 🟢
   - Decisão registrada: 2026-09-10, resposta do usuário (Adelino) à pergunta de escopo
   - Tipo: nova
5. **RN-05:** Quando campos de nota estiverem todos vazios (n1=0, n2=0, n3=0), o sistema deve exibir alerta visual na tela de lançamento de notas indicando que nenhuma avaliação foi registrada 🟢
   - Decisão registrada: 2026-09-10, resposta do usuário (Adelino) à pergunta de escopo
   - Tipo: nova

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Calcular média parcial com contagem dinâmica de notas | Must | `calcularMediaParcial(8, 0, 0)` retorna 8; `calcularMediaParcial(8, 7, 0)` retorna 7.5; `calcularMediaParcial(8, 7, 9)` retorna 8 | 🟢 |
| RF-02 | Manter cálculo de nota final (recuperação) inalterado | Must | `calcularNotaFinal` continua recebendo média parcial já calculada, sem mudança de contrato | 🟢 |
| RF-03 | Alinhar `pdf-service._calcularMediaTeoria` com `grades-utils` | Should | Eliminar duplicação de lógica; `pdf-service` passa a importar de `grades-utils` ou ambas usam a mesma função | 🟡 |
| RF-04 | Atualizar testes unitários de `calcularMediaParcial` | Must | Testes cobrem cenários com 1, 2 e 3 notas, incluindo todos zeros | 🟢 |
| RF-05 | Exibir alerta visual quando todos os campos de nota estiverem vazios na tela de lançamento | Should | Ao acessar tela de notas de uma disciplina, se n1=0, n2=0 e n3=0, exibir mensagem/ícone de alerta indicando "Nenhuma avaliação registrada" | 🟢 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Compatibilidade | Retrocompatibilidade: disciplinas com 3 notas lançadas devem produzir resultado idêntico ao comportamento atual | Divisão por 3 com 3 valores > 0 = mesmo resultado | 🟢 |
| Manutenibilidade | Eliminar duplicação entre `grades-utils.ts` e `pdf-service.ts` | `_calcularMediaTeoria` já implementa lógica correta duplicada | 🟡 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Média com 3 notas lançadas (comportamento preservado)
  Dado um aluno com n1=8, n2=7, n3=9
  Quando calcularMediaParcial é chamada
  Então o resultado deve ser 8

Cenário: Média com 2 notas lançadas
  Dado um aluno com n1=8, n2=7, n3=0
  Quando calcularMediaParcial é chamada
  Então o resultado deve ser 7.5

Cenário: Média com 1 nota lançada
  Dado um aluno com n1=8, n2=0, n3=0
  Quando calcularMediaParcial é chamada
  Então o resultado deve ser 8

Cenário: Média sem notas lançadas
  Dado um aluno com n1=0, n2=0, n3=0
  Quando calcularMediaParcial é chamada
  Então o resultado deve ser 0

Cenário: Nota zero real não distingue de nota não lançada
  Dado um aluno com n1=0, n2=7, n3=9
  Quando calcularMediaParcial é chamada
  Então o resultado deve ser 8 (média de n2 e n3)

Cenário: Recuperação permanece inalterada
  Dado uma média parcial de 5 e recuperação de 6
  Quando calcularNotaFinal é chamada
  Então o resultado deve ser 5.5 (arredondado para 5.5)

Cenário: Boletim do aluno reflete média correta
  Dado aluno com disciplina que possui apenas 1 nota lançada (n1=8)
  Quando gerar boletim via academic-service
  Então média parcial exibida deve ser 8 e não 2.67

Cenário: Alerta exibido quando nenhum campo de nota possui valor
  Dado professor acessando tela de notas de uma disciplina
  Quando n1=0, n2=0 e n3=0
  Então sistema exibe alerta "Nenhuma avaliação registrada"
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 | Must | Corrige distorção de cálculo que afeta resultados acadêmicos |
| RF-02 | Must | Preservar comportamento existente de recuperação |
| RF-03 | Should | Reduz manutenção futura eliminando duplicação |
| RF-04 | Must | Garantir regressão e confiança na mudança |
| RF-05 | Should |UX: prevenir lançamento esquecido sem impacto crítico |
| RNF Compatibilidade | Must | Não pode quebrar disciplinas com 3 notas |

## 9. Esclarecimentos

### Sessão 2026-09-10

- **Q:** Disciplinas que lançam apenas 1 ou 2 notas por padrão — há alguma configuração no banco que define a quantidade esperada de notas por disciplina, ou é puramente uma decisão do professor no momento do lançamento?
- **R:** O professor decide livremente quantas notas lançar. O sistema mantém até 3 campos (n1, n2, n3) para lançamento possível, mas só calcula se as notas forem > 0. Alertar quando os campos estiverem todos vazios. Resposta registrada para referência futura em caso de dúvida.

## 10. Lacunas

<!-- Nenhuma dúvida pendente. -->

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-09-10 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-09-10 | Dúvida resolvida: decisão do usuário sobre escopo (RN-04, RN-05, RF-05) | reversa via `/reversa-clarify` |
