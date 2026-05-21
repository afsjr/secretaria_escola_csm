import type { UserProfile, Session } from '../types'
import { DocumentsService } from '../lib/documents-service'
import { AcademicService } from '../lib/academic-service'
import { ProfessorService } from '../lib/professor-service'
import { supabase } from '../lib/supabase'
import { escapeHTML } from '../lib/security'

interface StatCard {
  icon: string
  label: string
  value: string | number
  color: string
}

function renderStatCards(cards: StatCard[]): string {
  return cards.map(c => `
    <div class="stat-card" style="border-left: 4px solid ${c.color};">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
        <span style="font-size:1.5rem;">${c.icon}</span>
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
      { icon: '👥', label: 'Membros no SGE', value: totalMembros ?? 0, color: 'var(--primary)' },
      { icon: '🎓', label: 'Turmas Ativas', value: turmasAtivas, color: 'var(--accent)' },
      { icon: '📄', label: 'Documentos Pendentes', value: docsPendentes, color: docsPendentes > 0 ? 'var(--danger)' : 'var(--success)' },
      { icon: '👤', label: 'Total de Alunos', value: '—', color: 'var(--text-muted)' },
    ]

    const docsRecentes = (docs || []).slice(0, 5)
    extraHTML = docsRecentes.length > 0 ? `
      <div style="margin-top:2rem;background:var(--white);padding:1.5rem;border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);">
        <h3 style="margin-bottom:1rem;font-size:1rem;color:var(--text-main);">📋 Solicitações Recentes</h3>
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
      chartsHTML = renderBarChart(chartData, '📊 Turmas por Período')
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
        { icon: '👤', label: 'Total de Alunos', value: alunos?.length ?? 0, color: 'var(--primary)' },
        { icon: '🎓', label: 'Turmas Cadastradas', value: turmas?.length ?? 0, color: 'var(--accent)' },
        { icon: '👨‍🏫', label: 'Professores', value: profs?.length ?? 0, color: 'var(--success)' },
        { icon: '📄', label: 'Documentos Pendentes', value: docsPendentes, color: docsPendentes > 0 ? 'var(--danger)' : 'var(--success)' },
      ]
    } else {
      cards = [
        { icon: '👤', label: 'Total de Alunos', value: alunos?.length ?? 0, color: 'var(--primary)' },
        { icon: '🎓', label: 'Turmas Ativas', value: (turmas || []).filter(t => t.status_ingresso === 'aberta').length, color: 'var(--accent)' },
        { icon: '📄', label: 'Documentos Pendentes', value: docsPendentes, color: docsPendentes > 0 ? 'var(--danger)' : 'var(--success)' },
        { icon: '📋', label: 'Total de Turmas', value: turmas?.length ?? 0, color: 'var(--text-muted)' },
      ]
    }

    const docsRecentes = (docs || []).slice(0, 5)
    extraHTML = `
      <div style="margin-top:2rem;background:var(--white);padding:1.5rem;border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);">
        <h3 style="margin-bottom:1rem;font-size:1rem;color:var(--text-main);">📋 Últimas Solicitações</h3>
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
      chartsHTML = renderBarChart(chartData, '📊 Turmas por Período')
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
      { icon: '🎓', label: 'Minhas Turmas', value: turmasSet.size, color: 'var(--primary)' },
      { icon: '📚', label: 'Disciplinas', value: ofertas?.length ?? 0, color: 'var(--accent)' },
      { icon: '📅', label: 'Aulas Este Mês', value: aulasEsteMes.length, color: 'var(--success)' },
      { icon: '📝', label: 'Total de Aulas', value: aulas?.length ?? 0, color: 'var(--text-muted)' },
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
      chartsHTML = renderBarChart(aulasChartData.map(d => ({ ...d, color: '#16A34A' })), '📊 Aulas por Mês')
    }

    if (aulasEsteMes.length > 0) {
      extraHTML = `
        <div style="margin-top:2rem;background:var(--white);padding:1.5rem;border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);">
          <h3 style="margin-bottom:1rem;font-size:1rem;color:var(--text-main);">📅 Últimas Aulas Registradas</h3>
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
      { icon: '📄', label: 'Meus Documentos', value: docs?.length ?? 0, color: 'var(--primary)' },
      { icon: '⏳', label: 'Pendentes', value: docsPendentes, color: docsPendentes > 0 ? 'var(--danger)' : 'var(--success)' },
      { icon: '🎓', label: 'Turmas Ativas', value: matriculasAtivas.length, color: 'var(--accent)' },
      { icon: '📋', label: 'Total Matrículas', value: matriculas?.length ?? 0, color: 'var(--text-muted)' },
    ]

    if (matriculasAtivas.length > 0) {
      extraHTML = `
        <div style="margin-top:2rem;background:var(--white);padding:1.5rem;border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);">
          <h3 style="margin-bottom:1rem;font-size:1rem;color:var(--text-main);">🎓 Minhas Turmas</h3>
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
      { icon: '👥', label: 'Membros no SGE', value: totalMembros ?? 0, color: 'var(--primary)' },
      { icon: '💰', label: 'Total Recebido (Mês)', value: '—', color: 'var(--success)' },
      { icon: '⚠️', label: 'Inadimplentes', value: '—', color: 'var(--danger)' },
      { icon: '📋', label: 'Documentos Fiscais', value: '—', color: 'var(--text-muted)' },
    ]
  }

  else {
    cards = [
      { icon: '👥', label: 'Membros no SGE', value: '—', color: 'var(--primary)' },
      { icon: '📄', label: 'Documentos', value: '—', color: 'var(--accent)' },
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
