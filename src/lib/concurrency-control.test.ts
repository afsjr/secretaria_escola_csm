import { describe, it, expect } from 'vitest'
import { isConcurrencyError, getConflictMessage } from './concurrency-control'

describe('concurrency-control - isConcurrencyError', () => {
  it('deve retornar true para código CONFLICT', () => {
    expect(isConcurrencyError({ code: 'CONFLICT' })).toBe(true)
  })

  it('deve retornar true para código PGRST116', () => {
    expect(isConcurrencyError({ code: 'PGRST116' })).toBe(true)
  })

  it('deve retornar false para outros códigos de erro', () => {
    expect(isConcurrencyError({ code: '23505' })).toBe(false)
    expect(isConcurrencyError({ code: '42501' })).toBe(false)
    expect(isConcurrencyError({ code: '42P01' })).toBe(false)
  })

  it('deve retornar false para erro sem código', () => {
    expect(isConcurrencyError({ message: 'Erro qualquer' })).toBe(false)
  })

  it('deve retornar false para null', () => {
    expect(isConcurrencyError(null)).toBe(false)
  })

  it('deve retornar false para undefined', () => {
    expect(isConcurrencyError(undefined)).toBe(false)
  })

  it('deve retornar false para objeto vazio', () => {
    expect(isConcurrencyError({})).toBe(false)
  })
})

describe('concurrency-control - getConflictMessage', () => {
  it('deve retornar mensagem de conflito para código CONFLICT', () => {
    const msg = getConflictMessage({ code: 'CONFLICT' })
    expect(msg).toContain('modificados por outro usuário')
    expect(msg).toContain('recarregue')
  })

  it('deve retornar mensagem de conflito para código PGRST116', () => {
    const msg = getConflictMessage({ code: 'PGRST116' })
    expect(msg).toContain('modificados por outro usuário')
  })

  it('deve retornar mensagem do erro para outros erros', () => {
    const msg = getConflictMessage({ message: 'Erro de permissão', code: '42501' })
    expect(msg).toBe('Erro de permissão')
  })

  it('deve retornar mensagem padrão para erro sem mensagem', () => {
    const msg = getConflictMessage({ code: '500' })
    expect(msg).toBe('Erro desconhecido.')
  })

  it('deve retornar mensagem do erro mesmo sem código', () => {
    const msg = getConflictMessage({ message: 'Algo deu errado' })
    expect(msg).toBe('Algo deu errado')
  })
})

describe('Cenários de Uso - Conflito de Edição', () => {
  it('Cenário 1: Dois usuários editando o mesmo registro', () => {
    expect(isConcurrencyError({ code: 'PGRST116' })).toBe(true)
  })

  it('Cenário 2: Secretaria e admin editando dados do aluno', () => {
    const msg = getConflictMessage({ code: 'CONFLICT' })
    expect(msg).toContain('recarregue')
  })

  it('Cenário 3: Erro de banco diferente de conflito', () => {
    const msg = getConflictMessage({ code: '23505', message: 'CPF duplicado' })
    expect(msg).toBe('CPF duplicado')
  })
})
