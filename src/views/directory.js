import { getAllProfiles } from '../auth/session'

export async function DirectoryView() {
  const container = document.createElement('div')
  container.className = 'directory-view animate-in'

  const { data: profiles, error } = await getAllProfiles()

  container.innerHTML = `
    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; color: var(--text-main);">Colegas</h1>
      <p>Veja os outros alunos e membros do SGE.</p>
    </header>

    <div id="profiles-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
      ${error ? `<p style="color:red">Erro ao carregar lista: ${error.message}</p>` : ''}
      ${profiles?.map(p => `
        <div class="profile-card">
          <div class="avatar-circle">
            ${p.nome_completo ? p.nome_completo.charAt(0).toUpperCase() : '?'}
          </div>
          <div>
            <div style="font-weight: 600; font-size: 1rem; margin-bottom: 4px;">${p.nome_completo}</div>
            <span class="badge" style="font-size: 0.6rem;">${p.perfil}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `

  return container
}
