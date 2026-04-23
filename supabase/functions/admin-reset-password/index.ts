import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: { message: "Não autorizado." } }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const token = authHeader.replace("Bearer ", "")
    
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
        JSON.stringify({ error: { message: "Acesso negado." } }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { targetUserId } = await req.json()

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: { message: "ID do usuário é obrigatório." } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
      password: "csm1983#",
      user_metadata: { force_password_change: true }
    })

    if (error) {
      return new Response(
        JSON.stringify({ error: { message: error.message } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({ data: { success: true, message: "Senha resetada com sucesso." } }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: { message: "Erro interno do servidor." } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})