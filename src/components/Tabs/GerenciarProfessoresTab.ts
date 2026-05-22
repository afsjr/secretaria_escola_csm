import { ICONS } from '../../lib/icons'
import { escapeHTML } from '../../lib/security'
import { supabase } from '../../lib/supabase'
import { CourseService } from '../../lib/course-service'
import { toast } from '../../lib/toast'

interface Professor {
  id: string
  nome_completo: string
  email: string
  cpf?: string
  telefone?: string
}

interface Disciplina {
  id: string
  nome: string
  modulo: string
}

interface Turma {
  id: string
  nome: string
  periodo: string
}

interface GerenciarProfessoresProps {
  professores: Professor[]
  disciplinas: Disciplina[]
  turmas: Turma[]
  onRefresh?: () => void
}

export function GerenciarProfessoresTab({ 
  professores, 
  disciplinas, 
  turmas, 
  onRefresh 
}: GerenciarProfessoresProps): HTMLDivElement {
  const container = document.createElement('div')
  container.className = 'animate-in'
  const modalId = 'modal-vincular-' + Date.now()

  const renderStats = () => `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
      <div class="stat-card">
        <div class="stat-label">Professores Cadastrados</div>
        <div class="stat-value">${escapeHTML(String(professores.length))}</div>
      </div>
      <div class="stat-card" style="border-bottom: 4px solid var(--accent);">
        <div class="stat-label">Disciplinas Ativas</div>
        <div class="stat-value" style="color: var(--accent);">${escapeHTML(String(disciplinas.length))}</div>
      </div>
    </div>
  `

  const renderTable = () => `
    <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 style="margin: 0;">Corpo Docente</h3>
        <button class="btn btn-primary" id="btn-refresh-professores">${ICONS.refresh} Atualizar</button>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Professor</th>
              <th>Contato</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${professores.map(p => `
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div class="avatar-circle" style="background: var(--primary); color: white;">
                      ${escapeHTML(p.nome_completo.charAt(0).toUpperCase())}
                    </div>
                    <div style="font-weight: 600;">${escapeHTML(p.nome_completo)}</div>
                  </div>
                </td>
                <td>
                  <div style="font-size: 0.85rem;">${escapeHTML(p.email)}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHTML(p.telefone || '---')}</div>
                </td>
                <td style="text-align: right;">
                  <div style="display: flex; gap: 8px; justify-content: flex-end;">
                    <button class="btn btn-sm btn-secondary" onclick="window.location.hash='#/professor-details?id=${escapeHTML(p.id)}'" title="Ver Perfil">${ICONS.eye}</button>
                    <button class="btn btn-sm btn-primary" onclick="window.location.hash='#/professor-details?edit=true&id=${escapeHTML(p.id)}'" title="Editar">${ICONS.edit}</button>
                    <button class="btn btn-sm btn-accent btn-vincular-professor" data-id="${p.id}" data-nome="${escapeHTML(p.nome_completo)}" title="Vincular">${ICONS.link}</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `

  const renderModal = () => `
    <div id="${modalId}" class="modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000;align-items:center;justify-content:center;">
      <div class="modal-content" style="background:white;border-radius:8px;padding:2rem;max-width:520px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
          <h2 style="margin:0;color:var(--primary);">Vincular Professor</h2>
          <button class="btn-modal-close" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">&times;</button>
        </div>

        <p id="vincular-info" style="margin-bottom:1.5rem;font-weight:600;"></p>

        <div class="form-group">
          <label class="label">Turma</label>
          <select id="vincular-turma" class="input">
            <option value="">-- Selecione a Turma --</option>
            ${turmas.map(t => `<option value="${t.id}">${escapeHTML(t.nome)} (${escapeHTML(t.periodo)})</option>`).join('')}
          </select>
        </div>

        <div class="form-group" style="margin-top:1rem;">
          <label class="label">Disciplina do Catálogo</label>
          <select id="vincular-disciplina" class="input" disabled>
            <option value="">-- Primeiro selecione a turma --</option>
          </select>
        </div>

        <div id="vincular-status" style="margin-top:1rem;"></div>

        <div style="display:flex;gap:0.5rem;justify-content:flex-end;margin-top:1.5rem;">
          <button class="btn btn-secondary btn-modal-close">Cancelar</button>
          <button id="btn-confirmar-vinculo" class="btn btn-primary" disabled>Vincular</button>
        </div>
      </div>
    </div>
  `

  container.innerHTML = `
    ${renderStats()}
    ${renderTable()}
    ${renderModal()}
  `

  // --- Variáveis de estado do modal ---
  let professorIdVinculando: string | null = null
  let professorNomeVinculando: string = ''

  // --- Eventos do modal ---
  const modal = container.querySelector<HTMLElement>(`#${modalId}`)!
  const vincularInfo = container.querySelector('#vincular-info')!
  const selectTurma = container.querySelector<HTMLSelectElement>('#vincular-turma')!
  const selectDisciplina = container.querySelector<HTMLSelectElement>('#vincular-disciplina')!
  const vincularStatus = container.querySelector('#vincular-status')!
  const btnConfirmar = container.querySelector<HTMLButtonElement>('#btn-confirmar-vinculo')!

  function abrirModal(profId: string, profNome: string) {
    professorIdVinculando = profId
    professorNomeVinculando = profNome
    vincularInfo.textContent = `Vinculando: ${profNome}`
    selectTurma.value = ''
    selectDisciplina.innerHTML = '<option value="">-- Primeiro selecione a turma --</option>'
    selectDisciplina.disabled = true
    vincularStatus.innerHTML = ''
    btnConfirmar.disabled = true
    modal.style.display = 'flex'
  }

  function fecharModal() {
    modal.style.display = 'none'
  }

  // Botões de fechar
  modal.querySelectorAll('.btn-modal-close').forEach(btn => {
    btn.addEventListener('click', fecharModal)
  })
  modal.addEventListener('click', (e) => {
    if (e.target === modal) fecharModal()
  })

  // Ao selecionar turma, carregar disciplinas do catálogo
  selectTurma.addEventListener('change', async () => {
    const turmaId = selectTurma.value
    selectDisciplina.innerHTML = '<option value="">Carregando...</option>'
    selectDisciplina.disabled = true
    btnConfirmar.disabled = true
    vincularStatus.innerHTML = ''

    if (!turmaId) {
      selectDisciplina.innerHTML = '<option value="">-- Primeiro selecione a turma --</option>'
      return
    }

    try {
      // Buscar curso_id da turma
      const { data: turma } = await supabase
        .from('turmas')
        .select('curso_id')
        .eq('id', turmaId)
        .single()

      if (!turma?.curso_id) {
        selectDisciplina.innerHTML = '<option value="">Turma sem curso vinculado</option>'
        return
      }

      // Buscar disciplinas do catálogo daquele curso
      const { data: catalogo } = await supabase
        .from('disciplinas_base')
        .select('id, nome, modulo')
        .eq('curso_id', turma.curso_id)
        .order('modulo')
        .order('nome')

      if (!catalogo?.length) {
        selectDisciplina.innerHTML = '<option value="">Nenhuma disciplina no catálogo</option>'
        return
      }

      selectDisciplina.innerHTML = '<option value="">-- Selecione a Disciplina --</option>' +
        catalogo.map(d => `<option value="${d.id}">${escapeHTML(d.nome)} (${escapeHTML(d.modulo)})</option>`).join('')
      selectDisciplina.disabled = false
    } catch (err: any) {
      selectDisciplina.innerHTML = '<option value="">Erro ao carregar disciplinas</option>'
      vincularStatus.innerHTML = `<p style="color:var(--danger);font-size:0.85rem;">${escapeHTML(err.message || 'Erro desconhecido')}</p>`
    }
  })

  // Ao selecionar disciplina, verificar se já existe oferta com professor
  selectDisciplina.addEventListener('change', async () => {
    const turmaId = selectTurma.value
    const discBaseId = selectDisciplina.value
    btnConfirmar.disabled = true
    vincularStatus.innerHTML = ''

    if (!turmaId || !discBaseId) return

    try {
      // Buscar oferta existente para esta turma+disciplina
      const { data: oferta } = await supabase
        .from('turma_disciplinas')
        .select('id, professor_id, perfis(id, nome_completo)')
        .eq('turma_id', turmaId)
        .eq('disciplina_base_id', discBaseId)
        .maybeSingle()

      if (oferta) {
        const perfisArray = oferta.perfis as Array<{ nome_completo: string }> | null
        const profAtual = perfisArray?.[0] || null
        if (oferta.professor_id && profAtual) {
          vincularStatus.innerHTML = `
            <div style="padding:1rem;background:#FEF3C7;border:1px solid #F59E0B;border-radius:6px;font-size:0.85rem;">
              <strong>⚠️ Atenção:</strong> Esta disciplina já está sob responsabilidade de <strong>${escapeHTML(profAtual.nome_completo)}</strong>.
              Ao confirmar, <strong>${escapeHTML(professorNomeVinculando)}</strong> passará a ser o professor responsável por lançar notas e diário de classe.
            </div>
          `
        } else {
          vincularStatus.innerHTML = `
            <div style="padding:0.75rem;background:#F0FDF4;border:1px solid #22C55E;border-radius:6px;font-size:0.85rem;">
              Disciplina ofertada na turma, mas sem professor. <strong>${escapeHTML(professorNomeVinculando)}</strong> será vinculado.
            </div>
          `
        }
      } else {
        vincularStatus.innerHTML = `
          <div style="padding:0.75rem;background:#EFF6FF;border:1px solid #3B82F6;border-radius:6px;font-size:0.85rem;">
            Nova oferta será criada para <strong>${escapeHTML(professorNomeVinculando)}</strong> nesta turma.
          </div>
        `
      }
      btnConfirmar.disabled = false
    } catch (err: any) {
      vincularStatus.innerHTML = `<p style="color:var(--danger);font-size:0.85rem;">${escapeHTML(err.message || 'Erro ao verificar')}</p>`
    }
  })

  // Confirmar vinculação
  btnConfirmar.addEventListener('click', async () => {
    const turmaId = selectTurma.value
    const discBaseId = selectDisciplina.value
    if (!turmaId || !discBaseId || !professorIdVinculando) return

    btnConfirmar.disabled = true
    btnConfirmar.textContent = 'Vinculando...'

    try {
      // Verificar oferta existente
      const { data: oferta } = await supabase
        .from('turma_disciplinas')
        .select('id')
        .eq('turma_id', turmaId)
        .eq('disciplina_base_id', discBaseId)
        .maybeSingle()

      if (oferta) {
        // Atualizar professor da oferta existente
        const { error } = await CourseService.atribuirProfessorAEstrutura(oferta.id, professorIdVinculando)
        if (error) throw error
        toast.success(`${professorNomeVinculando} vinculado como responsável pela disciplina!`)
      } else {
        // Criar nova oferta
        const { error } = await CourseService.criarOfertaDisciplina(turmaId, discBaseId, professorIdVinculando)
        if (error) throw error
        toast.success(`${professorNomeVinculando} vinculado à disciplina com sucesso!`)
      }

      fecharModal()
      onRefresh?.()
    } catch (err: any) {
      toast.error('Erro ao vincular: ' + err.message)
      btnConfirmar.disabled = false
      btnConfirmar.textContent = 'Vincular'
    }
  })

  // Abrir modal ao clicar em Vincular
  setTimeout(() => {
    container.querySelector('#btn-refresh-professores')?.addEventListener('click', () => onRefresh?.())
    container.querySelectorAll('.btn-vincular-professor').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).getAttribute('data-id')
        const nome = (btn as HTMLElement).getAttribute('data-nome')
        if (id && nome) abrirModal(id, nome)
      })
    })
  }, 0)

  return container
}
