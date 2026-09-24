import { describe, it, expect } from 'vitest'
import { agruparPorPessoa, normalizarNomeIdentidade } from './person-groups'

const PESSOA_ALFA = {
  id: 'perfil-alfa-1',
  email: 'pessoa.alfa@exemplo.test',
  nome_completo: 'PESSOA ALFA DE TESTE',
  perfil: 'aluno' as const,
  cpf: '111.444.777-35',
}

describe('agruparPorPessoa (identidade da listagem de usuários)', () => {
  it('colapsa contas duplicadas da mesma pessoa quando uma tem CPF NULL', () => {
    const alfa2 = { ...PESSOA_ALFA, id: 'perfil-alfa-2', cpf: null as string | undefined }
    const grupos = agruparPorPessoa([PESSOA_ALFA, alfa2])

    expect(grupos).toHaveLength(1)
    expect(grupos[0].ids).toHaveLength(2)
    expect(grupos[0].ids).toEqual(['perfil-alfa-1', 'perfil-alfa-2'])
    expect(grupos[0].cpfConflitante).toBe(false)
  })

  it('colapsa contas da mesma pessoa com CPFs não-nulos distintos e marca CPFs divergentes', () => {
    const beta1 = {
      id: 'perfil-beta-1', email: 'beta1@exemplo.test', nome_completo: 'PESSOA BETA DE TESTE', perfil: 'aluno' as const, cpf: '111.444.777-35',
    }
    const beta2 = {
      id: 'perfil-beta-2', email: 'beta2@exemplo.test', nome_completo: 'PESSOA BETA DE TESTE', perfil: 'aluno' as const, cpf: '529.982.247-25',
    }
    const beta3 = {
      id: 'perfil-beta-3', email: 'beta3@exemplo.test', nome_completo: 'PESSOA BETA DE TESTE', perfil: 'aluno' as const, cpf: '123.456.789-09',
    }
    const grupos = agruparPorPessoa([beta1, beta2, beta3])

    expect(grupos).toHaveLength(1)
    expect(grupos[0].ids).toHaveLength(3)
    expect(grupos[0].cpfConflitante).toBe(true)
  })

  it('NUNCA funde só pelo CPF: nomes distintos com o mesmo CPF seguem 2 grupos', () => {
    const gama = {
      id: 'perfil-gama-1', email: 'gama@exemplo.test', nome_completo: 'PESSOA GAMA DE TESTE', perfil: 'aluno' as const, cpf: '111.444.777-35',
    }
    const delta = {
      id: 'perfil-delta-1', email: 'delta@exemplo.test', nome_completo: 'PESSOA DELTA DE TESTE', perfil: 'aluno' as const, cpf: '111.444.777-35',
    }
    const grupos = agruparPorPessoa([gama, delta])

    expect(grupos).toHaveLength(2)
  })

  it('NUNCA funde só pelo CPF: nomes com 1 letra de diferença seguem 2 grupos', () => {
    const andreia = {
      id: 'perfil-x1', email: 'x1@exemplo.test', nome_completo: 'PESSOA XAVIER DE TESTE', perfil: 'aluno' as const, cpf: '390.533.447-05',
    }
    const andrea = {
      id: 'perfil-x2', email: 'x2@exemplo.test', nome_completo: 'PESSOA XAVER DE TESTE', perfil: 'aluno' as const, cpf: '390.533.447-05',
    }
    const grupos = agruparPorPessoa([andreia, andrea])

    expect(grupos).toHaveLength(2)
  })

  it('normaliza acento/caixa/espaço duplo, e fallback: nome vazio -> email; ambos vazios -> id', () => {
    const pessoa = {
      id: 'perfil-nome-1', email: 'pessoa.nome@exemplo.test', nome_completo: 'Pessoa  de  Teste', perfil: 'aluno' as const, cpf: '529.982.247-25',
    }
    const pessoaAlt = {
      id: 'perfil-nome-2', email: 'outro@exemplo.test', nome_completo: 'PESSOA DE TESTE', perfil: 'aluno' as const, cpf: '529.982.247-25',
    }
    const semNome = {
      id: 'perfil-sem-nome-1', email: 'SO-SOBRE-NOME@exemplo.test', nome_completo: '', perfil: 'aluno' as const, cpf: '529.982.247-25',
    }
    const semNomeIgual = {
      id: 'perfil-sem-nome-2', email: 'so-sobre-nome@exemplo.test', nome_completo: '', perfil: 'aluno' as const, cpf: null as string | undefined,
    }
    const semNada = {
      id: 'perfil-sem-nada-1', email: '', nome_completo: '', perfil: 'aluno' as const, cpf: null as string | undefined,
    }

    const grupos = agruparPorPessoa([pessoa, pessoaAlt, semNome, semNomeIgual, semNada])

    expect(normalizarNomeIdentidade('Pessoa  de  Teste')).toBe('pessoa de teste')
    expect(grupos).toHaveLength(3)
    expect(grupos[0].ids).toHaveLength(2)
    expect(grupos[0].nomeExibido).toBe('Pessoa  de  Teste')
    expect(grupos[1].ids).toEqual(['perfil-sem-nome-1', 'perfil-sem-nome-2'])
    expect(grupos[2].ids).toEqual(['perfil-sem-nada-1'])
    expect(grupos[2].nomeExibido).toBe('(sem nome)')
  })

  it('mesmo nome em perfis diferentes não se funde (aluno x professor)', () => {
    const comoAluno = {
      id: 'perfil-duplo-1', email: 'duplo@exemplo.test', nome_completo: 'PESSOA DUPLA DE TESTE', perfil: 'aluno' as const, cpf: '529.982.247-25',
    }
    const comoProfessor = {
      id: 'perfil-duplo-2', email: 'duplo@exemplo.test', nome_completo: 'PESSOA DUPLA DE TESTE', perfil: 'professor' as const, cpf: '529.982.247-25',
    }
    const grupos = agruparPorPessoa([comoAluno, comoProfessor])

    expect(grupos).toHaveLength(2)
  })

  it('Total = Σ grupos, não o número de perfis', () => {
    const duplicado = { ...PESSOA_ALFA, id: 'perfil-alfa-3', cpf: null as string | undefined }
    const grupos = agruparPorPessoa([PESSOA_ALFA, duplicado, { ...PESSOA_ALFA, id: 'perfil-alfa-4' }])

    expect(grupos.length).toBe(1)
    expect(grupos[0].ids).toHaveLength(3)
    expect(grupos.length).not.toBe(3)
  })
})