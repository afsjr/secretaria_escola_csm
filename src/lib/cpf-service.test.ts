import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CpfService } from './cpf-service'

const { mockFrom } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
}))

vi.mock('./supabase', () => ({
  supabase: {
    from: mockFrom,
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CpfService.cpfJaExiste', () => {
  it('retorna true quando o CPF existe, ignorando a formatação', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        not: vi.fn(() => Promise.resolve({ data: [{ id: 'p1', cpf: '123.456.789-09' }], error: null })),
      })),
    })

    const result = await CpfService.cpfJaExiste('12345678909')

    expect(result.data).toBe(true)
    expect(result.error).toBeNull()
  })

  it('retorna false quando o CPF não existe', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        not: vi.fn(() => Promise.resolve({ data: [{ id: 'p1', cpf: '111.444.777-35' }], error: null })),
      })),
    })

    const result = await CpfService.cpfJaExiste('123.456.789-09')

    expect(result.data).toBe(false)
  })

  it('ignora o próprio registro ao checar', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        not: vi.fn(() => Promise.resolve({ data: [{ id: 'p1', cpf: '123.456.789-09' }], error: null })),
      })),
    })

    const result = await CpfService.cpfJaExiste('12345678909', 'p1')

    expect(result.data).toBe(false)
  })

  it('retorna false para CPF vazio sem consultar o banco', async () => {
    const result = await CpfService.cpfJaExiste('')

    expect(result.data).toBe(false)
    expect(mockFrom).not.toHaveBeenCalled()
  })
})

describe('CpfService.listarInconsistenciasCPF', () => {
  it('separa perfis sem CPF e CPFs duplicados normalizados', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [
            { id: '1', nome_completo: 'A', cpf: null },
            { id: '2', nome_completo: 'B', cpf: '123.456.789-09' },
            { id: '3', nome_completo: 'C', cpf: '12345678909' },
            { id: '4', nome_completo: 'D', cpf: '111.444.777-35' },
          ],
          error: null,
        })),
      })),
    })

    const result = await CpfService.listarInconsistenciasCPF()

    expect(result.error).toBeNull()
    expect(result.data?.semCpf).toHaveLength(1)
    expect(result.data?.duplicados).toHaveLength(1)
    expect(result.data?.duplicados[0].cpf).toBe('12345678909')
    expect(result.data?.duplicados[0].perfis).toHaveLength(2)
  })

  it('retorna listas vazias quando não há inconsistências', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({
          data: [
            { id: '1', nome_completo: 'A', cpf: '123.456.789-09' },
            { id: '2', nome_completo: 'B', cpf: '111.444.777-35' },
          ],
          error: null,
        })),
      })),
    })

    const result = await CpfService.listarInconsistenciasCPF()

    expect(result.data?.semCpf).toHaveLength(0)
    expect(result.data?.duplicados).toHaveLength(0)
  })
})
