import { supabase } from '../lib/supabase'
import { DocumentsService } from '../lib/documents-service'
import { AdminService } from '../lib/admin-service'
import { ProfessorService } from '../lib/professor-service'
import { CourseService } from '../lib/course-service'
import { AcademicService } from '../lib/academic-service'
import { toast } from '../lib/toast'
import { safeHTML } from '../lib/security'
import { RequestTableComponent } from '../components/RequestTable'
import { CadastroAlunoTab } from '../components/Tabs/CadastroAlunoTab'
import { CadastroProfessorTab } from '../components/Tabs/CadastroProfessorTab'
import { GerenciarAlunosTab } from '../components/Tabs/GerenciarAlunosTab'
import { GerenciarProfessoresTab } from '../components/Tabs/GerenciarProfessoresTab'
import { GerenciarCursosTab } from '../components/Tabs/GerenciarCursosTab'
import { NotasEstagioTab } from '../components/Tabs/NotasEstagioTab'
import { OverviewTab } from '../components/Tabs/OverviewTab'

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

  // 2. Estrutura Base (Segura)
  container.innerHTML = safeHTML`
    <header class="view-header" style="display: flex; align-items: center; gap: 1.5rem; background: linear-gradient(to right, white, transparent); padding: 1.5rem; border-radius: 16px; margin-bottom: 2.5rem; border-left: 6px solid var(--primary);">
      <div style="font-size: 3rem; background: var(--secondary); width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; border-radius: 20px; box-shadow: var(--shadow-sm);">🏫</div>
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
    </div>

    <div id="tab-overview" class="tab-content"></div>
    <div id="tab-solicitacoes" class="tab-content" style="display: none;"></div>
    <div id="tab-notas" class="tab-content" style="display: none;"></div>
    <div id="tab-cadastro" class="tab-content" style="display: none;"></div>
    <div id="tab-gerenciar" class="tab-content" style="display: none;"></div>
    <div id="tab-cadastro-professor" class="tab-content" style="display: none;"></div>
    <div id="tab-gerenciar-professores" class="tab-content" style="display: none;"></div>
    <div id="tab-gerenciar-cursos" class="tab-content" style="display: none;"></div>
  `

  // 3. Lógica de Navegação de Abas
  const tabBtns = container.querySelectorAll('.tab-btn')
  const tabContents = container.querySelectorAll('.tab-content')

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab')
      tabBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      tabContents.forEach(content => (content as HTMLElement).style.display = 'none')
      const targetTab = container.querySelector(`#tab-${tab}`) as HTMLElement
      if (targetTab) targetTab.style.display = 'block'
    })
  })

  // 4. Injeção de Componentes Modulares
  const inject = (id: string, component: Node) => {
    const el = container.querySelector(id)
    if (el) el.appendChild(component)
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

  inject('#tab-solicitacoes', await RequestTableComponent())
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
    onRefresh: () => window.location.reload()
  }))

  // Event Listeners para botões da tabela de alunos
  window.addEventListener('view-aluno', ((e: CustomEvent) => {
    window.location.hash = `#/student-details?id=${e.detail}`
  }) as EventListener)

  window.addEventListener('edit-aluno', ((e: CustomEvent) => {
    window.location.hash = `#/student-details?edit=true&id=${e.detail}`
  }) as EventListener)

  window.addEventListener('matricular-aluno', ((e: CustomEvent) => {
    window.location.hash = `#/gestao-turmas?matricular=${e.detail}`
  }) as EventListener)

  // Event Listeners para botões da tabela de professores
  window.addEventListener('view-professor', ((e: CustomEvent) => {
    window.location.hash = `#/professor-details?id=${e.detail}`
  }) as EventListener)

  window.addEventListener('edit-professor', ((e: CustomEvent) => {
    window.location.hash = `#/professor-details?edit=true&id=${e.detail}`
  }) as EventListener)

  return container
}
