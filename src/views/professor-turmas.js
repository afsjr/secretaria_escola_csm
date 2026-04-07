/**
 * Professor Turmas View
 * 
 * Permite ao professor:
 * - Ver todas as suas turmas
 * - Lançar notas em lote por turma
 * - Registrar frequência/faltas
 * - Registrar aulas dadas
 */

import { ProfessorService } from '../lib/professor-service'
import { CourseService } from '../lib/course-service'
import { AcademicService } from '../lib/academic-service'
import { supabase } from '../lib/supabase'
import { toast } from '../lib/toast'
import { escapeHTML, createBadge, createOption } from '../lib/security'

export async function ProfessorTurmasView(profile) {
  const container = document.createElement('div')
  container.className = 'professor-turmas-view animate-in'

  // Buscar turmas do professor
  const turmasDoProfessor = await ProfessorService.getTurmasDoProfessor(profile.id)
  
  // Buscar disciplinas do professor com informações de turmas
  const { data: disciplinas } = await ProfessorService.getDisciplinasDoProfessor(profile.id)

  // Agrupar disciplinas por turma
  const turmasMap = {}
  disciplinas?.forEach(d => {
    const turmaKey = d.turma_id || 'sem-turma'
    if (!turmasMap[turmaKey]) {
      turmasMap[turmaKey] = {
        id: d.turma_id,
        nome: d.turmas?.nome || 'Sem turma definida',
        periodo: d.turmas?.periodo || '-',
        curso: d.cursos?.nome || '-',
        disciplinas: []
      }
    }
    turmasMap[turmaKey].disciplinas.push(d)
  })

  const turmas = Object.values(turmasMap)

  container.innerHTML = `
    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; color: var(--text-main);">Minhas Turmas</h1>
      <p>Gerencie notas e aulas das suas turmas.</p>
    </header>

    ${turmas.length === 0 
      ? `<div style="background: white; padding: 3rem; text-align: center; border-radius: var(--radius-lg);">
          <p style="color: var(--text-muted); font-size: 1.1rem;">Nenhuma turma atribuída ainda.</p>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Entre em contato com a secretaria para ser vinculado a uma turma.</p>
         </div>`
      : `
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        ${turmas.map(turma => `
          <details class="turma-card" style="background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden;">
            <summary style="padding: 1.5rem; cursor: pointer; background: linear-gradient(135deg, var(--primary) 0%, #2a4a7f 100%); color: white; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h3 style="margin: 0; font-size: 1.2rem;">${escapeHTML(turma.nome)}</h3>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.3rem;">
                  ${createBadge(turma.periodo)}
                  ${createBadge(turma.curso)}
                  <span class="badge">${turma.disciplinas.length} disciplina(s)</span>
                </div>
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transition: transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>

            <div style="padding: 1.5rem;">
              <!-- Tabs: Notas | Aulas -->
              <div class="tabs-container" style="margin-bottom: 1rem;">
                <button class="tab-btn active" data-tab="notas-${turma.id || 'sem-turma'}" style="padding: 0.5rem 1rem; border: none; background: var(--secondary); color: var(--text-main); cursor: pointer; border-radius: 4px 4px 0 0;">📊 Lançar Notas</button>
                <button class="tab-btn" data-tab="aulas-${turma.id || 'sem-turma'}" style="padding: 0.5rem 1rem; border: none; background: transparent; color: var(--text-muted); cursor: pointer; border-radius: 4px 4px 0 0;">📅 Registrar Aula</button>
              </div>

              <!-- Tab: Notas -->
              <div class="tab-content" id="tab-notas-${turma.id || 'sem-turma'}" style="display: block;">
                ${turma.disciplinas.map((disc, idx) => `
                  <fieldset style="border: 1px solid var(--secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem;">${escapeHTML(disc.nome)}</legend>
                    
                    <div class="notas-disciplina" data-disciplina-id="${disc.id}" data-disciplina-nome="${escapeHTML(disc.nome)}">
                      <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; min-width: 700px;">
                          <thead style="background: var(--secondary); font-size: 0.8rem; text-transform: uppercase;">
                            <tr>
                              <th style="padding: 0.75rem; text-align: left;">Aluno</th>
                              <th style="padding: 0.75rem; text-align: center;">Faltas</th>
                              <th style="padding: 0.75rem; text-align: center;">N1</th>
                              <th style="padding: 0.75rem; text-align: center;">N2</th>
                              <th style="padding: 0.75rem; text-align: center;">N3</th>
                              <th style="padding: 0.75rem; text-align: center;">Média</th>
                              <th style="padding: 0.75rem; text-align: center;">Rec</th>
                              <th style="padding: 0.75rem; text-align: center;">Final</th>
                            </tr>
                          </thead>
                          <tbody class="notas-tbody" data-disciplina-id="${disc.id}">
                            <tr><td colspan="8" style="padding: 1rem; text-align: center; color: var(--text-muted);">Carregando alunos...</td></tr>
                          </tbody>
                        </table>
                      </div>
                      
                      <div style="display: flex; justify-content: flex-end; margin-top: 1rem;">
                        <button class="btn btn-primary btn-salvar-notas" data-disciplina-id="${disc.id}">💾 Salvar Notas</button>
                      </div>
                    </div>
                  </fieldset>
                `).join('')}
              </div>

              <!-- Tab: Aulas -->
              <div class="tab-content" id="tab-aulas-${turma.id || 'sem-turma'}" style="display: none;">
                <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                  <h4 style="margin-bottom: 1rem;">Registrar Nova Aula</h4>
                  <form class="form-registrar-aula" data-turma-id="${turma.id || ''}">
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem;">
                      <div class="form-group">
                        <label class="label" for="aula-data-${turma.id || 'sem-turma'}">Data</label>
                        <input type="date" id="aula-data-${turma.id || 'sem-turma'}" name="data" class="input" value="${new Date().toISOString().split('T')[0]}" required>
                      </div>
                      <div class="form-group">
                        <label class="label" for="aula-disciplina-${turma.id || 'sem-turma'}">Disciplina</label>
                        <select id="aula-disciplina-${turma.id || 'sem-turma'}" name="disciplina_id" class="input" required>
                          <option value="">Selecione</option>
                          ${turma.disciplinas.map(d => `<option value="${d.id}">${escapeHTML(d.nome)}</option>`).join('')}
                        </select>
                      </div>
                    </div>
                    <div class="form-group">
                      <label class="label" for="aula-conteudo-${turma.id || 'sem-turma'}">Conteúdo Ministrado</label>
                      <textarea id="aula-conteudo-${turma.id || 'sem-turma'}" name="conteudo" class="input" rows="3" placeholder="Descreva o conteúdo da aula..." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">📅 Registrar Aula</button>
                  </form>
                </div>

                <h4 style="margin-bottom: 0.5rem;">Aulas Registradas</h4>
                <div class="aulas-list" data-turma-id="${turma.id || ''}">
                  <p style="color: var(--text-muted); font-size: 0.9rem;">Carregando aulas...</p>
                </div>
              </div>
            </div>
          </details>
        `).join('')}
      </div>
    `}
  `

  // === Event Handlers ===

  // Tab switching
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const turmaId = btn.getAttribute('data-tab').split('-').slice(1).join('-')
      const parent = btn.closest('.turma-card')
      
      parent.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active')
        b.style.background = 'transparent'
        b.style.color = 'var(--text-muted)'
      })
      btn.classList.add('active')
      btn.style.background = 'var(--secondary)'
      btn.style.color = 'var(--text-main)'

      parent.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none')
      const targetTab = btn.getAttribute('data-tab')
      const targetContent = parent.querySelector(`#tab-${targetTab}`)
      if (targetContent) targetContent.style.display = 'block'
    })
  })

  // Load students for each discipline
  turmas.forEach(turma => {
    turma.disciplinas.forEach(disc => {
      loadAlunosDaDisciplina(disc.id, container)
    })
  })

  // Save grades buttons
  container.querySelectorAll('.btn-salvar-notas').forEach(btn => {
    btn.addEventListener('click', async () => {
      const disciplinaId = btn.getAttribute('data-disciplina-id')
      const tbody = container.querySelector(`.notas-tbody[data-disciplina-id="${disciplinaId}"]`)
      const rows = tbody.querySelectorAll('tr')
      
      const notasArray = []
      rows.forEach(row => {
        const alunoId = row.getAttribute('data-aluno-id')
        if (!alunoId) return
        
        const faltas = row.querySelector('.input-faltas')?.value || 0
        const n1 = row.querySelector('.input-n1')?.value || 0
        const n2 = row.querySelector('.input-n2')?.value || 0
        const n3 = row.querySelector('.input-n3')?.value || 0
        const rec = row.querySelector('.input-rec')?.value || 0

        notasArray.push({
          aluno_id: alunoId,
          disciplina: disciplinaId,
          faltas: parseFloat(faltas) || 0,
          n1: parseFloat(n1) || 0,
          n2: parseFloat(n2) || 0,
          n3: parseFloat(n3) || 0,
          rec: parseFloat(rec) || 0
        })
      })

      btn.disabled = true
      btn.textContent = 'Salvando...'

      const { error } = await ProfessorService.salvarNotasEmLote(notasArray)
      
      btn.disabled = false
      btn.textContent = '💾 Salvar Notas'

      if (error) {
        toast.error('Erro ao salvar notas: ' + error.message)
      } else {
        toast.success('Notas salvas com sucesso!')
      }
    })
  })

  // Register lesson forms
  container.querySelectorAll('.form-registrar-aula').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const disciplinaId = form.querySelector('select[name="disciplina_id"]').value
      const data = form.querySelector('input[name="data"]').value
      const conteudo = form.querySelector('textarea[name="conteudo"]').value

      if (!disciplinaId || !data || !conteudo) {
        toast.error('Preencha todos os campos!')
        return
      }

      const submitBtn = form.querySelector('button[type="submit"]')
      submitBtn.disabled = true
      submitBtn.textContent = 'Registrando...'

      const { error } = await ProfessorService.registrarAula({
        disciplina_id: disciplinaId,
        professor_id: profile.id,
        data,
        conteudo
      })

      submitBtn.disabled = false
      submitBtn.textContent = '📅 Registrar Aula'

      if (error) {
        toast.error('Erro ao registrar aula: ' + error.message)
      } else {
        toast.success('Aula registrada com sucesso!')
        form.reset()
        // Reload aulas list
        const aulasList = form.closest('.tab-content').querySelector('.aulas-list')
        if (aulasList) loadAulasDaDisciplina(disciplinaId, container)
      }
    })
  })

  // Load aulas for first discipline of each turma
  turmas.forEach(turma => {
    if (turma.disciplinas.length > 0) {
      loadAulasDaDisciplina(turma.disciplinas[0].id, container)
    }
  })

  return container
}

