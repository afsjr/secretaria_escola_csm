/**
 * ExcelService - Serviço para exportação de dados para Excel (.xlsx)
 * 
 * Utiliza a biblioteca SheetJS (xlsx) para gerar arquivos Excel
 * a partir de dados JSON.
 */
import * as XLSX from 'xlsx'

export interface ExportColumn {
  header: string
  key: string
}

export class ExcelService {
  /**
   * Exporta dados para arquivo Excel (.xlsx)
   * 
   * @param data - Array de objetos com os dados a serem exportados
   * @param filename - Nome do arquivo (sem extensão)
   * @param columns - Definição das colunas (header e key)
   * @param sheetName - Nome da aba (padrão: 'Dados')
   */
  static exportToExcel(
    data: Record<string, any>[],
    filename: string,
    columns: ExportColumn[],
    sheetName: string = 'Dados'
  ): void {
    try {
      // Preparar dados formatados
      const formattedData = data.map(item => {
        const row: Record<string, any> = {}
        columns.forEach(col => {
          row[col.header] = this.formatCellValue(item[col.key])
        })
        return row
      })

      // Criar workbook e worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(formattedData)

      // Configurar largura das colunas
      ws['!cols'] = columns.map(() => ({ wch: 20 }))

      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(wb, ws, sheetName)

      // Gerar e download do arquivo
      XLSX.writeFile(wb, `${filename}.xlsx`)
    } catch (error: any) {
      console.error('Erro ao exportar Excel:', error)
      throw new Error('Falha ao exportar dados para Excel: ' + error.message)
    }
  }

  /**
   * Exporta múltiplas abas em um único arquivo Excel
   * 
   * @param sheets - Array de configurações de abas
   * @param filename - Nome do arquivo (sem extensão)
   */
  static exportMultipleSheets(
    sheets: Array<{
      name: string
      data: Record<string, any>[]
      columns: ExportColumn[]
    }>,
    filename: string
  ): void {
    try {
      const wb = XLSX.utils.book_new()

      sheets.forEach(sheet => {
        const formattedData = sheet.data.map(item => {
          const row: Record<string, any> = {}
          sheet.columns.forEach(col => {
            row[col.header] = this.formatCellValue(item[col.key])
          })
          return row
        })

        const ws = XLSX.utils.json_to_sheet(formattedData)
        ws['!cols'] = sheet.columns.map(() => ({ wch: 20 }))
        XLSX.utils.book_append_sheet(wb, ws, sheet.name)
      })

      XLSX.writeFile(wb, `${filename}.xlsx`)
    } catch (error: any) {
      console.error('Erro ao exportar Excel multi-abas:', error)
      throw new Error('Falha ao exportar dados para Excel: ' + error.message)
    }
  }

  /**
   * Formata valores de células para melhor legibilidade
   */
  private static formatCellValue(value: any): any {
    if (value === null || value === undefined) {
      return '-'
    }

    if (value instanceof Date) {
      return value.toLocaleDateString('pt-BR')
    }

    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não'
    }

    // Converter para string se for objeto
    if (typeof value === 'object') {
      return JSON.stringify(value)
    }

    return value
  }

  /**
   * Exporta lista de alunos para Excel
   */
  static exportAlunos(alunos: any[]): void {
    const columns: ExportColumn[] = [
      { header: 'Nome Completo', key: 'nome_completo' },
      { header: 'E-mail', key: 'email' },
      { header: 'CPF', key: 'cpf' },
      { header: 'Telefone', key: 'telefone' },
      { header: 'Status', key: 'bloqueio_financeiro' },
      { header: 'Data Cadastro', key: 'created_at' }
    ]

    // Formatando status
    const formattedAlunos = alunos.map(aluno => ({
      ...aluno,
      bloqueio_financeiro: aluno.bloqueio_financeiro ? 'Bloqueado' : 'Ativo',
      created_at: aluno.created_at ? new Date(aluno.created_at).toLocaleDateString('pt-BR') : '-'
    }))

    this.exportToExcel(formattedAlunos, `alunos_${this.getDateStamp()}`, columns, 'Alunos')
  }

  /**
   * Exporta solicitações de documentos para Excel
   */
  static exportSolicitacoes(solicitacoes: any[]): void {
    const columns: ExportColumn[] = [
      { header: 'Aluno', key: 'aluno_nome' },
      { header: 'E-mail', key: 'aluno_email' },
      { header: 'Documento', key: 'tipo' },
      { header: 'Status', key: 'status' },
      { header: 'Data Solicitação', key: 'created_at' }
    ]

    const formattedSolicitacoes = solicitacoes.map(sol => ({
      ...sol,
      aluno_nome: sol.perfis?.nome_completo || 'N/A',
      aluno_email: sol.perfis?.email || '',
      created_at: sol.created_at ? new Date(sol.created_at).toLocaleDateString('pt-BR') : '-'
    }))

    this.exportToExcel(formattedSolicitacoes, `solicitacoes_${this.getDateStamp()}`, columns, 'Solicitações')
  }

  /**
   * Exporta professores para Excel
   */
  static exportProfessores(professores: any[]): void {
    const columns: ExportColumn[] = [
      { header: 'Nome Completo', key: 'nome_completo' },
      { header: 'E-mail', key: 'email' },
      { header: 'CPF', key: 'cpf' },
      { header: 'Telefone', key: 'telefone' },
      { header: 'Data Cadastro', key: 'created_at' }
    ]

    const formattedProfessores = professores.map(prof => ({
      ...prof,
      created_at: prof.created_at ? new Date(prof.created_at).toLocaleDateString('pt-BR') : '-'
    }))

    this.exportToExcel(formattedProfessores, `professores_${this.getDateStamp()}`, columns, 'Professores')
  }

  /**
   * Exporta turmas para Excel
   */
  static exportTurmas(turmas: any[]): void {
    const columns: ExportColumn[] = [
      { header: 'Turma', key: 'nome' },
      { header: 'Período', key: 'periodo' },
      { header: 'Curso', key: 'curso_nome' },
      { header: 'Status', key: 'ativa' }
    ]

    const formattedTurmas = turmas.map(turma => ({
      ...turma,
      ativa: turma.ativa ? 'Ativa' : 'Inativa'
    }))

    this.exportToExcel(formattedTurmas, `turmas_${this.getDateStamp()}`, columns, 'Turmas')
  }

  /**
   * Exporta dados financeiros para Excel
   */
  static exportFinanceiro(registros: any[]): void {
    const columns: ExportColumn[] = [
      { header: 'Aluno', key: 'aluno_nome' },
      { header: 'Valor', key: 'valor' },
      { header: 'Status', key: 'status' },
      { header: 'Vencimento', key: 'vencimento' },
      { header: 'Data Pagamento', key: 'data_pagamento' }
    ]

    const formattedRegistros = registros.map(reg => ({
      ...reg,
      valor: reg.valor ? `R$ ${reg.valor.toFixed(2)}` : '-',
      vencimento: reg.vencimento ? new Date(reg.vencimento).toLocaleDateString('pt-BR') : '-',
      data_pagamento: reg.data_pagamento ? new Date(reg.data_pagamento).toLocaleDateString('pt-BR') : '-'
    }))

    this.exportToExcel(formattedRegistros, `financeiro_${this.getDateStamp()}`, columns, 'Financeiro')
  }

  /**
   * Gera timestamp formatado para nome de arquivo
   */
  private static getDateStamp(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  }
}
