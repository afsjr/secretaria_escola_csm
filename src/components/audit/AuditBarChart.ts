interface AuditBarChartProps {
  data: Array<{ acao: string; count: number }>;
  height?: number;
}

export function AuditBarChart({ data, height = 250 }: AuditBarChartProps) {
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
        Nenhum dado disponível para o período
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count));
  const chartHeight = height - 40;
  const barWidth = Math.min(60, (100 / data.length) - 2);

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
        Ações por Tipo
      </h3>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        height: `${chartHeight}px`,
        gap: '4px'
      }}>
        {data.slice(0, 10).map((item, index) => {
          const barHeight = (item.count / maxCount) * chartHeight;
          return (
            <div
              key={item.acao}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                maxWidth: `${barWidth}%`
              }}
              title={`${item.acao}: ${item.count}`}
            >
              <div style={{
                width: '100%',
                height: `${barHeight}px`,
                background: 'var(--primary)',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.3s ease',
                cursor: 'pointer',
                minHeight: '4px'
              }} />
              <div style={{
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                marginTop: '4px',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>
                {actionLabels[item.acao] || item.acao.substring(0, 8)}
              </div>
              <div style={{
                fontSize: '0.7rem',
                fontWeight: '600',
                color: 'var(--text-main)'
              }}>
                {item.count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}