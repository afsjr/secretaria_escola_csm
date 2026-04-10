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
        <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; margin-bottom: 0.5rem; font-weight: 500;">Materiais de Treinamento CSM:</div>
        <div style="display: flex; gap: 0.5rem;">
          <button type="button" id="btn-treinamento-guia" class="btn" style="flex: 1; padding: 0.5rem; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem; background: var(--bg-page); color: var(--text-main); border: 1px solid #CBD5E1; cursor: pointer;">
            📄 Guia
          </button>
          <button type="button" id="btn-treinamento-slide" class="btn" style="flex: 1; padding: 0.5rem; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem; background: var(--bg-page); color: var(--text-main); border: 1px solid #CBD5E1; cursor: pointer;">
            📺 Slides
          </button>
        </div>
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

  // Training button event listener (Guia)
  const btnTreinamentoGuia = container.querySelector('#btn-treinamento-guia')
  if(btnTreinamentoGuia) {
    btnTreinamentoGuia.addEventListener('click', (e) => {
      e.preventDefault();
      window.open('apresentacao_treinamento.html', '_blank')
    })
  }

  // Training button event listener (Slides)
  const btnTreinamentoSlide = container.querySelector('#btn-treinamento-slide')
  if(btnTreinamentoSlide) {
    btnTreinamentoSlide.addEventListener('click', (e) => {
      e.preventDefault();
      window.open('apresentacao_treinamento_slides.html', '_blank')
    })
  }

  return container
}
