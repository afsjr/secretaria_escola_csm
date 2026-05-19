import { escapeHTML } from '../../lib/security'

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
        <button class="btn btn-primary" id="btn-refresh-professores">🔄 Atualizar</button>
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
                    <button class="btn btn-sm" style="background: var(--bg-app); border: 1px solid var(--border);" onclick="window.dispatchEvent(new CustomEvent('view-professor', {detail: '${escapeHTML(p.id)}'}))" title="Ver Perfil">👁️</button>
                    <button class="btn btn-sm" style="background: var(--accent); color: var(--primary);" onclick="window.dispatchEvent(new CustomEvent('edit-professor', {detail: '${escapeHTML(p.id)}'}))" title="Editar">✏️</button>
                    <button class="btn btn-sm" style="background: var(--primary); color: white;" title="Vincular">🔗</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `

  container.innerHTML = `
    ${renderStats()}
    ${renderTable()}
  `


  setTimeout(() => {
    container.querySelector('#btn-refresh-professores')?.addEventListener('click', () => onRefresh?.())
  }, 0)

  return container
}
