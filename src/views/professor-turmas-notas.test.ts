import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loadAlunosDaDisciplina } from './professor-turmas-notas'

const { mockFrom, mockGetAlunosDaTurma, mockVerificarAlertas } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetAlunosDaTurma: vi.fn(),
  mockVerificarAlertas: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: { from: mockFrom },
}))

vi.mock('../lib/academic-service', () => ({
  AcademicService: { getAlunosDaTurma: mockGetAlunosDaTurma },
}))

vi.mock('./professor-turmas-alertas', () => ({
  verificarAlertasBaixa: mockVerificarAlertas,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('loadAlunosDaDisciplina - matrícula tardia (BUG-20261001-MALE)', () => {
  it('exibe alunos com boletim pendente na tabela (não somem do lançamento/PDF)', async () => {
    mockGetAlunosDaTurma.mockResolvedValue({
      data: [
        { id: 'm1', status_aluno: 'ativo', perfis: { id: 'a1', nome_completo: 'Aluno Normal' } },
        { id: 'm2', status_aluno: 'ativo', perfis: { id: 'a2', nome_completo: 'Aluno Tardio' } },
        { id: 'm3', status_aluno: 'trancado', perfis: { id: 'a3', nome_completo: 'Aluno Trancado' } },
      ],
      error: null,
    })

    mockFrom.mockReturnValue({
      select: vi.fn(() => ({
        in: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: [
              { aluno_id: 'a1', disciplina: 'Psicologia Aplicada', versao: 1, faltas: 0, n1: 8, n2: 7, n3: 6, rec: 0, status: null },
              { aluno_id: 'a2', disciplina: 'Psicologia Aplicada', versao: 1, faltas: 0, n1: 10, n2: 8, n3: 7, rec: 0, status: 'pendente' },
            ],
          })),
        })),
      })),
    })

    const container = document.createElement('div')
    container.innerHTML = `
      <table><tbody class="notas-tbody" data-disciplina-id="td1"></tbody></table>
      <div id="alertas-td1"></div>
    `

    const disc = { id: 'td1', nome: 'Psicologia Aplicada', disciplina_base_id: 'db1' }
    await loadAlunosDaDisciplina(disc, { id: 't1' } as any, container)

    const tbody = container.querySelector('.notas-tbody') as HTMLElement
    expect(tbody.innerHTML).toContain('Aluno Normal')
    expect(tbody.innerHTML).toContain('Aluno Tardio')
    expect(tbody.innerHTML.toLowerCase()).toContain('matrícula tardia')
    expect(tbody.innerHTML).not.toContain('Aluno Trancado')
  })
})
