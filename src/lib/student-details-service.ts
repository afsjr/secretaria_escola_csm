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
import { updateWithLock } from './concurrency-control'
import type { Endereco, UserProfile, DbResult } from '../types'

interface Responsavel {
  id?: string
  aluno_id: string
  nome: string
  cpf?: string
  telefone?: string
  email?: string
  parentesco?: string
  financeiro?: boolean
  principal?: boolean
  created_at?: string
}

interface Observacao {
  id?: string
  aluno_id: string
  texto: string
  categoria: string
  criado_por?: string
  criado_em?: string
  criado_por_perfis?: Pick<UserProfile, 'nome_completo' | 'perfil'>
}

interface DadosAlunoCompleto {
  perfil: UserProfile & { versao?: number }
  endereco: Endereco | null
  responsaveis: Responsavel[]
  observacoes: Observacao[]
  matricula: Record<string, unknown> | null
}

export const StudentDetailsService = {

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
  },

  async deleteEndereco(userId: string): Promise<DbResult<unknown>> {
    const { data, error } = await supabase
      .from('perfis_enderecos')
      .delete()
      .eq('user_id', userId)
      .select()
    return { data, error }
  },

  // ==================== RESPONSÁVEIS ====================

  async getResponsaveis(alunoId: string): Promise<DbResult<Responsavel[]>> {
    const { data, error } = await supabase
      .from('responsaveis')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('principal', { ascending: false })
      .order('nome', { ascending: true })

    return { data, error }
  },

  async addResponsavel(alunoId: string, responsavel: Partial<Responsavel>): Promise<DbResult<Responsavel>> {
    const { data, error } = await supabase
      .from('responsaveis')
      .insert([{ aluno_id: alunoId, ...responsavel }])
      .select()
      .single()

    return { data, error }
  },

  async updateResponsavel(id: string, updates: Partial<Responsavel>): Promise<DbResult<Responsavel>> {
    const { data, error } = await supabase
      .from('responsaveis')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  async deleteResponsavel(id: string): Promise<DbResult<unknown>> {
    const { data, error } = await supabase
      .from('responsaveis')
      .delete()
      .eq('id', id)
      .select()

    return { data, error }
  },

  // ==================== OBSERVAÇÕES ====================

  async getObservacoes(alunoId: string): Promise<DbResult<Observacao[]>> {
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

  async addObservacao(alunoId: string, texto: string, categoria: string = 'geral'): Promise<DbResult<Observacao>> {
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

  async updateObservacao(id: string, updates: Partial<Observacao>): Promise<DbResult<Observacao>> {
    const { data, error } = await supabase
      .from('observacoes_aluno')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  async deleteObservacao(id: string): Promise<DbResult<unknown>> {
    const { data, error } = await supabase
      .from('observacoes_aluno')
      .delete()
      .eq('id', id)
      .select()

    return { data, error }
  },

  // ==================== DADOS COMPLETOS ====================

  async getAlunoCompleto(alunoId: string): Promise<{ data: DadosAlunoCompleto | null; error: { message: string } | null }> {
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', alunoId)
      .single()

    if (perfilError) return { data: null, error: perfilError }

    const { data: endereco } = await this.getEndereco(alunoId)
    const { data: responsaveis } = await this.getResponsaveis(alunoId)
    const { data: observacoes } = await this.getObservacoes(alunoId)

    const { data: matricula } = await supabase
      .from('matriculas')
      .select(`
        *,
        turmas(id, nome, periodo, cursos(id, nome))
      `)
      .eq('aluno_id', alunoId)
      .eq('status_aluno', 'ativo')
      .maybeSingle()

    return {
      data: {
        perfil,
        endereco,
        responsaveis: responsaveis || [],
        observacoes: observacoes || [],
        matricula
      },
      error: null
    }
  },

  async updateDadosPessoais(userId: string, dados: Partial<UserProfile>, versaoAtual: number = 1): Promise<DbResult<UserProfile>> {
    const resultado = await updateWithLock('perfis', userId, dados, versaoAtual)
    return { data: resultado.data, error: resultado.error }
  },

  async isMenorDeIdade(alunoId: string): Promise<boolean | null> {
    const { data } = await supabase
      .rpc('aluno_eh_menor', { aluno_id: alunoId })

    return data
  }
}
