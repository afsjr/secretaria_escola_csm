import { updateUserProfile } from '../auth/session'
import { toast } from '../lib/toast'

export function ProfileView(profile) {
  const container = document.createElement('div')
  container.className = 'profile-view animate-in'

  container.innerHTML = `
    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; color: var(--text-main);">Meus Dados</h1>
      <p>Gerencie suas informações pessoais do sistema.</p>
    </header>

    <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); max-width: 600px;">
      <form id="profile-form">
        <div class="form-group">
          <label class="label">Nome Completo</label>
          <input type="text" id="nome-completo" class="input" value="${profile.nome_completo}" required>
        </div>
        
        <div class="form-group">
          <label class="label">E-mail (Inalterável)</label>
          <input type="text" class="input" value="${profile.email}" disabled style="background: var(--secondary);">
        </div>
        
        <div class="form-group">
          <label class="label">Perfil de Acesso</label>
          <span class="badge" style="background: var(--primary); color: white;">${profile.perfil}</span>
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
    
    saveBtn.disabled = true
    saveBtn.textContent = 'Salvando...'

    const { error } = await updateUserProfile(profile.id, { nome_completo: newName })

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
