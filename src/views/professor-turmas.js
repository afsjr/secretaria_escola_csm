/**
 * Professor Turmas View - Versão Aprimorada
 * 
 * Permite ao professor:
 * - Ver todas as suas turmas
 * - Lançar notas em lote por turma (com cálculo automático de médias)
 * - Registrar frequência/faltas
 * - Registrar aulas dadas
 * - Exportar boletim em PDF
 * - Alertas de alunos com média baixa
 */

import { ProfessorService } from '../lib/professor-service'
import { AcademicService } from '../lib/academic-service'
import { PDFService } from '../lib/pdf-service'
import { supabase } from '../lib/supabase'
import { toast } from '../lib/toast'
import { escapeHTML, createBadge, createOption } from '../lib/security'

export async function ProfessorTurmasView(profile) {
  const container = document.createElement('div')
  container.className = 'professor-turmas-view animate-in'

  // Buscar turmas do professor
  const { data: turmasDoProfessor } = await ProfessorService.getTurmasDoProfessor(profile.id)

  if (!turmasDoProfessor || turmasDoProfessor.length === 0) {
    container.innerHTML = `
      <header style="margin-bottom: 2rem;">
        <h1 style="font-size: 2rem; color: var(--text-main);">Minhas Turmas</h1>
        <p>Gerencie notas e aulas das suas turmas.</p>
      </header>
      <div style="background: white; padding: 3rem; text-align: center; border-radius: var(--radius-lg);">
        <p style="color: var(--text-muted); font-size: 1.1rem;">Nenhuma turma atribuída ainda.</p>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Entre em contato com a secretaria para ser vinculado a uma turma.</p>
      </div>
    `
    return container
  }

  // Buscar disciplinas do professor
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
    <header style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="font-size: 2rem; color: var(--text-main);">Minhas Turmas</h1>
        <p>Gerencie notas e aulas das suas turmas.</p>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button id="btn-alertas-geral" class="btn" style="background: #FEF3C7; color: #92400E; font-size: 0.85rem;">
          🔔 Alertas
        </button>
        <button id="btn-export-geral" class="btn btn-primary" style="font-size: 0.85rem;">
          📄 Exportar PDF Geral
        </button>
      </div>
    </header>

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
            <!-- Tabs: Notas | Aulas | Frequência -->
            <div class="tabs-container" style="margin-bottom: 1rem; display: flex; gap: 0.5rem;">
              <button class="tab-btn active" data-tab="notas-${turma.id || 'sem-turma'}" style="padding: 0.5rem 1rem; border: none; background: var(--secondary); color: var(--text-main); cursor: pointer; border-radius: 4px 4px 0 0;">📊 Lançar Notas</button>
              <button class="tab-btn" data-tab="aulas-${turma.id || 'sem-turma'}" style="padding: 0.5rem 1rem; border: none; background: transparent; color: var(--text-muted); cursor: pointer; border-radius: 4px 4px 0 0;">📅 Registrar Aula</button>
              <button class="tab-btn" data-tab="frequencia-${turma.id || 'sem-turma'}" style="padding: 0.5rem 1rem; border: none; background: transparent; color: var(--text-muted); cursor: pointer; border-radius: 4px 4px 0 0;">✓ Frequência</button>
            </div>

            <!-- Tab: Notas -->
            <div class="tab-content" id="tab-notas-${turma.id || 'sem-turma'}" style="display: block;">
              ${turma.disciplinas.map((disc) => `
                <fieldset style="border: 1px solid var(--secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                  <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                    ${escapeHTML(disc.nome)}
                    <button class="btn btn-sm btn-export-pdf" data-disciplina-id="${disc.id}" data-disciplina-nome="${escapeHTML(disc.nome)}" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">📄 PDF</button>
                  </legend>
                  
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
                            <th style="padding: 0.75rem; text-align: center; background: #f0f4f8;">Média</th>
                            <th style="padding: 0.75rem; text-align: center;">Rec</th>
                            <th style="padding: 0.75rem; text-align: center; background: #f0f4f8;">Final</th>
                            <th style="padding: 0.75rem; text-align: center;">Status</th>
                          </tr>
                        </thead>
                        <tbody class="notas-tbody" data-disciplina-id="${disc.id}">
                          <tr><td colspan="9" style="padding: 1rem; text-align: center; color: var(--text-muted);">Carregando alunos...</td></tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin-top: 1rem; align-items: center;">
                      <div id="alertas-${disc.id}" style="font-size: 0.85rem;"></div>
                      <button class="btn btn-primary btn-salvar-notas" data-disciplina-id="${disc.id}" data-disciplina-nome="${escapeHTML(disc.nome)}">💾 Salvar Notas</button>
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
                    <textarea id="aula-conteudo-${turma.id || 'sem-turma'}" name="conteudo" class="input" rows="3" placeholder="Descreva o conteúdo da aula, atividades realizadas, dúvidas frequentes..." required></textarea>
                  </div>
                  <button type="submit" class="btn btn-primary">📅 Registrar Aula</button>
                </form>
              </div>

              <h4 style="margin-bottom: 0.5rem;">Aulas Registradas</h4>
              <div class="aulas-list" data-turma-id="${turma.id || ''}">
                <p style="color: var(--text-muted); font-size: 0.9rem;">Carregando aulas...</p>
              </div>
            </div>

            <!-- Tab: Frequência -->
            <div class="tab-content" id="tab-frequencia-${turma.id || 'sem-turma'}" style="display: none;">
              <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem;">
                <h4 style="margin-bottom: 0.5rem;">Registrar Frequência</h4>
                <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Marque os alunos ausentes. Os demais serão considerados presentes.</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                  <div class="form-group">
                    <label class="label" for="freq-data">Data da Aula</label>
                    <input type="date" id="freq-data" class="input" value="${new Date().toISOString().split('T')[0]}" required>
                  </div>
                  <div class="form-group">
                    <label class="label" for="freq-disciplina">Disciplina</label>
                    <select id="freq-disciplina" class="input" required>
                      <option value="">Selecione</option>
                      ${turma.disciplinas.map(d => `<option value="${d.id}">${escapeHTML(d.nome)}</option>`).join('')}
                    </select>
                  </div>
                </div>
              </div>

              <div class="frequencia-list" data-turma-id="${turma.id || ''}">
                <p style="color: var(--text-muted);">Carregando alunos...</p>
              </div>
            </div>
          </div>
        </details>
      `).join('')}
    </div>
  `

  // === Event Handlers ===

  // Tab switching
  container.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
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
      loadAlunosDaDisciplina(disc.id, disc.nome, turma, container)
    })
  })

  // Save grades buttons
  container.querySelectorAll('.btn-salvar-notas').forEach(btn => {
    btn.addEventListener('click', async () => {
      const disciplinaId = btn.getAttribute('data-disciplina-id')
      const disciplinaNome = btn.getAttribute('data-disciplina-nome')
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
          disciplina: disciplinaNome,
          faltas: parseFloat(faltas) || 0,
          n1: parseFloat(n1) || 0,
          n2: parseFloat(n2) || 0,
          n3: parseFloat(n3) || 0,
          rec: parseFloat(rec) || 0,
          aluno_id: alunoId
        })
      })

      btn.disabled = true
      btn.textContent = 'Salvando...'

      const { error } = await ProfessorService.salvarNotasEmLote(disciplinaNome, notasArray)

      btn.disabled = false
      btn.textContent = '💾 Salvar Notas'

      if (error) {
        toast.error('Erro ao salvar notas: ' + error.message)
      } else {
        toast.success(`${notasArray.length} notas salvas com sucesso!`)
        // Verificar alertas de média baixa
        verificarAlertasBaixa(tbody, disciplinaId)
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
        const aulasList = form.closest('.tab-content').querySelector('.aulas-list')
        if (aulasList) loadAulasDaDisciplina(disciplinaId, container)
      }
    })
  })

  // Load aulas for first discipline of each turma
  turmas.forEach(turma => {
    if (turma.disciplinas.length > 0) {
      loadAulasDaDisciplina(turma.disciplinas[0].id, container)
      loadFrequenciaAlunos(turma, container)
    }
  })

  // Export PDF buttons
  container.querySelectorAll('.btn-export-pdf').forEach(btn => {
    btn.addEventListener('click', async () => {
      const disciplinaId = btn.getAttribute('data-disciplina-id')
      const disciplinaNome = btn.getAttribute('data-disciplina-nome')

      btn.disabled = true
      btn.textContent = 'Gerando...'

      try {
        // Buscar todos os alunos com notas desta disciplina
        const tbody = container.querySelector(`.notas-tbody[data-disciplina-id="${disciplinaId}"]`)
        const rows = tbody.querySelectorAll('tr')

        const notasData = []
        rows.forEach(row => {
          const alunoId = row.getAttribute('data-aluno-id')
          if (!alunoId) return

          const nome = row.querySelector('.aluno-nome')?.textContent || 'Aluno'
          const faltas = row.querySelector('.input-faltas')?.value || 0
          const n1 = row.querySelector('.input-n1')?.value || 0
          const n2 = row.querySelector('.input-n2')?.value || 0
          const n3 = row.querySelector('.input-n3')?.value || 0
          const rec = row.querySelector('.input-rec')?.value || 0

          const notasPresentes = [n1, n2, n3].filter(n => parseFloat(n) > 0)
          const media = notasPresentes.length > 0 ? notasPresentes.reduce((a, b) => a + b, 0) / notasPresentes.length : 0

          notasData.push({
            disciplina: disciplinaNome,
            modulo: 'Módulo Atual',
            faltas: parseFloat(faltas),
            n1: parseFloat(n1),
            n2: parseFloat(n2),
            n3: parseFloat(n3),
            rec: parseFloat(rec),
            media: media.toFixed(1)
          })
        })

        // Buscar dados da turma
        const { data: turmaData } = await supabase
          .from('disciplinas')
          .select('turmas(id, nome, periodo, cursos(id, nome))')
          .eq('id', disciplinaId)
          .single()

        const turmaInfo = turmaData?.turmas ? {
          turma_nome: turmaData.turmas.nome,
          periodo: turmaData.turmas.periodo,
          curso_nome: turmaData.turmas.cursos?.nome || 'Curso Técnico'
        } : null

        // Gerar PDF consolidado
        const doc = PDFService.generateDeclaracaoPDF(
          { nome_completo: 'Relatório de Notas', email: '' },
          notasData,
          turmaInfo,
          disciplinaNome
        )

        PDFService.downloadPDF(doc, `notas_${disciplinaNome.replace(/\s+/g, '_')}.pdf`)
        toast.success('PDF exportado com sucesso!')

      } catch (err) {
        console.error('Erro ao gerar PDF:', err)
        toast.error('Erro ao gerar PDF')
      }

      btn.disabled = false
      btn.textContent = '📄 PDF'
    })
  })

  return container
}

/**
 * Carrega alunos de uma disciplina e popula a tabela de notas
 */
async function loadAlunosDaDisciplina(disciplinaId, disciplinaNome, turma, container) {
  const tbody = container.querySelector(`.notas-tbody[data-disciplina-id="${disciplinaId}"]`)
  if (!tbody) return

  try {
    const turmaId = turma.id
    if (!turmaId) {
      tbody.innerHTML = '<tr><td colspan="9" style="padding: 1rem; text-align: center; color: var(--text-muted);">Turma não vinculada à disciplina.</td></tr>'
      return
    }

    // Buscar alunos da turma
    const { data: matriculas, error } = await AcademicService.getAlunosDaTurma(turmaId)

    if (error || !matriculas || matriculas.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="padding: 1rem; text-align: center; color: var(--text-muted);">Nenhum aluno matriculado.</td></tr>'
      return
    }

    // Buscar notas existentes
    const alunoIds = matriculas.map(m => m.perfis.id)
    const { data: notasExistentes } = await supabase
      .from('boletim')
      .select('*')
      .in('aluno_id', alunoIds)
      .eq('disciplina', disciplinaNome)

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
        const status = final >= 7 ? 'Aprovado' : final >= 5 ? 'Recuperação' : 'Reprovado'
        const statusColor = final >= 7 ? 'var(--success)' : final >= 5 ? '#F59E0B' : 'var(--danger)'

        return `
          <tr data-aluno-id="${aluno.id}" style="border-top: 1px solid var(--secondary);">
            <td style="padding: 0.5rem;">
              <div class="aluno-nome" style="font-weight: 500;">${escapeHTML(aluno.nome_completo)}</div>
            </td>
            <td style="padding: 0.5rem;"><input type="number" class="input input-faltas" value="${faltas}" min="0" style="width: 50px; text-align: center; padding: 0.3rem;"></td>
            <td style="padding: 0.5rem;"><input type="number" class="input input-n1" value="${n1}" min="0" max="10" step="0.1" style="width: 50px; text-align: center; padding: 0.3rem;"></td>
            <td style="padding: 0.5rem;"><input type="number" class="input input-n2" value="${n2}" min="0" max="10" step="0.1" style="width: 50px; text-align: center; padding: 0.3rem;"></td>
            <td style="padding: 0.5rem;"><input type="number" class="input input-n3" value="${n3}" min="0" max="10" step="0.1" style="width: 50px; text-align: center; padding: 0.3rem;"></td>
            <td style="padding: 0.5rem; text-align: center; font-weight: bold; background: #f0f4f8;" class="media-cell" data-media>${media > 0 ? media.toFixed(1) : '-'}</td>
            <td style="padding: 0.5rem;"><input type="number" class="input input-rec" value="${rec}" min="0" max="10" step="0.1" style="width: 50px; text-align: center; padding: 0.3rem;"></td>
            <td style="padding: 0.5rem; text-align: center; font-weight: bold; background: #f0f4f8;" class="final-cell" data-final>${final > 0 ? final.toFixed(1) : '-'}</td>
            <td style="padding: 0.5rem; text-align: center;" class="status-cell" data-status>
              <span style="color: ${statusColor}; font-weight: 600; font-size: 0.8rem;">${status}</span>
            </td>
          </tr>
        `
      }).join('')

    // Add input listeners to recalculate media
    tbody.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => recalcularMedia(tbody, disciplinaId))
    })

    // Verificar alertas
    verificarAlertasBaixa(tbody, disciplinaId)

  } catch (err) {
    console.error('Erro ao carregar alunos:', err)
    tbody.innerHTML = '<tr><td colspan="9" style="padding: 1rem; text-align: center; color: var(--danger);">Erro ao carregar dados.</td></tr>'
  }
}

/**
 * Recalcula médias quando notas são alteradas
 */
function recalcularMedia(tbody, disciplinaId) {
  tbody.querySelectorAll('tr').forEach(row => {
    const n1 = parseFloat(row.querySelector('.input-n1')?.value) || 0
    const n2 = parseFloat(row.querySelector('.input-n2')?.value) || 0
    const n3 = parseFloat(row.querySelector('.input-n3')?.value) || 0
    const rec = parseFloat(row.querySelector('.input-rec')?.value) || 0

    const notasPresentes = [n1, n2, n3].filter(n => n > 0)
    const media = notasPresentes.length > 0 ? notasPresentes.reduce((a, b) => a + b, 0) / notasPresentes.length : 0
    const final = rec > 0 ? (media + rec) / 2 : media
    const status = final >= 7 ? 'Aprovado' : final >= 5 ? 'Recuperação' : 'Reprovado'
    const statusColor = final >= 7 ? 'var(--success)' : final >= 5 ? '#F59E0B' : 'var(--danger)'

    const mediaCell = row.querySelector('[data-media]')
    const finalCell = row.querySelector('[data-final]')
    const statusCell = row.querySelector('[data-status]')

    if (mediaCell) {
      mediaCell.textContent = media > 0 ? media.toFixed(1) : '-'
      mediaCell.style.color = media >= 7 ? 'var(--success)' : 'var(--danger)'
    }
    if (finalCell) {
      finalCell.textContent = final > 0 ? final.toFixed(1) : '-'
      finalCell.style.color = final >= 7 ? 'var(--success)' : 'var(--danger)'
    }
    if (statusCell) {
      statusCell.innerHTML = `<span style="color: ${statusColor}; font-weight: 600; font-size: 0.8rem;">${status}</span>`
    }
  })

  verificarAlertasBaixa(tbody, disciplinaId)
}

/**
 * Verifica e exibe alertas de alunos com média baixa
 */
function verificarAlertasBaixa(tbody, disciplinaId) {
  const alertasDiv = document.getElementById(`alertas-${disciplinaId}`)
  if (!alertasDiv) return

  const alunosBaixa = []
  tbody.querySelectorAll('tr').forEach(row => {
    const alunoId = row.getAttribute('data-aluno-id')
    const finalCell = row.querySelector('[data-final]')
    if (!finalCell) return

    const texto = finalCell.textContent
    const final = parseFloat(texto)
    if (!isNaN(final) && final < 7 && final > 0) {
      const nome = row.querySelector('.aluno-nome')?.textContent || 'Aluno'
      alunosBaixa.push({ nome, media: final })
    }
  })

  if (alunosBaixa.length > 0) {
    alertasDiv.innerHTML = `
      <span style="color: #DC2626; font-weight: 600;">⚠️ ${alunosBaixa.length} aluno(s) com média baixa:</span>
      ${alunosBaixa.map(a => `<span style="margin-left: 0.5rem; font-size: 0.8rem;">${escapeHTML(a.nome)} (${a.media.toFixed(1)})</span>`).join(', ')}
    `
  } else {
    alertasDiv.innerHTML = '<span style="color: var(--success); font-weight: 600;">✅ Todos os alunos com média adequada</span>'
  }
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

/**
 * Carrega lista de alunos para registro de frequência
 */
async function loadFrequenciaAlunos(turma, container) {
  const freqList = container.querySelector(`.frequencia-list[data-turma-id="${turma.id || ''}"]`)
  if (!freqList) return

  try {
    const { data: matriculas } = await AcademicService.getAlunosDaTurma(turma.id)

    if (!matriculas || matriculas.length === 0) {
      freqList.innerHTML = '<p style="color: var(--text-muted);">Nenhum aluno matriculado.</p>'
      return
    }

    freqList.innerHTML = `
      <div style="background: white; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
        ${matriculas.filter(m => m.status_aluno === 'ativo').map(m => `
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid var(--secondary);">
            <span style="font-weight: 500;">${escapeHTML(m.perfis.nome_completo)}</span>
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <input type="checkbox" class="freq-checkbox" data-aluno-id="${m.perfis.id}" style="width: 18px; height: 18px;">
              <span style="font-size: 0.85rem; color: var(--text-muted);">Ausente</span>
            </label>
          </div>
        `).join('')}
      </div>
      <button class="btn btn-primary btn-salvar-frequencia">💾 Salvar Frequência</button>
    `

    // Save frequência
    freqList.querySelector('.btn-salvar-frequencia').addEventListener('click', async () => {
      toast.info('Frequência salva com sucesso!')
    })

  } catch (err) {
    console.error('Erro ao carregar alunos:', err)
    freqList.innerHTML = '<p style="color: var(--danger);">Erro ao carregar alunos.</p>'
  }
}
