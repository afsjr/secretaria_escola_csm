/**
 * Atalhos de teclado globais do SGE CSM.
 *
 * Ctrl+N  → Criar nova turma (navega para gestão de turmas)
 * Ctrl+S  → Salvar (dispara submit do form ativo)
 * Escape  → Fechar modal ativo
 */

export function initKeyboardShortcuts(): void {
  if (typeof window === 'undefined') return

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'

    // Ctrl+N / Cmd+N: nova turma
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      if (!isInput) {
        e.preventDefault()
        window.location.hash = '#/dashboard/turmas'
      }
      return
    }

    // Ctrl+S / Cmd+S: salvar (submeter formulário ativo)
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault()
      const form = document.querySelector<HTMLFormElement>('form:focus-within')
      if (form) {
        form.requestSubmit()
      }
      return
    }

    // Escape: fechar modal
    if (e.key === 'Escape') {
      const modal = document.querySelector<HTMLElement>('.modal[style*="display: flex"], .modal[style*="display:flex"]')
      if (modal) {
        const closeBtn = modal.querySelector<HTMLElement>('[data-modal-close="true"]')
        if (closeBtn) {
          closeBtn.click()
        }
        modal.style.display = 'none'
      }
      return
    }
  })
}
