import { getAllProfiles, getUserProfile } from "../auth/session";
import { createBadge, escapeHTML } from "../lib/security";
import { AdminService } from "../lib/admin-service";
import { toast } from "../lib/toast";
import { isMasterAdmin } from "../lib/authz";
import type { UserProfile } from "../types";

// Ordem de apresentação: Alunos → Professores → Secretaria → Admin → Master Admin
const PROFILE_ORDER = [
  "aluno",
  "professor",
  "secretaria",
  "admin",
  "master_admin",
];

const PROFILE_LABELS: Record<string, string> = {
  aluno: "👨‍🎓 Alunos",
  professor: "👨‍🏫 Professores",
  secretaria: "🏢 Secretaria",
  admin: "🔒 Administradores",
  master_admin: "🛡️ Gestor do Sistema",
};

const PROFILE_COLORS: Record<string, string> = {
  aluno: "#3B82F6",
  professor: "#10B981",
  secretaria: "#F59E0B",
  admin: "#8B5CF6",
  master_admin: "#DC2626",
};

function renderProfileCard(
  p: UserProfile,
  viewerRole: string | undefined,
): string {
  const nome = escapeHTML(p.nome_completo);
  const targetPerfil = p.perfil;
  const isTargetMaster = targetPerfil === "master_admin";
  const isTargetAdmin = targetPerfil === "admin" || isTargetMaster;
  const viewerIsMaster = isMasterAdmin(viewerRole);
  const accentColor = PROFILE_COLORS[targetPerfil] || "#6B7280";

  // master_admin só pode ser resetado por ele próprio (nunca exibe botão)
  // admin pode ser resetado por master_admin
  // todos os outros podem ser resetados por admin ou master_admin
  let canReset = true;
  let restrictedLabel = "";
  if (isTargetMaster) {
    canReset = false;
    restrictedLabel = "🛡️ Proprietário do Sistema";
  } else if (targetPerfil === "admin" && !viewerIsMaster) {
    canReset = false;
    restrictedLabel = "🔒 Acesso Restrito";
  }

  const badgeLabel = isTargetMaster
    ? "[MASTER]"
    : (targetPerfil === "admin" ? "[ADM]" : "");
  const badgeColor = isTargetMaster
    ? "var(--danger, #DC2626)"
    : "var(--primary)";

  return `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.9rem 1.2rem; background: white; border-left: 4px solid ${accentColor}; gap: 1rem; transition: all 0.15s ease;"
         onmouseover="this.style.background='var(--secondary)'"
         onmouseout="this.style.background='white'">
      <div style="flex: 1;">
        <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-main);">
          ${nome}
          ${
    badgeLabel
      ? `<span style="font-size: 0.65rem; color: ${badgeColor}; font-weight: 800; margin-left: 6px; letter-spacing: 0.5px;">${badgeLabel}</span>`
      : ""
  }
        </div>
      </div>
      <div>
        ${
    !canReset
      ? `<span style="font-size: 0.7rem; color: var(--text-muted); font-style: italic;">${restrictedLabel}</span>`
      : `<button class="btn-reset-password" data-id="${p.id}" data-nome="${nome}" style="background: var(--secondary); color: var(--text-main); font-size: 0.75rem; padding: 0.4rem 0.8rem; border-radius: 4px; font-weight: 600; cursor: pointer; border: 1px solid var(--border); transition: all 0.15s ease;">
            🔄 Resetar Senha
          </button>`
  }
      </div>
    </div>
  `;
}

function renderProfileSection(
  profiles: UserProfile[],
  perfilType: string,
  viewerRole: string | undefined,
): string {
  const filtered = profiles.filter((p) => p.perfil === perfilType);
  if (filtered.length === 0) return "";

  const label = PROFILE_LABELS[perfilType] || perfilType;
  const accentColor = PROFILE_COLORS[perfilType] || "#6B7280";
  const cards = filtered
    .sort((a, b) =>
      (a.nome_completo || "").localeCompare(b.nome_completo || "")
    )
    .map((p) => renderProfileCard(p, viewerRole))
    .join("");

  return `
    <section style="margin-bottom: 2rem;">
      <header style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.8rem; padding-bottom: 0.5rem; border-bottom: 2px solid ${accentColor}20;">
        <h2 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin: 0;">${label}</h2>
        <span style="background: ${accentColor}15; color: ${accentColor}; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 12px;">
          ${filtered.length}
        </span>
      </header>
      <div style="background: white; border-radius: 8px; box-shadow: var(--shadow-sm); overflow: hidden;">
        ${cards}
      </div>
    </section>
  `;
}

export async function DirectoryView(): Promise<HTMLElement> {
  const container = document.createElement("div");
  container.className = "directory-view animate-in";

  const { data: profiles, error } = await getAllProfiles();
  const { data: viewerProfile } = await getUserProfile();
  const viewerRole = viewerProfile?.perfil as string | undefined;

  let bodyHTML = "";

  if (error) {
    bodyHTML =
      `<p style="color: var(--danger); padding: 1.5rem; background: white; border-radius: 8px;">
      ⚠️ Erro ao carregar lista: ${escapeHTML(error.message)}
    </p>`;
  } else {
    // Group by profile type in the defined order: Alunos → Professores → Secretaria → Admin
    bodyHTML = PROFILE_ORDER
      .map((type) => renderProfileSection(profiles || [], type, viewerRole))
      .filter(Boolean)
      .join("");
  }

  const totalUsers = profiles?.length || 0;

  container.innerHTML = `
    <header style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h1 style="font-size: 2rem; color: var(--text-main);">Usuários do Sistema</h1>
        <p style="color: var(--text-muted);">Organizados por perfil de acesso.</p>
      </div>
      <div style="background: white; padding: 0.5rem 1rem; border-radius: 8px; box-shadow: var(--shadow-sm); font-size: 0.85rem; font-weight: 600; color: var(--text-main);">
        👥 Total: ${totalUsers}
      </div>
    </header>

    <div id="profiles-list">
      ${bodyHTML}
    </div>
  `;

  // Lógica de Reset
  container.querySelectorAll(".btn-reset-password").forEach((btn) => {
    (btn as HTMLButtonElement).onclick = async () => {
      const { id, nome } = (btn as any).dataset;

      if (
        confirm(
          `Deseja resetar a senha de ${nome} para csm1983#?\n\nO usuário será obrigado a trocar a senha no próximo acesso.`,
        )
      ) {
        (btn as HTMLButtonElement).disabled = true;
        (btn as HTMLButtonElement).textContent = "⏳ Processando...";

        const { error } = await AdminService.resetUserPassword(id, nome);

        if (error) {
          toast.error("Erro ao resetar: " + error.message);
          (btn as HTMLButtonElement).disabled = false;
          (btn as HTMLButtonElement).textContent = "🔄 Resetar Senha";
        } else {
          toast.success(`Senha de ${nome} resetada com sucesso!`);
          (btn as HTMLButtonElement).textContent = "✅ Resetada";
          (btn as HTMLButtonElement).style.background = "var(--success)";
          (btn as HTMLButtonElement).style.color = "white";
          (btn as HTMLButtonElement).style.pointerEvents = "none";
        }
      }
    };
  });

  return container;
}
