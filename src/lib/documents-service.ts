import { supabase } from './supabase'

/**
 * Service for Document Requests (Solicitações)
 */
export const DocumentsService = {

  // Student: Create a new request
  async createRequest(userId: string, type: string) {
    const { data, error } = await supabase
      .from('solicitacoes')
      .insert([
        { user_id: userId, tipo: type, status: 'pendente' }
      ])
    return { data, error }
  },

  // Student: Get their own requests
  async getMyRequests(userId: string) {
    const { data, error } = await supabase
      .from('solicitacoes')
      .select('*')
      .eq('user_id', userId)
      .order('criado_em', { ascending: false })
    return { data, error }
  },

  // Admin (Secretaria): Get ALL requests
  async getAllOpenRequests() {
    const { data, error } = await supabase
      .from('solicitacoes')
      .select(`
        *,
        perfis(nome_completo, email)
      `)
      .order('criado_em', { ascending: false })
    return { data, error }
  },

  // Admin (Secretaria): Update status (e.g., Concluído)
  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('solicitacoes')
      .update({ status })
      .eq('id', id)
    return { data, error }
  }
}
