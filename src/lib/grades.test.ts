/**
 * Testes para Funções de Cálculo de Notas
 *
 * Funções de lógica de notas e médias utilizadas no sistema.
 */

import { describe, it, expect } from 'vitest'

/**
 * Arredonda a nota para múltiplos de 0.5 conforme regra:
 * X.1 até X.4 => X.5
 * X.6 até X.9 => (X+1).0
 *
 * @example
 * 7.3 => 7.5
 * 7.7 => 8.0
 * 7.5 => 7.5
 * 7.0 => 7.0
 */
function arredondarNota(nota: number | undefined): number {
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
function calcularMediaParcial(n1: number, n2: number, n3: number): number {
  if (n1 === 0 && n2 === 0 && n3 === 0) return 0
  return (n1 + n2 + n3) / 3
}

/**
 * Calcula a nota final considerando recuperação
 * Se média >= 7, approved direto
 * Se média < 7, usa (média + rec) / 2
 * Usa arredondarNota para garantir múltiplos de 0.5
 */
function calcularNotaFinal(mediaParcial: number, rec: number): number {
  if (mediaParcial >= 7) return arredondarNota(mediaParcial)
  if (rec <= 0) return arredondarNota(mediaParcial)
  const notaComRec = (mediaParcial + rec) / 2
  return arredondarNota(notaComRec)
}

/**
 * Retorna status do aluno baseado na nota final
 * Aprovado: nota final >= 6
 * Reprovado: nota final < 6
 */
function calcularStatus(final: number): string {
  if (final >= 6) return 'Aprovado'
  return 'Reprovado'
}

// =====================================================
// TESTES: arredondarNota
// =====================================================
describe('arredondarNota', () => {
  // Casos de decimais .0 (inteiros)
  it('deve retornar 7.0 para nota 7.0 (inteiro)', () => {
    expect(arredondarNota(7.0)).toBe(7.0)
  })

  it('deve retornar 5.0 para nota 5.0 (inteiro)', () => {
    expect(arredondarNota(5.0)).toBe(5.0)
  })

  it('deve retornar 10.0 para nota 10.0 (inteiro)', () => {
    expect(arredondarNota(10.0)).toBe(10.0)
  })

  // Casos de decimais entre .1 e .4 => .5
  it('deve arredondar 7.1 para 7.5', () => {
    expect(arredondarNota(7.1)).toBe(7.5)
  })

  it('deve arredondar 7.2 para 7.5', () => {
    expect(arredondarNota(7.2)).toBe(7.5)
  })

  it('deve arredondar 7.3 para 7.5', () => {
    expect(arredondarNota(7.3)).toBe(7.5)
  })

  it('deve arredondar 7.4 para 7.5', () => {
    expect(arredondarNota(7.4)).toBe(7.5)
  })

  // Casos de decimais entre .5 => .5
  it('deve retornar 7.5 para nota 7.5 (ja arredondado)', () => {
    expect(arredondarNota(7.5)).toBe(7.5)
  })

  // Casos de decimais entre .6 e .9 => próximo inteiro
  it('deve arredondar 7.6 para 8.0', () => {
    expect(arredondarNota(7.6)).toBe(8.0)
  })

  it('deve arredondar 7.7 para 8.0', () => {
    expect(arredondarNota(7.7)).toBe(8.0)
  })

  it('deve arredondar 7.8 para 8.0', () => {
    expect(arredondarNota(7.8)).toBe(8.0)
  })

  it('deve arredondar 7.9 para 8.0', () => {
    expect(arredondarNota(7.9)).toBe(8.0)
  })

  // Casos limites
  it('deve retornar 0 para undefined', () => {
    expect(arredondarNota(undefined)).toBe(0)
  })

  it('deve retornar 0 para nota null', () => {
    expect(arredondarNota(null as any)).toBe(0)
  })

  it('deve retornar 0 para nota 0', () => {
    expect(arredondarNota(0)).toBe(0)
  })

  it('deve retornar 0 para nota negativa', () => {
    expect(arredondarNota(-5)).toBe(0)
  })

  // Casos especiais de fronteira
  it('deve arredondar 6.4 para 6.5', () => {
    expect(arredondarNota(6.4)).toBe(6.5)
  })

  it('deve arredondar 6.5 para 6.5', () => {
    expect(arredondarNota(6.5)).toBe(6.5)
  })

  it('deve arredondar 6.6 para 7.0', () => {
    expect(arredondarNota(6.6)).toBe(7.0)
  })

  // Casos com números maiores
  it('deve arredondar 9.3 para 9.5', () => {
    expect(arredondarNota(9.3)).toBe(9.5)
  })

  it('deve arredondar 9.7 para 10.0', () => {
    expect(arredondarNota(9.7)).toBe(10.0)
  })

  it('deve arredondar 10.3 para 10.5', () => {
    expect(arredondarNota(10.3)).toBe(10.5)
  })

  // Não deve ultrapassar 10
  it('deve arredondar 9.9 para 10.0 (limite máximo)', () => {
    expect(arredondarNota(9.9)).toBe(10.0)
  })
})

// =====================================================
// TESTES: calcularMediaParcial
// =====================================================
describe('calcularMediaParcial', () => {
  it('deve calcular média simples de 3 notas', () => {
    expect(calcularMediaParcial(7, 8, 9)).toBe(8)
  })

  it('deve calcular média com decimais', () => {
    const media = calcularMediaParcial(7, 8, 8)
    expect(media).toBeCloseTo(7.67, 1) // Usar proximidade em vez de igualdade exata
  })

  it('deve retornar 0 quando todas notas sao 0', () => {
    expect(calcularMediaParcial(0, 0, 0)).toBe(0)
  })

  it('deve calcular corretamente com notas perto de 10', () => {
    expect(calcularMediaParcial(10, 10, 10)).toBe(10)
  })
})

// =====================================================
// TESTES: calcularNotaFinal
// =====================================================
describe('calcularNotaFinal', () => {
  it('deve retornar média direta se >= 7 (aprovação direta)', () => {
    expect(calcularNotaFinal(7.5, 0)).toBe(7.5)
  })

  it('deve retornar média se < 7 mas sem recuperação', () => {
    expect(calcularNotaFinal(6.5, 0)).toBe(6.5)
  })

  it('deve calcular média com recuperação se < 7', () => {
    expect(calcularNotaFinal(5.0, 7.0)).toBe(6)
  })

  it('deve arredondar resultado da recuperação', () => {
    expect(calcularNotaFinal(5.0, 8.0)).toBe(6.5)
  })

  it('deve retornar 0 para média 0', () => {
    expect(calcularNotaFinal(0, 0)).toBe(0)
  })
})

// =====================================================
// TESTES: calcularStatus
// =====================================================
describe('calcularStatus', () => {
  it('deve retornar Aprovado para nota >= 6', () => {
    expect(calcularStatus(6)).toBe('Aprovado')
    expect(calcularStatus(7)).toBe('Aprovado')
    expect(calcularStatus(10)).toBe('Aprovado')
  })

  it('deve retornar Reprovado para nota < 6', () => {
    expect(calcularStatus(5.9)).toBe('Reprovado')
    expect(calcularStatus(5)).toBe('Reprovado')
    expect(calcularStatus(0)).toBe('Reprovado')
  })

  it('deve retornar Aprovado para nota exatamente 6', () => {
    expect(calcularStatus(6)).toBe('Aprovado')
  })
})

// =====================================================
// TESTES: Integração - Cenários Reais
// =====================================================
describe('Cenários Reais de Notas', () => {
  it('cenario 1: aluno aprovado direto (media >= 7)', () => {
    // 7 + 8 + 9 = 24 / 3 = 8
    const media = calcularMediaParcial(7, 8, 9)
    const roundedMedia = arredondarNota(media)
    const final = calcularNotaFinal(roundedMedia, 0)
    const status = calcularStatus(final)

    expect(media).toBe(8)
    expect(roundedMedia).toBe(8)
    expect(final).toBe(8)
    expect(status).toBe('Aprovado')
  })

  it('cenario 2: aluno em recuperação (media < 7)', () => {
    // 5 + 6 + 5 = 16 / 3 = 5.33...
    const media = calcularMediaParcial(5, 6, 5)
    const roundedMedia = arredondarNota(media)
    const final = calcularNotaFinal(roundedMedia, 7)
    const status = calcularStatus(final)

    expect(roundedMedia).toBe(5.5)
    expect(final).toBe(6.5) // Agora usa arredondarNota, então 6.25 -> 6.5
    expect(status).toBe('Aprovado')
  })

  it('cenario 3: aluno reprovado mesmo com recuperaç��o', () => {
    const media = calcularMediaParcial(4, 5, 4)
    const roundedMedia = arredondarNota(media)
    const final = calcularNotaFinal(roundedMedia, 5)
    const status = calcularStatus(final)

    expect(roundedMedia).toBe(4.5)
    expect(final).toBe(5)
    expect(status).toBe('Reprovado')
  })

  it('cenario 4: nota maxima', () => {
    const media = calcularMediaParcial(10, 10, 10)
    const roundedMedia = arredondarNota(media)
    const final = calcularNotaFinal(roundedMedia, 10)
    const status = calcularStatus(final)

    expect(media).toBe(10)
    expect(roundedMedia).toBe(10)
    expect(final).toBe(10)
    expect(status).toBe('Aprovado')
  })
})