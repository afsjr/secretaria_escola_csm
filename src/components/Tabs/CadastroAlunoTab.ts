/**
 * CadastroAlunoTab — Aba de Cadastro de Aluno
 *
 * Componente auto-contido para criar novas contas de alunos.
 * Extraído da SecretariaView (Fase 1 da refatoração modular).
 */

import { AdminService } from '../../lib/admin-service'
import { toast } from '../../lib/toast'
import { renderTemplate } from '../../lib/dom-utils'
import { escapeHTML } from '../../lib/security'
import { validarCPF } from '../../lib/validation'

interface Turma {
  id: string
  nome: string
  periodo: string
}

export interface CadastroAlunoTabProps {
  turmas: Turma[] | null
}

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/

export function CadastroAlunoTab({ turmas }: CadastroAlunoTabProps): HTMLDivElement {
  const html = `
    <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); max-width: 600px; margin: 0 auto;">
      <h3 style="margin-bottom: 1.5rem; color: var(--text-main);">Cadastrar Novo Aluno</h3>
      <p style="margin-bottom: 1.5rem; color: var(--text-muted); font-size: 0.9rem;">Crie uma nova conta de aluno no sistema. O aluno poderá fazer login imediatamente após o cadastro.</p>

      <form id="form-cadastro-aluno">
        <div class="form-group">
          <label class="label" for="aluno-nome">Nome Completo *</label>
          <input type="text" id="aluno-nome" name="aluno_nome" class="input" placeholder="João Silva" required>
        </div>

        <div class="form-group">
          <label class="label" for="aluno-email">E-mail *</label>
          <input type="email" id="aluno-email" name="aluno_email" class="input" placeholder="joao@email.com" required>
        </div>

        <div class="form-group">
          <label class="label" for="aluno-cpf">CPF</label>
          <div style="position: relative;">
            <input type="text" id="aluno-cpf" name="aluno_cpf" class="input" placeholder="000.000.000-00" style="padding-right: 2.5rem;">
            <span id="cpf-status" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 1.2rem; display: none;"></span>
          </div>
          <small id="cpf-feedback" style="color: var(--text-muted); display: none;"></small>
        </div>

        <div class="form-group">
          <label class="label" for="aluno-telefone">Telefone / WhatsApp</label>
          <input type="text" id="aluno-telefone" name="aluno_telefone" class="input" placeholder="(00) 00000-0000">
        </div>

        <div class="form-group">
          <label class="label" for="aluno-senha">Senha * (mínimo 8 caracteres, letras e números)</label>
          <input type="password" id="aluno-senha" name="aluno_senha" class="input" placeholder="******" minlength="8" required>
        </div>

        <div class="form-group">
          <label class="label" for="aluno-turma">Matricular em Turma (opcional)</label>
          <select id="aluno-turma" name="aluno_turma" class="input">
            <option value="">-- Selecione uma turma --</option>
            ${turmas && turmas.length > 0 ? turmas.map(t => `
              <option value="${t.id}">${escapeHTML(t.nome)} (${escapeHTML(t.periodo)})</option>
            `).join('') : '<option value="">Nenhuma turma disponível</option>'}
          </select>
        </div>

        <button type="submit" class="btn btn-primary" id="btn-cadastrar" style="width: 100%;">Cadastrar Aluno</button>
      </form>
    </div>
  `

  const container = renderTemplate<HTMLDivElement>(html)

  const cpfInput = container.querySelector('#aluno-cpf') as HTMLInputElement
  const cpfStatus = container.querySelector('#cpf-status') as HTMLSpanElement
  const cpfFeedback = container.querySelector('#cpf-feedback') as HTMLElement

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

  // Bind do formulário
  const form = container.querySelector('#form-cadastro-aluno') as HTMLFormElement
  const btnCadastrar = container.querySelector('#btn-cadastrar') as HTMLButtonElement

  form.addEventListener('submit', async (e: Event) => {
    e.preventDefault()

    const nomeCompleto = (container.querySelector('#aluno-nome') as HTMLInputElement).value.trim()
    const email = (container.querySelector('#aluno-email') as HTMLInputElement).value.trim()
    const cpf = (container.querySelector('#aluno-cpf') as HTMLInputElement).value.trim()
    const telefone = (container.querySelector('#aluno-telefone') as HTMLInputElement).value.trim()
    const senha = (container.querySelector('#aluno-senha') as HTMLInputElement).value
    const turmaId = (container.querySelector('#aluno-turma') as HTMLSelectElement).value

    if (!nomeCompleto || !email || !senha) {
      toast.error('Preencha os campos obrigatórios.')
      return
    }

    if (!PASSWORD_REGEX.test(senha)) {
      toast.error('Senha inválida: Mínimo 8 caracteres com letras e números (Ex: csm_1983#)')
      return
    }

    if (cpf.length > 0 && cpf.replace(/\D/g, '').length === 11 && !validarCPF(cpf)) {
      toast.error('CPF inválido. Verifique o número e tente novamente.')
      cpfInput.focus()
      return
    }

    btnCadastrar.disabled = true
    btnCadastrar.textContent = 'Cadastrando...'

    const { data, error } = await AdminService.createUserByAdmin({
      email,
      password: senha,
      nomeCompleto,
      cpf,
      telefone,
      perfil: 'aluno'
    })

    if (error) {
      toast.error('Erro ao cadastrar: ' + error.message)
      btnCadastrar.disabled = false
      btnCadastrar.textContent = 'Cadastrar Aluno'
      return
    }

    if (turmaId && data?.userId) {
      const { error: erroMatricula } = await AdminService.matricularAluno(data.userId, turmaId)

      if (erroMatricula) {
        toast.warning('Aluno cadastrado, mas houve erro ao matricular na turma: ' + erroMatricula.message)
      } else {
        toast.success('Aluno cadastrado e matriculado com sucesso!')
      }
    } else {
      toast.success('Aluno cadastrado com sucesso!')
    }

    // Recarregar a página para atualizar a lista de alunos
    setTimeout(() => window.location.reload(), 500)
  })

  return container
}
