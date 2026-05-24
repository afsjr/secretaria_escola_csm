import { AcademicService } from '../lib/academic-service'
import { calcularMediaParcial, calcularNotaFinal, calcularStatusAluno } from '../lib/grades-utils'
import { escapeHTML } from '../lib/security'
import type { UserProfile } from '../types'

export async function AlunoNotasView(profile: UserProfile): Promise<HTMLDivElement> {
  const container = document.createElement('div')
  container.className = 'aluno-notas-view'
  container.style.cssText = 'padding: 1.5rem; max-width: 1000px; margin: 0 auto;'

  container.innerHTML = `
    <h2 style="margin-bottom: 0.5rem; font-size: 1.5rem;">Minhas Notas</h2>
    <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Consulte suas notas e status por disciplina.</p>
    <div id="notas-loading" style="text-align: center; padding: 3rem;">
      <div style="width: 40px; height: 40px; border: 4px solid var(--accent); border-top-color: transparent; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem;"></div>
      <p style="color: var(--text-muted);">Carregando notas...</p>
    </div>
    <div id="notas-content" style="display: none;"></div>
    <div id="notas-error" style="display: none; color: #DC2626; background: #FEF2F2; padding: 1rem; border-radius: 8px;"></div>
  `

  const loadingEl = container.querySelector('#notas-loading') as HTMLElement
  const contentEl = container.querySelector('#notas-content') as HTMLElement
  const errorEl = container.querySelector('#notas-error') as HTMLElement

  const { data, error } = await AcademicService.getBoletim(profile.id)

  loadingEl.style.display = 'none'

  if (error) {
    errorEl.style.display = 'block'
    errorEl.textContent = 'Erro ao carregar notas: ' + error.message
    return container
  }

  if (!data || data.length === 0) {
    contentEl.style.display = 'block'
    contentEl.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 1rem; opacity: 0.4;" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
        <p>Nenhuma disciplina cadastrada.</p>
      </div>
    `
    return container
  }

  const modulos = new Map<string, any[]>()

  for (const b of data) {
    const disc = b.disciplinas_base || {}
    const modulo = disc?.modulo || 'Sem módulo'
    if (!modulos.has(modulo)) modulos.set(modulo, [])
    modulos.get(modulo)!.push(b)
  }

  const sortedModulos = Array.from(modulos.entries()).sort(([a], [b]) => a.localeCompare(b))

  let html = ''
  for (const [modulo, boletins] of sortedModulos) {
    html += `
      <div style="margin-bottom: 1.5rem;">
        <h3 style="color: var(--primary); margin-bottom: 0.75rem; font-size: 1.1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--accent);">${escapeHTML(modulo)}</h3>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
              <tr style="background: var(--primary); color: var(--bg);">
                <th style="padding: 0.75rem 1rem; text-align: left;">Disciplina</th>
                <th style="padding: 0.75rem; text-align: center;">N1</th>
                <th style="padding: 0.75rem; text-align: center;">N2</th>
                <th style="padding: 0.75rem; text-align: center;">N3</th>
                <th style="padding: 0.75rem; text-align: center;">Rec</th>
                <th style="padding: 0.75rem; text-align: center;">Média</th>
                <th style="padding: 0.75rem; text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
    `

    for (const b of boletins) {
      const disc = b.disciplinas_base || {}
      const nome = disc?.nome || b.disciplina || 'Disciplina'
      const n1 = b.n1 ?? 0
      const n2 = b.n2 ?? 0
      const n3 = b.n3 ?? 0
      const rec = b.rec ?? 0

      let mediaFinal = 0
      let statusLabel = 'Cursando'
      let badgeColor = '#D97706'
      let bgColor = '#FEF3C7'

      if (b.status === 'pendente') {
        statusLabel = 'Cursando'
      } else {
        const mediaParcial = calcularMediaParcial(n1, n2, n3)
        mediaFinal = calcularNotaFinal(mediaParcial, rec)
        const statusCalc = calcularStatusAluno(mediaFinal)
        statusLabel = statusCalc === 'Aprovado' ? 'Aprovado' : 'Reprovado'
        badgeColor = statusCalc === 'Aprovado' ? '#059669' : '#DC2626'
        bgColor = statusCalc === 'Aprovado' ? '#D1FAE5' : '#FEE2E2'
      }

      const notaEstagio = b.nota_estagio
        ? `<span style="font-size: 0.8rem; color: var(--text-muted);">Est: ${b.nota_estagio}</span>`
        : ''

      html += `
        <tr style="border-bottom: 1px solid rgba(0,0,0,0.05);">
          <td style="padding: 0.75rem 1rem; font-weight: 500;">${escapeHTML(nome)} ${notaEstagio}</td>
          <td style="padding: 0.75rem; text-align: center;">${n1 > 0 ? n1.toFixed(1) : '-'}</td>
          <td style="padding: 0.75rem; text-align: center;">${n2 > 0 ? n2.toFixed(1) : '-'}</td>
          <td style="padding: 0.75rem; text-align: center;">${n3 > 0 ? n3.toFixed(1) : '-'}</td>
          <td style="padding: 0.75rem; text-align: center;">${rec > 0 ? rec.toFixed(1) : '-'}</td>
          <td style="padding: 0.75rem; text-align: center; font-weight: 700;">${mediaFinal > 0 ? mediaFinal.toFixed(1) : '-'}</td>
          <td style="padding: 0.75rem; text-align: center;">
            <span style="display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.8rem; font-weight: 600; background: ${bgColor}; color: ${badgeColor};">${statusLabel}</span>
          </td>
        </tr>
      `
    }

    html += `
            </tbody>
          </table>
        </div>
      </div>
    `
  }

  contentEl.innerHTML = html
  contentEl.style.display = 'block'

  return container
}
