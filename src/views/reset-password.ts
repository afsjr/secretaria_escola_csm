import { updatePassword } from '../auth/session'
import { supabase } from '../lib/supabase'
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
          <input type="password" id="new-password" name="new-password" class="input" placeholder="Nova senha (min. 6 caracteres)" minlength="6" required autocomplete="new-password">
        </div>

        <div class="form-group">
          <label class="label" for="confirm-password">Confirmar Nova Senha</label>
          <input type="password" id="confirm-password" name="confirm-password" class="input" placeholder="Repita a senha" minlength="6" required autocomplete="new-password">
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">Atualizar Senha</button>
      </form>
    </div>
  `

  const form = container.querySelector('#reset-password-form') as HTMLFormElement
  form.addEventListener('submit', async (e: Event) => {
    e.preventDefault()

    // Verificar se há sessão válida (recovery token)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      toast.error('Link de recuperação expirado. Solicite um novo link.')
      setTimeout(() => {
        window.location.hash = '#/forgot-password'
      }, 3000)
      return
    }

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
        // Sign out após update para forçar novo login
        await supabase.auth.signOut()
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
