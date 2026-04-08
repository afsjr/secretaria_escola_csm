import { registerUser } from '../auth/signup-handler'
import { toast } from '../lib/toast'
import { validateSignup } from '../lib/validation'
import { checkRateLimit, clearRateLimit } from '../lib/rate-limiter'

export function SignupView() {
  const container = document.createElement('div')
  container.className = 'auth-container'

  container.innerHTML = `
    <div class="auth-card">
      <h2>Novo Cadastro</h2>
      <p style="text-align:center; margin-bottom: 2rem;">Crie sua conta de aluno</p>

      <form id="signup-form">
        <div class="form-group">
          <label class="label" for="nomeCompleto">Nome Completo</label>
          <input type="text" id="nomeCompleto" name="nomeCompleto" autocomplete="name" class="input" placeholder="João Silva" required>
        </div>

        <div class="form-group">
          <label class="label" for="email">E-mail</label>
          <input type="email" id="email" name="email" autocomplete="email" class="input" placeholder="seu@email.com" required>
        </div>

        <div class="form-group">
          <label class="label" for="cpf">CPF</label>
          <input type="text" id="cpf" name="cpf" class="input" placeholder="000.000.000-00" required>
        </div>

        <div class="form-group">
          <label class="label" for="telefone">Telefone / WhatsApp</label>
          <input type="text" id="telefone" name="telefone" autocomplete="tel" class="input" placeholder="(00) 00000-0000" required>
        </div>

        <div class="form-group">
          <label class="label" for="password">Senha</label>
          <input type="password" id="password" name="password" autocomplete="new-password" class="input" placeholder="mínimo 6 caracteres, 1 letra e 1 número" minlength="6" required>
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
    const cpf = form.querySelector('#cpf').value
    const telefone = form.querySelector('#telefone').value

    // Validar inputs antes de enviar
    const validation = validateSignup({ email, password, nomeCompleto, cpf, telefone })

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
    submitBtn.textContent = 'Registrando...'

    try {
      const { error } = await registerUser({
        email: validation.data.email,
        password: validation.data.password,
        nomeCompleto: validation.data.nomeCompleto,
        cpf: validation.data.cpf,
        telefone: validation.data.telefone
      })

      if (error) {
        toast.error('Erro no cadastro: ' + error.message)
      } else {
        clearRateLimit(email)
        toast.success('Conta criada com sucesso!')
      }
    } catch (err) {
      toast.error('Erro inesperado. Tente novamente.')
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = 'Registrar'
    }
  })

  return container
}
