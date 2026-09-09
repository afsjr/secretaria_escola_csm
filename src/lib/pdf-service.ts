import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { InstituicaoService } from "./instituicao-service";
import type { AtaResultadosData } from "../types/domain";

// Cache de sessão para o cabeçalho dos PDFs
let _cachedHeader: any = null;

async function getHeader() {
  if (!_cachedHeader) {
    _cachedHeader = await InstituicaoService.getPDFHeader();
  }
  return _cachedHeader;
}

interface AlunoData {
  nome_completo?: string;
  cpf?: string;
  [key: string]: any;
}

interface TurmaInfo {
  curso_nome?: string;
  turma_nome?: string;
  periodo?: string;
  [key: string]: any;
}

interface NotaData {
  disciplina: string;
  modulo?: string;
  faltas?: number;
  n1?: number;
  n2?: number;
  n3?: number;
  rec?: number;
  status?: string;
  [key: string]: any;
}

interface AcordoData {
  valorOriginal: number;
  multa: number;
  juros: number;
  desconto: number;
  valorFinal: number;
}

interface ModulosNotas {
  [modulo: string]: NotaData[];
}

interface RelatorioAlunoNota {
  nome: string
  faltas?: number
  n1?: number
  n2?: number
  n3?: number
  rec?: number
  media_parcial?: number
  media_final?: number
  status?: string
}

