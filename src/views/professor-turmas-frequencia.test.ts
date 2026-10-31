import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { loadFrequenciaAlunos } from './professor-turmas-frequencia'

const { mockFrom, mockGetAlunosDaTurma, mockSalvarFrequencia } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockGetAlunosDaTurma: vi.fn(),
  mockSalvarFrequencia: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: { from: mockFrom },
}))

vi.mock('../lib/academic-service', () => ({
  AcademicService: { getAlunosDaTurma: mockGetAlunosDaTurma },
}))

vi.mock('../lib/professor-service', () => ({
  ProfessorService: { salvarFrequencia: mockSalvarFrequencia },
}))

vi.mock('../lib/toast', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

function montarDoisCards() {
  const container = document.createElement('div')
  container.innerHTML = `
    <details class="turma-card">
      <input type="date" id="freq-data" class="input freq-data-input" value="2026-10-29">
      <select id="freq-disciplina" class="input freq-disc-input">
        <option value="disc-a" selected>Disciplina A</option>
      </select>
      <div class="frequencia-list" data-turma-id="turma-a"></div>
    </details>
    <details class="turma-card">
      <input type="date" id="freq-data" class="input freq-data-input" value="2026-10-30">
      <select id="freq-disciplina" class="input freq-disc-input">
        <option value="disc-a">Disciplina A</option>
        <option value="disc-b" selected>Disciplina B</option>
      </select>
      <div class="frequencia-list" data-turma-id="turma-b"></div>
    </details>
  `
  document.body.appendChild(container)
  return container
}

function alunosAtivos() {
  return {
    data: [
      { id: 'm1', status_aluno: 'ativo', perfis: { id: 'a1', nome_completo: 'Aluno Ativo' } },
      { id: 'm2', status_aluno: 'trancado', perfis: { id: 'a2', nome_completo: 'Aluno Trancado' } },
    ],
    error: null,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockGetAlunosDaTurma.mockResolvedValue(alunosAtivos())
  mockSalvarFrequencia.mockResolvedValue({ data: null, error: null })
  mockFrom.mockImplementation((table: string) => {
    if (table === 'aulas') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: null }),
            }),
          }),
        }),
      }
    }
    return {
      select: () => ({
        eq: () => Promise.resolve({ data: [] }),
      }),
    }
  })
})

afterEach(() => {
  document.body.innerHTML = ''
})

describe('loadFrequenciaAlunos - caracterizacao', () => {
  it('renderiza apenas alunos ativos e salva os ausentes marcados', async () => {
    const container = montarDoisCards()

    await loadFrequenciaAlunos({ id: 'turma-a' } as any, container, 'prof-1')

    const freqList = container.querySelector('.frequencia-list[data-turma-id="turma-a"]') as HTMLElement
    expect(freqList.innerHTML).toContain('Aluno Ativo')
    expect(freqList.innerHTML).not.toContain('Aluno Trancado')

    const checkbox = freqList.querySelector('.freq-checkbox[data-aluno-id="a1"]') as HTMLInputElement
    expect(checkbox).toBeTruthy()
    checkbox.checked = true

    const btnSalvar = freqList.querySelector('.btn-salvar-frequencia') as HTMLButtonElement
    btnSalvar.click()

    await vi.waitFor(() => expect(mockSalvarFrequencia).toHaveBeenCalledTimes(1))
    expect(mockSalvarFrequencia).toHaveBeenCalledWith(
      'turma-a',
      'disc-a',
      '2026-10-29',
      'prof-1',
      ['a1'],
    )
  })

  it('cada card salva com a propria data e disciplina (OPP-20261030-F24H)', async () => {
    const container = montarDoisCards()

    await loadFrequenciaAlunos({ id: 'turma-a' } as any, container, 'prof-1')
    await loadFrequenciaAlunos({ id: 'turma-b' } as any, container, 'prof-1')

    const freqListB = container.querySelector('.frequencia-list[data-turma-id="turma-b"]') as HTMLElement
    const checkbox = freqListB.querySelector('.freq-checkbox[data-aluno-id="a1"]') as HTMLInputElement
    checkbox.checked = true

    const btnSalvar = freqListB.querySelector('.btn-salvar-frequencia') as HTMLButtonElement
    btnSalvar.click()

    await vi.waitFor(() => expect(mockSalvarFrequencia).toHaveBeenCalledTimes(1))
    expect(mockSalvarFrequencia).toHaveBeenCalledWith(
      'turma-b',
      'disc-b',
      '2026-10-30',
      'prof-1',
      ['a1'],
    )
  })
})
