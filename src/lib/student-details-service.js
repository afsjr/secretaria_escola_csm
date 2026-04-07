/**
 * Student Details Service
 * 
 * Gerencia dados expandidos do aluno:
 * - Endereço (perfis_enderecos)
 * - Responsáveis (responsaveis)
 * - Observações (observacoes_aluno)
 * - Dados pessoais expandidos (perfis)
 */

import { supabase } from './supabase'

export const StudentDetailsService = {

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
      // Atualizar existente
      const { data, error } = await supabase
        .from('perfis_enderecos')
        .update(endereco)
        .eq('user_id', userId)
        .select()
        .single()
      return { data, error }
    } else {
      // Inserir novo
      const { data, error } = await supabase
        .from('perfis_enderecos')
        .insert([{ user_id: userId, ...endereco }])
        .select()
        .single()
      return { data, error }
    }
  },

  async deleteEndereco(userId) {
    const { data, error } = await supabase
      .from('perfis_enderecos')
      .delete()
      .eq('user_id', userId)
      .select()
    return { data, error }
  },

  // ==================== RESPONSÁVEIS ====================

  async getResponsaveis(alunoId) {
    const { data, error } = await supabase
      .from('responsaveis')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('principal', { ascending: false })
      .order('nome', { ascending: true })

    return { data, error }
  },

  async addResponsavel(alunoId, responsavel) {
    const { data, error } = await supabase
      .from('responsaveis')
      .insert([{ aluno_id: alunoId, ...responsavel }])
      .select()
      .single()

    return { data, error }
  },

  async updateResponsavel(id, updates) {
    const { data, error } = await supabase
      .from('responsaveis')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  async deleteResponsavel(id) {
    const { data, error } = await supabase
      .from('responsaveis')
      .delete()
      .eq('id', id)
      .select()

    return { data, error }
  },

  // ==================== OBSERVAÇÕES ====================

  async getObservacoes(alunoId) {
    const { data, error } = await supabase
      .from('observacoes_aluno')
      .select(`
        *,
        criado_por_perfis:criado_por(nome_completo, perfil)
      `)
      .eq('aluno_id', alunoId)
      .order('criado_em', { ascending: false })

    return { data, error }
  },

  async addObservacao(alunoId, texto, categoria = 'geral') {
    const { data: { session } } = await supabase.auth.getSession()
    
    const { data, error } = await supabase
      .from('observacoes_aluno')
      .insert([{ 
        aluno_id: alunoId, 
        texto, 
        categoria,
        criado_por: session?.user?.id || null
      }])
      .select()
      .single()

    return { data, error }
  },

  async updateObservacao(id, updates) {
    const { data, error } = await supabase
      .from('observacoes_aluno')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  async deleteObservacao(id) {
    const { data, error } = await supabase
      .from('observacoes_aluno')
      .delete()
      .eq('id', id)
      .select()

    return { data, error }
  },

  // ==================== DADOS COMPLETOS ====================

  /**
   * Busca TODOS os dados de um aluno em uma única chamada
   */
  async getAlunoCompleto(alunoId) {
    const result = {}

    // Dados pessoais
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', alunoId)
      .single()
    
    if (perfilError) return { error: perfilError }
    result.perfil = perfil

    // Endereço
    const { data: endereco } = await this.getEndereco(alunoId)
    result.endereco = endereco

    // Responsáveis
    const { data: responsaveis } = await this.getResponsaveis(alunoId)
    result.responsaveis = responsaveis || []

    // Observações
    const { data: observacoes } = await this.getObservacoes(alunoId)
    result.observacoes = observacoes || []

    // Matrícula ativa
    const { data: matricula } = await supabase
      .from('matriculas')
      .select(`
        *,
        turmas(id, nome, periodo, cursos(id, nome))
      `)
      .eq('aluno_id', alunoId)
      .eq('status_aluno', 'ativo')
      .maybeSingle()
    
    result.matricula = matricula

    return { data: result, error: null }
  },

  /**
   * Salva dados pessoais expandidos
   */
  async updateDadosPessoais(userId, dados) {
    const { data, error } = await supabase
      .from('perfis')
      .update(dados)
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  },

  /**
   * Verifica se aluno é menor de idade
   */
  async isMenorDeIdade(alunoId) {
    const { data } = await supabase
      .rpc('aluno_eh_menor', { aluno_id: alunoId })

    return data
  }
}
