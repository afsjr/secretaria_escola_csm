import type { UserProfile, Session } from '../types'
import { DocumentsService } from '../lib/documents-service'
import { AcademicService } from '../lib/academic-service'
import { ProfessorService } from '../lib/professor-service'
import { supabase } from '../lib/supabase'
import { escapeHTML } from '../lib/security'

const ICONS: Record<string, string> = {
  users: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  graduation: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>',
  file: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  user: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  book: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
  calendar: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  clipboard: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
  clock: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  dollar: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  warning: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
}

interface StatCard {
  iconKey: string
  label: string
  value: string | number
  color: string
}

function renderStatCards(cards: StatCard[]): string {
  return cards.map(c => `
    <div class="stat-card" style="border-left: 4px solid ${c.color};">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
        <span style="color:${c.color};">${ICONS[c.iconKey] || ''}</span>
      </div>
      <div class="stat-label">${c.label}</div>
      <div class="stat-value">${c.value}</div>
    </div>
  `).join('')
}

interface BarChartItem {
  label: string
  value: number
  color?: string
}

function renderBarChart(items: BarChartItem[], title: string): string {
  if (!items.length) return ''
  const maxVal = Math.max(...items.map(i => i.value), 1)
  const bars = items.map(i => {
    const pct = (i.value / maxVal) * 100
    return `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <span style="font-size:0.75rem;color:var(--text-muted);min-width:80px;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${i.label}</span>
        <div style="flex:1;height:22px;background:var(--secondary);border-radius:4px;overflow:hidden;position:relative;">
          <div style="width:${pct}%;height:100%;background:${i.color || 'var(--primary)'};border-radius:4px;transition:width 0.6s ease;min-width:4px;"></div>
        </div>
        <span style="font-size:0.75rem;font-weight:600;color:var(--text-main);min-width:30px;">${i.value}</span>
      </div>
    `
  }).join('')

  return `
    <div style="background:var(--white);padding:1.5rem;border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);">
      <h3 style="margin-bottom:1rem;font-size:0.95rem;color:var(--text-main);">${title}</h3>
      ${bars}
    </div>
  `
}

