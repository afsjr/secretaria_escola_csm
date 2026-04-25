/**
 * Professor Diário de Aulas View
 *
 * Permite ao professor registrar e gerenciar aulas dadas:
 * - Selecionar disciplina/turma
 * - Informar data e conteúdo
 * - Ver histórico de aulas
 * - Editar aulas registradas
 */

import { ProfessorService } from '../lib/professor-service'
import { CourseService } from '../lib/course-service'
import { toast } from '../lib/toast'
import { escapeHTML, createBadge } from '../lib/security'
import { formatDateBR } from '../lib/date-utils'

interface TurmaData {
  turma_nome: string
  periodo: string
  disciplinas: Array<{ id: string; nome: string }>
}

export async function ProfessorRegistrarAulaView(profile: { id: string }): Promise<HTMLElement> {
  const container = document.createElement('div')
  container.className = 'professor-registrar-aula-view animate-in'

  // Buscar disciplinas do professor
  const { data: disciplinas, error: errDisc } = await ProfessorService.getDisciplinasDoProfessor(profile.id)

  if (errDisc) {
    console.error('Erro ao buscar disciplinas:', errDisc)
  }

  // Agrupar por turma
  const turmasMap: Record<string, TurmaData> = {}
  disciplinas?.forEach((d: any) => {
    const turmaKey = d.turma_id || 'sem-turma'
    if (!turmasMap[turmaKey]) {
      turmasMap[turmaKey] = {
        turma_nome: d.turmas?.nome || 'Sem turma',
        periodo: d.turmas?.periodo || '-',
        disciplinas: []
      }
    }
    turmasMap[turmaKey].disciplinas.push(d)
  })

  const turmas: TurmaData[] = Object.values(turmasMap)

  container.innerHTML = `
    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; color: var(--text-main);">Diário de Aulas</h1>
      <p>Registre e gerencie as aulas ministradas.</p>
    </header>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
      <!-- Formulário -->
      <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        <h3 style="margin-bottom: 1.5rem; color: var(--primary);">Nova Aula</h3>

        <form id="form-registrar-aula">
          <div class="form-group">
            <label class="label" for="aula-turma">Turma</label>
            <select id="aula-turma" class="input" required>
              <option value="">Selecione a turma</option>
              ${turmas.map((t, idx) => `<option value="${idx}">${escapeHTML(t.turma_nome)} (${escapeHTML(t.periodo)})</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="label" for="aula-disciplina">Disciplina</label>
            <select id="aula-disciplina" class="input" required>
              <option value="">Selecione a disciplina</option>
            </select>
          </div>

          <div class="form-group">
            <label class="label" for="aula-data">Data da Aula</label>
            <input type="date" id="aula-data" class="input" value="${new Date().toISOString().split('T')[0]}" required>
          </div>

          <div class="form-group">
            <label class="label" for="aula-conteudo">Conteúdo Ministrado</label>
            <textarea id="aula-conteudo" class="input" rows="5" placeholder="Descreva detalhadamente o conteúdo abordado na aula, atividades realizadas, dúvidas frequentes dos alunos, etc..." required></textarea>
          </div>

          <div class="form-group">
            <label class="label" for="aula-observacoes">Observações (opcional)</label>
            <textarea id="aula-observacoes" class="input" rows="3" placeholder="Ex: maioria dos alunos faltou, atividade prática cancelada, etc..."></textarea>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%;">📅 Registrar Aula</button>
        </form>
      </div>

      <!-- Histórico -->
      <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        <h3 style="margin-bottom: 1.5rem; color: var(--primary);">Aulas Registradas</h3>

        <div id="historico-aulas">
          <p style="color: var(--text-muted); text-align: center; padding: 2rem;">Carregando histórico...</p>
        </div>
      </div>
    </div>
  `

  // === Event Handlers ===

  // When turma changes, update disciplinas dropdown
  const turmaSelect = container.querySelector('#aula-turma') as HTMLSelectElement
  const disciplinaSelect = container.querySelector('#aula-disciplina') as HTMLSelectElement

  turmaSelect.addEventListener('change', () => {
    const turmaIdx = turmaSelect.value
    if (turmaIdx === '') {
      disciplinaSelect.innerHTML = '<option value="">Selecione a disciplina</option>'
      return
    }

    const turma = turmas[parseInt(turmaIdx)]
    disciplinaSelect.innerHTML = `
      <option value="">Selecione a disciplina</option>
      ${turma.disciplinas.map(d => `<option value="${d.id}">${escapeHTML(d.nome)}</option>`).join('')}
    `
  })

  // Form submission
  const form = container.querySelector('#form-registrar-aula') as HTMLFormElement
  form.addEventListener('submit', async (e: Event) => {
    e.preventDefault()

    const disciplinaId = disciplinaSelect.value
    const data = (container.querySelector('#aula-data') as HTMLInputElement).value
    const conteudo = (container.querySelector('#aula-conteudo') as HTMLTextAreaElement).value
    const observacoes = (container.querySelector('#aula-observacoes') as HTMLTextAreaElement).value

    if (!disciplinaId || !data || !conteudo) {
      toast.error('Preencha todos os campos obrigatórios!')
      return
    }

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement
    submitBtn.disabled = true
    submitBtn.textContent = 'Registrando...'

    try {
      const { error } = await ProfessorService.registrarAula({
        disciplina_id: disciplinaId,
        professor_id: profile.id,
        data,
        conteudo: observacoes ? `${conteudo}\n\nObs: ${observacoes}` : conteudo
      })

      if (error) {
        throw error
      }

      toast.success('Aula registrada com sucesso!')
      form.reset()
      ;(container.querySelector('#aula-data') as HTMLInputElement).value = new Date().toISOString().split('T')[0]

      // Reload histórico
      await loadHistoricoAulas(profile.id, container)

    } catch (err: any) {
      toast.error('Erro ao registrar aula: ' + err.message)
    }

    submitBtn.disabled = false
    submitBtn.textContent = '📅 Registrar Aula'
  })

  // Load initial histórico
  await loadHistoricoAulas(profile.id, container)

  return container
}

/**
 * Carrega histórico de aulas do professor
 */
async function loadHistoricoAulas(professorId: string, container: HTMLElement): Promise<void> {
  const historicoDiv = container.querySelector('#historico-aulas') as HTMLDivElement

  try {
    // Buscar todas as disciplinas do professor
    const { data: disciplinas } = await ProfessorService.getDisciplinasDoProfessor(professorId)

    if (!disciplinas || disciplinas.length === 0) {
      historicoDiv.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Nenhuma disciplina atribuída.</p>'
      return
    }

    // Buscar aulas de todas as disciplinas
    let todasAulas: any[] = []
    for (const disc of disciplinas) {
      const { data: aulas } = await ProfessorService.getAulasDaDisciplina(disc.id)
      if (aulas) {
        todasAulas = todasAulas.concat(aulas.map((a: any) => ({
          ...a,
          disciplina_nome: disc.nome,
          turma_nome: disc.turmas?.nome || '-'
        })))
      }
    }

    // Ordenar por data (mais recente primeiro)
    todasAulas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())

    if (todasAulas.length === 0) {
      historicoDiv.innerHTML = '<p style="color: var(--text-muted); text-align: center;">Nenhuma aula registrada ainda.</p>'
      return
    }

    historicoDiv.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 500px; overflow-y: auto;">
        ${todasAulas.map((aula: any) => `
          <div style="padding: 1rem; background: var(--secondary); border-radius: 6px; border-left: 4px solid var(--primary);">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
              <div>
                ${createBadge(formatDateBR(aula.data))}
                <span style="font-size: 0.85rem; color: var(--text-muted); margin-left: 0.5rem;">${escapeHTML(aula.turma_nome)}</span>
              </div>
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn-edit-aula" data-aula-id="${aula.id}" data-aula-conteudo="${escapeHTML(aula.conteudo).replace(/"/g, '&quot;')}" data-aula-data="${aula.data}" style="background: none; border: none; color: var(--primary); cursor: pointer; font-size: 0.8rem;" title="Editar">✎</button>
                <button class="btn-delete-aula" data-aula-id="${aula.id}" style="background: none; border: none; color: var(--danger); cursor: pointer; font-size: 0.8rem;" title="Excluir">✕</button>
              </div>
            </div>
            <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 0.3rem;">${escapeHTML(aula.disciplina_nome)}</div>
            <div style="white-space: pre-wrap; font-size: 0.85rem; color: var(--text-main);">${escapeHTML(aula.conteudo)}</div>
          </div>
        `).join('')}
      </div>
    `

    // Edit handlers - open modal
    historicoDiv.querySelectorAll('.btn-edit-aula').forEach(btn => {
      btn.addEventListener('click', () => {
        const aulaId = btn.getAttribute('data-aula-id')
        const conteudo = btn.getAttribute('data-aula-conteudo')
        const data = btn.getAttribute('data-aula-data')
        openEditModal(aulaId!, conteudo!, data!, professorId, container)
      })
    })

    // Delete handlers
    historicoDiv.querySelectorAll('.btn-delete-aula').forEach(btn => {
      btn.addEventListener('click', async () => {
        const aulaId = btn.getAttribute('data-aula-id')
        if (!confirm('Deseja excluir esta aula?')) return

        const { error } = await ProfessorService.excluirAula(aulaId!)
        if (error) {
          toast.error('Erro ao excluir: ' + error.message)
        } else {
          toast.success('Aula excluída!')
          await loadHistoricoAulas(professorId, container)
        }
      })
    })

  } catch (err) {
    console.error('Erro ao carregar histórico:', err)
    historicoDiv.innerHTML = '<p style="color: var(--danger); text-align: center;">Erro ao carregar histórico.</p>'
  }
}

/**
 * Abre modal para editar uma aula
 */
function openEditModal(
  aulaId: string,
  conteudoAtual: string,
  dataAtual: string,
  professorId: string,
  container: HTMLElement
): void {
  // Remove modal existente se houver
  const existingModal = document.getElementById('modal-edit-aula')
  if (existingModal) existingModal.remove()

  const modal = document.createElement('div')
  modal.id = 'modal-edit-aula'
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `

  modal.innerHTML = `
    <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
      <h3 style="margin: 0 0 1.5rem 0; color: var(--text-main);">Editar Aula</h3>

      <form id="form-edit-aula">
        <div class="form-group">
          <label class="label" for="edit-aula-data">Data da Aula</label>
          <input type="date" id="edit-aula-data" class="input" value="${dataAtual}" required>
        </div>

        <div class="form-group">
          <label class="label" for="edit-aula-conteudo">Conteúdo Ministrado</label>
          <textarea id="edit-aula-conteudo" class="input" rows="6" required>${conteudoAtual}</textarea>
        </div>

        <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
          <button type="submit" class="btn btn-primary" style="flex: 1;">Salvar Alterações</button>
          <button type="button" id="btn-cancel-edit" class="btn" style="flex: 1; background: var(--secondary); color: var(--text-main);">Cancelar</button>
        </div>
      </form>
    </div>
  `

  document.body.appendChild(modal)

  // Close modal handlers
  const closeModal = () => modal.remove()

  modal.querySelector('#btn-cancel-edit')?.addEventListener('click', closeModal)
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal()
  })

  // Submit handler
  modal.querySelector('#form-edit-aula')?.addEventListener('submit', async (e: Event) => {
    e.preventDefault()

    const novaData = (modal.querySelector('#edit-aula-data') as HTMLInputElement).value
    const novoConteudo = (modal.querySelector('#edit-aula-conteudo') as HTMLTextAreaElement).value

    if (!novaData || !novoConteudo) {
      toast.error('Preencha todos os campos!')
      return
    }

    const submitBtn = modal.querySelector('button[type="submit"]') as HTMLButtonElement
    submitBtn.disabled = true
    submitBtn.textContent = 'Salvando...'

    try {
      const { error } = await ProfessorService.atualizarAula(aulaId, {
        data: novaData,
        conteudo: novoConteudo
      })

      if (error) {
        throw error
      }

      toast.success('Aula atualizada com sucesso!')
      closeModal()

      // Reload histórico
      await loadHistoricoAulas(professorId, container)

    } catch (err: any) {
      console.error('Erro ao atualizar:', err)
      toast.error('Erro ao atualizar aula: ' + err.message)
    }

    submitBtn.disabled = false
    submitBtn.textContent = 'Salvar Alterações'
  })
}
