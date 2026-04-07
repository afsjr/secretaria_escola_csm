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

export const ProfessorDetailsService = {

  // ==================== DADOS PESSOAIS ====================

  async getProfessorCompleto(professorId) {
    const result = {}

    // Dados pessoais
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', professorId)
      .single()
    
    if (perfilError) return { error: perfilError }
    result.perfil = perfil

    // Endereço
    const { data: endereco } = await this.getEndereco(professorId)
    result.endereco = endereco

    // Disciplinas do professor
    const { data: disciplinas } = await supabase
      .from('disciplinas')
      .select(`
        *,
        turmas(id, nome, periodo),
        cursos(id, nome)
      `)
      .eq('professor_id', professorId)
      .order('nome', { ascending: true })
    
    result.disciplinas = disciplinas || []

    return { data: result, error: null }
  },

  async updateDadosPessoais(userId, dados) {
    const { data, error } = await supabase
      .from('perfis')
      .update(dados)
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  },

  // ==================== ENDEREÇO ====================

  async getEndereco(userId) {
    const { data, error } = await supabase
      .from('perfis_enderecos')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    return { data, error }
  },

  async saveEndereco(userId, endereco) {
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
