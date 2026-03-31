import { supabase } from '../lib/supabase'

/**
 * Handles the registration flow for a new user.
 * 1. Creates a user in Supabase Auth.
 * 2. If successful, inserts a record into the 'perfis' table.
 */
export async function registerUser({ email, password, nomeCompleto }) {
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
  // The 'perfil' defaults to 'aluno' in the database (or we set it here)
  const { error: profileError } = await supabase
    .from('perfis')
    .insert([
      {
        id: user.id,
        nome_completo: nomeCompleto,
        email: email,
        perfil: 'aluno'
      }
    ])

  if (profileError) {
    console.error('Erro ao criar perfil:', profileError)
    // You might want to delete the auth user here if profile creation fails,
    // but usually, it's better to log and alert.
    return { error: profileError }
  }

  return { data, error: null }
}
