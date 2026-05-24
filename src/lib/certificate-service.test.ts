import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }))
const { mockStorageFrom } = vi.hoisted(() => ({ mockStorageFrom: vi.fn() }))

vi.mock('./supabase', () => ({
  supabase: {
    from: mockFrom,
    storage: { from: mockStorageFrom },
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CertificateService - generateHash', () => {
  it('deve gerar hash no formato CERT-YYYY-XXXXXXXX', async () => {
    const { CertificateService } = await import('./certificate-service')
    const hash = CertificateService.generateHash()
    expect(hash).toMatch(/^CERT-2026-[A-F0-9]{8}$/)
  })

  it('deve gerar hashes únicos em chamadas consecutivas', async () => {
    const { CertificateService } = await import('./certificate-service')
    const h1 = CertificateService.generateHash()
    const h2 = CertificateService.generateHash()
    expect(h1).not.toBe(h2)
  })
})

describe('CertificateService - validateConclusao', () => {
  function makeSelectMock(data: any) {
    return vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(() =>
            Promise.resolve({ data, error: null })
          ),
        })),
      })),
    }))
  }

  it('deve retornar erro se aluno não estiver concluído', async () => {
    mockFrom.mockReturnValue({
      select: makeSelectMock({ status_aluno: 'ativo' }),
    })

    const { CertificateService } = await import('./certificate-service')
    const result = await CertificateService.validateConclusao('aluno-1', 'curso-1')
    expect(result.error).toBeTruthy()
    expect(result.error!.message).toContain('concluído')
  })

  it('deve retornar sucesso se aluno estiver concluído', async () => {
    mockFrom.mockReturnValue({
      select: makeSelectMock({ status_aluno: 'concluido', id: 'mat-1' }),
    })

    const { CertificateService } = await import('./certificate-service')
    const result = await CertificateService.validateConclusao('aluno-1', 'curso-1')
    expect(result.error).toBeNull()
  })
})

describe('CertificateService - getConteudoProgramatico', () => {
  it('deve retornar lista de disciplinas ordenadas', async () => {
    const disciplinas = [
      { disciplina: 'Anatomia', carga_horaria: 80, ordem: 1 },
      { disciplina: 'Fisiologia', carga_horaria: 60, ordem: 2 },
    ]
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: disciplinas, error: null })),
        })),
      })),
    })

    const { CertificateService } = await import('./certificate-service')
    const result = await CertificateService.getConteudoProgramatico('curso-1')
    expect(result.data).toHaveLength(2)
    expect(result.data![0].disciplina).toBe('Anatomia')
  })
})
