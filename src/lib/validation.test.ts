import { describe, it, expect } from 'vitest'
import { 
  loginSchema, 
  signupSchema, 
  turmaSchema, 
  noteSchema,
  validateLogin, 
  validateSignup, 
  validateTurma,
  validateNota 
} from '../lib/validation'

describe('Validation - Login Schema', () => {
  it('deve validar login válido', () => {
    const result = validateLogin({ email: 'teste@email.com', password: 'senha123' })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar email vazio', () => {
    const result = validateLogin({ email: '', password: 'senha123' })
    expect(result.success).toBe(false)
    expect(result.errors).toContain('E-mail é obrigatório')
  })

  it('deve rejeitar email inválido', () => {
    const result = validateLogin({ email: 'nao-e-email', password: 'senha123' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar senha vazia', () => {
    const result = validateLogin({ email: 'teste@email.com', password: '' })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar senha menor que 8 caracteres', () => {
    const result = validateLogin({ email: 'teste@email.com', password: '1234567' })
    expect(result.success).toBe(false)
  })
})

describe('Validation - Signup Schema', () => {
  it('deve validar signup válido', () => {
    const result = validateSignup({
      nomeCompleto: 'João Silva',
      email: 'joao@email.com',
      password: 'senha123'
    })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar nome menor que 3 caracteres', () => {
    const result = validateSignup({
      nomeCompleto: 'Jo',
      email: 'joao@email.com',
      password: 'senha123'
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar email inválido', () => {
    const result = validateSignup({
      nomeCompleto: 'João Silva',
      email: 'invalid',
      password: 'senha123'
    })
    expect(result.success).toBe(false)
  })

  it('deve validar CPF opcional vazio', () => {
    const result = validateSignup({
      nomeCompleto: 'João Silva',
      email: 'joao@email.com',
      password: 'senha123',
      cpf: ''
    })
    expect(result.success).toBe(true)
  })

  it('deve validar telefone opcional', () => {
    const result = validateSignup({
      nomeCompleto: 'João Silva',
      email: 'joao@email.com',
      password: 'senha123',
      telefone: '(11) 99999-9999'
    })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar telefone inválido', () => {
    const result = validateSignup({
      nomeCompleto: 'João Silva',
      email: 'joao@email.com',
      password: 'senha123',
      telefone: '123'
    })
    expect(result.success).toBe(false)
  })
})

describe('Validation - Turma Schema', () => {
  it('deve validar turma válida', () => {
    const result = validateTurma({
      nome: 'Turma A',
      periodo: '2024.1'
    })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar nome vazio', () => {
    const result = validateTurma({
      nome: '',
      periodo: '2024.1'
    })
    expect(result.success).toBe(false)
  })

  it('deve rejects nome muito longo', () => {
    const result = validateTurma({
      nome: 'a'.repeat(101),
      periodo: '2024.1'
    })
    expect(result.success).toBe(false)
  })
})

describe('Validation - Nota Schema', () => {
  it('deve validar nota válida', () => {
    const result = validateNota({
      disciplina: 'Matemática',
      n1: 8,
      n2: 7,
      n3: 9,
      rec: 0,
      faltas: 2
    })
    expect(result.success).toBe(true)
  })

  it('deve rejeitar nota maior que 10', () => {
    const result = validateNota({
      disciplina: 'Matemática',
      n1: 15,
      n2: 7,
      n3: 9,
      rec: 0,
      faltas: 2
    })
    expect(result.success).toBe(false)
  })

  it('deve rejeitar nota negativa', () => {
    const result = validateNota({
      disciplina: 'Matemática',
      n1: -1,
      n2: 7,
      n3: 9,
      rec: 0,
      falhas: 2
    })
    expect(result.success).toBe(false)
  })

  it('deve aceitar string para nota', () => {
    const result = validateNota({
      disciplina: 'Matemática',
      n1: '8',
      n2: 7,
      n3: 9,
      rec: 0,
      faltas: 2
    })
    expect(result.success).toBe(true)
  })
})

describe('Validation - CPF', () => {
  it('deve validar CPF válido (sem pontuação)', () => {
    // CPF válido de teste: 11144477735 (válido segundo algoritmo)
    const result = validateSignup({
      nomeCompleto: 'Teste',
      email: 'teste@email.com',
      password: 'senha123',
      cpf: '11144477735'
    })
    expect(result.success).toBe(true)
  })

  it('deve aceitar CPF vazio', () => {
    const result = validateSignup({
      nomeCompleto: 'Teste',
      email: 'teste@email.com',
      password: 'senha123',
      cpf: ''
    })
    expect(result.success).toBe(true)
  })
})