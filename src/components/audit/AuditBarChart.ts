interface AuditBarChartProps {
  data: Array<{ acao: string; count: number }>;
  height?: number;
}

export function AuditBarChart({ data, height = 250 }: AuditBarChartProps) {
  if (!data || data.length === 0) {
    const el = document.createElement('div')
    el.style.cssText = `height:${height}px;display:flex;align-items:center;justify-content:center;color:var(--text-muted);background:white;border-radius:12px`
    el.textContent = 'Nenhum dado disponível para o período'
    return el
  }

  const maxCount = Math.max(...data.map(d => d.count))
  const chartHeight = height - 40
  const barWidth = Math.min(60, (100 / data.length) - 2)

  const actionLabels: Record<string, string> = {
    'login_sucesso': 'Login',
    'lancar_nota': 'Lançar Nota',
    'alterar_nota': 'Alterar Nota',
    'delete_nota': 'Excluir Nota',
    'criar_usuario': 'Criar Usuário',
    'matricular_aluno': 'Matricular',
    'transferir_aluno': 'Transferir',
    'reset_senha': 'Reset Senha',
    'delete_usuario': 'Excluir Usuário',
    'alterar_perfil_acesso': 'Alterar Perfil',
    'solicitar_documento': 'Solicitar Doc',
    'atualizar_perfil': 'Atualizar Perfil',
    'registrar_aula': 'Registrar Aula',
  }

  const container = document.createElement('div')
  container.style.cssText = `background:white;padding:1.5rem;border-radius:12px;box-shadow:var(--shadow-sm);margin-bottom:1.5rem`

  const title = document.createElement('h3')
  title.style.cssText = 'margin-bottom:1rem;color:var(--text-main)'
  title.textContent = 'Ações por Tipo'
  container.appendChild(title)

  const barsContainer = document.createElement('div')
  barsContainer.style.cssText = `display:flex;align-items:flex-end;justify-content:space-around;height:${chartHeight}px;gap:4px`

  data.slice(0, 10).forEach((item) => {
    const barHeight = (item.count / maxCount) * chartHeight

    const col = document.createElement('div')
    col.style.cssText = `display:flex;flex-direction:column;align-items:center;flex:1;max-width:${barWidth}%`
    col.title = `${item.acao}: ${item.count}`

    const bar = document.createElement('div')
    bar.style.cssText = `width:100%;height:${barHeight}px;background:var(--primary);border-radius:4px 4px 0 0;transition:height 0.3s ease;cursor:pointer;min-height:4px`
    col.appendChild(bar)

    const label = document.createElement('div')
    label.style.cssText = `font-size:0.65rem;color:var(--text-muted);margin-top:4px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%`
    label.textContent = actionLabels[item.acao] || item.acao.substring(0, 8)
    col.appendChild(label)

    const value = document.createElement('div')
    value.style.cssText = 'font-size:0.7rem;font-weight:600;color:var(--text-main)'
    value.textContent = String(item.count)
    col.appendChild(value)

    barsContainer.appendChild(col)
  })

  container.appendChild(barsContainer)
  return container
}
