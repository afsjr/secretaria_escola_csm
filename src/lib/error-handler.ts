/**
 * Tratamento Centralizado de Erros
 *
 * Fornece utilitários para capturar, logar e exibir erros de forma consistente.
 */

import { toast } from "./toast";
import type { AsyncOptions } from "../types";

/**
 * Tipos de erro conhecidos do Supabase com mensagens amigáveis
 */
const FRIENDLY_ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "Por favor, confirme seu e-mail antes de fazer login.",
  "User already registered": "Este e-mail já está cadastrado.",
  "Weak password": "A senha é muito fraca. Use pelo menos 6 caracteres.",
  "Signup not allowed": "Cadastro não está disponível no momento.",

  // Database errors
  "duplicate key value violates unique constraint":
    "Já existe um registro com estas informações.",
  "violates row-level security":
    "Você não tem permissão para realizar esta operação.",
  "could not find the 'eq' filter": "Filtro de busca inválido.",
  "relation does not exist": "Tabela não encontrada no banco de dados.",

  // Network errors
  "Failed to fetch": "Erro de conexão. Verifique sua internet.",
  "Network Error": "Erro de rede. Tente novamente mais tarde.",
  "timeout": "Tempo de espera esgotado. Tente novamente.",
};

/**
 * Traduz mensagens de erro técnicas para mensagens amigáveis
 * @param technicalMessage - Mensagem de erro técnica
 * @returns Mensagem amigável para o usuário
 */
export function getFriendlyErrorMessage(
  technicalMessage: string | undefined,
): string {
  if (!technicalMessage) return "Ocorreu um erro inesperado.";

  // Verificar se há correspondência exata
  if (FRIENDLY_ERROR_MESSAGES[technicalMessage]) {
    return FRIENDLY_ERROR_MESSAGES[technicalMessage];
  }

  // Verificar se contém parte da mensagem
  for (const [key, friendly] of Object.entries(FRIENDLY_ERROR_MESSAGES)) {
    if (technicalMessage.toLowerCase().includes(key.toLowerCase())) {
      return friendly;
    }
  }

  // Fallback: retornar mensagem genérica
  return "Ocorreu um erro. Tente novamente mais tarde.";
}

/**
 * Handler de erro genérico para async/await
 * @param promise - Promise a ser executada
 * @param options - Opções
 * @returns Tuple com erro e resultado
 */
export async function handleAsync<T>(
  promise: Promise<T>,
  options: AsyncOptions = {},
): Promise<[Error | null, T | null]> {
  const {
    showToast = true,
    logToConsole = true,
    customMessage = null,
  } = options;

  try {
    const result = await promise;
    return [null, result];
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const friendlyMessage = customMessage ||
      getFriendlyErrorMessage(err.message);

    if (logToConsole) {
      console.error("Erro capturado:", {
        original: err.message,
        friendly: friendlyMessage,
        stack: err.stack,
      });
    }

    if (showToast) {
      toast.error(friendlyMessage);
    }

    return [err, null];
  }
}

/**
 * Wrapper para handlers de eventos com tratamento de erro
 * @param fn - Função a ser executada
 * @param options - Opções
 * @returns Função wrapper
 */
export function withErrorHandling<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: AsyncOptions = {},
): (...args: TArgs) => Promise<TReturn | null> {
  return async function (...args: TArgs) {
    const [error, result] = await handleAsync(fn(...args), options);

    if (error) {
      if (options.onError) {
        options.onError(error, args);
      }
      return null;
    }

    return result;
  };
}

/**
 * Logger de erro para produção (pode ser integrado com Sentry, etc)
 * @param error - Objeto de erro
 * @param context - Contexto adicional
 */
export function logError(
  error: Error,
  context: Record<string, unknown> = {},
): void {
  // Em produção, enviar para serviço de monitoramento
  if (import.meta.env.PROD) {
    // TODO: Integrar com Sentry ou similar
    console.error("Erro em produção:", {
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  } else {
    console.error("Erro:", error, "Contexto:", context);
  }
}

/**
 * Validar resposta do Supabase
 * @param response - Resposta do Supabase { data, error }
 * @param successMessage - Mensagem de sucesso (opcional)
 * @returns True se sucesso, false caso contrário
 */
export function handleSupabaseResponse<T>(
  response: {
    data: T | null;
    error: { message: string; code?: string; details?: string } | null;
  },
  successMessage: string | null = null,
): boolean {
  const { data, error } = response;

  if (error) {
    const friendlyMessage = getFriendlyErrorMessage(error.message);
    toast.error(friendlyMessage);
    logError(new Error(error.message), { response, data });
    return false;
  }

  if (successMessage) {
    toast.success(successMessage);
  }

  return true;
}

/**
 * Error boundary global para capturar erros de renderização
 */
window.addEventListener("error", (event: ErrorEvent) => {
  console.error("Erro global capturado:", event.error);
  logError(event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener(
  "unhandledrejection",
  (event: PromiseRejectionEvent) => {
    console.error("Promise rejection não tratada:", event.reason);
    logError(
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason)),
    );
  },
);
