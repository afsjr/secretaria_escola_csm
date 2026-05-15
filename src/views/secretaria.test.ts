import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SecretariaView } from './secretaria'
import { AcademicService } from '../lib/academic-service'
import { DocumentsService } from '../lib/documents-service'
import { AdminService } from '../lib/admin-service'

// Mocks de todas as dependências externas
vi.mock('../lib/documents-service', () => ({ DocumentsService: { getAllOpenRequests: vi.fn().mockResolvedValue({ data: [], error: null }) } }))
vi.mock('../lib/admin-service', () => ({ AdminService: { listAlunos: vi.fn().mockResolvedValue({ data: [], error: null }), getAlunoById: vi.fn(), updateAluno: vi.fn() } }))
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
vi.mock('../components/RequestTable', () => ({ RequestTableComponent: vi.fn().mockResolvedValue(document.createElement('div')) }))
vi.mock('../components/Tabs/CadastroAlunoTab', () => ({ CadastroAlunoTab: vi.fn().mockReturnValue(document.createElement('div')) }))
vi.mock('../components/Tabs/CadastroProfessorTab', () => ({ CadastroProfessorTab: vi.fn().mockReturnValue(document.createElement('div')) }))

describe('SecretariaView - Notas de Estágio', () => {
  const mockTurmas = [{ id: 'turma-1', nome: 'Turma A', periodo: '2024.1' }]
  const mockAlunos = [{ perfis: { id: 'aluno-1', nome_completo: 'João Aluno' } }]
  const mockDisciplinas = [
    { id: 'disc-1', nome: 'Enfermagem Médica', modulo: '2' },
    { id: 'disc-2', nome: 'Anatomia', modulo: '1' }
  ]

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

  it('deve realizar o fluxo completo de lançamento de nota de estágio', async () => {
    const view = await SecretariaView()
    document.body.appendChild(view) // Anexar ao body para garantir visibilidade no JSDOM

    const selectTurma = view.querySelector('#notas-turma-select') as HTMLSelectElement
    const selectAluno = view.querySelector('#notas-aluno-select') as HTMLSelectElement
    const selectDisciplina = view.querySelector('#notas-disciplina-select') as HTMLSelectElement
    const btnCarregar = view.querySelector('#btn-carregar-notas') as HTMLButtonElement

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

    // 3. Selecionar Disciplina
    expect(selectDisciplina.innerHTML).toContain('Enfermagem Médica')
    expect(selectDisciplina.innerHTML).toContain('Anatomia (Sem Estágio)')

    selectDisciplina.value = 'Enfermagem Médica'
    selectDisciplina.dispatchEvent(new Event('change', { bubbles: true }))

    await vi.waitFor(() => {
      expect(btnCarregar.disabled).toBe(false)
    })
    btnCarregar.click()

    // 4. Salvar Nota
    await vi.waitFor(() => {
      expect(view.querySelector('#input-nota-estagio')).not.toBeNull()
    })

    const inputNota = view.querySelector('#input-nota-estagio') as HTMLInputElement
    const btnSalvar = view.querySelector('#btn-salvar-nota-estagio') as HTMLButtonElement

    inputNota.value = '9.0'
    btnSalvar.click()

    await vi.waitFor(() => {
      expect(AcademicService.upsertNotaEstagio).toHaveBeenCalledWith('aluno-1', 'Enfermagem Médica', 9)
    })

    document.body.removeChild(view)
  })
})
