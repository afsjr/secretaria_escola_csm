import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Handle case where only project ID is provided
if (supabaseUrl && !supabaseUrl.startsWith("http")) {
  supabaseUrl = `https://${supabaseUrl}.supabase.co`;
}

const isProduction = window.location.hostname !== "localhost" &&
  !window.location.hostname.includes("127.0.0.1");

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "⚠️ SGE - Configuração ausente: As variáveis de ambiente do Supabase não estão configuradas.",
  );
  if (isProduction) {
    document.body.innerHTML = `
      <div style="padding: 2rem; font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h1 style="color: #c00;">⚠️ Sistema temporariamente indisponível</h1>
        <p>Entre em contato com o administrador para configurar as credenciais do banco de dados.</p>
        <p style="font-size: 0.9rem; color: #666;">Erro: Supabase credentials not configured</p>
      </div>
    `;
  }
}

// Client padrão (usuário) - operações com Row Level Security (RLS) ativado
export const supabase: SupabaseClient = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signInWithPassword: async () => ({
        data: null,
        error: new Error("Supabase not configured"),
      }),
      signOut: async () => ({ error: null }),
      signUp: async () => ({
        data: null,
        error: new Error("Supabase not configured"),
      }),
    } as any,
  } as SupabaseClient;

/**
 * NOTA DE SEGURANÇA CRÍTICA:
 *
 * O cliente admin (supabaseAdmin) com Service Role Key foi REMOVIDO do código cliente.
 *
 * MOTIVO: A Service Role Key concede acesso COMPLETO ao banco de dados,
 * ignorando todas as políticas de Row Level Security (RLS).
 * Como o código JavaScript é executado no navegador do usuário,
 * qualquer pessoa pode inspecionar o bundle e extrair essa chave.
 *
 * SOLUÇÃO: Operações administrativas devem ser movidas para Supabase Edge Functions.
 *
 * EXEMPLO DE EDGE FUNCTION (supabase/functions/admin-create-user/index.ts):
 *
 * ```typescript
 * import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
 * import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
 *
 * serve(async (req) => {
 *   const supabaseAdmin = createClient(
 *     Deno.env.get('SUPABASE_URL') ?? '',
 *     Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
 *   )
 *
 *   const { email, password, nomeCompleto, cpf, telefone, perfil } = await req.json()
 *
 *   // Criar usuário no Auth
 *   const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
 *     email,
 *     password,
 *     email_confirm: true,
 *     user_metadata: { full_name: nomeCompleto }
 *   })
 *
 *   if (userError) return new Response(JSON.stringify({ error: userError }), { status: 400 })
 *
 *   // Criar perfil
 *   const { error: profileError } = await supabaseAdmin
 *     .from('perfis')
 *     .insert([{
 *       id: userData.user.id,
 *       nome_completo: nomeCompleto,
 *       email,
 *       cpf: cpf || null,
 *       telefone: telefone || null,
 *       perfil: perfil || 'aluno'
 *     }])
 *
 *   if (profileError) {
 *     // Rollback: deletar usuário criado
 *     await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
 *     return new Response(JSON.stringify({ error: profileError }), { status: 400 })
 *   }
 *
 *   return new Response(JSON.stringify({ data: { userId: userData.user.id } }), { status: 200 })
 * })
 * ```
 *
 * PARA USAR NO FRONTEND:
 *
 * ```javascript
 * const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-create-user`, {
 *   method: 'POST',
 *   headers: {
 *     'Authorization': `Bearer ${session.access_token}`,
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({ email, password, nomeCompleto, cpf, telefone })
 * })
 * ```
 *
 * DOCUMENTAÇÃO:
 * - Edge Functions: https://supabase.com/docs/guides/functions
 * - Service Role Key: https://supabase.com/docs/guides/platform/service-role-keys
 */

// Nota: O cliente admin (supabaseAdmin) foi removido do frontend para evitar exposição da Service Role Key.
// Operações administrativas devem ser realizadas via Edge Functions.
export const supabaseAdmin = null;
