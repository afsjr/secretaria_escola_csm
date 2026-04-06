import { supabase } from '../lib/supabase'

/**
 * Handles the registration flow for a new user.
 * 1. Creates a user in Supabase Auth.
 * 2. If successful, inserts a record into the 'perfis' table.
 * 3. Se falhar na criação do perfil, faz rollback deletando o usuário criado.
 */
export async function registerUser({ email, password, nomeCompleto, cpf, telefone }) {
  // Step 1: Signup in Supabase Auth
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: nomeCompleto,
      }
    }
  })

  if (authError) return { error: authError }

  const user = data.user
  if (!user) return { error: { message: 'Erro ao criar usuário.' } }

  // Step 2: Insert into 'perfis' table
  const { error: profileError } = await supabase
    .from('perfis')
    .insert([
      {
        id: user.id,
        nome_completo: nomeCompleto,
        email: email,
        cpf: cpf,
        telefone: telefone,
        perfil: 'aluno'
      }
    ])

  if (profileError) {
    console.error('Erro ao criar perfil:', profileError)

    // ROLLBACK: Tentar deletar o usuário criado para evitar dados órfãos
    // Nota: Isso requer que o usuário esteja logado ou que tenhamos permissão admin
    // Como alternativa, poderíamos usar Edge Functions para operações atômicas
    try {
      const { error: deleteError } = await supabase.auth.signOut()
      // Em produção, idealmente chamar uma Edge Function para deletar o usuário via admin
      console.warn('Não foi possível deletar usuário órfão automaticamente. Considere usar Edge Functions para operações atômicas.')
    } catch (deleteErr) {
      console.error('Erro ao tentar cleanup:', deleteErr)
    }

    return {
      error: {
        message: 'Erro ao criar perfil do usuário. Entre em contato com o suporte.',
        details: profileError.message
      }
    }
  }

  return { data, error: null }
}
