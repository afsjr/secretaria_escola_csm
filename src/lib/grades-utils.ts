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