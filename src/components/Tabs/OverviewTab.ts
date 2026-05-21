import { ICONS } from '../../lib/icons'
import { escapeHTML } from '../../lib/security'

interface OverviewProps {
  stats: {
    alunos: number
    professores: number
    turmas: number
    solicitacoesPendentes: number
  }
  cursos: any[]
}

export function OverviewTab({ stats, cursos }: OverviewProps): HTMLDivElement {
  const container = document.createElement('div')
  container.className = 'animate-in'

  // Usamos template string normal para a estrutura e escapeHTML apenas nos dados
  const renderContent = () => `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
      <!-- Card Alunos -->
      <div class="stat-card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div class="stat-label">Alunos Ativos</div>
            <div class="stat-value">${escapeHTML(stats.alunos)}</div>
          </div>
          <span style="font-size: 2rem;">${ICONS.users}</span>
        </div>
      </div>

      <!-- Card Professores -->
      <div class="stat-card" style="border-bottom: 4px solid var(--success);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div class="stat-label">Docentes</div>
            <div class="stat-value" style="color: var(--success);">${escapeHTML(stats.professores)}</div>
          </div>
          <span style="font-size: 2rem;">${ICONS.graduation}</span>
        </div>
      </div>

      <!-- Card Solicitações -->
      <div class="stat-card" style="border-bottom: 4px solid var(--danger);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div class="stat-label">Solicitações</div>
            <div class="stat-value" style="color: var(--danger);">${escapeHTML(stats.solicitacoesPendentes)}</div>
          </div>
          <span style="font-size: 2rem;">${ICONS.mail}</span>
        </div>
      </div>

      <!-- Card Turmas -->
      <div class="stat-card" style="border-bottom: 4px solid var(--info);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div class="stat-label">Turmas Ativas</div>
            <div class="stat-value" style="color: var(--info);">${escapeHTML(stats.turmas)}</div>
          </div>
          <span style="font-size: 2rem;">${ICONS.school}</span>
        </div>
      </div>
    </div>

    <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
      <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 10px;">
        ${ICONS.chart} Status Operacional dos Cursos
      </h3>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Curso Técnico</th>
              <th>Status</th>
              <th>Coordenador</th>
              <th>Próxima Turma</th>
            </tr>
          </thead>
          <tbody>
            ${cursos.map(c => `
              <tr>
                <td style="font-weight: 600;">${escapeHTML(c.nome)}</td>
                <td>
                  <span class="badge ${c.ativo ? 'badge-success' : 'badge-warning'}">
                    ${c.ativo ? 'Ativo' : 'Suspenso'}
                  </span>
                </td>
                <td>Prof. Me. Rodrigo Lima</td>
                <td>Julho/2026</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `

  container.innerHTML = renderContent()
  return container
}
