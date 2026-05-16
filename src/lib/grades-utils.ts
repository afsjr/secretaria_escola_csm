/**
 * Utilitários para lógica de notas e estágios
 */

/**
 * Define se uma disciplina permite o lançamento de nota de estágio
 * Regra de Negócio: 
 * - 1º Módulo: Não possui estágio
 * - 2º Módulo: Possui estágio, exceto para disciplinas teóricas específicas (Farmacologia, ADM)
 * - 3º Módulo+: Todas possuem estágio
 */
export function disciplinaTemEstagio(disciplinaNome: string, modulo: string | null | undefined): boolean {
  if (!modulo) return false
  
  const moduloStr = modulo.toString().trim()
  
  // 1º Módulo nunca tem estágio
  if (moduloStr === 'I Módulo' || moduloStr === '1' || moduloStr.startsWith('1')) {
    return false
  }
  
  // 2º Módulo tem restrições
  if (moduloStr === 'II Módulo' || moduloStr === '2' || moduloStr.startsWith('2')) {
    const nome = disciplinaNome.toLowerCase()
    if (nome.includes('farmacologia') || nome.includes('adm')) {
      return false
    }
    return true
  }
  
  // Módulos superiores (3 em diante) sempre têm estágio
  return true
}

/**
 * Arredonda a nota para múltiplos de 0.5 conforme regra:
 * X.1 até X.4 => X.5
 * X.6 até X.9 => (X+1).0
 */
export function arredondarNota(nota: number | undefined): number {
  if (!nota || nota <= 0) return 0
  const inteiro = Math.floor(nota)
  const decimal = nota - inteiro

  if (decimal === 0) return nota
  if (decimal > 0 && decimal <= 0.4) return inteiro + 0.5
  if (decimal > 0.4 && decimal <= 0.5) return inteiro + 0.5
  return inteiro + 1.0
}

/**
 * Calcula a média parcial (média das 3 notas)
 */
export function calcularMediaParcial(n1: number, n2: number, n3: number): number {
  if (n1 === 0 && n2 === 0 && n3 === 0) return 0
  return (n1 + n2 + n3) / 3
}

/**
 * Calcula a nota final considerando recuperação
 */
export function calcularNotaFinal(mediaParcial: number, rec: number): number {
  if (mediaParcial >= 7) return arredondarNota(mediaParcial)
  if (rec <= 0) return arredondarNota(mediaParcial)
  const notaComRec = (mediaParcial + rec) / 2
  return arredondarNota(notaComRec)
}

/**
 * Retorna status do aluno baseado na nota final
 */
export function calcularStatusAluno(final: number): string {
  if (final >= 6) return 'Aprovado'
  return 'Reprovado'
}