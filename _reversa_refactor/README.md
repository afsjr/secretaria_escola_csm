# Registro de Qualidade de Código (Reversa Refactor)

> Managed pelo time Code Quality do Reversa.

## Políticas

- `control_mode`: gated
  - leitura, análise, medição e prova de comportamento fluem sem aprovação. TODO passo que toca o código do projeto passa por gate com diff aprovado.
- `safety_net_policy`: require-characterization
  - transformação que altera estrutura ou lógica exige rede de segurança (testes existentes + caracterização) verde antes e depois.

## Invariante do registro

Nenhuma transformação altera comportamento observável. O que não prova preservação, para no gate. Toda transformação aplicada é revertível pelo diff guardado.

## Contextos

| Contexto | Caminho | Descrição |
|----------|---------|-----------|
| professor-turmas | `_reversa_refactor/professor-turmas/` | View de turmas do professor (notas, frequência, PDF, alertas) |
