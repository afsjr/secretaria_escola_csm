# Gestão Acadêmica (Academic), Design Técnico

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `getTurmas` | `()` | `{ data, error, count }` | Lista turmas |
| `createTurma` | `(TurmaData)` | `{ data, error }` | Cria turma |
| `updateTurma` | `(id, updates)` | `{ data, error }` | Atualiza turma |
| `deleteTurma` | `(id)` | `{ data, error }` | Verifica matrículas primeiro |
| `getAlunos` | `()` | `{ data, error }` | Lista alunos |
| `matricularAluno` | `(alunoId, turmaId)` | `{ data, error }` | Verifica ativo antes |
| `getAlunosDaTurma` | `(turmaId)` | `{ data, error }` | Com dados do perfil |
| `atualizarStatusAdministrativo` | `(alunoId, matriculaId, status, bloqueio)` | `{ data, error }` | Atualiza perfil + matrícula |
| `excluirMatricula` | `(matriculaId)` | `{ data, error }` | Remove vínculo |
| `getDisciplinasDaTurma` | `(turmaId)` | `{ data: {disciplinas}, error }` | Deduplicado |
| `getNotasCompletasTurma` | `(turmaId, disciplinaBaseId)` | `{ data, error }` | Alunos + mapa |
| `getBoletim` | `(alunoId)` | `{ data, error }` | Notas por disciplina |
| `upsertNotaEstagio` | `(alunoId, disciplinaBaseId, nota)` | `{ data, error }` | Cria ou atualiza |

## Fluxo Principal

### createTurma
1. Insere nome, periodo, status_ingresso, curso_id
2. Retorna dados criados

### deleteTurma
1. Tenta deletar
2. Se retorno vazio (0 linhas) → erro "Não foi possível excluir"
3. Isso indica que há dependências (FK ou matrículas)

### getDisciplinasDaTurma
1. Query em turma_disciplinas com disciplinas_base e perfis
2. Filtra duplicatas: normaliza nome+módulo para lowercase
3. Retorna array de disciplinas únicas

### upsertNotaEstagio
1. Verifica se registro já existe
2. Se existir → update com versao+1
3. Se não → insert com versao=1

## Fluxos Alternativos

- **Matrícula:** Verifica se há matrículas ativas antes de inserir
- **Deduplicação:** Remove duplicatas usando Set baseado em chave normalizada

## Dependências
- `supabase` — cliente para queries

## Decisões de Design Identificadas

| Decisão | Evidência no código | Confiança |
|---------|---------------------|-----------|
| Deduplicação por nome+módulo | `academic-service.ts:139-152` | 🟢 |
| Controle de versão em estágio | `academic-service.ts:221` | 🟢 |
| Verificação de matrículas antes de deletar | `academic-service.ts:50-62` | 🟢 |
| Campos opcionais: status_ingresso, curso_id | `academic-service.ts:30-37` | 🟢 |

## Estado Interno

- Tipo `TurmaData`: { nome, periodo, status_ingresso?, curso_id? }
- Tipo `MatriculaAtiva`: { id, turmas: { nome? } }

## Observabilidade

- Sem logs explícitos no código
- Retorno de erro estruturado para UI

## Riscos e Lacunas
- 🟡 getAlunoCompleto usa Promise sequencial (não paralelo)
- 🟢 Sem outras lacunas significativas