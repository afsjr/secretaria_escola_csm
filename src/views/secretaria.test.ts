import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SecretariaView } from './secretaria'
import { AcademicService } from '../lib/academic-service'
import { DocumentsService } from '../lib/documents-service'
import { AdminService } from '../lib/admin-service'
import { disciplinaTemEstagio } from '../lib/grades-utils'

// Mocks de todas as dependências externas
vi.mock('../lib/documents-service', () => ({ DocumentsService: { getAllOpenRequests: vi.fn().mockResolvedValue({ data: [], error: null }) } }))
vi.mock('../lib/admin-service', () => ({ AdminService: { listAlunos: vi.fn().mockResolvedValue({ data: [], error: null }), getAlunoById: vi.fn(), updateAluno: vi.fn() } }))
vi.mock('../lib/professor-service', () => ({ 
  ProfessorService: { 
    getProfessores: vi.fn().mockResolvedValue({ data: [], error: null }), 
    getDisciplinasDoProfessor: vi.fn().mockResolvedValue({ data: [], error: null }) 
  } 
}))
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
vi.mock('../components/Tabs/DiarioClasseTab', () => ({ DiarioClasseTab: vi.fn().mockReturnValue(document.createElement('div')) }))
vi.mock('../components/Tabs/DocumentosTab', () => ({ DocumentosTab: vi.fn().mockReturnValue(document.createElement('div')) }))

describe('disciplinaTemEstagio - Business Rules', () => {
  it('deve bloquear estágio para o 1º módulo', () => {
    expect(disciplinaTemEstagio('Anatomia', '1')).toBe(false)
    expect(disciplinaTemEstagio('Anatomia', 'I Módulo')).toBe(false)
  })

  it('deve bloquear estágio para disciplinas teóricas no 2º módulo', () => {
    expect(disciplinaTemEstagio('Farmacologia Aplicada', '2')).toBe(false)
    expect(disciplinaTemEstagio('Administração em Enfermagem', '2')).toBe(false)
  })

  it('deve permitir estágio para disciplinas práticas no 2º módulo', () => {
    expect(disciplinaTemEstagio('Enfermagem Médica', '2')).toBe(true)
  })

  it('deve permitir estágio para o 3º módulo e superiores', () => {
    expect(disciplinaTemEstagio('Enfermagem Cirúrgica', '3')).toBe(true)
  })
})

describe('SecretariaView - Integração Estágio', () => {
  const mockTurmas = [{ id: 'turma-1', nome: 'Turma A', periodo: '2024.1', status_ingresso: 'aberto', curso_id: 'curso-1' }]
  const mockAlunos = [{ perfis: { id: 'aluno-1', nome_completo: 'João Aluno' } }]
  const mockDisciplinas = [
    { id: 'oferta-1', disciplina_base_id: 'base-1', nome: 'Enfermagem Médica', modulo: '2' },
    { id: 'oferta-2', disciplina_base_id: 'base-2', nome: 'Anatomia', modulo: '1' }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(AcademicService.getTurmas).mockResolvedValue({ data: mockTurmas, error: null, count: 2 })
    vi.mocked(AcademicService.getAlunosDaTurma).mockResolvedValue({ data: mockAlunos, error: null })
    vi.mocked(AcademicService.getDisciplinasDaTurma).mockResolvedValue({ 
      data: { disciplinas: mockDisciplinas } as any, 
      error: null 
    })
    vi.mocked(AcademicService.getBoletim).mockResolvedValue({ data: [], error: null })
    vi.mocked(AcademicService.upsertNotaEstagio).mockResolvedValue({ data: {} as any, error: null })
  })

  it('deve realizar o fluxo completo de lançamento de nota', async () => {
    const view = await SecretariaView({ id: 'admin-1', perfil: 'admin' })
    document.body.appendChild(view)

    // Simular clique na tab de estágio para carregar o componente
    const tabBtn = view.querySelector('[data-tab="estagio"]') as HTMLButtonElement
    tabBtn?.click()

    const selectTurma = view.querySelector('#notas-turma-select') as HTMLSelectElement
    const selectAluno = view.querySelector('#notas-aluno-select') as HTMLSelectElement
    const selectDisciplina = view.querySelector('#notas-disciplina-select') as HTMLSelectElement
    const btnCarregar = view.querySelector('#btn-carregar-notas') as HTMLButtonElement

    // 1. Turma
    selectTurma.value = 'turma-1'
    selectTurma.dispatchEvent(new Event('change', { bubbles: true }))
    await vi.waitFor(() => expect(selectAluno.disabled).toBe(false))

    // 2. Aluno
    selectAluno.value = 'aluno-1'
    selectAluno.dispatchEvent(new Event('change', { bubbles: true }))
    await vi.waitFor(() => expect(selectDisciplina.disabled).toBe(false))

    // 3. Disciplina (validar regra visual de Sem Estágio)
    expect(selectDisciplina.innerHTML).toContain('Anatomia (⚠️ Sem Estágio)')
    
    selectDisciplina.value = 'base-1'
    selectDisciplina.dispatchEvent(new Event('change', { bubbles: true }))
    await vi.waitFor(() => expect(btnCarregar.disabled).toBe(false))
    
    btnCarregar.click()

    // 4. Salvar
    await vi.waitFor(() => expect(view.querySelector('#btn-salvar-nota-estagio')).not.toBeNull())
    
    const inputNota = view.querySelector('#input-nota-estagio') as HTMLInputElement
    const btnSalvar = view.querySelector('#btn-salvar-nota-estagio') as HTMLButtonElement

    inputNota.value = '10'
    btnSalvar.click()

    await vi.waitFor(() => {
      expect(AcademicService.upsertNotaEstagio).toHaveBeenCalledWith('aluno-1', 'base-1', 10)
    })

    document.body.removeChild(view)
  })

  it('deve renderizar a aba Diário de Classe', async () => {
    vi.clearAllMocks()

    const view = await SecretariaView({ id: 'admin-1', perfil: 'admin' })
    document.body.appendChild(view)

    const tabBtn = view.querySelector('[data-tab="diario-classe"]') as HTMLButtonElement
    expect(tabBtn).not.toBeNull()
    expect(tabBtn.textContent).toContain('Diário de Classe')

    document.body.removeChild(view)
  })

  it('deve renderizar a aba Documentos', async () => {
    vi.clearAllMocks()

    const view = await SecretariaView({ id: 'admin-1', perfil: 'admin' })
    document.body.appendChild(view)

    const tabBtn = view.querySelector('[data-tab="documentos"]') as HTMLButtonElement
    expect(tabBtn).not.toBeNull()
    expect(tabBtn.textContent).toContain('Documentos')

    document.body.removeChild(view)
  })
})
