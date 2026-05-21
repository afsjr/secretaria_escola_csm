import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DocumentsService } from './documents-service'

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }))

vi.mock('./supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}))

function makeChain(opts: { data?: any; error?: any } = {}) {
  const result = Promise.resolve({ data: opts.data ?? null, error: opts.error ?? null })
  const order = vi.fn(() => result)
  const eq2 = vi.fn(() => ({ order }))
  const eq1 = vi.fn(() => ({ eq: eq2, order }))
  return { select: vi.fn(() => ({ eq: eq1, order })), eq: eq1, order, result, eq2 }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('DocumentsService - getPendingByUser', () => {
  it('deve retornar apenas solicitacoes pendentes do usuario', async () => {
    const mockData = [
      { id: '1', user_id: 'u1', tipo: 'Declaração', status: 'pendente', criado_em: '2026-05-21T12:00:00Z' },
      { id: '2', user_id: 'u1', tipo: 'Histórico', status: 'pendente', criado_em: '2026-05-20T10:00:00Z' },
    ]
    const chain = makeChain({ data: mockData })
    mockFrom.mockReturnValue(chain)

    const result = await DocumentsService.getPendingByUser('u1')

    expect(mockFrom).toHaveBeenCalledWith('solicitacoes')
    expect(result.data).toEqual(mockData)
    expect(result.data).toHaveLength(2)
  })

  it('deve filtrar por user_id e status pendente', async () => {
    const captured: string[] = []
    const order = vi.fn(() => Promise.resolve({ data: [], error: null }))
    const eqStatus = vi.fn((_f, v: string) => {
      captured.push(`status=${v}`)
      return { order }
    })
    const eqUserId = vi.fn((_f, v: string) => {
      captured.push(`user_id=${v}`)
      return { eq: eqStatus, order }
    })
    mockFrom.mockReturnValue({ select: vi.fn(() => ({ eq: eqUserId, order })) })

    await DocumentsService.getPendingByUser('u1')

    expect(captured).toContain('user_id=u1')
    expect(captured).toContain('status=pendente')
  })

  it('deve retornar array vazio quando nao ha pendentes', async () => {
    const chain = makeChain({ data: [] })
    mockFrom.mockReturnValue(chain)

    const result = await DocumentsService.getPendingByUser('u1')

    expect(result.data).toEqual([])
  })

  it('deve ordenar por criado_em descendente', async () => {
    let capturedOrder: any = null
    const order = vi.fn((col: string, opts: any) => {
      capturedOrder = { col, opts }
      return Promise.resolve({ data: [], error: null })
    })
    const eq2 = vi.fn(() => ({ order }))
    const eq1 = vi.fn(() => ({ eq: eq2, order }))
    mockFrom.mockReturnValue({ select: vi.fn(() => ({ eq: eq1, order })) })

    await DocumentsService.getPendingByUser('u1')

    expect(capturedOrder).toEqual({ col: 'criado_em', opts: { ascending: false } })
  })
})
