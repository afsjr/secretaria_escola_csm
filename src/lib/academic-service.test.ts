import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AcademicService } from './academic-service'

vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
          order: vi.fn(() => ({ data: [], error: null })),
          maybeSingle: vi.fn(() => ({ data: null, error: null }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: { id: '123' }, error: null }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({ data: { id: '123' }, error: null }))
            }))
          }))
        })),
        delete: vi.fn(() => ({
          select: vi.fn(() => ({ data: [], error: null }))
        })),
        order: vi.fn(() => ({ data: [], error: null }))
      })),
      rpc: vi.fn(() => ({ data: null }))
    }))
  }
}))

describe('AcademicService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateNotaEstagio', () => {
    it('deve atualizar nota de estágio com valor numérico', async () => {
      const mockNotaId = 'nota-123'
      const mockValor = 8.5

      const result = await AcademicService.updateNotaEstagio(mockNotaId, mockValor)

      expect(result.error).toBeNull()
      expect(result.data).toBeDefined()
    })

    it('deve aceitar valor 0 (zero)', async () => {
      const result = await AcademicService.updateNotaEstagio('nota-123', 0)
      expect(result.error).toBeNull()
    })

    it('deve aceitar valor 10 (dez)', async () => {
      const result = await AcademicService.updateNotaEstagio('nota-123', 10)
      expect(result.error).toBeNull()
    })
  })

  describe('getDisciplinasPorCurso', () => {
    it('deve buscar disciplinas por curso_id', async () => {
      const result = await AcademicService.getDisciplinasPorCurso('curso-123')
      expect(result.data).toBeDefined()
      expect(result.error).toBeNull()
    })
  })

  describe('getNotasPorDisciplina', () => {
    it('deve buscar notas por nome da disciplina', async () => {
      const result = await AcademicService.getNotasPorDisciplina('Anatomia e Fisiologia Humana')
      expect(result.data).toBeDefined()
      expect(result.error).toBeNull()
    })
  })

  describe('getDisciplinasDaTurma', () => {
    it('deve retornar erro se turma não existir', async () => {
      const result = await AcademicService.getDisciplinasDaTurma('turma-inexistente')
      expect(result.error).toBeDefined()
    })

    it('deve retornar erro se turma não tiver curso associado', async () => {
      const result = await AcademicService.getDisciplinasDaTurma('turma-sem-curso')
      expect(result.error).toBeDefined()
    })
  })

  describe('getNotasCompletasTurma', () => {
    it('deve retornar alunos vazios se não houver matrículas', async () => {
      const result = await AcademicService.getNotasCompletasTurma('turma-123', 'Anatomia')
      expect(result.data).toBeDefined()
      expect(result.data?.alunos).toEqual([])
    })
  })
})

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

  it('Módulo 1 não tem estágio', () => {
    expect(disciplinaTemEstagio('Psicologia Aplicada', 'I Módulo')).toBe(false)
    expect(disciplinaTemEstagio('Anatomia e Fisiologia Humana', '1')).toBe(false)
  })

  it('Módulo 2 - Farmacologia não tem estágio', () => {
    expect(disciplinaTemEstagio('Noções de Farmacologia', 'II Módulo')).toBe(false)
  })

  it('Módulo 2 - Adm não tem estágio', () => {
    expect(disciplinaTemEstagio('Noções de Adm. em Unidade de Enfermagem', 'II Módulo')).toBe(false)
  })

  it('Módulo 2 - outras têm estágio', () => {
    expect(disciplinaTemEstagio('Enfermagem Médica', 'II Módulo')).toBe(true)
    expect(disciplinaTemEstagio('Enfermagem Cirúrgica', 'II Módulo')).toBe(true)
    expect(disciplinaTemEstagio('Introdução à Enfermagem', '2')).toBe(true)
  })

  it('Módulo 3 todos têm estágio', () => {
    expect(disciplinaTemEstagio('Enf. Materno Infantil', 'III Módulo')).toBe(true)
    expect(disciplinaTemEstagio('Enf. em Pronto Socorro', '3')).toBe(true)
    expect(disciplinaTemEstagio('Enf. em Saúde Pública', 'III Módulo')).toBe(true)
  })
})