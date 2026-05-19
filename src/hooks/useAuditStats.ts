import { useState, useEffect, useCallback } from 'react';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface AuditStats {
  periodo: string;
  total: number;
  por_severidade: { alta: number; media: number; baixa: number };
  por_acao: Array<{ acao: string; count: number }>;
  tendencia: Array<{ periodo: string; alta: number; media: number; baixa: number }>;
}

interface CacheEntry {
  data: AuditStats;
  timestamp: number;
}

const statsCache = new Map<string, CacheEntry>();

export function useAuditStats(periodo: string) {
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const cacheKey = periodo;
    const cached = statsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setStats(cached.data);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/get-logs-agrupados?periodo=${periodo}`,
        {
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Falha ao carregar estatísticas');
      }

      const data = await response.json();

      statsCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [periodo]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refresh = useCallback(() => {
    statsCache.delete(periodo);
    fetchStats();
  }, [periodo, fetchStats]);

  return { stats, loading, error, refresh };
}