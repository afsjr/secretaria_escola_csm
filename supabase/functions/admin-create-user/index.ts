import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Criar cliente admin com Service Role Key (SEGURA, roda no servidor)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Ler dados do request
    const { email, password, nomeCompleto, cpf, telefone, perfil = "aluno" } = await req.json()

    // Validar dados básicos
    if (!email || !password || !nomeCompleto) {
      return new Response(
        JSON.stringify({ error: { message: "Dados incompletos. Preencha todos os campos obrigatórios." } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

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

    const user = userData.user

    // Step 2: Criar perfil na tabela perfis
    const { error: profileError } = await supabaseAdmin
      .from("perfis")
      .insert([{
        id: user.id,
        nome_completo: nomeCompleto,
        email: email,
        cpf: cpf || null,
        telefone: telefone || null,
        perfil: perfil
      }])

    if (profileError) {
      // ROLLBACK: Deletar usuário criado para evitar dados órfãos
      await supabaseAdmin.auth.admin.deleteUser(user.id)

      return new Response(
        JSON.stringify({ error: { message: profileError.message } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Sucesso!
    return new Response(
      JSON.stringify({ data: { userId: user.id, email: user.email } }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: { message: error.message || "Erro interno do servidor." } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
