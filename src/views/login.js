import { login } from '../auth/session'
import { toast } from '../lib/toast'

export function LoginView() {
  const container = document.createElement('div')
  container.className = 'auth-container'

  container.innerHTML = `
    <div class="auth-card">
      <h2>Acesso Administrativo</h2>
      <p style="text-align:center; margin-bottom: 2rem;">SGE - Secretaria Escola CSM</p>
      
      <form id="login-form">
        <div class="form-group">
          <label class="label">E-mail</label>
          <input type="email" id="email" class="input" placeholder="seu@email.com" required>
        </div>
        
        <div class="form-group">
          <label class="label">Senha</label>
          <input type="password" id="password" class="input" placeholder="********" required>
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
    
    const { error } = await login(email, password)
    
    if (error) {
      toast.error('Erro de acesso: ' + error.message)
    } else {
      toast.success('Bem-vindo ao sistema!')
    }
  })

  return container
}
