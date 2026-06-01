import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AcademicService } from './academic-service'

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }))

vi.mock('./supabase', () => ({
  supabase: {
    from: mockFrom,
    auth: {
      getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
    },
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AcademicService - Turmas', () => {
  it('getTurmas: deve listar turmas ordenadas', async () => {
    const mockData = [{ id: '1', nome: 'Turma A', periodo: '2026.1' }]
    const mockOrder2 = vi.fn(() => Promise.resolve({ data: mockData, error: null, count: 1 }))
    const mockOrder1 = vi.fn(() => ({ order: mockOrder2 }))
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({ order: mockOrder1 })),
    })

    const result = await AcademicService.getTurmas()

    expect(mockFrom).toHaveBeenCalledWith('turmas')
    expect(result.data).toEqual(mockData)
  })

  it('createTurma: deve criar turma e retornar o registro', async () => {
    const created = { id: '1', nome: 'Nova Turma', periodo: '2026.2' }
    mockFrom.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: created, error: null })),
        })),
      })),
    })

    const result = await AcademicService.createTurma({
      nome: 'Nova Turma',
      periodo: '2026.2',
      curso_id: 'curso-1',
    })

    expect(result.data).toEqual(created)
  })

  it('updateTurma: deve atualizar campos da turma', async () => {
    const updated = { id: '1', nome: 'Turma Editada' }
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: updated, error: null })),
          })),
        })),
      })),
    })

    const result = await AcademicService.updateTurma('1', { nome: 'Turma Editada' })

    expect(result.data?.nome).toBe('Turma Editada')
  })

  it('deleteTurma: deve retornar erro se nenhuma linha deletada', async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    })

    const result = await AcademicService.deleteTurma('id-inexistente')

    expect(result.error).toBeTruthy()
    expect(result.error!.message).toContain('Não foi possível excluir')
  })

  it('deleteTurma: deve retornar null se deletou com sucesso', async () => {
    mockFrom.mockReturnValue({
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: [{ id: '1' }], error: null })),
        })),
      })),
    })

    const result = await AcademicService.deleteTurma('id-valido')

    expect(result.error).toBeNull()
  })
})

describe('AcademicService - getTipoDaTurma', () => {
  it('deve retornar tipo do curso da turma', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({ data: { cursos: { tipo_curso: 'tecnico' } }, error: null })
          ),
        })),
      })),
    })

    const tipo = await AcademicService.getTipoDaTurma('turma-1')

    expect(tipo).toBe('tecnico')
    expect(mockFrom).toHaveBeenCalledWith('turmas')
  })

  it('deve retornar null quando não encontrar', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })

    const tipo = await AcademicService.getTipoDaTurma('turma-x')
    expect(tipo).toBeNull()
  })
})

describe('AcademicService - matricularAluno', () => {
  it('deve bloquear matrícula se aluno já ativo em turma não-formação', async () => {
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: { cursos: { tipo_curso: 'tecnico' } }, error: null })
            ),
          })),
        })),
      })
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() =>
              Promise.resolve({
                data: [{ id: 'm1', turmas: { nome: 'Turma Ativa' } }],
                error: null,
              })
            ),
          })),
        })),
      })

    const result = await AcademicService.matricularAluno('aluno-1', 'turma-1')

    expect(result.error).toBeTruthy()
    expect(result.error!.message).toContain('já ativo')
  })

  it('deve permitir matrícula se curso é formacao (mesmo com outra ativa)', async () => {
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: { cursos: { tipo_curso: 'formacao' } }, error: null })
            ),
          })),
        })),
      })
      .mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: { id: 'm2', aluno_id: 'aluno-1' }, error: null })
            ),
          })),
        })),
      })

    const result = await AcademicService.matricularAluno('aluno-1', 'turma-formacao')

    expect(result.error).toBeNull()
    expect(result.data).toBeTruthy()
  })

  it('deve permitir matrícula se aluno não tem matrícula ativa', async () => {
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: { cursos: { tipo_curso: 'tecnico' } }, error: null })
            ),
          })),
        })),
      })
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
        })),
      })
      .mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: { id: 'm3' }, error: null })),
          })),
        })),
      })

    const result = await AcademicService.matricularAluno('aluno-2', 'turma-2')

    expect(result.error).toBeNull()
    expect(result.data).toBeTruthy()
  })
})

