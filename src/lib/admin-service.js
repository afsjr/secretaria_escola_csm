import { supabaseAdmin, supabase } from './supabase'

export const AdminService = {
  
  async createUserByAdmin({ email, password, nomeCompleto, cpf, telefone, perfil = 'aluno' }) {
    if (!supabaseAdmin) {
      return { error: { message: 'Serviço admin não disponível. Configure a Service Role Key.' } }
    }

    // Step 1: Criar usuário no Supabase Auth (sem confirmação de e-mail)
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar automaticamente
      user_metadata: {
        full_name: nomeCompleto
      }
    })

    if (userError) {
      console.error('Erro ao criar usuário:', userError)
      return { error: userError }
    }

    const user = userData.user
    if (!user) {
      return { error: { message: 'Erro ao criar usuário.' } }
    }

    // Step 2: Criar registro na tabela perfis
    const { error: profileError } = await supabaseAdmin
      .from('perfis')
      .insert([
        {
          id: user.id,
          nome_completo: nomeCompleto,
          email: email,
          cpf: cpf || null,
          telefone: telefone || null,
          perfil: perfil
        }
      ])

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError)
      return { error: profileError }
    }

    return { data: { userId: user.id, email: user.email }, error: null }
  },

  async getTurmas() {
    // Usar cliente admin se disponível, senão usar cliente regular
    const client = supabaseAdmin || supabase
    
    if (!client) {
      return { data: [], error: { message: 'Cliente Supabase não disponível' } }
    }

    const { data, error } = await client
      .from('turmas')
      .select('*')
      .order('periodo', { ascending: false })
      .order('nome', { ascending: true })

    return { data, error }
  },

  async matricularAluno(alunoId, turmaId) {
    const client = supabaseAdmin || supabase
    
    if (!client) {
      return { error: { message: 'Cliente Supabase não disponível' } }
    }

    // Primeiro verificar se o aluno já está ativo em outra turma
    const { data: matriculasAtivas } = await client
      .from('matriculas')
      .select('id')
      .eq('aluno_id', alunoId)
      .eq('status_aluno', 'ativo')

    if (matriculasAtivas && matriculasAtivas.length > 0) {
      return { 
        error: { 
          message: 'Este aluno já está matriculado em outra turma. Altere o status antes de matricular novamente.' 
        } 
      }
    }

    // Criar matrícula
    const { data, error } = await client
      .from('matriculas')
      .insert([
        {
          aluno_id: alunoId,
          turma_id: turmaId,
          status_aluno: 'ativo'
        }
      ])
      .select()
      .single()

    return { data, error }
  },

  async listAlunos() {
    const client = supabaseAdmin || supabase
    
    if (!client) {
      return { data: [], error: { message: 'Cliente Supabase não disponível' } }
    }

    const { data, error } = await client
      .from('perfis')
      .select('*')
      .eq('perfil', 'aluno')
      .order('nome_completo', { ascending: true })

    return { data, error }
  },

  async getAlunoById(alunoId) {
    const client = supabaseAdmin || supabase
    
    if (!client) {
      return { data: null, error: { message: 'Cliente Supabase não disponível' } }
    }

    const { data, error } = await client
      .from('perfis')
      .select('*')
      .eq('id', alunoId)
      .eq('perfil', 'aluno')
      .single()

    return { data, error }
  },

  async updateAluno(alunoId, updates) {
    const client = supabaseAdmin || supabase
    
    if (!client) {
      return { data: null, error: { message: 'Cliente Supabase não disponível' } }
    }

    // Validar que não estamos mudando perfil
    delete updates.perfil
    delete updates.email
    delete updates.id

    const { data, error } = await client
      .from('perfis')
      .update(updates)
      .eq('id', alunoId)
      .eq('perfil', 'aluno')
      .select()
      .single()

    return { data, error }
  }
}