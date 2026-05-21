import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProfessorService } from './professor-service'

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

describe('ProfessorService - Disciplinas do Professor', () => {
  it('getDisciplinasDoProfessor: deve buscar ofertas do professor', async () => {
    const mockData = [
      {
        id: 'td1',
        disciplinas_base: { nome: 'Matemática', modulo: 'I Módulo' },
        turmas: { id: 't1', nome: 'Turma A', cursos: { nome: 'Curso X' } },
      },
    ]
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
        })),
      })),
    })

    const result = await ProfessorService.getDisciplinasDoProfessor('prof-1')

    expect(result.data).toHaveLength(1)
    expect(mockFrom).toHaveBeenCalledWith('turma_disciplinas')
  })

  it('getAllOfertas: deve listar todas as ofertas', async () => {
    const mockData = [{ id: 'td1', turmas: { nome: 'Turma A' } }]
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
      })),
    })

    const result = await ProfessorService.getAllOfertas()

    expect(result.data).toHaveLength(1)
  })

  it('vincularProfessorAOferta: deve atualizar professor_id', async () => {
    const updated = { id: 'td1', professor_id: 'prof-2' }
    mockFrom.mockReturnValue({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: updated, error: null })),
          })),
        })),
      })),
    })

    const result = await ProfessorService.vincularProfessorAOferta('td1', 'prof-2')

    expect(result.data?.professor_id).toBe('prof-2')
  })
})

describe('ProfessorService - getNotasDaDisciplina', () => {
  it('deve retornar alunos com notas e detectar pendentes', async () => {
    const matriculas = [
      { id: 'm1', status_aluno: 'ativo', perfis: { id: 'a1', nome_completo: 'Aluno 1', email: 'a1@e.com' } },
      { id: 'm2', status_aluno: 'ativo', perfis: { id: 'a2', nome_completo: 'Aluno 2', email: 'a2@e.com' } },
    ]
    const nota = { aluno_id: 'a1', n1: 8, n2: 7, n3: 9, rec: 0, faltas: 2, versao: 3, status: null }

    mockFrom
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: matriculas, error: null })),
            })),
          })),
        })),
      })
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: nota, error: null })),
            })),
          })),
        })),
      })
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({ data: null, error: { message: 'not found', code: 'PGRST116' } })
              ),
            })),
          })),
        })),
      })

    const result = await ProfessorService.getNotasDaDisciplina('db-1', 'turma-1')

    expect(result.data).toHaveLength(2)
    expect(result.data![0].aluno_nome).toBe('Aluno 1')
    expect(result.data![0].nota?.n1).toBe(8)
    expect(result.data![0].pendente).toBe(false)
    expect(result.data![1].nota).toBeNull()
    expect(result.data![1].pendente).toBe(false)
  })

  it('deve marcar pendente=true quando nota tem status=pendente', async () => {
    const matriculas = [
      { id: 'm1', status_aluno: 'ativo', perfis: { id: 'a1', nome_completo: 'Aluno Pendente', email: 'a@e.com' } },
    ]
    const notaPendente = { aluno_id: 'a1', n1: 0, n2: 0, n3: 0, rec: 0, faltas: 0, versao: 1, status: 'pendente' }

    mockFrom
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => Promise.resolve({ data: matriculas, error: null })),
            })),
          })),
        })),
      })
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({ data: notaPendente, error: null })),
            })),
          })),
        })),
      })

    const result = await ProfessorService.getNotasDaDisciplina('db-1', 'turma-1')

    expect(result.data![0].pendente).toBe(true)
    expect(result.data![0].nota).toBeNull()
  })

  it('deve retornar erro se falhar buscar matrículas', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({ data: null, error: { message: 'DB error' } })),
          })),
        })),
      })),
    })

    const result = await ProfessorService.getNotasDaDisciplina('db-1', 'turma-1')

    expect(result.error).toBeTruthy()
    expect(result.data).toBeNull()
  })
})

