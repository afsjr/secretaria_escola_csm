import { ICONS } from "../lib/icons";
import { supabase } from "../lib/supabase";
import { PDFService } from "../lib/pdf-service";
import { toast } from "../lib/toast";
import { arredondarNota, calcularMediaParcial, calcularNotaFinal, calcularStatusAluno } from "../lib/grades-utils";

/**
 * Liga os botões de exportação PDF do container
 */
export function bindExportPdfButtons(container: HTMLElement): void {
  container.querySelectorAll(".btn-export-pdf").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const disciplinaId = (btn as HTMLButtonElement).getAttribute(
        "data-disciplina-id",
      )!;
      const disciplinaNome = (btn as HTMLButtonElement).getAttribute(
        "data-disciplina-nome",
      )!;
      (btn as HTMLButtonElement).disabled = true;
      (btn as HTMLButtonElement).textContent = "Gerando...";

      try {
        // Buscar todos os alunos com notas desta disciplina
        const tbody = container.querySelector(
          `.notas-tbody[data-disciplina-id="${disciplinaId}"]`,
        ) as HTMLElement;
        const rows = tbody.querySelectorAll("tr");

        const notasData: any[] = [];
        rows.forEach((row) => {
          const alunoId = (row as HTMLElement).getAttribute("data-aluno-id");
          if (!alunoId) return;

          const nome =
            (row.querySelector(".aluno-nome") as HTMLElement)?.textContent ||
            "Aluno";
          const faltas =
            (row.querySelector(".input-faltas") as HTMLInputElement)?.value ||
            "0";
          const n1 =
            (row.querySelector(".input-n1") as HTMLInputElement)?.value || "0";
          const n2 =
            (row.querySelector(".input-n2") as HTMLInputElement)?.value || "0";
          const n3 =
            (row.querySelector(".input-n3") as HTMLInputElement)?.value || "0";
          const rec =
            (row.querySelector(".input-rec") as HTMLInputElement)?.value || "0";

          const n1Val = parseFloat(n1) || 0;
          const n2Val = parseFloat(n2) || 0;
          const n3Val = parseFloat(n3) || 0;
          const recVal = parseFloat(rec) || 0;

          const mediaParcial = arredondarNota(calcularMediaParcial(n1Val, n2Val, n3Val));
          const finalVal = calcularNotaFinal(mediaParcial, recVal);
          const status = calcularStatusAluno(finalVal);

          notasData.push({
            nome,
            disciplina: disciplinaNome,
            modulo: "Módulo Atual",
            faltas: parseFloat(faltas) || 0,
            n1: n1Val,
            n2: n2Val,
            n3: n3Val,
            rec: recVal,
            media_parcial: mediaParcial,
            media: finalVal,
            status,
          });
        });

        // Buscar dados da turma
        const { data: oferta } = await supabase
          .from("turma_disciplinas")
          .select("id, turmas(id, nome, periodo, cursos(id, nome))")
          .eq("id", disciplinaId)
          .single();

        const turmaInfo = (oferta as any)?.turmas
          ? {
            turma_nome: (oferta as any).turmas.nome,
            periodo: (oferta as any).turmas.periodo,
            curso_nome: (oferta as any).turmas.cursos?.nome ||
              "Curso Técnico",
          }
          : null;

        // Gerar PDF consolidado
        const alunosRelatorio = notasData.map((n: any) => ({
          nome: n.nome,
          faltas: n.faltas,
          n1: n.n1,
          n2: n.n2,
          n3: n.n3,
          rec: n.rec,
          media_parcial: n.media_parcial,
          media_final: n.media,
          status: n.status,
        }));

        const doc = await PDFService.generateRelatorioNotasDisciplinaPDF(
          disciplinaNome,
          turmaInfo ||
            {
              turma_nome: disciplinaNome,
              periodo: "-",
              curso_nome: "Curso Técnico",
            },
          alunosRelatorio,
        );

        PDFService.downloadPDF(
          doc,
          `notas_${disciplinaNome.replace(/\s+/g, "_")}.pdf`,
        );
        toast.success("PDF exportado com sucesso!");
      } catch (err: any) {
        console.error("Erro ao gerar PDF:", err);
        toast.error("Erro ao gerar PDF");
      }

      (btn as HTMLButtonElement).disabled = false;
      (btn as HTMLButtonElement).innerHTML = `${ICONS.file} PDF`;
    });
  });
}