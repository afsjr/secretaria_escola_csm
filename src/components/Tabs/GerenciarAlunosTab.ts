import { escapeHTML } from '../../lib/security'

interface Aluno {
  id: string
  nome_completo: string
  email: string
  cpf?: string
  telefone?: string
  bloqueio_financeiro: boolean
}

interface Turma {
  id: string
  nome: string
  periodo: string
}

interface GerenciarAlunosProps {
  alunos: Aluno[]
  turmas: Turma[]
  onRefresh?: () => void
  onEdit?: (aluno: Aluno) => void
  onView?: (aluno: Aluno) => void
  onMatricular?: (aluno: Aluno) => void
}

export function GerenciarAlunosTab({ 
  alunos, 
  turmas, 
  onRefresh, 
  onEdit, 
  onView, 
  onMatricular 
}: GerenciarAlunosProps): HTMLDivElement {
  const container = document.createElement('div')
  container.className = 'animate-in'

  const totalAlunos = alunos.length
  const bloqueadosFinanc = alunos.filter(a => a.bloqueio_financeiro).length
  const regularFinanc = totalAlunos - bloqueadosFinanc

  const renderStats = () => `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
      <div class="stat-card">
        <div class="stat-label">Total de Alunos</div>
        <div class="stat-value">${escapeHTML(String(totalAlunos))}</div>
      </div>
      <div class="stat-card" style="border-bottom: 4px solid var(--success);">
        <div class="stat-label">Financeiro OK</div>
        <div class="stat-value" style="color: var(--success);">${escapeHTML(String(regularFinanc))}</div>
      </div>
      <div class="stat-card" style="border-bottom: 4px solid var(--danger);">
        <div class="stat-label">Bloqueios</div>
        <div class="stat-value" style="color: var(--danger);">${escapeHTML(String(bloqueadosFinanc))}</div>
      </div>
    </div>
  `

  const renderTable = () => `
    <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 style="margin: 0;">Lista de Alunos</h3>
        <div style="display: flex; gap: 10px;">
          <input type="text" id="busca-aluno" class="input" placeholder="Buscar por nome ou CPF..." style="width: 300px;">
          <button class="btn btn-primary" id="btn-refresh-alunos">🔄 Atualizar</button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Contato</th>
              <th>Status 360°</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${alunos.map(aluno => `
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div class="avatar-circle">${escapeHTML(aluno.nome_completo.charAt(0).toUpperCase())}</div>
                    <div>
                      <div style="font-weight: 600;">${escapeHTML(aluno.nome_completo)}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">CPF: ${escapeHTML(aluno.cpf || '---')}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style="font-size: 0.85rem;">${escapeHTML(aluno.email)}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHTML(aluno.telefone || '---')}</div>
                </td>
                <td>
                  <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                    <!-- Financeiro -->
                    ${aluno.bloqueio_financeiro 
                      ? `<span class="badge" style="background: #fee2e2; color: #dc2626; border: 1px solid #fecaca;">🔴 Bloqueado</span>`
                      : `<span class="badge" style="background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0;">🟢 Regular</span>`}
                    
                    <!-- Estágio -->
                    <span class="badge" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;">🔵 Estágio: OK</span>
                    
                    <!-- Docs -->
                    <span class="badge" style="background: #fffbeb; color: #d97706; border: 1px solid #fef3c7;">🟡 Docs Pend.</span>
                  </div>
                </td>
                <td style="text-align: right;">
                  <div style="display: flex; gap: 8px; justify-content: flex-end;">
                    <button class="btn btn-sm" style="background: var(--bg-app); border: 1px solid var(--border);" onclick="window.dispatchEvent(new CustomEvent('view-aluno', {detail: '${escapeHTML(aluno.id)}'}))" title="Ver Ficha">👁️</button>
                    <button class="btn btn-sm" style="background: var(--accent); color: var(--primary);" onclick="window.dispatchEvent(new CustomEvent('edit-aluno', {detail: '${escapeHTML(aluno.id)}'}))" title="Editar">✏️</button>
                    <button class="btn btn-sm" style="background: var(--primary); color: white;" onclick="window.dispatchEvent(new CustomEvent('matricular-aluno', {detail: '${escapeHTML(aluno.id)}'}))" title="Matricular">🎓</button>
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

  // Event Listeners
  setTimeout(() => {
    container.querySelector('#btn-refresh-alunos')?.addEventListener('click', () => onRefresh?.())
    
    // Busca (Simples para demonstração)
    container.querySelector('#busca-aluno')?.addEventListener('input', (e) => {
      const termo = (e.target as HTMLInputElement).value.toLowerCase()
      const rows = container.querySelectorAll('tbody tr')
      rows.forEach(row => {
        const text = row.textContent?.toLowerCase() || ''
        ;(row as HTMLElement).style.display = text.includes(termo) ? '' : 'none'
      })
    })
  }, 0)

  return container
}
