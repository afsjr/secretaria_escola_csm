import { ICONS } from '../lib/icons'
import { escapeHTML } from '../lib/security'

export interface EmptyStateProps {
  icon?: string
  title: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function createEmptyState({ icon = ICONS.inbox, title, message, action }: EmptyStateProps): string {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 2rem;text-align:center;">
      <div style="font-size:3rem;margin-bottom:1rem;opacity:0.6;">${icon}</div>
      <h3 style="color:var(--text-main);margin-bottom:0.5rem;font-size:1.1rem;">${escapeHTML(title)}</h3>
      ${message ? `<p style="color:var(--text-muted);font-size:0.9rem;max-width:360px;margin-bottom:1.5rem;">${escapeHTML(message)}</p>` : ''}
      ${action ? `<button class="btn btn-primary" data-empty-state-action>${escapeHTML(action.label)}</button>` : ''}
    </div>
  `
}

export function bindEmptyStateAction(container: HTMLElement, onClick: () => void): void {
  const btn = container.querySelector<HTMLButtonElement>('[data-empty-state-action]')
  if (btn) {
    btn.addEventListener('click', onClick)
  }
}
