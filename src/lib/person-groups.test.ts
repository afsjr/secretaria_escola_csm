import { describe, it, expect } from 'vitest'
import { agruparPorPessoa, normalizarNomeIdentidade } from './person-groups'

const CAMILLY = {
  id: 'cam-1',
  email: 'camilly@exemplo.com',
  nome_completo: 'CAMILLY MARIA DA SILVA',
  perfil: 'aluno' as const,
  cpf: '159.598.884-08',
}

describe('agruparPorPessoa (identidade da listagem de usuários)', () => {
  it('colapsa contas duplicadas da mesma pessoa com CPF NULL (caso CAMILLY da dedup de 22/09)', () => {
    const cam2 = { ...CAMILLY, id: 'cam-2', cpf: null as string | undefined }
    const grupos = agruparPorPessoa([CAMILLY, cam2])

    expect(grupos).toHaveLength(1)
    expect(grupos[0].ids).toHaveLength(2)
    expect(grupos[0].ids).toEqual(['cam-1', 'cam-2'])
    expect(grupos[0].cpfConflitante).toBe(false)
  })

  it('colapsa contas da mesma pessoa com CPFs não-nulos distintos e marca CPFs divergentes', () => {
    const maria1 = {
      id: 'm1', email: 'm1@x.com', nome_completo: 'MARIA BEATRIZ SOUZA', perfil: 'aluno' as const, cpf: '111.444.777-35',
    }
    const maria2 = {
      id: 'm2', email: 'm2@x.com', nome_completo: 'MARIA BEATRIZ SOUZA', perfil: 'aluno' as const, cpf: '529.982.247-25',
    }
    const maria3 = {
      id: 'm3', email: 'm3@x.com', nome_completo: 'MARIA BEATRIZ SOUZA', perfil: 'aluno' as const, cpf: '120.069.054-06',
    }
    const grupos = agruparPorPessoa([maria1, maria2, maria3])

    expect(grupos).toHaveLength(1)
    expect(grupos[0].ids).toHaveLength(3)
    expect(grupos[0].cpfConflitante).toBe(true)
  })

  it('NUNCA funde só pelo CPF: Gessica e Iara (mesmo CPF, nomes distintos) seguem 2 grupos', () => {
    const gessica = {
      id: 'g1', email: 'g@x.com', nome_completo: 'GESSICA OLIVEIRA', perfil: 'aluno' as const, cpf: '108.908.174-05',
    }
    const iara = {
      id: 'i1', email: 'i@x.com', nome_completo: 'IARA OLIVEIRA', perfil: 'aluno' as const, cpf: '108.908.174-05',
    }
    const grupos = agruparPorPessoa([gessica, iara])

    expect(grupos).toHaveLength(2)
  })

  it('NUNCA funde só pelo CPF: ANDREIA e ANDREA (falso-negativo seguro) seguem 2 grupos', () => {
    const andreia = {
      id: 'a1', email: 'a1@x.com', nome_completo: 'ANDREIA FRANCO', perfil: 'aluno' as const, cpf: '120.069.054-06',
    }
    const andrea = {
      id: 'a2', email: 'a2@x.com', nome_completo: 'ANDREA FRANCO', perfil: 'aluno' as const, cpf: '120.069.054-06',
    }
    const grupos = agruparPorPessoa([andreia, andrea])

    expect(grupos).toHaveLength(2)
  })

  it('normaliza acento/caixa/espaço duplo, e fallback: nome vazio -> email; ambos vazios -> id', () => {
    const joao = {
      id: 'j1', email: 'j@x.com', nome_completo: 'João  da  Silva', perfil: 'aluno' as const, cpf: '529.982.247-25',
    }
    const joaoAlt = {
      id: 'j2', email: 'joao@x.com', nome_completo: 'JOAO DA SILVA', perfil: 'aluno' as const, cpf: '529.982.247-25',
    }
    const semNome = {
      id: 's1', email: 'SO-SOBRE-NOME@x.com', nome_completo: '', perfil: 'aluno' as const, cpf: '529.982.247-25',
    }
    const semNomeIgual = {
      id: 's2', email: 'so-sobre-nome@x.com', nome_completo: '', perfil: 'aluno' as const, cpf: null as string | undefined,
    }
    const semNada = {
      id: 'z1', email: '', nome_completo: '', perfil: 'aluno' as const, cpf: null as string | undefined,
    }

    const grupos = agruparPorPessoa([joao, joaoAlt, semNome, semNomeIgual, semNada])

    expect(normalizarNomeIdentidade('João  da  Silva')).toBe('joao da silva')
    expect(grupos).toHaveLength(3)
    expect(grupos[0].ids).toHaveLength(2)
    expect(grupos[0].nomeExibido).toBe('João  da  Silva')
    expect(grupos[1].ids).toEqual(['s1', 's2'])
    expect(grupos[2].ids).toEqual(['z1'])
    expect(grupos[2].nomeExibido).toBe('(sem nome)')
  })

  it('mesmo nome em perfis diferentes não se funde (aluno x professor)', () => {
    const comoAluno = {
      id: 'p1', email: 'p@x.com', nome_completo: 'PAULO RIBEIRO', perfil: 'aluno' as const, cpf: '529.982.247-25',
    }
    const comoProfessor = {
      id: 'p2', email: 'p@x.com', nome_completo: 'PAULO RIBEIRO', perfil: 'professor' as const, cpf: '529.982.247-25',
    }
    const grupos = agruparPorPessoa([comoAluno, comoProfessor])

    expect(grupos).toHaveLength(2)
  })

  it('Total = Σ grupos, não o número de perfis', () => {
    const duplicado = { ...CAMILLY, id: 'cam-3', cpf: null as string | undefined }
    const grupos = agruparPorPessoa([CAMILLY, duplicado, { ...CAMILLY, id: 'cam-4' }])

    expect(grupos.length).toBe(1)
    expect(grupos[0].ids).toHaveLength(3)
    expect(grupos.length).not.toBe(3)
  })
})