import type { UserProfile } from '../types'
import { DocumentsService } from '../lib/documents-service'
import { AdminService } from '../lib/admin-service'
import { ProfessorService } from '../lib/professor-service'
import { CourseService } from '../lib/course-service'
import { PDFService } from '../lib/pdf-service'
import { AcademicService } from '../lib/academic-service'
import { ExcelService } from '../lib/excel-service'
import { disciplinaTemEstagio } from '../lib/grades-utils'

import { toast } from '../lib/toast'
import { StudentDetailsService } from '../lib/student-details-service'
import { RequestTableComponent } from '../components/RequestTable'
import { CadastroAlunoTab } from '../components/Tabs/CadastroAlunoTab'
import { CadastroProfessorTab } from '../components/Tabs/CadastroProfessorTab'
import { GerenciarAlunosTab } from '../components/Tabs/GerenciarAlunosTab'
import { GerenciarProfessoresTab } from '../components/Tabs/GerenciarProfessoresTab'
import { GerenciarCursosTab } from '../components/Tabs/GerenciarCursosTab'
import { StudentDetailsView } from './student-details'
import { ProfessorDetailsView } from './professor-details'
import { renderTemplate } from '../lib/dom-utils'
import { escapeHTML as globalEscapeHTML } from '../lib/security'

;(window as any).AcademicService = AcademicService
;(window as any).StudentDetailsService = StudentDetailsService

// Usar utilitário global de segurança
const escapeHTML = globalEscapeHTML

// PDF logic moved to RequestTableComponent or PDFService

