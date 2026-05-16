import { escapeHTML } from '../../lib/security'

interface OverviewProps {
  stats: {
    alunos: number
    professores: number
    turmas: number
    cursos: number
    solicitacoesPendentes: number
  }
  cursos: any[]
}

export function OverviewTab({ stats, cursos }: OverviewProps): HTMLDivElement {
  const container = document.createElement('div')
  
  const renderContent = () => `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
      <!-- Card Alunos -->
      <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border-bottom: 4px solid var(--primary);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Alunos Ativos</div>
            <div style="font-size: 2.5rem; font-weight: 800; color: var(--text-main); margin-top: 0.5rem;">${stats.alunos}</div>
          </div>
          <span style="font-size: 2rem;">👥</span>
        </div>
      </div>

      <!-- Card Professores -->
      <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border-bottom: 4px solid var(--success);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Docentes</div>
            <div style="font-size: 2.5rem; font-weight: 800; color: var(--success); margin-top: 0.5rem;">${stats.professores}</div>
          </div>
          <span style="font-size: 2rem;">👨‍🏫</span>
        </div>
      </div>

      <!-- Card Solicitações -->
      <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border-bottom: 4px solid var(--danger);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Solicitações Abertas</div>
            <div style="font-size: 2.5rem; font-weight: 800; color: var(--danger); margin-top: 0.5rem;">${stats.solicitacoesPendentes}</div>
          </div>
          <span style="font-size: 2rem;">📩</span>
        </div>
      </div>

      <!-- Card Turmas -->
      <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border-bottom: 4px solid var(--info);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Turmas Ativas</div>
            <div style="font-size: 2.5rem; font-weight: 800; color: var(--info); margin-top: 0.5rem;">${stats.turmas}</div>
          </div>
          <span style="font-size: 2rem;">🏫</span>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
      <!-- Status dos Cursos -->
      <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        <h3 style="margin: 0 0 1.5rem 0; color: var(--text-main);">Visão dos Cursos Técnicos</h3>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Status</th>
                <th>Ação Recomendada</th>
              </tr>
            </thead>
            <tbody>
              ${cursos.map(c => `
                <tr>
                  <td>
                    <div class="fw-600 text-main">${escapeHTML(c.nome)}</div>
                  </td>
                  <td>
                    <span class="badge ${c.ativo ? 'badge-success' : 'badge-warning'}">
                      ${c.ativo ? 'Em Operação' : 'Suspenso'}
                    </span>
                  </td>
                  <td>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">
                      ${c.ativo ? 'Monitorar Documentação' : 'Revisar Matrículas'}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Actions -->
      <div style="background: var(--secondary); padding: 1.5rem; border-radius: var(--radius-lg); border: 1px dashed var(--border);">
        <h4 style="margin: 0 0 1rem 0; color: var(--text-main);">Ações Rápidas</h4>
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <button class="btn" style="background: white; border: 1px solid var(--border); text-align: left; padding: 0.75rem; border-radius: 8px; font-size: 0.9rem;" onclick="document.querySelector('[data-tab=\\'cadastro\\']').click()">➕ Novo Aluno</button>
          <button class="btn" style="background: white; border: 1px solid var(--border); text-align: left; padding: 0.75rem; border-radius: 8px; font-size: 0.9rem;" onclick="document.querySelector('[data-tab=\\'cadastro-professor\\']').click()">➕ Novo Professor</button>
          <button class="btn" style="background: white; border: 1px solid var(--border); text-align: left; padding: 0.75rem; border-radius: 8px; font-size: 0.9rem;" onclick="document.querySelector('[data-tab=\\'notas\\']').click()">📊 Lançar Notas</button>
        </div>
        
        <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border);">
          <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4;">
            <strong>Dica do Sistema:</strong><br>
            Você tem ${stats.solicitacoesPendentes} solicitações aguardando revisão na aba "Solicitações".
          </p>
        </div>
      </div>
    </div>
  `

  container.innerHTML = renderContent()
  return container
}
