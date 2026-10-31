import { describe, it, expect, vi, beforeEach } from 'vitest'
import { bindSalvarNotas, loadAlunosDaDisciplina, renderLinhaAluno } from './professor-turmas-notas'
import type { NotasContexto } from './professor-turmas-types'

const { mockFrom, mockGetAlunosDaTurma, mockVerificarAlertas, mockSalvarNotasEmLote } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetAlunosDaTurma: vi.fn(),
  mockVerificarAlertas: vi.fn(),
  mockSalvarNotasEmLote: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: { from: mockFrom },
}))

vi.mock('../lib/academic-service', () => ({
  AcademicService: { getAlunosDaTurma: mockGetAlunosDaTurma },
}))

vi.mock('../lib/professor-service', () => ({
  ProfessorService: { salvarNotasEmLote: mockSalvarNotasEmLote },
}))

vi.mock('../lib/toast', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('./professor-turmas-alertas', () => ({
  verificarAlertasBaixa: mockVerificarAlertas,
}))

beforeEach(() => {
  vi.clearAllMocks()
  delete (window as any).__notasVersoes
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
    const contexto: NotasContexto = new Map()
    await loadAlunosDaDisciplina(disc, { id: 't1' } as any, container, contexto)

    const tbody = container.querySelector('.notas-tbody') as HTMLElement
    expect(tbody.innerHTML).toContain('Aluno Normal')
    expect(tbody.innerHTML).toContain('Aluno Tardio')
    expect(tbody.innerHTML.toLowerCase()).toContain('matrícula tardia')
    expect(tbody.innerHTML).not.toContain('Aluno Trancado')
  })
})

function renderAluno(notas: any, mediaParcial: number) {
  const container = document.createElement('div')
  container.innerHTML = `<table><tbody>${renderLinhaAluno(
    { id: 'a1', nome_completo: 'Aluno Teste' },
    notas,
    mediaParcial,
  )}</tbody></table>`
  return {
    media: container.querySelector('[data-media]')?.textContent?.trim(),
    final: container.querySelector('[data-final]')?.textContent?.trim(),
    status: container.querySelector('[data-status]')?.textContent?.trim(),
    recDisabled: (container.querySelector('.input-rec') as HTMLInputElement).disabled,
  }
}

describe('renderLinhaAluno - caracterizacao (OPP-20261030-FZIH)', () => {
  it('mantem media, final e status quando a media ja e multipla de 0,5', () => {
    const celulas = renderAluno({ n1: 4, n2: 4, n3: 4, rec: 0 }, 4)
    expect(celulas.media).toBe('4.0')
    expect(celulas.final).toBe('4.0')
    expect(celulas.status).toBe('Reprovado')
    expect(celulas.recDisabled).toBe(false)
  })

  it('mantem o traco e o status quando nao ha nota', () => {
    const celulas = renderAluno({ n1: 0, n2: 0, n3: 0, rec: 0 }, 0)
    expect(celulas.media).toBe('-')
    expect(celulas.final).toBe('-')
    expect(celulas.status).toBe('Reprovado')
  })

  it('nao recalcula a recuperacao com a media arredondada', () => {
    const celulas = renderAluno({ n1: 5, n2: 5, n3: 5, rec: 7 }, 5)
    expect(celulas.media).toBe('5.0')
    expect(celulas.final).toBe('6.0')
    expect(celulas.status).toBe('Aprovado')
  })
})

describe('renderLinhaAluno - regressao da media exibida (OPP-20261030-FZIH)', () => {
  it('exibe a media arredondada igual ao recalculo e bloqueia a Rec', () => {
    const celulas = renderAluno({ n1: 7, n2: 7, n3: 6.4, rec: 0 }, 20.4 / 3)
    expect(celulas.media).toBe('7.0')
    expect(celulas.final).toBe('7.0')
    expect(celulas.status).toBe('Aprovado')
    expect(celulas.recDisabled).toBe(true)
  })

  it('arredonda 5,733 para 6,0 sem bloquear a Rec', () => {
    const celulas = renderAluno({ n1: 5, n2: 6, n3: 6.2, rec: 0 }, 17.2 / 3)
    expect(celulas.media).toBe('6.0')
    expect(celulas.final).toBe('6.0')
    expect(celulas.status).toBe('Aprovado')
    expect(celulas.recDisabled).toBe(false)
  })
})

function configurarCarga(versao = 7) {
  mockGetAlunosDaTurma.mockResolvedValue({
    data: [
      { id: 'm1', status_aluno: 'ativo', perfis: { id: 'a1', nome_completo: 'Aluno Normal' } },
    ],
    error: null,
  })
  mockFrom.mockReturnValue({
    select: vi.fn(() => ({
      in: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          data: [
            { aluno_id: 'a1', disciplina: 'Psicologia Aplicada', versao, faltas: 0, n1: 8, n2: 7, n3: 6, rec: 0, status: null },
          ],
        })),
      })),
    })),
  })
  mockSalvarNotasEmLote.mockResolvedValue({ data: [], error: null })
}

function montarContainerSalvar() {
  const container = document.createElement('div')
  container.innerHTML = `
    <table><tbody class="notas-tbody" data-disciplina-id="td1"></tbody></table>
    <div id="alertas-td1"></div>
    <button class="btn-salvar-notas" data-disciplina-id="td1" data-disciplina-base-id="db1">Salvar</button>
  `
  return container
}

function preencherLinha(container: HTMLElement) {
  const row = container.querySelector('tr[data-aluno-id="a1"]') as HTMLElement
  ;(row.querySelector('.input-faltas') as HTMLInputElement).value = '2'
  ;(row.querySelector('.input-n1') as HTMLInputElement).value = '7'
  ;(row.querySelector('.input-n2') as HTMLInputElement).value = '8'
  ;(row.querySelector('.input-n3') as HTMLInputElement).value = '9'
  ;(row.querySelector('.input-rec') as HTMLInputElement).value = '0'
}

describe('fluxo de versões (OPP-20261030-HX4X)', () => {
  it('salva a versão carregada para cada aluno', async () => {
    configurarCarga(7)
    const container = montarContainerSalvar()
    const disc = { id: 'td1', nome: 'Psicologia Aplicada', disciplina_base_id: 'db1' }

    const contexto: NotasContexto = new Map()
    await loadAlunosDaDisciplina(disc, { id: 't1' } as any, container, contexto)
    preencherLinha(container)
    bindSalvarNotas(container, contexto)

    ;(container.querySelector('.btn-salvar-notas') as HTMLButtonElement).click()

    await vi.waitFor(() => expect(mockSalvarNotasEmLote).toHaveBeenCalledTimes(1))
    const [baseId, notas] = mockSalvarNotasEmLote.mock.calls[0]
    expect(baseId).toBe('db1')
    expect(notas).toHaveLength(1)
    expect(notas[0]).toMatchObject({ aluno_id: 'a1', versao: 7, faltas: 2, n1: 7 })
  })

  it('não deixa versões em window', async () => {
    configurarCarga(7)
    const container = montarContainerSalvar()
    const disc = { id: 'td1', nome: 'Psicologia Aplicada', disciplina_base_id: 'db1' }

    const contexto: NotasContexto = new Map()
    await loadAlunosDaDisciplina(disc, { id: 't1' } as any, container, contexto)

    expect((window as any).__notasVersoes).toBeUndefined()
    expect(contexto.get('td1')?.['a1']?.versao).toBe(7)
  })
})
