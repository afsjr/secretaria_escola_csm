/**
 * Modal Genérico
 * 
 * Componente de modal reutilizável para confirmações e formulários simples.
 */

import { escapeHTML } from '../lib/security'

interface BotaoModal {
  texto: string
  tipo?: 'primary' | 'secondary' | 'danger'
  onClick?: () => void
  closeModal?: boolean
}

export interface ModalProps {
  id: string
  titulo: string
  conteudo: string
  botoes?: BotaoModal[]
}

export function createModal({ id, titulo, conteudo, botoes }: ModalProps): string {
  const botoesHTML = botoes?.map((b) => `
    <button 
      class="btn ${b.tipo === 'danger' ? 'btn-danger' : b.tipo === 'primary' ? 'btn-primary' : 'btn-secondary'}"
      data-modal-btn="${id}"
      ${b.closeModal === false ? '' : 'data-modal-close="true"'}
    >
      ${escapeHTML(b.texto)}
    </button>
  `).join('') || `
    <button class="btn btn-secondary" data-modal-close="true">Fechar</button>
  `

  return `
    <div id="${id}" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: center; justify-content: center;">
      <div class="modal-content" style="background: white; border-radius: 8px; padding: 2rem; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h2 style="margin: 0; color: var(--primary);">${escapeHTML(titulo)}</h2>
          <button class="btn-close" data-modal-close="true" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
        </div>
        <div style="margin-bottom: 1.5rem;">
          ${conteudo}
        </div>
        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
          ${botoesHTML}
        </div>
      </div>
    </div>
  `
}

export function openModal(modalId: string): void {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = 'flex'
  }
}

export function closeModal(modalId: string): void {
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = 'none'
  }
}

export function bindModalEventos(
  container: HTMLElement,
  modalId: string,
  onBotaoClick?: (botao: HTMLElement) => void
): void {
  const modal = container.querySelector(`#${modalId}`)
  if (!modal) return

  // Fechar ao clicar fora
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modalId)
    }
  })

  // Botões de fechar
  modal.querySelectorAll('[data-modal-close="true"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeModal(modalId)
    })
  })

  // Botões de ação
  if (onBotaoClick) {
    modal.querySelectorAll('[data-modal-btn]').forEach((btn) => {
      btn.addEventListener('click', () => {
        onBotaoClick(btn as HTMLElement)
      })
    })
  }
}

// Prompt simples
export function showConfirm(titulo: string, mensagem: string): Promise<boolean> {
  return new Promise((resolve) => {
    const modalId = 'modal-confirm-' + Date.now()
    const modalHTML = createModal({
      id: modalId,
      titulo,
      conteudo: `<p>${escapeHTML(mensagem)}</p>`,
      botoes: [
        { texto: 'Cancelar', tipo: 'secondary', closeModal: true },
        { texto: 'Confirmar', tipo: 'primary', closeModal: true }
      ]
    })

    document.body.insertAdjacentHTML('beforeend', modalHTML)
    openModal(modalId)

    const modal = document.getElementById(modalId)
    if (modal) {
      modal.querySelector('[data-modal-btn]')?.addEventListener('click', () => {
        resolve(true)
        closeModal(modalId)
        modal.remove()
      })
      modal.querySelector('[data-modal-close="true"]')?.addEventListener('click', () => {
        resolve(false)
        closeModal(modalId)
        modal.remove()
      })
    }
  })
}