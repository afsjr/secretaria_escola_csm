import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PDFService } from '../../lib/pdf-service'
import { AdminService } from '../../lib/admin-service'
import { AcademicService } from '../../lib/academic-service'
import { toast } from '../../lib/toast'
import { DocumentsService } from '../../lib/documents-service'

vi.mock('../../lib/pdf-service', () => ({
  PDFService: {
    generateDeclaracaoPDF: vi.fn(() => ({ save: vi.fn() })),
    generateHistoricoPDF: vi.fn(() => ({ save: vi.fn() })),
    generateBoletimPDF: vi.fn(() => ({ save: vi.fn() })),
    generateDeclaracaoVinculoPDF: vi.fn(() => ({ save: vi.fn() })),
    downloadPDF: vi.fn(),
  },
}))

vi.mock('../../lib/admin-service', () => ({
  AdminService: { getUserById: vi.fn(), listAlunos: vi.fn() },
}))

vi.mock('../../lib/academic-service', () => ({
  AcademicService: { getBoletim: vi.fn() },
}))

vi.mock('../../lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('../../lib/security', () => ({ escapeHTML: vi.fn((str: string) => str) }))

vi.mock('../../lib/documents-service', () => ({
  DocumentsService: { getAllOpenRequests: vi.fn() },
}))

vi.mock('../../lib/course-service', () => ({
  CourseService: { getOfertasDaTurmaComDatas: vi.fn().mockResolvedValue({ data: [] }) },
}))

const { mockMatriculaResult } = vi.hoisted(() => ({
  mockMatriculaResult: {
    data: {
      turmas: {
        id: 'turma-1',
        nome: 'Técnico em Enfermagem - 1º Ano',
        periodo: '2026',
        cursos: { id: 'curso-1', nome: 'Técnico em Enfermagem' },
      },
    },
    error: null,
  },
}))

vi.mock('../../lib/supabase', () => {
  const mockOrder = vi.fn(() => Promise.resolve({ data: null, error: null }))

  const mockMaybeSingle = vi.fn(() => Promise.resolve(mockMatriculaResult))

  const mockLimit = vi.fn(() => ({ maybeSingle: mockMaybeSingle }))

  const mockEq2 = vi.fn(() => ({
    eq: vi.fn(() => ({ limit: mockLimit, order: mockOrder })),
    limit: mockLimit,
    order: mockOrder,
  }))

  const mockEq1 = vi.fn(() => ({
    eq: mockEq2,
    limit: mockLimit,
    order: mockOrder,
  }))

  const mockSelect = vi.fn(() => ({
    eq: mockEq1,
    order: mockOrder,
  }))

  return {
    supabase: {
      from: vi.fn(() => ({
        select: mockSelect,
        eq: mockEq1,
      })),
    },
  }
})

const mockAlunos = [
  { id: 'aluno-1', nome_completo: 'João Aluno', email: 'joao@test.com' },
  { id: 'aluno-2', nome_completo: 'Maria Aluna', email: 'maria@test.com' },
]

const mockAlunoData = {
  id: 'aluno-1',
  nome_completo: 'João Aluno',
  perfil: 'aluno',
  email: 'joao@test.com',
}

async function renderTab(profilePerfil = 'secretaria') {
  const { DocumentosTab } = await import('./DocumentosTab')
  const tab = DocumentosTab({
    alunos: mockAlunos as any,
    profile: { id: 'user-1', perfil: profilePerfil },
  })
  document.body.appendChild(tab)
  return tab
}

describe('DocumentosTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''

    vi.mocked(AdminService.getUserById).mockResolvedValue({
      data: mockAlunoData as any,
      error: null,
    })

    vi.mocked(AcademicService.getBoletim).mockResolvedValue({ data: [], error: null })

    vi.mocked(DocumentsService.getAllOpenRequests).mockResolvedValue({
      data: [
        { id: 'req-1', tipo: 'Declaração de Matrícula', status: 'pendente', criado_em: '2026-05-28T10:00:00Z', user_id: 'aluno-1' },
      ] as any,
      error: null,
    })
  })

  it('deve renderizar formulário com selects de aluno e tipo', async () => {
    await renderTab()

    expect(document.getElementById('doc-aluno-select')).not.toBeNull()
    expect(document.getElementById('doc-tipo-select')).not.toBeNull()
    expect(document.getElementById('btn-gerar-documento')).not.toBeNull()
  })

  it('deve listar alunos no select', async () => {
    await renderTab()

    const options = document.querySelectorAll('#doc-aluno-select option')
    expect(options.length).toBe(3)
    expect(options[0].textContent).toBe('-- Selecione --')
    expect(options[1].textContent).toContain('João Aluno')
    expect(options[2].textContent).toContain('Maria Aluna')
  })

  it('nao deve exibir N/A nos nomes dos alunos', async () => {
    await renderTab()

    const options = document.querySelectorAll('#doc-aluno-select option')
    for (let i = 1; i < options.length; i++) {
      expect(options[i].textContent).not.toContain('N/A')
    }
  })

  it('deve listar tipos de documento', async () => {
    await renderTab()

    const options = document.querySelectorAll('#doc-tipo-select option')
    expect(options.length).toBe(5)
    expect(options[1].textContent).toBe('Declaração de Matrícula')
    expect(options[2].textContent).toBe('Histórico Acadêmico')
    expect(options[3].textContent).toBe('Boletim')
    expect(options[4].textContent).toBe('Declaração de Vínculo')
  })

  it('deve ocultar botão gerar para perfil professor', async () => {
    await renderTab('professor')

    expect(document.getElementById('btn-gerar-documento')).toBeNull()
  })

  it('deve mostrar botão para perfil admin', async () => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    await renderTab('admin')

    expect(document.getElementById('btn-gerar-documento')).not.toBeNull()
  })

  it('deve validar seleção de aluno', async () => {
    await renderTab()

    const selectTipo = document.getElementById('doc-tipo-select') as HTMLSelectElement
    selectTipo.value = 'Declaração de Matrícula'

    const btn = document.getElementById('btn-gerar-documento') as HTMLButtonElement
    btn.click()

    expect(toast.error).toHaveBeenCalledWith('Selecione um aluno.')
    expect(PDFService.generateDeclaracaoPDF).not.toHaveBeenCalled()
  })

  it('deve validar seleção de tipo de documento', async () => {
    await renderTab()

    const selectAluno = document.getElementById('doc-aluno-select') as HTMLSelectElement
    selectAluno.value = 'aluno-1'

    const btn = document.getElementById('btn-gerar-documento') as HTMLButtonElement
    btn.click()

    expect(toast.error).toHaveBeenCalledWith('Selecione o tipo de documento.')
    expect(PDFService.generateDeclaracaoPDF).not.toHaveBeenCalled()
  })

  it('deve gerar Declaração de Matrícula com dados do aluno', async () => {
    await renderTab()

    const selectAluno = document.getElementById('doc-aluno-select') as HTMLSelectElement
    const selectTipo = document.getElementById('doc-tipo-select') as HTMLSelectElement
    selectAluno.value = 'aluno-1'
    selectTipo.value = 'Declaração de Matrícula'

    const btn = document.getElementById('btn-gerar-documento') as HTMLButtonElement
    btn.click()

    await vi.waitFor(() => {
      expect(PDFService.generateDeclaracaoPDF).toHaveBeenCalled()
    })
    expect(PDFService.downloadPDF).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Documento gerado com sucesso!')
  })

  it('deve gerar Histórico Acadêmico', async () => {
    await renderTab()

    const selectAluno = document.getElementById('doc-aluno-select') as HTMLSelectElement
    const selectTipo = document.getElementById('doc-tipo-select') as HTMLSelectElement
    selectAluno.value = 'aluno-1'
    selectTipo.value = 'Histórico Acadêmico'

    const btn = document.getElementById('btn-gerar-documento') as HTMLButtonElement
    btn.click()

    await vi.waitFor(() => {
      expect(AcademicService.getBoletim).toHaveBeenCalledWith('aluno-1')
    })
    expect(PDFService.generateHistoricoPDF).toHaveBeenCalled()
    expect(PDFService.downloadPDF).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Documento gerado com sucesso!')
  })

  it('deve gerar Boletim', async () => {
    await renderTab()

    const selectAluno = document.getElementById('doc-aluno-select') as HTMLSelectElement
    const selectTipo = document.getElementById('doc-tipo-select') as HTMLSelectElement
    selectAluno.value = 'aluno-1'
    selectTipo.value = 'Boletim'

    const btn = document.getElementById('btn-gerar-documento') as HTMLButtonElement
    btn.click()

    await vi.waitFor(() => {
      expect(AcademicService.getBoletim).toHaveBeenCalledWith('aluno-1')
    })
    expect(PDFService.generateBoletimPDF).toHaveBeenCalled()
    expect(PDFService.downloadPDF).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Documento gerado com sucesso!')
  })

  it('deve gerar Declaração de Vínculo para não-aluno', async () => {
    vi.mocked(AdminService.getUserById).mockResolvedValue({
      data: { id: 'func-1', nome_completo: 'Carlos Funcionário', perfil: 'secretaria' } as any,
      error: null,
    })

    await renderTab()

    const selectAluno = document.getElementById('doc-aluno-select') as HTMLSelectElement
    const selectTipo = document.getElementById('doc-tipo-select') as HTMLSelectElement
    selectAluno.value = 'aluno-1'
    selectTipo.value = 'Declaração de Vínculo'

    const btn = document.getElementById('btn-gerar-documento') as HTMLButtonElement
    btn.click()

    await vi.waitFor(() => {
      expect(PDFService.generateDeclaracaoVinculoPDF).toHaveBeenCalled()
    })
    expect(PDFService.downloadPDF).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Documento gerado com sucesso!')
  })

  it('deve exibir erro se aluno não for encontrado', async () => {
    vi.mocked(AdminService.getUserById).mockResolvedValue({ data: null, error: null })
    await renderTab()

    const selectAluno = document.getElementById('doc-aluno-select') as HTMLSelectElement
    const selectTipo = document.getElementById('doc-tipo-select') as HTMLSelectElement
    selectAluno.value = 'aluno-1'
    selectTipo.value = 'Declaração de Matrícula'

    const btn = document.getElementById('btn-gerar-documento') as HTMLButtonElement
    btn.click()

    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Dados do aluno não encontrados.')
    })
    expect(PDFService.generateDeclaracaoPDF).not.toHaveBeenCalled()
  })

  it('deve tratar erro na geração do PDF', async () => {
    vi.mocked(AdminService.getUserById).mockRejectedValue(new Error('Falha na rede'))
    await renderTab()

    const selectAluno = document.getElementById('doc-aluno-select') as HTMLSelectElement
    const selectTipo = document.getElementById('doc-tipo-select') as HTMLSelectElement
    selectAluno.value = 'aluno-1'
    selectTipo.value = 'Declaração de Matrícula'

    const btn = document.getElementById('btn-gerar-documento') as HTMLButtonElement
    btn.click()

    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Falha na rede'))
    })
  })

  it('deve exibir solicitações pendentes', async () => {
    await renderTab()

    const container = document.querySelector('.tab-documentos') as HTMLElement
    await vi.waitFor(() => {
      expect(container.textContent).toContain('Solicitações Pendentes')
    })
    expect(container.textContent).toContain('Declaração de Matrícula')
  })
})
