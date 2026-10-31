# Data Delta: Indicadores Pedagógicos da Turma

> Identificador: `013-indicadores-turma`
> Data: `2026-10-30`
> Modelo extraído de referência: `_reversa_sdd/` e `supabase/schema.sql`

## 1. Resumo

Nenhuma alteração de schema. A feature é um read model derivado das tabelas existentes. Não há migração, coluna nova, índice novo ou backfill.

## 2. Tabelas lidas

| Tabela | Campos usados | Uso |
|--------|---------------|-----|
| `turmas` | `id`, `nome`, `periodo`, `curso_id` | Identificar a turma e o curso |
| `cursos` | `id`, `nome`, `tipo_curso` | Decidir se a aba é técnica ou formação |
| `turma_disciplinas` | `id`, `turma_id`, `disciplina_base_id` | Definir as disciplinas ofertadas na turma |
| `disciplinas_base` | `id`, `nome`, `modulo`, `ordem`, `carga_horaria` | Nome, ordenação e carga horária para presença |
| `matriculas` | `turma_id`, `aluno_id`, `status_aluno` | Selecionar alunos ativos |
| `perfis` | `id`, `nome_completo` | Nome do aluno no detalhe, se necessário |
| `boletim` | `aluno_id`, `disciplina_base_id`, `faltas`, `n1`, `n2`, `n3`, `rec`, `nota_estagio`, `status` | Notas, faltas e presença |

## 3. Dados derivados

| Indicador | Fórmula | Arredondamento | Ausência de dado |
|-----------|---------|----------------|------------------|
| Nota final por disciplina | `calcularNotaFinal(calcularMediaParcial(n1, n2, n3), rec)` | `grades-utils` | Disciplina sem `n1`, `n2` ou `n3` maior que zero não entra |
| Presença por disciplina | `clamp(100 - faltas * 100 / carga_horaria, 0, 100)` | Inteiro | `carga_horaria <= 0` segue a Ata: 100% |
| Média do aluno | Média aritmética das notas finais das disciplinas com dado | Uma casa decimal na exibição | Sem nota: aluno fora da média |
| Presença do aluno | Média aritmética das presenças das disciplinas com boletim | Inteiro na exibição | Sem boletim: aluno fora da presença |
| Média da turma | Média aritmética das médias dos alunos com dado | Uma casa decimal | Sem aluno com dado: traço |
| Presença da turma | Média aritmética das presenças dos alunos com dado | Inteiro | Sem aluno com dado: traço |
| Maior e menor média | Máximo e mínimo das médias dos alunos | Uma casa decimal | Sem dado: traço |
| Maior e menor presença | Máximo e mínimo das presenças dos alunos | Inteiro | Sem dado: traço |
| Quebra por disciplina | Média, máximo e mínimo das notas finais por disciplina; média das presenças | Uma casa decimal e inteiro | Disciplina sem dado: traço |

## 4. Regras de junção

1. `turma_disciplinas` define o conjunto de disciplinas. Duplicatas por `disciplina_base_id` são removidas, preservando a primeira ocorrência, como em `getDisciplinasDaTurma`.
2. `matriculas` entra com `status_aluno = 'ativo'`.
3. `boletim` é indexado por `aluno_id:disciplina_base_id`, com a última ocorrência vencendo, mesmo critério da Ata em `academic-service.ts:403-407`.
4. Boletim de aluno fora do conjunto de alunos ativos é ignorado.
5. Boletim de disciplina fora das ofertas da turma é ignorado.
6. `nota_estagio` é lida apenas para não confundir com nota numérica; não entra nas médias.

## 5. Tipos novos

```ts
export interface IndicadorDisciplina {
  disciplina_base_id: string
  nome: string
  modulo: string | null
  carga_horaria: number
  media: number | null
  maior: number | null
  menor: number | null
  presenca_media: number | null
  alunos_com_nota: number
  alunos_com_boletim: number
}

export interface IndicadoresPedagogicosTurma {
  turma_id: string
  turma_nome: string
  periodo: string
  tipo_curso: string | null
  total_alunos_ativos: number
  alunos_com_dados: number
  total_disciplinas: number
  media_geral: number | null
  media_maior: number | null
  media_menor: number | null
  presenca_geral: number | null
  presenca_maior: number | null
  presenca_menor: number | null
  disciplinas: IndicadorDisciplina[]
}
```

## 6. Migrações

n/a. Nenhuma alteração de banco.

## 7. Riscos de dados

| Risco | Mitigação |
|-------|-----------|
| `boletim` com mais de um registro para o mesmo aluno e disciplina base | Mapa por `aluno_id:disciplina_base_id`, última ocorrência vence, igual à Ata |
| `carga_horaria` nula ou zero | Segue a regra da Ata: presença 100% quando não há carga horária |
| Turma sem alunos ou sem ofertas | Payload com contadores zerados e indicadores nulos, sem erro |
| Curso com `tipo_curso` nulo | Tratado como técnico para manter o comportamento atual de Grade e Notas |
| Aluno sem boletim | Fora da média e da presença, evitando zero e 100% artificiais |
