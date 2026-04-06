/**
 * Tratamento Centralizado de Erros
 * 
 * Fornece utilitários para capturar, logar e exibir erros de forma consistente.
 */

import { toast } from './toast'

/**
 * Tipos de erro conhecidos do Supabase com mensagens amigáveis
 */
const FRIENDLY_ERROR_MESSAGES = {
  // Auth errors
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'Email not confirmed': 'Por favor, confirme seu e-mail antes de fazer login.',
  'User already registered': 'Este e-mail já está cadastrado.',
  'Weak password': 'A senha é muito fraca. Use pelo menos 6 caracteres.',
  'Signup not allowed': 'Cadastro não está disponível no momento.',
  
  // Database errors
  'duplicate key value violates unique constraint': 'Já existe um registro com estas informações.',
  'violates row-level security': 'Você não tem permissão para realizar esta operação.',
  'could not find the \'eq\' filter': 'Filtro de busca inválido.',
  'relation does not exist': 'Tabela não encontrada no banco de dados.',
  
  // Network errors
  'Failed to fetch': 'Erro de conexão. Verifique sua internet.',
  'Network Error': 'Erro de rede. Tente novamente mais tarde.',
  'timeout': 'Tempo de espera esgotado. Tente novamente.'
}

/**
 * Traduz mensagens de erro técnicas para mensagens amigáveis
 * @param {string} technicalMessage - Mensagem de erro técnica
 * @returns {string} Mensagem amigável para o usuário
 */
export function getFriendlyErrorMessage(technicalMessage) {
  if (!technicalMessage) return 'Ocorreu um erro inesperado.'
  
  // Verificar se há correspondência exata
  if (FRIENDLY_ERROR_MESSAGES[technicalMessage]) {
    return FRIENDLY_ERROR_MESSAGES[technicalMessage]
  }
  
  // Verificar se contém parte da mensagem
  for (const [key, friendly] of Object.entries(FRIENDLY_ERROR_MESSAGES)) {
    if (technicalMessage.toLowerCase().includes(key.toLowerCase())) {
      return friendly
    }
  }
  
  // Fallback: retornar mensagem genérica
  return 'Ocorreu um erro. Tente novamente mais tarde.'
}

/**
 * Handler de erro genérico para async/await
 * @param {Promise} promise - Promise a ser executada
 * @param {Object} options - Opções
 * @param {boolean} options.showToast - Se deve mostrar toast de erro (padrão: true)
 * @param {boolean} options.logToConsole - Se deve logar no console (padrão: true)
 * @param {string} options.customMessage - Mensagem customizada para o usuário
 * @returns {Promise<[error, result]>} Tuple com erro e resultado
 */
export async function handleAsync(promise, options = {}) {
  const {
    showToast = true,
    logToConsole = true,
    customMessage = null
  } = options
  
  try {
    const result = await promise
    return [null, result]
  } catch (error) {
    const friendlyMessage = customMessage || getFriendlyErrorMessage(error.message)
    
    if (logToConsole) {
      console.error('Erro capturado:', {
        original: error.message,
        friendly: friendlyMessage,
        stack: error.stack
      })
    }
    
    if (showToast) {
      toast.error(friendlyMessage)
    }
    
    return [error, null]
  }
}

/**
 * Wrapper para handlers de eventos com tratamento de erro
 * @param {Function} fn - Função a ser executada
 * @param {Object} options - Opções
 * @returns {Function} Função wrapper
 */
export function withErrorHandling(fn, options = {}) {
  return async function(...args) {
    const [error, result] = await handleAsync(fn(...args), options)
    
    if (error) {
      if (options.onError) {
        options.onError(error, args)
      }
      return null
    }
    
    return result
  }
}

/**
 * Logger de erro para produção (pode ser integrado com Sentry, etc)
 * @param {Error} error - Objeto de erro
 * @param {Object} context - Contexto adicional
 */
export function logError(error, context = {}) {
  // Em produção, enviar para serviço de monitoramento
  if (import.meta.env.PROD) {
    // TODO: Integrar com Sentry ou similar
    console.error('Erro em produção:', {
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    })
  } else {
    console.error('Erro:', error, 'Contexto:', context)
  }
}

/**
 * Validar resposta do Supabase
 * @param {Object} response - Resposta do Supabase { data, error }
 * @param {string} successMessage - Mensagem de sucesso (opcional)
 * @returns {boolean} True se sucesso, false caso contrário
 */
export function handleSupabaseResponse(response, successMessage = null) {
  const { data, error } = response
  
  if (error) {
    const friendlyMessage = getFriendlyErrorMessage(error.message)
    toast.error(friendlyMessage)
    logError(error, { response, data })
    return false
  }
  
  if (successMessage) {
    toast.success(successMessage)
  }
  
  return true
}

/**
 * Error boundary global para capturar erros de renderização
 */
window.addEventListener('error', (event) => {
  console.error('Erro global capturado:', event.error)
  logError(event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  })
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rejection não tratada:', event.reason)
  logError(event.reason || new Error('Unknown rejection'))
})
