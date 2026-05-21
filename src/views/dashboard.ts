/**
 * Painel de Controle View - Layout Principal
 *
 * Barra lateral de navegação + Área de conteúdo dinâmico
 */
import { ICONS } from '../lib/icons'
import type { Session, UserProfile } from '../types'
import { logout, getUserProfile, getAllProfiles } from '../auth/session'
import { DashboardHomeView } from './dashboard-home'
import { ProfileView } from './profile'
import { DirectoryView } from './directory'
import { DocumentsView } from './documents'
import { SecretariaView } from './secretaria'
import { GestaoTurmasView } from './gestao-turmas'
import { MatrizView } from './matriz'
import { ProfessorTurmasView } from './professor-turmas'
import { ProfessorAlunosView } from './professor-alunos'
import { ProfessorRegistrarAulaView } from './professor-registrar-aula'
import { FinanceiroView } from './financeiro'
import { ConfiguracoesView } from './configuracoes'
import { AuditLogView } from './audit-log'
import { isAdmin, isSecretaria, isFinanceiro, isProfessor, isAluno, isMasterAdmin, canManageInstituicao, isCoordenacao } from '../lib/authz'
import { DocumentsService } from '../lib/documents-service'
import { supabase } from '../lib/supabase'
import { escapeHTML, createBadge } from '../lib/security'
import { openSearchPalette } from '../components/search-palette'

