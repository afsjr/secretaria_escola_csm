import { login } from '../auth/session'
import { toast } from '../lib/toast'
import { validateLogin } from '../lib/validation'
import { checkRateLimit, clearRateLimit } from '../lib/rate-limiter'

export function LoginView() {
  const container = document.createElement('div')
  container.className = 'auth-container'

  container.innerHTML = `
    <div class="auth-card">
      <h2>Acesso Administrativo</h2>
      <p style="text-align:center; margin-bottom: 2rem;">SGE - Secretaria Escola CSM</p>

      <form id="login-form">
        <div class="form-group">
          <label class="label" for="email">E-mail</label>
          <input type="email" id="email" name="email" autocomplete="email" class="input" placeholder="seu@email.com" required>
        </div>

        <div class="form-group">
          <label class="label" for="password">Senha</label>
          <input type="password" id="password" name="password" autocomplete="current-password" class="input" placeholder="********" required>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">Entrar</button>
      </form>

      <div class="auth-footer">
        Não tem uma conta? <a href="#/signup">Criar Cadastro</a>
      </div>
    </div>
  `

  const form = container.querySelector('#login-form')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = form.querySelector('#email').value
    const password = form.querySelector('#password').value

    // Validar inputs antes de enviar
    const validation = validateLogin({ email, password })

    if (!validation.success) {
      validation.errors.forEach(err => toast.error(err))
      return
    }

    // Verificar rate limiting
    const rateLimit = checkRateLimit(email)
    if (!rateLimit.allowed) {
      toast.error(rateLimit.message)
      return
    }

    const submitBtn = form.querySelector('button[type="submit"]')
    submitBtn.disabled = true
    submitBtn.textContent = 'Entrando...'

    try {
      const { error } = await login(validation.data.email, validation.data.password)

      if (error) {
        toast.error('Erro de acesso: ' + error.message)
      } else {
        clearRateLimit(email) // Limpa tentativas após login bem-sucedido
        toast.success('Bem-vindo ao sistema!')
      }
    } catch (err) {
      toast.error('Erro inesperado. Tente novamente.')
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = 'Entrar'
    }
  })

  return container
}
