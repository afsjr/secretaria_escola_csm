import { describe, it, expect } from 'vitest'
import { extrairPerfilPrimeiro } from './matricula-utils'

describe('extrairPerfilPrimeiro', () => {
  it('deve retornar o primeiro item quando perfis é array', () => {
    const matricula = { perfis: [{ id: 'a1', nome: 'Ana' }, { id: 'a2', nome: 'Bruno' }] }
    expect(extrairPerfilPrimeiro(matricula)).toEqual({ id: 'a1', nome: 'Ana' })
  })

  it('deve retornar o próprio objeto quando perfis é objeto único', () => {
    const perfis = { id: 'a1', nome: 'Ana' }
    expect(extrairPerfilPrimeiro({ perfis })).toEqual(perfis)
  })

  it('deve retornar undefined quando perfis é array vazio', () => {
    expect(extrairPerfilPrimeiro({ perfis: [] })).toBeUndefined()
  })

  it('deve retornar undefined quando perfis não existe', () => {
    expect(extrairPerfilPrimeiro({ id: 'a1' })).toBeUndefined()
  })
})