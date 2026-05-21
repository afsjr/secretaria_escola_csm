import { DocumentsService } from '../lib/documents-service'
import { escapeHTML } from '../lib/security'
import { ICONS } from '../lib/icons'
import type { Solicitacao, UserProfile } from '../types/domain'
import { isAdmin, isSecretaria, isCoordenacao } from '../lib/authz'

interface CacheEntry {
  data: Solicitacao[]
  ts: number
}

let requestCache: CacheEntry | null = null
const CACHE_TTL = 30_000
let dropdownInstance: NotificationDropdown | null = null
let isOpen = false

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `há ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `há ${hours}h`
  const days = Math.floor(hours / 24)
  return `há ${days}d`
}

export function openNotificationDropdown(profile: UserProfile) {
  if (!dropdownInstance) {
    dropdownInstance = new NotificationDropdown(profile)
  }
  if (isOpen) {
    dropdownInstance.close()
  } else {
    dropdownInstance.open()
  }
}

export function closeNotificationDropdown() {
  if (dropdownInstance) dropdownInstance.close()
}

export function updateNotificationBadge(profile: UserProfile) {
  const badge = document.querySelector('.notification-badge-count') as HTMLElement | null
  const dot = document.querySelector('#header-notification-btn .badge-dot') as HTMLElement | null
  if (!badge || !dot) return

  const loadBadge = async () => {
    const count = await fetchCount(profile)
    if (count > 0) {
      badge.textContent = String(count)
      badge.style.display = 'flex'
      dot.style.display = 'none'
    } else {
      badge.style.display = 'none'
      dot.style.display = 'none'
    }
  }
  loadBadge()
}

async function fetchRequests(profile: UserProfile): Promise<Solicitacao[]> {
  if (requestCache && Date.now() - requestCache.ts < CACHE_TTL) {
    return requestCache.data
  }

  const role = profile.perfil || ''
  let data: Solicitacao[] | null = []

  if (isAdmin(role) || isSecretaria(role) || isCoordenacao(role)) {
    const res = await DocumentsService.getAllOpenRequests()
    data = (res.data as any as Solicitacao[]) || []
  } else {
    const res = await DocumentsService.getPendingByUser(profile.id)
    data = res.data || []
  }

  const pendentes = data.filter(d => d.status === 'pendente')
  requestCache = { data: pendentes, ts: Date.now() }
  return pendentes
}

async function fetchCount(profile: UserProfile): Promise<number> {
  const items = await fetchRequests(profile)
  return items.length
}

class NotificationDropdown {
  private profile: UserProfile
  private container: HTMLElement | null = null
  private btn: HTMLElement
  private outsideHandler: ((e: MouseEvent) => void) | null = null
  private keyHandler: ((e: KeyboardEvent) => void) | null = null

  constructor(profile: UserProfile) {
    this.profile = profile
    this.btn = document.querySelector('#header-notification-btn') as HTMLElement
    if (!this.btn) throw new Error('#header-notification-btn not found')
  }

  async open() {
    if (isOpen) return
    isOpen = true

    const existing = document.querySelector('.notification-dropdown') as HTMLElement | null
    if (existing) existing.remove()

    this.btn.setAttribute('aria-expanded', 'true')

    const container = document.createElement('div')
    container.className = 'notification-dropdown'
    container.setAttribute('role', 'menu')
    container.setAttribute('aria-label', 'Notificações pendentes')
    this.container = container

    const items = await fetchRequests(this.profile)

    container.innerHTML = this.render(items)

    this.btn.parentElement?.appendChild(container)

    this.outsideHandler = (e: MouseEvent) => {
      const target = e.target as Node
      if (!container.contains(target) && target !== this.btn && !this.btn.contains(target)) {
        this.close()
      }
    }
    this.keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.close()
    }

    document.addEventListener('click', this.outsideHandler)
    document.addEventListener('keydown', this.keyHandler)

    this.bindActions(container, items)
  }

  close() {
    if (!isOpen) return
    isOpen = false
    this.btn.setAttribute('aria-expanded', 'false')
    if (this.container) {
      this.container.remove()
      this.container = null
    }
    if (this.outsideHandler) {
      document.removeEventListener('click', this.outsideHandler)
      this.outsideHandler = null
    }
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler)
      this.keyHandler = null
    }

    const badge = document.querySelector('.notification-badge-count') as HTMLElement | null
    requestCache = null
    if (badge) updateNotificationBadge(this.profile)
  }

  private render(items: Solicitacao[]): string {
    const role = this.profile.perfil || ''
    const roleLabel = isAdmin(role) || isSecretaria(role) || isCoordenacao(role) ? 'Notificações' : 'Minhas Notificações'

    if (items.length === 0) {
      return `
        <div class="notification-header">${roleLabel}</div>
        <div class="notification-empty">
          ${ICONS.checkCircle}
          <p style="margin-top: 8px;">Nenhuma pendência</p>
        </div>
      `
    }

    const displayItems = items.slice(0, 10)
    const remaining = items.length - 10

    const canAct = isAdmin(role) || isSecretaria(role)

    const listHTML = displayItems.map((item, idx) => {
      const name = (item as any).perfis?.nome_completo || 'Aluno'
      const initial = name.charAt(0).toUpperCase()
      return `
        <div class="notification-item" role="menuitem" data-id="${item.id}" data-index="${idx}">
          <div class="notification-item-icon" aria-hidden="true">${escapeHTML(initial)}</div>
          <div class="notification-item-body">
            <div class="notification-item-title">${escapeHTML(item.tipo)}</div>
            <div class="notification-item-desc">${escapeHTML(name)}</div>
          </div>
          <div class="notification-item-time">${timeAgo(item.criado_em || '')}</div>
          ${canAct ? `<button class="notification-item-action" data-action="concluir" data-id="${item.id}" title="Marcar como concluído">Concluir</button>` : ''}
        </div>
      `
    }).join('')

    const footerHTML = remaining > 0
      ? `<div class="notification-footer"><a href="#/dashboard/secretaria?solicitacoes" data-action="ver-todas">Ver todas (${remaining} mais)</a></div>`
      : canAct
        ? `<div class="notification-footer"><a href="#/dashboard/secretaria?solicitacoes" data-action="ver-todas">Ver todas</a></div>`
        : ''

    return `
      <div class="notification-header">${roleLabel}</div>
      ${listHTML}
      ${footerHTML}
    `
  }

  private bindActions(container: HTMLElement, items: Solicitacao[]) {
    container.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement

      const concluirBtn = target.closest('[data-action="concluir"]') as HTMLElement | null
      if (concluirBtn) {
        e.stopPropagation()
        const id = concluirBtn.getAttribute('data-id')
        if (!id) return
        concluirBtn.disabled = true
        concluirBtn.textContent = '...'
        await DocumentsService.updateStatus(id, 'concluido')
        this.close()
        return
      }

      const verTodas = target.closest('[data-action="ver-todas"]') as HTMLElement | null
      if (verTodas) {
        e.preventDefault()
        this.close()
        window.location.hash = '#/dashboard/secretaria?solicitacoes'
        return
      }
    })
  }
}
