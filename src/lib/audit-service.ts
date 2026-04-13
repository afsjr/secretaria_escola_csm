/**
 * Audit Log Service
 *
 * Registro imutável de ações sensíveis do sistema.
 * Todos os logs são gravados na tabela `audit_log`.
 *
 * Uso:
 *   await AuditService.log({
 *     acao: 'reset_senha',
 *     tabela_afetada: 'perfis',
 *     registro_id: userId,
 *     descricao: 'Senha resetada para professor João',
 *     dados_novos: { force_password_change: true }
 *   })
 */

import { supabase } from "./supabase";
import { getUserProfile } from "../auth/session";
import type { UserRole } from "../types";

interface LogParams {
  acao: string;
  tabela_afetada?: string;
  registro_id?: string;
  descricao?: string;
  dados_antigos?: Record<string, any> | null;
  dados_novos?: Record<string, any> | null;
}

interface GetLogsParams {
  limit?: number;
  offset?: number;
  acao?: string;
  tabela_afetada?: string;
  usuario_id?: string;
  data_inicio?: string;
  data_fim?: string;
}

interface WithAuditOptions {
  acao: string;
  tabela_afetada?: string;
  descricao: string | ((result: any, ...args: any[]) => string);
}

// Mapeamento de ações para severidade
const ACTION_SEVERITY: Record<string, string> = {
  // Alta severidade
  "reset_senha": "alta",
  "delete_usuario": "alta",
  "alterar_perfil_acesso": "alta",
  "lancar_nota": "media",
  "alterar_nota": "media",
  "delete_nota": "media",
  "criar_usuario": "media",
  "matricular_aluno": "media",
  "transferir_aluno": "media",
  // Baixa severidade
  "login_sucesso": "baixa",
  "solicitar_documento": "baixa",
  "atualizar_perfil": "baixa",
  "registrar_aula": "baixa",
};

export const AuditService = {
  /**
   * Registra uma ação no log de auditoria.
   * Se falhar, registra no console mas NÃO bloqueia o fluxo.
   */
  async log(
    {
      acao,
      tabela_afetada,
      registro_id,
      descricao,
      dados_antigos,
      dados_novos,
    }: LogParams,
  ) {
    try {
      // Buscar dados do usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn("[AuditService] Usuário não autenticado — log ignorado");
        return { error: null }; // Não falhar o fluxo principal
      }

      // Buscar perfil em cache (ou direto do banco)
      const perfilResult = await getUserProfile();
      const perfil = perfilResult.data;

      // Coletar user agent
      const userAgent = typeof navigator !== "undefined"
        ? navigator.userAgent
        : null;

      const { error } = await supabase
        .from("audit_log")
        .insert([{
          usuario_id: user.id,
          usuario_nome: perfil?.nome_completo || "Desconhecido",
          usuario_perfil: perfil?.perfil || "desconhecido",
          acao,
          tabela_afetada: tabela_afetada || null,
          registro_id: registro_id || null,
          descricao: descricao || acao,
          dados_antigos: dados_antigos || null,
          dados_novos: dados_novos || null,
          user_agent: userAgent,
        }]);

      if (error) {
        console.error(
          "[AuditService] Falha ao registrar log:",
          error.message,
          "| Ação:",
          acao,
        );
        // Não propagar erro — o log é complementar, não bloqueante
      }

      return { error: null };
    } catch (err: any) {
      console.error("[AuditService] Erro inesperado:", err.message);
      return { error: err };
    }
  },

  /**
   * Busca logs de auditoria com filtros e paginação.
   * Apenas admin e master_admin podem acessar.
   */
  async getLogs(
    {
      limit = 50,
      offset = 0,
      acao,
      tabela_afetada,
      usuario_id,
      data_inicio,
      data_fim,
    }: GetLogsParams = {},
  ) {
    let query: any = supabase
      .from("audit_log")
      .select("*", { count: "exact" });

    // Filtros
    if (acao) query = query.eq("acao", acao);
    if (tabela_afetada) query = query.eq("tabela_afetada", tabela_afetada);
    if (usuario_id) query = query.eq("usuario_id", usuario_id);
    if (data_inicio) query = query.gte("created_at", data_inicio);
    if (data_fim) query = query.lte("created_at", data_fim);

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    return { data, error, count };
  },

  /**
   * Busca todas as ações únicas registradas (para filtros de UI).
   */
  async getUniqueActions() {
    const { data, error } = await supabase
      .from("audit_log")
      .select("acao, descricao")
      .order("created_at", { ascending: false });

    if (error) return { data: [], error };

    // Extrair ações únicas
    const uniqueActions = [
      ...new Map(data.map((item: any) => [item.acao, item.descricao]))
        .entries(),
    ]
      .map(([acao, descricao]) => ({ acao, descricao }));

    return { data: uniqueActions, error: null };
  },

  /**
   * Busca logs de um usuário específico com seus dados de perfil.
   */
  async getLogsByUser(userId: string, limit = 50) {
    return this.getLogs({ usuario_id: userId, limit });
  },

  /**
   * Busca logs recentes (dashboard quick view).
   */
  async getRecentLogs(limit = 10) {
    return this.getLogs({ limit });
  },

  /**
   * Conta logs por severidade.
   */
  async getCountsBySeverity() {
    const { data, error } = await supabase
      .from("audit_log")
      .select("acao");

    if (error) return { data: {}, error };

    const counts: Record<string, number> = { alta: 0, media: 0, baixa: 0 };
    data.forEach((item: any) => {
      const severity = ACTION_SEVERITY[item.acao] || "baixa";
      counts[severity]++;
    });

    return { data: counts, error: null };
  },

  /**
   * Busca logs sensíveis (severidade alta).
   */
  async getHighSeverityLogs() {
    const { data, error } = await supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) return { data: [], error };

    const highSeverity = data.filter((item: any) =>
      ACTION_SEVERITY[item.acao] === "alta"
    );

    return { data: highSeverity, error: null };
  },
};

// Helper: wrapper para ações com log automático
export async function withAudit(
  fn: (...args: any[]) => Promise<any>,
  { acao, tabela_afetada, descricao }: WithAuditOptions,
) {
  return async function (...args: any[]) {
    const result = await fn(...args);
    if (!result.error) {
      await AuditService.log({
        acao,
        tabela_afetada,
        descricao: typeof descricao === "function"
          ? descricao(result, ...args)
          : descricao,
      });
    }
    return result;
  };
}
