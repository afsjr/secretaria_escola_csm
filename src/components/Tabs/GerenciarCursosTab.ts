import { CourseService } from '../../lib/professor-service'
import { toast } from '../../lib/toast'
import { escapeHTML } from '../../lib/security'

// Nota: O projeto parece usar CourseService de lib/professor-service ou lib/course-service.
// Vou verificar qual é o correto. No secretaria.ts original era import { CourseService } from '../lib/course-service'
import { CourseService as RealCourseService } from '../../lib/course-service'

interface GerenciarCursosProps {
  cursos: any[]
  onRefresh?: () => void
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
  `

  container.innerHTML = renderContent()

  // =====================================================
  // EVENT HANDLERS
  // =====================================================

  // Cadastro
  const formCadastro = container.querySelector('#form-cadastro-curso') as HTMLFormElement
  if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
      e.preventDefault()
      const nome = (container.querySelector('#curso-nome') as HTMLInputElement).value.trim()
      const descricao = (container.querySelector('#curso-descricao') as HTMLTextAreaElement).value.trim()

      const btnSubmit = container.querySelector('#btn-cadastrar-curso') as HTMLButtonElement
      btnSubmit.disabled = true
      btnSubmit.textContent = 'Cadastrando...'

      try {
        const { error } = await RealCourseService.createCurso({ nome, descricao })
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
