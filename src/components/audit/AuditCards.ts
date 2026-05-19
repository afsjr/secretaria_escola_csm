interface AuditCardsProps {
  total: number;
  porSeveridade: { alta: number; media: number; baixa: number };
}

export function AuditCards({ total, porSeveridade }: AuditCardsProps) {
  const cards = [
    { label: 'Total', value: total, color: 'var(--primary)', icon: '📊' },
    { label: 'Alta', value: porSeveridade.alta, color: '#DC2626', icon: '🔴' },
    { label: 'Média', value: porSeveridade.media, color: '#D97706', icon: '🟡' },
    { label: 'Baixa', value: porSeveridade.baixa, color: '#059669', icon: '🟢' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1rem',
      marginBottom: '1.5rem'
    }}>
      {cards.map((card) => (
        <div
          key={card.label}
          style={{
            background: 'white',
            padding: '1rem',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-sm)',
            borderTop: `4px solid ${card.color}`,
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{card.icon}</div>
          <div style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: card.color
          }}>
            {card.value}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            fontWeight: '600'
          }}>
            {card.label}
          </div>
        </div>
      ))}
    </div>
  );
}