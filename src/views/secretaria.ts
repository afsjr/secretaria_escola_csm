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
import { ICONS } from '../lib/icons'

export async function SecretariaView(): Promise<HTMLDivElement> {
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
    <header class="view-header" style="display: flex; align-items: center; gap: 1.5rem; background: linear-gradient(to right, white, transparent); padding: 1.5rem; border-radius: 16px; margin-bottom: 2.5rem; border-left: 6px solid var(--primary);">
      <div style="font-size: 3rem; background: var(--secondary); width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 20px; box-shadow: var(--shadow-sm);">${ICONS.school}</div>
      <div>
        <h1 class="title" style="margin: 0; font-weight: 800; letter-spacing: -0.02em;">Painel da Secretaria</h1>
        <p class="subtitle" style="margin: 0.25rem 0 0 0; font-size: 1.1rem; color: var(--text-muted);">Gestão técnica modularizada e monitoramento em tempo real.</p>
      </div>
    </header>

    <div class="tabs-container">
      <button class="tab-btn active" data-tab="overview">Visão Geral</button>
      <button class="tab-btn" data-tab="solicitacoes">Solicitações</button>
      <button class="tab-btn" data-tab="notas">Notas/Estágio</button>
      <button class="tab-btn" data-tab="cadastro">Cadastrar Aluno</button>
      <button class="tab-btn" data-tab="gerenciar">Gerenciar Alunos</button>
      <button class="tab-btn" data-tab="cadastro-professor">Cadastrar Professor</button>
      <button class="tab-btn" data-tab="gerenciar-professores">Gerenciar Professores</button>
      <button class="tab-btn" data-tab="gerenciar-cursos">Gerenciar Cursos</button>
      <button class="tab-btn" data-tab="certificados">Certificados</button>
    </div>

    <div id="tab-overview" class="tab-content"></div>
    <div id="tab-solicitacoes" class="tab-content" style="display: none;"></div>
    <div id="tab-notas" class="tab-content" style="display: none;"></div>
    <div id="tab-cadastro" class="tab-content" style="display: none;"></div>
    <div id="tab-gerenciar" class="tab-content" style="display: none;"></div>
    <div id="tab-cadastro-professor" class="tab-content" style="display: none;"></div>
    <div id="tab-gerenciar-professores" class="tab-content" style="display: none;"></div>
    <div id="tab-gerenciar-cursos" class="tab-content" style="display: none;"></div>
    <div id="tab-certificados" class="tab-content" style="display: none;"></div>
  `

  // 3. Lógica de Navegação de Abas (com animação fadeInScale)
  const tabBtns = container.querySelectorAll('.tab-btn')
  const tabContents = container.querySelectorAll('.tab-content')

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab')
      tabBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
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
    })
  })

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

  return container
}
