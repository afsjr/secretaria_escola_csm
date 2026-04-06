import { updateUserProfile } from '../auth/session'
import { toast } from '../lib/toast'
import { escapeHTML } from '../lib/security'

export function ProfileView(profile) {
  const container = document.createElement('div')
  container.className = 'profile-view animate-in'

  const initials = profile.nome_completo ? escapeHTML(profile.nome_completo.charAt(0).toUpperCase()) : '?'
  const nomeValue = escapeHTML(profile.nome_completo || '')
  const cpfValue = escapeHTML(profile.cpf || '')
  const telefoneValue = escapeHTML(profile.telefone || '')
  const emailValue = escapeHTML(profile.email || '')
  const perfilValue = escapeHTML(profile.perfil || 'aluno')

  container.innerHTML = `
    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; color: var(--text-main);">Meus Dados</h1>
      <p>Gerencie suas informações pessoais do sistema.</p>
    </header>

    <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); max-width: 600px;">
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="width: 100px; height: 100px; border-radius: 50%; background: var(--accent); display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 2.5rem; color: white; margin-bottom: 1rem;">
          ${initials}
        </div>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Foto de perfil em desenvolvimento</p>
      </div>

      <form id="profile-form">
        <div class="form-group">
          <label class="label" for="nome-completo">Nome Completo</label>
          <input type="text" id="nome-completo" name="nome_completo" class="input" value="${nomeValue}" required>
        </div>

        <div class="form-group">
          <label class="label" for="cpf">CPF</label>
          <input type="text" id="cpf" name="cpf" class="input" value="${cpfValue}" placeholder="000.000.000-00">
        </div>

        <div class="form-group">
          <label class="label" for="telefone">Telefone / WhatsApp</label>
          <input type="text" id="telefone" name="telefone" class="input" value="${telefoneValue}" placeholder="(00) 00000-0000">
        </div>

        <div class="form-group">
          <label class="label">E-mail (Inalterável)</label>
          <input type="text" class="input" value="${emailValue}" disabled style="background: var(--secondary);">
        </div>

        <div class="form-group">
          <label class="label">Perfil de Acesso</label>
          <span class="badge" style="background: var(--primary); color: white;">${perfilValue}</span>
        </div>

        <button type="submit" class="btn btn-primary" id="save-btn">Salvar Alterações</button>
      </form>
    </div>
  `

  const form = container.querySelector('#profile-form')
  const saveBtn = container.querySelector('#save-btn')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const newName = form.querySelector('#nome-completo').value
    const newCpf = form.querySelector('#cpf').value
    const newTelefone = form.querySelector('#telefone').value

    saveBtn.disabled = true
    saveBtn.textContent = 'Salvando...'

    const { error } = await updateUserProfile(profile.id, {
      nome_completo: newName,
      cpf: newCpf,
      telefone: newTelefone
    })

    if (error) {
      toast.error('Erro ao salvar: ' + error.message)
      saveBtn.disabled = false
      saveBtn.textContent = 'Salvar Alterações'
    } else {
      toast.success('Perfil atualizado com sucesso!')

      // Force a redirect to refresh user information in the sidebar
      setTimeout(() => {
        window.location.hash = '#/dashboard'
      }, 800)
    }
  })

  return container
}