/**
 * Carrega alunos de uma disciplina e popula a tabela de notas
 */
async function loadAlunosDaDisciplina(disciplinaId, container) {
  const tbody = container.querySelector(`.notas-tbody[data-disciplina-id="${disciplinaId}"]`)
  if (!tbody) return

  try {
    // Buscar disciplina para pegar turma_id
    const { data: disciplinas } = await supabase
      .from('disciplinas')
      .select('*, turmas(id, nome)')
      .eq('id', disciplinaId)
      .single()

    const turmaId = disciplinas?.turma_id
    if (!turmaId) {
      tbody.innerHTML = '<tr><td colspan="8" style="padding: 1rem; text-align: center; color: var(--text-muted);">Turma não vinculada à disciplina.</td></tr>'
      return
    }

    // Buscar alunos da turma
    const { data: matriculas, error } = await AcademicService.getAlunosDaTurma(turmaId)
    
    if (error || !matriculas || matriculas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="padding: 1rem; text-align: center; color: var(--text-muted);">Nenhum aluno matriculado.</td></tr>'
      return
    }

    // Buscar notas existentes
    const alunoIds = matriculas.map(m => m.perfis.id)
    const { data: notasExistentes } = await supabase
      .from('boletim')
      .select('*')
      .in('aluno_id', alunoIds)
      .eq('disciplina', disciplinas.nome)

    const notasMap = {}
    notasExistentes?.forEach(n => {
      notasMap[n.aluno_id] = n
    })

    tbody.innerHTML = matriculas
      .filter(m => m.status_aluno === 'ativo')
      .map(m => {
        const aluno = m.perfis
        const notas = notasMap[aluno.id] || {}
        
        const faltas = notas.faltas || 0
        const n1 = notas.n1 || 0
        const n2 = notas.n2 || 0
        const n3 = notas.n3 || 0
        const rec = notas.rec || 0
        
        const notasPresentes = [n1, n2, n3].filter(n => n > 0)
        const media = notasPresentes.length > 0 ? notasPresentes.reduce((a, b) => a + b, 0) / notasPresentes.length : 0
        const final = rec > 0 ? (media + rec) / 2 : media

        return `
          <tr data-aluno-id="${aluno.id}" style="border-top: 1px solid var(--secondary);">
            <td style="padding: 0.5rem;">
              <div style="font-weight: 500;">${escapeHTML(aluno.nome_completo)}</div>
            </td>
            <td style="padding: 0.5rem;"><input type="number" class="input input-faltas" value="${faltas}" min="0" style="width: 50px; text-align: center; padding: 0.3rem;"></td>
            <td style="padding: 0.5rem;"><input type="number" class="input input-n1" value="${n1}" min="0" max="10" step="0.1" style="width: 50px; text-align: center; padding: 0.3rem;"></td>
            <td style="padding: 0.5rem;"><input type="number" class="input input-n2" value="${n2}" min="0" max="10" step="0.1" style="width: 50px; text-align: center; padding: 0.3rem;"></td>
            <td style="padding: 0.5rem;"><input type="number" class="input input-n3" value="${n3}" min="0" max="10" step="0.1" style="width: 50px; text-align: center; padding: 0.3rem;"></td>
            <td style="padding: 0.5rem; text-align: center; font-weight: bold; color: ${media >= 7 ? 'var(--success)' : 'var(--danger)'};">${media.toFixed(1)}</td>
            <td style="padding: 0.5rem;"><input type="number" class="input input-rec" value="${rec}" min="0" max="10" step="0.1" style="width: 50px; text-align: center; padding: 0.3rem;"></td>
            <td style="padding: 0.5rem; text-align: center; font-weight: bold; color: ${final >= 7 ? 'var(--success)' : 'var(--danger)'};">${final.toFixed(1)}</td>
          </tr>
        `
      }).join('')

    // Add input listeners to recalculate media
    tbody.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => recalcularMedia(tbody))
    })

  } catch (err) {
    console.error('Erro ao carregar alunos:', err)
    tbody.innerHTML = '<tr><td colspan="8" style="padding: 1rem; text-align: center; color: var(--danger);">Erro ao carregar dados.</td></tr>'
  }
}

