import { ProfessorService } from '../../lib/professor-service'
import { ProfessorDetailsView } from '../../views/professor-details'
import { ExcelService } from '../../lib/excel-service'
import { toast } from '../../lib/toast'
import { escapeHTML } from '../../lib/security'

interface GerenciarProfessoresProps {
  professores: any[]
  disciplinas: any[]
  turmas: any[]
  onRefresh?: () => void
}

export function GerenciarProfessoresTab({ professores, disciplinas, turmas, onRefresh }: GerenciarProfessoresProps): HTMLDivElement {
  const container = document.createElement('div')
  
  const renderList = () => `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
      <!-- Lista de Professores -->
      <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h3 style="margin: 0; color: var(--text-main);">Professores Cadastrados</h3>
          <button id="btn-export-professores" class="btn btn-primary btn-sm" style="background: #217346; color: white; font-weight: 600;">
            📊 Exportar Excel
          </button>
        </div>

        ${!professores || professores.length === 0 ? '<p style="color: var(--text-muted);">Nenhum professor cadastrado.</p>' : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                ${professores.map(p => `
                  <tr>
                    <td>
                      <div class="fw-600 text-main">${escapeHTML(p.nome_completo)}</div>
                    </td>
                    <td>${escapeHTML(p.email)}</td>
                    <td style="display: flex; gap: 0.3rem;">
                      <button class="btn btn-sm btn-ver-ficha-prof" data-id="${p.id}" style="background: var(--primary); color: white; font-size: 0.7rem; padding: 0.3rem 0.6rem; border-radius: 4px;">📋 Ficha</button>
                      <button class="btn btn-primary btn-sm btn-vincular-disciplinas" data-id="${p.id}" data-nome="${escapeHTML(p.nome_completo)}" style="font-size: 0.7rem; padding: 0.3rem 0.6rem; border-radius: 4px;">🔗 Vincular Disciplinas</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- Disciplinas -->
      <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        <h3 style="margin: 0 0 1rem 0; color: var(--text-main);">Disciplinas do Curso</h3>

        ${!disciplinas || disciplinas.length === 0 ? '<p style="color: var(--text-muted);">Nenhuma disciplina cadastrada.</p>' : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Disciplina</th>
                  <th>Módulo</th>
                  <th>Turma</th>
                  <th>Professor</th>
                </tr>
              </thead>
              <tbody>
                ${disciplinas.map(d => `
                  <tr>
                    <td>${escapeHTML(d.nome)}</td>
                    <td>${escapeHTML(d.modulo)}</td>
                    <td>
                      ${d.turmas?.nome ? `<span class="badge badge-info">${escapeHTML(d.turmas.nome)}</span>` : '<span class="badge badge-warning">Sem turma</span>'}
                    </td>
                    <td>
                      ${d.perfis?.nome_completo ? `<span class="badge badge-success">${escapeHTML(d.perfis.nome_completo)}</span>` : '<span class="badge badge-warning">Sem professor</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `

  const renderModal = () => `
    <div id="modal-vincular-disciplinas" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
      <div class="modal-content" style="background: white; padding: 2rem; border-radius: var(--radius-lg); max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3 style="margin: 0; color: var(--text-main);">Vincular Disciplinas e Turma ao Professor</h3>
          <button id="btn-fechar-modal-vincular" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
        </div>

        <p style="margin-bottom: 1rem; color: var(--text-muted); font-size: 0.9rem;">Selecione as disciplinas que o professor <strong id="nome-professor-vincular"></strong> irá ministrar e vincule a cada turma:</p>

        <form id="form-vincular-disciplinas">
          <input type="hidden" id="professor-id-vincular" name="professor_id">

          <div style="max-height: 400px; overflow-y: auto; border: 1px solid var(--secondary); border-radius: 8px; padding: 1rem;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead style="background: var(--secondary); font-size: 0.8rem; text-transform: uppercase;">
                <tr>
                  <th style="padding: 0.75rem; text-align: left;">Selecionar</th>
                  <th style="padding: 0.75rem; text-align: left;">Disciplina</th>
                  <th style="padding: 0.75rem; text-align: left;">Módulo</th>
                  <th style="padding: 0.75rem; text-align: left;">Turma</th>
                  <th style="padding: 0.75rem; text-align: left;">Professor Atual</th>
                </tr>
              </thead>
              <tbody>
                ${disciplinas.map(d => `
                  <tr class="disciplina-row" data-id="${d.id}" style="border-bottom: 1px solid var(--secondary);">
                    <td style="padding: 0.75rem;">
                      <input type="checkbox" name="disciplinas" value="${d.id}" ${d.professor_id ? 'checked' : ''} class="disciplina-checkbox">
                    </td>
                    <td style="padding: 0.75rem; font-weight: 500;">${escapeHTML(d.nome)}</td>
                    <td style="padding: 0.75rem; color: var(--text-muted);">${escapeHTML(d.modulo)}</td>
                    <td style="padding: 0.75rem;">
                      <select name="turma_${d.id}" class="input turma-select" style="padding: 0.3rem; font-size: 0.8rem; width: 100%;">
                        <option value="">-- Sem Turma --</option>
                        ${turmas.map(t => `<option value="${t.id}" ${d.turma_id === t.id ? 'selected' : ''}>${escapeHTML(t.nome)} (${escapeHTML(t.periodo)})</option>`).join('')}
                      </select>
                    </td>
                    <td style="padding: 0.75rem;">
                      ${d.perfis?.nome_completo ? `<span class="badge badge-success" style="font-size: 0.75rem;">${escapeHTML(d.perfis.nome_completo)}</span>` : '<span style="color: var(--text-muted); font-size: 0.8rem;">—</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" id="btn-cancelar-vincular" class="btn" style="flex: 1; background: var(--secondary); color: var(--text-main);">Cancelar</button>
            <button type="submit" class="btn btn-primary" id="btn-salvar-vincular" style="flex: 1;">Salvar Vinculação</button>
          </div>
        </form>
      </div>
    </div>
  `

  container.innerHTML = `
    ${renderList()}
    ${renderModal()}
  `

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  // Ficha
  const btnsVerFichaProf = container.querySelectorAll('.btn-ver-ficha-prof')
  btnsVerFichaProf.forEach(btn => {
    btn.addEventListener('click', async () => {
      const professorId = btn.getAttribute('data-id')!
      const btnEl = btn as HTMLButtonElement
      btnEl.disabled = true
      btnEl.textContent = '...'

      try {
        const detailsView = await ProfessorDetailsView(professorId)
        const mainContainer = container.closest('.secretaria-view') || container.parentElement
        if (mainContainer) {
          mainContainer.innerHTML = ''
          mainContainer.appendChild(detailsView)
        }
      } catch (err: any) {
        toast.error('Erro ao carregar ficha: ' + err.message)
      } finally {
        btnEl.disabled = false
        btnEl.textContent = '📋 Ficha'
      }
    })
  })

  // Modal Vincular
  const modalVincular = container.querySelector('#modal-vincular-disciplinas') as HTMLElement
  const btnsVincular = container.querySelectorAll('.btn-vincular-disciplinas')
  
  btnsVincular.forEach(btn => {
    btn.addEventListener('click', () => {
      const professorId = btn.getAttribute('data-id')!
      const professorNome = btn.getAttribute('data-nome')!
      ;(container.querySelector('#professor-id-vincular') as HTMLInputElement).value = professorId
      ;(container.querySelector('#nome-professor-vincular') as HTMLElement).textContent = professorNome

      // Reset checkboxes based on current assignments
      container.querySelectorAll('input[name="disciplinas"]').forEach(cb => {
        const checkbox = cb as HTMLInputElement
        const discId = checkbox.value
        const disc = disciplinas.find(d => d.id === discId)
        checkbox.checked = disc?.professor_id === professorId
      })

      modalVincular.style.display = 'flex'
    })
  })

  const fecharModal = () => modalVincular.style.display = 'none'
  container.querySelector('#btn-fechar-modal-vincular')?.addEventListener('click', fecharModal)
  container.querySelector('#btn-cancelar-vincular')?.addEventListener('click', fecharModal)

  // Submit Vincular
  const formVincular = container.querySelector('#form-vincular-disciplinas') as HTMLFormElement
  if (formVincular) {
    formVincular.addEventListener('submit', async (e) => {
      e.preventDefault()
      const professorId = (container.querySelector('#professor-id-vincular') as HTMLInputElement).value
      const checkboxes = container.querySelectorAll('input[name="disciplinas"]:checked')

      const vinculacoes: any[] = []
      checkboxes.forEach(cb => {
        const disciplinaId = (cb as HTMLInputElement).value
        const turmaSelect = container.querySelector(`select[name="turma_${disciplinaId}"]`) as HTMLSelectElement
        const turmaId = turmaSelect ? turmaSelect.value : null
        vinculacoes.push({ disciplinaId, turmaId })
      })

      if (vinculacoes.length === 0) {
        toast.warning('Selecione pelo menos uma disciplina!')
        return
      }

      const btnSalvar = container.querySelector('#btn-salvar-vincular') as HTMLButtonElement
      btnSalvar.disabled = true
      btnSalvar.textContent = 'Salvando...'

      try {
        // Desvincular disciplinas atuais do professor antes de vincular as novas
        const currentDiscs = disciplinas.filter(d => d.professor_id === professorId)
        for (const d of currentDiscs) {
          await ProfessorService.desvincularProfessorDisciplina(d.id)
        }

        const { error } = await ProfessorService.vincularProfessorDisciplinasTurma(professorId, vinculacoes)
        if (error) throw error
        
        toast.success('Disciplinas vinculadas com sucesso!')
        fecharModal()
        if (onRefresh) onRefresh()
      } catch (err: any) {
        toast.error('Erro ao vincular: ' + err.message)
      } finally {
        btnSalvar.disabled = false
        btnSalvar.textContent = 'Salvar Vinculação'
      }
    })
  }

  // Exportar
  container.querySelector('#btn-export-professores')?.addEventListener('click', () => {
    try {
      ExcelService.exportProfessores(professores)
      toast.success('Exportado com sucesso!')
    } catch (err: any) {
      toast.error('Erro ao exportar: ' + err.message)
    }
  })

  return container
}
