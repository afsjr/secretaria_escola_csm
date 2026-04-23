import { supabase, supabaseAdmin } from './supabase'
import { AuditService } from './audit-service'
import { getUserProfile } from '../auth/session'
import type { UserRole } from '../types'

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

interface CreateUserParams {
  email: string
  password: string
  nomeCompleto: string
  cpf?: string
  telefone?: string
  perfil?: UserRole
}

const EDGE_FUNCTIONS_BASE_URL = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL.startsWith('http') ? import.meta.env.VITE_SUPABASE_URL : `https://${import.meta.env.VITE_SUPABASE_URL}.supabase.co`}/functions/v1`
  : null

/**
 * Faz chamada autenticada a uma Edge Function
 */
async function callEdgeFunction(functionName: string, payload: Record<string, unknown>) {
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
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
    const accessToken = session.access_token

    const response = await fetch(`${EDGE_FUNCTIONS_BASE_URL}/${functionName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'x-client-info': 'supabase-js-v2'
      },
      body: JSON.stringify(payload)
    })

    if (response.status === 404) {
      throw new Error('Função não encontrada no servidor (404).')
    }

    const result = await response.json()

    if (!response.ok) {
      return { error: result.error || { message: `Erro do Servidor: ${response.status}` } }
    }

    return { data: result.data, error: null }
  } catch (error: any) {
    console.warn(`⚠️ Edge Function ${functionName} inacessível:`, error.message)
    return { error: { message: `Erro de comunicação: ${error.message}.` } }
  }
}

export const AdminService = {

  /**
   * Cria usuário pelo admin via Edge Function
   *
   * REQUER Edge Function: supabase/functions/admin-create-user
   */
  async createUserByAdmin({ email, password, nomeCompleto, cpf, telefone, perfil = 'aluno' }: CreateUserParams) {
    // Tentar via Chave Admin Direta primeiro (Modo mais rápido e estável)
    if (supabaseAdmin) {
      try {
        // 1. Criar usuário no Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: nomeCompleto }
        })

        if (authError) return { error: authError }

        // 2. Criar perfil na tabela perfis
        const { error: profileError } = await supabaseAdmin
          .from('perfis')
          .insert([{
            id: authData.user.id,
            nome_completo: nomeCompleto,
            email,
            cpf: cpf || null,
            telefone: telefone || null,
            perfil
          }])

        if (profileError) {
          // Rollback: deletar usuário se perfil falhar
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
          return { error: profileError }
        }

        // Registrar no log de auditoria
        await AuditService.log({
          acao: 'criar_usuario',
          tabela_afetada: 'perfis',
          registro_id: authData.user.id,
          descricao: `Usuário criado: ${nomeCompleto} (${perfil})`,
          dados_novos: { email, nome_completo: nomeCompleto, perfil, cpf: cpf || null }
        })

        return { data: { userId: authData.user.id }, error: null }
      } catch (err: any) {
        return { error: { message: 'Erro interno no cadastro admin: ' + err.message } }
      }
    }

    // Fallback para Edge Function se não houver chave Admin no cliente
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
  async matricularAluno(alunoId: string, turmaId: string) {
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

    // Registrar no log de auditoria
    if (!error) {
      await AuditService.log({
        acao: 'matricular_aluno',
        tabela_afetada: 'matriculas',
        registro_id: data?.id,
        descricao: `Aluno matriculado na turma ${turmaId}`,
        dados_novos: { aluno_id: alunoId, turma_id: turmaId, status_aluno: 'ativo' }
      })
    }

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
  async getAlunoById(alunoId: string) {
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
  async getUserById(userId: string) {
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
  async updateAluno(alunoId: string, updates: Record<string, any>) {
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
  },

  /**
   * Reseta a senha de um usuário para o padrão csm1983#
   * E marca como troca obrigatória no próximo acesso
   */
  async resetUserPassword(userId: string, userName: string) {
    // Tentar via Edge Function
    if (EDGE_FUNCTIONS_BASE_URL) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          return { error: { message: 'Usuário não autenticado.' } }
        }

        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        const accessToken = session.access_token

        const response = await fetch(`${EDGE_FUNCTIONS_BASE_URL}/admin-reset-password`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'apikey': anonKey,
            'x-client-info': 'supabase-js-v2'
          },
          body: JSON.stringify({ targetUserId: userId })
        })

        const result = await response.json()

        if (!response.ok) {
          return { error: result.error || { message: `Erro do Servidor: ${response.status}` } }
        }

        // Registrar no log de auditoria
        await AuditService.log({
          acao: 'reset_senha',
          tabela_afetada: 'perfis',
          registro_id: userId,
          descricao: `Senha resetada para ${userName || 'usuário'}`,
          dados_novos: { force_password_change: true, action: 'password_reset_to_default' }
        })

        return { data: result.data, error: null }
      } catch (error: any) {
        return { error: { message: `Erro de comunicação: ${error.message}.` } }
      }
    }

    // Fallback (não deveria ser usado em produção)
    if (!supabaseAdmin) {
      return { error: { message: 'Edge Functions não configuradas.' } }
    }

    try {
      const { data: dadosAtuais } = await supabase
        .from('perfis')
        .select('perfil, nome_completo')
        .eq('id', userId)
        .maybeSingle()

      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: 'csm1983#',
        user_metadata: { force_password_change: true }
      })

      if (error) {
        return { error }
      }

      await AuditService.log({
        acao: 'reset_senha',
        tabela_afetada: 'perfis',
        registro_id: userId,
        descricao: `Senha resetada para ${userName || dadosAtuais?.nome_completo || 'usuário'} (perfil: ${dadosAtuais?.perfil || 'desconhecido'})`,
        dados_novos: { force_password_change: true, action: 'password_reset_to_default' }
      })

      return { data, error }
    } catch (err: any) {
      return { error: { message: 'Erro ao resetar senha: ' + err.message } }
    }
  }
}
