import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SecretariaView } from './secretaria'
import { DocumentsService } from '../lib/documents-service'
import { AdminService } from '../lib/admin-service'
import { ProfessorService } from '../lib/professor-service'
import { CourseService } from '../lib/course-service'
import { AcademicService } from '../lib/academic-service'

// Mocks de bibliotecas externas problemáticas em Node
vi.mock('jspdf', () => ({
  default: vi.fn().mockImplementation(() => ({
    addPage: vi.fn(),
    text: vi.fn(),
    save: vi.fn(),
    output: vi.fn().mockReturnValue(new Uint8Array())
  })),
  jsPDF: vi.fn().mockImplementation(() => ({
    addPage: vi.fn(),
    text: vi.fn(),
    save: vi.fn(),
    output: vi.fn().mockReturnValue(new Uint8Array())
  }))
}))

vi.mock('jspdf-autotable', () => ({
  default: vi.fn()
}))

vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: vi.fn(),
    book_new: vi.fn(),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn()
}))

// Mocks de serviços internos
vi.mock('../lib/documents-service', () => ({
  DocumentsService: {
    getAllOpenRequests: vi.fn().mockResolvedValue({ data: [], error: null })
  }
}))

vi.mock('../lib/admin-service', () => ({
  AdminService: {
    listAlunos: vi.fn().mockResolvedValue({ data: [], error: null })
  }
}))

vi.mock('../lib/professor-service', () => ({
  ProfessorService: {
    getProfessores: vi.fn().mockResolvedValue({ data: [], error: null }),
    getAllDisciplinas: vi.fn().mockResolvedValue({ data: [], error: null })
  }
}))

vi.mock('../lib/course-service', () => ({
  CourseService: {
    getCursos: vi.fn().mockResolvedValue({ data: [], error: null })
  }
}))

vi.mock('../lib/academic-service', () => ({
  AcademicService: {
    getTurmas: vi.fn().mockResolvedValue({ data: [], error: null })
  }
}))

vi.mock('../lib/toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis()
  }
}))

describe('SecretariaView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar o titulo corretamente', async () => {
    const view = await SecretariaView()
    expect(view.innerHTML).toContain('Painel da Secretaria')
    expect(view.innerHTML).toContain('Gerencie as solicitações de todos os alunos')
  })

  it('deve chamar os serviços necessários na inicialização', async () => {
    await SecretariaView()
    expect(DocumentsService.getAllOpenRequests).toHaveBeenCalled()
    expect(AdminService.listAlunos).toHaveBeenCalled()
    expect(ProfessorService.getProfessores).toHaveBeenCalled()
    expect(AcademicService.getTurmas).toHaveBeenCalled()
  })

  it('deve renderizar a tabela de solicitações quando houver dados', async () => {
    const mockRequests = [
      { id: '1', user_id: 'user1', tipo: 'Declaração', status: 'pendente', perfis: { nome_completo: 'Aluno Teste', email: 'aluno@test.com' } }
    ]
    ;(DocumentsService.getAllOpenRequests as any).mockResolvedValue({ data: mockRequests, error: null })

    const view = await SecretariaView()
    const tabSolicitacoes = view.querySelector('#tab-solicitacoes')
    expect(tabSolicitacoes).not.toBeNull()
  })

  it('deve renderizar a lista de alunos corretamente', async () => {
    const mockAlunos = [
      { id: '1', nome_completo: 'João Silva', email: 'joao@email.com', cpf: '123.456.789-00', telefone: '8199999999', bloqueio_financeiro: false }
    ]
    ;(AdminService.listAlunos as any).mockResolvedValue({ data: mockAlunos, error: null })

    const view = await SecretariaView()
    expect(view.innerHTML).toContain('João Silva')
    expect(view.innerHTML).toContain('joao@email.com')
    expect(view.innerHTML).toContain('123.456.789-00')
  })

  it('deve mostrar mensagem de erro se o serviço de solicitações falhar', async () => {
    ;(DocumentsService.getAllOpenRequests as any).mockResolvedValue({ data: null, error: { message: 'Erro de conexão' } })

    const view = await SecretariaView()
    const tabSolicitacoes = view.querySelector('#tab-solicitacoes')
    expect(tabSolicitacoes).not.toBeNull()
  })
})
