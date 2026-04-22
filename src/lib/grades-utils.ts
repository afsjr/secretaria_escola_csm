export function arredondarNota(nota: number | undefined): number {
  if (!nota || nota <= 0) return 0
  const inteiro = Math.floor(nota)
  const decimal = nota - inteiro

  if (decimal === 0) return nota
  if (decimal > 0 && decimal <= 0.4) return inteiro + 0.5
  if (decimal > 0.4 && decimal <= 0.5) return inteiro + 0.5
  return inteiro + 1.0
}

export function calcularStatusAluno(mediaParcial: number, notaRec: number): { status: string; mediaCalculada: number } {
  if (mediaParcial >= 7) {
    return { status: "Aprovado", mediaCalculada: mediaParcial }
  }
  const mediaCalculada = arredondarNota((mediaParcial + notaRec) / 2)
  return {
    status: mediaCalculada >= 6 ? "Aprovado" : "Reprovado",
    mediaCalculada
  }
}

export function calcularMediaParcial(n1: number, n2: number, n3: number): number {
  return arredondarNota((n1 + n2 + n3) / 3)
}