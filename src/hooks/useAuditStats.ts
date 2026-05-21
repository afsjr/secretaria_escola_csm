const CACHE_TTL = 5 * 60 * 1000

interface AuditStats {
  periodo: string
  total: number
  por_severidade: { alta: number; media: number; baixa: number }
  por_acao: Array<{ acao: string; count: number }>
  tendencia: Array<{ periodo: string; alta: number; media: number; baixa: number }>
}

interface CacheEntry {
  data: AuditStats
  timestamp: number
}

const statsCache = new Map<string, CacheEntry>()

export async function fetchAuditStats(periodo: string): Promise<AuditStats> {
  const cacheKey = periodo
  const cached = statsCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  const response = await fetch(
    `${supabaseUrl}/functions/v1/get-logs-agrupados?periodo=${periodo}`,
    {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Falha ao carregar estatísticas')
  }

  const data = await response.json()

  statsCache.set(cacheKey, { data, timestamp: Date.now() })
  return data
}

export function clearAuditStatsCache(periodo?: string) {
  if (periodo) {
    statsCache.delete(periodo)
  } else {
    statsCache.clear()
  }
}
