import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'

export const PDFService = {

  // =====================================================
  // BOLETIM ESCOLAR (Grade Report)
  // =====================================================
  generateBoletimPDF(alunoData, notasData, turmaInfo) {
    const doc = new jsPDF('portrait', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const marginLeft = 15
    const marginRight = 15
    const contentWidth = pageWidth - marginLeft - marginRight

    // --- Header ---
    doc.setFillColor(30, 58, 95) // var(--primary)
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('COLÉGIO SANTA MÔNICA', marginLeft, 15)
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Limoeiro/PE - CNPJ: XX.XXX.XXX/0001-XX', marginLeft, 21)
    doc.text('Rua Principal, 123 - Centro - CEP: 55700-000', marginLeft, 26)
    doc.text('Tel: (81) 3621-XXXX | secretaria@csm.edu.br', marginLeft, 31)

    // --- Title ---
    doc.setTextColor(30, 58, 95)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('BOLETIM ESCOLAR', pageWidth / 2, 48, { align: 'center' })

    // --- Student Info ---
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    
    const infoY = 58
    doc.text(`Aluno(a): ${alunoData.nome_completo || 'N/A'}`, marginLeft, infoY)
    doc.text(`Curso: ${turmaInfo?.curso_nome || 'Técnico em Enfermagem'}`, marginLeft, infoY + 6)
    doc.text(`Turma: ${turmaInfo?.turma_nome || 'N/A'} - ${turmaInfo?.periodo || ''}`, marginLeft, infoY + 12)
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, marginLeft, infoY + 18)

    // --- Grade Table ---
    const modulos = this._agruparNotasPorModulo(notasData)
    let currentY = infoY + 28

    Object.keys(modulos).forEach((modulo) => {
      if (currentY > 250) {
        doc.addPage()
        currentY = 20
      }

      // Module header
      doc.setFillColor(30, 58, 95)
      doc.rect(marginLeft, currentY - 4, contentWidth, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(modulo, marginLeft + 3, currentY + 1)
      doc.setTextColor(0, 0, 0)
      
      currentY += 10

      // Table data
      const tableData = modulos[modulo].map(n => {
        const mediaTeoria = this._calcularMediaTeoria(n)
        const mediaFinal = this._calcularMediaFinal(mediaTeoria, n.rec)
        const situacao = mediaFinal >= 7 ? 'Aprovado' : 'Reprovado'
        
        return [
          n.disciplina,
          n.faltas?.toString() || '0',
          (n.n1 || 0).toFixed(1),
          (n.n2 || 0).toFixed(1),
          (n.n3 || 0).toFixed(1),
          mediaTeoria.toFixed(1),
          (n.rec || 0).toFixed(1),
          mediaFinal.toFixed(1),
          situacao
        ]
      })

      autoTable(doc, {
        startY: currentY,
        head: [['Disciplina', 'Faltas', 'N1', 'N2', 'N3', 'Média', 'Rec.', 'Final', 'Situação']],
        body: tableData,
        margin: { left: marginLeft, right: marginRight },
        styles: {
          fontSize: 7,
          cellPadding: 2,
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [240, 244, 248],
          textColor: [30, 58, 95],
          fontStyle: 'bold',
          fontSize: 7
        },
        bodyStyles: {
          textColor: [0, 0, 0]
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { halign: 'center', cellWidth: 12 },
          2: { halign: 'center', cellWidth: 12 },
          3: { halign: 'center', cellWidth: 12 },
          4: { halign: 'center', cellWidth: 12 },
          5: { halign: 'center', cellWidth: 15 },
          6: { halign: 'center', cellWidth: 12 },
          7: { halign: 'center', cellWidth: 15 },
          8: { halign: 'center', cellWidth: 20 }
        },
        didParseCell: function(data) {
          if (data.section === 'body' && data.column.index === 8) {
            if (data.cell.raw === 'Aprovado') {
              data.cell.styles.textColor = [38, 161, 105]
              data.cell.styles.fontStyle = 'bold'
            } else if (data.cell.raw === 'Reprovado') {
              data.cell.styles.textColor = [229, 62, 62]
              data.cell.styles.fontStyle = 'bold'
            }
          }
        }
      })

      currentY = doc.lastAutoTable.finalY + 10
    })

    // --- Footer ---
    if (currentY > 250) {
      doc.addPage()
      currentY = 20
    }

    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text('Média mínima para aprovação: 7.0 | Fórmula: Média Teoria = (N1+N2+N3)/3', marginLeft, currentY)
    doc.text('Se houver Recuperação: Média Final = (Média Teoria + Rec)/2', marginLeft, currentY + 4)

    // Signature
    const sigY = Math.max(currentY + 25, 260)
    doc.setDrawColor(0)
    doc.line(pageWidth / 2 - 40, sigY, pageWidth / 2 + 40, sigY)
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)
    doc.text('Diretor(a) / Secretário(a)', pageWidth / 2, sigY + 5, { align: 'center' })
    doc.text('Colégio Santa Mônica - Limoeiro/PE', pageWidth / 2, sigY + 10, { align: 'center' })

    return doc
  },

  // =====================================================
  // DECLARAÇÃO DE MATRÍCULA (Enrollment Declaration)
  // =====================================================
  generateDeclaracaoPDF(alunoData, turmaInfo) {
    const doc = new jsPDF('portrait', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const marginLeft = 25
    const marginRight = 25
    const contentWidth = pageWidth - marginLeft - marginRight

    // --- Header ---
    doc.setFillColor(30, 58, 95)
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('COLÉGIO SANTA MÔNICA', pageWidth / 2, 15, { align: 'center' })
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Limoeiro/PE - CNPJ: XX.XXX.XXX/0001-XX', pageWidth / 2, 21, { align: 'center' })
    doc.text('Rua Principal, 123 - Centro - CEP: 55700-000', pageWidth / 2, 26, { align: 'center' })
    doc.text('Tel: (81) 3621-XXXX | secretaria@csm.edu.br', pageWidth / 2, 31, { align: 'center' })

    // --- Title ---
    doc.setTextColor(30, 58, 95)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('DECLARAÇÃO DE MATRÍCULA', pageWidth / 2, 55, { align: 'center' })

    // --- Body Text ---
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')

    const nomeAluno = alunoData.nome_completo || 'N/A'
    const cpfAluno = alunoData.cpf || 'N/A'
    const cursoNome = turmaInfo?.curso_nome || 'Técnico em Enfermagem'
    const turmaNome = turmaInfo?.turma_nome || 'N/A'
    const periodo = turmaInfo?.periodo || ''
    const dataAtual = new Date().toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })

    const texto = `Declaramos, para os devidos fins, que o(a) aluno(a) ${nomeAluno}, CPF: ${cpfAluno}, encontra-se devidamente matriculado(a) no curso ${cursoNome}, turma ${turmaNome} (${periodo}), nesta instituição de ensino.`

    const splitText = doc.splitTextToSize(texto, contentWidth)
    doc.text(splitText, marginLeft, 75)

    doc.text(`Limoeiro/PE, ${dataAtual}.`, marginLeft, 110)

    // --- Signature ---
    const sigY = 150
    doc.line(pageWidth / 2 - 50, sigY, pageWidth / 2 + 50, sigY)
    doc.setFontSize(10)
    doc.text('Secretário(a) Acadêmico(a)', pageWidth / 2, sigY + 5, { align: 'center' })
    doc.text('Colégio Santa Mônica - Limoeiro/PE', pageWidth / 2, sigY + 10, { align: 'center' })

    // --- Stamp Area ---
    doc.setDrawColor(150)
    doc.roundedRect(pageWidth / 2 - 25, sigY + 20, 50, 30, 3, 3, 'S')
    doc.setFontSize(7)
    doc.setTextColor(150, 150, 150)
    doc.text('LOCAL DO CARIMBO', pageWidth / 2, sigY + 37, { align: 'center' })

    return doc
  },

  // =====================================================
  // HISTÓRICO ACADÊMICO (Academic Transcript)
  // =====================================================
  generateHistoricoPDF(alunoData, notasData, turmaInfo) {
    const doc = new jsPDF('portrait', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const marginLeft = 15
    const marginRight = 15
    const contentWidth = pageWidth - marginLeft - marginRight

    // --- Header ---
    doc.setFillColor(30, 58, 95)
    doc.rect(0, 0, pageWidth, 35, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('COLÉGIO SANTA MÔNICA', pageWidth / 2, 15, { align: 'center' })
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Limoeiro/PE - CNPJ: XX.XXX.XXX/0001-XX', pageWidth / 2, 21, { align: 'center' })
    doc.text('Rua Principal, 123 - Centro - CEP: 55700-000', pageWidth / 2, 26, { align: 'center' })

    // --- Title ---
    doc.setTextColor(30, 58, 95)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('HISTÓRICO ACADÊMICO', pageWidth / 2, 48, { align: 'center' })

    // --- Student Info ---
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)

    let currentY = 58
    doc.text(`Nome: ${alunoData.nome_completo || 'N/A'}`, marginLeft, currentY)
    doc.text(`CPF: ${alunoData.cpf || 'N/A'}`, marginLeft + 100, currentY)
    currentY += 6
    doc.text(`Curso: ${turmaInfo?.curso_nome || 'Técnico em Enfermagem'}`, marginLeft, currentY)
    doc.text(`Turma: ${turmaInfo?.turma_nome || 'N/A'}`, marginLeft + 100, currentY)
    currentY += 6
    doc.text(`Período: ${turmaInfo?.periodo || 'N/A'}`, marginLeft, currentY)
    doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, marginLeft + 100, currentY)

    currentY += 12

    // --- Full Grade Table ---
    const modulos = this._agruparNotasPorModulo(notasData)
    const allNotas = []

    Object.keys(modulos).forEach((modulo) => {
      modulos[modulo].forEach(n => {
        const mediaTeoria = this._calcularMediaTeoria(n)
        const mediaFinal = this._calcularMediaFinal(mediaTeoria, n.rec)
        
        allNotas.push([
          modulo,
          n.disciplina,
          (n.n1 || 0).toFixed(1),
          (n.n2 || 0).toFixed(1),
          (n.n3 || 0).toFixed(1),
          (n.rec || 0).toFixed(1),
          mediaFinal.toFixed(1),
          n.faltas?.toString() || '0',
          mediaFinal >= 7 ? 'APR' : 'REP'
        ])
      })
    })

    autoTable(doc, {
      startY: currentY,
      head: [['Módulo', 'Disciplina', 'N1', 'N2', 'N3', 'Rec', 'Média', 'Faltas', 'Sit.']],
      body: allNotas,
      margin: { left: marginLeft, right: marginRight },
      styles: {
        fontSize: 6.5,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [30, 58, 95],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 50 },
        2: { halign: 'center', cellWidth: 12 },
        3: { halign: 'center', cellWidth: 12 },
        4: { halign: 'center', cellWidth: 12 },
        5: { halign: 'center', cellWidth: 12 },
        6: { halign: 'center', cellWidth: 15 },
        7: { halign: 'center', cellWidth: 12 },
        8: { halign: 'center', cellWidth: 12 }
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 8) {
          if (data.cell.raw === 'APR') {
            data.cell.styles.textColor = [38, 161, 105]
            data.cell.styles.fontStyle = 'bold'
          } else if (data.cell.raw === 'REP') {
            data.cell.styles.textColor = [229, 62, 62]
            data.cell.styles.fontStyle = 'bold'
          }
        }
      }
    })

    // --- Footer ---
    currentY = doc.lastAutoTable.finalY + 15
    
    if (currentY > 250) {
      doc.addPage()
      currentY = 20
    }

    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text('APR = Aprovado | REP = Reprovado', marginLeft, currentY)
    doc.text('Este documento não tem validade sem assinatura e carimbo da instituição.', marginLeft, currentY + 4)

    // Signature
    const sigY = Math.max(currentY + 25, 260)
    doc.setDrawColor(0)
    doc.line(pageWidth / 2 - 50, sigY, pageWidth / 2 + 50, sigY)
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.text('Diretor(a) / Secretário(a)', pageWidth / 2, sigY + 5, { align: 'center' })
    doc.text('Colégio Santa Mônica - Limoeiro/PE', pageWidth / 2, sigY + 10, { align: 'center' })

    return doc
  },

  // =====================================================
  // HELPER METHODS
  // =====================================================

  _agruparNotasPorModulo(notasData) {
    const modulos = {}
    
    notasData.forEach(n => {
      const modulo = n.modulo || 'Sem Módulo'
      if (!modulos[modulo]) {
        modulos[modulo] = []
      }
      modulos[modulo].push(n)
    })

    // Sort by module order
    const ordem = ['I Módulo', 'II Módulo', 'III Módulo']
    const sortedModulos = {}
    ordem.forEach(m => {
      if (modulos[m]) sortedModulos[m] = modulos[m]
    })
    Object.keys(modulos).forEach(m => {
      if (!sortedModulos[m]) sortedModulos[m] = modulos[m]
    })

    return sortedModulos
  },

  _calcularMediaTeoria(nota) {
    const n1 = parseFloat(nota.n1) || 0
    const n2 = parseFloat(nota.n2) || 0
    const n3 = parseFloat(nota.n3) || 0
    
    let sum = 0
    let count = 0
    if (n1 > 0) { sum += n1; count++ }
    if (n2 > 0) { sum += n2; count++ }
    if (n3 > 0) { sum += n3; count++ }
    
    return count > 0 ? sum / count : 0
  },

  _calcularMediaFinal(mediaTeoria, rec) {
    const recVal = parseFloat(rec) || 0
    if (recVal > 0) {
      return (mediaTeoria + recVal) / 2
    }
    return mediaTeoria
  },

  // =====================================================
  // DOWNLOAD HELPER
  // =====================================================
  downloadPDF(doc, filename) {
    doc.save(filename)
  }
}
