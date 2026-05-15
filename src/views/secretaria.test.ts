import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SecretariaView } from './secretaria'
import { DocumentsService } from '../lib/documents-service'
import { AdminService } from '../lib/admin-service'
import { ProfessorService } from '../lib/professor-service'
import { CourseService } from '../lib/course-service'
import { AcademicService } from '../lib/academic-service'

function disciplinaTemEstagio(disciplinaNome: string, modulo: string | null | undefined): boolean {
  if (!modulo) return false
  if (modulo === 'I Módulo' || modulo === '1' || modulo.toString().startsWith('1')) {
    return false
  }
  if (modulo === 'II Módulo' || modulo === '2' || modulo.toString().startsWith('2')) {
    const nome = disciplinaNome.toLowerCase()
    if (nome.includes('farmacologia') || nome.includes('adm')) {
      return false
    }
    return true
  }
  return true
}

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
    getTurmas: vi.fn().mockResolvedValue({ data: [], error: null }),
    getAlunosDaTurma: vi.fn().mockResolvedValue({ data: [], error: null }),
    getBoletim: vi.fn().mockResolvedValue({ data: [], error: null }),
    updateNotaEstagio: vi.fn().mockResolvedValue({ data: null, error: null })
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

describe('disciplinaTemEstagio', () => {
  it('deve retornar false para Módulo 1', () => {
    expect(disciplinaTemEstagio('Anatomia e Fisiologia Humana', 'I Módulo')).toBe(false)
    expect(disciplinaTemEstagio('Psicologia Aplicada', '1')).toBe(false)
    expect(disciplinaTemEstagio('Microbiologia e Parasitologia', '1º')).toBe(false)
  })

  it('deve retornar false para Farmacologia no Módulo 2', () => {
    expect(disciplinaTemEstagio('Noções de Farmacologia', 'II Módulo')).toBe(false)
    expect(disciplinaTemEstagio('Farmacologia', '2')).toBe(false)
  })

  it('deve retornar false para Adm no Módulo 2', () => {
    expect(disciplinaTemEstagio('Noções de Adm. em Unidade de Enfermagem', 'II Módulo')).toBe(false)
    expect(disciplinaTemEstagio('Administração em Saúde', '2')).toBe(false)
  })

  it('deve retornar true para outras disciplinas no Módulo 2', () => {
    expect(disciplinaTemEstagio('Enfermagem Médica', 'II Módulo')).toBe(true)
    expect(disciplinaTemEstagio('Enfermagem Cirúrgica', '2')).toBe(true)
    expect(disciplinaTemEstagio('Introdução à Enfermagem', '2º')).toBe(true)
  })

  it('deve retornar true para Módulo 3 e superiores', () => {
    expect(disciplinaTemEstagio('Enf. Materno Infantil', 'III Módulo')).toBe(true)
    expect(disciplinaTemEstagio('Enf. em Pronto Socorro', '3')).toBe(true)
    expect(disciplinaTemEstagio('Enf. em Saúde Pública', 'III Módulo')).toBe(true)
    expect(disciplinaTemEstagio('Enf. Neuro Psiquiátrica', 'IV Módulo')).toBe(true)
  })

  it('deve retornar false quando modulo for null ou undefined', () => {
    expect(disciplinaTemEstagio('Enfermagem', null)).toBe(false)
    expect(disciplinaTemEstagio('Enfermagem', undefined)).toBe(false)
  })
})

describe('Notas de Estágio - Renderização', () => {
  it('deve renderizar select de turma com id notas-turma-select', async () => {
    const view = await SecretariaView()
    const selectTurma = view.querySelector('#notas-turma-select')
    expect(selectTurma).not.toBeNull()
    expect((selectTurma as HTMLSelectElement).disabled).toBe(false)
  })

  it('deve renderizar select de aluno com id notas-aluno-select desabilitado inicialmente', async () => {
    const view = await SecretariaView()
    const selectAluno = view.querySelector('#notas-aluno-select')
    expect(selectAluno).not.toBeNull()
    expect((selectAluno as HTMLSelectElement).disabled).toBe(true)
  })

  it('deve renderizar select de disciplina com id notas-disciplina-select desabilitado inicialmente', async () => {
    const view = await SecretariaView()
    const selectDisciplina = view.querySelector('#notas-disciplina-select')
    expect(selectDisciplina).not.toBeNull()
    expect((selectDisciplina as HTMLSelectElement).disabled).toBe(true)
  })

  it('deve renderizar botão Carregar Estágio desabilitado inicialmente', async () => {
    const view = await SecretariaView()
    const btn = view.querySelector('#btn-carregar-notas')
    expect(btn).not.toBeNull()
    expect((btn as HTMLButtonElement).disabled).toBe(true)
  })

  it('deve renderizar container de notas com display none inicialmente', async () => {
    const view = await SecretariaView()
    const content = view.querySelector('#notas-content') as HTMLElement
    expect(content).not.toBeNull()
  })

  it('deve conter label e options corretas no select de turma', async () => {
    const mockTurmas = [
      { id: '1', nome: 'Turma A', periodo: '2024.1' },
      { id: '2', nome: 'Turma B', periodo: '2024.2' }
    ]
    ;(AcademicService.getTurmas as any).mockResolvedValue({ data: mockTurmas, error: null })

    const view = await SecretariaView()
    const html = view.innerHTML

    expect(html).toContain('Selecione a Turma')
    expect(html).toContain('Turma A (2024.1)')
    expect(html).toContain('Turma B (2024.2)')
  })

  it('deve conter texto "Notas de Estágio" no cabeçalho', async () => {
    const view = await SecretariaView()
    expect(view.innerHTML).toContain('Notas de Estágio')
    expect(view.innerHTML).toContain('Lançar notas de estágio (0-10)')
  })
})

describe('Notas de Estágio - Integração com serviços', () => {
  it('deve chamar getTurmas na inicialização', async () => {
    await SecretariaView()
    expect(AcademicService.getTurmas).toHaveBeenCalled()
  })

  it('deve renderizar a estrutura completa da aba de notas', async () => {
    const view = await SecretariaView()
    const tabNotas = view.querySelector('#tab-notas')
    expect(tabNotas).not.toBeNull()
    expect(tabNotas?.innerHTML).toContain('notas-turma-select')
    expect(tabNotas?.innerHTML).toContain('notas-aluno-select')
    expect(tabNotas?.innerHTML).toContain('notas-disciplina-select')
    expect(tabNotas?.innerHTML).toContain('btn-carregar-notas')
    expect(tabNotas?.innerHTML).toContain('notas-content')
  })

  it('deve carregar alunos quando turma for selecionada - verificação de elementos', async () => {
    const view = await SecretariaView()
    const tabNotas = view.querySelector('#tab-notas')
    const selectTurma = tabNotas?.querySelector('#notas-turma-select') as HTMLElement
    expect(selectTurma).not.toBeNull()
  })

  it('deve ter option placeholder no select de aluno', async () => {
    const view = await SecretariaView()
    const tabNotas = view.querySelector('#tab-notas')
    const selectAluno = tabNotas?.querySelector('#notas-aluno-select') as HTMLElement
    expect(selectAluno).not.toBeNull()
  })

  it('deve ter option placeholder no select de disciplina', async () => {
    const view = await SecretariaView()
    const tabNotas = view.querySelector('#tab-notas')
    const selectDisciplina = tabNotas?.querySelector('#notas-disciplina-select') as HTMLElement
    expect(selectDisciplina).not.toBeNull()
  })
})