describe('AcademicService - getDisciplinasDaTurma', () => {
  it('deve deduplicar disciplinas por nome+módulo', async () => {
    const rawData = [
      { id: '1', disciplina_base_id: 'db1', disciplinas_base: { nome: '  Matemática  ', modulo: 'I Módulo' }, perfis: { nome_completo: 'Prof A' } },
      { id: '2', disciplina_base_id: 'db1', disciplinas_base: { nome: 'Matemática', modulo: 'I Módulo' }, perfis: { nome_completo: 'Prof B' } },
      { id: '3', disciplina_base_id: 'db2', disciplinas_base: { nome: 'Português', modulo: 'I Módulo' }, perfis: { nome_completo: 'Prof C' } },
    ]
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: rawData, error: null })),
      })),
    })

    const result = await AcademicService.getDisciplinasDaTurma('turma-1')

    expect(result.data?.disciplinas).toHaveLength(2)
    expect(result.data?.disciplinas.map((d: any) => d.nome)).toEqual(
      expect.arrayContaining(['Matemática', 'Português'])
    )
  })

  it('deve retornar disciplinas únicas normalmente', async () => {
    const rawData = [
      { id: '1', disciplina_base_id: 'db1', disciplinas_base: { nome: 'Matemática', modulo: 'I Módulo' }, perfis: { nome_completo: 'Prof A' } },
      { id: '2', disciplina_base_id: 'db2', disciplinas_base: { nome: 'Português', modulo: 'I Módulo' }, perfis: { nome_completo: 'Prof B' } },
    ]
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: rawData, error: null })),
      })),
    })

    const result = await AcademicService.getDisciplinasDaTurma('turma-1')

    expect(result.data?.disciplinas).toHaveLength(2)
  })
})

describe('AcademicService - getNotasCompletasTurma', () => {
  it('deve combinar alunos e notas em mapa', async () => {
    const matriculas = [
      { id: 'm1', status_aluno: 'ativo', perfis: { id: 'a1', nome_completo: 'Aluno 1' } },
      { id: 'm2', status_aluno: 'ativo', perfis: { id: 'a2', nome_completo: 'Aluno 2' } },
    ]
    const notas = [
      { aluno_id: 'a1', n1: 8, n2: 7, n3: 9 },
    ]

    vi.spyOn(AcademicService, 'getAlunosDaTurma' as any).mockResolvedValue({ data: matriculas, error: null })

    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: notas, error: null })),
      })),
    })

    const result = await AcademicService.getNotasCompletasTurma('turma-1', 'db-1')

    expect(result.data?.alunos).toHaveLength(2)
    expect(result.data?.notasMap['a1']).toBeDefined()
    expect(result.data?.notasMap['a1'].n1).toBe(8)
    expect(result.data?.totalAtivos).toBe(2)
  })

  it('deve retornar erro se falhar buscar matriculas', async () => {
    vi.spyOn(AcademicService, 'getAlunosDaTurma' as any).mockResolvedValue({
      data: null,
      error: { message: 'Erro ao buscar matriculas' },
    })

    const result = await AcademicService.getNotasCompletasTurma('turma-1', 'db-1')

    expect(result.error).toBeTruthy()
    expect(result.data).toBeNull()
  })
})

describe('AcademicService - getBoletim', () => {
  it('deve buscar boletim com dados da disciplina base', async () => {
    const mockData = [
      { id: 'b1', aluno_id: 'a1', disciplinas_base: { nome: 'Matemática', modulo: 'I Módulo' } },
    ]
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
      })),
    })

    const result = await AcademicService.getBoletim('a1')

    expect(result.data).toHaveLength(1)
    expect(result.data![0].disciplinas_base.nome).toBe('Matemática')
  })
})

