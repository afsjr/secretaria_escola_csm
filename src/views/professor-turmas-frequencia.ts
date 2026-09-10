import { AcademicService } from "../lib/academic-service";
import { ProfessorService } from "../lib/professor-service";
import { ICONS } from "../lib/icons";
import { supabase } from "../lib/supabase";
import { toast } from "../lib/toast";
import { escapeHTML } from "../lib/security";
import { extrairPerfilPrimeiro } from "../lib/matricula-utils";
import type { TurmaGroup } from "./professor-turmas-types";

/**
 * Carrega lista de alunos para registro de frequência
 */
export async function loadFrequenciaAlunos(
  turma: TurmaGroup,
  container: HTMLElement,
  professorId: string,
): Promise<void> {
  const freqList = container.querySelector(
    `.frequencia-list[data-turma-id="${turma.id || ""}"]`,
  ) as HTMLElement;
  if (!freqList) return;

  try {
    const { data: matriculas } = await AcademicService.getAlunosDaTurma(
      turma.id!,
    ) as { data: any[] | null };

    if (!matriculas || matriculas.length === 0) {
      freqList.innerHTML =
        '<p class="text-muted">Nenhum aluno matriculado.</p>';
      return;
    }

    freqList.innerHTML = `
      <div class="pt-freq-list">
        ${
      matriculas.filter((m: any) => m.status_aluno === "ativo").map((
        m: any,
      ) => {
        const perfil = extrairPerfilPrimeiro(m);
        return `
          <div class="pt-freq-row">
            <span class="pt-freq-nome">${
        escapeHTML(perfil?.nome_completo || 'Aluno Desconhecido')
      }</span>
            <label class="pt-freq-label">
              <input type="checkbox" class="freq-checkbox pt-freq-checkbox" data-aluno-id="${perfil?.id || ''}">
              <span class="pt-freq-ausente">Ausente</span>
            </label>
          </div>
        `;
      }).join("")
    }
      </div>
      <button class="btn btn-primary btn-salvar-frequencia">${ICONS.save} Salvar Frequência</button>
    `;

    // Save frequência
    const btnSalvar = freqList.querySelector(
      ".btn-salvar-frequencia",
    ) as HTMLButtonElement;
    btnSalvar.addEventListener("click", async () => {
      const freqDataInput = document.getElementById(
        "freq-data",
      ) as HTMLInputElement;
      const freqDiscInput = document.getElementById(
        "freq-disciplina",
      ) as HTMLSelectElement;

      const dataAula = freqDataInput
        ? freqDataInput.value
        : new Date().toISOString().split("T")[0];
      const disciplinaId = freqDiscInput ? freqDiscInput.value : null;

      const alunosAusentesIds = Array.from(
        freqList.querySelectorAll(".freq-checkbox:checked"),
      ).map((cb) => (cb as HTMLInputElement).getAttribute("data-aluno-id")!);

      btnSalvar.disabled = true;
      btnSalvar.textContent = "Salvando...";

      if (!disciplinaId) {
        toast.error("Selecione uma disciplina.");
        btnSalvar.disabled = false;
        btnSalvar.innerHTML = `${ICONS.save} Salvar Frequência`;
        return;
      }

      const { error } = await ProfessorService.salvarFrequencia(
        turma.id!,
        disciplinaId,
        dataAula,
        professorId,
        alunosAusentesIds,
      );

      btnSalvar.disabled = false;
      btnSalvar.innerHTML = `${ICONS.save} Salvar Frequência`;

      if (error) {
        toast.error("Erro ao salvar frequência: " + error.message);
      } else {
        toast.success("Frequência salva com sucesso!");
      }
    });

    // Carregar frequência existente se data+disciplina já selecionados
    carregarFrequenciaExistente(turma, container);

    // Recarregar ao mudar data ou disciplina
    const freqDataInput = document.getElementById("freq-data") as HTMLInputElement;
    const freqDiscInput = document.getElementById("freq-disciplina") as HTMLSelectElement;

    if (freqDataInput) {
      freqDataInput.addEventListener("change", () => carregarFrequenciaExistente(turma, container));
    }
    if (freqDiscInput) {
      freqDiscInput.addEventListener("change", () => carregarFrequenciaExistente(turma, container));
    }
  } catch (err: any) {
    console.error("Erro ao carregar alunos:", err);
    freqList.innerHTML =
      '<p class="error-text">Erro ao carregar alunos.</p>';
  }
}

export async function carregarFrequenciaExistente(
  turma: TurmaGroup,
  container: HTMLElement,
): Promise<void> {
  const freqList = container.querySelector(
    `.frequencia-list[data-turma-id="${turma.id || ""}"]`,
  ) as HTMLElement;
  if (!freqList) return;

  const freqDataInput = document.getElementById("freq-data") as HTMLInputElement;
  const freqDiscInput = document.getElementById("freq-disciplina") as HTMLSelectElement;

  const data = freqDataInput?.value;
  const disciplinaId = freqDiscInput?.value;

  if (!data || !disciplinaId) return;

  const { data: aula } = await supabase
    .from("aulas")
    .select("id")
    .eq("turma_disciplina_id", disciplinaId)
    .eq("data", data)
    .maybeSingle();

  if (!aula) return;

  const { data: registros } = await supabase
    .from("frequencia")
    .select("aluno_id")
    .eq("aula_id", aula.id);

  if (!registros || registros.length === 0) return;

  const ausentesIds = new Set(registros.map((r) => r.aluno_id));

  freqList.querySelectorAll(".freq-checkbox").forEach((cb) => {
    const alunoId = (cb as HTMLInputElement).getAttribute("data-aluno-id");
    if (alunoId && ausentesIds.has(alunoId)) {
      (cb as HTMLInputElement).checked = true;
    }
  });
}