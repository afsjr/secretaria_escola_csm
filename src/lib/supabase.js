import { createClient } from '@supabase/supabase-js'

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || ''

// Handle case where only project ID is provided
if (supabaseUrl && !supabaseUrl.startsWith('http')) {
  supabaseUrl = `https://${supabaseUrl}.supabase.co`
}

const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ SGE - Configuração ausente: As variáveis de ambiente do Supabase não estão configuradas.')
  if (isProduction) {
    document.body.innerHTML = `
      <div style="padding: 2rem; font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h1 style="color: #c00;">⚠️ Sistema temporariamente indisponível</h1>
        <p>Entre em contato com o administrador para configurar as credenciais do banco de dados.</p>
        <p style="font-size: 0.9rem; color: #666;">Erro: Supabase credentials not configured</p>
      </div>
    `
  }
}

// Client padrão (usuário)
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : { auth: { getSession: async () => ({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: null } }) } }

// Client admin (Service Role) - para operações administrativas
export const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, { 
      auth: { 
        autoRefreshToken: false,
        persistSession: false
      } 
    })
  : null
