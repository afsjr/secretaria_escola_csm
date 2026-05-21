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

  async getProfessorCompleto(professorId: string): Promise<{ data: { perfil: PerfilCompleto; endereco: Endereco | null; disciplinas: any[]; disciplinasError: { message: string } | null } | null; error: { message: string } | null }> {
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

    const { data: ofertas, error: discError } = await supabase
      .from('turma_disciplinas')
      .select(`
        *,
        disciplinas_base(id, nome, modulo),
        turmas(id, nome, periodo, curso_id)
      `)
      .eq('professor_id', professorId)
      .order('created_at', { ascending: false })

    if (discError) {
      result.disciplinasError = { message: discError.message }
    } else if (ofertas?.length) {
      const turmaIds = [...new Set(ofertas.map(o => o.turma_id).filter(Boolean))]
      const { data: turmasCursos } = await supabase
        .from('turmas')
        .select('id, cursos(id, nome)')
        .in('id', turmaIds)

      const cursoMap: Record<string, any> = {}
      if (turmasCursos) {
        turmasCursos.forEach(tc => { cursoMap[tc.id] = tc.cursos })
      }

      result.disciplinas = ofertas.map(o => ({
        id: o.id,
        nome: o.disciplinas_base?.nome || '',
        modulo: o.disciplinas_base?.modulo || '',
        turma_id: o.turma_id,
        professor_id: o.professor_id,
        turmas: o.turmas || null,
        cursos: o.turmas?.id ? cursoMap[o.turmas.id] : null
      }))
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
