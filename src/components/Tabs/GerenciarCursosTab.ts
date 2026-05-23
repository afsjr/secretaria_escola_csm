import { CourseService } from '../../lib/course-service'
import { toast } from '../../lib/toast'
import { escapeHTML } from '../../lib/security'

// Nota: O projeto parece usar CourseService de lib/professor-service ou lib/course-service.
// Vou verificar qual é o correto. No secretaria.ts original era import { CourseService } from '../lib/course-service'
import { CourseService as RealCourseService } from '../../lib/course-service'

interface GerenciarCursosProps {
  cursos: any[]
  onRefresh?: () => void
}

function tipoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    'tecnico': 'Técnico',
    'formacao': 'Formação Complementar'
  }
  return labels[tipo] || tipo || 'Técnico'
}

export function GerenciarCursosTab({ cursos, onRefresh }: GerenciarCursosProps): HTMLDivElement {
  const container = document.createElement('div')
  
  const renderContent = () => `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
      <!-- Formulário de Novo Curso -->
      <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        <h3 style="margin-bottom: 1.5rem; color: var(--text-main);">Cadastrar Novo Curso</h3>
        <p style="margin-bottom: 1.5rem; color: var(--text-muted); font-size: 0.9rem;">Cadastre cursos como Técnico em Enfermagem, Instrumentação Cirúrgica, ou cursos livres.</p>

        <form id="form-cadastro-curso">
          <div class="form-group">
            <label class="label" for="curso-nome">Nome do Curso *</label>
            <input type="text" id="curso-nome" name="curso_nome" class="input" placeholder="Ex: Técnico em Enfermagem" required>
          </div>

          <div class="form-group">
            <label class="label" for="curso-descricao">Descrição</label>
            <textarea id="curso-descricao" name="curso_descricao" class="input" rows="3" placeholder="Descreva brevemente o curso..."></textarea>
          </div>

          <div class="form-group">
            <label class="label" for="curso-tipo">Tipo do Curso *</label>
            <select id="curso-tipo" name="curso_tipo" class="input" required>
              <option value="tecnico">Curso Técnico (notas 0-10)</option>
              <option value="formacao">Formação Complementar (conceitos A/B/C)</option>
            </select>
            <div style="margin-top: 0.3rem; font-size: 0.8rem; color: var(--text-muted);">
              Cursos <strong>Técnicos</strong> usam notas numéricas 0-10. Cursos de <strong>Formação</strong> usam conceitos A/B/C.
            </div>
          </div>

          <button type="submit" class="btn btn-primary" id="btn-cadastrar-curso" style="width: 100%;">Cadastrar Curso</button>
        </form>
      </div>

      <!-- Lista de Cursos -->
      <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        <h3 style="margin: 0 0 1rem 0; color: var(--text-main);">Cursos Cadastrados</h3>

        ${!cursos || cursos.length === 0 ? '<p style="color: var(--text-muted);">Nenhum curso cadastrado.</p>' : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Tipo</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                ${cursos.map(c => `
                  <tr class="curso-row" data-id="${c.id}">
                    <td>
                      <div class="fw-600 text-main">${escapeHTML(c.nome)}</div>
                      <div class="text-sm text-muted">${escapeHTML(c.descricao || '')}</div>
                    </td>
                    <td>
                      <span class="badge ${c.tipo === 'formacao' ? 'badge-info' : 'badge-secondary'}">
                        ${escapeHTML(tipoLabel(c.tipo))}
                      </span>
                    </td>
                    <td>
                      <span class="badge ${c.ativo ? 'badge-success' : 'badge-warning'}">
                        ${c.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td style="display: flex; gap: 0.4rem;">
                      <button class="btn btn-sm btn-editar-curso" data-id="${c.id}" data-tipo="${c.tipo}" style="background: var(--primary); color: white; border-radius: 4px; padding: 0.3rem 0.6rem; font-size: 0.75rem; cursor: pointer;">Editar</button>
                      ${c.ativo ? `
                        <button class="btn btn-sm btn-desativar-curso" data-id="${c.id}" style="background: var(--danger); color: white; border-radius: 4px; padding: 0.3rem 0.6rem; font-size: 0.75rem;">Desativar</button>
                      ` : `
                        <button class="btn btn-sm btn-reativar-curso" data-id="${c.id}" style="background: var(--success); color: white; border-radius: 4px; padding: 0.3rem 0.6rem; font-size: 0.75rem;">Reativar</button>
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <div id="modal-confirmar-curso" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center;">
      <div style="background: white; border-radius: var(--radius-lg); padding: 2rem; max-width: 480px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
        <h3 style="margin: 0 0 1rem 0; color: var(--text-main);">Confirmar Cadastro</h3>
        <div id="modal-curso-detalhes" style="margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: var(--radius-md);">
          <p style="margin: 0.3rem 0;"><strong>Nome:</strong> <span id="modal-curso-nome"></span></p>
          <p style="margin: 0.3rem 0;"><strong>Descrição:</strong> <span id="modal-curso-descricao"></span></p>
          <p style="margin: 0.3rem 0;"><strong>Tipo:</strong> <span id="modal-curso-tipo"></span></p>
        </div>
        <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
          <button id="btn-cancelar-curso" class="btn" style="padding: 0.5rem 1.5rem; border: 1px solid var(--border); background: white; border-radius: var(--radius-md); cursor: pointer;">Cancelar</button>
          <button id="btn-confirmar-curso" class="btn btn-primary" style="padding: 0.5rem 1.5rem; border-radius: var(--radius-md); cursor: pointer;">Confirmar Cadastro</button>
        </div>
      </div>
    </div>

    <!-- Modal de Edição -->
    <div id="modal-editar-curso" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 9999; justify-content: center; align-items: center;">
      <div style="background: white; border-radius: var(--radius-lg); padding: 2rem; max-width: 480px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
        <h3 style="margin: 0 0 1rem 0; color: var(--text-main);">Editar Tipo do Curso</h3>
        <p style="margin-bottom: 1rem; color: var(--text-muted); font-size: 0.9rem;" id="modal-editar-curso-nome-display"></p>
        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label class="label" for="modal-editar-curso-tipo">Novo Tipo *</label>
          <select id="modal-editar-curso-tipo" class="input" required>
            <option value="tecnico">Curso Técnico (notas 0-10)</option>
            <option value="formacao">Formação Complementar (conceitos A/B/C)</option>
          </select>
        </div>
        <div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
          <button id="btn-cancelar-editar-curso" class="btn" style="padding: 0.5rem 1.5rem; border: 1px solid var(--border); background: white; border-radius: var(--radius-md); cursor: pointer;">Cancelar</button>
          <button id="btn-confirmar-editar-curso" class="btn btn-primary" style="padding: 0.5rem 1.5rem; border-radius: var(--radius-md); cursor: pointer;">Salvar</button>
        </div>
      </div>
    </div>
  `

  container.innerHTML = renderContent()

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  const tipoLabelsModal: Record<string, string> = {
    'tecnico': 'Curso Técnico',
    'formacao': 'Formação Complementar'
  }

  // Cadastro - passo 1: mostrar confirmação
  const formCadastro = container.querySelector('#form-cadastro-curso') as HTMLFormElement
  const modal = container.querySelector('#modal-confirmar-curso') as HTMLElement
  const btnCancelar = container.querySelector('#btn-cancelar-curso') as HTMLButtonElement
  const btnConfirmar = container.querySelector('#btn-confirmar-curso') as HTMLButtonElement

  // Modal de Edição
  const modalEditar = container.querySelector('#modal-editar-curso') as HTMLElement
  const btnCancelarEditar = container.querySelector('#btn-cancelar-editar-curso') as HTMLButtonElement
  const btnConfirmarEditar = container.querySelector('#btn-confirmar-editar-curso') as HTMLButtonElement

  if (formCadastro) {
    formCadastro.addEventListener('submit', (e) => {
      e.preventDefault()
      const nome = (container.querySelector('#curso-nome') as HTMLInputElement).value.trim()
      const descricao = (container.querySelector('#curso-descricao') as HTMLTextAreaElement).value.trim()
      const tipo = (container.querySelector('#curso-tipo') as HTMLSelectElement).value as 'tecnico' | 'formacao'

      ;(container.querySelector('#modal-curso-nome') as HTMLSpanElement).textContent = nome
      ;(container.querySelector('#modal-curso-descricao') as HTMLSpanElement).textContent = descricao || '(sem descrição)'
      ;(container.querySelector('#modal-curso-tipo') as HTMLSpanElement).textContent = tipoLabelsModal[tipo] || tipo

      modal.style.display = 'flex'
    })
  }

  // Cadastro - passo 2: confirmar
  if (btnConfirmar) {
    btnConfirmar.addEventListener('click', async () => {
      const nome = (container.querySelector('#curso-nome') as HTMLInputElement).value.trim()
      const descricao = (container.querySelector('#curso-descricao') as HTMLTextAreaElement).value.trim()
      const tipo = (container.querySelector('#curso-tipo') as HTMLSelectElement).value as 'tecnico' | 'formacao'

      modal.style.display = 'none'

      const btnSubmit = container.querySelector('#btn-cadastrar-curso') as HTMLButtonElement
      btnSubmit.disabled = true
      btnSubmit.textContent = 'Cadastrando...'

      try {
        const { error } = await RealCourseService.createCurso({ nome, descricao, tipo })
        if (error) throw error
        
        toast.success('Curso cadastrado com sucesso!')
        formCadastro.reset()
        if (onRefresh) onRefresh()
      } catch (err: any) {
        toast.error('Erro ao cadastrar: ' + err.message)
      } finally {
        btnSubmit.disabled = false
        btnSubmit.textContent = 'Cadastrar Curso'
      }
    })
  }

  // Fechar modal ao cancelar
  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      modal.style.display = 'none'
    })
  }

  // Fechar modal ao clicar fora
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none'
    })
  }

  // Desativar
  container.querySelectorAll('.btn-desativar-curso').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id')!
      const btnEl = btn as HTMLButtonElement
      btnEl.disabled = true
      btnEl.textContent = '...'

      try {
        const { error } = await RealCourseService.desativarCurso(id)
        if (error) throw error
        toast.success('Curso desativado!')
        if (onRefresh) onRefresh()
      } catch (err: any) {
        toast.error('Erro ao desativar: ' + err.message)
      } finally {
        btnEl.disabled = false
        btnEl.textContent = 'Desativar'
      }
    })
  })

  // Reativar
  container.querySelectorAll('.btn-reativar-curso').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id')!
      const btnEl = btn as HTMLButtonElement
      btnEl.disabled = true
      btnEl.textContent = '...'

      try {
        const { error } = await RealCourseService.reativarCurso(id)
        if (error) throw error
        toast.success('Curso reativado!')
        if (onRefresh) onRefresh()
      } catch (err: any) {
        toast.error('Erro ao reativar: ' + err.message)
      } finally {
        btnEl.disabled = false
        btnEl.textContent = 'Reativar'
      }
    })
  })

  // Editar
  let editingCursoId: string | null = null
  container.querySelectorAll('.btn-editar-curso').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id')!
      const tipoAtual = btn.getAttribute('data-tipo')!

      // Verificar se há turmas ativas
      try {
        const { data: turmas, error } = await RealCourseService.getTurmasDoCurso(id)
        if (error) throw error
        if (turmas && turmas.length > 0) {
          toast.error('Não é possível editar: curso possui turmas ativas vinculadas.')
          return
        }
      } catch (err: any) {
        toast.error('Erro ao verificar turmas: ' + err.message)
        return
      }

      editingCursoId = id
      const nomeDisplay = container.querySelector('#modal-editar-curso-nome-display')!
      nomeDisplay.textContent = `Editando: ${btn.closest('tr')?.querySelector('.fw-600')?.textContent || 'Curso'}`
      ;(container.querySelector('#modal-editar-curso-tipo') as HTMLSelectElement).value = tipoAtual
      modalEditar.style.display = 'flex'
    })
  })

  if (btnCancelarEditar) {
    btnCancelarEditar.addEventListener('click', () => {
      modalEditar.style.display = 'none'
      editingCursoId = null
    })
  }

  if (btnConfirmarEditar) {
    btnConfirmarEditar.addEventListener('click', async () => {
      const novoTipo = (container.querySelector('#modal-editar-curso-tipo') as HTMLSelectElement).value
      if (!editingCursoId) return

      modalEditar.style.display = 'none'

      try {
        const { error } = await RealCourseService.updateCurso(editingCursoId, { tipo_curso: novoTipo as 'tecnico' | 'formacao' })
        if (error) throw error
        toast.success('Tipo do curso atualizado!')
        if (onRefresh) onRefresh()
      } catch (err: any) {
        toast.error('Erro ao atualizar: ' + err.message)
      } finally {
        editingCursoId = null
      }
    })
  }

  // Fechar modal de edição ao clicar fora
  if (modalEditar) {
    modalEditar.addEventListener('click', (e) => {
      if (e.target === modalEditar) {
        modalEditar.style.display = 'none'
        editingCursoId = null
      }
    })
  }

  return container
}
