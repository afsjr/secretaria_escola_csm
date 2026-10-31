# Regression Watch: Indicadores Pedagógicos da Turma

> Identificador: `013-indicadores-turma`
> Data: `2026-10-30`

## Watch principal

| ID | Origem (arquivo, seção) | Regra esperada após mudança | Tipo de verificação | Sinal de violação |
|----|-------------------------|-----------------------------|---------------------|-------------------|
| W001 | `_reversa_sdd/addenda/008-ata-resultados-finais.md#impacto` e `src/lib/academic-service.ts` | A Ata continua calculando frequência por `faltas` sobre `carga_horaria` e usando `calcularNotaFinal` | presença | Ata e indicadores divergirem para o mesmo aluno e disciplina |
| W002 | `_reversa_sdd/domain.md#RB13` e `src/views/gestao-turmas.ts` | Indicadores aparecem apenas quando o curso não é `formacao` | presença | Aba ou conteúdo de indicadores visível em turma de formação |
| W003 | `requirements.md#RN-02` | A feature permanece somente leitura | ausência | Qualquer insert, update ou delete disparado pela aba Indicadores |
| W004 | `requirements.md#RN-05`, `#RN-06` | Média usa `grades-utils` e ignora disciplina sem nota maior que zero e estágio AP/REP | redação | Fórmula manual de média ou inclusão de `nota_estagio` no cálculo numérico |
| W005 | `requirements.md#RN-08` | Presença usa `boletim.faltas` e `carga_horaria`, com clamp entre 0 e 100 | presença | Troca para a tabela `frequencia` sem revisão de spec, ou percentual fora de 0 a 100 |
| W006 | `roadmap.md#9` | Indicadores usam consultas em lote, sem N+1 por aluno ou disciplina | presença | Número de consultas crescer com o tamanho da turma |

## Observações

Regras originalmente 🟡, sem peso de regressão:

- RN-01: `tipo_curso` nulo é tratado como técnico para manter o comportamento atual de Grade e Notas.
- RN-03: apenas alunos com `status_aluno = 'ativo'` entram no cálculo.
- RN-06: estágio AP/REP fica fora da média numérica.
- RN-10: a quebra por disciplina é complementar aos cards.
- RN-11: os indicadores recarregam ao selecionar a turma e ao ativar a aba.

## Histórico de re-extrações

<!-- Preenchido pelo agente reverso ao rodar /reversa novamente. -->

## Arquivadas

<!-- Nenhuma. -->
