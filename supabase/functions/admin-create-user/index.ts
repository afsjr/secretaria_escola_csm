import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// CORS restrito ao domínio do sistema
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://sistemacsm.vercel.app",
  "https://afsjr.github.io",
  "https://afsjr.github.io/secretaria_escola_csm"
]

const getCorsHeaders = (requestOrigin: string | null) => {
  let origin = allowedOrigins[0]
  if (requestOrigin) {
    if (allowedOrigins.includes(requestOrigin)) {
      origin = requestOrigin
    } else if (requestOrigin.includes('vercel.app')) {
      origin = requestOrigin
    }
  }
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Max-Age": "86400",
  }
}

serve(async (req) => {
  const requestOrigin = req.headers.get("Origin")
  const corsHeaders = getCorsHeaders(requestOrigin)

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Criar cliente admin com Service Role Key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // === VERIFICAÇÃO DE AUTORIZAÇÃO ===
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: { message: "Não autorizado." } }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const token = authHeader.replace("Bearer ", "")
    
    // Verificar token com Supabase
    const supabaseVerify = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    )
    const { data: { user }, error: authError } = await supabaseVerify.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: { message: "Token inválido." } }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Verificar se o usuário tem role admin ou secretaria
    const { data: userPerfil, error: perfilError } = await supabaseAdmin
      .from("perfis")
      .select("perfil")
      .eq("id", user.id)
      .single()

    if (perfilError || !userPerfil) {
      return new Response(
        JSON.stringify({ error: { message: "Perfil não encontrado." } }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (userPerfil.perfil !== "admin" && userPerfil.perfil !== "secretaria" && userPerfil.perfil !== "coordenacao") {
      return new Response(
        JSON.stringify({ error: { message: "Acesso negado. Apenas admin/secretaria/coordenacao." } }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // === FIM DA VERIFICAÇÃO ===

    // Ler dados do request
    const { email, password, nomeCompleto, cpf, telefone, perfil } = await req.json()

    // Validar dados básicos
    if (!email || !password || !nomeCompleto) {
      return new Response(
        JSON.stringify({ error: { message: "Dados incompletos. Preencha todos os campos obrigatórios." } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Usar perfil enviado pelo cliente (admin confia na sua própria requisição)
    // Validar que perfil é um dos valores permitidos
    const allowedPerfis = ['aluno', 'professor', 'admin', 'secretaria', 'coordenacao']
    const forcedPerfil = (perfil && allowedPerfis.includes(perfil)) ? perfil : 'aluno'

    // Step 1: Criar usuário no Supabase Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: nomeCompleto }
    })

    if (userError) {
      return new Response(
        JSON.stringify({ error: { message: userError.message } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const newUser = userData.user

    // Step 2: Criar perfil na tabela perfis
    const { error: profileError } = await supabaseAdmin
      .from("perfis")
      .insert([{
        id: newUser.id,
        nome_completo: nomeCompleto,
        email: email,
        cpf: cpf || null,
        telefone: telefone || null,
        perfil: forcedPerfil
      }])

    if (profileError) {
      // ROLLBACK: Deletar usuário criado para evitar dados órfãos
      await supabaseAdmin.auth.admin.deleteUser(newUser.id)

      return new Response(
        JSON.stringify({ error: { message: profileError.message } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Sucesso!
    return new Response(
      JSON.stringify({ data: { userId: newUser.id, email: newUser.email } }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: { message: "Erro interno do servidor." } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})