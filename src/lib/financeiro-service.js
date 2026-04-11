import { supabase } from './supabase'

/**
 * Serviço para operações financeiras do sistema.
 */
export const FinanceiroService = {
  /**
   * Obtém resumo financeiro para o dashboard.
   */
  async getResumo() {
    // Em um cenário real, faríamos agregações no SQL.
    // Aqui vamos simular buscando os dados principais.
    const { data: pagamentos, error } = await supabase
      .from('pagamentos')
      .select('status, valor_original, valor_pago')

    if (error) return { data: null, error }

    const resumo = {
      totalInadimplente: 0,
      totalRecuperado: 0,
      totalPrevisto: 0,
      contagemAtrasados: 0
    }

    pagamentos.forEach(p => {
      resumo.totalPrevisto += Number(p.valor_original)
      if (p.status === 'atrasado') {
        resumo.totalInadimplente += Number(p.valor_original)
        resumo.contagemAtrasados++
      }
      if (p.status === 'pago') {
        resumo.totalRecuperado += Number(p.valor_pago || 0)
      }
    })

    return { data: resumo, error: null }
  },

  /**
   * Lista alunos com pendências financeiras.
   */
  async getInadimplentes() {
    const { data, error } = await supabase
      .from('perfis')
      .select(`
        id, 
        nome_completo, 
        cpf, 
        email, 
        bloqueio_financeiro,
        pagamentos!inner (
          id, valor_original, data_vencimento, status
        )
      `)
      .eq('pagamentos.status', 'atrasado')
      .order('nome_completo')

    return { data, error }
  },

  /**
   * Busca histórico financeiro de um aluno específico.
   */
  async getHistoricoAluno(alunoId) {
    return await supabase
      .from('pagamentos')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('data_vencimento', { ascending: false })
  },

  /**
   * Cria um novo acordo financeiro.
   */
  async criarAcordo(dados) {
    const { data: acordo, error: errorAcordo } = await supabase
      .from('financeiro_acordos')
      .insert({
        aluno_id: dados.alunoId,
        total_debito: dados.totalDebito,
        total_com_desconto: dados.totalComDesconto,
        numero_parcelas: dados.numeroParcelas,
        valor_parcela: dados.valorParcela,
        status: 'ativo'
      })
      .select()
      .single()

    if (errorAcordo) return { error: errorAcordo }

    // Atualiza status dos pagamentos originais para 'acordo'
    const { error: errorPag } = await supabase
        .from('pagamentos')
        .update({ status: 'acordo' })
        .eq('aluno_id', dados.alunoId)
        .eq('status', 'atrasado')

    return { data: acordo, error: errorPag }
  },

  /**
   * Obtém configurações financeiras.
   */
  async getConfig() {
    const { data, error } = await supabase
      .from('financeiro_config')
      .select('*')
    
    if (error) return { data: null, error }
    
    // Converte lista em objeto para facilidade de uso
    const config = {}
    data.forEach(c => {
      config[c.chave] = Number(c.valor)
    })
    return { data: config, error: null }
  }
}
