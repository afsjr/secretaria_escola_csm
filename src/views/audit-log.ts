/**
 * Audit Log View — Painel de Auditoria
 *
 * Apenas admin e master_admin podem acessar.
 * Mostra todas as ações sensíveis do sistema com filtros.
 */

import { AuditService } from "../lib/audit-service";
import { escapeHTML } from "../lib/security";
import { formatDateTimeBR } from "../lib/date-utils";

const ACTION_LABELS: Record<string, string> = {
  "reset_senha": "🔑 Reset de Senha",
  "criar_usuario": "👤 Criar Usuário",
  "delete_usuario": "🗑️ Deletar Usuário",
  "alterar_perfil_acesso": "🔄 Alterar Perfil",
  "lancar_nota": "📝 Lançar Notas",
  "alterar_nota": "✏️ Alterar Nota",
  "delete_nota": "🗑️ Deletar Nota",
  "matricular_aluno": "🎓 Matricular Aluno",
  "transferir_aluno": "🔄 Transferir Aluno",
  "registrar_aula": "📚 Registrar Aula",
  "delete_aula": "🗑️ Excluir Aula",
  "login_sucesso": "✅ Login",
  "solicitar_documento": "📄 Solicitar Documento",
  "atualizar_perfil": "👤 Atualizar Perfil",
};

const ACTION_SEVERITY: Record<string, string> = {
  "reset_senha": "alta",
  "delete_usuario": "alta",
  "alterar_perfil_acesso": "alta",
  "lancar_nota": "media",
  "alterar_nota": "media",
  "delete_nota": "media",
  "criar_usuario": "media",
  "matricular_aluno": "media",
  "transferir_aluno": "media",
  "registrar_aula": "baixa",
  "delete_aula": "baixa",
  "login_sucesso": "baixa",
  "solicitar_documento": "baixa",
  "atualizar_perfil": "baixa",
};

interface SeverityColors {
  bg: string;
  text: string;
  border: string;
}

const SEVERITY_COLORS: Record<string, SeverityColors> = {
  "alta": { bg: "#FEE2E2", text: "#DC2626", border: "#FCA5A5" },
  "media": { bg: "#FEF3C7", text: "#D97706", border: "#FCD34D" },
  "baixa": { bg: "#D1FAE5", text: "#059669", border: "#6EE7B7" },
};



function truncate(str: string | undefined, maxLen = 60): string {
  if (!str) return "—";
  return str.length > maxLen ? str.substring(0, maxLen) + "..." : str;
}

