import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GerenciarAlunosTab } from './GerenciarAlunosTab'
import { AdminService } from '../../lib/admin-service'
import { StudentDetailsService } from '../../lib/student-details-service'

// Mocks
vi.mock('../../lib/admin-service', () => ({
  AdminService: {
    getAlunoById: vi.fn(),
    updateAluno: vi.fn(),
    matricularAluno: vi.fn()
  }
}))
vi.mock('../../lib/student-details-service', () => ({
  StudentDetailsService: {
    getEndereco: vi.fn().mockResolvedValue({ data: null, error: null }),
    saveEndereco: vi.fn().mockResolvedValue({ error: null })
  }
}))
vi.mock('../../lib/excel-service', () => ({ ExcelService: { exportAlunos: vi.fn() } }))
vi.mock('../../lib/toast', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock('../../views/student-details', () => ({ StudentDetailsView: vi.fn().mockResolvedValue(document.createElement('div')) }))

describe('GerenciarAlunosTab', () => {
  const mockAlunos = [
    { id: '1', nome_completo: 'João Silva', email: 'joao@test.com', cpf: '123', bloqueio_financeiro: false },
    { id: '2', nome_completo: 'Maria Souza', email: 'maria@test.com', cpf: '456', bloqueio_financeiro: true }
  ]
  const mockTurmas = [{ id: 't1', nome: 'Turma A', periodo: '2024.1' }]

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('deve renderizar a tabela com os alunos fornecidos', () => {
    const tab = GerenciarAlunosTab({ alunos: mockAlunos, turmas: mockTurmas })
    document.body.appendChild(tab)

    const rows = document.querySelectorAll('.aluno-row')
    expect(rows.length).toBe(2)
    expect(document.body.innerHTML).toContain('João Silva')
    expect(document.body.innerHTML).toContain('Maria Souza')
  })

  it('deve filtrar alunos na busca', () => {
    const tab = GerenciarAlunosTab({ alunos: mockAlunos, turmas: mockTurmas })
    document.body.appendChild(tab)

    const buscaInput = document.querySelector('#busca-aluno') as HTMLInputElement
    buscaInput.value = 'João'
    buscaInput.dispatchEvent(new Event('input'))

    const visibleRows = Array.from(document.querySelectorAll('.aluno-row')).filter(
      row => (row as HTMLElement).style.display !== 'none'
    )
    expect(visibleRows.length).toBe(1)
    expect(visibleRows[0].textContent).toContain('João Silva')
  })

  it('deve abrir modal de edição com dados do aluno', async () => {
    vi.mocked(AdminService.getAlunoById).mockResolvedValue({ data: mockAlunos[0], error: null } as any)
    
    const tab = GerenciarAlunosTab({ alunos: mockAlunos, turmas: mockTurmas })
    document.body.appendChild(tab)

    const btnEditar = document.querySelector('.btn-editar-aluno') as HTMLButtonElement
    btnEditar.click()

    await vi.waitFor(() => {
      const modal = document.querySelector('#modal-editar-aluno') as HTMLElement
      expect(modal.style.display).toBe('flex')
      const inputNome = document.querySelector('#edit-nome') as HTMLInputElement
      expect(inputNome.value).toBe('João Silva')
    })
  })

  it('deve chamar AdminService.matricularAluno ao confirmar matrícula', async () => {
    vi.mocked(AdminService.matricularAluno).mockResolvedValue({ error: null } as any)
    
    const tab = GerenciarAlunosTab({ alunos: mockAlunos, turmas: mockTurmas })
    document.body.appendChild(tab)

    // Abrir modal
    const btnMatricular = document.querySelector('.btn-vincular-turma') as HTMLButtonElement
    btnMatricular.click()

    // Preencher e enviar
    const selectTurma = document.querySelector('#vincular-turma-id') as HTMLSelectElement
    selectTurma.value = 't1'
    const form = document.querySelector('#form-vincular-turma') as HTMLFormElement
    form.dispatchEvent(new Event('submit'))

    await vi.waitFor(() => {
      expect(AdminService.matricularAluno).toHaveBeenCalledWith('1', 't1')
    })
  })
})