export async function DashboardView(session: Session, subPath: string = '/'): Promise<HTMLDivElement> {
  const container = document.createElement('div')
  container.className = 'dashboard-layout'

  // Fetch profile data
  console.log('[DashboardView] Fetching profile for ID:', session.user.id)
  const { data: profile, error } = await getUserProfile(session.user.id)
  
  if (error) {
    console.error('[DashboardView] Error fetching profile:', error)
  }
  console.log('[DashboardView] Profile data received:', profile)

  const userName = profile?.nome_completo || 'Usuário'
  const userRole = profile?.perfil || 'aluno'
  console.log('[DashboardView] Determined Role:', userRole)

  // Breadcrumb mapping
  function getBreadcrumbs(p: string): { label: string; href: string; current: boolean }[] {
    const crumbs: { label: string; href: string; current: boolean }[] = [
      { label: 'Início', href: '#/dashboard', current: p === '/' }
    ]
    const map: Record<string, string> = {
      '/documentos': 'Documentos',
      '/usuarios': 'Usuários',
      '/matriz': 'Matriz Curricular',
      '/secretaria': 'Painel Secretaria',
      '/turmas': 'Gestão de Turmas',
      '/configuracoes': 'Configurações',
      '/auditoria': 'Auditoria',
      '/financeiro': 'Financeiro',
      '/perfil': 'Meus Dados',
    }
    const profMap: Record<string, string> = {
      '/professor/turmas': 'Minhas Turmas',
      '/professor/alunos': 'Meus Alunos',
      '/professor/aulas': 'Diários de Aulas',
    }

    if (p.startsWith('/professor/')) {
      crumbs.push({ label: 'Professor', href: '#/dashboard/professor/turmas', current: false })
      const sub = profMap[p]
      if (sub) crumbs.push({ label: sub, href: `#/dashboard${p}`, current: true })
    } else if (map[p]) {
      crumbs.push({ label: map[p], href: `#/dashboard${p}`, current: true })
    }
    return crumbs
  }

  const breadcrumbs = getBreadcrumbs(subPath)
  const breadcrumbHTML = breadcrumbs.map((c, i) => {
    const sep = i > 0 ? '<span class="separator">›</span>' : ''
    if (c.current) return `${sep}<span class="current">${c.label}</span>`
    return `${sep}<a href="${c.href}">${c.label}</a>`
  }).join('')

  // Usando os novos helpers do authz.js
  const _isMasterAdmin = isMasterAdmin(userRole)
  const _isAdmin = isAdmin(userRole)
  const _isSecretaria = isSecretaria(userRole)
  const _isCoordenacao = isCoordenacao(userRole)
  const _isFinanceiro = isFinanceiro(userRole)
  const _isProfessor = isProfessor(userRole)
  const _isAluno = isAluno(userRole)
  const _canManageInstituicao = canManageInstituicao(userRole)

  container.innerHTML = `
    <a href="#painel-controle-conteudo" class="skip-link">Pular para o conteúdo</a>

    <aside class="sidebar" role="navigation" aria-label="Navegação principal">
      <div class="sidebar-brand" style="border-bottom: 2px solid var(--accent); padding-bottom: 1rem;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
        <span>Secretaria CSM</span>
        <button id="sidebar-toggle" title="Recolher sidebar" aria-label="Recolher ou expandir sidebar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      </div>

      <nav style="flex: 1;" aria-label="Seções do sistema">
        <a href="#/dashboard" class="nav-item ${subPath === '/' ? 'active' : ''}" style="text-decoration: none; color: inherit;" title="Início" ${subPath === '/' ? 'aria-current="page"' : ''}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span class="nav-label">Início</span>
        </a>
        <a href="#/dashboard/documentos" class="nav-item ${subPath === '/documentos' ? 'active' : ''}" style="text-decoration: none; color: inherit;" title="Documentos" ${subPath === '/documentos' ? 'aria-current="page"' : ''}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span class="nav-label">Documentos</span>
        </a>
        ${_isAluno ? '' : `
        <a href="#/dashboard/usuarios" class="nav-item ${subPath === '/usuarios' ? 'active' : ''}" style="text-decoration: none; color: inherit;" title="Usuários" ${subPath === '/usuarios' ? 'aria-current="page"' : ''}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span class="nav-label">Usuários</span>
        </a>
        `}
        <a href="#/dashboard/matriz" class="nav-item ${subPath === '/matriz' ? 'active' : ''}" style="text-decoration: none; color: inherit;" title="Matriz Curricular" ${subPath === '/matriz' ? 'aria-current="page"' : ''}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          <span class="nav-label">Matriz Curricular</span>
        </a>
        ${_isAdmin || _isSecretaria || _isCoordenacao ? `
          <a href="#/dashboard/secretaria" class="nav-item ${subPath === '/secretaria' ? 'active' : ''}" style="text-decoration: none; color: inherit; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 10px; padding-top: 20px;" title="Painel Secretaria" ${subPath === '/secretaria' ? 'aria-current="page"' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 7h-9m3 3H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            <span class="nav-label">Painel Secretaria</span>
          </a>
          <a href="#/dashboard/turmas" class="nav-item ${subPath === '/turmas' ? 'active' : ''}" style="text-decoration: none; color: inherit;" title="Gestão de Turmas" ${subPath === '/turmas' ? 'aria-current="page"' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span class="nav-label">Gestão de Turmas</span>
          </a>
        ` : ''}
        ${_canManageInstituicao ? `
          <a href="#/dashboard/configuracoes" class="nav-item ${subPath === '/configuracoes' ? 'active' : ''}" style="text-decoration: none; color: inherit; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 10px; padding-top: 20px;" title="Configurações" ${subPath === '/configuracoes' ? 'aria-current="page"' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
            <span class="nav-label">Configurações</span>
          </a>
        ` : ''}
        ${_isAdmin ? `
          <a href="#/dashboard/auditoria" class="nav-item ${subPath === '/auditoria' ? 'active' : ''}" style="text-decoration: none; color: inherit;" title="Auditoria" ${subPath === '/auditoria' ? 'aria-current="page"' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span class="nav-label">Auditoria</span>
          </a>
        ` : ''}
        ${_isFinanceiro || _isAdmin ? `
          <a href="#/dashboard/financeiro" class="nav-item ${subPath === '/financeiro' ? 'active' : ''}" style="text-decoration: none; color: inherit;" title="Financeiro" ${subPath === '/financeiro' ? 'aria-current="page"' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span class="nav-label">Financeiro</span>
          </a>
        ` : ''}
        ${_isProfessor ? `
          <a href="#/dashboard/professor/turmas" class="nav-item ${subPath.startsWith('/professor/turmas') ? 'active' : ''}" style="text-decoration: none; color: inherit; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 10px; padding-top: 20px;" title="Minhas Turmas" ${subPath.startsWith('/professor/turmas') ? 'aria-current="page"' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span class="nav-label">Minhas Turmas</span>
          </a>
          <a href="#/dashboard/professor/alunos" class="nav-item ${subPath.startsWith('/professor/alunos') ? 'active' : ''}" style="text-decoration: none; color: inherit;" title="Meus Alunos" ${subPath.startsWith('/professor/alunos') ? 'aria-current="page"' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span class="nav-label">Meus Alunos</span>
          </a>
          <a href="#/dashboard/professor/aulas" class="nav-item ${subPath.startsWith('/professor/aulas') ? 'active' : ''}" style="text-decoration: none; color: inherit;" title="Diários de Aulas" ${subPath.startsWith('/professor/aulas') ? 'aria-current="page"' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span class="nav-label">Diários de Aulas</span>
          </a>
        ` : ''}
        <a href="#/dashboard/perfil" class="nav-item ${subPath === '/perfil' ? 'active' : ''}" style="text-decoration: none; color: inherit; margin-top: auto;" title="Meus Dados" ${subPath === '/perfil' ? 'aria-current="page"' : ''}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span class="nav-label">Meus Dados</span>
        </a>
        <div class="nav-label" style="margin-top: 0.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.5); padding: 0 15px;">Treinamento</div>
        <div id="btn-treinamento-slide-sidebar" class="nav-item" style="text-decoration: none; color: inherit; background: var(--accent); color: var(--primary); margin-top: 0.25rem; font-weight: 700; cursor: pointer; font-size: 0.85rem; border-radius: 8px;" title="Treinamento" role="button" tabindex="0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          <span class="nav-label">Treinamento (Slides)</span>
        </div>
      </nav>

      <div class="sidebar-user" aria-label="Informações do usuário">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; color: white;" aria-hidden="true">
            ${escapeHTML(userName.charAt(0).toUpperCase())}
          </div>
          <div>
            <div class="user-name">${escapeHTML(userName)}</div>
            <div class="user-role">${createBadge(userRole)}</div>
          </div>
        </div>
        <button id="logout-btn" class="btn" style="background: rgba(255,255,255,0.1); color: white; width: 100%; font-size: 0.8rem; padding: 0.5rem;" aria-label="Sair do sistema">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px;vertical-align:middle;" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span>Sair do Sistema</span>
        </button>
      </div>
    </aside>

    <main class="main-content" id="painel-controle-conteudo">
      <div class="top-header">
        <div class="top-header-left">
          <div class="breadcrumbs">${breadcrumbHTML}</div>
        </div>
        <div class="top-header-right">
          <button id="header-search-btn" class="header-btn" title="Buscar (Cmd+K)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
          <button id="header-notification-btn" class="header-btn" title="Notificações">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span class="badge-dot"></span>
          </button>
          <button id="header-theme-toggle" class="header-btn" title="Alternar tema">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>
          <a href="#/dashboard/perfil" class="header-profile" style="text-decoration: none;">
            <div class="avatar">${escapeHTML(userName.charAt(0).toUpperCase())}</div>
            <span class="name">${escapeHTML(userName)}</span>
          </a>
        </div>
      </div>
      <div id="painel-controle-conteudo">
        <!-- Inner View Loaded Here -->
      </div>
    </main>

    <!-- BLOQUEIO DE TROCA DE SENHA OBRIGATÓRIA -->
    <div id="modal-troca-obrigatoria" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--primary); z-index: 10000; justify-content: center; align-items: center; color: white;">
      <div style="max-width: 450px; width: 90%; text-align: center; background: rgba(255,255,255,0.1); padding: 3rem; border-radius: 20px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
        <div style="font-size: 3rem; margin-bottom: 1.5rem;">${ICONS.lock}</div>
        <h2 style="margin-bottom: 1rem;">Segurança em Primeiro Lugar</h2>
        <p style="margin-bottom: 2rem; opacity: 0.9; line-height: 1.6;">
          Sua senha foi resetada pela administração. Para sua segurança, é **obrigatório** criar uma nova senha personalizada para continuar.
        </p>

        <form id="form-troca-obrigatoria" style="text-align: left;">
          <div class="form-group">
            <label class="label" style="color: var(--accent);">Nova Senha (8+ caracteres, letras e números)</label>
            <input type="password" id="obrigatoria-nova" class="input" placeholder="Sua nova senha" required style="background: white; color: black; border: none;">
          </div>
          <div class="form-group">
            <label class="label" style="color: var(--accent);">Confirmar Nova Senha</label>
            <input type="password" id="obrigatoria-confirma" class="input" placeholder="Confirme a senha" required style="background: white; color: black; border: none;">
          </div>
          <button type="submit" class="btn" style="width: 100%; height: 50px; background: var(--accent); color: var(--primary); font-weight: 800; font-size: 1rem; border-radius: 12px; margin-top: 1rem;">
            DEFINIR NOVA SENHA E ENTRAR
          </button>
        </form>
        <p style="margin-top: 1.5rem; font-size: 0.8rem; opacity: 0.6;">SGE - Colégio Santa Mônica</p>
      </div>
    </div>
  `

  const contentArea = container.querySelector<HTMLDivElement>('#painel-controle-conteudo')!
  const modalTroca = container.querySelector<HTMLDivElement>('#modal-troca-obrigatoria')!

  // VERIFICAR TROCA OBRIGATÓRIA (metadata opcional do Supabase)
  const userMeta = session.user?.user_metadata as { force_password_change?: boolean } | undefined
  const needsPasswordChange = userMeta?.force_password_change === true
  if (needsPasswordChange) {
    modalTroca.style.display = 'flex'
  }

  // Internal view router
  if (subPath === '/perfil') {
    contentArea.appendChild(await ProfileView(profile as UserProfile))
  } else if (subPath === '/usuarios') {
    contentArea.appendChild(await DirectoryView())
  } else if (subPath === '/documentos') {
    contentArea.appendChild(await DocumentsView(profile))
  } else if (subPath === '/matriz') {
    contentArea.appendChild(await MatrizView())
  } else if (subPath === '/configuracoes' && _canManageInstituicao) {
    contentArea.appendChild(await ConfiguracoesView())
  } else if (subPath === '/auditoria' && _isAdmin) {
    contentArea.appendChild(await AuditLogView())
  } else if (subPath === '/financeiro' && (_isFinanceiro || _isAdmin)) {
    contentArea.appendChild(await FinanceiroView())
  } else if (subPath === '/secretaria' && (_isAdmin || _isSecretaria || _isCoordenacao)) {
    contentArea.appendChild(await SecretariaView())
  } else if (subPath === '/turmas' && (_isAdmin || _isSecretaria || _isCoordenacao)) {
    contentArea.appendChild(await GestaoTurmasView({ id: profile?.id || '', perfil: userRole as any }))
  } else if (subPath === '/professor/turmas' && _isProfessor) {
    contentArea.appendChild(await ProfessorTurmasView(profile as UserProfile))
  } else if (subPath === '/professor/alunos' && _isProfessor) {
    contentArea.appendChild(await ProfessorAlunosView(profile as UserProfile))
  } else if (subPath === '/professor/aulas' && _isProfessor) {
    contentArea.appendChild(await ProfessorRegistrarAulaView(profile as UserProfile))
  } else if (subPath === '/professor') {
    // Redirect to turmas by default
    window.location.hash = '#/dashboard/professor/turmas'
    return container
  } else {
    contentArea.appendChild(await DashboardHomeView(profile as UserProfile, session))
  }

  const logoutBtn = container.querySelector<HTMLButtonElement>('#logout-btn')
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await logout()
    })
  }

  // Sidebar collapse toggle
  const sidebarToggle = container.querySelector<HTMLButtonElement>('#sidebar-toggle')
  const sidebar = container.querySelector<HTMLElement>('.sidebar')
  const layout = container.querySelector<HTMLElement>('.dashboard-layout')
  if (sidebarToggle && sidebar && layout) {
    const stored = localStorage.getItem('sidebar_collapsed')
    if (stored === 'true') {
      sidebar.classList.add('collapsed')
      layout.classList.add('sidebar-collapsed')
    }
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed')
      layout.classList.toggle('sidebar-collapsed')
      localStorage.setItem('sidebar_collapsed', String(sidebar.classList.contains('collapsed')))
    })
  }

  // Search palette
  const searchBtn = container.querySelector<HTMLButtonElement>('#header-search-btn')
  if (searchBtn) {
    searchBtn.addEventListener('click', () => openSearchPalette())
  }

  if (!(window as any).__searchShortcutRegistered) {
    (window as any).__searchShortcutRegistered = true
    window.addEventListener('keydown', function searchShortcut(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        openSearchPalette()
      }
    })
  }

  // Theme toggle event listener
  const themeToggle = container.querySelector<HTMLButtonElement>('#header-theme-toggle')
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark')
      localStorage.setItem('theme', isDark ? 'dark' : 'light')
    })
  }

  // Training button event listener
  const btnTreinamento = container.querySelector<HTMLDivElement>('#btn-treinamento-slide-sidebar')
  if (btnTreinamento) {
    btnTreinamento.addEventListener('click', (e: Event) => {
      e.preventDefault();
      let baseUrl = window.location.href.split('#')[0].replace('index.html', '');
      if (!baseUrl.endsWith('/')) baseUrl += '/';
      window.open(baseUrl + 'apresentacao_treinamento.html', '_blank')
    })
  }

  // Lógica da Troca Obrigatória
  const formTroca = container.querySelector<HTMLFormElement>('#form-troca-obrigatoria')
  if (formTroca) {
    formTroca.onsubmit = async (e: Event) => {
      e.preventDefault()
      const novaInput = container.querySelector<HTMLInputElement>('#obrigatoria-nova')!
      const confirmaInput = container.querySelector<HTMLInputElement>('#obrigatoria-confirma')!
      const nova = novaInput.value
      const confirma = confirmaInput.value

      if (nova !== confirma) {
        return alert('As senhas não coincidem.')
      }

      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
      if (!passwordRegex.test(nova)) {
        return alert('Senha muito fraca! Use 8+ caracteres com letras e números.')
      }

      if (nova === 'csm1983#') {
        return alert('Você não pode usar a senha padrão. Escolha uma nova senha pessoal.')
      }

      const btn = formTroca.querySelector<HTMLButtonElement>('button')!
      btn.disabled = true
      btn.textContent = 'Salvando...'

      // Atualizar senha e remover flag de troca obrigatória
      const { error } = await supabase.auth.updateUser({
        password: nova,
        data: { force_password_change: false }
      })

      if (error) {
        alert('Erro ao atualizar: ' + error.message)
        btn.disabled = false
        btn.textContent = 'DEFINIR NOVA SENHA E ENTRAR'
      } else {
        alert('Senha definida com sucesso! Bem-vindo ao portal.')
        modalTroca.style.display = 'none'
        // Atualizar a sessão local para refletir a mudança de metadata
        window.location.reload()
      }
    }
  }

  return container
}
