import { escapeHTML } from '../lib/security'
import type { IndicadorDisciplina, IndicadoresPedagogicosTurma } from '../types/domain'

const fmtNota = (valor: number | null): string => (valor === null ? '-' : valor.toFixed(1))
const fmtPct = (valor: number | null): string => (valor === null ? '-' : `${Math.round(valor)}%`)

function renderCard(titulo: string, valor: string, rodape: string, tipo: string): string {
  return `
    <article class="gt-indicador-card gt-indicador-card-${tipo}">
      <span class="gt-indicador-titulo">${escapeHTML(titulo)}</span>
      <strong class="gt-indicador-valor">${escapeHTML(valor)}</strong>
      <span class="gt-indicador-rodape">${escapeHTML(rodape)}</span>
    </article>
  `
}

function renderLinhaDisciplina(disciplina: IndicadorDisciplina): string {
  return `
    <tr>
      <td class="gt-indicadores-td-disciplina">${escapeHTML(disciplina.nome)}</td>
      <td>${escapeHTML(disciplina.modulo || '-')}</td>
      <td class="gt-indicadores-num">${fmtNota(disciplina.media)}</td>
      <td class="gt-indicadores-num">${fmtNota(disciplina.maior)}</td>
      <td class="gt-indicadores-num">${fmtNota(disciplina.menor)}</td>
      <td class="gt-indicadores-num">${fmtPct(disciplina.presenca_media)}</td>
    </tr>
  `
}

export function renderIndicadoresTurma(data: IndicadoresPedagogicosTurma | null): string {
  if (!data || data.total_alunos_ativos === 0 || data.total_disciplinas === 0) {
    return `
      <div class="gt-indicadores-vazio">
        <strong>Sem dados suficientes para calcular indicadores.</strong>
        <span>A turma precisa de alunos ativos e disciplinas ofertadas com boletim.</span>
      </div>
    `
  }

  if (data.media_geral === null && data.presenca_geral === null) {
    return `
      <div class="gt-indicadores-vazio">
        <strong>Nenhum boletim lançado para esta turma.</strong>
        <span>Os indicadores aparecem quando houver notas ou faltas registradas.</span>
      </div>
    `
  }

  return `
    <div class="gt-indicadores-grid">
      ${renderCard(
        'Média da turma',
        fmtNota(data.media_geral),
        `Maior ${fmtNota(data.media_maior)} · Menor ${fmtNota(data.media_menor)}`,
        'media',
      )}
      ${renderCard(
        'Presença',
        fmtPct(data.presenca_geral),
        `Maior ${fmtPct(data.presenca_maior)} · Menor ${fmtPct(data.presenca_menor)}`,
        'presenca',
      )}
      ${renderCard(
        'Alunos ativos',
        String(data.total_alunos_ativos),
        `${data.alunos_com_dados} com dados no cálculo`,
        'alunos',
      )}
      ${renderCard(
        'Disciplinas',
        String(data.total_disciplinas),
        'ofertadas na turma',
        'disciplinas',
      )}
    </div>

    <div class="gt-indicadores-tabela-wrap">
      <table class="gt-indicadores-tabela">
        <thead>
          <tr>
            <th>Disciplina</th>
            <th>Módulo</th>
            <th>Média</th>
            <th>Maior</th>
            <th>Menor</th>
            <th>Presença</th>
          </tr>
        </thead>
        <tbody>
          ${data.disciplinas.map(renderLinhaDisciplina).join('')}
        </tbody>
      </table>
    </div>
  `
}

export function renderErroIndicadores(mensagem: string): string {
  return `
    <div class="gt-indicadores-erro">
      <p>${escapeHTML(mensagem)}</p>
      <button type="button" class="btn btn-primary btn-recarregar-indicadores">
        Tentar novamente
      </button>
    </div>
  `
}
