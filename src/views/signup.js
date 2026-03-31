import { registerUser } from '../auth/signup-handler'
import { toast } from '../lib/toast'

export function SignupView() {
  const container = document.createElement('div')
  container.className = 'auth-container'

  container.innerHTML = `
    <div class="auth-card">
      <h2>Novo Cadastro</h2>
      <p style="text-align:center; margin-bottom: 2rem;">Crie sua conta de aluno</p>
      
      <form id="signup-form">
        <div class="form-group">
          <label class="label">Nome Completo</label>
          <input type="text" id="nomeCompleto" class="input" placeholder="João Silva" required>
        </div>
        
        <div class="form-group">
          <label class="label">E-mail</label>
          <input type="email" id="email" class="input" placeholder="seu@email.com" required>
        </div>
        
        <div class="form-group">
          <label class="label">Senha</label>
          <input type="password" id="password" class="input" placeholder="mínimo 6 caracteres" minlength="6" required>
        </div>
        
        <button type="submit" class="btn btn-primary" style="width: 100%;">Registrar</button>
      </form>
      
      <div class="auth-footer">
        Já possui conta? <a href="#/">Fazer Login</a>
      </div>
    </div>
  `

  const form = container.querySelector('#signup-form')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const email = form.querySelector('#email').value
    const password = form.querySelector('#password').value
    const nomeCompleto = form.querySelector('#nomeCompleto').value
    
    const { error } = await registerUser({ email, password, nomeCompleto })
    
    if (error) {
      toast.error('Erro no cadastro: ' + error.message)
    } else {
      toast.success('Conta criada com sucesso!')
    }
  })

  return container
}
