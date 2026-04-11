import { getAllProfiles } from '../auth/session'
import { escapeHTML, createBadge } from '../lib/security'
import { AdminService } from '../lib/admin-service'
import { toast } from '../lib/toast'

export async function DirectoryView() {
  const container = document.createElement('div')
  container.className = 'directory-view animate-in'

  const { data: profiles, error } = await getAllProfiles()

  const profilesHTML = error
    ? `<p style="color:red">Erro ao carregar lista: ${escapeHTML(error.message)}</p>`
    : profiles?.sort((a,b) => (a.nome_completo || '').localeCompare(b.nome_completo || ''))
      .map(p => {
        const nome = escapeHTML(p.nome_completo)
        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: white; border-bottom: 1px solid var(--secondary); gap: 1rem;">
              <div style="flex: 1;">
                <div style="font-weight: 600; font-size: 1rem;">${nome}</div>
              </div>
              <div>
                <button class="btn btn-reset-password" data-id="${p.id}" data-nome="${nome}" style="background: var(--secondary); color: var(--text-main); font-size: 0.75rem; padding: 0.4rem 0.8rem; border-radius: 4px; font-weight: 600; cursor: pointer; border: 1px solid var(--border);">
                  🔄 Resetar Senha
                </button>
              </div>
            </div>
          `
      }).join('')

  container.innerHTML = `
    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; color: var(--text-main);">Usuários do Sistema</h1>
      <p>Lista simplificada de membros registrados.</p>
    </header>

    <div id="profiles-list" style="background: white; border-radius: 8px; box-shadow: var(--shadow-sm); overflow: hidden;">
      ${profilesHTML}
    </div>
  `

  // Lógica de Reset
  container.querySelectorAll('.btn-reset-password').forEach(btn => {
    btn.onclick = async () => {
      const { id, nome } = btn.dataset
      
      if (confirm(`Deseja resetar a senha de ${nome} para csm1983#?\n\nO usuário será obrigado a trocar a senha no próximo acesso.`)) {
        btn.disabled = true
        btn.textContent = 'Processando...'
        
        const { error } = await AdminService.resetUserPassword(id)
        
        if (error) {
          toast.error('Erro ao resetar: ' + error.message)
          btn.disabled = false
          btn.textContent = '🔄 Resetar Senha'
        } else {
          toast.success(`Senha de ${nome} resetada com sucesso!`)
          btn.textContent = '✅ Resetada'
          btn.style.background = 'var(--success)'
          btn.style.color = 'white'
        }
      }
    }
  })

  return container
}
