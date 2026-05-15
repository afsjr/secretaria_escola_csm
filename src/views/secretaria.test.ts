import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SecretariaView } from './secretaria'
import { AcademicService } from '../lib/academic-service'
import { DocumentsService } from '../lib/documents-service'
import { AdminService } from '../lib/admin-service'

// Mocks mínimos e diretos
vi.mock('../lib/documents-service', () => ({ DocumentsService: { getAllOpenRequests: vi.fn().mockResolvedValue({ data: [], error: null }) } }))
vi.mock('../lib/admin-service', () => ({ AdminService: { listAlunos: vi.fn().mockResolvedValue({ data: [], error: null }) } }))
vi.mock('../lib/professor-service', () => ({ ProfessorService: { getProfessores: vi.fn().mockResolvedValue({ data: [], error: null }), getAllDisciplinas: vi.fn().mockResolvedValue({ data: [], error: null }) } }))
vi.mock('../lib/course-service', () => ({ CourseService: { getCursos: vi.fn().mockResolvedValue({ data: [], error: null }) } }))
vi.mock('../lib/academic-service', () => ({
  AcademicService: {
    getTurmas: vi.fn().mockResolvedValue({ data: [], error: null }),
    getAlunosDaTurma: vi.fn().mockResolvedValue({ data: [], error: null }),
    getBoletim: vi.fn().mockResolvedValue({ data: [], error: null }),
    upsertNotaEstagio: vi.fn().mockResolvedValue({ data: {}, error: null }),
    getDisciplinasDaTurma: vi.fn().mockResolvedValue({ data: { disciplinas: [] }, error: null })
  }
}))
vi.mock('../lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() } }))
vi.mock('../lib/security', () => ({ escapeHTML: vi.fn((str) => str) }))
vi.mock('../lib/excel-service', () => ({ ExcelService: { exportSolicitacoes: vi.fn(), exportAlunos: vi.fn(), exportProfessores: vi.fn() } }))
vi.mock('../lib/pdf-service', () => ({ PDFService: { generateBoletimPDF: vi.fn() } }))
vi.mock('../components/RequestTable', () => ({ RequestTableComponent: vi.fn().mockResolvedValue(document.createElement('div')) }))
vi.mock('../components/Tabs/CadastroAlunoTab', () => ({ CadastroAlunoTab: vi.fn().mockReturnValue(document.createElement('div')) }))
vi.mock('../components/Tabs/CadastroProfessorTab', () => ({ CadastroProfessorTab: vi.fn().mockReturnValue(document.createElement('div')) }))
vi.mock('./student-details', () => ({ StudentDetailsView: vi.fn().mockResolvedValue(document.createElement('div')) }))
vi.mock('./professor-details', () => ({ ProfessorDetailsView: vi.fn().mockResolvedValue(document.createElement('div')) }))

describe('SecretariaView - Diagnóstico', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('deve chamar getTurmas na inicialização', async () => {
    const mockTurmas = [{ id: 'turma-1', nome: 'Turma A', periodo: '2024.1' }]
    vi.mocked(AcademicService.getTurmas).mockResolvedValue({ data: mockTurmas, error: null })

    const view = await SecretariaView()
    
    expect(AcademicService.getTurmas).toHaveBeenCalled()
    expect(view.innerHTML).toContain('Turma A')
  })

  it('deve reagir ao evento de change na turma', async () => {
    const mockTurmas = [{ id: 'turma-1', nome: 'Turma A', periodo: '2024.1' }]
    vi.mocked(AcademicService.getTurmas).mockResolvedValue({ data: mockTurmas, error: null })
    vi.mocked(AcademicService.getAlunosDaTurma).mockResolvedValue({ data: [], error: null })

    const view = await SecretariaView()
    const selectTurma = view.querySelector('#notas-turma-select') as HTMLSelectElement
    
    expect(selectTurma).not.toBeNull()
    selectTurma.value = 'turma-1'
    
    // Disparar o evento manualmente
    await selectTurma.dispatchEvent(new Event('change', { bubbles: true }))

    await vi.waitFor(() => {
      expect(AcademicService.getAlunosDaTurma).toHaveBeenCalledWith('turma-1')
    })
  })
})