export async function SecretariaView(): Promise<HTMLDivElement> {
  const container = document.createElement('div')
  container.className = 'secretaria-view animate-in'

  const { data: requests, error } = await DocumentsService.getAllOpenRequests()
  const turmasResult = await AcademicService.getTurmas()
  const { data: turmas } = turmasResult
  const { data: alunos, error: errorAlunos } = await AdminService.listAlunos()
  const { data: professores, error: errorProfessores } = await ProfessorService.getProfessores()
  const { data: disciplinas, error: errorDisciplinas } = await ProfessorService.getAllDisciplinas()
  const { data: cursos, error: errorCursos } = await CourseService.getCursos()

  if (errorAlunos) toast.error('Erro ao carregar alunos: ' + errorAlunos.message)

  container.appendChild(await RequestTableComponent())

  const renderGerenciarAlunos = (): string => {
    return `<div id="slot-gerenciar-alunos"></div>`
  }

  const renderCadastroProfessor = (): string => `
    <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); max-width: 600px; margin: 0 auto;">
      <h3 style="margin-bottom: 1.5rem; color: var(--text-main);">Cadastrar Novo Professor</h3>
      <p style="margin-bottom: 1.5rem; color: var(--text-muted); font-size: 0.9rem;">Crie uma nova conta de professor no sistema. O professor poderá fazer login imediatamente após o cadastro.</p>

      <form id="form-cadastro-professor">
        <div class="form-group">
          <label class="label" for="professor-nome">Nome Completo *</label>
          <input type="text" id="professor-nome" name="professor_nome" class="input" placeholder="Maria Silva" required>
        </div>

        <div class="form-group">
          <label class="label" for="professor-email">E-mail *</label>
          <input type="email" id="professor-email" name="professor_email" class="input" placeholder="maria@email.com" required>
        </div>

        <div class="form-group">
          <label class="label" for="professor-cpf">CPF</label>
          <input type="text" id="professor-cpf" name="professor_cpf" class="input" placeholder="000.000.000-00">
        </div>

        <div class="form-group">
          <label class="label" for="professor-telefone">Telefone / WhatsApp</label>
          <input type="text" id="professor-telefone" name="professor_telefone" class="input" placeholder="(00) 00000-0000">
        </div>

        <div class="form-group">
          <label class="label" for="professor-senha">Senha * (mínimo 6 caracteres)</label>
          <input type="password" id="professor-senha" name="professor_senha" class="input" placeholder="******" minlength="6" required>
        </div>

        <button type="submit" class="btn btn-primary" id="btn-cadastrar-professor" style="width: 100%;">Cadastrar Professor</button>
      </form>
    </div>
  `

  const renderGerenciarProfessores = (): string => {
    return `<div id="slot-gerenciar-professores"></div>`
  }

  

  const renderGerenciarCursos = (): string => {
    return `<div id="slot-gerenciar-cursos"></div>`
  }

  const renderNotasEBoletim = (): string => `
    <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
      <h3 style="margin: 0 0 1rem 0; color: var(--text-main);">Notas de Estágio</h3>
      <p style="margin: 0 0 1.5rem 0; color: var(--text-muted); font-size: 0.9rem;">Lançar notas de estágio (0-10) por disciplina.</p>
      
      <div class="form-group">
        <label class="label" for="notas-turma-select">Selecione a Turma:</label>
        <select id="notas-turma-select" class="input">
          <option value="">-- Escolha uma turma --</option>
          ${turmas ? turmas.map(t => '<option value="' + t.id + '">' + t.nome + ' (' + t.periodo + ')</option>').join('') : ''}
        </select>
      </div>
      
      <div class="form-group">
        <label class="label" for="notas-aluno-select">Selecione o Aluno:</label>
        <select id="notas-aluno-select" class="input" disabled>
          <option value="">-- Escolha um aluno --</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="label" for="notas-disciplina-select">Selecione a Disciplina:</label>
        <select id="notas-disciplina-select" class="input" disabled>
          <option value="">-- Escolha uma disciplina --</option>
        </select>
      </div>
      
      <button id="btn-carregar-notas" class="btn btn-primary" disabled>Carregar Estágio</button>
      
<div id="notas-content" style="margin-top: 1.5rem; display: none;">
        <!-- Nota de estágio será carregada aqui -->
      </div>
    </div>
  `;

  const renderModalMatricula = (): string => ``

  container.innerHTML = `
    <header class="view-header">
      <h1 class="title">Painel da Secretaria</h1>
      <p class="subtitle">Gerencie as solicitações de todos os alunos do sistema.</p>
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

    <div id="tab-solicitacoes" class="tab-content">
    </div>

    <div id="tab-cadastro" class="tab-content" style="display: none;">
    </div>

  if (tabGerenciar) {
    const slotAlunos = tabGerenciar.querySelector('#slot-gerenciar-alunos') as HTMLElement
    if (slotAlunos) {
      slotAlunos.appendChild(GerenciarAlunosTab({ 
        alunos: alunos ?? [], 
        turmas: turmas ?? [],
        onRefresh: () => SecretariaView().then(v => {
          container.innerHTML = v.innerHTML
          // Note: In a real app, we'd need to re-bind ALL events. 
          // For now, reload is safer.
          window.location.reload()
        })
      }))
    }
  }

  const tabCadastroProfessor = container.querySelector('#tab-cadastro-professor') as HTMLElement
    </div>

    <div id="tab-gerenciar-professores" class="tab-content" style="display: none;">
      ${renderGerenciarProfessores()}
    </div>

    <div id="tab-gerenciar-cursos" class="tab-content" style="display: none;">
      ${renderGerenciarCursos()}
    </div>

    <div id="tab-notas" class="tab-content" style="display: none;">
      ${renderNotasEBoletim()}
    </div>
  `

  // Lógica das tabs
  const tabBtns = container.querySelectorAll('.tab-btn')
  const tabContents = container.querySelectorAll('.tab-content')

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab')

      tabBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')

      tabContents.forEach(content => {
        (content as HTMLElement).style.display = 'none'
      })
      const targetTab = container.querySelector(`#tab-${tab}`) as HTMLElement
      if (targetTab) targetTab.style.display = 'block'
    })
  })

  const tabSolicitacoes = container.querySelector('#tab-solicitacoes') as HTMLElement
  if (tabSolicitacoes) {
    tabSolicitacoes.appendChild(await RequestTableComponent())
  }

  const tabCadastro = container.querySelector('#tab-cadastro') as HTMLElement
  if (tabCadastro) {
    tabCadastro.appendChild(CadastroAlunoTab({ turmas: turmas ?? null }))
  }

  const tabCadastroProfessor = container.querySelector('#tab-cadastro-professor') as HTMLElement
  const tabGerenciarProfessores = container.querySelector('#tab-gerenciar-professores') as HTMLElement

  if (tabCadastroProfessor) {
    tabCadastroProfessor.appendChild(CadastroProfessorTab())
  }

  const tabGerenciar = container.querySelector('#tab-gerenciar') as HTMLElement
  if (tabGerenciar) {
    const slotAlunos = tabGerenciar.querySelector('#slot-gerenciar-alunos') as HTMLElement
    if (slotAlunos) {
      slotAlunos.appendChild(GerenciarAlunosTab({ 
        alunos: alunos ?? [], 
        turmas: turmas ?? [],
        onRefresh: () => window.location.reload()
      }))
    }
  }

  if (tabGerenciarProfessores) {
    const slotProfs = tabGerenciarProfessores.querySelector('#slot-gerenciar-professores') as HTMLElement
    if (slotProfs) {
      slotProfs.appendChild(GerenciarProfessoresTab({
        professores: professores ?? [],
        disciplinas: disciplinas ?? [],
        turmas: turmas ?? [],
        onRefresh: () => window.location.reload()
      }))
    }
  }

  const tabGerenciarCursos = container.querySelector('#tab-gerenciar-cursos') as HTMLElement
  if (tabGerenciarCursos) {
    const slotCursos = tabGerenciarCursos.querySelector('#slot-gerenciar-cursos') as HTMLElement
    if (slotCursos) {
      slotCursos.appendChild(GerenciarCursosTab({
        cursos: cursos ?? [],
        onRefresh: () => window.location.reload()
      }))
    }
  }


  // Handlers de Professores movidos para GerenciarProfessoresTab

  // Handlers de Alunos movidos para GerenciarAlunosTab



  // =====================================================
  // GERENCIAMENTO DE CURSOS

  // =====================================================
  // GERENCIAMENTO DE CURSOS
  // =====================================================
  // Handlers de Cursos movidos para GerenciarCursosTab

  // =====================================================
  // VINCULAR ALUNO A TURMA (Movido para GerenciarAlunosTab)
  // =====================================================

  // =====================================================
  // EXPORTAÇÃO PARA EXCEL
  // =====================================================
  const btnExportSolicitacoes = container.querySelector('#btn-export-solicitacoes')
  if (btnExportSolicitacoes && requests) {
    btnExportSolicitacoes.addEventListener('click', () => {
      try {
        ExcelService.exportSolicitacoes(requests)
        toast.success('Solicitações exportadas com sucesso!')
      } catch (err: any) {
        toast.error('Erro ao exportar: ' + err.message)
      }
    })
  }

  // =====================================================
  // EXPORTAÇÃO PARA EXCEL (Movido para GerenciarAlunosTab)
  // =====================================================

  // Handlers de Professores movidos para GerenciarProfessoresTab

  // =====================================================
  // NOTAS DE ESTÁGIO - Handlers TypeScript
  // =====================================================
  const notasTurmaSelect = container.querySelector('#notas-turma-select') as HTMLSelectElement
  const notasAlunoSelect = container.querySelector('#notas-aluno-select') as HTMLSelectElement
  const notasDisciplinaSelect = container.querySelector('#notas-disciplina-select') as HTMLSelectElement
  const btnCarregarEstagio = container.querySelector('#btn-carregar-notas') as HTMLButtonElement
  const notasContent = container.querySelector('#notas-content') as HTMLElement

  // Estado local: disciplinas da turma selecionada e cache do boletim
  let disciplinasDaTurmaAtual: Array<{ id: string; nome: string; modulo: string | null }> = []
  let boletimCache: any[] | null = null

  if (notasTurmaSelect) {
    notasTurmaSelect.addEventListener('change', async () => {
      const turmaId = notasTurmaSelect.value

      // Reset cascata
      notasAlunoSelect.innerHTML = '<option value="">-- Escolha um aluno --</option>'
      notasAlunoSelect.disabled = true
      notasDisciplinaSelect.innerHTML = '<option value="">-- Escolha uma disciplina --</option>'
      notasDisciplinaSelect.disabled = true
      btnCarregarEstagio.disabled = true
      notasContent.style.display = 'none'
      disciplinasDaTurmaAtual = []
      boletimCache = null

      if (!turmaId) return

      // Carregar alunos e disciplinas da turma em paralelo
      const [alunosResult, disciplinasResult] = await Promise.all([
        AcademicService.getAlunosDaTurma(turmaId),
        AcademicService.getDisciplinasDaTurma(turmaId)
      ])

      // Guardar disciplinas da turma para uso no filtro de estágio
      if (disciplinasResult.data?.disciplinas) {
        disciplinasDaTurmaAtual = disciplinasResult.data.disciplinas
      }

      const alunosTurma = alunosResult.data
      if (alunosTurma && alunosTurma.length > 0) {
        notasAlunoSelect.innerHTML = '<option value="">-- Escolha um aluno --</option>' +
          alunosTurma.map(m => {
            const perfil = (m as any).perfis
            if (!perfil) return ''
            return `<option value="${perfil.id}">${escapeHTML(perfil.nome_completo)}</option>`
          }).join('')
        notasAlunoSelect.disabled = false
      } else {
        notasAlunoSelect.innerHTML = '<option value="">Nenhum aluno nesta turma</option>'
      }
    })
  }

  if (notasAlunoSelect) {
    notasAlunoSelect.addEventListener('change', async () => {
      const alunoId = notasAlunoSelect.value

      notasDisciplinaSelect.innerHTML = '<option value="">-- Escolha uma disciplina --</option>'
      notasDisciplinaSelect.disabled = true
      btnCarregarEstagio.disabled = true
      notasContent.style.display = 'none'
      boletimCache = null

      if (!alunoId) return

      // Carregamos o boletim apenas para ver se já existem notas para preencher o campo
      const { data: notasAluno } = await AcademicService.getBoletim(alunoId)
      boletimCache = notasAluno

      console.log('[Estágio Debug] Notas do Aluno:', notasAluno)
      console.log('[Estágio Debug] Disciplinas da Turma:', disciplinasDaTurmaAtual)

      // AGORA: Mostramos TODAS as disciplinas para você ter certeza que carregou
      if (disciplinasDaTurmaAtual && disciplinasDaTurmaAtual.length > 0) {
        notasDisciplinaSelect.innerHTML = '<option value="">-- Escolha uma disciplina --</option>' +
          disciplinasDaTurmaAtual.map(d => {
            const permite = disciplinaTemEstagio(d.nome, d.modulo)
            const sufixo = permite ? '' : ' (Sem Estágio)'
            return `<option value="${escapeHTML(d.nome)}" data-permite="${permite}">${escapeHTML(d.nome)}${sufixo}</option>`
          }).join('')
        notasDisciplinaSelect.disabled = false
      } else {
        console.warn('[Estágio Debug] Turma sem disciplinas vinculadas no curso.')
        notasDisciplinaSelect.innerHTML = '<option value="">Turma sem disciplinas cadastradas</option>'
      }
    })
  }

  if (notasDisciplinaSelect) {
    notasDisciplinaSelect.addEventListener('change', () => {
      const option = notasDisciplinaSelect.selectedOptions[0]
      const permite = option?.getAttribute('data-permite') === 'true'
      
      btnCarregarEstagio.disabled = !notasDisciplinaSelect.value || !permite
      
      if (notasDisciplinaSelect.value && !permite) {
        toast.warning('Esta disciplina não possui estágio configurado (Módulo 1 ou Disciplina Teórica).')
      }
    })
  }

  if (btnCarregarEstagio) {
    btnCarregarEstagio.addEventListener('click', () => {
      const nomeDisciplina = notasDisciplinaSelect.value
      if (!nomeDisciplina) return

      const alunoId = notasAlunoSelect.value
      if (!alunoId) return

      // Procuramos se já existe essa disciplina no boletim do aluno
      const notaExistente = boletimCache?.find((n: any) => n.disciplina === nomeDisciplina)
      const notaEstagio = notaExistente?.nota_estagio ?? ''

      notasContent.innerHTML = `
        <div style="background: var(--secondary); padding: 1rem; border-radius: 8px;">
          <p style="margin: 0 0 1rem 0; font-weight: 600;">Disciplina: ${escapeHTML(nomeDisciplina)}</p>
          <div style="display: flex; gap: 1rem; align-items: center;">
            <label style="font-weight: 500;">Nota de Estágio (0-10):</label>
            <input type="number" id="input-nota-estagio" class="input" 
              min="0" max="10" step="0.1" value="${notaEstagio}" 
              style="width: 100px;">
            <button id="btn-salvar-nota-estagio" class="btn btn-primary btn-sm">Salvar</button>
          </div>
        </div>
      `
      notasContent.style.display = 'block'

      const btnSalvar = container.querySelector('#btn-salvar-nota-estagio') as HTMLButtonElement
      const inputNota = container.querySelector('#input-nota-estagio') as HTMLInputElement

      if (btnSalvar && inputNota) {
        btnSalvar.addEventListener('click', async () => {
          const novaNota = parseFloat(inputNota.value)
          if (isNaN(novaNota) || novaNota < 0 || novaNota > 10) {
            toast.error('Nota deve estar entre 0 e 10')
            return
          }

          btnSalvar.disabled = true
          btnSalvar.textContent = 'Salvando...'

          // Usamos UPSERT: Se não existir, ele cria o registro no boletim
          const { error } = await AcademicService.upsertNotaEstagio(alunoId, nomeDisciplina, novaNota)

          btnSalvar.disabled = false
          btnSalvar.textContent = 'Salvar'

          if (error) {
            toast.error('Erro ao salvar: ' + error.message)
          } else {
            toast.success('Nota de estágio salva com sucesso!')
            // Atualizar cache local
            if (!boletimCache) boletimCache = []
            const idx = boletimCache.findIndex((n: any) => n.disciplina === nomeDisciplina)
            if (idx >= 0) {
              boletimCache[idx].nota_estagio = novaNota
            } else {
              boletimCache.push({ disciplina: nomeDisciplina, nota_estagio: novaNota })
            }
          }
        })
      }
    })
  }

  return container
}
