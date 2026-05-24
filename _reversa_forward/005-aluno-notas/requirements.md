# Requirements: Aluno — Minhas Notas

> Identificador: `005-aluno-notas`
> Data: `2026-05-23`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Adicionar uma aba "Minhas Notas" no dashboard do aluno (perfil `aluno`) que exiba as disciplinas em que o aluno está matriculado com suas respectivas notas (N1, N2, N3, Recuperação, Média Final) e status (aprovado/reprovado/cursando). O aluno visualiza — não edita.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/academic/requirements.md#RF-12` | `getBoletim` já existe e retorna notas por disciplina | 🟢 |
| `_reversa_sdd/academic/design.md#Interface` | `getBoletim(alunoId)` → `{ data, error }` (notas por disciplina) | 🟢 |
| `_reversa_sdd/domain.md#RB02` | Notas entre 0 e 10, validação Zod | 🟢 |
| `src/views/student-details.ts:167` | Secretaria já usa `getBoletim` para exibir boletim do aluno | 🟢 |
| `src/lib/academic-service.ts:207-215` | `getBoletim` consulta tabela `boletim` com join `disciplinas_base` | 🟢 |
| `_reversa_sdd/domain.md#Glossário` | Boletim = registro de notas de um aluno por disciplina | 🟢 |
| `src/types/domain.ts` | Tipos `boletim`, `disciplinas_base` no schema | 🟡 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Aluno | Consultar notas das disciplinas do curso | Aluno acessa dashboard → clica "Minhas Notas" → vê lista de disciplinas com N1, N2, N3, Rec, Média e status |

## 4. Regras de negócio novas ou alteradas

1. **RN-01:** Aluno visualiza apenas suas próprias notas, nunca de outros alunos 🟢
   - Origem no legado: `_reversa_sdd/domain.md#RB01` (matrícula ativa vincula aluno-turma)
   - Tipo: nova (derivada de RLS existente + `getBoletim` por `alunoId`)
2. **RN-02:** Aluno não pode editar ou lançar notas 🟢
   - Tipo: nova (restrição de perfil)
3. **RN-03:** Exibir média calculada via `calcularMediaParcial` + `calcularNotaFinal` (grades-utils.ts) — mostra 0 quando N1=N2=N3=0 🟢
   - Tipo: nova (reaproveita lógica existente do professor)
4. **RN-04:** Disciplinas com `status = pendente` aparecem como "Cursando" sem nota final 🟢
   - Origem no legado: `src/views/student-details.ts:170-171` (filtro de pendentes)
   - Tipo: alterada (aluno vê mas não pode editar)

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Criar rota `#/dashboard/aluno/notas` no router | Must | Navegar para a rota carrega a view de notas | 🟢 |
| RF-02 | Adicionar item "Minhas Notas" no sidebar do aluno | Must | Sidebar do aluno exibe link "Minhas Notas" | 🟢 |
| RF-03 | Carregar boletim do aluno logado via `getBoletim` | Must | Busca notas do aluno autenticado | 🟢 |
| RF-04 | Exibir tabela com disciplinas e notas | Must | Mostrar N1, N2, N3, Rec, Média, status por disciplina | 🟢 |
| RF-05 | Exibir badge de status (Aprovado/Reprovado/Cursando) | Must | Badge colorido conforme `status` do boletim | 🟢 |
| RF-06 | Agrupar disciplinas por módulo | Should | Seccionar por módulo da matriz curricular | 🟡 |
| RF-07 | Exibir loading state enquanto busca dados | Must | Esqueleto ou spinner antes dos dados carregarem | 🟢 |
| RF-08 | Exibir mensagem amigável se não houver notas | Should | "Nenhuma disciplina cadastrada" com estilo | 🟡 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|----------------------------|-------------|
| Desempenho | Consulta única ao carregar a aba | `getBoletim` faz apenas 1 select | 🟢 |
| Segurança | RLS já restringe boletim ao próprio aluno | Policy "Students view own grades" com `auth.uid() = aluno_id` já ativa | 🟢 |
| Manutenibilidade | Reaproveitar `getBoletim` do `AcademicService` | Função já existe e é testada | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Aluno acessa Minhas Notas com disciplinas cadastradas
  Dado que o aluno está logado e possui matrícula ativa
  E existem registros de boletim para o aluno
  Quando acessar "#/dashboard/aluno/notas"
  Então exibe lista de disciplinas com N1, N2, N3, Rec, Média
  E cada disciplina mostra badge de status correspondente

Cenário: Aluno acessa Minhas Notas sem disciplinas
  Dado que o aluno está logado mas não há registros de boletim
  Quando acessar "#/dashboard/aluno/notas"
  Então exibe mensagem "Nenhuma disciplina cadastrada"

Cenário: Aluno tenta editar nota (não permitido)
  Dado que o aluno está logado na view de notas
  Quando tentar interagir com os valores das notas
  Então nenhuma ação de edição é possível (somente leitura)
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 (rota) | Must | Base para navegação |
| RF-02 (sidebar) | Must | Entry point para o aluno |
| RF-03 (carregar dados) | Must | Core da feature |
| RF-04 (tabela) | Must | Visualização principal |
| RF-05 (badge status) | Must | Feedback visual crítico |
| RF-06 (agrupar módulo) | Should | Melhoria de UX |
| RF-07 (loading) | Must | Boa experiência |
| RF-08 (vazio) | Should | UX |

## 9. Esclarecimentos

### Sessão 2026-05-23

- **Q:** O campo `media` no boletim é calculado pelo backend (trigger SQL) ou precisa ser calculado no frontend?
  **R:** A tabela `boletim` não possui coluna `media`. A média é calculada exclusivamente no frontend via `calcularMediaParcial(N1,N2,N3)` e `calcularNotaFinal(mediaParcial, Rec)` em `src/lib/grades-utils.ts`. O professor já salva apenas N1, N2, N3, Rec — nenhum backend novo é necessário, apenas reutilizar as funções existentes.
- **Q:** O RLS na tabela `boletim` já permite select do próprio aluno ou será necessário criar policy?
  **R:** A policy `"Students view own grades"` já existe: `FOR SELECT TO authenticated USING (auth.uid() = aluno_id)` (confirmado em `supabase/migration.sql:951`). Nenhuma ação necessária.

## 10. Lacunas

> Nenhuma — todas as dúvidas foram resolvidas.

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-05-23 | Versão inicial gerada por `/reversa-requirements` | reversa |
| 2026-05-23 | Esclarecimentos via `/reversa-clarify`: média calculada via frontend (grades-utils.ts), RLS já ativa | reversa |
