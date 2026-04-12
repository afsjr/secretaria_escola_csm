import { getAllProfiles } from '../auth/session'
import { escapeHTML, createBadge } from '../lib/security'
import { AdminService } from '../lib/admin-service'
import { toast } from '../lib/toast'

// Order of presentation for tech hunters: Alunos → Professores → Secretaria → Admin
const PROFILE_ORDER = ['aluno', 'professor', 'secretaria', 'admin']

const PROFILE_LABELS = {
  aluno: '👨‍🎓 Alunos',
  professor: '👨‍🏫 Professores',
  secretaria: '🏢 Secretaria',
  admin: '🔒 Administradores'
}

const PROFILE_COLORS = {
  aluno: '#3B82F6',       // blue-500
  professor: '#10B981',    // emerald-500
  secretaria: '#F59E0B',   // amber-500
  admin: '#8B5CF6'         // violet-500
}

function renderProfileCard(p) {
  const nome = escapeHTML(p.nome_completo)
  const perfil = escapeHTML(p.perfil)
  const isTargetAdmin = p.perfil === 'admin'
  const accentColor = PROFILE_COLORS[p.perfil] || '#6B7280'

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.9rem 1.2rem; background: white; border-left: 4px solid ${accentColor}; gap: 1rem; transition: all 0.15s ease;"
         onmouseover="this.style.background='var(--secondary)'"
         onmouseout="this.style.background='white'">
      <div style="flex: 1;">
        <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-main);">
          ${nome}
          ${isTargetAdmin ? '<span style="font-size: 0.65rem; color: var(--primary); font-weight: 800; margin-left: 6px; letter-spacing: 0.5px;">[ADM]</span>' : ''}
        </div>
      </div>
      <div>
        ${isTargetAdmin ?
      '<span style="font-size: 0.7rem; color: var(--text-muted); font-style: italic;">🔒 Acesso Restrito</span>' :
      `<button class="btn-reset-password" data-id="${p.id}" data-nome="${nome}" style="background: var(--secondary); color: var(--text-main); font-size: 0.75rem; padding: 0.4rem 0.8rem; border-radius: 4px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); transition: all 0.15s ease;">
            🔄 Resetar Senha
          </button>`
    }
      </div>
    </div>
  `
}

function renderProfileSection(profiles, perfilType) {
  const filtered = profiles.filter(p => p.perfil === perfilType)
  if (filtered.length === 0) return ''

  const label = PROFILE_LABELS[perfilType] || perfilType
  const accentColor = PROFILE_COLORS[perfilType] || '#6B7280'
  const cards = filtered
    .sort((a, b) => (a.nome_completo || '').localeCompare(b.nome_completo || ''))
    .map(p => renderProfileCard(p))
    .join('')

  return `
    <section style="margin-bottom: 2rem;">
      <header style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.8rem; padding-bottom: 0.5rem; border-bottom: 2px solid ${accentColor}20;">
        <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin: 0;">${label}</h2>
        <span style="background: ${accentColor}15; color: ${accentColor}; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 12px;">
          ${filtered.length}
        </span>
      </header>
      <div style="background: white; border-radius: 8px; box-shadow: var(--shadow-sm); overflow: hidden;">
        ${cards}
      </div>
    </section>
  `
}

export async function DirectoryView() {
  const container = document.createElement('div')
  container.className = 'directory-view animate-in'

  const { data: profiles, error } = await getAllProfiles()

  let bodyHTML = ''

  if (error) {
    bodyHTML = `<p style="color: var(--danger); padding: 1.5rem; background: white; border-radius: 8px;">
      ⚠️ Erro ao carregar lista: ${escapeHTML(error.message)}
    </p>`
  } else {
    // Group by profile type in the defined order: Alunos → Professores → Secretaria → Admin
    bodyHTML = PROFILE_ORDER
      .map(type => renderProfileSection(profiles, type))
      .filter(Boolean)
      .join('')
  }

  const totalUsers = profiles?.length || 0

  container.innerHTML = `
    <header style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h1 style="font-size: 2rem; color: var(--text-main);">Usuários do Sistema</h1>
        <p style="color: var(--text-muted);">Organizados por perfil de acesso.</p>
      </div>
      <div style="background: white; padding: 0.5rem 1rem; border-radius: 8px; box-shadow: var(--shadow-sm); font-size: 0.85rem; font-weight: 600; color: var(--text-main);">
        👥 Total: ${totalUsers}
      </div>
    </header>

    <div id="profiles-list">
      ${bodyHTML}
    </div>
  `

  // Lógica de Reset
  container.querySelectorAll('.btn-reset-password').forEach(btn => {
    btn.onclick = async () => {
      const { id, nome } = btn.dataset

      if (confirm(`Deseja resetar a senha de ${nome} para csm1983#?\n\nO usuário será obrigado a trocar a senha no próximo acesso.`)) {
        btn.disabled = true
        btn.textContent = '⏳ Processando...'

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
          btn.style.pointerEvents = 'none'
        }
      }
    }
  })

  return container
}
