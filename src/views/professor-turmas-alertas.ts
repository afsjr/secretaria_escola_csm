import { escapeHTML } from "../lib/security";
import type { AlunoBaixaMedia } from "./professor-turmas-types";

export function verificarAlertasBaixa(
  tbody: HTMLElement,
  disciplinaId: string,
  container: HTMLElement = document.body,
): void {
  const alertasDiv = container.querySelector(`#alertas-${disciplinaId}`) as HTMLElement | null;
  if (!alertasDiv) return;

  const alunosBaixa: AlunoBaixaMedia[] = [];
  tbody.querySelectorAll("tr").forEach((row) => {
    const finalCell = row.querySelector("[data-final]") as HTMLElement;
    if (!finalCell) return;

    const texto = finalCell.textContent;
    const final = parseFloat(texto || "");
    if (!isNaN(final) && final < 7 && final > 0) {
      const nome =
        (row.querySelector(".aluno-nome") as HTMLElement)?.textContent ||
        "Aluno";
      alunosBaixa.push({ nome, media: final });
    }
  });

  if (alunosBaixa.length > 0) {
    alertasDiv.innerHTML = `
      <span class="pt-alerta-baixa-titulo">⚠️ ${alunosBaixa.length} aluno(s) com média baixa:</span>
      ${
      alunosBaixa.map((a) =>
        `<span class="pt-alerta-nome">${
          escapeHTML(a.nome)
        } (${a.media.toFixed(1)})</span>`
      ).join(", ")
    }
    `;
  } else {
    alertasDiv.innerHTML =
      '<span class="pt-alerta-ok">✅ Todos os alunos com média adequada</span>';
  }
}