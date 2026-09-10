---
schema_version: 1
id: OPP-20260909-N5O6
display_number: 8
context: professor-turmas
verb: evolve
title: Conflitos de escrita entre professores ativos exigem realtime + merge (hoje: toast + reload com optimistic lock)
target:
  files: ["src/views/professor-turmas-notas.ts", "src/views/professor-turmas-frequencia.ts", "src/lib/concurrency-control.ts", "src/lib/supabase.ts"]
  symbol: "bindSalvarNotas, bindSalvarFrequencia, updateWithLock"
smell: Ao salvar notas/frequência, um conflito de concorrência (versao desatualizada) dispara toast "Dados foram modificados por outro usuário" e reload automático em 2s. O usuário que perdeu a escrita refaz manualmente o lançamento; não há merge nem sincronização em tempo real entre telas abertas por professores diferentes na mesma turma/disciplina.
roi:
  confidence: yellow
  impact: Perda de trabalho em ambiente multi-professor (dois professores lançando na mesma disciplina); divergência visual entre abas abertas
  cost: high
  est_return: Merge automático de deltas por aluno + refletir alterações de terceiros via Supabase Realtime; UX livre de reload abrupto
state: proposed
traceability:
  soul: ["academic: lançamento de notas"]
  specs: ["professor/requirements.md"]
---

## Observado

Fluxo atual (`concurrency-control.ts`): `updateWithLock` faz upsert com
`.eq("versao", versaoAtual)`; em falha (`CONFLICT`/`PGRST116`) o handler
`bindSalvarNotas` exibe toast e recarrega a página após 2s. Isso:

1. descarta alterações ainda não salvas do usuário perdedor;
2. não propaga em tempo real a escrita vencedora para outras abas abertas;
3. infla o custo de reprocessamento (o professor refaz o lançamento).

O Supabase já é usado (`supabase` em `src/lib/supabase.ts`), então Realtime
(channels + postgres_changes) está disponível sem nova infraestrutura.

## Transformação proposta (candidata)

- **Fase 1 — Conflito não-destrutivo**: ao detectar `CONFLICT`, buscar os dados
  atuais, fusionar por aluno (aluno_id) usando delta do usuário perdedor e
  persistir com nova versão, explicitando no toast "fusão aplicada; verifique
  valores divergentes". Remover o reload hard.
- **Fase 2 — Realtime**: subscrever canal em `boletim` (por `disciplina_base_id`
  ou `turma_id`) e `frequencia`; ao receber escrita de terceiros, atualizar as
  células afetadas in-place (novos alunos entram a partir de `loadAlunosDaDisciplina`).
- **Guardrails**: eco de própria escrita ignorado; debounce de renderização;
  indisponibilidade do canal degrada para o comportamento atual (seletor de
  versão + toast).

## Risco

Alto — toca o coração do lançamento de notas; requer gate com gate aprovado de
diff e rede verde por etapa. Recomenda-se executar como feature (ciclo forward),
não como refactor na mesma janela das OPP-3/OPP-6/OPP-7. Fica registrada como
oportunidade futura e é candidata natural a `/reversa-forward`.

## Alternativas consideradas

- Manter busy-wait (refetch periódico): simples, mas não elimina o reload perdedor nem o atraso.
- Realtime direto no handler de salvar (sem merge): corretíssimo para conflito, porém descarta delta por aluno.
- CRDT (ex. Yjs): overkill para células numéricas; descartado nesta fase.