/**
 * Componente de Dashboard de Gráficos para Audit
 * Integrado à página de Audit Log
 */

import { AuditCards } from "../components/audit/AuditCards";
import { AuditBarChart } from "../components/audit/AuditBarChart";
import { AuditTrendChart } from "../components/audit/AuditTrendChart";
import { useAuditStats } from "../hooks/useAuditStats";

const PERIODOS = [
  { value: "12meses", label: "12 meses" },
  { value: "6meses", label: "6 meses" },
  { value: "3meses", label: "3 meses" },
  { value: "30dias", label: "30 dias" },
  { value: "semana", label: "Semana" },
];

export function AuditDashboard({ onPeriodChange }: { onPeriodChange?: (p: string) => void }) {
  const [periodo, setPeriodo] = React.useState("6meses");
  const { stats, loading, error } = useAuditStats(periodo);

  const handlePeriodChange = (e: Event) => {
    const newPeriod = (e.target as HTMLSelectElement).value;
    setPeriodo(newPeriod);
    onPeriodChange?.(newPeriod);
  };

  return React.createElement("div", { style: { marginBottom: "2rem" } },
    // Selector de período
    React.createElement("div", {
      style: {
        display: "flex",
        gap: "0.5rem",
        marginBottom: "1.5rem",
        flexWrap: "wrap"
      }
    }, PERIODOS.map(p =>
      React.createElement("button", {
        key: p.value,
        onClick: () => setPeriodo(p.value),
        style: {
          padding: "0.5rem 1rem",
          border: periodo === p.value ? "2px solid var(--primary)" : "1px solid var(--border)",
          borderRadius: "8px",
          background: periodo === p.value ? "var(--primary)" : "white",
          color: periodo === p.value ? "white" : "var(--text-main)",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "0.875rem",
          transition: "all 0.2s"
        }
      }, p.label)
    )),

    // Loading
    loading && React.createElement("div", {
      style: { textAlign: "center", padding: "2rem", color: "var(--text-muted)" }
    }, "Carregando estatísticas..."),

    // Error
    error && React.createElement("div", {
      style: {
        padding: "1rem",
        background: "#FEE2E2",
        color: "#DC2626",
        borderRadius: "8px",
        marginBottom: "1rem"
      }
    }, `Erro: ${error}`),

    // Dados
    stats && React.createElement(React.Fragment, null,
      // Cards consolidados
      React.createElement(AuditCards, {
        total: stats.total,
        porSeveridade: stats.por_severidade
      }),

      // Gráfico de barras
      React.createElement(AuditBarChart, {
        data: stats.por_acao
      }),

      // Gráfico de tendência
      React.createElement(AuditTrendChart, {
        data: stats.tendencia
      })
    )
  );
}