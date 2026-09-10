/**
 * Professor Turmas View — orquestração e view principal
 *
 * Permite ao professor:
 * - Ver todas as suas turmas
 * - Lançar notas em lote por turma (com cálculo automático de médias)
 * - Registrar frequência/faltas
 * - Registrar aulas dadas
 * - Exportar boletim em PDF
 * - Alertas de alunos com média baixa
 *
 * A lógica de notas, frequência, alertas e PDF vive em módulos dedicados:
 * - professor-turmas-notas.ts
 * - professor-turmas-frequencia.ts
 * - professor-turmas-alertas.ts
 * - professor-turmas-pdf.ts
 */

import { ICONS } from "../lib/icons";
import { ProfessorService } from "../lib/professor-service";
import { skeletonRowSpan, skeletonCard } from "../components/skeleton";
import { toast } from "../lib/toast";
import { createBadge, escapeHTML } from "../lib/security";
import { UserProfile } from "../types";
import type { TurmaGroup } from "./professor-turmas-types";
import { loadAlunosDaDisciplina, bindSalvarNotas } from "./professor-turmas-notas";
import { loadFrequenciaAlunos } from "./professor-turmas-frequencia";
import { bindExportPdfButtons } from "./professor-turmas-pdf";

export async function ProfessorTurmasView(
  profile: UserProfile,
): Promise<HTMLElement> {
  const container = document.createElement("div");
  container.className = "professor-turmas-view animate-in";

  // Buscar disciplinas/ofertas do professor
  const { data: disciplinas, error: discError } = await ProfessorService
    .getDisciplinasDoProfessor(profile.id);

  if (discError) {
    toast.error('Erro ao carregar turmas: ' + discError.message);
  }

  if (!disciplinas || disciplinas.length === 0) {
    container.innerHTML = `
      <header class="pt-header">
        <h1 class="pt-title-h1">Minhas Turmas</h1>
        <p>Gerencie notas e aulas das suas turmas.</p>
      </header>
      <div class="pt-empty-card">
        <p class="pt-empty-title">Nenhuma turma atribuída ainda.</p>
        <p class="pt-empty-sub">Entre em contato com a secretaria para ser vinculado a uma turma.</p>
      </div>
    `;
    return container;
  }

  // Agrupar disciplinas por turma (utilizando a nova estrutura de relacionamento)
  const turmasMap: Record<string, TurmaGroup> = {};
  disciplinas.forEach((d: any) => {
    const turma = d.turmas;
    const discBase = d.disciplinas_base;
    if (!turma || !discBase) return;

    if (!turmasMap[turma.id]) {
      turmasMap[turma.id] = {
        id: turma.id,
        nome: turma.nome,
        periodo: turma.periodo || "-",
        curso: turma.turmas?.cursos?.nome || turma.cursos?.nome || "Curso Técnico",
        disciplinas: [],
      };
    }

    turmasMap[turma.id].disciplinas.push({
      id: d.id, // ID da oferta (turma_disciplina)
      nome: discBase.nome,
      modulo: discBase.modulo,
      disciplina_base_id: discBase.id // Para busca de notas
    } as any);
  });

  const turmas = Object.values(turmasMap);

  container.innerHTML = `
    <header class="pt-header pt-header-row">
      <div>
        <h1 class="pt-title-h1">Minhas Turmas</h1>
        <p>Gerencie notas e aulas das suas turmas.</p>
      </div>
    </header>

    <div class="pt-turmas-list">
      ${
    turmas.map((turma) => `
        <details class="turma-card pt-turma-card">
          <summary class="pt-turma-summary">
            <div>
              <h3 class="pt-turma-title">${
      escapeHTML(turma.nome)
    }</h3>
              <div class="pt-badges">
                ${createBadge(turma.periodo)}
                ${createBadge(turma.curso)}
                <span class="badge">${turma.disciplinas.length} disciplina(s)</span>
              </div>
            </div>
            <svg class="pt-chevron" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
          </summary>

          <div class="pt-card-body">
            <!-- Tabs: Notas | Frequência -->
            <div class="pt-tabs">
              <button class="pt-tab-btn active" data-tab="notas-${
      turma.id || "sem-turma"
    }">${ICONS.chart} Lançar Notas</button>
              <button class="pt-tab-btn" data-tab="frequencia-${
      turma.id || "sem-turma"
    }">✓ Frequência</button>
            </div>

            <!-- Tab: Notas -->
            <div class="pt-tab-content active" id="tab-notas-${
      turma.id || "sem-turma"
    }">
              ${
      turma.disciplinas.map((disc) => `
                <fieldset class="pt-fieldset">
                  <legend class="pt-legend">
                    ${escapeHTML(disc.nome)}
                    <button class="btn btn-sm btn-export-pdf pt-pdf-btn" data-disciplina-id="${disc.id}" data-disciplina-nome="${
        escapeHTML(disc.nome)
      }">${ICONS.file} PDF</button>
                  </legend>

                  <div class="notas-disciplina" data-disciplina-id="${disc.id}" data-disciplina-nome="${
        escapeHTML(disc.nome)
      }">
                    <div class="pt-table-wrap">
                      <table class="pt-table">
                        <thead class="pt-thead">
                          <tr>
                            <th class="pt-th-left">Aluno</th>
                            <th class="pt-th-center">Faltas</th>
                            <th class="pt-th-center">N1</th>
                            <th class="pt-th-center">N2</th>
                            <th class="pt-th-center">N3</th>
                            <th class="pt-th-center-hl">Média</th>
                            <th class="pt-th-center">Rec</th>
                            <th class="pt-th-center-hl">Final</th>
                            <th class="pt-th-center">Status</th>
                          </tr>
                        </thead>
                        <tbody class="notas-tbody" data-disciplina-id="${disc.id}">
                          ${skeletonRowSpan(9)}
                        </tbody>
                      </table>
                    </div>

                    <div class="pt-notes-footer">
                      <div id="alertas-${disc.id}" class="pt-alertas"></div>
                      <button class="btn btn-primary btn-salvar-notas"
                        data-disciplina-id="${disc.id}"
                        data-disciplina-base-id="${(disc as any).disciplina_base_id}"
                        data-disciplina-nome="${escapeHTML(disc.nome)}">${ICONS.save} Salvar Notas</button>
                    </div>
                  </div>
                </fieldset>
              `).join("")
    }
            </div>

            <!-- Tab: Frequência -->
            <div class="pt-tab-content" id="tab-frequencia-${
      turma.id || "sem-turma"
    }">
              <div class="pt-freq-box">
                <h4 class="pt-freq-title">Registrar Frequência</h4>
                <p class="pt-freq-hint">Marque os alunos ausentes. Os demais serão considerados presentes.</p>

                <div class="pt-freq-grid">
                  <div class="form-group">
                    <label class="label" for="freq-data">Data da Aula</label>
                    <input type="date" id="freq-data" class="input" value="${
      new Date().toISOString().split("T")[0]
    }" required>
                  </div>
                  <div class="form-group">
                    <label class="label" for="freq-disciplina">Disciplina</label>
                    <select id="freq-disciplina" class="input" required>
                      <option value="">Selecione</option>
                      ${
      turma.disciplinas.map((d) =>
        `<option value="${d.id}">${escapeHTML(d.nome)}</option>`
      ).join("")
    }
                    </select>
                  </div>
                </div>
              </div>

              <div class="frequencia-list" data-turma-id="${turma.id || ""}">
                ${skeletonCard()}
              </div>
            </div>
          </div>
        </details>
      `).join("")
  }
    </div>
  `;

  // === Event Handlers ===

  // Tab switching
  container.querySelectorAll(".pt-tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const parent = btn.closest(".turma-card") as HTMLElement;

      parent.querySelectorAll(".pt-tab-btn").forEach((b) => {
        b.classList.remove("active");
      });
      btn.classList.add("active");

      parent.querySelectorAll(".pt-tab-content").forEach((c) => {
        c.classList.remove("active");
        c.classList.remove("tab-enter");
      });
      const targetTab = (btn as HTMLButtonElement).getAttribute("data-tab");
      const targetContent = parent.querySelector(`#tab-${targetTab}`) as HTMLElement | null;
      if (targetContent) {
        targetContent.classList.add("active");
        void targetContent.offsetWidth;
        targetContent.classList.add("tab-enter");
      }
    });
  });

  // Load students for each discipline
  turmas.forEach((turma) => {
    turma.disciplinas.forEach((disc) => {
      loadAlunosDaDisciplina(disc, turma, container);
    });
  });

  // Save grades buttons
  bindSalvarNotas(container);

  // Load frequency for first discipline of each turma
  turmas.forEach((turma) => {
    if (turma.disciplinas.length > 0) {
      loadFrequenciaAlunos(turma, container, profile.id);
    }
  });

  // Export PDF buttons
  bindExportPdfButtons(container);

  return container;
}