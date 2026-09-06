import { supabase } from '../lib/supabase'
import { DocumentsService } from '../lib/documents-service'
import { AdminService } from '../lib/admin-service'
import { ProfessorService } from '../lib/professor-service'
import { CourseService } from '../lib/course-service'
import { AcademicService } from '../lib/academic-service'
import { toast } from '../lib/toast'
import { RequestTableComponent } from '../components/RequestTable'
import { CadastroAlunoTab } from '../components/Tabs/CadastroAlunoTab'
import { CadastroProfessorTab } from '../components/Tabs/CadastroProfessorTab'
import { GerenciarAlunosTab } from '../components/Tabs/GerenciarAlunosTab'
import { GerenciarProfessoresTab } from '../components/Tabs/GerenciarProfessoresTab'
import { GerenciarCursosTab } from '../components/Tabs/GerenciarCursosTab'
import { GerenciarCertificadosTab } from '../components/Tabs/GerenciarCertificadosTab'
import { NotasEstagioTab } from '../components/Tabs/NotasEstagioTab'
import { OverviewTab } from '../components/Tabs/OverviewTab'
import { DiarioClasseTab } from '../components/Tabs/DiarioClasseTab'
import { DocumentosTab } from '../components/Tabs/DocumentosTab'
import { ICONS } from '../lib/icons'