export async function DashboardHomeView(profile: UserProfile, _session: Session): Promise<HTMLElement> {
  const container = document.createElement('div')
  container.className = 'animate-in'
  container.id = 'dashboard-home'

  const role = profile.perfil
  const firstName = escapeHTML(profile.nome_completo.split(' ')[0])

  let cards: StatCard[] = []
  let extraHTML = ''
  let chartsHTML = ''

  if (role === 'master_admin' || role === 'admin') {
    const [{ count: totalMembros }, { data: turmas }, { data: docs }] = await Promise.all([
      supabase.from('perfis').select('id', { count: 'exact', head: true }),
      AcademicService.getTurmas(),
      DocumentsService.getAllOpenRequests(),
    ])
    const turmasAtivas = (turmas || []).filter(t => t.status_ingresso === 'aberta').length
    const docsPendentes = (docs || []).filter(d => d.status === 'pendente').length

    cards = [
      { iconKey: 'users', label: 'Membros no SGE', value: totalMembros ?? 0, color: 'var(--primary)' },
      { iconKey: 'graduation', label: 'Turmas Ativas', value: turmasAtivas, color: 'var(--accent)' },
      { iconKey: 'file', label: 'Documentos Pendentes', value: docsPendentes, color: docsPendentes > 0 ? 'var(--danger)' : 'var(--success)' },
      { iconKey: 'user', label: 'Total de Alunos', value: '—', color: 'var(--text-muted)' },
    ]

    const docsRecentes = (docs || []).slice(0, 5)
    extraHTML = docsRecentes.length > 0 ? `
      <div style="margin-top:2rem;background:var(--white);padding:1.5rem;border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);">
        <h3 style="margin-bottom:1rem;font-size:1rem;color:var(--text-main);">${ICONS.clipboard} Solicitações Recentes</h3>
        ${docsRecentes.map(d => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:0.6rem 0;border-bottom:1px solid var(--border);">
            <div>
              <div style="font-size:0.85rem;font-weight:500;color:var(--text-main);">${escapeHTML(d.tipo)}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">${d.perfis?.nome_completo ? escapeHTML(d.perfis.nome_completo) : ''}</div>
            </div>
            <span class="badge ${d.status === 'pendente' ? 'badge-warning' : 'badge-success'}">${escapeHTML(d.status)}</span>
          </div>
        `).join('')}
      </div>
    ` : ''

    const periodoCount: Record<string, number> = {}
    turmas?.forEach(t => { periodoCount[t.periodo] = (periodoCount[t.periodo] || 0) + 1 })
    const chartData = Object.entries(periodoCount)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 8)
      .map(([label, value]) => ({ label, value }))
    if (chartData.length > 0) {
      chartsHTML = renderBarChart(chartData, 'Turmas por Período')
    }
  }

  else if (role === 'secretaria' || role === 'coordenacao') {
    const [{ data: alunos }, { data: turmas }, { data: docs }] = await Promise.all([
      AcademicService.getAlunos(),
      AcademicService.getTurmas(),
      DocumentsService.getAllOpenRequests(),
    ])
    const docsPendentes = (docs || []).filter(d => d.status === 'pendente').length

    if (role === 'coordenacao') {
      const { data: profs } = await ProfessorService.getProfessores()
      cards = [
        { iconKey: 'user', label: 'Total de Alunos', value: alunos?.length ?? 0, color: 'var(--primary)' },
        { iconKey: 'graduation', label: 'Turmas Cadastradas', value: turmas?.length ?? 0, color: 'var(--accent)' },
        { iconKey: 'users', label: 'Professores', value: profs?.length ?? 0, color: 'var(--success)' },
        { iconKey: 'file', label: 'Documentos Pendentes', value: docsPendentes, color: docsPendentes > 0 ? 'var(--danger)' : 'var(--success)' },
      ]
    } else {
      cards = [
        { iconKey: 'user', label: 'Total de Alunos', value: alunos?.length ?? 0, color: 'var(--primary)' },
        { iconKey: 'graduation', label: 'Turmas Ativas', value: (turmas || []).filter(t => t.status_ingresso === 'aberta').length, color: 'var(--accent)' },
        { iconKey: 'file', label: 'Documentos Pendentes', value: docsPendentes, color: docsPendentes > 0 ? 'var(--danger)' : 'var(--success)' },
        { iconKey: 'clipboard', label: 'Total de Turmas', value: turmas?.length ?? 0, color: 'var(--text-muted)' },
      ]
    }

    const docsRecentes = (docs || []).slice(0, 5)
    extraHTML = `
      <div style="margin-top:2rem;background:var(--white);padding:1.5rem;border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);">
        <h3 style="margin-bottom:1rem;font-size:1rem;color:var(--text-main);">${ICONS.clipboard} Últimas Solicitações</h3>
        ${docsRecentes.length > 0 ? docsRecentes.map(d => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:0.6rem 0;border-bottom:1px solid var(--border);">
            <div>
              <div style="font-size:0.85rem;font-weight:500;color:var(--text-main);">${escapeHTML(d.tipo)}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">${d.perfis?.nome_completo ? escapeHTML(d.perfis.nome_completo) : ''}</div>
            </div>
            <span class="badge ${d.status === 'pendente' ? 'badge-warning' : 'badge-success'}">${escapeHTML(d.status)}</span>
          </div>
        `).join('') : '<p style="color:var(--text-muted);font-size:0.85rem;">Nenhuma solicitação recente.</p>'}
      </div>
    `

    const periodoCount: Record<string, number> = {}
    turmas?.forEach(t => { periodoCount[t.periodo] = (periodoCount[t.periodo] || 0) + 1 })
    const chartData = Object.entries(periodoCount)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 8)
      .map(([label, value]) => ({ label, value }))
    if (chartData.length > 0) {
      chartsHTML = renderBarChart(chartData, 'Turmas por Período')
    }
  }

  else if (role === 'professor') {
    const { data: ofertas } = await ProfessorService.getDisciplinasDoProfessor(profile.id)
    const { data: aulas } = await ProfessorService.getAulasDoProfessor(profile.id)

    const turmasSet = new Set<string>()
    ofertas?.forEach(o => {
      const turma = o.turmas as any
      if (turma?.nome) turmasSet.add(turma.nome)
    })

    const aulasEsteMes = (aulas || []).filter(a => {
      const data = new Date(a.data)
      const now = new Date()
      return data.getMonth() === now.getMonth() && data.getFullYear() === now.getFullYear()
    })

    cards = [
      { iconKey: 'graduation', label: 'Minhas Turmas', value: turmasSet.size, color: 'var(--primary)' },
      { iconKey: 'book', label: 'Disciplinas', value: ofertas?.length ?? 0, color: 'var(--accent)' },
      { iconKey: 'calendar', label: 'Aulas Este Mês', value: aulasEsteMes.length, color: 'var(--success)' },
      { iconKey: 'clipboard', label: 'Total de Aulas', value: aulas?.length ?? 0, color: 'var(--text-muted)' },
    ]

    const meses: Record<string, number> = {}
    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    aulas?.forEach(a => {
      const d = new Date(a.data)
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
      meses[key] = (meses[key] || 0) + 1
    })
    const aulasChartData = Object.entries(meses)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, value]) => {
        const [ano, mes] = key.split('-')
        return { label: `${mesesNomes[parseInt(mes)-1]}/${ano}`, value }
      })
    if (aulasChartData.length > 1) {
      chartsHTML = renderBarChart(aulasChartData.map(d => ({ ...d, color: '#16A34A' })), 'Aulas por Mês')
    }

    if (aulasEsteMes.length > 0) {
      extraHTML = `
        <div style="margin-top:2rem;background:var(--white);padding:1.5rem;border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);">
          <h3 style="margin-bottom:1rem;font-size:1rem;color:var(--text-main);">${ICONS.calendar} Últimas Aulas Registradas</h3>
          ${aulasEsteMes.slice(0, 5).map(a => {
            const disc = (a.turma_disciplinas as any)?.disciplinas_base as any
            const turmaNome = (a.turma_disciplinas as any)?.turmas?.nome || ''
            return `
              <div style="display:flex;align-items:center;gap:10px;padding:0.6rem 0;border-bottom:1px solid var(--border);">
                <span style="font-size:0.8rem;color:var(--text-muted);min-width:80px;">${escapeHTML(a.data)}</span>
                <div style="flex:1;">
                  <div style="font-size:0.85rem;font-weight:500;color:var(--text-main);">${disc?.nome ? escapeHTML(disc.nome) : '—'}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted);">${escapeHTML(turmaNome)}</div>
                </div>
              </div>
            `
          }).join('')}
        </div>
      `
    }
  }

  else if (role === 'aluno') {
    const [{ data: docs }, { data: matriculas }] = await Promise.all([
      DocumentsService.getMyRequests(profile.id),
      supabase.from('matriculas').select('id, status_aluno, turmas(nome)').eq('aluno_id', profile.id),
    ])
    const docsPendentes = (docs || []).filter(d => d.status === 'pendente').length
    const matriculasAtivas = (matriculas || []).filter(m => m.status_aluno === 'ativo')

    cards = [
      { iconKey: 'file', label: 'Meus Documentos', value: docs?.length ?? 0, color: 'var(--primary)' },
      { iconKey: 'clock', label: 'Pendentes', value: docsPendentes, color: docsPendentes > 0 ? 'var(--danger)' : 'var(--success)' },
      { iconKey: 'graduation', label: 'Turmas Ativas', value: matriculasAtivas.length, color: 'var(--accent)' },
      { iconKey: 'clipboard', label: 'Total Matrículas', value: matriculas?.length ?? 0, color: 'var(--text-muted)' },
    ]

    if (matriculasAtivas.length > 0) {
      extraHTML = `
        <div style="margin-top:2rem;background:var(--white);padding:1.5rem;border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);">
          <h3 style="margin-bottom:1rem;font-size:1rem;color:var(--text-main);">${ICONS.graduation} Minhas Turmas</h3>
          ${matriculasAtivas.map(m => {
            const turmaNome = (m.turmas as any)?.nome || '—'
            return `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:0.6rem 0;border-bottom:1px solid var(--border);">
                <span style="font-size:0.9rem;color:var(--text-main);">${escapeHTML(turmaNome)}</span>
                <span class="badge badge-success">Ativo</span>
              </div>
            `
          }).join('')}
        </div>
      `
    }
  }

  else if (role === 'financeiro') {
    const [{ count: totalMembros }] = await Promise.all([
      supabase.from('perfis').select('id', { count: 'exact', head: true }),
    ])

    cards = [
      { iconKey: 'users', label: 'Membros no SGE', value: totalMembros ?? 0, color: 'var(--primary)' },
      { iconKey: 'dollar', label: 'Total Recebido (Mês)', value: '—', color: 'var(--success)' },
      { iconKey: 'warning', label: 'Inadimplentes', value: '—', color: 'var(--danger)' },
      { iconKey: 'clipboard', label: 'Documentos Fiscais', value: '—', color: 'var(--text-muted)' },
    ]
  }

  else {
    cards = [
      { iconKey: 'users', label: 'Membros no SGE', value: '—', color: 'var(--primary)' },
      { iconKey: 'file', label: 'Documentos', value: '—', color: 'var(--accent)' },
    ]
  }

  container.innerHTML = `
    <header style="margin-bottom:2rem;">
      <h1 style="font-size:2.2rem;color:var(--text-main);">Olá, ${firstName} 👋</h1>
      <p style="color:var(--text-muted);">Seja bem-vindo(a) ao Portal Oficial CSM.</p>
    </header>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1.5rem;">
      ${renderStatCards(cards)}
    </div>

    ${chartsHTML ? `
    <div style="margin-top:2rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;">
      ${chartsHTML}
    </div>
    ` : ''}

    ${extraHTML}
  `

  return container
}
