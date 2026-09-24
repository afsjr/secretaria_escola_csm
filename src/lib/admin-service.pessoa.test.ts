import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdminService } from './admin-service'

vi.mock('./supabase', () => ({
  supabase: { auth: { getSession: vi.fn(() => Promise.resolve({ data: { session: null } })) }, from: vi.fn() },
  supabaseAdmin: null,
}))

vi.mock('./audit-service', () => ({
  AuditService: { log: vi.fn(() => Promise.resolve()) },
}))

describe('AdminService.resetUserPasswords (reset TODAS as contas da pessoa)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('reseta todas as contas (uma chamada por id) e retorna ok', async () => {
    vi.spyOn(AdminService, 'resetUserPassword').mockResolvedValue({ data: {}, error: null })

    const result = await AdminService.resetUserPasswords(['a', 'b'], 'JOÃO DA SILVA')

    expect(AdminService.resetUserPassword).toHaveBeenCalledTimes(2)
    expect(result).toEqual({ ok: true, resetados: ['a', 'b'], erros: [] })
  })

  it('falha de um id NÃO corta os demais: a falha, b e c ainda resetam, ok=false', async () => {
    vi.spyOn(AdminService, 'resetUserPassword').mockImplementation(async (id) =>
      id === 'a'
        ? { data: null, error: { message: 'falha em a' } }
        : { data: {}, error: null },
    )

    const result = await AdminService.resetUserPasswords(['a', 'b', 'c'], 'NOME')

    expect(result.ok).toBe(false)
    expect(result.resetados).toEqual(['b', 'c'])
    expect(result.erros).toEqual([{ id: 'a', message: 'falha em a' }])
  })

  it('erro em todos: resetados vazio, erros completo; re-execução idempotente', async () => {
    vi.spyOn(AdminService, 'resetUserPassword').mockResolvedValue({
      data: null,
      error: { message: 'erro' },
    })

    const result = await AdminService.resetUserPasswords(['a', 'b'], 'NOME')

    expect(result.ok).toBe(false)
    expect(result.resetados).toEqual([])
    expect(result.erros).toHaveLength(2)
    expect(result.erros[1]).toEqual({ id: 'b', message: 'erro' })
  })

  it('deduplica ids repetidos: [a,a,b] -> 2 chamadas, 2 resetados', async () => {
    vi.spyOn(AdminService, 'resetUserPassword').mockResolvedValue({ data: {}, error: null })

    const result = await AdminService.resetUserPasswords(['a', 'a', 'b'], 'NOME')

    expect(AdminService.resetUserPassword).toHaveBeenCalledTimes(2)
    expect(result.resetados).toEqual(['a', 'b'])
  })
})