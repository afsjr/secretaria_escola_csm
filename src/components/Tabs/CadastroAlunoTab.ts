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
          <input type="text" id="aluno-cpf" name="aluno_cpf" class="input" placeholder="000.000.000-00">
        </div>

        <div class="form-group">
          <label class="label" for="aluno-telefone">Telefone / WhatsApp</label>
          <input type="text" id="aluno-telefone" name="aluno_telefone" class="input" placeholder="(00) 00000-0000">
        </div>

        <div class="form-group">
          <label class="label" for="aluno-senha">Senha * (mínimo 6 caracteres)</label>
          <input type="password" id="aluno-senha" name="aluno_senha" class="input" placeholder="******" minlength="6" required>
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
