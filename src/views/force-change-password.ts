import { updatePassword } from '../auth/session'
import { supabase } from '../lib/supabase'
import { toast } from '../lib/toast'

interface ForceChangePasswordParam {
  userId: string
}

export function ForceChangePasswordView(param: ForceChangePasswordParam): HTMLElement {
  const container = document.createElement('div')
  container.className = 'auth-container'

  container.innerHTML = `
    <div class="auth-card" style="max-width: 450px;">
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔐</div>
        <h2 style="color: var(--primary);">Primeiro Acesso</h2>
        <p style="color: var(--text-muted);">Por segurança, você deve criar uma senha pessoal para acessar o sistema.</p>
      </div>

      <form id="force-change-password-form">
        <div class="form-group">
          <label class="label" for="new-password">Nova Senha</label>
          <input type="password" id="new-password" name="new-password" class="input" placeholder="Mínimo 6 caracteres" minlength="6" required autocomplete="new-password">
        </div>

        <div class="form-group">
          <label class="label" for="confirm-password">Confirmar Senha</label>
          <input type="password" id="confirm-password" name="confirm-password" class="input" placeholder="Repita a senha" minlength="6" required autocomplete="new-password">
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">Criar Senha e Acessar</button>
      </form>
    </div>
  `

  const form = container.querySelector('#force-change-password-form') as HTMLFormElement
  form.addEventListener('submit', async (e: Event) => {
    e.preventDefault()

    const newPassword = (form.querySelector('#new-password') as HTMLInputElement).value
    const confirmPassword = (form.querySelector('#confirm-password') as HTMLInputElement).value

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement
    submitBtn.disabled = true
    submitBtn.textContent = 'Salvando...'

    try {
      const { error } = await updatePassword(newPassword)

      if (error) {
        toast.error('Erro ao criar senha: ' + error.message)
        submitBtn.disabled = false
        submitBtn.textContent = 'Criar Senha e Acessar'
        return
      }

      const { error: updateError } = await supabase
        .from('perfis')
        .update({ primeiro_acesso: false })
        .eq('id', param.userId)

      if (updateError) {
        console.error('Erro ao atualizar flag primeiro_acesso:', updateError)
      }

      toast.success('Senha criada com sucesso!')
      setTimeout(() => {
        window.location.hash = '#/dashboard'
      }, 1500)

    } catch (err: any) {
      toast.error('Erro inesperado: ' + err.message)
      submitBtn.disabled = false
      submitBtn.textContent = 'Criar Senha e Acessar'
    }
  })

  return container
}