describe('AcademicService - getAulasPorTurmaPeriodo', () => {
  const rawMockData = [
    {
      data: '2026-02-05',
      conteudo: 'Sistema esquelético - ossos do crânio',
      turma_disciplinas: {
        disciplinas_base: { nome: 'Anatomia e Fisiologia Humana', carga_horaria: 80 },
        perfis: { nome_completo: 'João Silva' },
      },
    },
    {
      data: '2026-02-12',
      conteudo: 'Sistema muscular - contração muscular',
      turma_disciplinas: {
        disciplinas_base: { nome: 'Anatomia e Fisiologia Humana', carga_horaria: 80 },
        perfis: { nome_completo: 'João Silva' },
      },
    },
    {
      data: '2026-02-10',
      conteudo: 'Bactérias Gram-positivas',
      turma_disciplinas: {
        disciplinas_base: { nome: 'Microbiologia e Parasitologia', carga_horaria: 60 },
        perfis: { nome_completo: 'Maria Santos' },
      },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve retornar aulas agrupadas por disciplina', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: rawMockData, error: null })),
            })),
          })),
        })),
      }))
    })

    const result = await AcademicService.getAulasPorTurmaPeriodo('turma-1', '2026-01-01', '2026-12-31')

    expect(result.error).toBeNull()
    expect(result.data?.disciplinas).toHaveLength(2)

    const anatomia = result.data!.disciplinas.find(d => d.disciplina_nome === 'Anatomia e Fisiologia Humana')
    expect(anatomia).toBeDefined()
    expect(anatomia!.aulas).toHaveLength(2)
    expect(anatomia!.professor_nome).toBe('João Silva')
    expect(anatomia!.carga_horaria).toBe(80)

    const microbio = result.data!.disciplinas.find(d => d.disciplina_nome === 'Microbiologia e Parasitologia')
    expect(microbio).toBeDefined()
    expect(microbio!.aulas).toHaveLength(1)
    expect(microbio!.professor_nome).toBe('Maria Santos')
  })

  it('deve ordenar aulas por data dentro de cada disciplina', async () => {
    const dataForaDeOrdem = [
      { ...rawMockData[1] },
      { ...rawMockData[0] },
    ]

    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: dataForaDeOrdem, error: null })),
            })),
          })),
        })),
      }))
    })

    const result = await AcademicService.getAulasPorTurmaPeriodo('turma-1', '2026-01-01', '2026-12-31')

    const anatomia = result.data!.disciplinas.find(d => d.disciplina_nome === 'Anatomia e Fisiologia Humana')
    expect(anatomia!.aulas[0].data).toBe('2026-02-05')
    expect(anatomia!.aulas[1].data).toBe('2026-02-12')
  })

  it('deve retornar disciplinas vazio quando não há aulas no período', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        })),
      })),
    })

    const result = await AcademicService.getAulasPorTurmaPeriodo('turma-1', '2026-01-01', '2026-12-31')

    expect(result.data?.disciplinas).toHaveLength(0)
  })

  it('deve filtrar por turma corretamente', async () => {
    const mockEq = vi.fn()
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: mockEq.mockReturnValue({
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        }),
      })),
    })

    await AcademicService.getAulasPorTurmaPeriodo('turma-x', '2026-01-01', '2026-12-31')

    expect(mockFrom).toHaveBeenCalledWith('aulas')
    expect(mockEq).toHaveBeenCalledWith('turma_disciplinas.turma_id', 'turma-x')
  })

  it('deve filtrar por período (gte e lte)', async () => {
    const mockGte = vi.fn()
    const mockLte = vi.fn()
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: mockGte.mockReturnValue({
            lte: mockLte.mockReturnValue({
              order: vi.fn(() => Promise.resolve({ data: [], error: null })),
            }),
          }),
        })),
      })),
    })

    await AcademicService.getAulasPorTurmaPeriodo('turma-1', '2026-03-01', '2026-06-30')

    expect(mockGte).toHaveBeenCalledWith('data', '2026-03-01')
    expect(mockLte).toHaveBeenCalledWith('data', '2026-06-30')
  })

  it('deve propagar erro do banco', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          gte: vi.fn(() => ({
            lte: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Erro de conexão' } })),
            })),
          })),
        })),
      }))
    })

    const result = await AcademicService.getAulasPorTurmaPeriodo('turma-1', '2026-01-01', '2026-12-31')

    expect(result.data).toBeNull()
    expect(result.error?.message).toBe('Erro de conexão')
  })
})
