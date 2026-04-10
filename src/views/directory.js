import { getAllProfiles } from '../auth/session'
import { escapeHTML, createBadge } from '../lib/security'

export async function DirectoryView() {
  const container = document.createElement('div')
  container.className = 'directory-view animate-in'

  const { data: profiles, error } = await getAllProfiles()

  const profilesHTML = error
    ? `<p style="color:red">Erro ao carregar lista: ${escapeHTML(error.message)}</p>`
    : profiles?.sort((a,b) => (a.nome_completo || '').localeCompare(b.nome_completo || ''))
      .map(p => {
        const nome = escapeHTML(p.nome_completo)
        const perfil = p.perfil || 'aluno'
        const perfilLabel = perfil === 'secretaria' ? 'Secretaria' : perfil === 'professor' ? 'Professor' : 'Aluno'

        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem 1rem; background: white; border-bottom: 1px solid var(--secondary);">
              <div style="font-weight: 500;">${nome}</div>
              <div style="font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 600;">${perfilLabel}</div>
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

  return container
}
