interface AuditTrendChartProps {
  data: Array<{ periodo: string; alta: number; media: number; baixa: number }>;
  height?: number;
}

export function AuditTrendChart({ data, height = 200 }: AuditTrendChartProps) {
  if (!data || data.length === 0) {
    const el = document.createElement('div')
    el.style.cssText = `height:${height}px;display:flex;align-items:center;justify-content:center;color:var(--text-muted);background:white;border-radius:12px`
    el.textContent = 'Nenhum dado de tendência disponível'
    return el
  }

  const chartHeight = height - 40
  const chartWidth = 100
  const stepX = chartWidth / (data.length - 1 || 1)

  const maxValue = Math.max(
    ...data.map(d => d.alta + d.media + d.baixa)
  )

  const getPoints = (key: 'alta' | 'media' | 'baixa'): string => {
    return data.map((d, i) => {
      const x = i * stepX
      const y = chartHeight - ((d[key] / maxValue) * chartHeight)
      return `${x},${y}`
    }).join(' ')
  }

  const colors: Record<string, string> = {
    alta: '#DC2626',
    media: '#D97706',
    baixa: '#059669',
  }

  const container = document.createElement('div')
  container.style.cssText = 'background:white;padding:1.5rem;border-radius:12px;box-shadow:var(--shadow-sm);margin-bottom:1.5rem'

  const title = document.createElement('h3')
  title.style.cssText = 'margin-bottom:1rem;color:var(--text-main)'
  title.textContent = 'Tendência por Período'
  container.appendChild(title)

  const legend = document.createElement('div')
  legend.style.cssText = 'display:flex;gap:1.5rem;margin-bottom:1rem;justify-content:center'

  Object.entries(colors).forEach(([key, color]) => {
    const item = document.createElement('div')
    item.style.cssText = 'display:flex;align-items:center;gap:0.5rem'

    const dot = document.createElement('div')
    dot.style.cssText = `width:12px;height:12px;background:${color};border-radius:2px`
    item.appendChild(dot)

    const label = document.createElement('span')
    label.style.cssText = 'font-size:0.75rem;color:var(--text-muted)'
    const labelMap: Record<string, string> = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }
    label.textContent = labelMap[key] || key
    item.appendChild(label)

    legend.appendChild(item)
  })
  container.appendChild(legend)

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', `0 0 ${chartWidth} ${chartHeight}`)
  svg.style.cssText = `width:100%;height:${height}px`

  ;[0, 0.25, 0.5, 0.75, 1].forEach((ratio) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line.setAttribute('x1', '0')
    line.setAttribute('y1', String(chartHeight * ratio))
    line.setAttribute('x2', String(chartWidth))
    line.setAttribute('y2', String(chartHeight * ratio))
    line.setAttribute('stroke', '#eee')
    line.setAttribute('stroke-width', '0.5')
    svg.appendChild(line)
  })

  ;['baixa', 'media', 'alta'].forEach((key) => {
    const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
    poly.setAttribute('fill', 'none')
    poly.setAttribute('stroke', colors[key])
    poly.setAttribute('stroke-width', '2')
    poly.setAttribute('points', getPoints(key as any))
    svg.appendChild(poly)
  })

  data.forEach((d, i) => {
    const x = i * stepX
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    text.setAttribute('x', String(x))
    text.setAttribute('y', String(chartHeight + 10))
    text.setAttribute('font-size', '4')
    text.setAttribute('fill', 'var(--text-muted)')
    text.setAttribute('text-anchor', 'middle')
    text.textContent = d.periodo.slice(0, 7)
    svg.appendChild(text)
  })

  container.appendChild(svg)
  return container
}
