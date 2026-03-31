import { supabase } from '../lib/supabase'

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  return { session, error }
}

export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export async function updateUserProfile(userId, updates) {
  const { data, error } = await supabase
    .from('perfis')
    .update(updates)
    .eq('id', userId)
  return { data, error }
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('perfis')
    .select('*')
    .order('nome_completo', { ascending: true })
  return { data, error }
}
