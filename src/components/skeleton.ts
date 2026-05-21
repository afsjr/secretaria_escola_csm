export function skeletonLine(width = '100%', height = '16px'): string {
  return `<div class="skeleton" style="width:${width};height:${height};border-radius:4px;margin-bottom:8px"></div>`
}

export function skeletonText(lines = 3): string {
  const widths = ['100%', '92%', '85%']
  return Array.from({ length: lines }, (_, i) =>
    skeletonLine(widths[i % widths.length])
  ).join('')
}

export function skeletonCard(): string {
  return `
    <div style="background:var(--white);padding:1.75rem;border-radius:16px;box-shadow:var(--shadow-md);border:1px solid rgba(0,0,0,0.05);">
      <div class="skeleton" style="width:60%;height:14px;border-radius:4px;margin-bottom:12px"></div>
      <div class="skeleton" style="width:40%;height:32px;border-radius:4px;margin-bottom:16px"></div>
      ${skeletonText(2)}
    </div>
  `
}

export function skeletonTable(rows = 4, cols = 4): string {
  const header = Array.from({ length: cols }, () =>
    '<th><div class="skeleton" style="width:80%;height:14px;border-radius:4px"></div></th>'
  ).join('')
  const body = Array.from({ length: rows }, () =>
    `<tr>${Array.from({ length: cols }, () =>
      '<td><div class="skeleton" style="width:70%;height:14px;border-radius:4px"></div></td>'
    ).join('')}</tr>`
  ).join('')
  return `
    <table class="data-table">
      <thead><tr>${header}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  `
}

export function skeletonRowSpan(colspan = 1): string {
  return `<tr><td colspan="${colspan}" style="padding:1rem;"><div class="skeleton" style="width:60%;height:16px;border-radius:4px"></div></td></tr>`
}
