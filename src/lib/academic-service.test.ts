import { describe, it, expect } from 'vitest'

describe('disciplinaTemEstagio (lógica de negócio)', () => {
  function disciplinaTemEstagio(disciplinaNome: string, modulo: string): boolean {
    if (modulo === 'I Módulo' || modulo === '1' || modulo?.toString().startsWith('1')) {
      return false
    }
    if (modulo === 'II Módulo' || modulo === '2' || modulo?.toString().startsWith('2')) {
      const nome = disciplinaNome.toLowerCase()
      if (nome.includes('farmacologia') || nome.includes('adm')) {
        return false
      }
      return true
    }
    return true
  }

  it('Módulo 1 não tem estágio - todas disciplinas', () => {
    expect(disciplinaTemEstagio('Psicologia Aplicada', 'I Módulo')).toBe(false)
    expect(disciplinaTemEstagio('Anatomia e Fisiologia Humana', '1')).toBe(false)
    expect(disciplinaTemEstagio('Nutrição e Dietética', 'I Módulo')).toBe(false)
    expect(disciplinaTemEstagio('Microbiologia e Parasitologia', '1')).toBe(false)
  })

  it('Módulo 2 - Farmacologia não tem estágio', () => {
    expect(disciplinaTemEstagio('Noções de Farmacologia', 'II Módulo')).toBe(false)
    expect(disciplinaTemEstagio('Farmacologia', '2')).toBe(false)
  })

  it('Módulo 2 - Adm não tem estágio', () => {
    expect(disciplinaTemEstagio('Noções de Adm. em Unidade de Enfermagem', 'II Módulo')).toBe(false)
    expect(disciplinaTemEstagio('Administração em Saúde', '2')).toBe(false)
  })

  it('Módulo 2 - outras disciplinas têm estágio', () => {
    expect(disciplinaTemEstagio('Enfermagem Médica', 'II Módulo')).toBe(true)
    expect(disciplinaTemEstagio('Enfermagem Cirúrgica', 'II Módulo')).toBe(true)
    expect(disciplinaTemEstagio('Introdução à Enfermagem', '2')).toBe(true)
  })

  it('Módulo 3 todos têm estágio', () => {
    expect(disciplinaTemEstagio('Enf. Materno Infantil', 'III Módulo')).toBe(true)
    expect(disciplinaTemEstagio('Enf. em Pronto Socorro', '3')).toBe(true)
    expect(disciplinaTemEstagio('Enf. em Saúde Pública', 'III Módulo')).toBe(true)
    expect(disciplinaTemEstagio('Enf. Neuro Psiquiátrica', 'III Módulo')).toBe(true)
  })
})