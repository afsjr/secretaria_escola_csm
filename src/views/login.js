import { login } from '../auth/session'
import { toast } from '../lib/toast'
import { validateLogin } from '../lib/validation'
import { checkRateLimit, clearRateLimit } from '../lib/rate-limiter'

export function LoginView() {
  const container = document.createElement('div')
  container.className = 'auth-container'

  container.innerHTML = `
    <div class="auth-card">
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎓</div>
        <h2 style="color: var(--primary);">Acesso Administrativo</h2>
        <p style="text-align:center; margin-bottom: 2rem; color: var(--text-muted);">SGE - Secretaria Escola CSM<br><strong style="color: var(--primary);">Colégio Santa Mônica</strong> - Limoeiro/PE</p>
      </div>

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

      <div style="margin-top: 1rem;">
        <button id="btn-treinamento" class="btn btn-treinamento" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; background: var(--accent); color: var(--text-main); border: 2px solid var(--accent); cursor: pointer;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          📚 Material de Treinamento
        </button>
      </div>

      <div class="auth-footer">
        Não tem uma conta? <a href="#/signup">Criar Cadastro</a>
        <br><br>
        Esqueceu sua senha? <a href="#/forgot-password">Recuperar Acesso</a>
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

  // Training button event listener
  const btnTreinamento = container.querySelector('#btn-treinamento')
  btnTreinamento.addEventListener('click', () => {
    window.open(window.location.origin + window.location.pathname + 'apresentacao_treinamento.html', '_blank')
  })

  return container
}
