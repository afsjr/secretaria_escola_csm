import { supabase } from "../lib/supabase";
import { toast } from "../lib/toast";
import type { Session, UserProfile } from "../types";

// Session timeout: 30 minutos de inatividade
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
let sessionCheckInterval: ReturnType<typeof setInterval> | null = null;

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (!error && data?.session) {
    startSessionTimeout();
  }

  return { data, error };
}

export async function logout() {
  stopSessionTimeout();
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function resetPassword(email: string) {
  // URL dinâmica baseada no path atual do deploy (local ou produção)
  const basePath = window.location.pathname.replace(/\/$/, '')
  const redirectTo = `${window.location.origin}${basePath}/#/reset-password`

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  })
  return { data, error }
}

export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (session) {
    // Verificar se a sessão expirou
    const sessionAge = Date.now() -
      new Date(session.expires_at * 1000).getTime();
    if (sessionAge > SESSION_TIMEOUT_MS) {
      await logout();
      toast.error("Sessão expirada por inatividade. Faça login novamente.");
      return { session: null, error: { message: "Session expired" } };
    }
  }

  return { session, error };
}

/**
 * Inicia verificação periódica de timeout de sessão
 */
function startSessionTimeout(): void {
  stopSessionTimeout(); // Limpa intervalo anterior se existir

  sessionCheckInterval = setInterval(async () => {
    const { session } = await getSession();
    if (!session) {
      stopSessionTimeout();
      window.location.hash = "#/";
    }
  }, 60000); // Verifica a cada minuto
}

/**
 * Para a verificação de timeout
 */
function stopSessionTimeout(): void {
  if (sessionCheckInterval) {
    clearInterval(sessionCheckInterval);
    sessionCheckInterval = null;
  }
}

export async function getUserProfile(
  userId?: string,
): Promise<{ data: UserProfile | null; error: any }> {
  const targetId = userId || (await getSession()).session?.user?.id;
  if (!targetId) return { data: null, error: { message: "No user ID" } };

  const { data, error } = await supabase
    .from("perfis")
    .select("*")
    .eq("id", targetId)
    .single();
  return { data, error };
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>,
) {
  const { data, error } = await supabase
    .from("perfis")
    .update(updates)
    .eq("id", userId);
  return { data, error };
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from("perfis")
    .select("*")
    .order("nome_completo", { ascending: true });
  return { data, error };
}
