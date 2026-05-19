interface AuditTrendChartProps {
  data: Array<{ periodo: string; alta: number; media: number; baixa: number }>;
  height?: number;
}

export function AuditTrendChart({ data, height = 200 }: AuditTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-muted)',
        background: 'white',
        borderRadius: '12px'
      }}>
        Nenhum dado de tendência disponível
      </div>
    );
  }

  const chartHeight = height - 40;
  const chartWidth = 100;
  const stepX = chartWidth / (data.length - 1 || 1);

  const maxValue = Math.max(
    ...data.map(d => d.alta + d.media + d.baixa)
  );

  const getPoints = (key: 'alta' | 'media' | 'baixa') => {
    return data.map((d, i) => {
      const x = i * stepX;
      const y = chartHeight - ((d[key] / maxValue) * chartHeight);
      return `${x},${y}`;
    }).join(' ');
  };

  const colors = {
    alta: '#DC2626',
    media: '#D97706',
    baixa: '#059669'
  };

  return (
    <div style={{
      background: 'white',
      padding: '1.5rem',
      borderRadius: '12px',
      boxShadow: 'var(--shadow-sm)',
      marginBottom: '1.5rem'
    }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>
        Tendência por Período
      </h3>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        marginBottom: '1rem',
        justifyContent: 'center'
      }}>
        {Object.entries(colors).map(([key, color]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              background: color,
              borderRadius: '2px'
            }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {key === 'alta' ? 'Alta' : key === 'media' ? 'Média' : 'Baixa'}
            </span>
          </div>
        ))}
      </div>

      <svg viewBox={`0 0 100 ${chartHeight}`} style={{ width: '100%', height }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1="0"
            y1={chartHeight * ratio}
            x2="100"
            y2={chartHeight * ratio}
            stroke="#eee"
            strokeWidth="0.5"
          />
        ))}

        {/* Lines */}
        <polyline
          fill="none"
          stroke={colors.baixa}
          strokeWidth="2"
          points={getPoints('baixa')}
        />
        <polyline
          fill="none"
          stroke={colors.media}
          strokeWidth="2"
          points={getPoints('media')}
        />
        <polyline
          fill="none"
          stroke={colors.alta}
          strokeWidth="2"
          points={getPoints('alta')}
        />

        {/* X-axis labels */}
        {data.map((d, i) => {
          const x = i * stepX;
          return (
            <text
              key={i}
              x={x}
              y={chartHeight + 10}
              fontSize="4"
              fill="var(--text-muted)"
              textAnchor="middle"
            >
              {d.periodo.slice(0, 7)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}