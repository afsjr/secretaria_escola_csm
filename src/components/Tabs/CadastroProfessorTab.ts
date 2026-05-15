/**
 * CadastroProfessorTab — Aba de Cadastro de Professor
 *
 * Componente auto-contido para criar novas contas de professores.
 * Extraído da SecretariaView (Fase 2 da refatoração modular).
 */

import { AdminService } from '../../lib/admin-service'
import { toast } from '../../lib/toast'
import { renderTemplate } from '../../lib/dom-utils'

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
          <input type="text" id="professor-cpf" name="professor_cpf" class="input" placeholder="000.000.000-00">
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