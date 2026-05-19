# Gestão Acadêmica (Academic)

> Módulo de gestão acadêmica do sistema CSM

## Visão Overview
Gerencia o núcleo acadêmico do sistema: turmas, matrículas, disciplinas e notas. Gerencia o ciclo de vida acadêmico de alunos e turmas.

## Responsabilidades
- CRUD completo de turmas (criar, listar, atualizar, deletar)
- Matrículas de alunos em turmas
- Gestion de disciplinas por turma
- Lançamento e consulta de notas (boletim)
- Notas de estágio supervisionado

## Regras de Negócio
- Um aluno pode ter apenas uma matrícula ativa por vez 🟢
- Não é possível excluir turma com matrículas ativas 🟢
- Notas devem estar entre 0 e 10 🟢
- Disciplinas deduplicadas por nome + módulo 🟢
- Notas de estágio em campo separado 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Listar turmas | Must | Lista ordenada por período e nome |
| RF-02 | Criar turma | Must | Turma criada com nome, período, status |
| RF-03 | Atualizar turma | Must | Dados atualizados |
| RF-04 | Deletar turma | Must | Apenas se não houver matrículas ativas |
| RF-05 | Listar alunos | Must | Lista de alunos (perfil=aluno) |
| RF-06 | Matricular aluno | Must | Verifica matricula ativa antes |
| RF-07 | Listar alunos da turma | Must | Lista com dados do perfil |
| RF-08 | Atualizar status administrativo | Must | Atualiza status + bloqueio |
| RF-09 | Excluir matrícula | Must | Remove vínculo aluno-turma |
| RF-10 | Listar disciplinas da turma | Must | Disciplinas únicas por nome+módulo |
| RF-11 | Consultar notas completas | Must | Alunos + mapa de notas |
| RF-12 | Consultar boletim do aluno | Must | Notas por disciplina |
| RF-13 | Upsert nota de estágio | Must | Cria ou atualiza nota_estagio |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Deduplicação por nome+módulo | `academic-service.ts:139-152` | 🟢 |
| Integridade | Controle de versão em notas | `academic-service.ts:221` | 🟢 |
| Segurança | Verificação RLS no academic | `commit 62bd719` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado admin autenticado
Quando criar turma com nome, período
Então turma criada e retornada

Dado aluno já ativo em outra turma
Quando matricular em nova turma
Então retorna erro "Aluno já ativo na turma X"

Dado tentativa de excluir turma com matrículas
Quando executar deleteTurma
Então retorna erro "Não foi possível excluir a turma"

Dado registro de nota de estágio
Quando upsertNotaEstagio executado
Então nota_estagio atualizada ou criada com versão
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| CRUD Turmas | Must | Funcionalidade base |
| Matricular Aluno | Must | Caminho crítico da secretaria |
| getDisciplinasDaTurma | Must | Exibição de notas |
| getNotasCompletasTurma | Must | Lançamento de notas |
| upsertNotaEstagio | Should | Funcionalidade específica |
| deleteTurma | Should | Com verificação de integridade |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/lib/academic-service.ts` | `getTurmas`, `createTurma`, `updateTurma`, `deleteTurma` | 🟢 |
| `src/lib/academic-service.ts` | `matricularAluno`, `getAlunosDaTurma` | 🟢 |
| `src/lib/academic-service.ts` | `getDisciplinasDaTurma` | 🟢 |
| `src/lib/academic-service.ts` | `getNotasCompletasTurma`, `getBoletim` | 🟢 |
| `src/lib/academic-service.ts` | `upsertNotaEstagio` | 🟢 |
| `src/lib/grades-utils.ts` | Utilitários de notas | 🟡 |