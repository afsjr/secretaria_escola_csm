import { resetPassword } from '../auth/session'
import { toast } from '../lib/toast'

export function ForgotPasswordView() {
  const container = document.createElement('div')
  container.className = 'auth-container'

  container.innerHTML = `
    <div class="auth-card">
      <h2>Recuperar Senha</h2>
      <p style="text-align:center; margin-bottom: 2rem;">Insira seu email para receber um link de redefinição.</p>

      <form id="forgot-password-form">
        <div class="form-group">
          <label class="label" for="email">E-mail Cadastrado</label>
          <input type="email" id="email" name="email" class="input" placeholder="seu@email.com" required>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">Enviar Link de Recuperação</button>
      </form>

      <div class="auth-footer" style="margin-top: 1.5rem;">
        <a href="#/">← Voltar para o Login</a>
      </div>
    </div>
  `

  const form = container.querySelector('#forgot-password-form')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const email = form.querySelector('#email').value
    const submitBtn = form.querySelector('button[type="submit"]')
    
    submitBtn.disabled = true
    submitBtn.textContent = 'Enviando...'

    try {
      const { error } = await resetPassword(email)

      if (error) {
        toast.error('Erro ao enviar link: ' + error.message)
      } else {
        toast.success('Verifique sua caixa de entrada para o link de recuperação.')
        setTimeout(() => {
          window.location.hash = '#/'
        }, 3000)
      }
    } catch (err) {
      toast.error('Erro inesperado. Tente novamente.')
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = 'Enviar Link de Recuperação'
    }
  })

  return container
}
