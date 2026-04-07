import { getAllProfiles } from '../auth/session'
import { escapeHTML, createBadge } from '../lib/security'

export async function DirectoryView() {
  const container = document.createElement('div')
  container.className = 'directory-view animate-in'

  const { data: profiles, error } = await getAllProfiles()

  const profilesHTML = error
    ? `<p style="color:red">Erro ao carregar lista: ${escapeHTML(error.message)}</p>`
    : profiles?.map(p => {
      const initials = p.nome_completo ? escapeHTML(p.nome_completo.charAt(0).toUpperCase()) : '?'
      const nome = escapeHTML(p.nome_completo)
      const perfilBadge = createBadge(p.perfil || 'aluno')

      return `
          <div class="profile-card">
            <div class="avatar-circle">${initials}</div>
            <div>
              <div style="font-weight: 600; font-size: 1rem; margin-bottom: 4px;">${nome}</div>
              ${perfilBadge}
            </div>
          </div>
        `
    }).join('')

  container.innerHTML = `
    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; color: var(--text-main);">Usuários do Sistema</h1>
      <p>Veja todos os membros cadastrados no sistema.</p>
    </header>

    <div id="profiles-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
      ${profilesHTML}
    </div>
  `

  return container
}
