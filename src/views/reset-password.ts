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

  // Processar token de recovery da URL
  const processRecoveryToken = async () => {
    // Extrair token da URL (pode estar no hash ou query string)
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type')

    console.log('Processando token de recovery:', { 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken, 
      type 
    })

    if (accessToken && type === 'recovery') {
      try {
        // Trocar token temporário por sessão
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        })

        console.log('setSession result:', { 
          hasSession: !!data.session, 
          hasError: !!error,
          errorMessage: error?.message 
        })

        if (error) {
          console.error('Erro ao processar token:', error)
        }
      } catch (err) {
        console.error('Exceção ao processar token:', err)
      }
    }
  }

  // Executar processamento do token
  processRecoveryToken()

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
