import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SecretariaView } from './secretaria'
import { AcademicService } from '../lib/academic-service'

// Mocks exaustivos
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

describe('SecretariaView - Raio-X de Eventos', () => {
  it('deve registrar o listener de change no select de turma', async () => {
    // Espionar o registro de eventos
    const addEventListenerSpy = vi.spyOn(HTMLElement.prototype, 'addEventListener')
    
    const mockTurmas = [{ id: 'turma-1', nome: 'Turma A', periodo: '2024.1' }]
    vi.mocked(AcademicService.getTurmas).mockResolvedValue({ data: mockTurmas, error: null })

    const view = await SecretariaView()
    
    // Procurar se houve um addEventListener('change', ...) em um elemento com o ID correto
    const changeRegistration = addEventListenerSpy.mock.calls.find(call => {
      const [type] = call
      const target = call.currentTarget || (call as any).target // Depende da implementação do Vitest/JSDOM
      // Infelizmente o spy no prototype não nos dá o 'this' facilmente, 
      // mas podemos verificar se o select de turma tem listeners anexados se usarmos um wrapper
      return type === 'change'
    })

    // Forma mais confiável: disparar e ver se o AcademicService é chamado
    const selectTurma = view.querySelector('#notas-turma-select') as HTMLSelectElement
    expect(selectTurma).not.toBeNull()
    
    selectTurma.value = 'turma-1'
    selectTurma.dispatchEvent(new Event('change', { bubbles: true }))

    // Se o evento não disparou, vamos tentar chamar a lógica manualmente para ver se há erro nela
    await vi.waitFor(() => {
      if (AcademicService.getAlunosDaTurma.mock.calls.length === 0) {
        throw new Error('O listener de change não foi executado. Verifique se ele foi registrado.')
      }
    }, { timeout: 1000 }).catch(err => {
       console.log('DOM Atual:', view.innerHTML.substring(0, 500) + '...')
       throw err
    })
  })
})
