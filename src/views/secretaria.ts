import { DocumentsService } from '../lib/documents-service'
import { AdminService } from '../lib/admin-service'
import { ProfessorService } from '../lib/professor-service'
import { CourseService } from '../lib/course-service'
import { AcademicService } from '../lib/academic-service'
import { ExcelService } from '../lib/excel-service'
import { toast } from '../lib/toast'
import { RequestTableComponent } from '../components/RequestTable'
import { CadastroAlunoTab } from '../components/Tabs/CadastroAlunoTab'
import { CadastroProfessorTab } from '../components/Tabs/CadastroProfessorTab'
import { GerenciarAlunosTab } from '../components/Tabs/GerenciarAlunosTab'
import { GerenciarProfessoresTab } from '../components/Tabs/GerenciarProfessoresTab'
import { GerenciarCursosTab } from '../components/Tabs/GerenciarCursosTab'
import { NotasEstagioTab } from '../components/Tabs/NotasEstagioTab'

export async function SecretariaView(): Promise<HTMLDivElement> {
  const container = document.createElement('div')
  container.className = 'secretaria-view animate-in'

  // 1. Carga de Dados Inicial
  const [
    turmasResult,
    alunosResult,
    professoresResult,
    disciplinasResult,
    cursosResult,
    requestsResult
  ] = await Promise.all([
    AcademicService.getTurmas(),
    AdminService.listAlunos(),
    ProfessorService.getProfessores(),
    ProfessorService.getAllDisciplinas(),
    CourseService.getCursos(),
    DocumentsService.getAllOpenRequests()
  ])

  const turmas = turmasResult.data || []
  const alunos = alunosResult.data || []
  const professores = professoresResult.data || []
  const disciplinas = disciplinasResult.data || []
  const cursos = cursosResult.data || []
  const requests = requestsResult.data || []

  // 2. Estrutura Base (HTML)
  container.innerHTML = `
    <header class="view-header">
      <h1 class="title">Painel da Secretaria</h1>
      <p class="subtitle">Gerencie solicitações, alunos, professores e cursos técnicos.</p>
    </header>

    <div class="tabs-container">
      <button class="tab-btn active" data-tab="solicitacoes">Solicitações</button>
      <button class="tab-btn" data-tab="notas">Notas/Estágio</button>
      <button class="tab-btn" data-tab="cadastro">Cadastrar Aluno</button>
      <button class="tab-btn" data-tab="gerenciar">Gerenciar Alunos</button>
      <button class="tab-btn" data-tab="cadastro-professor">Cadastrar Professor</button>
      <button class="tab-btn" data-tab="gerenciar-professores">Gerenciar Professores</button>
      <button class="tab-btn" data-tab="gerenciar-cursos">Gerenciar Cursos</button>
    </div>

    <div id="tab-solicitacoes" class="tab-content"></div>
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
  
  // Aba Solicitações (Usa RequestTableComponent)
  const tabSolicitacoes = container.querySelector('#tab-solicitacoes')
  if (tabSolicitacoes) {
    tabSolicitacoes.appendChild(await RequestTableComponent())
  }

  // Aba Notas/Estágio
  const tabNotas = container.querySelector('#tab-notas')
  if (tabNotas) {
    tabNotas.appendChild(NotasEstagioTab({ turmas }))
  }

  // Aba Cadastro Aluno
  const tabCadastro = container.querySelector('#tab-cadastro')
  if (tabCadastro) {
    tabCadastro.appendChild(CadastroAlunoTab({ turmas }))
  }

  // Aba Gerenciar Alunos
  const tabGerenciar = container.querySelector('#tab-gerenciar')
  if (tabGerenciar) {
    tabGerenciar.appendChild(GerenciarAlunosTab({
      alunos,
      turmas,
      onRefresh: () => window.location.reload()
    }))
  }

  // Aba Cadastro Professor
  const tabCadProf = container.querySelector('#tab-cadastro-professor')
  if (tabCadProf) {
    tabCadProf.appendChild(CadastroProfessorTab())
  }

  // Aba Gerenciar Professores
  const tabGerProfs = container.querySelector('#tab-gerenciar-professores')
  if (tabGerProfs) {
    tabGerProfs.appendChild(GerenciarProfessoresTab({
      professores,
      disciplinas,
      turmas,
      onRefresh: () => window.location.reload()
    }))
  }

  // Aba Gerenciar Cursos
  const tabGerCursos = container.querySelector('#tab-gerenciar-cursos')
  if (tabGerCursos) {
    tabGerCursos.appendChild(GerenciarCursosTab({
      cursos,
      onRefresh: () => window.location.reload()
    }))
  }

  return container
}
