import { logout, getUserProfile, getAllProfiles } from '../auth/session'
import { ProfileView } from './profile'
import { DirectoryView } from './directory'
import { DocumentsView } from './documents'
import { SecretariaView } from './secretaria'
import { GestaoTurmasView } from './gestao-turmas'
import { MatrizView } from './matriz'
import { ProfessorTurmasView } from './professor-turmas'
import { ProfessorAlunosView } from './professor-alunos'
import { ProfessorRegistrarAulaView } from './professor-registrar-aula'
import { DocumentsService } from '../lib/documents-service'
import { supabase } from '../lib/supabase'
import { escapeHTML, createBadge } from '../lib/security'

export async function DashboardView(session, subPath = '/') {
  const container = document.createElement('div')
  container.className = 'dashboard-layout'

  // Fetch profile data
  const { data: profile, error } = await getUserProfile(session.user.id)

  const userName = profile?.nome_completo || 'Usuário'
  const userRole = profile?.perfil || 'aluno'
  const isAdmin = userRole === 'admin' || userRole === 'secretaria'
  const isProfessor = userRole === 'professor'

  container.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-brand" style="border-bottom: 2px solid var(--accent); padding-bottom: 1rem;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
        <span>Secretaria CSM</span>
      </div>

      <nav style="flex: 1;">
        <a href="#/dashboard" class="nav-item ${subPath === '/' ? 'active' : ''}" style="text-decoration: none; color: inherit;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Início
        </a>
        <a href="#/dashboard/documentos" class="nav-item ${subPath === '/documentos' ? 'active' : ''}" style="text-decoration: none; color: inherit;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Documentos
        </a>
        ${!isAdmin && userRole === 'aluno' ? '' : `
        <a href="#/dashboard/usuarios" class="nav-item ${subPath === '/usuarios' ? 'active' : ''}" style="text-decoration: none; color: inherit;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Usuários
        </a>
        `}
        <a href="#/dashboard/matriz" class="nav-item ${subPath === '/matriz' ? 'active' : ''}" style="text-decoration: none; color: inherit;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          Matriz Curricular
        </a>
        ${isAdmin ? `
          <a href="#/dashboard/secretaria" class="nav-item ${subPath === '/secretaria' ? 'active' : ''}" style="text-decoration: none; color: inherit; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 10px; padding-top: 20px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7h-9m3 3H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            Painel Secretaria
          </a>
          <a href="#/dashboard/turmas" class="nav-item ${subPath === '/turmas' ? 'active' : ''}" style="text-decoration: none; color: inherit;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Gestão de Turmas
          </a>
        ` : ''}
        ${isProfessor ? `
          <a href="#/dashboard/professor/turmas" class="nav-item ${subPath.startsWith('/professor/turmas') ? 'active' : ''}" style="text-decoration: none; color: inherit; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 10px; padding-top: 20px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Minhas Turmas
          </a>
          <a href="#/dashboard/professor/alunos" class="nav-item ${subPath.startsWith('/professor/alunos') ? 'active' : ''}" style="text-decoration: none; color: inherit;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Meus Alunos
          </a>
          <a href="#/dashboard/professor/aulas" class="nav-item ${subPath.startsWith('/professor/aulas') ? 'active' : ''}" style="text-decoration: none; color: inherit;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Registrar Aula
          </a>
        ` : ''}
        <a href="#/dashboard/perfil" class="nav-item ${subPath === '/perfil' ? 'active' : ''}" style="text-decoration: none; color: inherit; margin-top: auto;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Meus Dados
        </a>
        <a href="apresentacao_treinamento.html" target="_blank" class="nav-item" style="text-decoration: none; color: inherit; background: var(--accent); color: var(--text-main); margin-top: 0.5rem; font-weight: 600;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          📚 Treinamento
        </a>
      </nav>

      <div class="sidebar-user">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; color: white;">
            ${escapeHTML(userName.charAt(0).toUpperCase())}
          </div>
          <div>
            <div class="user-name">${escapeHTML(userName)}</div>
            <div class="user-role">${createBadge(userRole)}</div>
          </div>
        </div>
        <button id="logout-btn" class="btn" style="background: rgba(255,255,255,0.1); color: white; width: 100%; font-size: 0.8rem; padding: 0.5rem;">
          Sair do Sistema
        </button>
      </div>
    </aside>

    <main class="main-content" id="dashboard-content">
      <!-- Inner View Loaded Here -->
    </main>
  `

  const contentArea = container.querySelector('#dashboard-content')

  // Internal view router
  if (subPath === '/perfil') {
    contentArea.appendChild(await ProfileView(profile))
  } else if (subPath === '/usuarios') {
    contentArea.appendChild(await DirectoryView())
  } else if (subPath === '/documentos') {
    contentArea.appendChild(await DocumentsView(profile))
  } else if (subPath === '/secretaria' && isAdmin) {
    contentArea.appendChild(await SecretariaView())
  } else if (subPath === '/turmas' && isAdmin) {
    contentArea.appendChild(await GestaoTurmasView())
  } else if (subPath === '/matriz') {
    contentArea.appendChild(await MatrizView())
  } else if (subPath === '/professor/turmas' && isProfessor) {
    contentArea.appendChild(await ProfessorTurmasView(profile))
  } else if (subPath === '/professor/alunos' && isProfessor) {
    contentArea.appendChild(await ProfessorAlunosView(profile))
  } else if (subPath === '/professor/aulas' && isProfessor) {
    contentArea.appendChild(await ProfessorRegistrarAulaView(profile))
  } else if (subPath === '/professor') {
    // Redirect to turmas by default
    window.location.hash = '#/dashboard/professor/turmas'
    return
  } else {
    // Default Home with dynamic statistics (Phase 4 suggestion)
    const { data: allProfiles } = await supabase.from('perfis').select('id', { count: 'exact' })
    const { data: myDocs } = await DocumentsService.getMyRequests(profile.id)
    const pendingCount = myDocs?.filter(d => d.status === 'pendente').length || 0

    const firstName = escapeHTML(userName.split(' ')[0])
    const pendingColor = pendingCount > 0 ? 'var(--danger)' : 'var(--success)'

    contentArea.innerHTML = `
      <div class="animate-in">
        <header style="margin-bottom: 2rem;">
          <h1 style="font-size: 2.2rem; color: var(--text-main);">Olá, ${firstName} 👋</h1>
          <p>Visão geral do seu portal de estudante na CSM.</p>
        </header>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
          <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border-left: 5px solid var(--primary);">
            <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 10px;">Colegas Registrados</div>
            <div style="font-size: 2rem; font-weight: 700;">${allProfiles?.length || 0}</div>
          </div>

          <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border-left: 5px solid var(--accent);">
            <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 10px;">Documentos Pendentes</div>
            <div style="font-size: 2rem; font-weight: 700; color: ${pendingColor}">${pendingCount}</div>
          </div>

          <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; justify-content: center; background: linear-gradient(135deg, var(--white) 0%, var(--secondary) 100%);">
            <h4 style="margin-bottom: 5px; color: var(--primary);">Precisa de suporte?</h4>
            <p style="font-size: 0.75rem;">A secretaria atende das 08h às 18h no Campus Central.</p>
          </div>
        </div>

        <div style="margin-top: 3rem; background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
          <h3 style="margin-bottom: 1rem;">Notícias e Avisos</h3>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 15px;">
            <li style="padding-bottom: 15px; border-bottom: 1px solid var(--secondary);">
              <div style="font-weight: 600; font-size: 0.9rem;">Renovação de Matrícula 2026/2</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">As solicitações abrem em 15 de maio. Fique atento.</div>
            </li>
            <li style="padding-bottom: 15px; border-bottom: 1px solid var(--secondary);">
              <div style="font-weight: 600; font-size: 0.9rem;">Palestra: Futuro da Carreira Técnica</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">Auditório A, amanhã às 19h00. Certificado incluso.</div>
            </li>
          </ul>
        </div>
      </div>
    `
  }

  container.querySelector('#logout-btn').addEventListener('click', async () => {
    await logout()
  })

  return container
}
