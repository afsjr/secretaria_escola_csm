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
      getImageProperties: vi.fn().mockReturnValue({ width: 100, height: 100 }),
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
import { InstituicaoService } from './instituicao-service'
import { autoTable } from 'jspdf-autotable'

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

  it('deve gerar PDF sem erro com dados válidos', async () => {
    const doc = await PDFService.generateDiarioClassePDF(mockData, mockTurmaInfo) as any

    expect(doc).toBeDefined()
    expect(typeof doc.save).toBe('function')
    expect(typeof doc.output).toBe('function')
    expect(typeof doc.text).toBe('function')
  })

  it('deve chamar text com o título DIÁRIO DE CLASSE', async () => {
    const doc = await PDFService.generateDiarioClassePDF(mockData, mockTurmaInfo) as any

    expect(doc.text).toHaveBeenCalledWith(
      expect.stringContaining('DIÁRIO DE CLASSE'),
      expect.any(Number),
      expect.any(Number),
      expect.any(Object),
    )
  })

  it('deve chamar text com o nome da turma', async () => {
    const doc = await PDFService.generateDiarioClassePDF(mockData, mockTurmaInfo) as any

    expect(doc.text).toHaveBeenCalledWith(
      expect.stringContaining('Técnico em Enfermagem - 1º Ano'),
      expect.any(Number),
      expect.any(Number),
    )
  })

  it('deve chamar text com o nome de cada disciplina', async () => {
    const doc = await PDFService.generateDiarioClassePDF(mockData, mockTurmaInfo) as any

    const textCalls = doc.text.mock.calls
    const allText = textCalls.map((c: any[]) => String(c[0])).join(' ')

    expect(allText).toContain('Anatomia e Fisiologia Humana')
    expect(allText).toContain('Microbiologia')
  })

  it('deve chamar text com o nome do professor', async () => {
    const doc = await PDFService.generateDiarioClassePDF(mockData, mockTurmaInfo) as any

    const textCalls = doc.text.mock.calls
    const allText = textCalls.map((c: any[]) => String(c[0])).join(' ')

    expect(allText).toContain('João Silva')
    expect(allText).toContain('Maria Santos')
  })

  it('deve lançar erro se lista de disciplinas estiver vazia', async () => {
    const dataVazia = { ...mockData, disciplinas: [] }

    await expect(PDFService.generateDiarioClassePDF(dataVazia, mockTurmaInfo)).rejects.toThrow(
      'Nenhuma disciplina',
    )
  })

  it('deve lançar erro se turma_nome estiver vazio', async () => {
    const dataInvalida = { ...mockData, turma_nome: '' }

    await expect(PDFService.generateDiarioClassePDF(dataInvalida, mockTurmaInfo)).rejects.toThrow(
      'Nome da turma',
    )
  })
})

describe('PDFService - generateAtaResultadosPDF', () => {
  const mockPayload = {
    turma_id: 't1',
    turma_nome: 'TÉCNICO EM ENFERMAGEM 2026.1',
    periodo: '2026.1',
    ano_letivo: 2026,
    curso_nome: 'Técnico em Enfermagem',
    polo: null,
    alunos: [
      {
        matricula_id: 'm1',
        aluno_id: 'a1',
        nome_completo: 'Maria da Silva',
        status_aluno: 'ativo',
        situacao_final: 'Aprovado',
        frequencia_geral: 90,
        componentes: [
          {
            disciplina_base_id: 'db1',
            nome: 'Anatomia e Fisiologia Humana',
            modulo: 'I Módulo',
            carga_horaria: 80,
            nota_final: 8,
            nota_final_texto: '8.0',
            faltas: 8,
            percentual_frequencia: 90,
            nota_estagio: null,
            tem_estagio: false,
            status: 'Aprovado',
          },
          {
            disciplina_base_id: 'db2',
            nome: 'Farmacologia',
            modulo: 'II Módulo',
            carga_horaria: 40,
            nota_final: 5,
            nota_final_texto: '5.0',
            faltas: 4,
            percentual_frequencia: 90,
            nota_estagio: 'AP',
            tem_estagio: true,
            status: 'Reprovado',
          },
        ],
      },
    ],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve gerar PDF sem erro com payload válido', async () => {
    const doc = await PDFService.generateAtaResultadosPDF(mockPayload as any) as any

    expect(doc).toBeDefined()
    expect(typeof doc.save).toBe('function')
    expect(typeof doc.text).toBe('function')
  })

  it('deve renderizar o título ATA DE RESULTADOS FINAIS', async () => {
    const doc = await PDFService.generateAtaResultadosPDF(mockPayload as any) as any

    const allText = doc.text.mock.calls.map((c: any[]) => String(c[0])).join(' ')
    expect(allText).toContain('ATA DE RESULTADOS FINAIS')
  })

  it('deve renderizar turma, curso, nome do aluno e situação final', async () => {
    const doc = await PDFService.generateAtaResultadosPDF(mockPayload as any) as any

    const allText = doc.text.mock.calls.map((c: any[]) => String(c[0])).join(' ')
    expect(allText).toContain('TÉCNICO EM ENFERMAGEM 2026.1')
    expect(allText).toContain('Técnico em Enfermagem')

    const config = (autoTable as any).mock.calls[0][1]
    const bodyJson = JSON.stringify(config.body)
    expect(bodyJson).toContain('Maria da Silva')
    expect(bodyJson).toContain('Situação Final')
    expect(bodyJson).toContain('Aprovado')
  })

  it('deve ativar repetição de cabeçalho e paginação (showHead everyPage + didDrawPage)', async () => {
    await PDFService.generateAtaResultadosPDF(mockPayload as any) as any

    const config = (autoTable as any).mock.calls[0][1]
    expect(config.showHead).toBe('everyPage')
    expect(typeof config.didDrawPage).toBe('function')
  })

  it('deve lançar erro se turma_nome estiver vazio', async () => {
    const invalido = { ...mockPayload, turma_nome: '' }

    await expect(PDFService.generateAtaResultadosPDF(invalido as any)).rejects.toThrow('Nome da turma')
  })

  it('deve lançar erro se não houver alunos', async () => {
    const invalido = { ...mockPayload, alunos: [] }

    await expect(PDFService.generateAtaResultadosPDF(invalido as any)).rejects.toThrow('Nenhum aluno')
  })
})

