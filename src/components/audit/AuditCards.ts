import { ICONS } from '../../lib/icons'

interface AuditCardsProps {
  total: number;
  porSeveridade: { alta: number; media: number; baixa: number };
}

export function AuditCards({ total, porSeveridade }: AuditCardsProps) {
  const cards = [
    { label: 'Total', value: total, color: 'var(--primary)', icon: ICONS.chart },
    { label: 'Alta', value: porSeveridade.alta, color: '#DC2626', icon: '🔴' },
    { label: 'Média', value: porSeveridade.media, color: '#D97706', icon: '🟡' },
    { label: 'Baixa', value: porSeveridade.baixa, color: '#059669', icon: '🟢' },
  ]

  const container = document.createElement('div')
  container.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1rem;margin-bottom:1.5rem'

  cards.forEach((card) => {
    const cardEl = document.createElement('div')
    cardEl.style.cssText = `background:white;padding:1rem;border-radius:12px;box-shadow:var(--shadow-sm);border-top:4px solid ${card.color};text-align:center`

    const iconEl = document.createElement('div')
    iconEl.style.cssText = 'font-size:1.5rem;margin-bottom:0.25rem'
    iconEl.innerHTML = card.icon
    cardEl.appendChild(iconEl)

    const valueEl = document.createElement('div')
    valueEl.style.cssText = `font-size:2rem;font-weight:800;color:${card.color}`
    valueEl.textContent = String(card.value)
    cardEl.appendChild(valueEl)

    const labelEl = document.createElement('div')
    labelEl.style.cssText = 'font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;font-weight:600'
    labelEl.textContent = card.label
    cardEl.appendChild(labelEl)

    container.appendChild(cardEl)
  })

  return container
}