export async function SecretariaView(profile?: { id: string; perfil: string }): Promise<HTMLDivElement> {
  const container = document.createElement('div')
  container.className = 'secretaria-view animate-in'

  // 1. Carga de Dados Inicial
  const [
    turmasResult,
    alunosResult,
    professoresResult,
    matrizResult,
    cursosResult,
    requestsResult
  ] = await Promise.all([
    AcademicService.getTurmas(),
    AdminService.listAlunos(),
    ProfessorService.getProfessores(),
    // Agora buscamos as disciplinas do catálogo (matriz) de todos os cursos
    supabase.from('disciplinas_base').select('*'),
    CourseService.getCursos(),
    DocumentsService.getAllOpenRequests()
  ])

  const turmas = turmasResult.data || []
  const alunos = alunosResult.data || []
  const professores = professoresResult.data || []
  const disciplinas = (matrizResult as any).data || []
  const cursos = cursosResult.data || []
  const requests = requestsResult.data || []

  // 2. Estrutura Base
  container.innerHTML = `
    <header class="view-header" style="display: flex; align-items: center; gap: 1.25rem; background: var(--white); padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 2rem; border-left: 5px solid var(--primary); box-shadow: var(--shadow-sm);">
      <div class="icon-box icon-box-xl" style="background: var(--secondary); color: var(--primary); border-radius: var(--radius-lg); font-size: 2rem;">${ICONS.school}</div>
      <div>
        <h1 class="title" style="margin: 0; font-weight: 800; font-size: 1.6rem; color: var(--text-main);">Painel da Secretaria</h1>
        <p class="subtitle" style="margin: 0.2rem 0 0 0; font-size: 0.95rem; color: var(--text-muted);">Gestão técnica modularizada e monitoramento em tempo real.</p>
      </div>
    </header>

    <div class="tabs-wrapper">
      <button class="tabs-scroll-arrow tabs-scroll-arrow--left" id="tab-arrow-left" aria-label="Rolar abas para esquerda" title="Mais abas à esquerda">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
      </button>

      <div class="tabs-container" role="tablist" aria-label="Seções do painel da secretaria">
        <button class="tab-btn active" data-tab="overview" role="tab" aria-selected="true" aria-controls="tab-overview" id="tab-btn-overview">Visão Geral</button>
        <button class="tab-btn" data-tab="solicitacoes" role="tab" aria-selected="false" aria-controls="tab-solicitacoes" id="tab-btn-solicitacoes">Solicitações</button>
        <button class="tab-btn" data-tab="notas" role="tab" aria-selected="false" aria-controls="tab-notas" id="tab-btn-notas">Notas/Estágio</button>
        <button class="tab-btn" data-tab="cadastro" role="tab" aria-selected="false" aria-controls="tab-cadastro" id="tab-btn-cadastro">Cadastrar Aluno</button>
        <button class="tab-btn" data-tab="gerenciar" role="tab" aria-selected="false" aria-controls="tab-gerenciar" id="tab-btn-gerenciar">Gerenciar Alunos</button>
        <button class="tab-btn" data-tab="cadastro-professor" role="tab" aria-selected="false" aria-controls="tab-cadastro-professor" id="tab-btn-cadastro-professor">Cadastrar Professor</button>
        <button class="tab-btn" data-tab="gerenciar-professores" role="tab" aria-selected="false" aria-controls="tab-gerenciar-professores" id="tab-btn-gerenciar-professores">Gerenciar Professores</button>
        <button class="tab-btn" data-tab="gerenciar-cursos" role="tab" aria-selected="false" aria-controls="tab-gerenciar-cursos" id="tab-btn-gerenciar-cursos">Gerenciar Cursos</button>
        <button class="tab-btn" data-tab="certificados" role="tab" aria-selected="false" aria-controls="tab-certificados" id="tab-btn-certificados">Certificados</button>
        <button class="tab-btn" data-tab="diario-classe" role="tab" aria-selected="false" aria-controls="tab-diario-classe" id="tab-btn-diario-classe">Diário de Classe</button>
        <button class="tab-btn" data-tab="documentos" role="tab" aria-selected="false" aria-controls="tab-documentos" id="tab-btn-documentos">Documentos</button>
      </div>

      <button class="tabs-scroll-arrow tabs-scroll-arrow--right" id="tab-arrow-right" aria-label="Rolar abas para direita" title="Mais abas à direita">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>

    <div id="tab-overview" class="tab-content" role="tabpanel" aria-labelledby="tab-btn-overview"></div>
    <div id="tab-solicitacoes" class="tab-content" role="tabpanel" aria-labelledby="tab-btn-solicitacoes" style="display: none;"></div>
    <div id="tab-notas" class="tab-content" role="tabpanel" aria-labelledby="tab-btn-notas" style="display: none;"></div>
    <div id="tab-cadastro" class="tab-content" role="tabpanel" aria-labelledby="tab-btn-cadastro" style="display: none;"></div>
    <div id="tab-gerenciar" class="tab-content" role="tabpanel" aria-labelledby="tab-btn-gerenciar" style="display: none;"></div>
    <div id="tab-cadastro-professor" class="tab-content" role="tabpanel" aria-labelledby="tab-btn-cadastro-professor" style="display: none;"></div>
    <div id="tab-gerenciar-professores" class="tab-content" role="tabpanel" aria-labelledby="tab-btn-gerenciar-professores" style="display: none;"></div>
    <div id="tab-gerenciar-cursos" class="tab-content" role="tabpanel" aria-labelledby="tab-btn-gerenciar-cursos" style="display: none;"></div>
    <div id="tab-certificados" class="tab-content" role="tabpanel" aria-labelledby="tab-btn-certificados" style="display: none;"></div>
    <div id="tab-diario-classe" class="tab-content" role="tabpanel" aria-labelledby="tab-btn-diario-classe" style="display: none;"></div>
    <div id="tab-documentos" class="tab-content" role="tabpanel" aria-labelledby="tab-btn-documentos" style="display: none;"></div>
  `

  // 3. Lógica de Navegação de Abas (com animação fadeInScale)
  const tabBtns = container.querySelectorAll('.tab-btn')
  const tabContents = container.querySelectorAll('.tab-content')

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab')
      tabBtns.forEach(b => {
        b.classList.remove('active')
        b.setAttribute('aria-selected', 'false')
      })
      btn.classList.add('active')
      btn.setAttribute('aria-selected', 'true')
      tabContents.forEach(content => {
        const el = content as HTMLElement
        el.style.display = 'none'
        el.classList.remove('tab-enter')
      })
      const targetTab = container.querySelector(`#tab-${tab}`) as HTMLElement
      if (targetTab) {
        targetTab.style.display = 'block'
        void targetTab.offsetWidth
        targetTab.classList.add('tab-enter')
      }
      // Garante que a aba ativa fica visível no scroll horizontal
      ;(btn as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    })
  })

  // 3b. Lógica das setas de scroll das abas
  const tabsWrapper    = container.querySelector('.tabs-wrapper')    as HTMLElement
  const tabsContainer  = container.querySelector('.tabs-container')  as HTMLElement
  const arrowLeft      = container.querySelector('#tab-arrow-left')  as HTMLButtonElement
  const arrowRight     = container.querySelector('#tab-arrow-right') as HTMLButtonElement

  function updateScrollArrows() {
    if (!tabsContainer || !tabsWrapper) return
    const { scrollLeft, scrollWidth, clientWidth } = tabsContainer
    const hasLeft  = scrollLeft > 4
    const hasRight = scrollLeft + clientWidth < scrollWidth - 4

    arrowLeft?.classList.toggle('visible', hasLeft)
    arrowRight?.classList.toggle('visible', hasRight)
    tabsWrapper.classList.toggle('has-overflow-left',  hasLeft)
    tabsWrapper.classList.toggle('has-overflow-right', hasRight)
  }

  const SCROLL_STEP = 200 // px por clique

  arrowLeft?.addEventListener('click', () => {
    tabsContainer.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' })
  })

  arrowRight?.addEventListener('click', () => {
    tabsContainer.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' })
  })

  tabsContainer?.addEventListener('scroll', updateScrollArrows, { passive: true })

  // Recalcula ao redimensionar a janela
  if (typeof ResizeObserver !== 'undefined' && tabsContainer) {
    const resizeObs = new ResizeObserver(updateScrollArrows)
    resizeObs.observe(tabsContainer)
  }

  // Avaliação inicial (após render)
  requestAnimationFrame(updateScrollArrows)

  // Aba solicitacoes via hash param ?solicitacoes
  if (window.location.hash.includes('?solicitacoes')) {
    const solicitacoesBtn = container.querySelector('[data-tab="solicitacoes"]') as HTMLElement | null
    if (solicitacoesBtn) {
      solicitacoesBtn.click()
      // Clean param from URL
      const cleanHash = window.location.hash.replace(/\?solicitacoes/, '')
      window.history.replaceState(null, '', cleanHash || '#/dashboard/secretaria')
    }
  }

  // 4. Injeção de Componentes Modulares com proteção try/catch
  const inject = (id: string, component: Node) => {
    const el = container.querySelector(id)
    if (!el) { console.warn(`[SecretariaView] Elemento ${id} não encontrado`); return }
    try {
      el.appendChild(component)
    } catch (err) {
      console.error(`[SecretariaView] Erro ao injetar ${id}:`, err)
      el.innerHTML = `<div class="error-text" style="padding:1rem;text-align:center;">Erro ao carregar esta seção.</div>`
    }
  }

  inject('#tab-overview', OverviewTab({
    stats: {
      alunos: alunos.length,
      professores: professores.length,
      turmas: turmas.length,
      solicitacoesPendentes: requests.length
    },
    cursos
  }))

  try {
    const reqComponent = await RequestTableComponent()
    inject('#tab-solicitacoes', reqComponent)
  } catch (err) {
    console.error('[SecretariaView] Erro ao carregar solicitações:', err)
    const el = container.querySelector('#tab-solicitacoes')
    if (el) el.innerHTML = '<div class="error-text" style="padding:1rem;text-align:center;">Erro ao carregar solicitações.</div>'
  }

  inject('#tab-notas', NotasEstagioTab({ turmas }))
  inject('#tab-cadastro', CadastroAlunoTab({ turmas }))
  inject('#tab-gerenciar', GerenciarAlunosTab({
    alunos,
    turmas,
    onRefresh: () => window.location.reload()
  }))
  inject('#tab-cadastro-professor', CadastroProfessorTab())
  inject('#tab-gerenciar-professores', GerenciarProfessoresTab({
    professores,
    disciplinas,
    turmas,
    onRefresh: () => window.location.reload()
  }))
  inject('#tab-gerenciar-cursos', GerenciarCursosTab({
    cursos,
    onRefresh: () => window.location.reload(),
  }))

  inject('#tab-certificados', GerenciarCertificadosTab())
  inject('#tab-diario-classe', DiarioClasseTab({
    turmas,
    profile: profile || { id: '', perfil: 'secretaria' }
  }))

  inject('#tab-documentos', DocumentosTab({
    alunos,
    profile: profile || { id: '', perfil: 'secretaria' }
  }))

  return container
}
