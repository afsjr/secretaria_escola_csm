/**
 * Rate Limiter para Login e Signup
 * 
 * Previne ataques de força bruta limitando tentativas de login.
 */

const RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 5 * 60 * 1000, // 5 minutos
  blockMs: 15 * 60 * 1000  // 15 minutos de bloqueio
}

const attempts = {}

/**
 * Verifica se o email está bloqueado por muitas tentativas
 * @param {string} email - Email do usuário
 * @returns {Object} { allowed: boolean, remaining: number, resetAt: Date, message?: string }
 */
export function checkRateLimit(email) {
  const now = Date.now()
  const record = attempts[email]

  if (!record) {
    attempts[email] = { count: 1, firstAttempt: now }
    return { allowed: true, remaining: RATE_LIMIT.maxAttempts - 1, resetAt: new Date(now + RATE_LIMIT.windowMs) }
  }

  // Se passou do tempo da janela, reseta
  if (now - record.firstAttempt > RATE_LIMIT.windowMs) {
    attempts[email] = { count: 1, firstAttempt: now }
    return { allowed: true, remaining: RATE_LIMIT.maxAttempts - 1, resetAt: new Date(now + RATE_LIMIT.windowMs) }
  }

  // Se está bloqueado
  if (record.blockedUntil && now < record.blockedUntil) {
    const mins = Math.ceil((record.blockedUntil - now) / 60000)
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(record.blockedUntil),
      message: `Muitas tentativas. Tente novamente em ${mins} minuto(s).`
    }
  }

  // Se passou do bloqueio, reseta
  if (record.blockedUntil && now >= record.blockedUntil) {
    attempts[email] = { count: 1, firstAttempt: now }
    return { allowed: true, remaining: RATE_LIMIT.maxAttempts - 1, resetAt: new Date(now + RATE_LIMIT.windowMs) }
  }

  // Incrementa tentativa
  record.count++

  // Se excedeu o limite, bloqueia
  if (record.count > RATE_LIMIT.maxAttempts) {
    record.blockedUntil = now + RATE_LIMIT.blockMs
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(record.blockedUntil),
      message: `Muitas tentativas. Conta bloqueada por ${RATE_LIMIT.blockMs / 60000} minutos.`
    }
  }

  return { allowed: true, remaining: RATE_LIMIT.maxAttempts - record.count, resetAt: new Date(record.firstAttempt + RATE_LIMIT.windowMs) }
}

/**
 * Limpa o rate limiter para um email (após login bem-sucedido)
 */
export function clearRateLimit(email) {
  delete attempts[email]
}

/**
 * Limpa tentativas expiradas (rodar periodicamente)
 */
function cleanupExpiredAttempts() {
  const now = Date.now()
  Object.keys(attempts).forEach(key => {
    const record = attempts[key]
    if (record.blockedUntil && now >= record.blockedUntil) {
      delete attempts[key]
    } else if (now - record.firstAttempt > RATE_LIMIT.windowMs + RATE_LIMIT.blockMs) {
      delete attempts[key]
    }
  })
}

// Limpar tentativas expiradas a cada minuto
setInterval(cleanupExpiredAttempts, 60000)
