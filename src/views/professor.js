import { ProfessorService } from '../lib/professor-service'
import { AcademicService } from '../lib/academic-service'
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

  // Buscar disciplinas do professor
  const { data: disciplinas, error: errorDisciplinas } = await ProfessorService.getDisciplinasDoProfessor(profile.id)

  if (errorDisciplinas) {
    toast.error('Erro ao carregar disciplinas: ' + errorDisciplinas.message)
  }

  const renderMinhasDisciplinas = () => {
    if (errorDisciplinas) return `<p class="error-text">Erro ao carregar disciplinas.</p>`
    if (!disciplinas || disciplinas.length === 0) return '<p>Você não possui disciplinas vinculadas.</p>'
    
    return `
      <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        <h3 style="margin: 0 0 1rem 0; color: var(--text-main);">Minhas Disciplinas</h3>
        
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Disciplina</th>
                <th>Módulo</th>
                <th>Turma</th>
                <th>Período</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${disciplinas.map(d => `
                <tr>
                  <td>
                    <div class="fw-600 text-main">${escapeHTML(d.nome)}</div>
                  </td>
                  <td>${escapeHTML(d.modulo)}</td>
                  <td>${d.turmas ? escapeHTML(d.turmas.nome) : '-'}</td>
                  <td>${d.turmas ? escapeHTML(d.turmas.periodo) : '-'}</td>
                  <td>
                    <button class="btn btn-primary btn-sm btn-lancar-notas" data-disciplina="${escapeHTML(d.nome)}" data-turma="${d.turmas?.id || ''}" ${!d.turmas ? 'disabled' : ''}>Lançar Notas</button>
                    <button class="btn btn-secondary btn-sm btn-registrar-aula" data-id="${d.id}" data-nome="${escapeHTML(d.nome)}">Registrar Aula</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `
  }

  const renderLancarNotas = () => `
    <div id="painel-notas" style="display: none;">
      <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <div>
            <h3 style="margin: 0; color: var(--text-main);">Lançar Notas</h3>
            <p style="margin: 0.5rem 0 0 0; color: var(--text-muted); font-size: 0.9rem;">Disciplina: <strong id="disciplina-notas-nome"></strong></p>
          </div>
          <button id="btn-fechar-notas" class="btn btn-secondary">Fechar</button>
        </div>
        
        <div id="tabela-notas-container">
          <p>Selecione uma disciplina para lançar notas.</p>
        </div>
      </div>
    </div>
  `

  const renderRegistroAulas = () => `
    <div id="painel-aulas" style="display: none;">
      <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <div>
            <h3 style="margin: 0; color: var(--text-main);">Registro de Aulas</h3>
            <p style="margin: 0.5rem 0 0 0; color: var(--text-muted); font-size: 0.9rem;">Disciplina: <strong id="disciplina-aulas-nome"></strong></p>
          </div>
          <button id="btn-fechar-aulas" class="btn btn-secondary">Fechar</button>
        </div>
        
        <div id="tabela-aulas-container">
          <p>Selecione uma disciplina para registrar aulas.</p>
        </div>
      </div>
    </div>
  `

  container.innerHTML = `
    <header class="view-header">
      <h1 class="title">Painel do Professor</h1>
      <p class="subtitle">Gerencie suas disciplinas, notas e registros de aulas.</p>
    </header>

    <div class="tabs-container">
      <button class="tab-btn active" data-tab="disciplinas">Minhas Disciplinas</button>
    </div>

    <div id="tab-disciplinas" class="tab-content">
      ${renderMinhasDisciplinas()}
    </div>

    ${renderLancarNotas()}
    ${renderRegistroAulas()}
  `

  // Lógica das tabs
  const tabBtns = container.querySelectorAll('.tab-btn')
  const tabContents = container.querySelectorAll('.tab-content')

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab')
      
      // Atualizar botões
      tabBtns.forEach(b => {
        b.classList.remove('active')
      })
      btn.classList.add('active')
      
      // Mostrar conteúdo
      tabContents.forEach(content => {
        content.style.display = 'none'
      })
      container.querySelector(`#tab-${tab}`).style.display = 'block'
    })
  })

  // Lógica de lançamento de notas
  const btnsLancarNotas = container.querySelectorAll('.btn-lancar-notas')
  const painelNotas = container.querySelector('#painel-notas')
  const btnFecharNotas = container.querySelector('#btn-fechar-notas')

  btnsLancarNotas.forEach(btn => {
    btn.addEventListener('click', async () => {
      const disciplina = btn.getAttribute('data-disciplina')
      const turmaId = btn.getAttribute('data-turma')
      
      if (!turmaId) {
        toast.error('Esta disciplina não possui turma vinculada.')
        return
      }
      
      // Mostrar painel de notas
      painelNotas.style.display = 'block'
      container.querySelector('#disciplina-notas-nome').textContent = disciplina
      
      // Carregar alunos da turma com notas
      const tabelaContainer = container.querySelector('#tabela-notas-container')
      tabelaContainer.innerHTML = '<p>Carregando alunos...</p>'
      
      const { data: alunosComNotas, error } = await ProfessorService.getNotasDaDisciplina(disciplina, turmaId)
      
      if (error) {
        tabelaContainer.innerHTML = `<p class="error-text">Erro ao carregar alunos: ${error.message}</p>`
        return
      }
      
      if (!alunosComNotas || alunosComNotas.length === 0) {
        tabelaContainer.innerHTML = '<p>Não há alunos matriculados nesta turma.</p>'
        return
      }
      
      tabelaContainer.innerHTML = `
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Faltas</th>
                <th>1ª Nota</th>
                <th>2ª Nota</th>
                <th>3ª Nota</th>
                <th>Média Teoria</th>
                <th>Recuperação</th>
                <th>Média Final</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              ${alunosComNotas.map(a => `
                <tr class="nota-row" data-aluno-id="${a.aluno_id}">
                  <td>
                    <div class="fw-600 text-main">${escapeHTML(a.aluno_nome)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHTML(a.aluno_email)}</div>
                  </td>
                  <td><input type="number" class="input faltas-input" min="0" value="${a.nota?.faltas || 0}" style="width: 60px; text-align: center;"></td>
                  <td><input type="number" class="input nota-input" min="0" max="10" step="0.1" value="${a.nota?.n1 || 0}" style="width: 60px; text-align: center;"></td>
                  <td><input type="number" class="input nota-input" min="0" max="10" step="0.1" value="${a.nota?.n2 || 0}" style="width: 60px; text-align: center;"></td>
                  <td><input type="number" class="input nota-input" min="0" max="10" step="0.1" value="${a.nota?.n3 || 0}" style="width: 60px; text-align: center;"></td>
                  <td class="media-teoria" style="text-align: center; font-weight: bold;">-</td>
                  <td><input type="number" class="input rec-input" min="0" max="10" step="0.1" value="${a.nota?.rec || 0}" style="width: 60px; text-align: center;"></td>
                  <td class="media-final" style="text-align: center; font-weight: bold; color: var(--primary);">-</td>
                  <td>
                    <button class="btn btn-primary btn-sm btn-salvar-nota" data-aluno-id="${a.aluno_id}">Salvar</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
          <button class="btn btn-primary" id="btn-salvar-todas-notas">Salvar Todas as Notas</button>
        </div>
      `
      
      // Configurar cálculo automático de médias
      const rows = tabelaContainer.querySelectorAll('.nota-row')
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
            if (!isNaN(val)) {
              sum += val
              count++
            }
          })
          
          let mediaTeoria = count > 0 ? (sum / count) : null
          
          if (mediaTeoria !== null) {
            mediaTeoriaCell.textContent = mediaTeoria.toFixed(1)
            mediaTeoriaCell.style.color = mediaTeoria >= 7 ? 'var(--success)' : 'var(--danger)'
          } else {
            mediaTeoriaCell.textContent = '-'
            mediaTeoriaCell.style.color = 'inherit'
          }

          const recVal = parseFloat(recInput.value)
          if (!isNaN(recVal) && mediaTeoria !== null) {
            const final = (mediaTeoria + recVal) / 2
            mediaFinalCell.textContent = final.toFixed(1)
            mediaFinalCell.style.color = final >= 7 ? 'var(--success)' : 'var(--danger)'
          } else if (mediaTeoria !== null) {
            mediaFinalCell.textContent = mediaTeoria.toFixed(1)
            mediaFinalCell.style.color = mediaTeoria >= 7 ? 'var(--success)' : 'var(--danger)'
          } else {
            mediaFinalCell.textContent = '-'
            mediaFinalCell.style.color = 'inherit'
          }
        }

        notasInputs.forEach(input => input.addEventListener('input', calculateGrades))
        recInput.addEventListener('input', calculateGrades)
        
        // Trigger initial calculation
        calculateGrades()
      })
      
      // Lógica de salvar nota individual
      const btnsSalvarNota = tabelaContainer.querySelectorAll('.btn-salvar-nota')
      btnsSalvarNota.forEach(btn => {
        btn.addEventListener('click', async () => {
          const alunoId = btn.getAttribute('data-aluno-id')
          const row = btn.closest('.nota-row')
          
          const faltas = row.querySelector('.faltas-input').value
          const n1 = row.querySelectorAll('.nota-input')[0].value
          const n2 = row.querySelectorAll('.nota-input')[1].value
          const n3 = row.querySelectorAll('.nota-input')[2].value
          const rec = row.querySelector('.rec-input').value
          
          btn.disabled = true
          btn.textContent = '...'
          
          const { error } = await ProfessorService.salvarNota(alunoId, disciplina, { faltas, n1, n2, n3, rec })
          
          if (error) {
            toast.error('Erro ao salvar nota: ' + error.message)
          } else {
            toast.success('Nota salva com sucesso!')
          }
          
          btn.disabled = false
          btn.textContent = 'Salvar'
        })
      })
      
      // Lógica de salvar todas as notas
      const btnSalvarTodas = tabelaContainer.querySelector('#btn-salvar-todas-notas')
      if (btnSalvarTodas) {
        btnSalvarTodas.addEventListener('click', async () => {
          btnSalvarTodas.disabled = true
          btnSalvarTodas.textContent = 'Salvando...'
          
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
          
          const { error } = await ProfessorService.salvarNotasEmLote(disciplina, notasArray)
          
          if (error) {
            toast.error('Erro ao salvar notas: ' + error.message)
          } else {
            toast.success('Todas as notas foram salvas com sucesso!')
          }
          
          btnSalvarTodas.disabled = false
          btnSalvarTodas.textContent = 'Salvar Todas as Notas'
        })
      }
    })
  })

  if (btnFecharNotas) {
    btnFecharNotas.addEventListener('click', () => {
      painelNotas.style.display = 'none'
    })
  }

  // Lógica de registro de aulas
  const btnsRegistrarAula = container.querySelectorAll('.btn-registrar-aula')
  const painelAulas = container.querySelector('#painel-aulas')
  const btnFecharAulas = container.querySelector('#btn-fechar-aulas')

  btnsRegistrarAula.forEach(btn => {
    btn.addEventListener('click', async () => {
      const disciplinaId = btn.getAttribute('data-id')
      const disciplinaNome = btn.getAttribute('data-nome')
      
      // Mostrar painel de aulas
      painelAulas.style.display = 'block'
      container.querySelector('#disciplina-aulas-nome').textContent = disciplinaNome
      
      // Carregar aulas da disciplina
      const tabelaContainer = container.querySelector('#tabela-aulas-container')
      tabelaContainer.innerHTML = '<p>Carregando aulas...</p>'
      
      const { data: aulas, error } = await ProfessorService.getAulasDaDisciplina(disciplinaId)
      
      if (error) {
        tabelaContainer.innerHTML = `<p class="error-text">Erro ao carregar aulas: ${error.message}</p>`
        return
      }
      
      tabelaContainer.innerHTML = `
        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid var(--secondary);">
          <h4 style="margin-bottom: 15px;">Registrar Nova Aula</h4>
          <form id="form-nova-aula">
            <input type="hidden" name="disciplina_id" value="${disciplinaId}">
            <input type="hidden" name="professor_id" value="${profile.id}">
            
            <div style="display: flex; gap: 1rem; align-items: flex-end;">
              <div class="form-group" style="flex: 0; margin: 0;">
                <label class="label" for="aula-data">Data</label>
                <input type="date" id="aula-data" name="data" class="input" value="${new Date().toISOString().split('T')[0]}" required>
              </div>
              <div class="form-group" style="flex: 1; margin: 0;">
                <label class="label" for="aula-conteudo">Conteúdo Ministrado</label>
                <input type="text" id="aula-conteudo" name="conteudo" class="input" placeholder="Descreva o conteúdo da aula..." required>
              </div>
              <button type="submit" class="btn btn-primary">Registrar</button>
            </div>
          </form>
        </div>
        
        <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 1px solid var(--secondary);">
          <h4 style="margin-bottom: 1rem;">Histórico de Aulas</h4>
          
          ${!aulas || aulas.length === 0 ? '<p style="color: var(--text-muted);">Nenhuma aula registrada.</p>' : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Conteúdo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  ${aulas.map(a => `
                    <tr>
                      <td>${new Date(a.data).toLocaleDateString('pt-BR')}</td>
                      <td>${escapeHTML(a.conteudo)}</td>
                      <td>
                        <button class="btn btn-remover" data-id="${a.id}" style="background: transparent; border: 1px solid var(--danger); color: var(--danger); font-size: 0.75rem; padding: 0.4rem 0.6rem; border-radius: 4px; cursor: pointer;">Remover</button>
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
      const formNovaAula = tabelaContainer.querySelector('#form-nova-aula')
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
            // Recarregar aulas
            btn.click()
          }
          
          btn.disabled = false
          btn.textContent = 'Registrar'
        })
      }
      
      // Lógica de remover aula
      const btnsRemover = tabelaContainer.querySelectorAll('.btn-remover')
      btnsRemover.forEach(btn => {
        btn.addEventListener('click', async () => {
          const aulaId = btn.getAttribute('data-id')
          
          if (!window.confirm('Certeza que deseja remover esta aula?')) return
          
          btn.disabled = true
          btn.textContent = 'Removendo...'
          
          const { error } = await ProfessorService.excluirAula(aulaId)
          
          if (error) {
            toast.error('Erro ao remover aula: ' + error.message)
            btn.disabled = false
            btn.textContent = 'Remover'
          } else {
            toast.success('Aula removida com sucesso!')
            // Recarregar aulas
            btn.click()
          }
        })
      })
    })
  })

  if (btnFecharAulas) {
    btnFecharAulas.addEventListener('click', () => {
      painelAulas.style.display = 'none'
    })
  }

  return container
}
