import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AcademicService } from './academic-service'

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }))

vi.mock('./supabase', () => ({
  supabase: { from: mockFrom },
}))

interface Cenario {
  turma: any
  ofertas: any[]
  matriculas: any[]
  boletins: any[]
}

function configurar({ turma, ofertas, matriculas, boletins }: Cenario) {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'turmas') {
      return {
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: turma, error: null }),
          }),
        }),
      }
    }
    if (table === 'turma_disciplinas') {
      return {
        select: () => ({
          eq: () => Promise.resolve({ data: ofertas, error: null }),
        }),
      }
    }
    if (table === 'matriculas') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => Promise.resolve({ data: matriculas, error: null }),
          }),
        }),
      }
    }
    if (table === 'boletim') {
      return {
        select: () => ({
          in: () => ({
            in: () => Promise.resolve({ data: boletins, error: null }),
          }),
        }),
      }
    }
    throw new Error(`tabela inesperada: ${table}`)
  })
}

function cenarioBase(): Cenario {
  return {
    turma: { id: 't1', nome: 'Técnico A', periodo: '2026.1', cursos: { tipo_curso: 'tecnico' } },
    ofertas: [
      { id: 'o1', disciplina_base_id: 'd1', disciplinas_base: { id: 'd1', nome: 'Anatomia', modulo: 'I', ordem: 1, carga_horaria: 40 } },
      { id: 'o2', disciplina_base_id: 'd2', disciplinas_base: { id: 'd2', nome: 'Farmacologia', modulo: 'I', ordem: 2, carga_horaria: 40 } },
    ],
    matriculas: [
      { aluno_id: 'a1', status_aluno: 'ativo' },
      { aluno_id: 'a2', status_aluno: 'ativo' },
    ],
    boletins: [
      { aluno_id: 'a1', disciplina_base_id: 'd1', n1: 8, n2: 7, n3: 6, rec: 0, faltas: 4, nota_estagio: null },
      { aluno_id: 'a1', disciplina_base_id: 'd2', n1: 6, n2: 6, n3: 6, rec: 0, faltas: 0, nota_estagio: null },
      { aluno_id: 'a2', disciplina_base_id: 'd1', n1: 5, n2: 5, n3: 5, rec: 7, faltas: 12, nota_estagio: null },
      { aluno_id: 'a2', disciplina_base_id: 'd2', n1: 0, n2: 0, n3: 0, rec: 0, faltas: 0, nota_estagio: 'AP' },
    ],
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AcademicService.getIndicadoresPedagogicosTurma', () => {
  it('calcula média, presença, ranges e quebra por disciplina', async () => {
    configurar(cenarioBase())

    const { data, error } = await AcademicService.getIndicadoresPedagogicosTurma('t1')

    expect(error).toBeNull()
    expect(data).toMatchObject({
      turma_id: 't1',
      turma_nome: 'Técnico A',
      tipo_curso: 'tecnico',
      total_alunos_ativos: 2,
      alunos_com_dados: 2,
      total_disciplinas: 2,
      media_geral: 6.3,
      media_maior: 6.5,
      media_menor: 6,
      presenca_geral: 90,
      presenca_maior: 95,
      presenca_menor: 85,
    })

    expect(data?.disciplinas).toHaveLength(2)
    expect(data?.disciplinas[0]).toMatchObject({
      disciplina_base_id: 'd1',
      media: 6.5,
      maior: 7,
      menor: 6,
      presenca_media: 80,
      alunos_com_nota: 2,
      alunos_com_boletim: 2,
    })
    expect(data?.disciplinas[1]).toMatchObject({
      disciplina_base_id: 'd2',
      media: 6,
      maior: 6,
      menor: 6,
      presenca_media: 100,
      alunos_com_nota: 1,
      alunos_com_boletim: 2,
    })
    expect(mockFrom).toHaveBeenCalledTimes(4)
  })

  it('ignora disciplina não ofertada e boletim de aluno fora do conjunto', async () => {
    const cenario = cenarioBase()
    cenario.boletins.push(
      { aluno_id: 'a1', disciplina_base_id: 'd3', n1: 10, n2: 10, n3: 10, rec: 0, faltas: 0 },
      { aluno_id: 'a9', disciplina_base_id: 'd1', n1: 10, n2: 10, n3: 10, rec: 0, faltas: 0 },
    )
    configurar(cenario)

    const { data } = await AcademicService.getIndicadoresPedagogicosTurma('t1')

    expect(data?.disciplinas.map((d) => d.disciplina_base_id)).toEqual(['d1', 'd2'])
    expect(data?.media_maior).toBe(6.5)
    expect(data?.total_alunos_ativos).toBe(2)
  })

  it('trata turma de formação como indisponível', async () => {
    const cenario = cenarioBase()
    cenario.turma.cursos.tipo_curso = 'formacao'
    configurar(cenario)

    const { data, error } = await AcademicService.getIndicadoresPedagogicosTurma('t1')

    expect(data).toBeNull()
    expect(error?.message).toContain('apenas para cursos técnicos')
    expect(mockFrom).toHaveBeenCalledTimes(1)
  })

  it('aceita tipo de curso nulo como técnico', async () => {
    const cenario = cenarioBase()
    cenario.turma.cursos.tipo_curso = null
    configurar(cenario)

    const { data, error } = await AcademicService.getIndicadoresPedagogicosTurma('t1')

    expect(error).toBeNull()
    expect(data?.tipo_curso).toBeNull()
    expect(data?.media_geral).toBe(6.3)
  })

  it('retorna indicadores nulos quando não há alunos ou disciplinas', async () => {
    configurar({ ...cenarioBase(), ofertas: [], matriculas: [], boletins: [] })

    const { data, error } = await AcademicService.getIndicadoresPedagogicosTurma('t1')

    expect(error).toBeNull()
    expect(data).toMatchObject({
      total_alunos_ativos: 0,
      alunos_com_dados: 0,
      total_disciplinas: 0,
      media_geral: null,
      media_maior: null,
      media_menor: null,
      presenca_geral: null,
      presenca_maior: null,
      presenca_menor: null,
      disciplinas: [],
    })
    expect(mockFrom).toHaveBeenCalledTimes(3)
  })

  it('filtra somente alunos ativos na consulta', async () => {
    const cenario = cenarioBase()
    const eqStatus = vi.fn(() => Promise.resolve({ data: cenario.matriculas, error: null }))
    const eqTurma = vi.fn(() => ({ eq: eqStatus }))

    mockFrom.mockImplementation((table: string) => {
      if (table === 'turmas') {
        return { select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: cenario.turma, error: null }) }) }) }
      }
      if (table === 'turma_disciplinas') {
        return { select: () => ({ eq: () => Promise.resolve({ data: cenario.ofertas, error: null }) }) }
      }
      if (table === 'matriculas') {
        return { select: () => ({ eq: eqTurma }) }
      }
      return {
        select: () => ({ in: () => ({ in: () => Promise.resolve({ data: cenario.boletins, error: null }) }) }),
      }
    })

    await AcademicService.getIndicadoresPedagogicosTurma('t1')

    expect(eqTurma).toHaveBeenCalledWith('turma_id', 't1')
    expect(eqStatus).toHaveBeenCalledWith('status_aluno', 'ativo')
  })
})
