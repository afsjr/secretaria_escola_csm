---
schema_version: 1
id: OPP-20261030-FUYJ
display_number: 14
context: professor-turmas
verb: standardize
title: Estilos inline remanescentes no badge e alerta de notas
target:
  files: ["src/views/professor-turmas-notas.ts", "src/styles/main.css"]
  symbol: renderLinhaAluno, loadAlunosDaDisciplina
smell: A OPP-7 migrou 79 estilos inline para classes .pt-*, mas sobraram dois blocos com style inline no badge de matrícula tardia e no alerta de disciplina sem notas.
roi:
  confidence: green
  impact: Consistência visual e tema. Os dois blocos não acompanham mudanças de cor e tipografia definidas em CSS.
  cost: low
  est_return: Badge e alerta passam a usar classes .pt-*, alinhados ao resto da tela.
state: proposed
traceability:
  soul: []
  specs: ["professor/requirements.md#rf-04"]
---

## Observado

- `professor-turmas-notas.ts:17-19`: `badgeTardia` traz
  `style="font-size:0.7rem;color:#b45309;border:1px solid #b45309;...`.
- `professor-turmas-notas.ts:124-126`: `pt-alerta-sem-notas` traz
  `style="display:block;margin-top:0.3rem;color:#b45309;font-size:0.85rem;"`.

A OPP-7 padronizou o restante em `main.css`, mas estes dois casos ficaram de
fora provavelmente por serem montados em template separado.

## Transformação proposta

- Criar `.pt-badge-tardia` e `.pt-alerta-sem-notas` em `main.css` com os mesmos
  valores visuais atuais.
- Remover os atributos `style` do template.
- Nenhuma mudança de layout pretendida; conferir antes e depois com screenshot.

## Rede de segurança

`preservation.method: pattern-only`, com diff visual conferido. Sem teste
automatizado necessário.

## Risco

Baixo. Só marcação e CSS.
