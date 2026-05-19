# Gestão de Professores (Professor)

> Módulo de gestão de professores e suas atividades docentes

## Visão Geral
Gerencia as atividades docentes: disciplinas lecionadas, lançamento de notas, registro de aulas e vinculação professor-oferta.

## Responsabilidades
- Listar disciplinas/ofertas de um professor
- Listar todas as ofertas (para secretaria)
- Vincular professor a uma oferta
- Buscar e lançar notas de alunos
- Lançamento em lote de notas
- Registro e consulta de aulas
- Contagem de alunos por turma

## Regras de Negócio
- Notas entre 0 e 10 (validado via Zod) 🟢
- Controle de concorrência via campo versao 🟢
- Registro de aulas auditado 🟢
- Notas vinculadas a disciplina_base_id (não mais por nome) 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Listar disciplinas do professor | Must | Ofertas com dados da disciplina e turma |
| RF-02 | Listar todas as ofertas | Should | Todas as ofertas (para secretaria) |
| RF-03 | Vincular professor a oferta | Must | Atualiza professor_id na oferta |
| RF-04 | Buscar notas da disciplina | Must | Notas de todos os alunos da turma |
| RF-05 | Salvar nota individual | Must | Nota criada ou atualizada com versionamento |
| RF-06 | Salvar notas em lote | Should | Múltiplas notas salvas |
| RF-07 | Registrar aula | Must | Aula registrada com auditoria |
| RF-08 | Listar aulas da oferta | Must | Aulas da oferta específica |
| RF-09 | Listar aulas do professor | Must | Todas as aulas por professor |
| RF-10 | Contar alunos da turma | Must | Número de alunos ativos |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Integridade | Optimistic locking via versao | `concurrency-control.ts` | 🟢 |
| Auditoria | Log de auditoria em aulas | `professor-service.ts:200-206` | 🟢 |
| Performance | Batch de notas via Promise.all | `professor-service.ts:178` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado professor autenticado
Quando buscar disciplinas do professor
Então retorna ofertas vinculadas ao professor com dados da disciplina e turma

Dado professor lançando nota
Quando salvarNota com versao incorreta
Então retorna erro de conflito

Dado professor registrando aula
Quando executar registrarAula
Então aula criada e log de auditoria gerado
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| getDisciplinasDoProfessor | Must | Base para professor acessar suas disciplinas |
| salvarNota | Must | Funcionalidade principal do professor |
| registrarAula | Must | Registro de frequência/aulas |
| getNotasDaDisciplina | Must | Exibição de notas para lançamento |
| vincularProfessorAOferta | Should | Funcionalidade da secretaria |
| salvarNotasEmLote | Could | Otimização, não essencial |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/lib/professor-service.ts` | `getDisciplinasDoProfessor` | 🟢 |
| `src/lib/professor-service.ts` | `getNotasDaDisciplina` | 🟢 |
| `src/lib/professor-service.ts` | `salvarNota`, `salvarNotasEmLote` | 🟢 |
| `src/lib/professor-service.ts` | `registrarAula` | 🟢 |
| `src/lib/professor-service.ts` | `getAulasDaOferta`, `getAulasDoProfessor` | 🟢 |
| `src/lib/concurrency-control.ts` | `updateWithLock` | 🟢 |