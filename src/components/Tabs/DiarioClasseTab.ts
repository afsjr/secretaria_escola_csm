import { ICONS } from '../../lib/icons'
import { AcademicService } from '../../lib/academic-service'
import { PDFService } from '../../lib/pdf-service'
import { toast } from '../../lib/toast'
import { escapeHTML } from '../../lib/security'

interface AulaRegistro {
  data: string
  conteudo: string
  professor_nome: string
}

interface DisciplinaDiario {
  disciplina_nome: string
  carga_horaria: number
  professor_nome: string
  aulas: AulaRegistro[]
  total_aulas: number
}

interface DiarioClasseTabProps {
  turmas: any[]
  profile: { id: string; perfil: string }
}

function podeGerarPDF(perfil: string): boolean {
  return perfil === 'master_admin' || perfil === 'admin' || perfil === 'secretaria'
}

export function DiarioClasseTab({ turmas, profile }: DiarioClasseTabProps): HTMLDivElement {
  const container = document.createElement('div')
  container.className = 'tab-diario-classe'

  const anoAtual = new Date().getFullYear()

  let resultadoData: any = null

  const render = () => {
    container.innerHTML = `
      <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        <h3 style="margin: 0 0 1rem 0; color: var(--text-main);">Diário de Classe</h3>
        <p style="margin: 0 0 1.5rem 0; color: var(--text-muted); font-size: 0.9rem;">
          Consulte as aulas registradas por disciplina e período. Documento oficial para arquivamento e conferência.
        </p>

        <div class="filtros" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div class="form-group">
            <label class="label" for="diario-turma-select">Turma:</label>
            <select id="diario-turma-select" class="input">
              <option value="">-- Selecione --</option>
              ${turmas.map(t => `<option value="${t.id}">${escapeHTML(t.nome)} (${escapeHTML(t.periodo)})</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="label" for="diario-data-inicio">Data Início:</label>
            <input type="date" id="diario-data-inicio" class="input" value="${anoAtual}-01-01">
          </div>
          <div class="form-group">
            <label class="label" for="diario-data-fim">Data Fim:</label>
            <input type="date" id="diario-data-fim" class="input" value="${anoAtual}-12-31">
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
          <button id="btn-consultar" class="btn btn-primary">${ICONS.search} Consultar</button>
          ${podeGerarPDF(profile.perfil) ? `
            <button id="btn-gerar-pdf" class="btn" style="background: #DC2626; color: white;">
              ${ICONS.file} Gerar PDF
            </button>
          ` : ''}
        </div>

        <div id="diario-resultado"></div>
      </div>
    `
  }

  const renderResultado = () => {
    const resultadoEl = container.querySelector('#diario-resultado') as HTMLElement
    if (!resultadoData || !resultadoData.disciplinas || resultadoData.disciplinas.length === 0) {
      resultadoEl.innerHTML = '<p style="color: var(--text-muted);">Nenhuma aula registrada neste período.</p>'
      return
    }

    resultadoEl.innerHTML = resultadoData.disciplinas.map((disc: DisciplinaDiario) => `
      <div style="margin-bottom: 1.5rem; border: 1px solid var(--secondary); border-radius: 8px; overflow: hidden;">
        <div style="background: var(--secondary); padding: 0.75rem 1rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 1rem;">${escapeHTML(disc.disciplina_nome)}</strong>
            <span style="font-size: 0.85rem; color: var(--text-muted); margin-left: 1rem;">
              Prof. ${escapeHTML(disc.professor_nome)}
            </span>
          </div>
          <span style="font-size: 0.85rem; color: var(--text-muted);">Total: ${disc.total_aulas} aulas</span>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8fafc; font-size: 0.8rem; text-transform: uppercase;">
              <th style="padding: 0.5rem; text-align: left; border-bottom: 1px solid var(--secondary);">Data</th>
              <th style="padding: 0.5rem; text-align: left; border-bottom: 1px solid var(--secondary);">Conteúdo</th>
            </tr>
          </thead>
          <tbody>
            ${disc.aulas.map((aula: AulaRegistro) => `
              <tr>
                <td style="padding: 0.5rem; border-bottom: 1px solid #f1f5f9; white-space: nowrap;">
                  ${formatDateBR(aula.data)}
                </td>
                <td style="padding: 0.5rem; border-bottom: 1px solid #f1f5f9;">
                  ${escapeHTML(aula.conteudo)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `).join('')
  }

  const formatDateBR = (data: string) => {
    if (!data) return ''
    const [ano, mes, dia] = data.split('-')
    return `${dia}/${mes}/${ano}`
  }

  const formatDateISO = (data: string) => {
    if (!data) return ''
    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) return data
    return data
  }

  render()

  container.querySelector('#btn-consultar')?.addEventListener('click', async () => {
    const selectTurma = container.querySelector('#diario-turma-select') as HTMLSelectElement
    const inputInicio = container.querySelector('#diario-data-inicio') as HTMLInputElement
    const inputFim = container.querySelector('#diario-data-fim') as HTMLInputElement

    if (!selectTurma.value) {
      toast.error('Selecione uma turma.')
      return
    }

    const btnConsultar = container.querySelector('#btn-consultar') as HTMLButtonElement
    btnConsultar.disabled = true
    btnConsultar.textContent = 'Consultando...'

    const { data, error } = await AcademicService.getAulasPorTurmaPeriodo(
      selectTurma.value,
      formatDateISO(inputInicio.value),
      formatDateISO(inputFim.value),
    )

    btnConsultar.disabled = false
    btnConsultar.innerHTML = `${ICONS.search} Consultar`

    if (error) {
      toast.error('Erro ao consultar: ' + error.message)
      return
    }

    resultadoData = data
    renderResultado()
  })

  container.querySelector('#btn-gerar-pdf')?.addEventListener('click', () => {
    if (!resultadoData || !resultadoData.disciplinas || resultadoData.disciplinas.length === 0) {
      toast.error('Consulte os dados antes de gerar o PDF.')
      return
    }

    const selectTurma = container.querySelector('#diario-turma-select') as HTMLSelectElement
    const inputInicio = container.querySelector('#diario-data-inicio') as HTMLInputElement
    const inputFim = container.querySelector('#diario-data-fim') as HTMLInputElement

    const turma = turmas.find(t => t.id === selectTurma.value)
    const periodoFormatado = `${formatDateBR(inputInicio.value)} a ${formatDateBR(inputFim.value)}`

    const diarioData = {
      ...resultadoData,
      turma_nome: turma?.nome || '',
      periodo: periodoFormatado,
      curso_nome: '',
    }

    const doc = PDFService.generateDiarioClassePDF(diarioData, {
      turma_nome: turma?.nome || '',
      periodo: turma?.periodo || '',
      curso_nome: '',
    })

    PDFService.downloadPDF(doc, `diario_classe_${(turma?.nome || 'turma').replace(/\s+/g, '_')}.pdf`)
  })

  return container
}
