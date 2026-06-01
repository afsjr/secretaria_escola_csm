import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AcademicService } from '../../lib/academic-service'
import { toast } from '../../lib/toast'

vi.mock('../../lib/academic-service', () => ({
  AcademicService: {
    getAulasPorTurmaPeriodo: vi.fn(),
  },
}))

vi.mock('../../lib/pdf-service', () => ({
  PDFService: {
    generateDiarioClassePDF: vi.fn(() => ({
      save: vi.fn(),
      internal: { pageSize: { getWidth: () => 210, getHeight: () => 297 } },
      output: vi.fn(() => ''),
    })),
    downloadPDF: vi.fn(),
  },
}))

vi.mock('../../lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('../../lib/security', () => ({ escapeHTML: vi.fn((str: string) => str) }))

describe('DiarioClasseTab', () => {
  const mockTurmas = [
    { id: 'turma-1', nome: 'Técnico em Enfermagem - 1º Ano', periodo: '2026' },
    { id: 'turma-2', nome: 'Técnico em Enfermagem - 2º Ano', periodo: '2026' },
  ]

  const mockAulas = {
    disciplinas: [
      {
        disciplina_nome: 'Anatomia e Fisiologia Humana',
        carga_horaria: 80,
        professor_nome: 'João Silva',
        aulas: [
          { data: '05/02/2026', conteudo: 'Sistema esquelético' },
          { data: '12/02/2026', conteudo: 'Sistema muscular' },
        ],
        total_aulas: 2,
      },
    ],
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    document.body.innerHTML = ''

    const { DiarioClasseTab } = await import('./DiarioClasseTab')
    const profile = { id: 'secretaria-1', nome_completo: 'Ana Secretaria', perfil: 'secretaria' }
    const tab = DiarioClasseTab({ turmas: mockTurmas, profile: profile as any })
    document.body.appendChild(tab)
  })

  it('deve renderizar o formulário com selects e botões', () => {
    const selectTurma = document.getElementById('diario-turma-select') as HTMLSelectElement
    const inputInicio = document.getElementById('diario-data-inicio') as HTMLInputElement
    const inputFim = document.getElementById('diario-data-fim') as HTMLInputElement
    const btnConsultar = document.getElementById('btn-consultar') as HTMLButtonElement

    expect(selectTurma).not.toBeNull()
    expect(inputInicio).not.toBeNull()
    expect(inputFim).not.toBeNull()
    expect(btnConsultar).not.toBeNull()
  })

  it('deve listar turmas no select', () => {
    const options = document.querySelectorAll('#diario-turma-select option')

    expect(options.length).toBe(3)
    expect(options[0].textContent).toBe('-- Selecione --')
    expect(options[1].textContent).toContain('Técnico em Enfermagem - 1º Ano')
    expect(options[2].textContent).toContain('Técnico em Enfermagem - 2º Ano')
  })

  it('deve definir período padrão como ano atual', () => {
    const inputInicio = document.getElementById('diario-data-inicio') as HTMLInputElement
    const inputFim = document.getElementById('diario-data-fim') as HTMLInputElement
    const anoAtual = new Date().getFullYear()

    expect(inputInicio.value).toBe(`${anoAtual}-01-01`)
    expect(inputFim.value).toBe(`${anoAtual}-12-31`)
  })

  it('deve exibir botão Gerar PDF para perfil secretaria', () => {
    const btnPdf = document.getElementById('btn-gerar-pdf') as HTMLButtonElement

    expect(btnPdf).not.toBeNull()
    expect(btnPdf.textContent).toContain('Gerar PDF')
  })

  it('deve validar turma obrigatória ao consultar', async () => {
    const btnConsultar = document.getElementById('btn-consultar') as HTMLButtonElement

    btnConsultar.click()

    expect(toast.error).toHaveBeenCalledWith('Selecione uma turma.')
    expect(AcademicService.getAulasPorTurmaPeriodo).not.toHaveBeenCalled()
  })

  it('deve exibir tabela com resultados ao consultar', async () => {
    vi.mocked(AcademicService.getAulasPorTurmaPeriodo).mockResolvedValue({ data: mockAulas as any, error: null })

    const selectTurma = document.getElementById('diario-turma-select') as HTMLSelectElement
    selectTurma.value = 'turma-1'
    const btnConsultar = document.getElementById('btn-consultar') as HTMLButtonElement
    btnConsultar.click()

    await vi.waitFor(() => {
      expect(document.body.innerHTML).toContain('Anatomia e Fisiologia Humana')
    })
    expect(document.body.innerHTML).toContain('João Silva')
    expect(document.body.innerHTML).toContain('05/02/2026')
    expect(document.body.innerHTML).toContain('Sistema esquelético')
    expect(document.body.innerHTML).toContain('Total: 2 aulas')
  })

  it('deve exibir mensagem quando não há aulas no período', async () => {
    vi.mocked(AcademicService.getAulasPorTurmaPeriodo).mockResolvedValue({ data: { disciplinas: [] }, error: null })

    const selectTurma = document.getElementById('diario-turma-select') as HTMLSelectElement
    selectTurma.value = 'turma-2'
    const btnConsultar = document.getElementById('btn-consultar') as HTMLButtonElement
    btnConsultar.click()

    await vi.waitFor(() => {
      expect(document.body.innerHTML).toContain('Nenhuma aula registrada')
    })
  })

  it('deve ocultar botão Gerar PDF para usuário sem permissão', async () => {
    document.body.innerHTML = ''

    const { DiarioClasseTab } = await import('./DiarioClasseTab')
    const profileAluno = { id: 'aluno-1', nome_completo: 'João Aluno', perfil: 'aluno' }
    const tab = DiarioClasseTab({ turmas: mockTurmas, profile: profileAluno as any })
    document.body.appendChild(tab)

    const btnPdf = document.getElementById('btn-gerar-pdf') as HTMLButtonElement
    expect(btnPdf).toBeNull()
  })
})