/**
 * Recalcula médias quando notas são alteradas
 */
function recalcularMedia(tbody) {
  tbody.querySelectorAll('tr').forEach(row => {
    const n1 = parseFloat(row.querySelector('.input-n1')?.value) || 0
    const n2 = parseFloat(row.querySelector('.input-n2')?.value) || 0
    const n3 = parseFloat(row.querySelector('.input-n3')?.value) || 0
    const rec = parseFloat(row.querySelector('.input-rec')?.value) || 0

    const notasPresentes = [n1, n2, n3].filter(n => n > 0)
    const media = notasPresentes.length > 0 ? notasPresentes.reduce((a, b) => a + b, 0) / notasPresentes.length : 0
    const final = rec > 0 ? (media + rec) / 2 : media

    const mediaCell = row.querySelectorAll('td')[5]
    const finalCell = row.querySelectorAll('td')[7]
    
    if (mediaCell) {
      mediaCell.textContent = media.toFixed(1)
      mediaCell.style.color = media >= 7 ? 'var(--success)' : 'var(--danger)'
    }
    if (finalCell) {
      finalCell.textContent = final.toFixed(1)
      finalCell.style.color = final >= 7 ? 'var(--success)' : 'var(--danger)'
    }
  })
}

/**
 * Carrega aulas registradas de uma disciplina
 */
