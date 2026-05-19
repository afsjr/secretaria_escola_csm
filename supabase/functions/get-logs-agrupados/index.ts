import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ACTION_SEVERITY: Record<string, string> = {
  "reset_senha": "alta",
  "delete_usuario": "alta",
  "alterar_perfil_acesso": "alta",
  "lancar_nota": "media",
  "alterar_nota": "media",
  "delete_nota": "media",
  "criar_usuario": "media",
  "matricular_aluno": "media",
  "transferir_aluno": "media",
  "login_sucesso": "baixa",
  "solicitar_documento": "baixa",
  "atualizar_perfil": "baixa",
  "registrar_aula": "baixa",
};

function getInterval(periodo: string): { start: Date; groupBy: string } {
  const now = new Date();
  const start = new Date(now);

  switch (periodo) {
    case "12meses":
      start.setMonth(start.getMonth() - 12);
      return { start, groupBy: "month" };
    case "6meses":
      start.setMonth(start.getMonth() - 6);
      return { start, groupBy: "month" };
    case "3meses":
      start.setDate(start.getDate() - 90);
      return { start, groupBy: "week" };
    case "30dias":
      start.setDate(start.getDate() - 30);
      return { start, groupBy: "day" };
    case "semana":
      start.setDate(start.getDate() - 7);
      return { start, groupBy: "day" };
    default:
      start.setMonth(start.getMonth() - 6);
      return { start, groupBy: "month" };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const periodo = url.searchParams.get("periodo") || "6meses";

    const { start, groupBy } = getInterval(periodo);

    // Get total count
    const { count } = await supabase
      .from("audit_log")
      .select("*", { count: "exact", head: true })
      .gte("created_at", start.toISOString());

    // Get counts by severity
    const { data: allLogs } = await supabase
      .from("audit_log")
      .select("acao")
      .gte("created_at", start.toISOString());

    const porSeveridade = { alta: 0, media: 0, baixa: 0 };
    const porAcao: Record<string, number> = {};

    allLogs?.forEach((log: any) => {
      const severity = ACTION_SEVERITY[log.acao] || "baixa";
      porSeveridade[severity as keyof typeof porSeveridade]++;

      porAcao[log.acao] = (porAcao[log.acao] || 0) + 1;
    });

    // Get trend data
    const { data: trendLogs } = await supabase
      .from("audit_log")
      .select("acao, created_at")
      .gte("created_at", start.toISOString())
      .order("created_at", { ascending: true });

    const tendencia: Record<string, Record<string, number>> = {};

    trendLogs?.forEach((log: any) => {
      let key: string;
      const date = new Date(log.created_at);

      if (groupBy === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else if (groupBy === "week") {
        const week = Math.ceil(date.getDate() / 7);
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-W${week}`;
      } else {
        key = date.toISOString().split("T")[0];
      }

      if (!tendencia[key]) {
        tendencia[key] = { alta: 0, media: 0, baixa: 0 };
      }

      const severity = ACTION_SEVERITY[log.acao] || "baixa";
      tendencia[key][severity as keyof typeof tendencia[key]]++;
    });

    const tendenciaArray = Object.entries(tendencia).map(([mes, dados]) => ({
      periodo: mes,
      ...dados,
    }));

    const porAcaoArray = Object.entries(porAcao)
      .map(([acao, count]) => ({ acao, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return new Response(
      JSON.stringify({
        periodo,
        total: count || 0,
        por_severidade: porSeveridade,
        por_acao: porAcaoArray,
        tendencia: tendenciaArray,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});