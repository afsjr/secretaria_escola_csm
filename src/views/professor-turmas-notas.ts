import { AcademicService } from "../lib/academic-service";
import { ProfessorService } from "../lib/professor-service";
import { ICONS } from "../lib/icons";
import { supabase } from "../lib/supabase";
import { toast } from "../lib/toast";
import { escapeHTML } from "../lib/security";
import { arredondarNota, calcularMediaParcial, calcularNotaFinal, calcularStatusAluno } from "../lib/grades-utils";
import { extrairPerfilPrimeiro } from "../lib/matricula-utils";
import type { NotaExistente, TurmaGroup } from "./professor-turmas-types";
import { verificarAlertasBaixa } from "./professor-turmas-alertas";

export function renderLinhaAluno(aluno: any, notas: NotaExistente, mediaParcial: number): string {
  const mediaCalculada = calcularNotaFinal(mediaParcial, notas.rec || 0);
  const status = calcularStatusAluno(mediaCalculada);
  const statusClass = status === "Aprovado" ? "pt-status-ok" : "pt-status-fail";
  const recDisabled = mediaParcial >= 7 ? 'disabled title="Média já suficiente para aprovação direta"' : '';

  return `
    <tr data-aluno-id="${aluno?.id || ''}" class="pt-row">
      <td class="pt-td">
        <div class="aluno-nome pt-aluno-nome">${escapeHTML(aluno?.nome_completo || 'Aluno Desconhecido')}</div>
      </td>
      <td class="pt-td"><input type="number" class="input input-faltas pt-num-input" value="${notas.faltas || 0}" min="0"></td>
      <td class="pt-td"><input type="number" class="input input-n1 pt-num-input" value="${notas.n1 || 0}" min="0" max="10" step="0.1"></td>
      <td class="pt-td"><input type="number" class="input input-n2 pt-num-input" value="${notas.n2 || 0}" min="0" max="10" step="0.1"></td>
      <td class="pt-td"><input type="number" class="input input-n3 pt-num-input" value="${notas.n3 || 0}" min="0" max="10" step="0.1"></td>
      <td class="pt-td-hl media-cell" data-media>${mediaParcial > 0 ? mediaParcial.toFixed(1) : "-"}</td>
      <td class="pt-td"><input type="number" class="input input-rec pt-num-input" value="${notas.rec || 0}" min="0" max="10" step="0.1" ${recDisabled}></td>
      <td class="pt-td-hl final-cell" data-final>${mediaCalculada > 0 ? mediaCalculada.toFixed(1) : "-"}</td>
      <td class="pt-td-center status-cell" data-status>
        <span class="pt-status ${statusClass}">${escapeHTML(status)}</span>
      </td>
    </tr>
  `;
}

/**
 * Carrega alunos de uma disciplina e popula a tabela de notas
 */
