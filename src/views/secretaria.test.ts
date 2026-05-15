import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SecretariaView } from './secretaria'
import { AcademicService } from '../lib/academic-service'
import { DocumentsService } from '../lib/documents-service'
import { AdminService } from '../lib/admin-service'

// Mocks de todas as dependências externas para isolar o ambiente
vi.mock('../lib/documents-service', () => ({ DocumentsService: { getAllOpenRequests: vi.fn().mockResolvedValue({ data: [], error: null }) } }))
vi.mock('../lib/admin-service', () => ({ AdminService: { listAlunos: vi.fn().mockResolvedValue({ data: [], error: null }) } }))
vi.mock('../lib/professor-service', () => ({ ProfessorService: { getProfessores: vi.fn().mockResolvedValue({ data: [], error: null }), getAllDisciplinas: vi.fn().mockResolvedValue({ data: [], error: null }) } }))
vi.mock('../lib/course-service', () => ({ CourseService: { getCursos: vi.fn().mockResolvedValue({ data: [], error: null }) } }))
vi.mock('../lib/academic-service', () => ({
  AcademicService: {
    getTurmas: vi.fn(),
    getAlunosDaTurma: vi.fn(),
    getBoletim: vi.fn(),
    upsertNotaEstagio: vi.fn(),
    getDisciplinasDaTurma: vi.fn()
  }
}))
vi.mock('../lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() } }))
vi.mock('../lib/security', () => ({ escapeHTML: vi.fn((str) => str) }))
vi.mock('../lib/excel-service', () => ({ ExcelService: { exportSolicitacoes: vi.fn(), exportAlunos: vi.fn(), exportProfessores: vi.fn() } }))
vi.mock('../lib/pdf-service', () => ({ PDFService: { generateBoletimPDF: vi.fn() } }))

// Mocks de Componentes e Sub-Views
vi.mock('../components/RequestTable', () => ({ RequestTableComponent: vi.fn().mockResolvedValue(document.createElement('div')) }))
vi.mock('../components/Tabs/CadastroAlunoTab', () => ({ CadastroAlunoTab: vi.fn().mockReturnValue(document.createElement('div')) }))
vi.mock('../components/Tabs/CadastroProfessorTab', () => ({ CadastroProfessorTab: vi.fn().mockReturnValue(document.createElement('div')) }))
vi.mock('./student-details', () => ({ StudentDetailsView: vi.fn().mockResolvedValue(document.createElement('div')) }))
vi.mock('./professor-details', () => ({ ProfessorDetailsView: vi.fn().mockResolvedValue(document.createElement('div')) }))

describe('SecretariaView - Estágio', () => {
  const mockTurmas = [{ id: 'turma-1', nome: 'Turma A', periodo: '2024.1' }]
  const mockAlunos = [{ perfis: { id: 'aluno-1', nome_completo: 'João Aluno' } }]
  const mockDisciplinas = [{ id: 'disc-1', nome: 'Enfermagem Médica', modulo: '2' }]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(AcademicService.getTurmas).mockResolvedValue({ data: mockTurmas, error: null })
    vi.mocked(AcademicService.getAlunosDaTurma).mockResolvedValue({ data: mockAlunos, error: null })
    vi.mocked(AcademicService.getDisciplinasDaTurma).mockResolvedValue({ 
      data: { turma: mockTurmas[0], disciplinas: mockDisciplinas }, 
      error: null 
    })
    vi.mocked(AcademicService.getBoletim).mockResolvedValue({ data: [], error: null })
    vi.mocked(AcademicService.upsertNotaEstagio).mockResolvedValue({ data: {} as any, error: null })
  })

  it('deve carregar alunos e permitir selecionar disciplina', async () => {
    const view = await SecretariaView()
    
    const selectTurma = view.querySelector('#notas-turma-select') as HTMLSelectElement
    const selectAluno = view.querySelector('#notas-aluno-select') as HTMLSelectElement
    const selectDisciplina = view.querySelector('#notas-disciplina-select') as HTMLSelectElement

    expect(selectTurma).not.toBeNull()
    expect(selectAluno).not.toBeNull()
    expect(selectDisciplina).not.toBeNull()

    // 1. Selecionar Turma
    selectTurma.value = 'turma-1'
    selectTurma.dispatchEvent(new Event('change', { bubbles: true }))

    await vi.waitFor(() => {
      expect(AcademicService.getAlunosDaTurma).toHaveBeenCalledWith('turma-1')
      expect(selectAluno.disabled).toBe(false)
    })

    // 2. Selecionar Aluno
    selectAluno.value = 'aluno-1'
    selectAluno.dispatchEvent(new Event('change', { bubbles: true }))

    await vi.waitFor(() => {
      expect(AcademicService.getBoletim).toHaveBeenCalledWith('aluno-1')
      expect(selectDisciplina.disabled).toBe(false)
    })

    expect(selectDisciplina.innerHTML).toContain('Enfermagem Médica')
  })
})
