import { updatePassword } from '../auth/session'
import { toast } from '../lib/toast'

export function ResetPasswordView(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'auth-container'

  container.innerHTML = `
    <div class="auth-card">
      <h2>Nova Senha</h2>
      <p style="text-align:center; margin-bottom: 2rem;">Crie uma nova senha de acesso.</p>

      <form id="reset-password-form">
        <div class="form-group">
          <label class="label" for="new-password">Nova Senha</label>
          <input type="password" id="new-password" name="new-password" class="input" placeholder="Nova senha (min. 6 caracteres)" minlength="6" required>
        </div>

        <div class="form-group">
          <label class="label" for="confirm-password">Confirmar Nova Senha</label>
          <input type="password" id="confirm-password" name="confirm-password" class="input" placeholder="Repita a senha" minlength="6" required>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">Atualizar Senha</button>
      </form>
    </div>
  `

  const form = container.querySelector('#reset-password-form') as HTMLFormElement
  form.addEventListener('submit', async (e: Event) => {
    e.preventDefault()

    const newPassword = (form.querySelector('#new-password') as HTMLInputElement).value
    const confirmPassword = (form.querySelector('#confirm-password') as HTMLInputElement).value

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement
    submitBtn.disabled = true
    submitBtn.textContent = 'Atualizando...'

    try {
      const { error } = await updatePassword(newPassword)

      if (error) {
        toast.error('Erro ao atualizar senha: ' + error.message)
      } else {
        toast.success('Senha atualizada com sucesso! Faça login.')
        setTimeout(() => {
          window.location.hash = '#/'
        }, 2000)
      }
    } catch {
      toast.error('Erro inesperado. Tente novamente.')
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = 'Atualizar Senha'
    }
  })

  return container
}