export async function loadAlunosDaDisciplina(
  disc: any,
  turma: TurmaGroup,
  container: HTMLElement,
): Promise<void> {
  const disciplinaId = disc.id; // ID da oferta
  const disciplinaNome = disc.nome;
  const tbody = container.querySelector(
    `.notas-tbody[data-disciplina-id="${disciplinaId}"]`,
  ) as HTMLElement;
  if (!tbody) return;

  try {
    const turmaId = turma.id;
    if (!turmaId) {
      tbody.innerHTML =
        '<tr><td colspan="9" class="pt-td-empty">Turma não vinculada à disciplina.</td></tr>';
      return;
    }

    // Buscar alunos da turma
    const { data: matriculas, error } = await AcademicService.getAlunosDaTurma(
      turmaId,
    ) as { data: any[] | null; error: { message: string } | null };

    if (error || !matriculas || matriculas.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="9" class="pt-td-empty">Nenhum aluno matriculado.</td></tr>';
      return;
    }

    // Buscar notas existentes vinculadas ao disciplina_base_id
    const alunoIds = matriculas.map((m: any) => extrairPerfilPrimeiro(m)?.id).filter(Boolean);
    const { data: notasExistentes } = await supabase
      .from("boletim")
      .select("id, aluno_id, disciplina, versao, faltas, n1, n2, n3, rec, status")
      .in("aluno_id", alunoIds)
      .eq("disciplina_base_id", (disc as any).disciplina_base_id) as { data: NotaExistente[] | null };

    const notasMap: Record<string, NotaExistente> = {};
    notasExistentes?.forEach((n) => {
      notasMap[n.aluno_id] = n;
    });

    // Armazenar versões para uso no salvamento
    (window as any).__notasVersoes = (window as any).__notasVersoes || {};
    (window as any).__notasVersoes[(disc as any).id] = notasMap;

    // Filtrar alunos pendentes (matrícula tardia)
    const alunosPendentes = matriculas.filter((m: any) => {
      const aluno = extrairPerfilPrimeiro(m);
      return notasMap[aluno?.id]?.status === 'pendente';
    });

    tbody.innerHTML = matriculas
      .filter((m: any) => {
        if (m.status_aluno !== "ativo") return false;
        const aluno = extrairPerfilPrimeiro(m);
        return notasMap[aluno?.id]?.status !== 'pendente';
      })
      .map((m: any) => {
        const aluno = extrairPerfilPrimeiro(m);
        const notas = (notasMap[aluno?.id || ''] || {}) as NotaExistente;
        const mediaParcial = calcularMediaParcial(notas.n1 || 0, notas.n2 || 0, notas.n3 || 0);
        return renderLinhaAluno(aluno, notas, mediaParcial);
      }).join("");

    // Se há pendentes, adicionar alerta no cabeçalho da disciplina
    if (alunosPendentes.length > 0) {
      const alertaDiv = container.querySelector(`#alertas-${disciplinaId}`);
      if (alertaDiv) {
        alertaDiv.innerHTML = `<span class="pt-alerta-tardia">
          ⚠️ ${alunosPendentes.length} aluno(s) com matrícula tardia (Falta cursar)
        </span>`;
      }
    }

    // Add input listeners to recalculate media
    tbody.querySelectorAll("input").forEach((input) => {
      (input as HTMLInputElement).addEventListener(
        "input",
        () => recalcularMedia(tbody, disciplinaId, container),
      );
    });

    // Verificar alertas
    verificarAlertasBaixa(tbody, disciplinaId, container);
  } catch (err: any) {
    console.error("Erro ao carregar alunos:", err);
    tbody.innerHTML =
      '<tr><td colspan="9" class="pt-td-error">Erro ao carregar dados.</td></tr>';
  }
}

/**
 * Recalcula médias quando notas são alteradas
 */
