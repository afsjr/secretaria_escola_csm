import { describe, it, expect, vi, beforeEach } from 'vitest'

let currentMockDoc: any

vi.mock('jspdf', () => {
  function MockJsPDF() {
    currentMockDoc = {
      text: vi.fn().mockReturnThis(),
      save: vi.fn(),
      output: vi.fn(),
      addPage: vi.fn(),
      setFontSize: vi.fn().mockReturnThis(),
      setFont: vi.fn().mockReturnThis(),
      setTextColor: vi.fn().mockReturnThis(),
      setDrawColor: vi.fn().mockReturnThis(),
      setFillColor: vi.fn().mockReturnThis(),
      line: vi.fn().mockReturnThis(),
      rect: vi.fn().mockReturnThis(),
      roundedRect: vi.fn().mockReturnThis(),
      internal: {
        pageSize: { getWidth: () => 210, getHeight: () => 297 },
        getNumberOfPages: () => 1,
      },
      lastAutoTable: { finalY: 50 },
      splitTextToSize: vi.fn().mockReturnValue(['mocked split text']),
      addImage: vi.fn(),
    }
    return currentMockDoc
  }
  return { jsPDF: MockJsPDF }
})

vi.mock('jspdf-autotable', () => ({
  autoTable: vi.fn(),
}))

vi.mock('./instituicao-service', () => ({
  InstituicaoService: {
    getPDFHeader: vi.fn().mockResolvedValue({
      nome: 'Colégio Santa Mônica',
      endereco: 'Rua Exemplo, 123 - Limoeiro/PE',
    }),
  },
}))

import { PDFService } from './pdf-service'

describe('PDFService - generateDiarioClassePDF', () => {
  const mockTurmaInfo = {
    turma_nome: 'Técnico em Enfermagem - 1º Ano',
    periodo: 'Manhã',
    curso_nome: 'Técnico em Enfermagem',
  }

  const mockData = {
    turma_nome: 'Técnico em Enfermagem - 1º Ano',
    periodo: '01/01/2026 a 31/12/2026',
    curso_nome: 'Técnico em Enfermagem',
    disciplinas: [
      {
        disciplina_nome: 'Anatomia e Fisiologia Humana',
        carga_horaria: 80,
        professor_nome: 'João Silva',
        aulas: [
          { data: '05/02/2026', conteudo: 'Sistema esquelético' },
          { data: '12/02/2026', conteudo: 'Sistema muscular' },
        ],
        total_aulas: 2,
      },
      {
        disciplina_nome: 'Microbiologia',
        carga_horaria: 60,
        professor_nome: 'Maria Santos',
        aulas: [
          { data: '10/02/2026', conteudo: 'Bactérias Gram-positivas' },
        ],
        total_aulas: 1,
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve gerar PDF sem erro com dados válidos', () => {
    const doc = PDFService.generateDiarioClassePDF(mockData, mockTurmaInfo) as any

    expect(doc).toBeDefined()
    expect(typeof doc.save).toBe('function')
    expect(typeof doc.output).toBe('function')
    expect(typeof doc.text).toBe('function')
  })

  it('deve chamar text com o título DIÁRIO DE CLASSE', () => {
    const doc = PDFService.generateDiarioClassePDF(mockData, mockTurmaInfo) as any

    expect(doc.text).toHaveBeenCalledWith(
      expect.stringContaining('DIÁRIO DE CLASSE'),
      expect.any(Number),
      expect.any(Number),
      expect.any(Object),
    )
  })

  it('deve chamar text com o nome da turma', () => {
    const doc = PDFService.generateDiarioClassePDF(mockData, mockTurmaInfo) as any

    expect(doc.text).toHaveBeenCalledWith(
      expect.stringContaining('Técnico em Enfermagem - 1º Ano'),
      expect.any(Number),
      expect.any(Number),
    )
  })

  it('deve chamar text com o nome de cada disciplina', () => {
    const doc = PDFService.generateDiarioClassePDF(mockData, mockTurmaInfo) as any

    const textCalls = doc.text.mock.calls
    const allText = textCalls.map((c: any[]) => String(c[0])).join(' ')

    expect(allText).toContain('Anatomia e Fisiologia Humana')
    expect(allText).toContain('Microbiologia')
  })

  it('deve chamar text com o nome do professor', () => {
    const doc = PDFService.generateDiarioClassePDF(mockData, mockTurmaInfo) as any

    const textCalls = doc.text.mock.calls
    const allText = textCalls.map((c: any[]) => String(c[0])).join(' ')

    expect(allText).toContain('João Silva')
    expect(allText).toContain('Maria Santos')
  })

  it('deve lançar erro se lista de disciplinas estiver vazia', () => {
    const dataVazia = { ...mockData, disciplinas: [] }

    expect(() => PDFService.generateDiarioClassePDF(dataVazia, mockTurmaInfo)).toThrow(
      'Nenhuma disciplina',
    )
  })

  it('deve lançar erro se turma_nome estiver vazio', () => {
    const dataInvalida = { ...mockData, turma_nome: '' }

    expect(() => PDFService.generateDiarioClassePDF(dataInvalida, mockTurmaInfo)).toThrow(
      'Nome da turma',
    )
  })
})
