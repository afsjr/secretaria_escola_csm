import { describe, it, expect } from 'vitest'
import { renderErroIndicadores, renderIndicadoresTurma } from './gestao-turmas-indicadores'
import type { IndicadoresPedagogicosTurma } from '../types/domain'

function dadosBase(): IndicadoresPedagogicosTurma {
  return {
    turma_id: 't1',
    turma_nome: 'Técnico A',
    periodo: '2026.1',
    tipo_curso: 'tecnico',
    total_alunos_ativos: 2,
    alunos_com_dados: 2,
    total_disciplinas: 2,
    media_geral: 6.3,
    media_maior: 6.5,
    media_menor: 6,
    presenca_geral: 90,
    presenca_maior: 95,
    presenca_menor: 85,
    disciplinas: [
      {
        disciplina_base_id: 'd1',
        nome: 'Anatomia',
        modulo: 'I',
        carga_horaria: 40,
        media: 6.5,
        maior: 7,
        menor: 6,
        presenca_media: 80,
        alunos_com_nota: 2,
        alunos_com_boletim: 2,
      },
      {
        disciplina_base_id: 'd2',
        nome: 'Farmacologia',
        modulo: 'II',
        carga_horaria: 40,
        media: null,
        maior: null,
        menor: null,
        presenca_media: 100,
        alunos_com_nota: 0,
        alunos_com_boletim: 2,
      },
    ],
  }
}

describe('renderIndicadoresTurma', () => {
  it('renderiza cards, ranges e tabela por disciplina', () => {
    const html = renderIndicadoresTurma(dadosBase())

    expect(html).toContain('Média da turma')
    expect(html).toContain('6.3')
    expect(html).toContain('Maior 6.5')
    expect(html).toContain('Menor 6.0')
    expect(html).toContain('Presença')
    expect(html).toContain('90%')
    expect(html).toContain('Maior 95%')
    expect(html).toContain('Menor 85%')
    expect(html).toContain('Anatomia')
    expect(html).toContain('Farmacologia')
    expect(html).toContain('80%')
    expect(html).toContain('100%')
  })

  it('exibe traço quando a disciplina não tem nota', () => {
    const html = renderIndicadoresTurma(dadosBase())
    expect(html).toContain('<td class="gt-indicadores-num">-</td>')
  })

  it('exibe estado vazio quando não há alunos ou disciplinas', () => {
    expect(renderIndicadoresTurma(null)).toContain('Sem dados suficientes')
    expect(renderIndicadoresTurma({ ...dadosBase(), total_alunos_ativos: 0 })).toContain('Sem dados suficientes')
    expect(renderIndicadoresTurma({ ...dadosBase(), total_disciplinas: 0 })).toContain('Sem dados suficientes')
  })

  it('exibe estado vazio quando não há boletim', () => {
    const html = renderIndicadoresTurma({
      ...dadosBase(),
      media_geral: null,
      media_maior: null,
      media_menor: null,
      presenca_geral: null,
      presenca_maior: null,
      presenca_menor: null,
    })
    expect(html).toContain('Nenhum boletim lançado')
  })
})

describe('renderErroIndicadores', () => {
  it('escapa a mensagem e oferece tentar novamente', () => {
    const html = renderErroIndicadores('<script>alert("x")</script>')

    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('Tentar novamente')
  })
})
