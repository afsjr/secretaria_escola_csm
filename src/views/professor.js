import { ProfessorService } from '../lib/professor-service'
import { toast } from '../lib/toast'

// Helper para prevenir XSS
const escapeHTML = (str) => {
  if (!str) return ''
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag]))
}

export async function ProfessorView(profile) {
  const container = document.createElement('div')
  container.className = 'professor-view animate-in'

  // Buscar disciplinas do professor com turmas vinculadas
  const { data: disciplinas, error: errorDisciplinas } = await ProfessorService.getDisciplinasDoProfessor(profile.id)
  const { data: turmasDoProfessor, error: errorTurmas } = await ProfessorService.getTurmasDoProfessor(profile.id)

  if (errorDisciplinas) {
    toast.error('Erro ao carregar disciplinas: ' + errorDisciplinas.message)
  }

  // =====================================================
  // ABA 1: MINHAS DISCIPLINAS (Agrupadas por Período)
  // =====================================================
  const renderMinhasDisciplinas = () => {
    if (errorDisciplinas) return `<p class="error-text">Erro ao carregar disciplinas.</p>`
    if (!disciplinas || disciplinas.length === 0) return '<p>Você não possui disciplinas vinculadas.</p>'

    // Agrupar disciplinas por período
    const disciplinasPorPeriodo = {}
    disciplinas.forEach(d => {
      const periodo = d.turmas?.periodo || 'Sem Turma'
      if (!disciplinasPorPeriodo[periodo]) {
        disciplinasPorPeriodo[periodo] = []
      }
      disciplinasPorPeriodo[periodo].push(d)
    })

    // Ordenar períodos (mais recente primeiro)
    const periodos = Object.keys(disciplinasPorPeriodo).sort((a, b) => {
      if (a === 'Sem Turma') return 1
      if (b === 'Sem Turma') return -1
      return b.localeCompare(a)
    })

    return `
      <div style="display: flex; flex-direction: column; gap: 2rem;">
        ${periodos.map(periodo => `
          <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <h3 style="margin: 0; color: var(--text-main);">
                <span style="color: var(--primary);">Período:</span> ${escapeHTML(periodo)}
              </h3>
              <span class="badge" style="background: var(--secondary); color: var(--text-main);">
                ${disciplinasPorPeriodo[periodo].length} disciplina(s)
              </span>
            </div>
            
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Disciplina</th>
                    <th>Módulo</th>
                    <th>Turma</th>
                    <th>Alunos</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  ${disciplinasPorPeriodo[periodo].map(d => `
                    <tr>
                      <td>
                        <div class="fw-600 text-main">${escapeHTML(d.nome)}</div>
                      </td>
                      <td>${escapeHTML(d.modulo)}</td>
                      <td>${d.turmas ? escapeHTML(d.turmas.nome) : '<span style="color: var(--text-muted);">—</span>'}</td>
                      <td>
                        ${d.turmas ? `
                          <button class="btn btn-secondary btn-sm btn-contar-alunos" data-turma="${d.turmas.id}" style="padding: 0.2rem 0.5rem; font-size: 0.75rem;">
                            Ver Alunos
                          </button>
                        ` : '<span style="color: var(--text-muted);">—</span>'}
                      </td>
                      <td>
                        <div style="display: flex; gap: 5px;">
                          <button class="btn btn-primary btn-sm btn-lancar-notas" data-disciplina="${escapeHTML(d.nome)}" data-disciplina-id="${d.id}" data-turma="${d.turmas?.id || ''}" ${!d.turmas ? 'disabled' : ''} style="font-size: 0.75rem;">
                            Notas
                          </button>
                          <button class="btn btn-secondary btn-sm btn-registrar-aula" data-id="${d.id}" data-nome="${escapeHTML(d.nome)}" style="font-size: 0.75rem;">
                            Aulas
                          </button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        `).join('')}
      </div>
    `
  }

  // =====================================================
  // ABA 2: LANÇAR NOTAS (Fluxo Otimizado)
  // =====================================================
  const renderLancarNotas = () => `
    <div id="painel-notas">
      <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        <div style="margin-bottom: 1.5rem;">
          <h3 style="margin: 0 0 0.5rem 0; color: var(--text-main);">Lançar Notas</h3>
          <p style="margin: 0; color: var(--text-muted); font-size: 0.9rem;">Selecione uma disciplina para ver e editar as notas dos alunos.</p>
        </div>

        <!-- Seletor de Disciplina -->
        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
          <div class="form-group" style="flex: 1; margin: 0;">
            <label class="label" for="select-disciplina-notas">Selecione a Disciplina:</label>
            <select id="select-disciplina-notas" class="input">
              <option value="">-- Escolha uma disciplina com turma vinculada --</option>
              ${disciplinas?.filter(d => d.turmas).map(d => `
                <option value="${d.id}" data-nome="${escapeHTML(d.nome)}" data-turma="${d.turmas.id}" data-turma-nome="${escapeHTML(d.turmas.nome)}">
                  ${escapeHTML(d.nome)} (${escapeHTML(d.modulo)}) - ${escapeHTML(d.turmas.nome)}
                </option>
              `).join('') || ''}
            </select>
          </div>
        </div>

        <div id="tabela-notas-container">
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
            <p>Selecione uma disciplina acima para carregar os alunos.</p>
          </div>
        </div>
      </div>
    </div>
  `

  // =====================================================
  // ABA 3: REGISTRO DE AULAS (Melhorada)
  // =====================================================
  const renderRegistroAulas = () => `
    <div id="painel-aulas">
      <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        <div style="margin-bottom: 1.5rem;">
          <h3 style="margin: 0 0 0.5rem 0; color: var(--text-main);">Registro de Aulas</h3>
          <p style="margin: 0; color: var(--text-muted); font-size: 0.9rem;">Registre o conteúdo ministrado em cada aula.</p>
        </div>

        <!-- Seletor de Disciplina -->
        <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
          <div class="form-group" style="flex: 1; margin: 0;">
            <label class="label" for="select-disciplina-aulas">Selecione a Disciplina:</label>
            <select id="select-disciplina-aulas" class="input">
              <option value="">-- Escolha uma disciplina --</option>
              ${disciplinas?.map(d => `
                <option value="${d.id}" data-nome="${escapeHTML(d.nome)}" data-modulo="${escapeHTML(d.modulo)}">
                  ${escapeHTML(d.nome)} (${escapeHTML(d.modulo)})
                </option>
              `).join('') || ''}
            </select>
          </div>
        </div>

        <div id="tabela-aulas-container">
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
            <p>Selecione uma disciplina acima para ver e registrar aulas.</p>
          </div>
        </div>
      </div>
    </div>
  `

  // =====================================================
  // ESTRUTURA PRINCIPAL
  // =====================================================
  container.innerHTML = `
    <header class="view-header">
      <h1 class="title">Painel do Professor</h1>
      <p class="subtitle">Gerencie suas disciplinas, notas e registros de aulas.</p>
    </header>

    <div class="tabs-container">
      <button class="tab-btn active" data-tab="disciplinas">Minhas Disciplinas</button>
      <button class="tab-btn" data-tab="notas">Lançar Notas</button>
      <button class="tab-btn" data-tab="aulas">Registro de Aulas</button>
    </div>

    <div id="tab-disciplinas" class="tab-content">
      ${renderMinhasDisciplinas()}
    </div>

    <div id="tab-notas" class="tab-content" style="display: none;">
      ${renderLancarNotas()}
    </div>

    <div id="tab-aulas" class="tab-content" style="display: none;">
      ${renderRegistroAulas()}
    </div>
  `

  // =====================================================
  // LÓGICA DAS TABS
  // =====================================================
  const tabBtns = container.querySelectorAll('.tab-btn')
  const tabContents = container.querySelectorAll('.tab-content')

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab')
      
      tabBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      
      tabContents.forEach(content => {
        content.style.display = 'none'
      })
      container.querySelector(`#tab-${tab}`).style.display = 'block'
    })
  })

  // =====================================================
  // LÓGICA DA ABA 1: CONTAR ALUNOS POR TURMA
  // =====================================================
  const btnsContarAlunos = container.querySelectorAll('.btn-contar-alunos')
  btnsContarAlunos.forEach(btn => {
    btn.addEventListener('click', async () => {
      const turmaId = btn.getAttribute('data-turma')
      btn.disabled = true
      btn.textContent = '...'

      const { count, error } = await ProfessorService.contarAlunosTurma(turmaId)

      if (error) {
        toast.error('Erro ao contar alunos: ' + error.message)
        btn.textContent = 'Erro'
      } else {
        btn.textContent = `${count} aluno(s)`
      }

      setTimeout(() => {
        btn.disabled = false
        btn.textContent = 'Ver Alunos'
      }, 3000)
    })
  })

  // =====================================================
  // LÓGICA DA ABA 2: LANÇAR NOTAS (Otimizada)
  // =====================================================
  const selectDisciplinaNotas = container.querySelector('#select-disciplina-notas')
  const tabelaNotasContainer = container.querySelector('#tabela-notas-container')

  selectDisciplinaNotas.addEventListener('change', async () => {
    const selectedOption = selectDisciplinaNotas.options[selectDisciplinaNotas.selectedIndex]
    
    if (!selectedOption.value) {
      tabelaNotasContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <p>Selecione uma disciplina acima para carregar os alunos.</p>
        </div>
      `
      return
    }

    const disciplinaNome = selectedOption.getAttribute('data-nome')
    const turmaId = selectedOption.getAttribute('data-turma')

    tabelaNotasContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">Carregando alunos...</p>'

    const { data: alunosComNotas, error } = await ProfessorService.getNotasDaDisciplina(disciplinaNome, turmaId)

    if (error) {
      tabelaNotasContainer.innerHTML = `<p class="error-text">Erro ao carregar alunos: ${error.message}</p>`
      return
    }

    if (!alunosComNotas || alunosComNotas.length === 0) {
      tabelaNotasContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <p>Não há alunos matriculados nesta turma.</p>
        </div>
      `
      return
    }

    // Renderizar tabela de notas
    tabelaNotasContainer.innerHTML = `
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 25%;">Aluno</th>
              <th style="text-align: center;">Faltas</th>
              <th style="text-align: center;">N1</th>
              <th style="text-align: center;">N2</th>
              <th style="text-align: center;">N3</th>
              <th style="text-align: center; background: var(--secondary);">Média</th>
              <th style="text-align: center;">Rec.</th>
              <th style="text-align: center; background: var(--accent-light);">Final</th>
            </tr>
          </thead>
          <tbody>
            ${alunosComNotas.map(a => `
              <tr class="nota-row" data-aluno-id="${a.aluno_id}">
                <td>
                  <div class="fw-600 text-main" style="font-size: 0.9rem;">${escapeHTML(a.aluno_nome)}</div>
                  <div style="font-size: 0.7rem; color: var(--text-muted);">${escapeHTML(a.aluno_email)}</div>
                </td>
                <td style="text-align: center;">
                  <input type="number" class="input faltas-input" min="0" value="${a.nota?.faltas || 0}" style="width: 50px; padding: 0.3rem; text-align: center;">
                </td>
                <td style="text-align: center;">
                  <input type="number" class="input nota-input" min="0" max="10" step="0.1" value="${a.nota?.n1 || ''}" placeholder="—" style="width: 55px; padding: 0.3rem; text-align: center;">
                </td>
                <td style="text-align: center;">
                  <input type="number" class="input nota-input" min="0" max="10" step="0.1" value="${a.nota?.n2 || ''}" placeholder="—" style="width: 55px; padding: 0.3rem; text-align: center;">
                </td>
                <td style="text-align: center;">
                  <input type="number" class="input nota-input" min="0" max="10" step="0.1" value="${a.nota?.n3 || ''}" placeholder="—" style="width: 55px; padding: 0.3rem; text-align: center;">
                </td>
                <td class="media-teoria" style="text-align: center; font-weight: bold; background: #f0f8ff;">
                  —
                </td>
                <td style="text-align: center;">
                  <input type="number" class="input rec-input" min="0" max="10" step="0.1" value="${a.nota?.rec || ''}" placeholder="—" style="width: 55px; padding: 0.3rem; text-align: center;">
                </td>
                <td class="media-final" style="text-align: center; font-weight: bold; color: var(--primary); background: #fff8e6;">
                  —
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--secondary);">
        <div style="font-size: 0.8rem; color: var(--text-muted);">
          <span style="color: var(--success);">■</span> Aprovado (≥ 7.0) &nbsp;
          <span style="color: var(--danger);">■</span> Reprovado (< 7.0)
        </div>
        <button class="btn btn-primary" id="btn-salvar-todas-notas">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Salvar Todas as Notas
        </button>
      </div>
    `

    // Configurar cálculo automático de médias
    const rows = tabelaNotasContainer.querySelectorAll('.nota-row')
    rows.forEach(row => {
      const notasInputs = row.querySelectorAll('.nota-input')
      const mediaTeoriaCell = row.querySelector('.media-teoria')
      const recInput = row.querySelector('.rec-input')
      const mediaFinalCell = row.querySelector('.media-final')

      const calculateGrades = () => {
        let sum = 0
        let count = 0
        notasInputs.forEach(input => {
          const val = parseFloat(input.value)
          if (!isNaN(val) && val > 0) {
            sum += val
            count++
          }
        })

        let mediaTeoria = count > 0 ? (sum / count) : null

        if (mediaTeoria !== null) {
          mediaTeoriaCell.textContent = mediaTeoria.toFixed(1)
          mediaTeoriaCell.style.color = mediaTeoria >= 7 ? 'var(--success)' : 'var(--danger)'
          mediaTeoriaCell.style.fontWeight = 'bold'
        } else {
          mediaTeoriaCell.textContent = '—'
          mediaTeoriaCell.style.color = 'inherit'
        }

        const recVal = parseFloat(recInput.value)
        if (!isNaN(recVal) && recVal > 0 && mediaTeoria !== null) {
          const final = (mediaTeoria + recVal) / 2
          mediaFinalCell.textContent = final.toFixed(1)
          mediaFinalCell.style.color = final >= 7 ? 'var(--success)' : 'var(--danger)'
          mediaFinalCell.style.fontWeight = 'bold'
        } else if (mediaTeoria !== null) {
          mediaFinalCell.textContent = mediaTeoria.toFixed(1)
          mediaFinalCell.style.color = mediaTeoria >= 7 ? 'var(--success)' : 'var(--danger)'
          mediaFinalCell.style.fontWeight = 'bold'
        } else {
          mediaFinalCell.textContent = '—'
          mediaFinalCell.style.color = 'inherit'
        }
      }

      notasInputs.forEach(input => input.addEventListener('input', calculateGrades))
      recInput.addEventListener('input', calculateGrades)

      // Trigger initial calculation
      calculateGrades()
    })

    // Lógica de salvar todas as notas
    const btnSalvarTodas = tabelaNotasContainer.querySelector('#btn-salvar-todas-notas')
    if (btnSalvarTodas) {
      btnSalvarTodas.addEventListener('click', async () => {
        btnSalvarTodas.disabled = true
        btnSalvarTodas.innerHTML = '<span class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></span> Salvando...'

        const notasArray = []
        rows.forEach(row => {
          const alunoId = row.getAttribute('data-aluno-id')
          const faltas = row.querySelector('.faltas-input').value
          const n1 = row.querySelectorAll('.nota-input')[0].value
          const n2 = row.querySelectorAll('.nota-input')[1].value
          const n3 = row.querySelectorAll('.nota-input')[2].value
          const rec = row.querySelector('.rec-input').value

          notasArray.push({ aluno_id: alunoId, faltas, n1, n2, n3, rec })
        })

        const { error } = await ProfessorService.salvarNotasEmLote(disciplinaNome, notasArray)

        if (error) {
          toast.error('Erro ao salvar notas: ' + error.message)
        } else {
          toast.success('Todas as notas foram salvas com sucesso!')
        }

        btnSalvarTodas.disabled = false
        btnSalvarTodas.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Salvar Todas as Notas
        `
      })
    }
  })

  // =====================================================
  // LÓGICA DA ABA 3: REGISTRO DE AULAS
  // =====================================================
  const selectDisciplinaAulas = container.querySelector('#select-disciplina-aulas')
  const tabelaAulasContainer = container.querySelector('#tabela-aulas-container')

  selectDisciplinaAulas.addEventListener('change', async () => {
    const selectedOption = selectDisciplinaAulas.options[selectDisciplinaAulas.selectedIndex]

    if (!selectedOption.value) {
      tabelaAulasContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
          <p>Selecione uma disciplina acima para ver e registrar aulas.</p>
        </div>
      `
      return
    }

    const disciplinaId = selectedOption.value
    const disciplinaNome = selectedOption.getAttribute('data-nome')

    tabelaAulasContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">Carregando aulas...</p>'

    const { data: aulas, error } = await ProfessorService.getAulasDaDisciplina(disciplinaId)

    if (error) {
      tabelaAulasContainer.innerHTML = `<p class="error-text">Erro ao carregar aulas: ${error.message}</p>`
      return
    }

    // Renderizar formulário e histórico
    tabelaAulasContainer.innerHTML = `
      <!-- Formulário Nova Aula -->
      <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid var(--secondary);">
        <h4 style="margin: 0 0 1rem 0; color: var(--text-main);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px; vertical-align: text-bottom;">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Registrar Nova Aula
        </h4>
        <form id="form-nova-aula" style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
          <input type="hidden" name="disciplina_id" value="${disciplinaId}">
          <input type="hidden" name="professor_id" value="${profile.id}">
          
          <div class="form-group" style="flex: 0; margin: 0; min-width: 140px;">
            <label class="label" for="aula-data">Data</label>
            <input type="date" id="aula-data" name="data" class="input" value="${new Date().toISOString().split('T')[0]}" required>
          </div>
          
          <div class="form-group" style="flex: 1; margin: 0; min-width: 250px;">
            <label class="label" for="aula-conteudo">Conteúdo Ministrado</label>
            <input type="text" id="aula-conteudo" name="conteudo" class="input" placeholder="Descreva o conteúdo da aula..." required>
          </div>
          
          <button type="submit" class="btn btn-primary" style="height: 42px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            Registrar
          </button>
        </form>
      </div>

      <!-- Histórico de Aulas -->
      <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 1px solid var(--secondary);">
        <h4 style="margin: 0 0 1rem 0; color: var(--text-main);">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px; vertical-align: text-bottom;">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          Histórico de Aulas
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: normal;">(${aulas?.length || 0} registro(s))</span>
        </h4>

        ${!aulas || aulas.length === 0 ? `
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
            <p>Nenhuma aula registrada ainda.</p>
            <p style="font-size: 0.8rem;">Use o formulário acima para registrar a primeira aula.</p>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 120px;">Data</th>
                  <th>Conteúdo</th>
                  <th style="width: 100px;">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${aulas.map(a => `
                  <tr data-aula-id="${a.id}">
                    <td>
                      <div style="font-weight: 600; color: var(--primary);">
                        ${new Date(a.data).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td>
                      <div class="aula-conteudo" style="color: var(--text-main);">
                        ${escapeHTML(a.conteudo)}
                      </div>
                    </td>
                    <td>
                      <button class="btn btn-remover-aula" data-id="${a.id}" style="background: transparent; border: 1px solid var(--danger); color: var(--danger); font-size: 0.7rem; padding: 0.3rem 0.5rem; border-radius: 4px; cursor: pointer;">
                        Remover
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `

    // Lógica de registro de nova aula
    const formNovaAula = tabelaAulasContainer.querySelector('#form-nova-aula')
    if (formNovaAula) {
      formNovaAula.addEventListener('submit', async (e) => {
        e.preventDefault()

        const formData = new FormData(formNovaAula)
        const data = formData.get('data')
        const conteudo = formData.get('conteudo')

        const btn = formNovaAula.querySelector('button[type="submit"]')
        btn.disabled = true
        btn.textContent = 'Registrando...'

        const { error } = await ProfessorService.registrarAula({
          disciplina_id: disciplinaId,
          professor_id: profile.id,
          data: data,
          conteudo: conteudo
        })

        if (error) {
          toast.error('Erro ao registrar aula: ' + error.message)
        } else {
          toast.success('Aula registrada com sucesso!')
          formNovaAula.reset()
          container.querySelector('#aula-data').value = new Date().toISOString().split('T')[0]
          // Recarregar aulas
          selectDisciplinaAulas.dispatchEvent(new Event('change'))
        }

        btn.disabled = false
        btn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 6px;">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Registrar
        `
      })
    }

    // Lógica de remover aula
    const btnsRemoverAula = tabelaAulasContainer.querySelectorAll('.btn-remover-aula')
    btnsRemoverAula.forEach(btn => {
      btn.addEventListener('click', async () => {
        const aulaId = btn.getAttribute('data-id')

        if (!window.confirm('Certeza que deseja remover esta aula? Esta ação não pode ser desfeita.')) return

        btn.disabled = true
        btn.textContent = '...'

        const { error } = await ProfessorService.excluirAula(aulaId)

        if (error) {
          toast.error('Erro ao remover aula: ' + error.message)
          btn.disabled = false
          btn.textContent = 'Remover'
        } else {
          toast.success('Aula removida com sucesso!')
          // Recarregar aulas
          selectDisciplinaAulas.dispatchEvent(new Event('change'))
        }
      })
    })
  })

  // =====================================================
  // LÓGICA DOS BOTÕES DA ABA 1 (direcionar para outras abas)
  // =====================================================
  const btnsLancarNotas = container.querySelectorAll('.btn-lancar-notas')
  btnsLancarNotas.forEach(btn => {
    btn.addEventListener('click', () => {
      // Mudar para aba de notas
      tabBtns.forEach(b => b.classList.remove('active'))
      container.querySelector('[data-tab="notas"]').classList.add('active')
      tabContents.forEach(content => content.style.display = 'none')
      container.querySelector('#tab-notas').style.display = 'block'

      // Selecionar a disciplina no dropdown
      const disciplinaId = btn.getAttribute('data-disciplina-id')
      selectDisciplinaNotas.value = disciplinaId
      selectDisciplinaNotas.dispatchEvent(new Event('change'))
    })
  })

  const btnsRegistrarAula = container.querySelectorAll('.btn-registrar-aula')
  btnsRegistrarAula.forEach(btn => {
    btn.addEventListener('click', () => {
      // Mudar para aba de aulas
      tabBtns.forEach(b => b.classList.remove('active'))
      container.querySelector('[data-tab="aulas"]').classList.add('active')
      tabContents.forEach(content => content.style.display = 'none')
      container.querySelector('#tab-aulas').style.display = 'block'

      // Selecionar a disciplina no dropdown
      const disciplinaId = btn.getAttribute('data-id')
      selectDisciplinaAulas.value = disciplinaId
      selectDisciplinaAulas.dispatchEvent(new Event('change'))
    })
  })

  return container
}
