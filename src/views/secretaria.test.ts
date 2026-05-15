import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SecretariaView } from './secretaria'
import { DocumentsService } from '../lib/documents-service'
import { AdminService } from '../lib/admin-service'
import { ProfessorService } from '../lib/professor-service'
import { CourseService } from '../lib/course-service'
import { AcademicService } from '../lib/academic-service'

// Mocks de Views (evitar carregar lógica complexa nos testes da secretaria)
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
    getTurmas: vi.fn().mockResolvedValue({ data: [], error: null }),
    getAlunosDaTurma: vi.fn().mockResolvedValue({ data: [], error: null }),
    getBoletim: vi.fn().mockResolvedValue({ data: [], error: null }),
    updateNotaEstagio: vi.fn().mockResolvedValue({ data: null, error: null }),
    upsertNotaEstagio: vi.fn().mockResolvedValue({ data: { id: '123' }, error: null }),
    getDisciplinasDaTurma: vi.fn().mockResolvedValue({ 
      data: { turma: { id: '1', nome: 'Turma A' }, disciplinas: [] }, 
      error: null 
    })
  }
}))
vi.mock('../lib/toast', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() }
}))

describe('SecretariaView - Estágio', () => {
  const mockTurmas = [{ id: 'turma-1', nome: 'Turma A', periodo: '2024.1' }]
  const mockAlunos = [{ perfis: { id: 'aluno-1', nome_completo: 'João Aluno' } }]
  const mockDisciplinas = [
    { id: 'disc-1', nome: 'Enfermagem Médica', modulo: '2' },
    { id: 'disc-2', nome: 'Anatomia', modulo: '1' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(AcademicService.getTurmas as any).mockResolvedValue({ data: mockTurmas, error: null })
    ;(AcademicService.getAlunosDaTurma as any).mockResolvedValue({ data: mockAlunos, error: null })
    ;(AcademicService.getDisciplinasDaTurma as any).mockResolvedValue({ 
      data: { turma: mockTurmas[0], disciplinas: mockDisciplinas }, 
      error: null 
    })
    ;(AcademicService.getBoletim as any).mockResolvedValue({ data: [], error: null })
  })

  it('deve carregar alunos e disciplinas ao mudar a turma', async () => {
    const view = await SecretariaView()
    const selectTurma = view.querySelector('#notas-turma-select') as HTMLSelectElement
    
    selectTurma.value = 'turma-1'
    selectTurma.dispatchEvent(new Event('change', { bubbles: true }))

    await vi.waitFor(() => {
      expect(AcademicService.getAlunosDaTurma).toHaveBeenCalledWith('turma-1')
      expect(AcademicService.getDisciplinasDaTurma).toHaveBeenCalledWith('turma-1')
    })
  })

  it('deve listar disciplinas da turma no select de disciplinas', async () => {
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
    })
  })

  it('deve salvar a nota de estágio via upsertNotaEstagio', async () => {
    const view = await SecretariaView()
    const selectTurma = view.querySelector('#notas-turma-select') as HTMLSelectElement
    const selectAluno = view.querySelector('#notas-aluno-select') as HTMLSelectElement
    const selectDisciplina = view.querySelector('#notas-disciplina-select') as HTMLSelectElement
    const btnCarregar = view.querySelector('#btn-carregar-notas') as HTMLButtonElement

    // Fluxo de seleção
    selectTurma.value = 'turma-1'
    selectTurma.dispatchEvent(new Event('change', { bubbles: true }))
    
    await vi.waitFor(() => { expect(selectAluno.disabled).toBe(false) })
    
    selectAluno.value = 'aluno-1'
    selectAluno.dispatchEvent(new Event('change', { bubbles: true }))
    
    await vi.waitFor(() => { expect(selectDisciplina.disabled).toBe(false) })

    // Selecionar disciplina válida
    selectDisciplina.value = 'Enfermagem Médica'
    selectDisciplina.dispatchEvent(new Event('change', { bubbles: true }))

    // Clicar em carregar
    btnCarregar.click()

    await vi.waitFor(() => {
      const inputNota = view.querySelector('#input-nota-estagio') as HTMLInputElement
      const btnSalvar = view.querySelector('#btn-salvar-nota-estagio') as HTMLButtonElement
      
      inputNota.value = '9.5'
      btnSalvar.click()
    })

    expect(AcademicService.upsertNotaEstagio).toHaveBeenCalledWith('aluno-1', 'Enfermagem Médica', 9.5)
  })
})
