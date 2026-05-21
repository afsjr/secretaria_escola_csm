import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuditService } from './audit-service'

const { mockGetUser, mockGetSession, mockFrom } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockGetSession: vi.fn(),
  mockFrom: vi.fn(),
}))

vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
      getSession: mockGetSession,
    },
    from: mockFrom,
  },
}))

vi.mock('../auth/session', () => ({
  getUserProfile: vi.fn(() =>
    Promise.resolve({ data: { nome_completo: 'Admin Teste', perfil: 'admin' } })
  ),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AuditService.log', () => {
  it('deve registrar log com sucesso', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    let capturedInsert: any
    mockFrom.mockReturnValue({
      insert: vi.fn((data) => {
        capturedInsert = data[0]
        return { error: null }
      }),
    })

    const result = await AuditService.log({
      acao: 'teste',
      tabela_afetada: 'perfis',
      registro_id: 'id-1',
      descricao: 'Teste de log',
    })

    expect(result.error).toBeNull()
    expect(mockFrom).toHaveBeenCalledWith('audit_log')
    expect(capturedInsert.usuario_id).toBe('user-1')
    expect(capturedInsert.acao).toBe('teste')
  })

  it('deve ignorar log quando usuário não autenticado', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const result = await AuditService.log({ acao: 'teste' })

    expect(result.error).toBeNull()
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('não deve lançar erro se insert falhar', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockFrom.mockReturnValue({ insert: vi.fn(() => ({ error: { message: 'DB error' } })) })

    const result = await AuditService.log({ acao: 'teste' })

    expect(result.error).toBeNull()
  })

  it('não deve lançar erro se getUser falhar', async () => {
    mockGetUser.mockRejectedValue(new Error('Network error'))

    const result = await AuditService.log({ acao: 'teste' })

    expect(result.error).toBeTruthy()
    expect(result.error.message).toBe('Network error')
  })

  it('deve capturar user agent do navegador', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    let captured: any
    mockFrom.mockReturnValue({
      insert: vi.fn((data) => {
        captured = data[0]
        return { error: null }
      }),
    })

    await AuditService.log({ acao: 'teste' })

    expect(captured.user_agent).toBeTruthy()
  })
})

describe('AuditService.getLogs', () => {
  it('deve buscar logs com paginação padrão', async () => {
    const mockOrder = vi.fn()
    const mockRange = vi.fn().mockResolvedValue({ data: [{ id: '1' }], error: null, count: 1 })
    mockOrder.mockReturnValue({ range: mockRange })
    mockFrom.mockReturnValue({ select: vi.fn(() => ({ order: mockOrder })) })

    const result = await AuditService.getLogs()

    expect(mockFrom).toHaveBeenCalledWith('audit_log')
    expect(result.data).toBeDefined()
  })

  it('deve aplicar filtro por ação', async () => {
    const mockEq = vi.fn()
    const mockOrder = vi.fn().mockReturnValue({ range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }) })
    const mockSelect = vi.fn(() => ({ eq: mockEq, order: mockOrder }))
    mockEq.mockReturnValue({ order: mockOrder })
    mockFrom.mockReturnValue({ select: mockSelect })

    await AuditService.getLogs({ acao: 'reset_senha' })

    expect(mockEq).toHaveBeenCalledWith('acao', 'reset_senha')
  })
})

describe('AuditService.getUniqueActions', () => {
  it('deve retornar ações únicas', async () => {
    const mockOrder = vi.fn().mockResolvedValue({
      data: [
        { acao: 'login', descricao: 'Login' },
        { acao: 'logout', descricao: 'Logout' },
        { acao: 'login', descricao: 'Login' },
      ],
      error: null,
    })
    mockFrom.mockReturnValue({ select: vi.fn(() => ({ order: mockOrder })) })

    const result = await AuditService.getUniqueActions()

    expect(result.data).toHaveLength(2)
    expect(result.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ acao: 'login' }),
        expect.objectContaining({ acao: 'logout' }),
      ])
    )
  })
})

describe('AuditService.getCountsBySeverity', () => {
  it('deve contar ações por severidade', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => Promise.resolve({
        data: [
          { acao: 'reset_senha' },
          { acao: 'reset_senha' },
          { acao: 'lancar_nota' },
          { acao: 'login_sucesso' },
        ],
        error: null,
      })),
    })

    const result = await AuditService.getCountsBySeverity()

    expect(result.data).toEqual({ alta: 2, media: 1, baixa: 1 })
  })
})