function renderLogTable(logs: any[]): string {
  return `
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 5%;">Nível</th>
            <th style="width: 18%;">Data/Hora</th>
            <th style="width: 18%;">Usuário</th>
            <th style="width: 22%;">Ação</th>
            <th style="width: 37%;">Descrição</th>
          </tr>
        </thead>
        <tbody id="audit-log-tbody">
          ${logs.map((log) => renderLogRow(log)).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderLogRow(log: any): string {
  const severity = ACTION_SEVERITY[log.acao] || "baixa";
  const colors = SEVERITY_COLORS[severity];
  const actionLabel = ACTION_LABELS[log.acao] || log.acao;
  const initials = log.usuario_nome
    ? escapeHTML(log.usuario_nome.charAt(0).toUpperCase())
    : "?";

  return `
    <tr style="cursor: pointer;" title="${escapeHTML(log.descricao || "")}"
        onclick="this.querySelector('.log-details').style.display = this.querySelector('.log-details').style.display === 'none' ? 'table-cell' : 'none'">
      <td>
        <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${colors.text};"></span>
      </td>
      <td style="font-size: 0.85rem; white-space: nowrap;">
        ${formatDateTimeBR(log.created_at)}
      </td>
      <td>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; color: white; flex-shrink: 0;">
            ${initials}
          </div>
          <div>
            <div style="font-weight: 600; font-size: 0.85rem;">${
    escapeHTML(log.usuario_nome || "Desconhecido")
  }</div>
            <div style="font-size: 0.7rem; color: var(--text-muted);">${
    escapeHTML(log.usuario_perfil || "—")
  }</div>
          </div>
        </div>
      </td>
      <td>
        <span style="background: ${colors.bg}; color: ${colors.text}; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; border: 1px solid ${colors.border};">
          ${actionLabel}
        </span>
      </td>
      <td class="log-description" style="font-size: 0.85rem; color: var(--text-main);">
        ${truncate(log.descricao || log.acao)}
      </td>
    </tr>
  `;
}

function renderEmptyState(): string {
  return `
    <div style="padding: 4rem; text-align: center; color: var(--text-muted);">
      <div style="font-size: 3rem; margin-bottom: 1rem;">📋</div>
      <p style="font-size: 1.1rem; font-weight: 600;">Nenhum log registrado ainda</p>
      <p style="font-size: 0.9rem;">As ações sensíveis do sistema serão registradas automaticamente aqui.</p>
    </div>
  `;
}

export async function AuditLogView(): Promise<HTMLElement> {
  const container = document.createElement("div");
  container.className = "audit-log-view animate-in";

  // Carregar logs iniciais
  const { data: logs, error, count } = await AuditService.getLogs({
    limit: 50,
  });
  const { data: severityCounts } = await AuditService.getCountsBySeverity();

  if (error) {
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center;">
        <h2 style="color: var(--danger);">Erro ao carregar logs</h2>
        <p>${escapeHTML(error.message)}</p>
      </div>
    `;
    return container;
  }

  // Contadores de severidade
  const sc = (severityCounts || { alta: 0, media: 0, baixa: 0 }) as {
    alta: number;
    media: number;
    baixa: number;
  };

  container.innerHTML = `
    <header style="margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h1 style="font-size: 2rem; color: var(--text-main);">📋 Log de Auditoria</h1>
          <p style="color: var(--text-muted);">Registro imutável de todas as ações sensíveis do sistema.</p>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <span style="background: ${SEVERITY_COLORS.alta.bg}; color: ${SEVERITY_COLORS.alta.text}; padding: 0.3rem 0.8rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
            🔴 Alta: ${sc.alta}
          </span>
          <span style="background: ${SEVERITY_COLORS.media.bg}; color: ${SEVERITY_COLORS.media.text}; padding: 0.3rem 0.8rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
            🟡 Média: ${sc.media}
          </span>
          <span style="background: ${SEVERITY_COLORS.baixa.bg}; color: ${SEVERITY_COLORS.baixa.text}; padding: 0.3rem 0.8rem; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
            🟢 Baixa: ${sc.baixa}
          </span>
        </div>
      </div>
    </header>

    <!-- Filtros -->
    <div style="background: white; padding: 1.2rem; border-radius: 8px; box-shadow: var(--shadow-sm); margin-bottom: 1.5rem;">
      <div style="display: flex; gap: 1rem; flex-wrap: wrap; align-items: flex-end;">
        <div class="form-group" style="flex: 1; min-width: 200px; margin: 0;">
          <label class="label" for="filtro-acao">Ação</label>
          <select id="filtro-acao" class="input" style="padding: 0.5rem;">
            <option value="">Todas</option>
            ${
    Object.entries(ACTION_LABELS).map(([key, label]) => `
              <option value="${key}">${label}</option>
            `).join("")
  }
          </select>
        </div>
        <div class="form-group" style="flex: 1; min-width: 150px; margin: 0;">
          <label class="label" for="filtro-severidade">Severidade</label>
          <select id="filtro-severidade" class="input" style="padding: 0.5rem;">
            <option value="">Todas</option>
            <option value="alta">🔴 Alta</option>
            <option value="media">🟡 Média</option>
            <option value="baixa">🟢 Baixa</option>
          </select>
        </div>
        <div class="form-group" style="flex: 1; min-width: 150px; margin: 0;">
          <label class="label" for="filtro-busca">Buscar</label>
          <input type="text" id="filtro-busca" class="input" placeholder="Nome, descrição..." style="padding: 0.5rem;">
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button id="btn-filtrar" class="btn btn-primary" style="height: 42px;">Filtrar</button>
          <button id="btn-limpar" class="btn" style="background: var(--secondary); height: 42px;">Limpar</button>
        </div>
      </div>
    </div>

    <!-- Tabela de Logs -->
    <div id="audit-log-table-container" style="background: white; border-radius: 8px; box-shadow: var(--shadow-sm); overflow: hidden;">
      ${logs && logs.length > 0 ? renderLogTable(logs) : renderEmptyState()}
    </div>

    <!-- Paginação -->
    <div id="pagination-container" style="display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.5rem; padding: 1rem;">
      ${
    count > 50
      ? `
        <button id="btn-load-more" class="btn btn-primary">
          Carregar Mais (Total: ${count})
        </button>
      `
      : ""
  }
    </div>
  `;

  // =====================================================
  // LÓGICA DE FILTROS
  // =====================================================
  const btnFiltrar = container.querySelector(
    "#btn-filtrar",
  ) as HTMLButtonElement;
  const btnLimpar = container.querySelector("#btn-limpar") as HTMLButtonElement;
  const btnLoadMore = container.querySelector("#btn-load-more") as
    | HTMLButtonElement
    | null;
  const tableContainer = container.querySelector(
    "#audit-log-table-container",
  ) as HTMLDivElement;

  btnFiltrar.addEventListener("click", async () => {
    const acao =
      (container.querySelector("#filtro-acao") as HTMLSelectElement).value;
    const severidade =
      (container.querySelector("#filtro-severidade") as HTMLSelectElement)
        .value;

    btnFiltrar.disabled = true;
    btnFiltrar.textContent = "Carregando...";

    let filteredLogs = logs || [];

    // Filtro por ação
    if (acao) {
      filteredLogs = filteredLogs.filter((l) => l.acao === acao);
    }

    // Filtro por severidade
    if (severidade) {
      filteredLogs = filteredLogs.filter((l) =>
        ACTION_SEVERITY[l.acao] === severidade
      );
    }

    // Filtro por busca textual
    const busca = (container.querySelector("#filtro-busca") as HTMLInputElement)
      .value.toLowerCase();
    if (busca) {
      filteredLogs = filteredLogs.filter((l) =>
        (l.descricao || "").toLowerCase().includes(busca) ||
        (l.usuario_nome || "").toLowerCase().includes(busca)
      );
    }

    tableContainer.innerHTML = filteredLogs.length > 0
      ? renderLogTable(filteredLogs)
      : `<div style="padding: 3rem; text-align: center; color: var(--text-muted);">
           <p style="font-size: 1.1rem;">Nenhum log encontrado com os filtros selecionados.</p>
         </div>`;

    btnFiltrar.disabled = false;
    btnFiltrar.textContent = "Filtrar";
  });

  btnLimpar.addEventListener("click", () => {
    (container.querySelector("#filtro-acao") as HTMLSelectElement).value = "";
    (container.querySelector("#filtro-severidade") as HTMLSelectElement).value =
      "";
    (container.querySelector("#filtro-busca") as HTMLInputElement).value = "";
    tableContainer.innerHTML = renderLogTable(logs);
  });

  // Load More
  if (btnLoadMore) {
    let offset = 50;
    btnLoadMore.addEventListener("click", async () => {
      btnLoadMore.disabled = true;
      btnLoadMore.textContent = "Carregando...";

      const { data: moreLogs, count: totalCount } = await AuditService.getLogs({
        limit: 50,
        offset,
      });

      if (moreLogs && moreLogs.length > 0) {
        const tbody = tableContainer.querySelector("#audit-log-tbody");
        const newRows = moreLogs.map((log) => renderLogRow(log)).join("");
        if (tbody) tbody.innerHTML += newRows;
        offset += 50;

        btnLoadMore.textContent = `Carregar Mais (Total: ${totalCount})`;
      } else {
        btnLoadMore.textContent = "Não há mais registros";
      }

      btnLoadMore.disabled = false;
    });
  }

  return container;
}