export const PDFService = {
  // =====================================================
  // HELPERS DE SEGURANÇA
  // =====================================================

  /**
   * Mascara CPF para exibição segura
   * Exibe apenas os 3 primeiros e 2 últimos dígitos: ***.444.777-**
   */
  _mascarCPF(cpf: string | undefined): string {
    if (!cpf) return 'N/A'
    // Remover pontuação
    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo.length !== 11) return 'N/A'
    return `***.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-**`
  },

  /**
   * Adiciona marca d'água "CÓPIA" ao documento
   */
  _adicionarMarcaCopia(doc: jsPDF, pageWidth: number, pageHeight: number) {
    doc.setTextColor(200, 200, 200)
    doc.setFontSize(60)
    doc.setFont('helvetica', 'bold')
    doc.text('CÓPIA', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45,
    })
    doc.setTextColor(0, 0, 0) // Reset
  },

  // =====================================================
  // HELPER: CABEÇALHO DINÂMICO (compartilhado por todos os docs)
  // =====================================================
  _renderHeader(
    doc: jsPDF,
    inst: any,
    pageWidth: number,
    marginLeft: number,
    title: string,
  ) {
    // Fundo colorido com a cor primária da instituição
    const cor = inst.cor_primaria || "#C41E3A";
    const r = parseInt(cor.slice(1, 3), 16);
    const g = parseInt(cor.slice(3, 5), 16);
    const b = parseInt(cor.slice(5, 7), 16);

    doc.setFillColor(r, g, b);
    doc.rect(0, 0, pageWidth, 38, "F");

    // Logo (se houver) com proporção preservada
    const logoWidth = this._renderLogo(doc, inst, marginLeft, 38);

    // Texto do cabeçalho
    const textX = inst.logo_url ? marginLeft + logoWidth + 5 : marginLeft;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text(inst.nome.toUpperCase(), textX, 14);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    if (inst.cnpj) doc.text(`CNPJ: ${inst.cnpj}`, textX, 20);
    if (inst.endereco) doc.text(inst.endereco, textX, 25);
    if (inst.telefone || inst.email) {
      const contato = [inst.telefone, inst.email].filter(Boolean).join(" | ");
      doc.text(contato, textX, 30);
    }

    // Título do documento
    doc.setTextColor(r, g, b);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(title, pageWidth / 2, 52, { align: "center" });

    return 60; // retorna o Y inicial após o cabeçalho
  },

  /**
   * Desenha a logo no cabeçalho preservando a proporção real da imagem.
   * Retorna a largura da logo desenhada (0 se não houver logo).
   */
  _renderLogo(doc: jsPDF, inst: any, marginLeft: number, headerHeight: number) {
    if (!inst?.logo_url || !inst.logo_url.startsWith("data:")) return 0;
    try {
      const logoTargetHeight = headerHeight * 0.55;
      const imgProps = doc.getImageProperties(inst.logo_url);
      const logoWidth = (imgProps.width / imgProps.height) * logoTargetHeight;
      const logoY = (headerHeight - logoTargetHeight) / 2;
      doc.addImage(inst.logo_url, "PNG", marginLeft, logoY, logoWidth, logoTargetHeight);
      return logoWidth;
    } catch {
      return 0;
    }
  },

  // =====================================================
  // BOLETIM ESCOLAR (Grade Report)
  // =====================================================
  async generateBoletimPDF(
    alunoData: AlunoData,
    notasData: NotaData[],
    turmaInfo: TurmaInfo,
    options?: { marcaCopia?: boolean },
  ) {
    const inst = await getHeader();
    const doc = new jsPDF("portrait", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 15;
    const marginRight = 15;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // --- Marca d'água CÓPIA (se habilitado) ---
    if (options?.marcaCopia) {
      this._adicionarMarcaCopia(doc, pageWidth, pageHeight)
    }

    // --- Header ---
    doc.setFillColor(196, 30, 58); // var(--primary)
    doc.rect(0, 0, pageWidth, 35, "F");

    // Logo (se houver) com proporção preservada
    const logoWidth = this._renderLogo(doc, inst, marginLeft, 35);

    const textX = inst.logo_url ? marginLeft + logoWidth + 5 : marginLeft;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("COLÉGIO SANTA MÔNICA", textX, 15);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Limoeiro/PE - CNPJ: 70.077.433/0001-20", textX, 21);
    doc.text("Rua Principal, 123 - Centro - CEP: 55700-000", textX, 26);
    doc.text("Tel/WhatsApp: 81 99592 3688 | secretaria@csm.edu.br", textX, 31);

    // --- Title ---
    doc.setTextColor(196, 30, 58);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("BOLETIM ESCOLAR", pageWidth / 2, 48, { align: "center" });

    // --- Student Info ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    const infoY = 58;
    doc.text(
      `Aluno(a): ${alunoData.nome_completo || "N/A"}`,
      marginLeft,
      infoY,
    );
    doc.text(
      `Curso: ${turmaInfo?.curso_nome || "Técnico em Enfermagem"}`,
      marginLeft,
      infoY + 6,
    );
    doc.text(
      `Turma: ${turmaInfo?.turma_nome || "N/A"} - ${turmaInfo?.periodo || ""}`,
      marginLeft,
      infoY + 12,
    );
    doc.text(
      `Data: ${new Date().toLocaleDateString("pt-BR")}`,
      marginLeft,
      infoY + 18,
    );

    // --- Grade Table ---
    const modulos = this._agruparNotasPorModulo(notasData);
    let currentY = infoY + 28;

    Object.keys(modulos).forEach((modulo) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      // Module header
      doc.setFillColor(196, 30, 58);
      doc.rect(marginLeft, currentY - 4, contentWidth, 8, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(modulo, marginLeft + 3, currentY + 1);
      doc.setTextColor(0, 0, 0);

      currentY += 10;

      // Table data
      const tableData = modulos[modulo].map((n) => {
        const mediaTeoria = this._calcularMediaTeoria(n);
        const mediaFinal = this._calcularMediaFinal(mediaTeoria, n.rec);
        const situacao = mediaFinal >= 7 ? "Aprovado" : "Reprovado";

        return [
          n.disciplina,
          n.faltas?.toString() || "0",
          (n.n1 || 0).toFixed(1),
          (n.n2 || 0).toFixed(1),
          (n.n3 || 0).toFixed(1),
          mediaTeoria.toFixed(1),
          (n.rec || 0).toFixed(1),
          mediaFinal.toFixed(1),
          situacao,
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [[
          "Disciplina",
          "Faltas",
          "N1",
          "N2",
          "N3",
          "Média",
          "Rec.",
          "Final",
          "Situação",
        ]],
        body: tableData,
        margin: { left: marginLeft, right: marginRight },
        styles: {
          fontSize: 7,
          cellPadding: 2,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [240, 244, 248],
          textColor: [196, 30, 58],
          fontStyle: "bold",
          fontSize: 7,
        },
        bodyStyles: {
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { halign: "center", cellWidth: 12 },
          2: { halign: "center", cellWidth: 12 },
          3: { halign: "center", cellWidth: 12 },
          4: { halign: "center", cellWidth: 12 },
          5: { halign: "center", cellWidth: 15 },
          6: { halign: "center", cellWidth: 12 },
          7: { halign: "center", cellWidth: 15 },
          8: { halign: "center", cellWidth: 20 },
        },
        didParseCell: function (data: any) {
          if (data.section === "body" && data.column.index === 8) {
            if (data.cell.raw === "Aprovado") {
              data.cell.styles.textColor = [38, 161, 105];
              data.cell.styles.fontStyle = "bold";
            } else if (data.cell.raw === "Reprovado") {
              data.cell.styles.textColor = [229, 62, 62];
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
      });

      currentY = (doc as any).lastAutoTable.finalY + 10;
    });

    // --- Footer ---
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Média mínima para aprovação: 7.0 | Fórmula: Média Teoria = (N1+N2+N3)/3",
      marginLeft,
      currentY,
    );
    doc.text(
      "Se houver Recuperação: Média Final = (Média Teoria + Rec)/2",
      marginLeft,
      currentY + 4,
    );

    // Signature
    const sigY = Math.max(currentY + 25, 260);
    doc.setDrawColor(0);
    doc.line(pageWidth / 2 - 40, sigY, pageWidth / 2 + 40, sigY);
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text("Diretor(a) / Secretário(a)", pageWidth / 2, sigY + 5, {
      align: "center",
    });
    doc.text("Colégio Santa Mônica - Limoeiro/PE", pageWidth / 2, sigY + 10, {
      align: "center",
    });

    return doc;
  },

  // =====================================================
  // DECLARAÇÃO DE MATRÍCULA (Enrollment Declaration)
  // =====================================================
  async generateDeclaracaoPDF(alunoData: AlunoData, turmaInfo: TurmaInfo, options?: { marcaCopia?: boolean }) {
    const inst = await getHeader();
    const doc = new jsPDF("portrait", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 25;
    const marginRight = 25;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // --- Marca d'água CÓPIA (se habilitado) ---
    if (options?.marcaCopia) {
      this._adicionarMarcaCopia(doc, pageWidth, pageHeight)
    }

    // --- Header ---
    doc.setFillColor(196, 30, 58);
    doc.rect(0, 0, pageWidth, 35, "F");

    // Logo (se houver) com proporção preservada
    const logoWidth = this._renderLogo(doc, inst, marginLeft, 35);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("COLÉGIO SANTA MÔNICA", pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Limoeiro/PE - CNPJ: 70.077.433/0001-20", pageWidth / 2, 21, {
      align: "center",
    });
    doc.text(
      "Rua Principal, 123 - Centro - CEP: 55700-000",
      pageWidth / 2,
      26,
      { align: "center" },
    );
    doc.text("Tel/WhatsApp: 81 99592 3688 | secretaria@csm.edu.br", pageWidth / 2, 31, {
      align: "center",
    });

    // --- Title ---
    doc.setTextColor(196, 30, 58);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("DECLARAÇÃO DE MATRÍCULA", pageWidth / 2, 55, { align: "center" });

    // --- Body Text ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    const nomeAluno = alunoData.nome_completo || "N/A";
    const cpfAluno = this._mascarCPF(alunoData.cpf); // CPF mascarado por segurança
    const cursoNome = turmaInfo?.curso_nome || "Técnico em Enfermagem";
    const turmaNome = turmaInfo?.turma_nome || "N/A";
    const periodo = turmaInfo?.periodo || "";
    const dataAtual = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const texto =
      `Declaramos, para os devidos fins, que o(a) aluno(a) ${nomeAluno}, CPF: ${cpfAluno}, encontra-se devidamente matri

culado(a) no curso ${cursoNome}, turma ${turmaNome} (${periodo}), nesta instituição de ensino.`;

    const splitText = doc.splitTextToSize(texto, contentWidth);
    doc.text(splitText, marginLeft, 75);

    doc.text(`Limoeiro/PE, ${dataAtual}.`, marginLeft, 110);

    // --- Signature ---
    const sigY = 150;
    doc.line(pageWidth / 2 - 50, sigY, pageWidth / 2 + 50, sigY);
    doc.setFontSize(10);
    doc.text("Secretário(a) Acadêmico(a)", pageWidth / 2, sigY + 5, {
      align: "center",
    });
    doc.text("Colégio Santa Mônica - Limoeiro/PE", pageWidth / 2, sigY + 10, {
      align: "center",
    });

    // --- Stamp Area ---
    doc.setDrawColor(150);
    doc.roundedRect(pageWidth / 2 - 25, sigY + 20, 50, 30, 3, 3, "S");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("LOCAL DO CARIMBO", pageWidth / 2, sigY + 37, { align: "center" });

    return doc;
  },

  // =====================================================
  // DECLARAÇÃO DE VÍNCULO (Employment Declaration)
  // Para Admin/Professor
  // =====================================================
  async generateDeclaracaoVinculoPDF(userData: AlunoData & { perfil?: string }, options?: { marcaCopia?: boolean }) {
    const inst = await getHeader();
    const doc = new jsPDF("portrait", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 25;
    const marginRight = 25;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // --- Marca d'água CÓPIA (se habilitado) ---
    if (options?.marcaCopia) {
      this._adicionarMarcaCopia(doc, pageWidth, pageHeight)
    }

    // --- Header ---
    doc.setFillColor(196, 30, 58);
    doc.rect(0, 0, pageWidth, 35, "F");

    // Logo (se houver) com proporção preservada
    const logoWidth = this._renderLogo(doc, inst, marginLeft, 35);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("COLÉGIO SANTA MÔNICA", pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Limoeiro/PE - CNPJ: 70.077.433/0001-20", pageWidth / 2, 21, {
      align: "center",
    });
    doc.text(
      "Rua Principal, 123 - Centro - CEP: 55700-000",
      pageWidth / 2,
      26,
      { align: "center" },
    );
    doc.text("Tel/WhatsApp: 81 99592 3688 | secretaria@csm.edu.br", pageWidth / 2, 31, {
      align: "center",
    });

    // --- Title ---
    doc.setTextColor(196, 30, 58);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("DECLARAÇÃO DE VÍNCULO", pageWidth / 2, 55, { align: "center" });

    // --- Body Text ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    const nome = userData.nome_completo || "N/A";
    const cpf = this._mascarCPF(userData.cpf); // CPF mascarado por segurança
    const perfil = userData.perfil;
    const funcao = perfil === "professor"
      ? "docente"
      : perfil === "secretaria"
      ? "funcionário(a) da secretaria acadêmica"
      : "funcionário(a) administrativo(a)";

    const dataAtual = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const texto =
      `Declaramos, para os devidos fins, que ${nome}, CPF: ${cpf}, exerce a função de ${funcao} junto ao Colégio Santa Mônica, instituição de ensino técnica localizada em Limoeiro/PE.`;

    const splitText = doc.splitTextToSize(texto, contentWidth);
    doc.text(splitText, marginLeft, 75);

    // Segundo parágrafo
    const texto2 =
      "Esta declaração é emitida a pedido do(a) interessado(a) para fins de comprovação de vínculo empregatício.";
    const splitText2 = doc.splitTextToSize(texto2, contentWidth);
    doc.text(splitText2, marginLeft, 100);

    doc.text(`Limoeiro/PE, ${dataAtual}.`, marginLeft, 130);

    // --- Signature ---
    const sigY = 160;
    doc.line(pageWidth / 2 - 50, sigY, pageWidth / 2 + 50, sigY);
    doc.setFontSize(10);
    doc.text("Diretor(a)", pageWidth / 2, sigY + 5, { align: "center" });
    doc.text("Colégio Santa Mônica - Limoeiro/PE", pageWidth / 2, sigY + 10, {
      align: "center",
    });

    // --- Stamp Area ---
    doc.setDrawColor(150);
    doc.roundedRect(pageWidth / 2 - 25, sigY + 20, 50, 30, 3, 3, "S");
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("LOCAL DO CARIMBO", pageWidth / 2, sigY + 37, { align: "center" });

    return doc;
  },

  // =====================================================
  // HISTÓRICO ACADÊMICO (Academic Transcript)
  // =====================================================
  async generateHistoricoPDF(
    alunoData: AlunoData,
    notasData: NotaData[],
    turmaInfo: TurmaInfo,
    options?: { marcaCopia?: boolean },
  ) {
    const inst = await getHeader();
    const doc = new jsPDF("portrait", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 15;
    const marginRight = 15;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // --- Marca d'água CÓPIA (se habilitado) ---
    if (options?.marcaCopia) {
      this._adicionarMarcaCopia(doc, pageWidth, pageHeight)
    }

    // --- Header ---
    doc.setFillColor(196, 30, 58);
    doc.rect(0, 0, pageWidth, 35, "F");

    // Logo (se houver) com proporção preservada
    const logoWidth = this._renderLogo(doc, inst, marginLeft, 35);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("COLÉGIO SANTA MÔNICA", pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Limoeiro/PE - CNPJ: 70.077.433/0001-20", pageWidth / 2, 21, {
      align: "center",
    });
    doc.text(
      "Rua Principal, 123 - Centro - CEP: 55700-000",
      pageWidth / 2,
      26,
      { align: "center" },
    );

    // --- Title ---
    doc.setTextColor(196, 30, 58);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("HISTÓRICO ACADÊMICO", pageWidth / 2, 48, { align: "center" });

    // --- Student Info ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    let currentY = 58;
    doc.text(`Nome: ${alunoData.nome_completo || "N/A"}`, marginLeft, currentY);
    doc.text(`CPF: ${this._mascarCPF(alunoData.cpf)}`, marginLeft + 100, currentY); // CPF mascarado
    currentY += 6;
    doc.text(
      `Curso: ${turmaInfo?.curso_nome || "Técnico em Enfermagem"}`,
      marginLeft,
      currentY,
    );
    doc.text(
      `Turma: ${turmaInfo?.turma_nome || "N/A"}`,
      marginLeft + 100,
      currentY,
    );
    currentY += 6;
    doc.text(`Período: ${turmaInfo?.periodo || "N/A"}`, marginLeft, currentY);
    doc.text(
      `Data de Emissão: ${new Date().toLocaleDateString("pt-BR")}`,
      marginLeft + 100,
      currentY,
    );

    currentY += 12;

    // --- Full Grade Table ---
    const modulos = this._agruparNotasPorModulo(notasData);
    const allNotas: any[][] = [];

    Object.keys(modulos).forEach((modulo) => {
      modulos[modulo].forEach((n) => {
        if (n.status === 'pendente') {
          allNotas.push([
            modulo,
            n.disciplina,
            "-", "-", "-", "-", "-", "-", "Falta cursar",
          ]);
          return;
        }

        const mediaTeoria = this._calcularMediaTeoria(n);
        const mediaFinal = this._calcularMediaFinal(mediaTeoria, n.rec);

        allNotas.push([
          modulo,
          n.disciplina,
          (n.n1 || 0).toFixed(1),
          (n.n2 || 0).toFixed(1),
          (n.n3 || 0).toFixed(1),
          (n.rec || 0).toFixed(1),
          mediaFinal.toFixed(1),
          n.faltas?.toString() || "0",
          mediaFinal >= 7 ? "APR" : "REP",
        ]);
      });
    });

    autoTable(doc, {
      startY: currentY,
      head: [[
        "Módulo",
        "Disciplina",
        "N1",
        "N2",
        "N3",
        "Rec",
        "Média",
        "Faltas",
        "Sit.",
      ]],
      body: allNotas,
      margin: { left: marginLeft, right: marginRight },
      styles: {
        fontSize: 6.5,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [196, 30, 58],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7,
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 50 },
        2: { halign: "center", cellWidth: 12 },
        3: { halign: "center", cellWidth: 12 },
        4: { halign: "center", cellWidth: 12 },
        5: { halign: "center", cellWidth: 12 },
        6: { halign: "center", cellWidth: 15 },
        7: { halign: "center", cellWidth: 12 },
        8: { halign: "center", cellWidth: 12 },
      },
      didParseCell: function (data: any) {
        if (data.section === "body" && data.column.index === 8) {
          if (data.cell.raw === "APR") {
            data.cell.styles.textColor = [38, 161, 105];
            data.cell.styles.fontStyle = "bold";
          } else if (data.cell.raw === "REP") {
            data.cell.styles.textColor = [229, 62, 62];
            data.cell.styles.fontStyle = "bold";
          } else if (data.cell.raw === "Falta cursar") {
            data.cell.styles.textColor = [180, 130, 0];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    // --- Footer ---
    currentY = (doc as any).lastAutoTable.finalY + 15;

    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("APR = Aprovado | REP = Reprovado | Falta cursar = Disciplina pendente", marginLeft, currentY);
    doc.text(
      "Este documento não tem validade sem assinatura e carimbo da instituição.",
      marginLeft,
      currentY + 4,
    );

    // Signature
    const sigY = Math.max(currentY + 25, 260);
    doc.setDrawColor(0);
    doc.line(pageWidth / 2 - 50, sigY, pageWidth / 2 + 50, sigY);
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Diretor(a) / Secretário(a)", pageWidth / 2, sigY + 5, {
      align: "center",
    });
    doc.text("Colégio Santa Mônica - Limoeiro/PE", pageWidth / 2, sigY + 10, {
      align: "center",
    });

    return doc;
  },

  // =====================================================
  // TERMO DE ACORDO FINANCEIRO (Financial Settlement)
  // =====================================================
  async generateTermoAcordoPDF(alunoData: AlunoData, acordoData: AcordoData, options?: { marcaCopia?: boolean }) {
    const inst = await getHeader();
    const doc = new jsPDF("portrait", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 20;
    const marginRight = 20;
    const contentWidth = pageWidth - marginLeft - marginRight;

    // --- Marca d'água CÓPIA (se habilitado) ---
    if (options?.marcaCopia) {
      this._adicionarMarcaCopia(doc, pageWidth, pageHeight)
    }

    // --- Header ---
    doc.setFillColor(196, 30, 58); // Vermelho Institucional
    doc.rect(0, 0, pageWidth, 40, "F");

    // Logo (se houver) com proporção preservada
    const logoWidth = this._renderLogo(doc, inst, marginLeft, 40);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("COLÉGIO SANTA MÔNICA", pageWidth / 2, 18, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("DEPARTAMENTO FINANCEIRO", pageWidth / 2, 26, { align: "center" });
    doc.text("Limoeiro/PE - Tel/WhatsApp: 81 99592 3688", pageWidth / 2, 32, {
      align: "center",
    });

    // --- Title ---
    doc.setTextColor(196, 30, 58);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("TERMO DE ACORDO E RENEGOCIAÇÃO DE DÍVIDA", pageWidth / 2, 55, {
      align: "center",
    });

    // --- Body ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    let currentY = 70;
    const dataAtual = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const infoTexto =
      `Pelo presente instrumento particular, de um lado COLÉGIO SANTA MÔNICA, e de outro o(a) Sr(a). ${alunoData.nome_completo}, CPF: ${
        this._mascarCPF(alunoData.cpf)
      }, responsável pelo(a) aluno(a) supracitado(a), celebram o presente acordo financeiro conforme as condições abaixo descritas:`;

    const splitInfo = doc.splitTextToSize(infoTexto, contentWidth);
    doc.text(splitInfo, marginLeft, currentY);
    currentY += (splitInfo.length * 6) + 10;

    // --- Debt Details Table ---
    doc.setFont("helvetica", "bold");
    doc.text("DESCRIÇÃO DO ACORDO:", marginLeft, currentY);
    currentY += 8;

    const tableData = [
      [
        "VALOR PRINCIPAL (Original)",
        `R$ ${acordoData.valorOriginal.toFixed(2)}`,
      ],
      ["MULTAS ACUMULADAS (+)", `R$ ${acordoData.multa.toFixed(2)}`],
      ["JUROS DE MORA (+)", `R$ ${acordoData.juros.toFixed(2)}`],
      ["DESCONTOS CONCEDIDOS (-)", `R$ ${acordoData.desconto.toFixed(2)}`],
      ["VALOR FINAL DO ACORDO (=)", `R$ ${acordoData.valorFinal.toFixed(2)}`],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [["Item", "Valor"]],
      body: tableData,
      margin: { left: marginLeft, right: marginRight },
      theme: "grid",
      headStyles: { fillColor: [196, 30, 58], textColor: 255 },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { halign: "right", fontStyle: "bold" },
      },
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // --- Terms ---
    doc.setFont("helvetica", "bold");
    doc.text("CLÁUSULAS:", marginLeft, currentY);
    currentY += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const clausulas = [
      "1. O devedor reconhece a dívida acima descrita e compromete-se a efetuar o pagamento do valor final na data acordada.",
      "2. O descumprimento deste acordo implicará na anulação dos descontos concedidos e no restabelecimento do valor original da dívida.",
      "3. Este termo serve como comprovante de negociação, não quitando as parcelas até a efetiva compensação bancária do pagamento.",
    ];

    clausulas.forEach((c) => {
      const splitC = doc.splitTextToSize(c, contentWidth);
      doc.text(splitC, marginLeft, currentY);
      currentY += (splitC.length * 5) + 2;
    });

    currentY += 15;
    doc.text(`Limoeiro/PE, ${dataAtual}.`, marginLeft, currentY);

    // --- Signatures ---
    currentY += 35;
    doc.line(marginLeft, currentY, marginLeft + 75, currentY);
    doc.line(
      pageWidth - marginRight - 75,
      currentY,
      pageWidth - marginRight,
      currentY,
    );

    doc.setFontSize(9);
    doc.text("Colégio Santa Mônica", marginLeft + 37.5, currentY + 5, {
      align: "center",
    });
    doc.text(
      "Responsável Financeiro",
      pageWidth - marginRight - 37.5,
      currentY + 5,
      { align: "center" },
    );

    // --- Footer ---
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "Documento gerado eletronicamente pelo SGE CSM - Módulo Financeiro",
      pageWidth / 2,
      285,
      { align: "center" },
    );

    return doc;
  },

  // =====================================================
  // DIÁRIO DE CLASSE
  // =====================================================

  async generateDiarioClassePDF(data: any, turmaInfo: any): Promise<jsPDF> {
    if (!data.disciplinas || data.disciplinas.length === 0) {
      throw new Error('Nenhuma disciplina para gerar o Diário de Classe.')
    }
    if (!data.turma_nome) {
      throw new Error('Nome da turma é obrigatório.')
    }

    const inst = await getHeader();

    const doc = new jsPDF('portrait', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const marginLeft = 20
    const marginRight = 20
    const contentWidth = pageWidth - marginLeft - marginRight

    // Header vermelho
    doc.setFillColor(196, 30, 58)
    doc.rect(0, 0, pageWidth, 35, 'F')

    // Logo (se houver) com proporção preservada
    const logoWidth = this._renderLogo(doc, inst, marginLeft, 35)

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('COLÉGIO SANTA MÔNICA', pageWidth / 2, 15, { align: 'center' })

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Limoeiro/PE - CNPJ: 70.077.433/0001-20', pageWidth / 2, 21, { align: 'center' })
    doc.text('Tel/WhatsApp: 81 99592 3688', pageWidth / 2, 26, { align: 'center' })

    let y = 45

    const addHeader = () => {
      doc.setTextColor(196, 30, 58)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('DIÁRIO DE CLASSE', pageWidth / 2, y, { align: 'center' })
      y += 8

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Turma: ${data.turma_nome}`, marginLeft, y)
      y += 6
      doc.text(`Período: ${data.periodo}`, marginLeft, y)
      y += 10

      doc.setDrawColor(0, 0, 0)
      doc.line(marginLeft, y, pageWidth - marginRight, y)
      y += 6
    }

    addHeader()

    data.disciplinas.forEach((disciplina: any, index: number) => {
      const spaceNeeded = 20 + disciplina.aulas.length * 8 + 20

      if (y + spaceNeeded > pageHeight - 30) {
        doc.addPage()
        y = 20
      }

      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.text(disciplina.disciplina_nome, marginLeft, y)
      y += 5

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.text(`Professor(a): ${disciplina.professor_nome}`, marginLeft, y)
      y += 4
      doc.text(`Carga Horária: ${disciplina.carga_horaria}h`, marginLeft, y)
      y += 6

      const tableData = disciplina.aulas.map((aula: any) => [
        aula.data || '',
        aula.conteudo || '',
      ])

      autoTable(doc, {
        head: [['Data', 'Conteúdo']],
        body: tableData,
        startY: y,
        margin: { left: marginLeft, right: marginRight },
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [196, 30, 58], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: contentWidth - 30 },
        },
      })

      y = (doc as any).lastAutoTable.finalY + 8

      doc.setFontSize(9)
      doc.setFont('helvetica', 'italic')
      doc.text(`Total de aulas: ${disciplina.total_aulas}`, marginLeft, y)
      y += 12
    })

    y = Math.max(y, pageHeight - 40)
    doc.setDrawColor(0, 0, 0)
    doc.line(marginLeft, y, pageWidth - marginRight, y)
    y += 10

    const today = new Date()
    const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Emitido em: ${dateStr}`, marginLeft, y)
    y += 20

    doc.text('_________________________________________', marginLeft, y)
    y += 5
    doc.setFont('helvetica', 'bold')
    doc.text('Secretaria Escolar', marginLeft, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.text('(Documento Oficial - Carimbo Obrigatório)', marginLeft, y)

    return doc
  },

  // =====================================================
  // ATA DE RESULTADOS FINAIS
  // =====================================================

  async generateAtaResultadosPDF(payload: AtaResultadosData): Promise<jsPDF> {
    if (!payload.turma_nome) throw new Error('Nome da turma é obrigatório.')
    if (!payload.alunos || payload.alunos.length === 0) {
      throw new Error('Nenhum aluno para gerar a Ata.')
    }

    const inst = await getHeader()
    const doc = new jsPDF('landscape', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const marginLeft = 10
    const marginRight = 10
    const contentWidth = pageWidth - marginLeft - marginRight

    const startY = this._renderHeader(doc, inst, pageWidth, marginLeft, 'ATA DE RESULTADOS FINAIS')

    // --- Identificação da turma ---
    const hoje = new Date()
    let y = startY + 6

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    doc.text(`Curso: ${payload.curso_nome || 'N/A'}`, marginLeft, y)
    doc.text(`Turma: ${payload.turma_nome} (${payload.periodo || ''})`, marginLeft, y + 5)
    doc.text(`Ano Letivo: ${payload.ano_letivo}`, marginLeft + 155, y)
    if (payload.polo) doc.text(`Polo/Local: ${payload.polo}`, marginLeft + 155, y + 5)

    y += 13

    // --- Texto cartorial de abertura (data por extenso) ---
    const abertura =
      `Aos ${this._numeroPorExtenso(hoje.getDate())} dias do mês de ${this._MESES_POR_EXTENSO[hoje.getMonth()]} de ${this._anoPorExtenso(hoje.getFullYear())}, ` +
      `o(a) Diretor(a) e o(a) Secretário(a) do ${inst.nome || 'Colégio Santa Mônica'} lavram a presente Ata de Resultados Finais do curso ${payload.curso_nome || ''}, ` +
      `turma ${payload.turma_nome} (${payload.periodo || ''}), referente ao ano letivo de ${payload.ano_letivo}.`;

    const linhasAbertura = doc.splitTextToSize(abertura, contentWidth)
    doc.text(linhasAbertura, marginLeft, y)
    y += linhasAbertura.length * 4.5 + 8

    // --- Tabela de resultados (layout empilhado por aluno x componente) ---
    const head = [['Nº', 'COMPONENTE CURRICULAR', 'C.H. T/P', 'E/S', 'NOTA', 'FALTAS', '% FREQ.', 'SITUAÇÃO']]
    const body: any[] = []

    payload.alunos.forEach((aluno, idx) => {
      body.push({
        colSpan: 8,
        styles: { fontStyle: 'bold', fontSize: 8, fillColor: [245, 245, 250], textColor: [60, 60, 60] },
        content:
          `${idx + 1}. ${aluno.nome_completo}  —  Situação Final: ${aluno.situacao_final}` +
          (typeof aluno.frequencia_geral === 'number' ? `  |  % Freq. Geral: ${aluno.frequencia_geral}%` : ''),
      })
      aluno.componentes.forEach((c) => {
        body.push([
          '',
          c.modulo ? `${c.nome}\n${c.modulo}` : c.nome,
          String(c.carga_horaria || 0),
          c.nota_estagio || '—',
          c.nota_final_texto,
          String(c.faltas || 0),
          `${c.percentual_frequencia}%`,
          c.status || '—',
        ])
      })
    })

    autoTable(doc, {
      startY: y,
      head,
      body,
      margin: { left: marginLeft, right: marginRight },
      showHead: 'everyPage',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [196, 30, 58],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { cellWidth: 112 },
        2: { halign: 'center', cellWidth: 28 },
        3: { halign: 'center', cellWidth: 25 },
        4: { halign: 'center', cellWidth: 28 },
        5: { halign: 'center', cellWidth: 20 },
        6: { halign: 'center', cellWidth: 22 },
        7: { halign: 'center', cellWidth: 30 },
      },
      didParseCell: function (data: any) {
        if (data.section === 'body' && data.column.index === 7 && !Array.isArray(data.cell.raw)) {
          const raw = String(data.cell.raw)
          if (raw === 'Aprovado') {
            data.cell.styles.textColor = [38, 161, 105]
            data.cell.styles.fontStyle = 'bold'
          } else if (raw === 'Reprovado') {
            data.cell.styles.textColor = [229, 62, 62]
            data.cell.styles.fontStyle = 'bold'
          } else if (raw === 'Cursando') {
            data.cell.styles.textColor = [180, 130, 0]
            data.cell.styles.fontStyle = 'bold'
          }
        }
      },
      didDrawPage: () => {
        const pageNumber = doc.getNumberOfPages()
        doc.setFontSize(7.5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(120, 120, 120)
        doc.text(`Ata de Resultados Finais - ${payload.turma_nome}`, marginLeft, pageHeight - 8)
        doc.text(`Página ${pageNumber}`, pageWidth - marginRight, pageHeight - 8, { align: 'right' })
        doc.setDrawColor(220, 220, 220)
        doc.line(marginLeft, pageHeight - 12, pageWidth - marginRight, pageHeight - 12)
      },
    })

    let finalY = (doc as any).lastAutoTable.finalY + 8
    if (finalY > pageHeight - 45) {
      doc.addPage()
      finalY = 20
    }

    // --- Legenda (siglas) ---
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(90, 90, 90)
    const legenda =
      'Legenda: C.H. T/P = carga horária teoria/prática | E/S = estágio supervisionado (AP = aprovado, REP = reprovado) | ' +
      'NOTA = nota final | % FREQ. = frequência derivada (100 - faltas x 100 / C.H.) | SITUAÇÃO = Aprovado, Reprovado ou Cursando.'
    const linhasLegenda = doc.splitTextToSize(legenda, contentWidth)
    doc.text(linhasLegenda, marginLeft, finalY)
    finalY += linhasLegenda.length * 3.5 + 6

    // --- Local e data ---
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text(
      `Limoeiro/PE, ${this._numeroPorExtenso(hoje.getDate())} de ${this._MESES_POR_EXTENSO[hoje.getMonth()]} de ${this._anoPorExtenso(hoje.getFullYear())}.`,
      marginLeft,
      finalY,
    )

    // --- Assinaturas ---
    finalY += 22
    const sigLeftX = pageWidth / 2 - 95
    const sigRightX = pageWidth / 2 + 95
    const sigWidth = 70
    doc.setDrawColor(0)
    doc.line(sigLeftX, finalY, sigLeftX + sigWidth, finalY)
    doc.line(sigRightX - sigWidth, finalY, sigRightX, finalY)
    doc.setFontSize(9)
    doc.text('Diretor(a)', sigLeftX + sigWidth / 2, finalY + 5, { align: 'center' })
    doc.text('Secretário(a)', sigRightX - sigWidth / 2, finalY + 5, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(120, 120, 120)
    const instrodape = inst.nome || 'Colégio Santa Mônica'
    doc.text(instrodape, sigLeftX + sigWidth / 2, finalY + 10, { align: 'center' })
    doc.text(instrodape, sigRightX - sigWidth / 2, finalY + 10, { align: 'center' })

    return doc
  },

  // =====================================================
  // RELATÓRIO DE NOTAS DA DISCIPLINA (Professor)
  // =====================================================

  async generateRelatorioNotasDisciplinaPDF(
    disciplinaNome: string,
    turmaInfo: TurmaInfo,
    alunos: RelatorioAlunoNota[],
  ): Promise<jsPDF> {
    if (!disciplinaNome) {
      throw new Error('Nome da disciplina é obrigatório.')
    }
    if (!alunos || alunos.length === 0) {
      throw new Error('Nenhum aluno para gerar o relatório de notas.')
    }

    const inst = await getHeader()
    const doc = new jsPDF('portrait', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const marginLeft = 15
    const marginRight = 15

    // Cabeçalho institucional
    doc.setFillColor(196, 30, 58)
    doc.rect(0, 0, pageWidth, 35, 'F')
    const logoWidth = this._renderLogo(doc, inst, marginLeft, 35)
    const textX = inst.logo_url ? marginLeft + logoWidth + 5 : marginLeft
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text((inst.nome || 'COLÉGIO SANTA MÔNICA').toUpperCase(), textX, 15)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    if (inst.cnpj) doc.text(`CNPJ: ${inst.cnpj}`, textX, 21)
    if (inst.endereco) doc.text(inst.endereco, textX, 26)
    const contato = [inst.telefone, inst.email].filter(Boolean).join(' | ')
    if (contato) doc.text(contato, textX, 31)

    // Título
    doc.setTextColor(196, 30, 58)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('RELATÓRIO DE NOTAS', pageWidth / 2, 48, { align: 'center' })

    // Identificação da disciplina
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    doc.text(`Disciplina: ${disciplinaNome}`, marginLeft, 58)
    doc.text(`Turma: ${turmaInfo?.turma_nome || 'N/A'} - ${turmaInfo?.periodo || ''}`, marginLeft, 64)
    doc.text(`Curso: ${turmaInfo?.curso_nome || 'N/A'}`, marginLeft, 70)
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, marginLeft, 76)

    // Tabela de notas
    autoTable(doc, {
      startY: 84,
      head: [['Aluno', 'Faltas', 'N1', 'N2', 'N3', 'Média', 'Rec.', 'Final', 'Situação']],
      body: alunos.map(a => [
        a.nome,
        String(a.faltas ?? 0),
        (a.n1 || 0).toFixed(1),
        (a.n2 || 0).toFixed(1),
        (a.n3 || 0).toFixed(1),
        (a.media_parcial || 0).toFixed(1),
        (a.rec || 0).toFixed(1),
        (a.media_final || 0).toFixed(1),
        a.status || '—',
      ]),
      margin: { left: marginLeft, right: marginRight },
      styles: { fontSize: 8, cellPadding: 2, lineColor: [200, 200, 200], lineWidth: 0.1 },
      headStyles: {
        fillColor: [196, 30, 58],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { halign: 'center', cellWidth: 12 },
        2: { halign: 'center', cellWidth: 12 },
        3: { halign: 'center', cellWidth: 12 },
        4: { halign: 'center', cellWidth: 12 },
        5: { halign: 'center', cellWidth: 16 },
        6: { halign: 'center', cellWidth: 12 },
        7: { halign: 'center', cellWidth: 16 },
        8: { halign: 'center', cellWidth: 22 },
      },
      didParseCell: function (data: any) {
        if (data.section === 'body' && data.column.index === 8) {
          if (data.cell.raw === 'Aprovado') {
            data.cell.styles.textColor = [38, 161, 105]
            data.cell.styles.fontStyle = 'bold'
          } else if (data.cell.raw === 'Reprovado') {
            data.cell.styles.textColor = [229, 62, 62]
            data.cell.styles.fontStyle = 'bold'
          }
        }
      },
    })

    const finalTableY = (doc as any).lastAutoTable.finalY + 8
    doc.setFontSize(8)
    doc.setTextColor(100, 100, 100)
    doc.text(
      'Média mínima para aprovação: 6.0 | Fórmula: Média Final = (N1+N2+N3)/3; com Rec: (Média + Rec)/2',
      marginLeft,
      finalTableY,
    )

    return doc
  },

  // =====================================================
  // HELPER METHODS
  // =====================================================

  _agruparNotasPorModulo(notasData: NotaData[]): ModulosNotas {
    const modulos: ModulosNotas = {};

    notasData.forEach((n) => {
      const modulo = n.modulo || "Sem Módulo";
      if (!modulos[modulo]) {
        modulos[modulo] = [];
      }
      modulos[modulo].push(n);
    });

    // Sort by module order
    const ordem = ["I Módulo", "II Módulo", "III Módulo"];
    const sortedModulos: ModulosNotas = {};
    ordem.forEach((m) => {
      if (modulos[m]) sortedModulos[m] = modulos[m];
    });
    Object.keys(modulos).forEach((m) => {
      if (!sortedModulos[m]) sortedModulos[m] = modulos[m];
    });

    return sortedModulos;
  },

  _calcularMediaTeoria(nota: NotaData): number {
    const n1 = parseFloat(String(nota.n1)) || 0;
    const n2 = parseFloat(String(nota.n2)) || 0;
    const n3 = parseFloat(String(nota.n3)) || 0;

    let sum = 0;
    let count = 0;
    if (n1 > 0) {
      sum += n1;
      count++;
    }
    if (n2 > 0) {
      sum += n2;
      count++;
    }
    if (n3 > 0) {
      sum += n3;
      count++;
    }

    return count > 0 ? sum / count : 0;
  },

  _calcularMediaFinal(mediaTeoria: number, rec: number | undefined): number {
    const recVal = parseFloat(String(rec)) || 0;
    if (recVal > 0) {
      return (mediaTeoria + recVal) / 2;
    }
    return mediaTeoria;
  },

  // =====================================================
  // ATA DE RESULTADOS FINAIS - HELPERS DE DATA POR EXTENSO
  // =====================================================

  _MESES_POR_EXTENSO: [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
  ],

  _UNIDADES: [
    '', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
    'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis',
    'dezessete', 'dezoito', 'dezenove',
  ],

  _DEZENAS: [
    '', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta',
    'setenta', 'oitenta', 'noventa',
  ],

  _numeroPorExtenso(n: number): string {
    const num = Math.max(0, Math.floor(n));
    if (num < 20) {
      return num === 0 ? 'zero' : this._UNIDADES[num];
    }
    if (num < 100) {
      const dezena = Math.floor(num / 10);
      const unidade = num % 10;
      return unidade > 0
        ? `${this._DEZENAS[dezena]} e ${this._UNIDADES[unidade]}`
        : this._DEZENAS[dezena];
    }
    if (num < 1100) {
      const centena = Math.floor(num / 100);
      const resto = num % 100;
      const prefixo = centena === 1 ? 'cento' : `${this._UNIDADES[centena]}centos`;
      return resto > 0 ? `${prefixo} e ${this._numeroPorExtenso(resto)}` : prefixo;
    }
    return String(num);
  },

  _anoPorExtenso(ano: number): string {
    const s = String(ano);
    if (s.length !== 4) return String(ano);
    const milhar = parseInt(s[0], 10);
    const resto = parseInt(s.slice(1), 10);
    if (resto === 0) {
      return `${this._UNIDADES[milhar]} mil`;
    }
    return `${this._UNIDADES[milhar]} mil e ${this._numeroPorExtenso(resto)}`;
  },

  // =====================================================
  // DOWNLOAD HELPER
  // =====================================================
  downloadPDF(doc: jsPDF, filename: string) {
    doc.save(filename);
  },
};