export function recalcularMedia(tbody: HTMLElement, disciplinaId: string, container: HTMLElement = document.body): void {
  tbody.querySelectorAll("tr").forEach((row) => {
    const n1 =
      parseFloat((row.querySelector(".input-n1") as HTMLInputElement)?.value) ||
      0;
    const n2 =
      parseFloat((row.querySelector(".input-n2") as HTMLInputElement)?.value) ||
      0;
    const n3 =
      parseFloat((row.querySelector(".input-n3") as HTMLInputElement)?.value) ||
      0;
    const rec = parseFloat(
      (row.querySelector(".input-rec") as HTMLInputElement)?.value,
    ) || 0;

    const nfVal = rec || 0;
    const mediaParcial = arredondarNota(
      (parseFloat(n1.toString()) + parseFloat(n2.toString()) +
        parseFloat(n3.toString())) / 3,
    );
    const mediaCalculada = calcularNotaFinal(mediaParcial, nfVal);
    const status = calcularStatusAluno(mediaCalculada);

    const media = mediaParcial;
    const finalVal = mediaCalculada;

    const inputRec = row.querySelector(".input-rec") as HTMLInputElement;
    if (inputRec) {
      inputRec.disabled = media >= 7;
      if (media >= 7) {
        inputRec.title = "Média já suficiente para aprovação direta";
      } else {
        inputRec.title = "";
      }
    }

    const mediaCell = row.querySelector("[data-media]") as HTMLElement;
    const finalCell = row.querySelector("[data-final]") as HTMLElement;
    const statusCell = row.querySelector("[data-status]") as HTMLElement;

    if (mediaCell) {
      mediaCell.textContent = media > 0 ? media.toFixed(1) : "-";
      mediaCell.classList.toggle("pt-status-ok", media >= 7);
      mediaCell.classList.toggle("pt-status-fail", media < 7);
    }
    if (finalCell) {
      finalCell.textContent = finalVal > 0 ? finalVal.toFixed(1) : "-";
      finalCell.classList.toggle("pt-status-ok", finalVal >= 7);
      finalCell.classList.toggle("pt-status-fail", finalVal < 7);
    }
    if (statusCell) {
      statusCell.innerHTML =
        `<span class="pt-status ${
          status === "Aprovado" ? "pt-status-ok" : "pt-status-fail"
        }">${escapeHTML(status)}</span>`;
    }
  });

  verificarAlertasBaixa(tbody, disciplinaId, container);
}

/**
 * Liga os botões de salvar notas do container
 */
export function bindSalvarNotas(container: HTMLElement): void {
  container.querySelectorAll(".btn-salvar-notas").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const ofertaId = (btn as HTMLButtonElement).getAttribute("data-disciplina-id")!;
      const discBaseId = (btn as HTMLButtonElement).getAttribute("data-disciplina-base-id")!;

      const tbody = container.querySelector(
        `.notas-tbody[data-disciplina-id="${ofertaId}"]`,
      ) as HTMLElement;
      const rows = tbody.querySelectorAll("tr");

      const notasArray: any[] = [];
      rows.forEach((row) => {
        const alunoId = (row as HTMLElement).getAttribute("data-aluno-id");
        if (!alunoId) return;

        // Recuperar versão correta do mapa global usando o ID da oferta
        const notasVersoes = (window as any).__notasVersoes?.[ofertaId] || {};
        const notaExistente = notasVersoes[alunoId];

        const faltas = (row.querySelector(".input-faltas") as HTMLInputElement)?.value || "0";
        const n1 = (row.querySelector(".input-n1") as HTMLInputElement)?.value || "0";
        const n2 = (row.querySelector(".input-n2") as HTMLInputElement)?.value || "0";
        const n3 = (row.querySelector(".input-n3") as HTMLInputElement)?.value || "0";
        const rec = (row.querySelector(".input-rec") as HTMLInputElement)?.value || "0";

        notasArray.push({
          aluno_id: alunoId,
          faltas: parseFloat(faltas) || 0,
          n1: parseFloat(n1) || 0,
          n2: parseFloat(n2) || 0,
          n3: parseFloat(n3) || 0,
          rec: parseFloat(rec) || 0,
          versao: notaExistente?.versao ?? 1,
        });
      });

      (btn as HTMLButtonElement).disabled = true;
      (btn as HTMLButtonElement).textContent = "Salvando...";

      const { error } = await ProfessorService.salvarNotasEmLote(discBaseId, notasArray);
      (btn as HTMLButtonElement).disabled = false;
      (btn as HTMLButtonElement).innerHTML = `${ICONS.save} Salvar Notas`;

      if (error) {
        if (error.code === 'CONFLICT') {
          toast.error("Conflito de edição: alguns dados foram modificados por outro usuário. Recarregue a página.");
          setTimeout(() => window.location.reload(), 2000);
        } else {
          toast.error("Erro ao salvar notas: " + error.message);
        }
      } else {
        toast.success(`${notasArray.length} notas salvas com sucesso!`);
        // Verificar alertas de média baixa
        verificarAlertasBaixa(tbody, ofertaId, container);
      }
    });
  });
}