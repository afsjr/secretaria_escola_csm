import { supabase } from "./supabase";

export interface ConcurrencyResult<T = any> {
  data: T | null;
  error: { message: string; code?: string } | null;
  conflict?: boolean;
}

export async function updateWithLock<T extends Record<string, any>>(
  table: string,
  id: string,
  data: Partial<T>,
  currentVersion: number
): Promise<ConcurrencyResult> {
  const nextVersion = currentVersion + 1;

  const { data: result, error } = await supabase
    .from(table as any)
    .update({ ...data, versao: nextVersion })
    .eq("id", id)
    .eq("versao", currentVersion)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return {
        data: null,
        error: {
          message: "Dados foram modificados por outro usuário. Recarregue a página e tente novamente.",
          code: "CONFLICT",
        },
        conflict: true,
      };
    }

    return {
      data: null,
      error: { message: error.message },
    };
  }

  return { data: result, error: null };
}

export async function fetchWithVersion(
  table: string,
  id: string
): Promise<{ data: any | null; versao: number | null; error: any }> {
  const { data, error } = await supabase
    .from(table as any)
    .select("versao")
    .eq("id", id)
    .single();

  if (error) {
    return { data: null, versao: null, error };
  }

  return { data, versao: data?.versao ?? 1, error: null };
}

export function isConcurrencyError(error: any): boolean {
  return error?.code === "CONFLICT" || error?.code === "PGRST116";
}

export function getConflictMessage(error: any): string {
  if (isConcurrencyError(error)) {
    return "Conflito de edição: os dados foram modificados por outro usuário. Por favor, recarregue a página e tente novamente.";
  }
  return error?.message || "Erro desconhecido.";
}