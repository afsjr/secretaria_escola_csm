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
    'saude': 'Saúde',
    'formacao': 'Formação Complementar',
    'outro': 'Outro'
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
              <option value="tecnico">Curso Técnico</option>
              <option value="saude">Curso da Saúde</option>
              <option value="formacao">Formação Complementar / Profissionalizante</option>
              <option value="outro">Outro</option>
            </select>
            <div style="margin-top: 0.3rem; font-size: 0.8rem; color: var(--text-muted);">
              Cursos do tipo <strong>Formação Complementar</strong> permitem matrícula simultânea com outros cursos.
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
                    <td>
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
  `

  container.innerHTML = renderContent()

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  const tipoLabelsModal: Record<string, string> = {
    'tecnico': 'Curso Técnico',
    'saude': 'Curso da Saúde',
    'formacao': 'Formação Complementar',
    'outro': 'Outro'
  }

  // Cadastro - passo 1: mostrar confirmação
  const formCadastro = container.querySelector('#form-cadastro-curso') as HTMLFormElement
  const modal = container.querySelector('#modal-confirmar-curso') as HTMLElement
  const btnCancelar = container.querySelector('#btn-cancelar-curso') as HTMLButtonElement
  const btnConfirmar = container.querySelector('#btn-confirmar-curso') as HTMLButtonElement

  if (formCadastro) {
    formCadastro.addEventListener('submit', (e) => {
      e.preventDefault()
      const nome = (container.querySelector('#curso-nome') as HTMLInputElement).value.trim()
      const descricao = (container.querySelector('#curso-descricao') as HTMLTextAreaElement).value.trim()
      const tipo = (container.querySelector('#curso-tipo') as HTMLSelectElement).value

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
      const tipo = (container.querySelector('#curso-tipo') as HTMLSelectElement).value

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

  return container
}
