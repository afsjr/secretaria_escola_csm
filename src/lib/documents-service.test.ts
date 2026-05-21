import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DocumentsService } from './documents-service'

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }))

vi.mock('./supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DocumentsService - getPendingByUser', () => {
  it('deve retornar apenas solicitacoes pendentes do usuario', async () => {
    const mockData = [
      { id: '1', user_id: 'u1', tipo: 'Declaração', status: 'pendente', criado_em: '2026-05-21T12:00:00Z' },
      { id: '2', user_id: 'u1', tipo: 'Histórico', status: 'pendente', criado_em: '2026-05-20T10:00:00Z' },
    ]
    const mockOrder2 = vi.fn(() => Promise.resolve({ data: mockData, error: null }))
    const mockOrder1 = vi.fn(() => ({ order: mockOrder2 }))
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({ order: mockOrder1 })),
        })),
      })),
    })

    const result = await DocumentsService.getPendingByUser('u1')

    expect(mockFrom).toHaveBeenCalledWith('solicitacoes')
    expect(result.data).toEqual(mockData)
    expect(result.data).toHaveLength(2)
  })

  it('deve filtrar apenas pendentes', async () => {
    const mockOrder2 = vi.fn(() => Promise.resolve({ data: [], error: null }))
    const mockOrder1 = vi.fn(() => ({ order: mockOrder2 }))
    let capturedStatus = ''
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn((field, val) => {
          if (field === 'user_id') {
            capturedStatus = ''
            return { eq: vi.fn((f, v) => {
              if (f === 'status') capturedStatus = v
              return { order: mockOrder1 }
            })}
          }
          return { eq: vi.fn(() => ({ order: mockOrder1 })) }
        }),
      })),
    })

    await DocumentsService.getPendingByUser('u1')

    expect(capturedStatus).toBe('pendente')
  })

  it('deve retornar array vazio quando nao ha pendentes', async () => {
    const mockOrder2 = vi.fn(() => Promise.resolve({ data: [], error: null }))
    const mockOrder1 = vi.fn(() => ({ order: mockOrder2 }))
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({ order: mockOrder1 })),
        })),
      })),
    })

    const result = await DocumentsService.getPendingByUser('u1')

    expect(result.data).toEqual([])
  })

  it('deve ordenar por criado_em descendente', async () => {
    let capturedDirection = ''
    const mockOrder2 = vi.fn((_col, dir) => {
      capturedDirection = dir
      return Promise.resolve({ data: [], error: null })
    })
    const mockOrder1 = vi.fn(() => ({ order: mockOrder2 }))
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({ order: mockOrder1 })),
        })),
      })),
    })

    await DocumentsService.getPendingByUser('u1')

    expect(capturedDirection).toBe(false)
  })
})