describe('ProfessorService - salvarNota', () => {
  it('deve criar nova nota quando não existe registro', async () => {
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: { nome: 'Matemática' }, error: null })
            ),
          })),
        })),
      })
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({ data: null, error: { message: 'not found', code: 'PGRST116' } })
              ),
            })),
          })),
        })),
      })
      .mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: { id: 'b1', aluno_id: 'a1', n1: 8, versao: 1 }, error: null })
            ),
          })),
        })),
      })

    const result = await ProfessorService.salvarNota('a1', 'db-1', {
      faltas: 2, n1: 8, n2: 7, n3: 9, rec: 0,
    }, 1)

    expect(result.data).toBeTruthy()
    expect(result.error).toBeNull()
  })

  it('deve fazer update com optimistic lock quando nota já existe', async () => {
    mockFrom
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() =>
              Promise.resolve({ data: { nome: 'Matemática' }, error: null })
            ),
          })),
        })),
      })
      .mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({ data: { id: 'b1' }, error: null })
              ),
            })),
          })),
        })),
      })
      .mockReturnValueOnce({
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({ data: { id: 'b1', n1: 9, versao: 4 }, error: null })
                ),
              })),
            })),
          })),
        })),
      })

    const result = await ProfessorService.salvarNota('a1', 'db-1', {
      faltas: 2, n1: 9, n2: 7, n3: 9, rec: 0,
    }, 3)

    expect(result.data).toBeTruthy()
    expect(result.error).toBeNull()
  })
})

describe('ProfessorService - registrarAula', () => {
  it('deve registrar aula e logar auditoria', async () => {
    const aulaCriada = { id: 'aula-1', conteudo: 'Revisão' }
    mockFrom.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: aulaCriada, error: null })),
        })),
      })),
    })

    const result = await ProfessorService.registrarAula({
      turma_disciplina_id: 'td-1',
      professor_id: 'prof-1',
      conteudo: 'Revisão',
    })

    expect(result.data?.conteudo).toBe('Revisão')
    expect(mockAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ acao: 'registrar_aula' })
    )
  })

  it('não deve logar auditoria se insert falhar', async () => {
    mockFrom.mockReturnValue({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'DB error' } })),
        })),
      })),
    })

    await ProfessorService.registrarAula({
      turma_disciplina_id: 'td-1',
      professor_id: 'prof-1',
      conteudo: 'Falha',
    })

    expect(mockAuditLog).not.toHaveBeenCalled()
  })
})

describe('ProfessorService - getAulasDaOferta', () => {
  it('deve buscar aulas de uma oferta específica', async () => {
    const mockData = [{ id: 'a1', conteudo: 'Aula 1', perfis: { nome_completo: 'Prof' } }]
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
        })),
      })),
    })

    const result = await ProfessorService.getAulasDaOferta('td-1')

    expect(result.data).toHaveLength(1)
    expect(result.data![0].conteudo).toBe('Aula 1')
  })
})

describe('ProfessorService - auxiliares', () => {
  it('getProfessores: deve listar perfis de professor', async () => {
    const mockData = [{ id: 'p1', nome_completo: 'Prof A' }]
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
        })),
      })),
    })

    const result = await ProfessorService.getProfessores()

    expect(result.data).toHaveLength(1)
  })

  it('contarAlunosTurma: deve retornar contagem', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ count: 5, error: null })),
        })),
      })),
    })

    const result = await ProfessorService.contarAlunosTurma('turma-1')

    expect(result.count).toBe(5)
  })

  it('contarAlunosTurma: deve retornar 0 se count for null', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ count: null, error: null })),
        })),
      })),
    })

    const result = await ProfessorService.contarAlunosTurma('turma-1')

    expect(result.count).toBe(0)
  })

  it('getAlunosDaTurma: deve buscar alunos ativos da turma', async () => {
    const mockData = [{ id: 'm1', perfis: { nome_completo: 'Aluno' } }]
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: mockData, error: null })),
        })),
      })),
    })

    const result = await ProfessorService.getAlunosDaTurma('turma-1')

    expect(result.data).toHaveLength(1)
  })

  it('salvarFrequencia: deve retornar sucesso (stub)', async () => {
    const result = await ProfessorService.salvarFrequencia('t1', 'd1', '2026-01-01', [])

    expect(result.error).toBeNull()
    expect(result.data).toBe(true)
  })
})
