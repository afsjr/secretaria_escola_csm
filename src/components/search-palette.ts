import { AcademicService } from '../lib/academic-service'
import { ProfessorService } from '../lib/professor-service'
import { escapeHTML } from '../lib/security'
import { ICONS } from '../lib/icons'

interface SearchResult {
  id: string
  label: string
  subtitle: string
  iconKey: string
  href: string
  category: string
}

interface SearchCache {
  alunos: { id: string; nome_completo: string; email?: string }[]
  turmas: { id: string; nome: string; periodo: string }[]
  professores: { id: string; nome_completo: string; email?: string }[]
}

const PAGES = [
  { iconKey: 'home', label: 'Início', href: '#/dashboard' },
  { iconKey: 'file', label: 'Documentos', href: '#/dashboard/documentos' },
  { iconKey: 'users', label: 'Usuários', href: '#/dashboard/usuarios' },
  { iconKey: 'book', label: 'Matriz Curricular', href: '#/dashboard/matriz' },
  { iconKey: 'clipboard', label: 'Painel Secretaria', href: '#/dashboard/secretaria' },
  { iconKey: 'graduation', label: 'Gestão de Turmas', href: '#/dashboard/turmas' },
  { iconKey: 'settings', label: 'Configurações', href: '#/dashboard/configuracoes' },
  { iconKey: 'search', label: 'Auditoria', href: '#/dashboard/auditoria' },
  { iconKey: 'dollar', label: 'Financeiro', href: '#/dashboard/financeiro' },
  { iconKey: 'user', label: 'Meus Dados', href: '#/dashboard/perfil' },
  { iconKey: 'book', label: 'Minhas Turmas', href: '#/dashboard/professor/turmas' },
  { iconKey: 'users', label: 'Meus Alunos', href: '#/dashboard/professor/alunos' },
  { iconKey: 'calendar', label: 'Diários de Aulas', href: '#/dashboard/professor/aulas' },
]

let cache: SearchCache | null = null
let overlay: HTMLElement | null = null
let selectedIndex = -1
let currentResults: SearchResult[] = []

async function fetchCache(): Promise<SearchCache> {
  if (cache) return cache

  const [alunosRes, turmasRes, profsRes] = await Promise.all([
    AcademicService.getAlunos(),
    AcademicService.getTurmas(),
    ProfessorService.getProfessores(),
  ])

  cache = {
    alunos: (alunosRes.data || []) as SearchCache['alunos'],
    turmas: (turmasRes.data || []) as SearchCache['turmas'],
    professores: (profsRes.data || []) as SearchCache['professores'],
  }
  return cache
}

function search(query: string): SearchResult[] {
  if (!query.trim()) return []

  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

  const results: SearchResult[] = []

  if (cache) {
    const alunos = cache.alunos.filter(a =>
      a.nome_completo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q) ||
      (a.email && a.email.toLowerCase().includes(q))
    ).slice(0, 5).map(a => ({
      id: a.id,
      label: a.nome_completo,
      subtitle: a.email || 'Aluno',
      iconKey: 'user',
      href: `#/student-details?id=${a.id}`,
      category: 'Alunos',
    }))
    results.push(...alunos)

    const turmas = cache.turmas.filter(t =>
      t.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q) ||
      t.periodo.toLowerCase().includes(q)
    ).slice(0, 5).map(t => ({
      id: t.id,
      label: `${t.nome} - ${t.periodo}`,
      subtitle: '',
      iconKey: 'graduation',
      href: `#/gestao-turmas?id=${t.id}`,
      category: 'Turmas',
    }))
    results.push(...turmas)

    const professores = cache.professores.filter(p =>
      p.nome_completo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q) ||
      (p.email && p.email.toLowerCase().includes(q))
    ).slice(0, 5).map(p => ({
      id: p.id,
      label: p.nome_completo,
      subtitle: p.email || 'Professor',
      iconKey: 'users',
      href: `#/professor-details?id=${p.id}`,
      category: 'Professores',
    }))
    results.push(...professores)
  }

  const pages = PAGES.filter(p =>
    p.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)
  ).slice(0, 5).map(p => ({
    id: p.href,
    label: p.label,
    subtitle: '',
    iconKey: p.iconKey,
    href: p.href,
    category: 'Páginas',
  }))
  results.push(...pages)

  return results
}

function renderResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return '<div style="padding:2rem;text-align:center;color:var(--text-muted);font-size:0.9rem;">Nenhum resultado encontrado.</div>'
  }

  const grouped: Record<string, SearchResult[]> = {}
  for (const r of results) {
    if (!grouped[r.category]) grouped[r.category] = []
    grouped[r.category].push(r)
  }

  let html = ''
  for (const [category, items] of Object.entries(grouped)) {
    html += `<div style="padding:0.5rem 1rem 0.25rem;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-muted);font-weight:600;">${category} (${items.length})</div>`
    items.forEach((item, i) => {
      const idx = results.indexOf(item)
      const isActive = idx === selectedIndex
      html += `<div class="search-result-item ${isActive ? 'active' : ''}" data-index="${idx}" style="display:flex;align-items:center;gap:10px;padding:0.6rem 1rem;cursor:pointer;border-radius:var(--radius-sm);${isActive ? 'background:var(--secondary);' : ''}" onmouseenter="this.dataset.hover='true'">
        <span style="width:20px;height:20px;display:inline-flex;align-items:center;color:var(--text-muted);">${ICONS[item.iconKey] || ''}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.9rem;color:var(--text-main);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHTML(item.label)}</div>
          ${item.subtitle ? `<div style="font-size:0.75rem;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHTML(item.subtitle)}</div>` : ''}
        </div>
      </div>`
    })
  }
  return html
}

function navigateTo(href: string): void {
  close()
  window.location.hash = href
}

function close(): void {
  if (overlay) {
    overlay.remove()
    overlay = null
  }
  selectedIndex = -1
  currentResults = []
}

export async function openSearchPalette(): Promise<void> {
  if (overlay) {
    close()
    return
  }

  const container = document.createElement('div')
  container.id = 'search-palette-overlay'
  container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding-top:10vh;animation:fadeIn 0.15s ease;'

  container.innerHTML = `
    <div id="search-palette" style="background:var(--white);border-radius:var(--radius-lg);width:100%;max-width:560px;max-height:60vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden;animation:slideUp 0.2s ease;">
      <div style="display:flex;align-items:center;padding:0.75rem 1rem;border-bottom:1px solid var(--border);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:10px;flex-shrink:0;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input id="search-palette-input" type="text" placeholder="Buscar alunos, turmas, professores ou páginas..." autocomplete="off" spellcheck="false" style="flex:1;border:none;outline:none;background:transparent;font-size:1rem;color:var(--text-main);">
        <span style="font-size:0.7rem;color:var(--text-muted);background:var(--secondary);padding:2px 6px;border-radius:4px;">ESC</span>
      </div>
      <div id="search-palette-results" style="overflow-y:auto;flex:1;padding:0.5rem 0;">
        <div style="padding:2rem;text-align:center;color:var(--text-muted);font-size:0.9rem;">Comece digitando para buscar...</div>
      </div>
    </div>
  `

  document.body.appendChild(container)
  overlay = container

  const input = container.querySelector<HTMLInputElement>('#search-palette-input')!
  const resultsContainer = container.querySelector<HTMLDivElement>('#search-palette-results')!

  let debounceTimer: number | undefined

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer)
    debounceTimer = window.setTimeout(async () => {
      await fetchCache()
      currentResults = search(input.value)
      selectedIndex = currentResults.length > 0 ? 0 : -1
      resultsContainer.innerHTML = renderResults(currentResults)
    }, 150)
  })

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      close()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      selectedIndex = Math.min(selectedIndex + 1, currentResults.length - 1)
      resultsContainer.innerHTML = renderResults(currentResults)
      const el = resultsContainer.querySelector(`[data-index="${selectedIndex}"]`)
      el?.scrollIntoView({ block: 'nearest' })
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      selectedIndex = Math.max(selectedIndex - 1, 0)
      resultsContainer.innerHTML = renderResults(currentResults)
      const el = resultsContainer.querySelector(`[data-index="${selectedIndex}"]`)
      el?.scrollIntoView({ block: 'nearest' })
      return
    }
    if (e.key === 'Enter' && selectedIndex >= 0 && currentResults[selectedIndex]) {
      navigateTo(currentResults[selectedIndex].href)
      return
    }
  })

  container.addEventListener('click', (e) => {
    if (e.target === container) close()
  })

  resultsContainer.addEventListener('click', (e) => {
    const item = (e.target as HTMLElement).closest('.search-result-item') as HTMLElement | null
    if (item) {
      const idx = parseInt(item.dataset.index || '', 10)
      if (!isNaN(idx) && currentResults[idx]) {
        navigateTo(currentResults[idx].href)
      }
    }
  })

  input.focus()
}
