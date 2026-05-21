import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CourseService } from './course-service'

const { mockFrom, mockAuditLog } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockAuditLog: vi.fn(() => Promise.resolve({ error: null })),
}))

vi.mock('./supabase', () => ({
  supabase: {
    from: mockFrom,
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    },
  },
}))

vi.mock('./audit-service', () => ({
  AuditService: {
    log: mockAuditLog,
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CourseService - Cursos', () => {
  it('getCursos: deve listar cursos ordenados por nome', async () => {
    const mockData = [{ id: '1', nome: 'Curso A' }]
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
      })),
    })

    const result = await CourseService.getCursos()

    expect(mockFrom).toHaveBeenCalledWith('cursos')
    expect(result.data).toEqual(mockData)
  })

  it('getCursosAtivos: deve filtrar cursos ativos', async () => {
    const mockData = [{ id: '1', nome: 'Curso Ativo', ativo: true }]
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
        })),
      })),
    })

    const result = await CourseService.getCursosAtivos()

    expect(result.data).toHaveLength(1)
  })

  it('createCurso: deve criar curso com tipo padrão tecnico e logar auditoria', async () => {
    const created = { id: '1', nome: 'Novo Curso', tipo: 'tecnico' }
    mockFrom.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: created, error: null })),
        })),
      })),
    })

    const result = await CourseService.createCurso({ nome: 'Novo Curso' })

    expect(result.data).toEqual(created)
    expect(result.error).toBeNull()
    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ acao: 'criar_curso' })
    )
  })

  it('createCurso: deve criar curso com tipo explícito', async () => {
    const created = { id: '2', nome: 'Curso Formação', tipo: 'formacao' }
    mockFrom.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: created, error: null })),
        })),
      })),
    })

    const result = await CourseService.createCurso({ nome: 'Curso Formação', tipo: 'formacao' })

    expect(result.data?.tipo).toBe('formacao')
  })

  it('createCurso: não deve logar auditoria se insert falhar', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'DB error' } })),
        })),
      })),
    })

    await CourseService.createCurso({ nome: 'Falha' })

    expect(mockAuditLog).not.toHaveBeenCalled()
  })

  it('desativarCurso: deve marcar ativo=false', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })

    const result = await CourseService.desativarCurso('curso-1')

    expect(result.error).toBeNull()
    expect(mockFrom).toHaveBeenCalledWith('cursos')
  })

  it('reativarCurso: deve marcar ativo=true', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })

    const result = await CourseService.reativarCurso('curso-1')

    expect(result.error).toBeNull()
  })
})

describe('CourseService - Matriz Curricular', () => {
  it('getMatrizCurricular: deve buscar disciplinas base do curso ordenadas', async () => {
    const mockData = [
      { id: 'db1', nome: 'Matemática', modulo: 'I Módulo', curso_id: 'c1' },
      { id: 'db2', nome: 'Português', modulo: 'I Módulo', curso_id: 'c1' },
    ]
    const order2 = vi.fn(() => Promise.resolve({ data: mockData, error: null }))
    const order1 = vi.fn(() => ({ order: order2 }))
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ order: order1 })),
      })),
    })

    const result = await CourseService.getMatrizCurricular('c1')

    expect(result.data).toHaveLength(2)
    expect(mockFrom).toHaveBeenCalledWith('disciplinas_base')
  })

  it('addDisciplinaAoCatalogo: deve inserir com carga horária padrão', async () => {
    const created = { id: 'db3', nome: 'Inglês', modulo: 'II Módulo', curso_id: 'c1', carga_horaria: 40 }
    mockFrom.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: created, error: null })),
        })),
      })),
    })

    const result = await CourseService.addDisciplinaAoCatalogo({
      nome: 'Inglês',
      modulo: 'II Módulo',
      cursoId: 'c1',
    })

    expect(result.data?.carga_horaria).toBe(40)
  })
})

describe('CourseService - Ofertas (turma_disciplinas)', () => {
  it('criarOfertaDisciplina: deve rejeitar duplicata', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn(() =>
              Promise.resolve({ data: { id: 'existing' }, error: null })
            ),
          })),
        })),
      })),
    })

    const result = await CourseService.criarOfertaDisciplina('turma-1', 'db-1')

    expect(result.error).toBeTruthy()
    expect(result.error!.message).toContain('já foi ofertada')
    expect(result.data).toBeNull()
  })

  it('criarOfertaDisciplina: deve criar oferta se não existir duplicata', async () => {
    const created = { id: 'oferta-1', turma_id: 'turma-1', disciplina_base_id: 'db-1' }
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
            })),
          })),
        })),
      })
      .mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: created, error: null })),
          })),
        })),
      })

    const result = await CourseService.criarOfertaDisciplina(
      'turma-1', 'db-1', 'prof-1', '2026-01-01', '2026-06-30'
    )

    expect(result.error).toBeNull()
    expect(result.data).toEqual(created)
  })

  it('atualizarDatasOferta: deve atualizar data_inicio e data_fim', async () => {
    const updated = { id: 'oferta-1', data_inicio: '2026-02-01', data_fim: '2026-07-31' }
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: updated, error: null })),
          })),
        })),
      })),
    })

    const result = await CourseService.atualizarDatasOferta('oferta-1', '2026-02-01', '2026-07-31')

    expect(result.data?.data_inicio).toBe('2026-02-01')
    expect(result.data?.data_fim).toBe('2026-07-31')
  })

  it('removerOfertaDisciplina: deve deletar oferta', async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: [{ id: 'oferta-1' }], error: null })),
        })),
      })),
    })

    const result = await CourseService.removerOfertaDisciplina('oferta-1')

    expect(result.error).toBeNull()
    expect(mockFrom).toHaveBeenCalledWith('turma_disciplinas')
  })
})

describe('CourseService - getOfertasDaTurma', () => {
  it('deve buscar ofertas com dados relacionados', async () => {
    const mockData = [
      {
        id: 'o1',
        disciplinas_base: { nome: 'Matemática' },
        perfis: { nome_completo: 'Prof A' },
      },
    ]
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
      })),
    })

    const result = await CourseService.getOfertasDaTurma('turma-1')

    expect(result.data).toHaveLength(1)
    expect(mockFrom).toHaveBeenCalledWith('turma_disciplinas')
  })
})
