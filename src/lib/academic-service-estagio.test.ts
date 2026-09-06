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

describe('AcademicService - Lançamento de Estágio em Lote', () => {
  it('upsertNotaEstagioLote: deve retornar lista vazia se array for vazio ou nulo', async () => {
    const res1 = await AcademicService.upsertNotaEstagioLote([])
    expect(res1.data).toEqual([])
    expect(res1.error).toBeNull()

    const res2 = await AcademicService.upsertNotaEstagioLote(null as any)
    expect(res2.data).toEqual([])
    expect(res2.error).toBeNull()
  })

  it('upsertNotaEstagioLote: deve salvar notas de estágio em lote para múltiplos alunos', async () => {
    // Mock para upsertNotaEstagio
    vi.spyOn(AcademicService, 'upsertNotaEstagio').mockImplementation(async (alunoId, discId, nota, parecer) => {
      return {
        data: [{ id: `boletim-${alunoId}`, aluno_id: alunoId, disciplina_base_id: discId, nota_estagio: nota, estagio_parecer: parecer }],
        error: null,
      }
    })

    const payload = [
      { aluno_id: 'aluno-1', disciplina_base_id: 'db-estagio', nota: 9.5, estagio_parecer: 'Aprovado excelente' },
      { aluno_id: 'aluno-2', disciplina_base_id: 'db-estagio', nota: 8.0, estagio_parecer: 'Aprovado' },
    ]

    const result = await AcademicService.upsertNotaEstagioLote(payload)

    expect(AcademicService.upsertNotaEstagio).toHaveBeenCalledTimes(2)
    expect(AcademicService.upsertNotaEstagio).toHaveBeenCalledWith('aluno-1', 'db-estagio', 9.5, 'Aprovado excelente')
    expect(AcademicService.upsertNotaEstagio).toHaveBeenCalledWith('aluno-2', 'db-estagio', 8.0, 'Aprovado')
    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(2)
  })

  it('upsertNotaEstagioLote: deve persistir nota de estágio mesmo se aluno tiver bloqueio financeiro', async () => {
    // Aluno inadimplente
    const alunoInadimplenteId = 'aluno-inadimplente-123'
    
    vi.spyOn(AcademicService, 'upsertNotaEstagio').mockImplementation(async (alunoId, discId, nota) => {
      return {
        data: [{ id: 'b-1', aluno_id: alunoId, disciplina_base_id: discId, nota_estagio: nota }],
        error: null,
      }
    })

    const payload = [
      { aluno_id: alunoInadimplenteId, disciplina_base_id: 'db-estagio', nota: 10.0 }
    ]

    const result = await AcademicService.upsertNotaEstagioLote(payload)

    expect(result.error).toBeNull()
    expect(result.data).toBeDefined()
    expect(AcademicService.upsertNotaEstagio).toHaveBeenCalledWith(alunoInadimplenteId, 'db-estagio', 10.0, undefined)
  })
})
