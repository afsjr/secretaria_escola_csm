import { DocumentsService } from '../lib/documents-service'
import { toast } from '../lib/toast'

export async function SecretariaView() {
  const container = document.createElement('div')
  container.className = 'secretaria-view animate-in'

  const { data: requests, error } = await DocumentsService.getAllOpenRequests()

  const renderRequests = () => {
    if (requests?.length === 0) return '<p>Não há solicitações pendentes no momento.</p>'
    return `
      <div style="background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden; margin-top: 2rem;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead style="background: var(--secondary); font-size: 0.85rem; text-transform: uppercase;">
            <tr>
              <th style="padding: 1.25rem;">Aluno</th>
              <th style="padding: 1.25rem;">Documento</th>
              <th style="padding: 1.25rem;">Status</th>
              <th style="padding: 1.25rem;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${requests?.map(r => `
              <tr style="border-top: 1px solid var(--secondary);">
                <td style="padding: 1.25rem;">
                  <div style="font-weight: 600;">${r.perfis?.nome_completo || 'N/A'}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${r.perfis?.email || ''}</div>
                </td>
                <td style="padding: 1.25rem;">${r.tipo}</td>
                <td style="padding: 1.25rem;">
                  <span class="badge" style="background: ${r.status === 'pendente' ? '#FEF3C7' : '#D1FAE5'}; color: ${r.status === 'pendente' ? '#92400E' : '#065F46'};">
                    ${r.status}
                  </span>
                </td>
                <td style="padding: 1.25rem;">
                  ${r.status === 'pendente' ? `
                    <button class="btn btn-primary approve-btn" data-id="${r.id}" style="font-size: 0.75rem; padding: 0.4rem 0.8rem;">Concluir</button>
                  ` : '---'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
  }

  container.innerHTML = `
    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; color: var(--text-main);">Painel da Secretaria</h1>
      <p>Gerencie as solicitações de todos os alunos do sistema.</p>
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
      } else {
        toast.success('Documento concluído com sucesso!')
        // Reload
        window.location.hash = '#/dashboard'
        setTimeout(() => window.location.hash = '#/dashboard/secretaria', 10)
      }
    }
  })

  return container
}
