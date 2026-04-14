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
import type { PerfilCompleto, Endereco, Disciplina, DbResult } from '../types'

export const ProfessorDetailsService = {

  // ==================== DADOS PESSOAIS ====================

  async getProfessorCompleto(professorId: string): Promise<{ data: { perfil: PerfilCompleto; endereco: Endereco | null; disciplinas: Disciplina[]; disciplinasError: { message: string } | null } | null; error: { message: string } | null }> {
    const result = {
      perfil: null as PerfilCompleto | null,
      endereco: null as Endereco | null,
      disciplinas: [] as Disciplina[],
      disciplinasError: null as { message: string } | null,
    }

    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', professorId)
      .single()

    if (perfilError) {
      return { data: null, error: perfilError }
    }
    result.perfil = perfil

    const { data: endereco } = await this.getEndereco(professorId)
    result.endereco = endereco

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
      result.disciplinasError = { message: discError.message }
    } else {
      result.disciplinas = disciplinas || []
    }

    return { data: result, error: null }
  },

  async updateDadosPessoais(userId: string, dados: Partial<PerfilCompleto>): Promise<DbResult<PerfilCompleto>> {
    const { data, error } = await supabase
      .from('perfis')
      .update(dados)
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  },

  // ==================== ENDEREÇO ====================

  async getEndereco(userId: string): Promise<DbResult<Endereco>> {
    const { data, error } = await supabase
      .from('perfis_enderecos')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    return { data, error }
  },

  async saveEndereco(userId: string, endereco: Partial<Endereco>): Promise<DbResult<Endereco>> {
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
