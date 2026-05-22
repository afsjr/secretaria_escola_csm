import { supabase } from '../lib/supabase'
import { AcademicService } from '../lib/academic-service'
import { CourseService } from '../lib/course-service'
import { AuditService } from '../lib/audit-service'
import { toast } from '../lib/toast'
import { escapeHTML, createOption } from '../lib/security'
import { calcularMediaParcial, calcularNotaFinal, calcularStatusAluno } from '../lib/grades-utils'
import { skeletonLine, skeletonRowSpan, skeletonTable } from '../components/skeleton'
import { ICONS } from '../lib/icons'

export async function GestaoTurmasView(profile?: { id: string; perfil: string }): Promise<HTMLElement> {
  const container = document.createElement('div')
  container.className = 'gestao-turmas-view animate-in'

  const hash = window.location.hash
  const params = new URLSearchParams(hash.split('?')[1] || '')
  const matricularAlunoId = params.get('matricular')

  const userProfile = profile || { id: '', perfil: 'secretaria' }
  const canManageTurmas = userProfile.perfil === 'secretaria' || userProfile.perfil === 'coordenacao' || userProfile.perfil === 'admin' || userProfile.perfil === 'master_admin'

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

  // Se há parâmetro matricular, buscar dados do aluno
  if (matricularAlunoId) {
    const alunoData = alunos?.find((a: any) => a.id === matricularAlunoId)
    if (alunoData) {
      console.log('[GestaoTurmas] Matricular aluno:', alunoData.nome_completo)
    }
  }

  const turmasList = !turmas || turmas.length === 0
    ? '<p style="color:var(--text-muted);font-size:0.8rem;">Nenhuma turma registrada.</p>'
    : turmas?.map((t: any) => {
      const statusBg = t.status_ingresso === 'aberta' ? 'var(--success-bg)' : '#FEE2E2'
      const statusColor = t.status_ingresso === 'aberta' ? 'var(--success-text)' : '#991B1B'
      const manageButtons = canManageTurmas ? `
        <div style="margin-top: 0.5rem; display: flex; gap: 6px;">
          <button type="button" class="btn-editar-turma" data-id="${escapeHTML(t.id)}" data-nome="${escapeHTML(t.nome)}" title="Editar nome da turma" style="background: transparent; border: 1px solid var(--accent); color: var(--accent); font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; cursor: pointer;">${ICONS.edit} Editar</button>
          <button type="button" class="btn-excluir-turma" data-id="${escapeHTML(t.id)}" data-nome="${escapeHTML(t.nome)}" title="Excluir turma" style="background: transparent; border: 1px solid var(--danger); color: var(--danger); font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; cursor: pointer;">${ICONS.trash} Excluir</button>
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
            ${ICONS.users} Alunos
          </button>
          <button type="button" class="tab-btn" data-tab="grade" style="padding: 0.75rem 1.5rem; border: none; background: transparent; color: var(--text-muted); font-weight: 500; cursor: pointer;">
            ${ICONS.book} Grade (Ofertas)
          </button>
          <button type="button" class="tab-btn" data-tab="notas" style="padding: 0.75rem 1.5rem; border: none; background: transparent; color: var(--text-muted); font-weight: 500; cursor: pointer;">
            ${ICONS.chart} Notas
          </button>
          <button type="button" class="tab-btn" data-tab="calendario" style="padding: 0.75rem 1.5rem; border: none; background: transparent; color: var(--text-muted); font-weight: 500; cursor: pointer;">
            ${ICONS.calendar} Calendário
          </button>
        </div>

        <!-- Seção: Alunos (Matrículas) -->
        <div id="tab-content-alunos">
          <!-- Matricular Aluno - DESTAQUE -->
          <div style="background: linear-gradient(135deg, #FFF9E6 0%, #FFF4B8 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; border: 2px solid var(--accent); box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);">
            <h4 style="margin-bottom: 1rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
              ${ICONS.graduation}
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
              <div class="form-group" style="flex: 0; margin: 0; min-width: 140px;">
                <label for="data-matricula" class="label" style="font-size: 0.85rem; font-weight: 600;">Data de Início</label>
                <input type="date" id="data-matricula" class="input" value="${new Date().toISOString().split('T')[0]}">
              </div>
              <button id="btn-matricular" class="btn btn-primary" style="background: var(--primary); white-space: nowrap; padding: 0.75rem 1.5rem; font-weight: 600;">
                ${ICONS.check} Matricular na Turma
              </button>
            </div>
          </div>

          <!-- Tabela de Alunos na Turma -->
          <h3 style="margin-bottom: 1rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
            ${ICONS.clipboard}
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
          <h3 style="margin-bottom: 1rem; color: var(--text-main);">Grade da Turma</h3>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">Disciplinas do curso ofertadas nesta turma. A associação de professor é feita no Painel Secretaria &rarr; Gerenciar Professores.</p>

          <div style="overflow-x: auto; border: 1px solid var(--border); border-radius: 8px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead style="background: var(--secondary); color: var(--text-main); font-size: 0.85rem;">
                <tr>
                  <th style="padding: 1rem;">Módulo</th>
                  <th style="padding: 1rem;">Disciplina</th>
                  <th style="padding: 1rem;">Professor</th>
                </tr>
              </thead>
              <tbody id="tabela-grade-turma">
                <tr><td colspan="3" style="padding: 2rem; text-align: center; color: var(--text-muted);">Selecione uma turma para ver a grade.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Seção: Calendário Acadêmico -->
        <div id="tab-content-calendario" style="display: none;">
          <h3 style="margin-bottom: 1rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
            ${ICONS.calendar}
            Calendário Acadêmico
          </h3>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">Defina o período de início e fim de cada disciplina. Disciplinas já encerradas na data da matrícula do aluno serão marcadas como "Falta cursar".</p>

          <div style="overflow-x: auto; border: 1px solid var(--border); border-radius: 8px;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead style="background: var(--primary); color: white; font-size: 0.85rem;">
                <tr>
                  <th style="padding: 0.75rem;">Módulo</th>
                  <th style="padding: 0.75rem;">Disciplina</th>
                  <th style="padding: 0.75rem;">Professor</th>
                  <th style="padding: 0.75rem;">Data Início</th>
                  <th style="padding: 0.75rem;">Data Fim</th>
                  <th style="padding: 0.75rem; text-align: center;">Situação</th>
                </tr>
              </thead>
              <tbody id="tabela-calendario">
                <tr><td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-muted);">Selecione uma turma para ver o calendário.</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Seção: Notas (Boletim) -->
        <div id="tab-content-notas" style="display: none;">
          <h3 style="margin-bottom: 1rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
            ${ICONS.chart}
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
          </div>
        </div>
      </div>
    </div>
  `

  /* ------------- FUNÇÕES E EVENTOS ------------- */

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

  // 1.5. Editar e Excluir Turmas
  container.querySelectorAll('.btn-editar-turma').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const li = (btn as HTMLElement).closest('.turma-item') as HTMLElement
      const turmaId = li.getAttribute('data-id')
      const display = li.querySelector('.turma-nome-display') as HTMLElement
      const input = li.querySelector('.turma-nome-input') as HTMLInputElement
      const originalName = display.textContent || ''

      display.style.display = 'none'
      input.style.display = 'inline'
      input.value = originalName
      input.focus()

      const salvar = async () => {
        const novoNome = input.value.trim()
        if (!novoNome) { toast.error('Nome não pode ficar vazio'); return }
        const { error } = await AcademicService.updateTurma(turmaId, { nome: novoNome })
        if (error) toast.error('Erro ao atualizar: ' + error.message)
        else {
          toast.success('Nome atualizado!')
          display.textContent = novoNome
        }
        display.style.display = ''
        input.style.display = 'none'
      }

      input.onkeydown = (e) => { if (e.key === 'Enter') salvar() }
      input.onblur = salvar
    })
  })

  container.querySelectorAll('.btn-excluir-turma').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const turmaId = btn.getAttribute('data-id')
      const turmaNome = btn.getAttribute('data-nome')
      if (!turmaId) return

      const { data: matriculas } = await AcademicService.getAlunosDaTurma(turmaId)
      const temMatriculas = matriculas && matriculas.length > 0

      if (temMatriculas) {
        const confirmarInativar = confirm(
          `⚠️ ATENÇÃO: A turma "${turmaNome}" possui ${matriculas.length} aluno(s) matriculado(s).\n\n` +
          `Como existem alunos associados, NÃO é possível excluir a turma.\n\n` +
          `Deseja MARCAR A TURMA COMO INATIVA no lugar?\n` +
          `Os dados dos alunos (notas, frequência) serão mantidos.`
        )
        if (!confirmarInativar) return

        const { error } = await AcademicService.updateTurma(turmaId, { status_ingresso: 'fechada' })
        if (error) toast.error('Erro ao inativar: ' + error.message)
        else {
          toast.success('Turma marcada como inativa! Dados preservados.')
          setTimeout(() => { window.location.reload() }, 500)
        }
      } else {
        if (!confirm(`✅ Tem certeza que deseja excluir a turma "${turmaNome}"?\n\nEsta turma está vazia e pode ser removida com segurança.`)) return

        const { error } = await AcademicService.deleteTurma(turmaId)
        if (error) toast.error('Erro ao excluir: ' + error.message)
        else {
          toast.success('Turma excluída!')
          setTimeout(() => { window.location.reload() }, 500)
        }
      }
    })
  })

  // 2. Selecionar Turma e Carregar Dados
  const painelMatriculas = container.querySelector('#painel-matriculas') as HTMLElement
  const tituloTurma = container.querySelector('#titulo-turma-selecionada') as HTMLElement
  const tabelaAlunos = container.querySelector('#tabela-alunos-turma') as HTMLElement
  const tabelaGrade = container.querySelector('#tabela-grade-turma') as HTMLElement
  const tabelaCalendario = container.querySelector('#tabela-calendario') as HTMLElement
  const btnMatricular = container.querySelector('#btn-matricular') as HTMLButtonElement
  
  let selectedTurmaId: string | null = null
  let selectedCursoId: string | null = null
  let selectedCursoTipo: string | null = null

  async function loadTurmaAlunos(turmaId: string) {
    tabelaAlunos.innerHTML = skeletonRowSpan(4)
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
    tabelaGrade.innerHTML = skeletonRowSpan(3)

    if (!selectedCursoId) {
      tabelaGrade.innerHTML = '<tr><td colspan="3" style="padding:2rem; text-align:center; color:var(--text-muted);">Turma sem curso vinculado. Não é possível listar as disciplinas.</td></tr>'
      return
    }

    // Buscar TODAS as disciplinas do catálogo do curso
    const { data: catalogo, error: errCatalogo } = await supabase
      .from('disciplinas_base')
      .select('id, nome, modulo')
      .eq('curso_id', selectedCursoId)
      .order('modulo')
      .order('nome')

    if (errCatalogo) {
      tabelaGrade.innerHTML = `<tr><td colspan="3" style="padding:2rem; text-align:center; color:var(--danger);">Erro ao carregar catálogo: ${escapeHTML(errCatalogo.message)}</td></tr>`
      return
    }

    if (!catalogo?.length) {
      tabelaGrade.innerHTML = '<tr><td colspan="3" style="padding:2rem; text-align:center; color:var(--text-muted);">Nenhuma disciplina cadastrada no catálogo deste curso.</td></tr>'
      return
    }

    // Buscar ofertas já criadas para esta turma (com professor)
    const { data: ofertas } = await supabase
      .from('turma_disciplinas')
      .select('disciplina_base_id, professor_id, perfis(id, nome_completo)')
      .eq('turma_id', turmaId)

    const ofertasMap: Record<string, { professor_id: string; professor_nome: string }> = {}
    if (ofertas) {
      for (const o of ofertas) {
        const rawPerfis = o.perfis as any
        const prof = Array.isArray(rawPerfis) ? rawPerfis[0] : rawPerfis
        ofertasMap[o.disciplina_base_id] = {
          professor_id: o.professor_id || '',
          professor_nome: o.professor_id && prof?.nome_completo ? prof.nome_completo : ''
        }
      }
    }

    tabelaGrade.innerHTML = catalogo.map(disc => {
      const oferta = ofertasMap[disc.id]
      const professorNome = oferta?.professor_nome || '<span style="color:var(--text-muted);">Sem professor</span>'
      return `
        <tr style="border-top:1px solid var(--border);">
          <td style="padding:1rem;">${escapeHTML(disc.modulo || 'N/A')}</td>
          <td style="padding:1rem;"><b>${escapeHTML(disc.nome)}</b></td>
          <td style="padding:1rem;">${professorNome}</td>
        </tr>
      `
    }).join('')
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

  async function loadTurmaCalendario(turmaId: string) {
    tabelaCalendario.innerHTML = skeletonRowSpan(6)
    const { data: ofertas, error } = await CourseService.getOfertasDaTurmaComDatas(turmaId)
    if (error) { tabelaCalendario.innerHTML = `<tr><td colspan="6">Erro: ${escapeHTML(error.message)}</td></tr>`; return }
    if (!ofertas?.length) { tabelaCalendario.innerHTML = '<tr><td colspan="6" style="padding:2rem;text-align:center;">Nenhuma disciplina no calendário.</td></tr>'; return }

    const hoje = new Date().toISOString().split('T')[0]
    tabelaCalendario.innerHTML = ofertas.map(o => {
      const disc = o.disciplinas_base as any
      const prof = o.perfis as any
      const situacao = o.data_inicio && o.data_fim
        ? (hoje > o.data_fim ? '<span style="color:var(--success-text);font-weight:600;">Encerrada</span>'
          : hoje < o.data_inicio ? '<span style="color:var(--accent);">Prevista</span>'
          : '<span style="color:var(--primary);font-weight:600;">Em andamento</span>')
        : '<span style="color:var(--text-muted);">Sem datas</span>'
      return `
        <tr style="border-top:1px solid var(--border);">
          <td style="padding:0.75rem;">${escapeHTML(disc?.modulo || '')}</td>
          <td style="padding:0.75rem;"><b>${escapeHTML(disc?.nome || '')}</b></td>
          <td style="padding:0.75rem;">${escapeHTML(prof?.nome_completo || 'Sem prof.')}</td>
          <td style="padding:0.4rem;">
            <input type="date" class="input calendario-inicio" data-oferta-id="${o.id}" value="${o.data_inicio || ''}" style="width:140px;padding:0.3rem;font-size:0.8rem;">
          </td>
          <td style="padding:0.4rem;">
            <input type="date" class="input calendario-fim" data-oferta-id="${o.id}" value="${o.data_fim || ''}" style="width:140px;padding:0.3rem;font-size:0.8rem;">
          </td>
          <td style="padding:0.75rem;text-align:center;">${situacao}</td>
        </tr>
      `
    }).join('')

    // Auto-save on date change
    tabelaCalendario.querySelectorAll('.calendario-inicio').forEach(input => {
      input.addEventListener('change', async () => {
        const ofertaId = input.getAttribute('data-oferta-id')
        const inicio = (input as HTMLInputElement).value
        const fimInput = tabelaCalendario.querySelector(`.calendario-fim[data-oferta-id="${ofertaId}"]`) as HTMLInputElement
        const fim = fimInput?.value || null
        if (!ofertaId) return
        const { error } = await CourseService.atualizarDatasOferta(ofertaId, inicio, fim || '')
        if (error) toast.error('Erro ao salvar data: ' + error.message)
        else { toast.success('Calendário atualizado!'); loadTurmaCalendario(turmaId); reprocessarPendenciasDaTurma(turmaId) }
      })
    })
    tabelaCalendario.querySelectorAll('.calendario-fim').forEach(input => {
      input.addEventListener('change', async () => {
        const ofertaId = input.getAttribute('data-oferta-id')
        const fim = (input as HTMLInputElement).value
        const inicioInput = tabelaCalendario.querySelector(`.calendario-inicio[data-oferta-id="${ofertaId}"]`) as HTMLInputElement
        const inicio = inicioInput?.value || null
        if (!ofertaId) return
        const { error } = await CourseService.atualizarDatasOferta(ofertaId, inicio || '', fim)
        if (error) toast.error('Erro ao salvar data: ' + error.message)
        else { toast.success('Calendário atualizado!'); loadTurmaCalendario(turmaId); reprocessarPendenciasDaTurma(turmaId) }
      })
    })
  }

  async function reprocessarPendenciasDaTurma(turmaId: string) {
    const { data: matriculas } = await supabase
      .from('matriculas')
      .select('aluno_id, data_matricula')
      .eq('turma_id', turmaId)
      .eq('status_aluno', 'ativo')
    if (!matriculas?.length) return
    for (const m of matriculas) {
      if (m.data_matricula) await verificarPendencias(m.aluno_id, turmaId, m.data_matricula)
    }
  }

  async function verificarPendencias(alunoId: string, turmaId: string, dataMatricula: string) {
    const { data: ofertas } = await CourseService.getOfertasDaTurmaComDatas(turmaId)
    if (!ofertas?.length) return

    for (const oferta of ofertas) {
      if (oferta.data_fim && oferta.data_fim < dataMatricula) {
        const { data: existente } = await supabase
          .from('boletim')
          .select('id, status')
          .eq('aluno_id', alunoId)
          .eq('disciplina_base_id', oferta.disciplina_base_id)
          .maybeSingle()

        if (!existente) {
          const discNome = (oferta.disciplinas_base as any)?.nome || 'Disciplina'
          await supabase.from('boletim').insert({
            aluno_id: alunoId,
            disciplina: discNome,
            disciplina_base_id: oferta.disciplina_base_id,
            faltas: 0,
            n1: null, n2: null, n3: null, rec: null,
            status: 'pendente',
            versao: 1
          })
        } else if (existente.status !== 'pendente') {
          await supabase.from('boletim')
            .update({ status: 'pendente' })
            .eq('id', existente.id)
        }
      }
    }
  }

  function toggleTabsPorTipo() {
    const isFormacao = selectedCursoTipo === 'formacao'
    const tabBtnsAll = container.querySelectorAll<HTMLElement>('.tab-btn')

    tabBtnsAll.forEach(btn => {
      const tab = btn.getAttribute('data-tab')
      if (tab === 'grade' || tab === 'notas') {
        btn.style.display = isFormacao ? 'none' : ''
      }
    })

    const gradeContent = container.querySelector('#tab-content-grade') as HTMLElement
    const notasContent = container.querySelector('#tab-content-notas') as HTMLElement
    const alunosContent = container.querySelector('#tab-content-alunos') as HTMLElement

    if (isFormacao) {
      gradeContent.style.display = 'none'
      notasContent.style.display = 'none'
      alunosContent.style.display = 'block'

      tabBtnsAll.forEach(b => {
        b.classList.remove('active')
        if (b.getAttribute('data-tab') === 'alunos') b.classList.add('active')
      })
    }
  }

  container.querySelectorAll('.turma-item').forEach(el => {
    el.addEventListener('click', async () => {
      selectedTurmaId = el.getAttribute('data-id')
      tituloTurma.textContent = 'Turma: ' + el.getAttribute('data-nome')
      painelMatriculas.style.display = 'block'
      
      // Buscar curso_id e tipo da turma clicada
      const { data: turmas } = await AcademicService.getTurmas()
      const t = turmas?.find(x => x.id === selectedTurmaId)
      selectedCursoId = t?.curso_id || null
      selectedCursoTipo = await AcademicService.getTipoDaTurma(selectedTurmaId!)

      loadTurmaAlunos(selectedTurmaId!)
      loadTurmaGrade(selectedTurmaId!)
      loadTurmaCalendario(selectedTurmaId!)
      toggleTabsPorTipo()
    })
  })

  // 5. Matricular Aluno
  btnMatricular.addEventListener('click', async () => {
    const alunoId = (container.querySelector('#aluno-select') as HTMLSelectElement).value
    const dataMatricula = (container.querySelector('#data-matricula') as HTMLInputElement).value

    if (!selectedTurmaId || !alunoId) {
      toast.error('Selecione um aluno!')
      return
    }
    if (!dataMatricula) {
      toast.error('Informe a data de início!')
      return
    }

    btnMatricular.disabled = true
    btnMatricular.textContent = 'Matriculando...'

    const { data: matricula, error } = await AcademicService.matricularAluno(alunoId, selectedTurmaId)

    if (error) {
      toast.error('Erro ao matricular: ' + error.message)
      btnMatricular.disabled = false
      btnMatricular.innerHTML = `${ICONS.check} Matricular na Turma`
      return
    }

    // Atualizar data_matricula na matrícula criada
    if (matricula?.id) {
      await supabase.from('matriculas').update({ data_matricula: dataMatricula }).eq('id', matricula.id)
    }

    // Verificar pendências com base no calendário
    await verificarPendencias(alunoId, selectedTurmaId, dataMatricula)

    toast.success('Aluno matriculado com sucesso!')
    btnMatricular.disabled = false
    btnMatricular.innerHTML = `${ICONS.check} Matricular na Turma`
    loadTurmaAlunos(selectedTurmaId)
  })

  // 3. Tabs (com animação fadeInScale via tab-enter)
  const TABS = ['alunos', 'grade', 'notas', 'calendario'] as const
  const tabBtns = container.querySelectorAll('.tab-btn')
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab') as typeof TABS[number] | null
      if (!tab) return
      tabBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')

      for (const id of TABS) {
        const el = container.querySelector(`#tab-content-${id}`) as HTMLElement | null
        if (!el) continue
        if (id === tab) {
          el.style.display = 'block'
          el.classList.remove('tab-enter')
          void el.offsetWidth
          el.classList.add('tab-enter')
        } else {
          el.style.display = 'none'
        }
      }

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
    tab.innerHTML = skeletonRowSpan(9)
    const { data } = await AcademicService.getNotasCompletasTurma(turmaId, discBaseId)
    if (!data?.alunos?.length) { tab.innerHTML = '<tr><td colspan="9">Nenhum aluno.</td></tr>'; return }

    tab.innerHTML = data.alunos.map(m => {
      const p = (m.perfis as any)[0] || m.perfis
      const n = data.notasMap[p?.id] || {}

      if (n.status === 'pendente') {
        return `<tr style="opacity:0.7;">
          <td style="padding:0.5rem;">${escapeHTML(p?.nome_completo)} <span style="font-size:0.7rem;color:var(--text-muted);">(matrícula tardia)</span></td>
          <td style="text-align:center;">-</td>
          <td style="text-align:center;">-</td>
          <td style="text-align:center;">-</td>
          <td style="text-align:center;">-</td>
          <td style="text-align:center;">-</td>
          <td style="text-align:center;">-</td>
          <td style="text-align:center;">-</td>
          <td style="text-align:center;"><span class="badge badge-warning" style="background:#f59e0b20;color:#b45309;border:1px solid #f59e0b;">Falta cursar</span></td>
        </tr>`
      }

      const n1 = n.n1 || 0
      const n2 = n.n2 || 0
      const n3 = n.n3 || 0
      const rec = n.rec || 0
      const media = calcularMediaParcial(n1, n2, n3)
      const final = calcularNotaFinal(media, rec)
      const status = n.status === 'pendente' ? 'Falta cursar' : (final > 0 ? calcularStatusAluno(final) : 'Cursando')
      return `<tr>
        <td style="padding:0.5rem;">${escapeHTML(p?.nome_completo)}</td>
        <td style="text-align:center;">${n.faltas || 0}</td>
        <td style="text-align:center;">${n1.toFixed(1)}</td>
        <td style="text-align:center;">${n2.toFixed(1)}</td>
        <td style="text-align:center;">${n3.toFixed(1)}</td>
        <td style="text-align:center; font-weight:600;">${media > 0 ? media.toFixed(1) : '-'}</td>
        <td style="text-align:center;">${rec > 0 ? rec.toFixed(1) : '-'}</td>
        <td style="text-align:center; font-weight:600;">${final > 0 ? final.toFixed(1) : '-'}</td>
        <td style="text-align:center;"><span class="badge ${status === 'Aprovado' ? 'badge-success' : status === 'Reprovado' ? 'badge-danger' : status === 'Falta cursar' ? 'badge-warning' : 'badge-warning'}">${status}</span></td>
      </tr>`
    }).join('')
  }

  return container
}
