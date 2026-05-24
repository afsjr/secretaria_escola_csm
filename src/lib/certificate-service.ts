import { supabase } from './supabase'
import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { AuditService } from './audit-service'
import type { Certificado, CertificadoModelo, ConteudoProgramatico } from '../types/domain'

interface ServiceResult<T> {
  data: T | null
  error: { message: string } | null
}

export const CertificateService = {
  generateHash(): string {
    const year = new Date().getFullYear()
    const random = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
    return `CERT-${year}-${random}`
  },

  async validateConclusao(alunoId: string, cursoId: string): Promise<ServiceResult<any>> {
    const { data: matricula, error } = await supabase
      .from('matriculas')
      .select('id, status_aluno')
      .eq('aluno_id', alunoId)
      .eq('turmas.curso_id', cursoId)
      .maybeSingle()

    if (error) return { data: null, error }
    if (!matricula || matricula.status_aluno !== 'concluido') {
      return { data: null, error: { message: 'Aluno não pode receber certificado: matrícula não está concluída.' } }
    }

    return { data: matricula, error: null }
  },

  async getConteudoProgramatico(cursoId: string): Promise<ServiceResult<ConteudoProgramatico[]>> {
    const { data, error } = await supabase
      .from('conteudo_programatico')
      .select('*')
      .eq('curso_id', cursoId)
      .order('ordem', { ascending: true })

    return { data, error }
  },

  async getTemplate(tipoCurso: 'tecnico' | 'formacao'): Promise<ServiceResult<CertificadoModelo>> {
    const { data, error } = await supabase
      .from('certificados_modelos')
      .select('*')
      .eq('tipo_curso', tipoCurso)
      .eq('ativo', true)
      .maybeSingle()

    return { data, error }
  },

  async getImagemUrl(path: string): Promise<string | null> {
    const { data } = await supabase.storage
      .from('certificados-imagens')
      .createSignedUrl(path, 3600)

    return data?.signedUrl || null
  },

  async gerarCertificado(
    alunoId: string,
    cursoId: string,
    cursoNome: string,
    alunoNome: string,
    alunoCpf: string,
    cargaHoraria: number,
    tipoCurso: 'tecnico' | 'formacao',
    emitidoPor: string,
  ): Promise<{ pdf: jsPDF | null; hash: string | null; error: { message: string } | null }> {
    const validacao = await this.validateConclusao(alunoId, cursoId)
    if (validacao.error) return { pdf: null, hash: null, error: validacao.error }

    const hash = this.generateHash()
    const template = await this.getTemplate(tipoCurso)
    const conteudo = tipoCurso === 'formacao' ? await this.getConteudoProgramatico(cursoId) : { data: [] }

    const doc = new jsPDF('portrait', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20

    const logoUrl = template.data?.logo_path ? await this.getImagemUrl(template.data.logo_path) : null
    const assinaturaUrl = template.data?.assinatura_path ? await this.getImagemUrl(template.data.assinatura_path) : null

    // Frente
    if (logoUrl) {
      try {
        doc.addImage(logoUrl, 'PNG', pageWidth / 2 - 25, margin, 50, 20)
      } catch { /* fallback: sem logo */ }
    }

    doc.setFontSize(10)
    doc.text('CENTRO DE SERVIÇOS MÚLTIPLOS - CSM', pageWidth / 2, 55, { align: 'center' })
    doc.setFontSize(22)
    doc.text('CERTIFICADO DE CONCLUSÃO', pageWidth / 2, 70, { align: 'center' })
    doc.setFontSize(12)
    doc.text(`Certificamos que ${alunoNome}, portador do CPF ${alunoCpf},`, pageWidth / 2, 90, { align: 'center' })
    doc.text(`concluiu o curso de ${cursoNome}, com carga horária total de ${cargaHoraria}h,`, pageWidth / 2, 98, { align: 'center' })
    doc.text(`em ${new Date().toLocaleDateString('pt-BR')}.`, pageWidth / 2, 106, { align: 'center' })

    doc.setFontSize(8)
    doc.text(`Código de autenticação: ${hash}`, pageWidth / 2, pageHeight - margin, { align: 'center' })

    // Verso (apenas para Formação)
    if (tipoCurso === 'formacao' && conteudo.data && conteudo.data.length > 0) {
      doc.addPage()
      doc.setFontSize(14)
      doc.text('CONTEÚDO PROGRAMÁTICO', pageWidth / 2, margin + 10, { align: 'center' })

      autoTable(doc, {
        startY: margin + 20,
        head: [['Disciplina', 'Carga Horária']],
        body: conteudo.data.map(c => [c.disciplina, `${c.carga_horaria}h`]),
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 98, 255] },
      })

      if (assinaturaUrl) {
        try {
          const finalY = (doc as any).lastAutoTable?.finalY || margin + 40
          doc.addImage(assinaturaUrl, 'PNG', pageWidth / 2 - 20, finalY + 20, 40, 15)
        } catch { /* fallback */ }
      }

      doc.setFontSize(9)
      doc.text('Diretor(a) Geral', pageWidth / 2, (doc as any).lastAutoTable?.finalY + 55 || 230, { align: 'center' })
    }

    // Salvar metadados
    const { error: insertError } = await supabase.from('certificados').insert({
      aluno_id: alunoId,
      curso_id: cursoId,
      data_conclusao: new Date().toISOString().split('T')[0],
      carga_horaria: cargaHoraria,
      codigo_autenticacao: hash,
      emitido_por: emitidoPor,
      template_id: template.data?.id || null,
    })

    if (insertError) return { pdf: null, hash: null, error: insertError }

    // Auditoria
    await AuditService.log({
      acao: 'gerar_certificado',
      tabela_afetada: 'certificados',
      registro_id: hash,
      descricao: `Certificado gerado para ${alunoNome} - ${cursoNome}`,
    })

    return { pdf: doc, hash, error: null }
  },
}
