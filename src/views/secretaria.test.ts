import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SecretariaView } from './secretaria'
import { DocumentsService } from '../lib/documents-service'
import { AdminService } from '../lib/admin-service'
import { ProfessorService } from '../lib/professor-service'
import { CourseService } from '../lib/course-service'
import { AcademicService } from '../lib/academic-service'

// Mocks de Views
vi.mock('./student-details', () => ({ StudentDetailsView: vi.fn().mockResolvedValue(document.createElement('div')) }))
vi.mock('./professor-details', () => ({ ProfessorDetailsView: vi.fn().mockResolvedValue(document.createElement('div')) }))

// Mocks de bibliotecas externas
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    addPage: vi.fn(), text: vi.fn(), save: vi.fn(), output: vi.fn().mockReturnValue(new Uint8Array())
  })),
  jsPDF: vi.fn().mockImplementation(() => ({
    addPage: vi.fn(), text: vi.fn(), save: vi.fn(), output: vi.fn().mockReturnValue(new Uint8Array())
  }))
}))
vi.mock('jspdf-autotable', () => ({ default: vi.fn() }))
vi.mock('xlsx', () => ({
  utils: { json_to_sheet: vi.fn(), book_new: vi.fn(), book_append_sheet: vi.fn() },
  writeFile: vi.fn()
}))

// Mock de Serviços
vi.mock('../lib/documents-service', () => ({
  DocumentsService: { getAllOpenRequests: vi.fn().mockResolvedValue({ data: [], error: null }) }
}))
vi.mock('../lib/admin-service', () => ({
  AdminService: { 
    listAlunos: vi.fn().mockResolvedValue({ data: [], error: null }),
    getAlunoById: vi.fn().mockResolvedValue({ data: null, error: null }),
    updateAluno: vi.fn().mockResolvedValue({ error: null }),
    matricularAluno: vi.fn().mockResolvedValue({ error: null }),
    createUserByAdmin: vi.fn().mockResolvedValue({ data: { userId: '123' }, error: null })
  }
}))
vi.mock('../lib/professor-service', () => ({
  ProfessorService: {
    getProfessores: vi.fn().mockResolvedValue({ data: [], error: null }),
    getAllDisciplinas: vi.fn().mockResolvedValue({ data: [], error: null })
  }
}))
vi.mock('../lib/course-service', () => ({
  CourseService: { getCursos: vi.fn().mockResolvedValue({ data: [], error: null }) }
}))

vi.mock('../lib/academic-service', () => ({
  AcademicService: {
    getTurmas: vi.fn(),
    getAlunosDaTurma: vi.fn(),
    getBoletim: vi.fn(),
    updateNotaEstagio: vi.fn(),
    upsertNotaEstagio: vi.fn(),
    getDisciplinasDaTurma: vi.fn()
  }
}))

vi.mock('../lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() }
}))

describe('SecretariaView - Estágio', () => {
  const mockTurmas = [{ id: 'turma-1', nome: 'Turma A', periodo: '2024.1' }]
  const mockAlunos = [{ id: 'mat-1', status_aluno: 'ativo', perfis: { id: 'aluno-1', nome_completo: 'João Aluno' } }]
  const mockDisciplinas = [
    { id: 'disc-1', nome: 'Enfermagem Médica', modulo: '2' },
    { id: 'disc-2', nome: 'Anatomia', modulo: '1' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Configurações base dos mocks
    vi.mocked(AcademicService.getTurmas).mockResolvedValue({ data: mockTurmas, error: null })
    vi.mocked(AcademicService.getAlunosDaTurma).mockResolvedValue({ data: mockAlunos, error: null })
    vi.mocked(AcademicService.getDisciplinasDaTurma).mockResolvedValue({ 
      data: { turma: mockTurmas[0], disciplinas: mockDisciplinas }, 
      error: null 
    })
    vi.mocked(AcademicService.getBoletim).mockResolvedValue({ data: [], error: null })
    vi.mocked(AcademicService.upsertNotaEstagio).mockResolvedValue({ data: { id: '123' } as any, error: null })
  })

  it('deve carregar alunos e disciplinas ao mudar a turma', async () => {
    const view = await SecretariaView()
    const selectTurma = view.querySelector('#notas-turma-select') as HTMLSelectElement
    
    expect(selectTurma).not.toBeNull()
    
    // JSDOM: Set value and dispatch change
    selectTurma.value = 'turma-1'
    selectTurma.dispatchEvent(new Event('change', { bubbles: true }))

    await vi.waitFor(() => {
      expect(AcademicService.getAlunosDaTurma).toHaveBeenCalledWith('turma-1')
    }, { timeout: 2000 })
  })

  it('deve listar disciplinas da turma e gerenciar estado dos selects', async () => {
    const view = await SecretariaView()
    const selectTurma = view.querySelector('#notas-turma-select') as HTMLSelectElement
    const selectAluno = view.querySelector('#notas-aluno-select') as HTMLSelectElement
    const selectDisciplina = view.querySelector('#notas-disciplina-select') as HTMLSelectElement

    // 1. Selecionar Turma
    selectTurma.value = 'turma-1'
    selectTurma.dispatchEvent(new Event('change', { bubbles: true }))
    
    await vi.waitFor(() => {
      expect(selectAluno.disabled).toBe(false)
    })

    // 2. Selecionar Aluno
    selectAluno.value = 'aluno-1'
    selectAluno.dispatchEvent(new Event('change', { bubbles: true }))

    await vi.waitFor(() => {
      expect(selectDisciplina.innerHTML).toContain('Enfermagem Médica')
      expect(selectDisciplina.innerHTML).toContain('Anatomia (Sem Estágio)')
      expect(selectDisciplina.disabled).toBe(false)
    })
  })

  it('deve salvar nota de estágio com os dados corretos', async () => {
    const view = await SecretariaView()
    const selectTurma = view.querySelector('#notas-turma-select') as HTMLSelectElement
    const selectAluno = view.querySelector('#notas-aluno-select') as HTMLSelectElement
    const selectDisciplina = view.querySelector('#notas-disciplina-select') as HTMLSelectElement
    const btnCarregar = view.querySelector('#btn-carregar-notas') as HTMLButtonElement

    // Simular fluxo até chegar na nota
    selectTurma.value = 'turma-1'
    selectTurma.dispatchEvent(new Event('change', { bubbles: true }))
    
    await vi.waitFor(() => { expect(selectAluno.disabled).toBe(false) })
    
    selectAluno.value = 'aluno-1'
    selectAluno.dispatchEvent(new Event('change', { bubbles: true }))
    
    await vi.waitFor(() => { expect(selectDisciplina.disabled).toBe(false) })

    selectDisciplina.value = 'Enfermagem Médica'
    selectDisciplina.dispatchEvent(new Event('change', { bubbles: true }))

    // Habilitar botão manualmente se necessário para o teste (ou esperar o handler)
    await vi.waitFor(() => { expect(btnCarregar.disabled).toBe(false) })
    btnCarregar.click()

    const btnSalvar = view.querySelector('#btn-salvar-nota-estagio') as HTMLButtonElement
    const inputNota = view.querySelector('#input-nota-estagio') as HTMLInputElement
    
    expect(btnSalvar).not.toBeNull()
    inputNota.value = '7.5'
    btnSalvar.click()

    await vi.waitFor(() => {
      expect(AcademicService.upsertNotaEstagio).toHaveBeenCalledWith('aluno-1', 'Enfermagem Médica', 7.5)
    })
  })
})