describe('PDFService - _renderLogo e cabeçalho com logo', () => {
  function instComLogo() {
    return { nome: 'Colégio Santa Mônica', logo_url: 'data:image/png;base64,AAAA' }
  }

  it('_renderLogo retorna 0 quando não há logo_url', () => {
    const w = PDFService._renderLogo(currentMockDoc, { nome: 'Colégio' }, 10, 38)

    expect(w).toBe(0)
    expect(currentMockDoc.addImage).not.toHaveBeenCalled()
  })

  it('_renderLogo retorna 0 quando logo_url não é data URL', () => {
    const w = PDFService._renderLogo(
      currentMockDoc,
      { nome: 'Colégio', logo_url: 'http://x/logo.png' },
      10,
      38,
    )

    expect(w).toBe(0)
  })

  it('_renderLogo preserva a proporção real e chama addImage com o data URL', () => {
    ;(currentMockDoc.getImageProperties as any).mockReturnValueOnce({ width: 200, height: 100 })

    const logoTargetHeight = 38 * 0.55
    const w = PDFService._renderLogo(currentMockDoc, instComLogo(), 10, 38)

    expect(w).toBeCloseTo((200 / 100) * logoTargetHeight, 5)
    expect(currentMockDoc.addImage).toHaveBeenCalledWith(
      'data:image/png;base64,AAAA',
      'PNG',
      10,
      (38 - logoTargetHeight) / 2,
      (200 / 100) * logoTargetHeight,
      logoTargetHeight,
    )
  })

  it('_renderLogo retorna 0 quando a imagem não pode ser lida', () => {
    ;(currentMockDoc.getImageProperties as any).mockImplementationOnce(() => {
      throw new Error('imagem inválida')
    })

    const w = PDFService._renderLogo(currentMockDoc, instComLogo(), 10, 38)

    expect(w).toBe(0)
  })

  it('generateAtaResultadosPDF desenha a logo no cabeçalho quando há logo (RF-01)', async () => {
    vi.resetModules()
    const { PDFService: freshPDF } = await import('./pdf-service')
    const { InstituicaoService: freshInst } = await import('./instituicao-service')

    vi.mocked(freshInst.getPDFHeader).mockResolvedValueOnce({
      nome: 'Colégio Santa Mônica',
      cnpj: '',
      endereco: 'Rua Exemplo, 123 - Limoeiro/PE',
      cidade_uf: '',
      telefone: '',
      email: '',
      logo_url: 'data:image/png;base64,AAAA',
      cor_primaria: '#C41E3A',
    } as any)

    const payload = {
      turma_nome: 'TÉCNICO EM ENFERMAGEM 2026.1',
      alunos: [{ matricula_id: 'm1', nome_completo: 'Maria da Silva', componentes: [] }],
    }

    const doc = await freshPDF.generateAtaResultadosPDF(payload as any) as any

    expect(doc.addImage).toHaveBeenCalled()
    expect(doc.addImage).toHaveBeenCalledWith(
      'data:image/png;base64,AAAA',
      'PNG',
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
    )
  })
})
