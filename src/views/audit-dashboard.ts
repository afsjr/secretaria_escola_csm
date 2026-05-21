import { AuditCards } from "../components/audit/AuditCards"
import { AuditBarChart } from "../components/audit/AuditBarChart"
import { AuditTrendChart } from "../components/audit/AuditTrendChart"
import { fetchAuditStats } from "../hooks/useAuditStats"

const PERIODOS = [
  { value: "12meses", label: "12 meses" },
  { value: "6meses", label: "6 meses" },
  { value: "3meses", label: "3 meses" },
  { value: "30dias", label: "30 dias" },
  { value: "semana", label: "Semana" },
]

export async function AuditDashboard(onPeriodChange?: (p: string) => void, periodoInicial = "6meses"): Promise<HTMLElement> {
  let periodo = periodoInicial
  let stats: Awaited<ReturnType<typeof fetchAuditStats>> | null = null
  let loading = true
  let error: string | null = null

  const loadStats = async (p: string) => {
    loading = true
    error = null
    try {
      stats = await fetchAuditStats(p)
    } catch (err) {
      error = err instanceof Error ? err.message : 'Erro desconhecido'
    } finally {
      loading = false
      render()
    }
  }

  const container = document.createElement('div')
  container.style.cssText = 'margin-bottom:2rem'

  function render() {
    container.innerHTML = ''

    const header = document.createElement('div')
    header.style.cssText = 'display:flex;gap:0.5rem;margin-bottom:1.5rem;flex-wrap:wrap'

    PERIODOS.forEach((p) => {
      const btn = document.createElement('button')
      btn.textContent = p.label
      btn.style.cssText = `padding:0.5rem 1rem;border:${periodo === p.value ? '2px solid var(--primary)' : '1px solid var(--border)'};border-radius:8px;background:${periodo === p.value ? 'var(--primary)' : 'white'};color:${periodo === p.value ? 'white' : 'var(--text-main)'};cursor:pointer;font-weight:600;font-size:0.875rem;transition:all 0.2s`
      btn.onclick = () => {
        periodo = p.value
        onPeriodChange?.(p.value)
        loadStats(p.value)
      }
      header.appendChild(btn)
    })

    container.appendChild(header)

    if (loading) {
      const loadingEl = document.createElement('div')
      loadingEl.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.5rem;padding:1rem;'
      loadingEl.innerHTML = Array.from({ length: 4 }, () =>
        '<div style="background:var(--white);padding:1.75rem;border-radius:16px;box-shadow:var(--shadow-md);border:1px solid rgba(0,0,0,0.05);">' +
          '<div class="skeleton" style="width:60%;height:14px;border-radius:4px;margin-bottom:12px"></div>' +
          '<div class="skeleton" style="width:40%;height:32px;border-radius:4px;margin-bottom:16px"></div>' +
          '<div class="skeleton" style="width:80%;height:14px;border-radius:4px;margin-bottom:8px"></div>' +
          '<div class="skeleton" style="width:65%;height:14px;border-radius:4px"></div>' +
        '</div>'
      ).join('')
      container.appendChild(loadingEl)
      return
    }

    if (error) {
      const errorEl = document.createElement('div')
      errorEl.style.cssText = 'padding:1rem;background:#FEE2E2;color:#DC2626;border-radius:8px;margin-bottom:1rem'
      errorEl.textContent = `Erro: ${error}`
      container.appendChild(errorEl)
      return
    }

    if (stats) {
      container.appendChild(AuditCards({
        total: stats.total,
        porSeveridade: stats.por_severidade,
      }) as HTMLElement)

      container.appendChild(AuditBarChart({
        data: stats.por_acao,
      }) as HTMLElement)

      container.appendChild(AuditTrendChart({
        data: stats.tendencia,
      }) as HTMLElement)
    }
  }

  render()
  loadStats(periodo)
  return container
}
