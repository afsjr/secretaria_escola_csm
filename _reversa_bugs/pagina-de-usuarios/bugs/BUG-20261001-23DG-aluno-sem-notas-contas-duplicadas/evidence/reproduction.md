# Reprodução — aluno sem notas por contas duplicadas ativas

## Método (somente leitura)

Consulta direta ao Supabase (service key) das tabelas `perfis`, `matriculas` e `boletim`,
agrupando por `aluno_id`. Nomes mascarados.

## Constatações

- Não há boletim órfão em conta inativa nem matrícula em conta inativa (o dedup anterior
  não corrompeu dados).
- Existem **duplicatas ativas** da mesma pessoa em que os dados ficam divididos entre os logins:

| Pessoa (mascarada) | Conta A | Conta B |
|---|---|---|
| pessoa (M.C.S.S.) | `conta-M1 (mascarada)` — 0 boletim, sem matrícula | `conta-M2 (mascarada)` — 7 boletim com nota, matrícula ativa |
| pessoa (C.V.S.A.) | `conta-C1 (mascarada)` — 7 boletim com nota, sem matrícula | `conta-C2 (mascarada)` — 6 boletim com nota, matrícula ativa |

- Ao logar pela conta sem notas, `AcademicService.getBoletim(profile.id)`
  (`src/lib/academic-service.ts:226`) retorna vazio e `AlunoNotasView`
  (`src/views/aluno-notas.ts:36`) mostra "Nenhuma disciplina cadastrada".

## Causa

O dedup por CPF (`scripts/dedup-merge.mjs`) só agrupa quem tem CPF. Casos sem CPF ou com CPF
divergente (como os acima) ficam ativos, cada login com parte do histórico. É a mesma lacuna
de identidade descrita em BUG-20260924-6LSJ (contexto `pagina-de-usuarios`).

## Encaminhamento

Reparo de dados (merge das contas ativas), com decisão humana de qual conta manter por caso;
o mergulho automático atual não cobre (sem CPF). Requer backup e dry-run.