async function loadAulasDaDisciplina(disciplinaId, container) {
  const aulasList = container.querySelector(`.aulas-list[data-turma-id]`)
  if (!aulasList) return

  try {
    const { data: aulas, error } = await ProfessorService.getAulasDaDisciplina(disciplinaId)

    if (error || !aulas || aulas.length === 0) {
      aulasList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Nenhuma aula registrada.</p>'
      return
    }

    aulasList.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        ${aulas.map(aula => `
          <div style="padding: 1rem; background: var(--secondary); border-radius: 6px; display: flex; justify-content: space-between; align-items: start;">
            <div style="flex: 1;">
              <div style="display: flex; gap: 0.5rem; margin-bottom: 0.3rem;">
                ${createBadge(new Date(aula.data).toLocaleDateString('pt-BR'))}
              </div>
              <div style="white-space: pre-wrap; font-size: 0.9rem;">${escapeHTML(aula.conteudo)}</div>
            </div>
            <button class="btn btn-delete-aula" data-aula-id="${aula.id}" style="font-size: 0.7rem; padding: 0.2rem 0.5rem; background: var(--danger); color: white;">X</button>
          </div>
        `).join('')}
      </div>
    `

    // Delete aula handlers
    aulasList.querySelectorAll('.btn-delete-aula').forEach(btn => {
      btn.addEventListener('click', async () => {
        const aulaId = btn.getAttribute('data-aula-id')
        if (!confirm('Deseja excluir esta aula?')) return

        const { error } = await ProfessorService.excluirAula(aulaId)
        if (error) {
          toast.error('Erro ao excluir: ' + error.message)
        } else {
          toast.success('Aula excluída!')
          loadAulasDaDisciplina(disciplinaId, container)
        }
      })
    })

  } catch (err) {
    console.error('Erro ao carregar aulas:', err)
    aulasList.innerHTML = '<p style="color: var(--danger); font-size: 0.9rem;">Erro ao carregar aulas.</p>'
  }
}
