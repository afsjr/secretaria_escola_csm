import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InstituicaoService } from './instituicao-service'

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }))

vi.mock('./supabase', () => ({
  supabase: {
    from: mockFrom,
  },
  supabaseAdmin: {
    from: mockFrom,
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
})

function mockGetInstituicaoNull() {
  mockFrom.mockReturnValue({
    select: vi.fn(() => ({
      limit: vi.fn(() => ({
        maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
  })
}

describe('InstituicaoService - getPDFHeader (fallback /logo.png)', () => {
  it('usa /logo.png como data URL quando a instituição não tem logo_url (RF-02)', async () => {
    mockGetInstituicaoNull()

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: vi.fn().mockResolvedValue(new Blob(['png-bytes'], { type: 'image/png' })),
    })
    vi.stubGlobal('fetch', fetchMock)

    const header = await InstituicaoService.getPDFHeader()

    expect(fetchMock).toHaveBeenCalledWith('/logo.png')
    expect(header.logo_url).toMatch(/^data:image\/png;base64,/)
    expect(header.nome).toBe('INSTITUIÇÃO DE ENSINO')
  })

  it('retorna logo_url null quando o fetch de /logo.png rejeita (RF-06)', async () => {
    mockGetInstituicaoNull()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))

    const header = await InstituicaoService.getPDFHeader()

    expect(header.logo_url).toBeNull()
    expect(header.nome).toBe('INSTITUIÇÃO DE ENSINO')
  })

  it('retorna logo_url null quando response.ok é falso (RF-06)', async () => {
    mockGetInstituicaoNull()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, blob: vi.fn() }))

    const header = await InstituicaoService.getPDFHeader()

    expect(header.logo_url).toBeNull()
  })

  it('usa a logo HTTP cadastrada convertida, dispensando o fallback', async () => {
    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        limit: vi.fn(() => ({
          maybeSingle: vi.fn(() =>
            Promise.resolve({
              data: {
                nome: 'Colégio Santa Mônica',
                logo_url: 'https://cdn.example/x/logo.png?v=1',
              },
              error: null,
            }),
          ),
        })),
      })),
    })

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        blob: vi.fn().mockResolvedValue(new Blob(['x'], { type: 'image/png' })),
      }),
    )

    const header = await InstituicaoService.getPDFHeader()

    expect(header.logo_url).toMatch(/^data:image\/png;base64,/)
    expect(header.nome).toBe('Colégio Santa Mônica')
  })
})