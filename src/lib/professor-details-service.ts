/**
 * Professor Details Service
 *
 * Gerencia dados expandidos do professor:
 * - Endereço (perfis_enderecos)
 * - Contatos
 * - Dados pessoais
 * - Disciplinas/Turmas
 */

import { supabase } from './supabase'

interface EnderecoData {
  [key: string]: any
}

export const ProfessorDetailsService = {

  // ==================== DADOS PESSOAIS ====================

  async getProfessorCompleto(professorId: string) {
    const result: Record<string, any> = {}

    // Dados pessoais — QUERY CRÍTICA (se falhar, não há ficha)
    console.log('[ProfessorDetailsService] Buscando perfil para:', professorId)
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', professorId)
      .single()

    if (perfilError) {
      console.error('[ProfessorDetailsService] ERRO ao buscar perfil:', perfilError)
      return { error: perfilError }
    }
    console.log('[ProfessorDetailsService] Perfil encontrado:', perfil?.nome_completo, '| perfil:', perfil?.perfil)
    result.perfil = perfil

    // Endereço — QUERY OPCIONAL (pode não existir)
    const { data: endereco } = await this.getEndereco(professorId)
    result.endereco = endereco

    // Disciplinas do professor — QUERY OPCIONAL (pode falhar por RLS sem bloquear ficha)
    console.log('[ProfessorDetailsService] Buscando disciplinas para professor:', professorId)
    try {
      const { data: disciplinas, error: discError } = await supabase
        .from('disciplinas')
        .select(`
          *,
          turmas(id, nome, periodo),
          cursos(id, nome)
        `)
        .eq('professor_id', professorId)
        .order('nome', { ascending: true })

      if (discError) {
        console.warn('[ProfessorDetailsService] Disciplinas indisponíveis:', discError.message)
      }
      result.disciplinas = disciplinas || []
      result.disciplinasError = discError // Sinaliza erro para a view
    } catch (err: any) {
      console.warn('[ProfessorDetailsService] Erro inesperado ao buscar disciplinas:', err.message)
      result.disciplinas = []
      result.disciplinasError = { message: err.message }
    }

    return { data: result, error: null }
  },

  async updateDadosPessoais(userId: string, dados: Record<string, any>) {
    const { data, error } = await supabase
      .from('perfis')
      .update(dados)
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  },

  // ==================== ENDEREÇO ====================

  async getEndereco(userId: string) {
    const { data, error } = await supabase
      .from('perfis_enderecos')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    return { data, error }
  },

  async saveEndereco(userId: string, endereco: EnderecoData) {
    const { data: existing } = await this.getEndereco(userId)

    if (existing) {
      const { data, error } = await supabase
        .from('perfis_enderecos')
        .update(endereco)
        .eq('user_id', userId)
        .select()
        .single()
      return { data, error }
    } else {
      const { data, error } = await supabase
        .from('perfis_enderecos')
        .insert([{ user_id: userId, ...endereco }])
        .select()
        .single()
      return { data, error }
    }
  }
}
