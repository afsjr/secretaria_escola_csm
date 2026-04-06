/**
 * Simple Toast Utility
 * Shows professional floating alerts in the bottom-right corner.
 */
import { escapeHTML } from './security'

export const toast = {
  container: null,

  init() {
    if (this.container) return
    this.container = document.createElement('div')
    this.container.className = 'toast-container'
    document.body.appendChild(this.container)
  },

  show(message, type = 'info', duration = 3000) {
    this.init()

    const el = document.createElement('div')
    el.className = `toast ${type}`
    // Usar textContent para prevenir XSS
    const contentDiv = document.createElement('div')
    contentDiv.className = 'toast-content'
    contentDiv.textContent = message
    el.appendChild(contentDiv)

    this.container.appendChild(el)

    // Auto-remove
    setTimeout(() => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(20px)'
      setTimeout(() => el.remove(), 300)
    }, duration)
  },

  success(msg) { this.show(msg, 'success') },
  error(msg) { this.show(msg, 'error') },
  info(msg) { this.show(msg, 'info') }
}
