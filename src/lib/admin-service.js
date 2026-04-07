import { supabase } from './supabase'

/**
 * AdminService - Operações administrativas via Edge Functions
 * 
 * NOTA: O cliente admin (supabaseAdmin) foi removido por motivos de segurança.
 * Todas as operações admin agora devem ser feitas via Supabase Edge Functions.
 * 
 * Para configurar as Edge Functions:
 * 1. Instale Supabase CLI: `npm install -g supabase`
 * 2. Login: `supabase login`
 * 3. Link projeto: `supabase link --project-ref <seu-project-ref>`
 * 4. Crie a função: `supabase functions new admin-create-user`
 * 5. Deploy: `supabase functions deploy admin-create-user`
 */

const EDGE_FUNCTIONS_BASE_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL.startsWith('http') ? import.meta.env.VITE_SUPABASE_URL : `https://${import.meta.env.VITE_SUPABASE_URL}.supabase.co`}/functions/v1`
  : null

/**
 * Faz chamada autenticada a uma Edge Function
 */
async function callEdgeFunction(functionName, payload) {
  if (!EDGE_FUNCTIONS_BASE_URL) {
    return {
      error: {
        message: 'Edge Functions não configuradas. Configure VITE_SUPABASE_URL no ambiente.',
        details: 'Operações administrativas requerem Edge Functions. Veja admin-service.js para instruções.'
      }
    }
  }

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { error: { message: 'Usuário não autenticado.' } }
  }

  try {
    console.log('🔍 DEBUG - Chamando Edge Function:', {
      url: `${EDGE_FUNCTIONS_BASE_URL}/${functionName}`,
      hasSession: !!session,
      hasToken: !!session?.access_token,
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
    })

    const response = await fetch(`${EDGE_FUNCTIONS_BASE_URL}/${functionName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
      },
      body: JSON.stringify(payload)
    })

    console.log('🔍 DEBUG - Resposta:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })

    const result = await response.json()

    if (!response.ok) {
      return { error: result.error || { message: `Erro HTTP ${response.status}` } }
    }

    return { data: result.data, error: null }
  } catch (error) {
    console.error(`Erro ao chamar Edge Function ${functionName}:`, error)
    return { error: { message: `Erro de conexão ao chamar ${functionName}.` } }
  }
}

export const AdminService = {

  /**
   * Cria usuário pelo admin via Edge Function
   * 
   * REQUER Edge Function: supabase/functions/admin-create-user
   */
  async createUserByAdmin({ email, password, nomeCompleto, cpf, telefone, perfil = 'aluno' }) {
    // Tentar via Edge Function primeiro
    if (EDGE_FUNCTIONS_BASE_URL) {
      return await callEdgeFunction('admin-create-user', {
        email,
        password,
        nomeCompleto,
        cpf,
        telefone,
        perfil
      })
    }

    // Fallback: modo de desenvolvimento com aviso
    console.warn(
      '⚠️ AVISO: AdminService.createUserByAdmin() está em modo fallback.\n' +
      'Configure Edge Functions para operações administrativas seguras.\n' +
      'Veja: src/lib/admin-service.js para instruções.'
    )

    return {
      error: {
        message: 'Edge Functions não configuradas. Configure SUPABASE_URL e deploy da função admin-create-user.',
        setup: 'Execute: supabase functions deploy admin-create-user'
      }
    }
  },

  /**
   * Lista turmas (usa RLS normal)
   */
  async getTurmas() {
    const { data, error } = await supabase
      .from('turmas')
      .select('*')
      .order('periodo', { ascending: false })
      .order('nome', { ascending: true })

    return { data, error }
  },

  /**
   * Matricula aluno numa turma (usa RLS normal)
   */
  async matricularAluno(alunoId, turmaId) {
    // Verificar se aluno já está ativo em outra turma
    const { data: matriculasAtivas } = await supabase
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

    const { data, error } = await supabase
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

  /**
   * Lista alunos (usa RLS normal)
   */
  async listAlunos() {
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('perfil', 'aluno')
      .order('nome_completo', { ascending: true })

    return { data, error }
  },

  /**
   * Busca aluno por ID (usa RLS normal)
   */
  async getAlunoById(alunoId) {
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', alunoId)
      .eq('perfil', 'aluno')
      .single()

    return { data, error }
  },

  /**
   * Busca usuário por ID (usa RLS normal)
   */
  async getUserById(userId) {
    const { data, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    return { data, error }
  },

  /**
   * Atualiza dados do aluno (usa RLS normal)
   * Proteção contra escalada de perfil removida via RLS policies
   */
  async updateAluno(alunoId, updates) {
    // Remover campos sensíveis para prevenção de escalada de privilégios
    const safeUpdates = { ...updates }
    delete safeUpdates.perfil
    delete safeUpdates.email
    delete safeUpdates.id
    delete safeUpdates.bloqueio_financeiro // Deve ser controlado apenas via admin

    const { data, error } = await supabase
      .from('perfis')
      .update(safeUpdates)
      .eq('id', alunoId)
      .eq('perfil', 'aluno')
      .select()
      .single()

    return { data, error }
  }
}
