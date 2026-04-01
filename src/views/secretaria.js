import { DocumentsService } from '../lib/documents-service'
import { toast } from '../lib/toast'

// Helper para prevenir XSS
const escapeHTML = (str) => {
  if (!str) return ''
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag]))
}

export async function SecretariaView() {
  const container = document.createElement('div')
  container.className = 'secretaria-view animate-in'

  const { data: requests, error } = await DocumentsService.getAllOpenRequests()

  const renderRequests = () => {
    if (error) return `<p class="error-text">Erro ao carregar solicitações.</p>`
    if (!requests || requests.length === 0) return '<p>Não há solicitações pendentes no momento.</p>'
    
    return `
      <div class="table-responsive bg-white rounded-lg shadow-sm mt-4">
        <table class="data-table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Documento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${requests.map(r => `
              <tr id="req-row-${r.id}">
                <td>
                  <div class="fw-600 text-main">${escapeHTML(r.perfis?.nome_completo || 'N/A')}</div>
                  <div class="text-sm text-muted">${escapeHTML(r.perfis?.email || '')}</div>
                </td>
                <td>${escapeHTML(r.tipo)}</td>
                <td class="status-cell">
                  <span class="badge ${r.status === 'pendente' ? 'badge-warning' : 'badge-success'}">
                    ${escapeHTML(r.status)}
                  </span>
                </td>
                <td class="action-cell">
                  ${r.status === 'pendente' ? `
                    <button class="btn btn-primary btn-sm approve-btn" data-id="${r.id}">Concluir</button>
                  ` : '<span class="text-muted">---</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
  }

  container.innerHTML = `
    <header class="view-header">
      <h1 class="title">Painel da Secretaria</h1>
      <p class="subtitle">Gerencie as solicitações de todos os alunos do sistema.</p>
    </header>

    <div id="requests-list">
      ${renderRequests()}
    </div>
  `

  const approveBtns = container.querySelectorAll('.approve-btn')
  approveBtns.forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id')
      btn.disabled = true
      btn.textContent = 'Processando...'

      const { error } = await DocumentsService.updateStatus(id, 'concluído')

      if (error) {
        toast.error('Erro ao atualizar status: ' + error.message)
        btn.disabled = false
        btn.textContent = 'Concluir'
      } else {
        toast.success('Documento concluído com sucesso!')
        
        // Atualização Otimista (Optimistic UI) - Sem reload de página
        const row = container.querySelector(`#req-row-${id}`)
        if (row) {
          const statusCell = row.querySelector('.status-cell')
          const actionCell = row.querySelector('.action-cell')
          
          if (statusCell) {
            statusCell.innerHTML = `<span class="badge badge-success">concluído</span>`
          }
          if (actionCell) {
            actionCell.innerHTML = '<span class="text-muted">---</span>'
          }
        }
      }
    }
  })

  return container
}
