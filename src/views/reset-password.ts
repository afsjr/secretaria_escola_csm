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

  // Verificar token de recovery automaticamente ao carregar
  setTimeout(async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    console.log('Reset password - Session check:', { 
      hasSession: !!session, 
      hasError: !!error,
      errorMessage: error?.message,
      expiresAt: session?.expires_at
    })
    
    // Se não há sessão mas há hash de recovery, tentar processar
    if (!session && (window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token='))) {
      console.log('Tentando processar token de recovery...')
      // O Supabase deve processar automaticamente o token da URL
      // Se não funcionar, o usuário verá a mensagem de erro
    }
    
    if (!session && !error) {
      // Sessão null mas sem erro - pode ser normal em flows de recovery
      console.log('Sessão nula mas sem erro - aguardando processamento do token')
    }
  }, 500)

  return container
}
