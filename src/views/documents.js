import { DocumentsService } from '../lib/documents-service'
import { toast } from '../lib/toast'

export async function DocumentsView(profile) {
  const container = document.createElement('div')
  container.className = 'documents-view animate-in'

  // Fetch current requests
  const { data: requests, error } = await DocumentsService.getMyRequests(profile.id)

  const renderRequests = () => {
    if (requests?.length === 0) return '<p>Você ainda não possui solicitações de documentos.</p>'
    return `
      <div style="background: white; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); overflow: hidden; margin-top: 2rem;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead style="background: var(--secondary); font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted);">
            <tr>
              <th style="padding: 1rem;">Tipo de Documento</th>
              <th style="padding: 1rem;">Data</th>
              <th style="padding: 1rem;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${requests?.map(r => `
              <tr style="border-top: 1px solid var(--secondary);">
                <td style="padding: 1rem; font-weight: 500;">${r.tipo}</td>
                <td style="padding: 1rem; font-size: 0.9rem;">${new Date(r.criado_em).toLocaleDateString('pt-BR')}</td>
                <td style="padding: 1rem;">
                  <span class="badge" style="background: ${r.status === 'pendente' ? '#FEF3C7' : '#D1FAE5'}; color: ${r.status === 'pendente' ? '#92400E' : '#065F46'};">
                    ${r.status}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
  }

  container.innerHTML = `
    <header style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="font-size: 2rem; color: var(--text-main);">Documentos</h1>
        <p>Solicite declarações e históricos acadêmicos.</p>
      </div>
      <button id="open-request-btn" class="btn btn-primary">+ Nova Solicitação</button>
    </header>

    <div id="requests-list">
      ${renderRequests()}
    </div>

    <!-- Simple Modal Simulation (Overlay) -->
    <div id="modal-request" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 100; align-items: center; justify-content: center;">
      <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); width: 100%; max-width: 400px; box-shadow: var(--shadow-lg);">
        <h2 style="margin-bottom: 1.5rem;">Solicitar Documento</h2>
        <div class="form-group">
          <label class="label">Escolha o tipo:</label>
          <select id="doc-type" class="input">
            <option value="Declaração de Matrícula">Declaração de Matrícula</option>
            <option value="Histórico Acadêmico">Histórico Acadêmico</option>
            <option value="Atestado de Frequência">Atestado de Frequência</option>
          </select>
        </div>
        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
          <button id="cancel-btn" class="btn" style="flex: 1; background: var(--secondary);">Cancelar</button>
          <button id="confirm-btn" class="btn btn-primary" style="flex: 1;">Solicitar</button>
        </div>
      </div>
    </div>
  `

  // Logic
  const modal = container.querySelector('#modal-request')
  const openBtn = container.querySelector('#open-request-btn')
  const cancelBtn = container.querySelector('#cancel-btn')
  const confirmBtn = container.querySelector('#confirm-btn')

  openBtn.onclick = () => modal.style.display = 'flex'
  cancelBtn.onclick = () => modal.style.display = 'none'

  confirmBtn.onclick = async () => {
    const type = container.querySelector('#doc-type').value
    confirmBtn.disabled = true
    confirmBtn.textContent = 'Enviando...'

    const { error } = await DocumentsService.createRequest(profile.id, type)

    if (error) {
      toast.error('Erro ao enviar solicitação: ' + error.message)
    } else {
      toast.success('Solicitação enviada com sucesso!')
      modal.style.display = 'none'
      // Reload view (SPA style hack)
      window.location.hash = '#/dashboard' // Quick reset
      setTimeout(() => window.location.hash = '#/dashboard/documentos', 10)
    }
  }

  return container
}
