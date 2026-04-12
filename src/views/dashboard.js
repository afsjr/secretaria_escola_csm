/**
 * Painel de Controle View - Layout Principal
 *
 * Barra lateral de navegação + Área de conteúdo dinâmico
 */
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
import { FinanceiroView } from './financeiro'
import { ConfiguracoesView } from './configuracoes'
import { AuditLogView } from './audit-log'
import { isAdmin, isSecretaria, isFinanceiro, isProfessor, isAluno, isMasterAdmin, canManageInstituicao } from '../lib/authz'
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

  // Usando os novos helpers do authz.js
  const _isMasterAdmin = isMasterAdmin(userRole)
  const _isAdmin = isAdmin(userRole)
  const _isSecretaria = isSecretaria(userRole)
  const _isFinanceiro = isFinanceiro(userRole)
  const _isProfessor = isProfessor(userRole)
  const _isAluno = isAluno(userRole)
  const _canManageInstituicao = canManageInstituicao(userRole)

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
        ${_isAluno ? '' : `
        <a href="#/dashboard/usuarios" class="nav-item ${subPath === '/usuarios' ? 'active' : ''}" style="text-decoration: none; color: inherit;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Usuários
        </a>
        `}
        <a href="#/dashboard/matriz" class="nav-item ${subPath === '/matriz' ? 'active' : ''}" style="text-decoration: none; color: inherit;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          Matriz Curricular
        </a>
        ${_isAdmin || _isSecretaria ? `
          <a href="#/dashboard/secretaria" class="nav-item ${subPath === '/secretaria' ? 'active' : ''}" style="text-decoration: none; color: inherit; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 10px; padding-top: 20px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7h-9m3 3H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            Painel Secretaria
          </a>
          <a href="#/dashboard/turmas" class="nav-item ${subPath === '/turmas' ? 'active' : ''}" style="text-decoration: none; color: inherit;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Gestão de Turmas
          </a>
        ` : ''}
        ${_canManageInstituicao ? `
          <a href="#/dashboard/configuracoes" class="nav-item ${subPath === '/configuracoes' ? 'active' : ''}" style="text-decoration: none; color: inherit; border-top: 1px solid rgba(255,255,255,0.1); margin-top: 10px; padding-top: 20px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
            Configurações
          </a>
        ` : ''}
        ${_isAdmin ? `
          <a href="#/dashboard/auditoria" class="nav-item ${subPath === '/auditoria' ? 'active' : ''}" style="text-decoration: none; color: inherit;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Auditoria
          </a>
        ` : ''}
        ${_isFinanceiro || _isAdmin ? `
          <a href="#/dashboard/financeiro" class="nav-item ${subPath === '/financeiro' ? 'active' : ''}" style="text-decoration: none; color: inherit;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Financeiro
          </a>
        ` : ''}
        ${_isProfessor ? `
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
        <div style="margin-top: 0.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.5); padding: 0 15px;">Treinamento</div>
        <div id="btn-treinamento-slide-sidebar" class="nav-item" style="text-decoration: none; color: inherit; background: var(--accent); color: var(--primary); margin-top: 0.25rem; font-weight: 700; cursor: pointer; font-size: 0.85rem; border-radius: 8px;">
          📺 Treinamento (Slides)
        </div>
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

    <main class="main-content" id="painel-controle-conteudo">
      <!-- Inner View Loaded Here -->
    </main>

    <!-- BLOQUEIO DE TROCA DE SENHA OBRIGATÓRIA -->
    <div id="modal-troca-obrigatoria" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--primary); z-index: 10000; justify-content: center; align-items: center; color: white;">
      <div style="max-width: 450px; width: 90%; text-align: center; background: rgba(255,255,255,0.1); padding: 3rem; border-radius: 20px; backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
        <div style="font-size: 3rem; margin-bottom: 1.5rem;">🔐</div>
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

  const contentArea = container.querySelector('#painel-controle-conteudo')
  const modalTroca = container.querySelector('#modal-troca-obrigatoria')

  // VERIFICAR TROCA OBRIGATÓRIA
  const needsPasswordChange = session.user?.user_metadata?.force_password_change === true
  if (needsPasswordChange) {
    modalTroca.style.display = 'flex'
  }

  // Internal view router
  if (subPath === '/perfil') {
    contentArea.appendChild(await ProfileView(profile))
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
  } else if (subPath === '/secretaria' && (_isAdmin || _isSecretaria)) {
    contentArea.appendChild(await SecretariaView())
  } else if (subPath === '/turmas' && (_isAdmin || _isSecretaria)) {
    contentArea.appendChild(await GestaoTurmasView())
  } else if (subPath === '/professor/turmas' && _isProfessor) {
    contentArea.appendChild(await ProfessorTurmasView(profile))
  } else if (subPath === '/professor/alunos' && _isProfessor) {
    contentArea.appendChild(await ProfessorAlunosView(profile))
  } else if (subPath === '/professor/aulas' && _isProfessor) {
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
          <p>Seja bem-vindo(a) ao Portal Oficial CSM.</p>
        </header>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
          <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border-left: 5px solid var(--primary);">
            <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 10px;">Membros no SGE</div>
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

  // Training button event listener
  const btnTreinamentoSlide = container.querySelector('#btn-treinamento-slide-sidebar')
  if (btnTreinamentoSlide) {
    btnTreinamentoSlide.addEventListener('click', (e) => {
      e.preventDefault();
      let baseUrl = window.location.href.split('#')[0].replace('index.html', '');
      if (!baseUrl.endsWith('/')) baseUrl += '/';
      window.open(baseUrl + 'apresentacao_treinamento_slides.html', '_blank')
    })
  }

  // Lógica da Troca Obrigatória
  const formTroca = container.querySelector('#form-troca-obrigatoria')
  if (formTroca) {
    formTroca.onsubmit = async (e) => {
      e.preventDefault()
      const nova = container.querySelector('#obrigatoria-nova').value
      const confirma = container.querySelector('#obrigatoria-confirma').value

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

      const btn = formTroca.querySelector('button')
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
