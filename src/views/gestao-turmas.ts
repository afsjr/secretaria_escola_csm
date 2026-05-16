import { AcademicService } from '../lib/academic-service'
import { CourseService } from '../lib/course-service'
import { AuditService } from '../lib/audit-service'
import { toast } from '../lib/toast'
import { escapeHTML, createOption } from '../lib/security'
import type { UserRole } from '../types'

interface ProfileParam {
  id: string
  perfil: UserRole
}

export async function GestaoTurmasView(profile: ProfileParam): Promise<HTMLElement> {
  const container = document.createElement('div')
  container.className = 'gestao-turmas-view animate-in'

  // Verificar se o usuário tem permissão para editar/excluir turmas
  const canManageTurmas = profile.perfil === 'secretaria' || profile.perfil === 'coordenacao' || profile.perfil === 'admin' || profile.perfil === 'master_admin'

  // Fetch initial data
  const turmasResult = await AcademicService.getTurmas()
  const turmas = turmasResult.data
  const errorTurmas = turmasResult.error

  const alunosResult = await AcademicService.getAlunos()
  const alunos = alunosResult.data
  const errorAlunos = alunosResult.error

  const cursosResult = await CourseService.getCursosAtivos()
  const cursos = cursosResult.data
  const errorCursos = cursosResult.error

  if (errorTurmas) toast.error('Erro ao carregar turmas: ' + errorTurmas.message)

  const cursosOptions = cursos && cursos.length > 0
    ? cursos.map((c: any) => createOption(c.id, c.nome)).join('')
    : '<option value="">Nenhum curso cadastrado</option>'

  const turmasList = !turmas || turmas.length === 0
    ? '<p style="color:var(--text-muted);font-size:0.8rem;">Nenhuma turma registrada.</p>'
    : turmas?.map((t: any) => {
      const statusBg = t.status_ingresso === 'aberta' ? 'var(--success-bg)' : '#FEE2E2'
      const statusColor = t.status_ingresso === 'aberta' ? 'var(--success-text)' : '#991B1B'
      const manageButtons = canManageTurmas ? `
        <div style="margin-top: 0.5rem; display: flex; gap: 6px;">
          <button type="button" class="btn-editar-turma" data-id="${escapeHTML(t.id)}" data-nome="${escapeHTML(t.nome)}" title="Editar nome da turma" style="background: transparent; border: 1px solid var(--accent); color: var(--accent); font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; cursor: pointer;">✏️ Editar</button>
          <button type="button" class="btn-excluir-turma" data-id="${escapeHTML(t.id)}" data-nome="${escapeHTML(t.nome)}" title="Excluir turma" style="background: transparent; border: 1px solid var(--danger); color: var(--danger); font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; cursor: pointer;">🗑️ Excluir</button>
        </div>
      ` : ''
      return `
          <li style="padding: 1rem; border: 2px solid var(--border); border-radius: 8px; cursor: pointer; transition: all 0.2s; background: white;" class="turma-item" data-id="${escapeHTML(t.id)}" data-nome="${escapeHTML(t.nome)}" onmouseover="this.style.borderColor='var(--primary)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'" onmouseout="this.style.borderColor='var(--secondary)'; this.style.boxShadow='none'">
            <div style="font-weight: 600; color: var(--primary); font-size: 1.05rem;">
              <span class="turma-nome-display">${escapeHTML(t.nome)}</span>
              <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">(${escapeHTML(t.periodo)})</span>
              <input type="text" class="turma-nome-input" style="display: none; font-size: 1.05rem; font-weight: 600; color: var(--primary); border: 1px solid var(--accent); border-radius: 4px; padding: 0.2rem 0.4rem; width: 60%;" />
            </div>
            <div style="font-size: 0.8rem; margin-top: 8px;">
              <span class="badge" style="background: ${statusBg}; color: ${statusColor}; padding: 0.3rem 0.6rem; border-radius: 4px; font-weight: 600;">${escapeHTML(t.status_ingresso)}</span>
            </div>
            ${manageButtons}
          </li>
        `
    }).join('')

  const alunosOptions = alunos?.map((a: any) =>
    createOption(a.id, `${a.nome_completo} (${a.cpf || 'Sem CPF'})`)
  ).join('') || ''

  container.innerHTML = `
    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; color: var(--text-main);">Gestão de Turmas e Matrículas</h1>
      <p>Crie novas turmas, matricule os alunos e gerencie o status acadêmico/financeiro.</p>
    </header>

    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem;">

      <!-- Lado Esquerdo: Criar Turma e Lista de Turmas -->
      <div>
        <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); margin-bottom: 2rem; border-top: 4px solid var(--primary);">
          <h3 style="margin-bottom: 1rem;">Abrir Nova Turma</h3>
          <form id="form-nova-turma">
            <div class="form-group">
              <label class="label" for="turma-curso">Curso *</label>
              <select id="turma-curso" name="turma_curso" class="input" required>
                <option value="">-- Selecione o Curso --</option>
                ${cursosOptions}
              </select>
            </div>
            <div class="form-group">
              <label class="label" for="turma-nome">Nome da Turma</label>
              <input type="text" id="turma-nome" name="turma_nome" class="input" placeholder="Ex: Tec. Enfermagem 12A" required>
            </div>
            <div class="form-group">
              <label class="label" for="turma-periodo">Período letivo</label>
              <input type="text" id="turma-periodo" name="turma_periodo" class="input" placeholder="Ex: 2026.1" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Registrar Turma</button>
          </form>
        </div>

        <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
          <h3 style="margin-bottom: 1rem;">Turmas Ativas</h3>
          <ul id="lista-turmas" style="list-style: none; display: flex; flex-direction: column; gap: 10px;">
            ${turmasList}
          </ul>
        </div>
      </div>

      <!-- Lado Direito: Detalhes da Turma e Matrículas -->
      <div id="painel-matriculas" style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); display: none;">
        <h2 id="titulo-turma-selecionada" style="margin-bottom: 0.5rem; color: var(--primary); border-bottom: 3px solid var(--accent); padding-bottom: 0.5rem;">Selecione uma Turma</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.5rem;">Gerencie matrículas, status acadêmico/financeiro e visualize notas dos alunos.</p>

        <!-- Tabs de Navegação -->
        <div style="display: flex; gap: 0; border-bottom: 2px solid var(--border); margin-bottom: 1.5rem;">
          <button type="button" class="tab-btn active" data-tab="alunos" style="padding: 0.75rem 1.5rem; border: none; background: transparent; color: var(--primary); font-weight: 600; cursor: pointer; border-bottom: 3px solid var(--primary); margin-bottom: -2px;">
            👥 Alunos
          </button>
          <button type="button" class="tab-btn" data-tab="grade" style="padding: 0.75rem 1.5rem; border: none; background: transparent; color: var(--text-muted); font-weight: 500; cursor: pointer;">
            📚 Grade (Ofertas)
          </button>
          <button type="button" class="tab-btn" data-tab="notas" style="padding: 0.75rem 1.5rem; border: none; background: transparent; color: var(--text-muted); font-weight: 500; cursor: pointer;">
            📊 Notas
          </button>
        </div>

        <!-- Seção: Alunos (Matrículas) -->
        <div id="tab-content-alunos">
          <!-- Matricular Aluno - DESTAQUE -->
          <div style="background: linear-gradient(135deg, #FFF9E6 0%, #FFF4B8 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; border: 2px solid var(--accent); box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);">
            <h4 style="margin-bottom: 1rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.5rem;">🎓</span>
              Matricular Aluno Existente
            </h4>
            <div style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
              <div class="form-group" style="flex: 1; margin: 0; min-width: 250px;">
                <label for="aluno-select" class="label" style="font-size: 0.85rem; font-weight: 600;">Selecione o Aluno</label>
                <select id="aluno-select" name="aluno_select" class="input" style="width: 100%;">
                  <option value="">-- Escolha um Aluno --</option>
                  ${alunosOptions}
                </select>
              </div>
              <button id="btn-matricular" class="btn btn-primary" style="background: var(--primary); white-space: nowrap; padding: 0.75rem 1.5rem; font-weight: 600;">
                <span style="margin-right: 0.5rem;">✓</span> Matricular na Turma
              </button>
            </div>
          </div>

          <!-- Tabela de Alunos na Turma -->
          <h3 style="margin-bottom: 1rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.3rem;">📋</span>
            Diário Oficial (Caderneta)
          </h3>
          <div style="overflow-x: auto; border: 1px solid var(--border); border-radius: 8px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead style="background: var(--primary); color: white; font-size: 0.85rem; text-transform: uppercase;">
                <tr>
                  <th style="padding: 1rem;">Nome do Aluno</th>
                  <th style="padding: 1rem;">Status (Acadêmico)</th>
                  <th style="padding: 1rem;">Bloqueio Financ.</th>
                  <th style="padding: 1rem; text-align: right;">Ações</th>
                </tr>
              </thead>
              <tbody id="tabela-alunos-turma">
                <tr><td colspan="4" style="padding: 1rem; text-align: center; color: var(--text-muted);">Clique em uma turma ao lado para visualizar os alunos.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Seção: Grade Curricular (Ofertas) -->
        <div id="tab-content-grade" style="display: none;">
          <h3 style="margin-bottom: 1rem; color: var(--text-main);">Gerenciar Grade da Turma</h3>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">Adicione disciplinas do catálogo a esta turma e vincule professores.</p>
          
          <div style="background: #f8fafc; padding: 1.5rem; border-radius: 12px; border: 1px dashed var(--border); margin-bottom: 1.5rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem; align-items: flex-end;">
              <div class="form-group" style="margin:0;">
                <label class="label" style="font-size:0.75rem;">Disciplina do Catálogo</label>
                <select id="select-catalogo-disciplina" class="input">
                  <option value="">-- Carregando Catálogo --</option>
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label class="label" style="font-size:0.75rem;">Professor Responsável</label>
                <select id="select-professor-oferta" class="input">
                  <option value="">-- Carregando Professores --</option>
                </select>
              </div>
              <button id="btn-adicionar-oferta" class="btn btn-primary">Adicionar</button>
            </div>
          </div>

          <div style="overflow-x: auto; border: 1px solid var(--border); border-radius: 8px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead style="background: var(--secondary); color: var(--text-main); font-size: 0.85rem;">
                <tr>
                  <th style="padding: 1rem;">Módulo</th>
                  <th style="padding: 1rem;">Disciplina</th>
                  <th style="padding: 1rem;">Professor</th>
                  <th style="padding: 1rem; text-align: right;">Ações</th>
                </tr>
              </thead>
              <tbody id="tabela-grade-turma">
                <tr><td colspan="4" style="padding: 2rem; text-align: center; color: var(--text-muted);">Selecione uma turma para ver a grade.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Seção: Notas (Boletim) -->
        <div id="tab-content-notas" style="display: none;">
          <h3 style="margin-bottom: 1rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.3rem;">📊</span>
            Boletim da Turma
          </h3>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">Visualização somente leitura. Para editar notas, utilize o painel do professor.</p>

          <div class="form-group" style="margin-bottom: 1.5rem; max-width: 300px;">
            <label for="disciplina-select-notas" class="label">Disciplina</label>
            <select id="disciplina-select-notas" name="disciplina_select_notas" class="input">
              <option value="">-- Selecione uma Disciplina --</option>
            </select>
          </div>

          <div style="overflow-x: auto; border: 1px solid var(--border); border-radius: 8px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead style="background: var(--primary); color: white; font-size: 0.8rem; text-transform: uppercase;">
                <tr>
                  <th style="padding: 0.75rem; text-align: left;">Aluno</th>
                  <th style="padding: 0.75rem; text-align: center;">Faltas</th>
                  <th style="padding: 0.75rem; text-align: center;">N1</th>
                  <th style="padding: 0.75rem; text-align: center;">N2</th>
                  <th style="padding: 0.75rem; text-align: center;">N3</th>
                  <th style="padding: 0.75rem; text-align: center; background: #64748b;">Média</th>
                  <th style="padding: 0.75rem; text-align: center;">Rec</th>
                  <th style="padding: 0.75rem; text-align: center; background: #64748b;">Final</th>
                  <th style="padding: 0.75rem; text-align: center;">Status</th>
                </tr>
              </thead>
              <tbody id="tabela-notas-turma">
                <tr><td colspan="9" style="padding: 1rem; text-align: center; color: var(--text-muted);">Selecione uma disciplina para visualizar as notas.</td></tr>
              </tbody>
            </table>
    /* ------------- FUNÇÕES E EVENTOS ------------- */

  // Importar ProfessorService para as ofertas
  const { ProfessorService } = await import('../lib/professor-service')

  // 1. Criar Turma
  const formNovaTurma = container.querySelector('#form-nova-turma') as HTMLFormElement
  formNovaTurma.addEventListener('submit', async (e) => {
    e.preventDefault()
    const nome = (container.querySelector('#turma-nome') as HTMLInputElement).value
    const periodo = (container.querySelector('#turma-periodo') as HTMLInputElement).value
    const cursoId = (container.querySelector('#turma-curso') as HTMLSelectElement).value
    const btn = formNovaTurma.querySelector('button') as HTMLButtonElement

    if (!cursoId) {
      toast.error('Selecione um curso para a turma!')
      return
    }

    btn.disabled = true; btn.textContent = 'Salvando...'
    const createResult = await AcademicService.createTurma({ nome, periodo: periodo.trim(), curso_id: cursoId })
    const { data: turmaData, error } = createResult

    if (error) { toast.error('Erro: ' + error.message); btn.disabled = false; btn.textContent = 'Registrar Turma' }
    else {
      toast.success('Turma criada com sucesso!')
      setTimeout(() => { window.location.reload() }, 1000)
    }
  })

  // 2. Selecionar Turma e Carregar Dados
  const painelMatriculas = container.querySelector('#painel-matriculas') as HTMLElement
  const tituloTurma = container.querySelector('#titulo-turma-selecionada') as HTMLElement
  const tabelaAlunos = container.querySelector('#tabela-alunos-turma') as HTMLElement
  const tabelaGrade = container.querySelector('#tabela-grade-turma') as HTMLElement
  const btnMatricular = container.querySelector('#btn-matricular') as HTMLButtonElement
  const btnAdicionarOferta = container.querySelector('#btn-adicionar-oferta') as HTMLButtonElement
  
  let selectedTurmaId: string | null = null
  let selectedCursoId: string | null = null

  async function loadTurmaAlunos(turmaId: string) {
    tabelaAlunos.innerHTML = '<tr><td colspan="4" style="padding: 1rem; text-align: center;">Carregando Caderneta...</td></tr>'
    const { data: matriculas, error } = await AcademicService.getAlunosDaTurma(turmaId)
    if (error) { tabelaAlunos.innerHTML = `<tr><td colspan="4">Erro: ${escapeHTML(error.message)}</td></tr>`; return }
    if (!matriculas?.length) { tabelaAlunos.innerHTML = '<tr><td colspan="4" style="padding:1rem; text-align:center;">Nenhum aluno.</td></tr>'; return }

    tabelaAlunos.innerHTML = matriculas.map(m => {
      const perfil = (m.perfis as any)[0] || m.perfis
      return `
        <tr>
          <td style="padding:1rem;"><b>${escapeHTML(perfil?.nome_completo)}</b><br><small>${escapeHTML(perfil?.email)}</small></td>
          <td style="padding:1rem;">${escapeHTML(m.status_aluno)}</td>
          <td style="padding:1rem;">${perfil?.bloqueio_financeiro ? '🔴 BLOQUEADO' : '🟢 OK'}</td>
          <td style="padding:1rem; text-align:right;">
            <button class="btn btn-remover" data-id="${m.id}" style="padding:0.3rem 0.6rem; background:transparent; color:red; border:1px solid red;">Remover</button>
          </td>
        </tr>
      `
    }).join('')
  }

  async function loadTurmaGrade(turmaId: string) {
    tabelaGrade.innerHTML = '<tr><td colspan="4" style="padding: 2rem; text-align: center;">Carregando grade...</td></tr>'
    const { data } = await AcademicService.getDisciplinasDaTurma(turmaId)
    if (!data?.disciplinas?.length) {
      tabelaGrade.innerHTML = '<tr><td colspan="4" style="padding:2rem; text-align:center;">Nenhuma disciplina ofertada.</td></tr>'
      return
    }

    tabelaGrade.innerHTML = data.disciplinas.map(d => `
      <tr style="border-top:1px solid var(--border);">
        <td style="padding:1rem;">${escapeHTML(d.modulo || 'N/A')}</td>
        <td style="padding:1rem;"><b>${escapeHTML(d.nome)}</b></td>
        <td style="padding:1rem;">${escapeHTML(d.professor_nome)}</td>
        <td style="padding:1rem; text-align:right;">
          <button class="btn btn-remover-oferta" data-id="${d.id}" data-nome="${escapeHTML(d.nome)}" style="color:red; background:transparent; border:1px solid red; font-size:0.8rem; cursor:pointer; padding:0.2rem 0.5rem; border-radius:4px;">Excluir</button>
        </td>
      </tr>
    `).join('')

    // Adicionar eventos de exclusão de oferta
    tabelaGrade.querySelectorAll('.btn-remover-oferta').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id')
        const nome = btn.getAttribute('data-nome')
        if (!confirm(`Tem certeza que deseja remover "${nome}" desta turma?`)) return
        
        const { error } = await CourseService.removerOfertaDisciplina(id!)
        if (error) toast.error('Erro ao remover: ' + error.message)
        else {
          toast.success('Oferta removida!')
          loadTurmaGrade(turmaId)
          loadDisciplinasDropdown(turmaId)
        }
      })
    })
  }

  // Delegar evento de remover aluno
  tabelaAlunos.addEventListener('click', async (e) => {
    const btn = (e.target as HTMLElement).closest('.btn-remover') as HTMLButtonElement
    if (!btn) return
    const id = btn.getAttribute('data-id')
    if (!confirm('Deseja realmente remover este aluno da turma?')) return

    const { error } = await AcademicService.excluirMatricula(id!)
    if (error) toast.error('Erro ao remover: ' + error.message)
    else {
      toast.success('Matrícula removida!')
      if (selectedTurmaId) loadTurmaAlunos(selectedTurmaId)
    }
  })

  async function loadSelectsGrade(cursoId: string) {
    const selCat = container.querySelector('#select-catalogo-disciplina') as HTMLSelectElement
    const selProf = container.querySelector('#select-professor-oferta') as HTMLSelectElement

    // Carregar catálogo
    const { data: matriz } = await CourseService.getMatrizCurricular(cursoId)
    selCat.innerHTML = '<option value="">-- Selecione a Disciplina --</option>' + 
      (matriz?.map(d => `<option value="${d.id}">${d.nome} (${d.modulo})</option>`).join('') || '')

    // Carregar professores
    const { data: proferes } = await ProfessorService.getProfessores()
    selProf.innerHTML = '<option value="">-- Selecione o Professor --</option>' +
      (proferes?.map(p => `<option value="${p.id}">${p.nome_completo}</option>`).join('') || '')
  }

  container.querySelectorAll('.turma-item').forEach(el => {
    el.addEventListener('click', async () => {
      selectedTurmaId = el.getAttribute('data-id')
      tituloTurma.textContent = 'Turma: ' + el.getAttribute('data-nome')
      painelMatriculas.style.display = 'block'
      
      // Buscar curso_id da turma clicada
      const { data: turmas } = await AcademicService.getTurmas()
      const t = turmas?.find(x => x.id === selectedTurmaId)
      selectedCursoId = t?.curso_id || null

      loadTurmaAlunos(selectedTurmaId!)
      if (selectedCursoId) loadSelectsGrade(selectedCursoId)
      loadTurmaGrade(selectedTurmaId!)
    })
  })

  // 3. Adicionar Oferta
  btnAdicionarOferta.addEventListener('click', async () => {
    const discBaseId = (container.querySelector('#select-catalogo-disciplina') as HTMLSelectElement).value
    const profId = (container.querySelector('#select-professor-oferta') as HTMLSelectElement).value

    if (!selectedTurmaId || !discBaseId || !profId) {
      toast.error('Selecione a disciplina e o professor!')
      return
    }

    btnAdicionarOferta.disabled = true
    const { error } = await CourseService.criarOfertaDisciplina(selectedTurmaId, discBaseId, profId)
    
    if (error) { toast.error('Erro: ' + error.message) }
    else {
      toast.success('Disciplina adicionada à turma!')
      loadTurmaGrade(selectedTurmaId)
    }
    btnAdicionarOferta.disabled = false
  })

  // 4. Tabs
  const tabBtns = container.querySelectorAll('.tab-btn')
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab')
      tabBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')

      container.querySelector('#tab-content-alunos')!.setAttribute('style', `display: ${tab === 'alunos' ? 'block' : 'none'}`)
      container.querySelector('#tab-content-grade')!.setAttribute('style', `display: ${tab === 'grade' ? 'block' : 'none'}`)
      container.querySelector('#tab-content-notas')!.setAttribute('style', `display: ${tab === 'notas' ? 'block' : 'none'}`)
      
      if (tab === 'notas' && selectedTurmaId) loadDisciplinasDropdown(selectedTurmaId)
    })
  })

  async function loadDisciplinasDropdown(turmaId: string) {
    const sel = container.querySelector('#disciplina-select-notas') as HTMLSelectElement
    sel.innerHTML = '<option value="">Carregando...</option>'
    const { data } = await AcademicService.getDisciplinasDaTurma(turmaId)
    sel.innerHTML = '<option value="">-- Selecione uma Disciplina --</option>' +
      (data?.disciplinas?.map(d => `<option value="${d.disciplina_base_id}">${d.nome}</option>`).join('') || '')
  }

  container.querySelector('#disciplina-select-notas')?.addEventListener('change', async (e) => {
    const discId = (e.target as HTMLSelectElement).value
    if (selectedTurmaId && discId) loadTurmaNotas(selectedTurmaId, discId)
  })

  async function loadTurmaNotas(turmaId: string, discBaseId: string) {
    const tab = container.querySelector('#tabela-notas-turma') as HTMLElement
    tab.innerHTML = '<tr><td colspan="9">Carregando notas...</td></tr>'
    const { data } = await AcademicService.getNotasCompletasTurma(turmaId, discBaseId)
    if (!data?.alunos?.length) { tab.innerHTML = '<tr><td colspan="9">Nenhum aluno.</td></tr>'; return }

    tab.innerHTML = data.alunos.map(m => {
      const p = (m.perfis as any)[0] || m.perfis
      const n = data.notasMap[p?.id] || {}
      return `<tr><td style="padding:0.5rem;">${escapeHTML(p?.nome_completo)}</td><td style="text-align:center;">${n.faltas || 0}</td><td style="text-align:center;">${n.n1 || 0}</td><td style="text-align:center;">${n.n2 || 0}</td><td style="text-align:center;">${n.n3 || 0}</td><td style="text-align:center;">-</td><td style="text-align:center;">${n.rec || 0}</td><td style="text-align:center;">-</td><td style="text-align:center;">Ativo</td></tr>`
    }).join('')
  }

  return container
}
