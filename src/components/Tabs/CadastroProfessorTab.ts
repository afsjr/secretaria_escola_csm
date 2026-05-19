/**
 * CadastroProfessorTab — Aba de Cadastro de Professor
 *
 * Componente auto-contido para criar novas contas de professores.
 * Extraído da SecretariaView (Fase 2 da refatoração modular).
 */

import { AdminService } from '../../lib/admin-service'
import { toast } from '../../lib/toast'
import { renderTemplate } from '../../lib/dom-utils'
import { validarCPF } from '../../lib/validation'

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

export function CadastroProfessorTab(): HTMLDivElement {
  const html = `
    <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); max-width: 600px; margin: 0 auto;">
      <h3 style="margin-bottom: 1.5rem; color: var(--text-main);">Cadastrar Novo Professor</h3>
      <p style="margin-bottom: 1.5rem; color: var(--text-muted); font-size: 0.9rem;">Crie uma nova conta de professor no sistema. O professor poderá fazer login imediatamente após o cadastro.</p>

      <form id="form-cadastro-professor">
        <div class="form-group">
          <label class="label" for="professor-nome">Nome Completo *</label>
          <input type="text" id="professor-nome" name="professor_nome" class="input" placeholder="Maria Silva" required>
        </div>

        <div class="form-group">
          <label class="label" for="professor-email">E-mail *</label>
          <input type="email" id="professor-email" name="professor_email" class="input" placeholder="maria@email.com" required>
        </div>

        <div class="form-group">
          <label class="label" for="professor-cpf">CPF</label>
          <div style="position: relative;">
            <input type="text" id="professor-cpf" name="professor_cpf" class="input" placeholder="000.000.000-00" style="padding-right: 2.5rem;">
            <span id="cpf-status" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 1.2rem; display: none;"></span>
          </div>
          <small id="cpf-feedback" style="color: var(--text-muted); display: none;"></small>
        </div>

        <div class="form-group">
          <label class="label" for="professor-telefone">Telefone / WhatsApp</label>
          <input type="text" id="professor-telefone" name="professor_telefone" class="input" placeholder="(00) 00000-0000">
        </div>

        <div class="form-group">
          <label class="label" for="professor-senha">Senha * (mínimo 8 caracteres, letras e números)</label>
          <input type="password" id="professor-senha" name="professor_senha" class="input" placeholder="******" minlength="8" required>
        </div>

        <button type="submit" class="btn btn-primary" id="btn-cadastrar-professor" style="width: 100%;">Cadastrar Professor</button>
      </form>
    </div>
  `

  const container = renderTemplate<HTMLDivElement>(html)

  const cpfInput = container.querySelector('#professor-cpf') as HTMLInputElement
  const cpfStatus = container.querySelector('#cpf-status') as HTMLSpanElement
  const cpfFeedback = container.querySelector('#cpf-feedback') as HTMLSmallElement

  function formatCPF(value: string): string {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`
  }

  cpfInput.addEventListener('input', () => {
    const rawValue = cpfInput.value
    const formattedValue = formatCPF(rawValue)
    if (rawValue !== formattedValue) {
      cpfInput.value = formattedValue
    }

    const cpf = cpfInput.value.replace(/\D/g, '')

    if (cpf.length === 0) {
      cpfStatus.style.display = 'none'
      cpfFeedback.style.display = 'none'
      cpfInput.style.borderColor = ''
      return
    }

    if (cpf.length < 11) {
      cpfStatus.textContent = '⏳'
      cpfStatus.style.display = 'block'
      cpfStatus.style.color = 'var(--text-muted)'
      cpfFeedback.style.display = 'none'
      cpfInput.style.borderColor = ''
      return
    }

    if (validarCPF(cpf)) {
      cpfStatus.textContent = '✅'
      cpfStatus.style.display = 'block'
      cpfStatus.style.color = 'var(--success)'
      cpfFeedback.textContent = 'CPF válido'
      cpfFeedback.style.display = 'block'
      cpfFeedback.style.color = 'var(--success)'
      cpfInput.style.borderColor = 'var(--success)'
    } else {
      cpfStatus.textContent = '❌'
      cpfStatus.style.display = 'block'
      cpfStatus.style.color = 'var(--danger)'
      cpfFeedback.textContent = 'CPF inválido'
      cpfFeedback.style.display = 'block'
      cpfFeedback.style.color = 'var(--danger)'
      cpfInput.style.borderColor = 'var(--danger)'
    }
  })

  const form = container.querySelector('#form-cadastro-professor') as HTMLFormElement
  const btnCadastrar = container.querySelector('#btn-cadastrar-professor') as HTMLButtonElement

  form.addEventListener('submit', async (e: Event) => {
    e.preventDefault()

    const nomeCompleto = (container.querySelector('#professor-nome') as HTMLInputElement).value.trim()
    const email = (container.querySelector('#professor-email') as HTMLInputElement).value.trim()
    const cpf = (container.querySelector('#professor-cpf') as HTMLInputElement).value.trim()
    const telefone = (container.querySelector('#professor-telefone') as HTMLInputElement).value.trim()
    const senha = (container.querySelector('#professor-senha') as HTMLInputElement).value

    if (!nomeCompleto || !email || !senha) {
      toast.error('Preencha os campos obrigatórios.')
      return
    }

    if (!PASSWORD_REGEX.test(senha)) {
      toast.error('Senha inválida: Mínimo 8 caracteres com letras e números.')
      return
    }

    if (cpf.length > 0 && cpf.replace(/\D/g, '').length === 11 && !validarCPF(cpf)) {
      toast.error('CPF inválido. Verifique o número e tente novamente.')
      cpfInput.focus()
      return
    }

    btnCadastrar.disabled = true
    btnCadastrar.textContent = 'Cadastrando...'

    const { error } = await AdminService.createUserByAdmin({
      email,
      password: senha,
      nomeCompleto,
      cpf,
      telefone,
      perfil: 'professor'
    })

    if (error) {
      toast.error('Erro ao cadastrar: ' + error.message)
      btnCadastrar.disabled = false
      btnCadastrar.textContent = 'Cadastrar Professor'
      return
    }

    toast.success('Professor cadastrado com sucesso!')
    setTimeout(() => window.location.reload(), 500)
  })

  return container
}