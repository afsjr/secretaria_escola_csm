import { ICONS } from '../../lib/icons'
import { AcademicService } from '../../lib/academic-service'
import { toast } from '../../lib/toast'
import { escapeHTML } from '../../lib/security'
import { disciplinaTemEstagio } from '../../lib/grades-utils'
import { extrairPerfilPrimeiro } from '../../lib/matricula-utils'

interface NotasEstagioTabProps {
  turmas: any[]
}

export function NotasEstagioTab({ turmas }: NotasEstagioTabProps): HTMLDivElement {
  const container = document.createElement('div')
  container.className = 'tab-notas-estagio animate-in'

  let modo: 'lote' | 'individual' = 'lote'
  let turmaIdSelecionada = ''
  let disciplinaBaseIdSelecionada = ''
  let alunosTurma: any[] = []
  let notasMap: Record<string, any> = {}

  const render = () => {
    container.innerHTML = `
      <div style="background: var(--white); padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        
        <!-- Header da Seção -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 1.25rem;">
          <div>
            <h3 style="margin: 0; font-size: 1.35rem; font-weight: 700; color: var(--text-main); display: flex; align-items: center; gap: 0.6rem;">
              <span style="color: var(--primary); display: flex; align-items: center;">${ICONS.clipboard}</span>
              Lançamento de Estágio Supervisionado
            </h3>
            <p style="margin: 0.3rem 0 0 0; color: var(--text-muted); font-size: 0.9rem;">
              Lançamento por lote (relatório do preceptor) e gestão por aluno.
            </p>
          </div>

          <!-- Modos de Lançamento em formato de Tabs Pill -->
          <div style="display: inline-flex; background: var(--secondary); padding: 4px; border-radius: var(--radius-md); gap: 4px;">
            <button id="btn-modo-lote" class="btn btn-sm" style="${modo === 'lote' ? 'background: var(--white); color: var(--primary); font-weight: 700; box-shadow: var(--shadow-sm);' : 'background: transparent; color: var(--text-muted);'}">
              Lançamento em Lote
            </button>
            <button id="btn-modo-individual" class="btn btn-sm" style="${modo === 'individual' ? 'background: var(--white); color: var(--primary); font-weight: 700; box-shadow: var(--shadow-sm);' : 'background: transparent; color: var(--text-muted);'}">
              Por Aluno (Individual)
            </button>
          </div>
        </div>

        <!-- MODO 1: LANÇAMENTO POR LOTE -->
        <div id="secao-lote" style="${modo === 'lote' ? 'display: block;' : 'display: none;'}">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="label" for="lote-turma-select">Selecione a Turma (Técnico):</label>
              <select id="lote-turma-select" class="input">
                <option value="">-- Escolha uma turma --</option>
                ${turmas.map(t => `<option value="${t.id}" ${t.id === turmaIdSelecionada ? 'selected' : ''}>${escapeHTML(t.nome)} (${escapeHTML(t.periodo)})</option>`).join('')}
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="label" for="lote-disciplina-select">Disciplina de Estágio:</label>
              <select id="lote-disciplina-select" class="input" ${!turmaIdSelecionada ? 'disabled' : ''}>
                <option value="">${turmaIdSelecionada ? '-- Escolha uma disciplina --' : 'Selecione primeiro uma turma'}</option>
              </select>
            </div>
          </div>

          <div id="lote-tabela-wrapper" style="display: none; margin-top: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
              <h4 style="margin: 0; font-size: 1.1rem; color: var(--text-main); font-weight: 600;">Lista de Alunos para Lançamento</h4>
              <button id="btn-salvar-lote-estagio" class="btn btn-primary">
                ${ICONS.save} Salvar Notas em Lote
              </button>
            </div>

            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Aluno</th>
                    <th style="width: 180px;">Nota de Estágio</th>
                    <th>Parecer do Preceptor</th>
                  </tr>
                </thead>
                <tbody id="tbody-lote-estagio">
                  <!-- Alunos renderizados dinamicamente -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- MODO 2: LANÇAMENTO INDIVIDUAL -->
        <div id="secao-individual" style="${modo === 'individual' ? 'display: block;' : 'display: none;'}">
          <div class="form-group">
            <label class="label" for="ind-turma-select">Selecione a Turma:</label>
            <select id="ind-turma-select" class="input">
              <option value="">-- Escolha uma turma --</option>
              ${turmas.map(t => `<option value="${t.id}">${escapeHTML(t.nome)} (${escapeHTML(t.periodo)})</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="label" for="ind-aluno-select">Selecione o Aluno:</label>
            <select id="ind-aluno-select" class="input" disabled>
              <option value="">-- Escolha um aluno --</option>
            </select>
          </div>

          <div class="form-group">
            <label class="label" for="ind-disciplina-select">Selecione a Disciplina:</label>
            <select id="ind-disciplina-select" class="input" disabled>
              <option value="">-- Escolha uma disciplina --</option>
            </select>
          </div>

          <div id="ind-content-area" style="margin-top: 1.5rem; display: none;"></div>
        </div>

      </div>
    `

    setupEvents()
  }

  const setupEvents = () => {
    // Alternância de modo
    container.querySelector('#btn-modo-lote')?.addEventListener('click', () => {
      modo = 'lote'
      render()
    })

    container.querySelector('#btn-modo-individual')?.addEventListener('click', () => {
      modo = 'individual'
      render()
    })

    // --- MODO LOTE ---
    const loteTurmaSelect = container.querySelector('#lote-turma-select') as HTMLSelectElement
    const loteDiscSelect = container.querySelector('#lote-disciplina-select') as HTMLSelectElement
    const btnSalvarLote = container.querySelector('#btn-salvar-lote-estagio') as HTMLButtonElement

    loteTurmaSelect?.addEventListener('change', async () => {
      turmaIdSelecionada = loteTurmaSelect.value
      disciplinaBaseIdSelecionada = ''
      container.querySelector('#lote-tabela-wrapper')!.style.display = 'none'

      if (!turmaIdSelecionada) {
        loteDiscSelect.disabled = true
        loteDiscSelect.innerHTML = '<option value="">Selecione primeiro uma turma</option>'
        return
      }

      toast.loading('Buscando disciplinas...')
      const { data } = await AcademicService.getDisciplinasDaTurma(turmaIdSelecionada)
      toast.dismissLoading()

      const disciplinas = data?.disciplinas || []
      if (disciplinas.length === 0) {
        loteDiscSelect.disabled = true
        loteDiscSelect.innerHTML = '<option value="">Nenhuma disciplina nesta turma</option>'
        return
      }

      loteDiscSelect.disabled = false
      loteDiscSelect.innerHTML = `
        <option value="">-- Escolha uma disciplina --</option>
        ${disciplinas.map(d => {
          const temEstagio = disciplinaTemEstagio(d.nome, d.modulo)
          const label = temEstagio
            ? `${escapeHTML(d.nome)} (${escapeHTML(d.modulo || 'Geral')})`
            : `${escapeHTML(d.nome)} (⚠️ Sem Estágio)`
          const disabled = !temEstagio ? 'disabled' : ''
          return `<option value="${d.disciplina_base_id}" ${disabled}>${label}</option>`
        }).join('')}
      `
    })

    loteDiscSelect?.addEventListener('change', async () => {
      disciplinaBaseIdSelecionada = loteDiscSelect.value
      const wrapper = container.querySelector('#lote-tabela-wrapper') as HTMLElement

      if (!turmaIdSelecionada || !disciplinaBaseIdSelecionada) {
        wrapper.style.display = 'none'
        return
      }

      toast.loading('Carregando alunos da turma...')
      const { data, error } = await AcademicService.getNotasCompletasTurma(turmaIdSelecionada, disciplinaBaseIdSelecionada)
      toast.dismissLoading()

      if (error || !data) {
        toast.error('Erro ao carregar dados dos alunos')
        return
      }

      alunosTurma = data.alunos || []
      notasMap = data.notasMap || {}

      const tbody = container.querySelector('#tbody-lote-estagio') as HTMLElement
      if (alunosTurma.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="padding: 2rem; text-align: center; color: var(--text-muted);">Nenhum aluno ativo cadastrado nesta turma.</td></tr>`
        wrapper.style.display = 'block'
        return
      }

      tbody.innerHTML = alunosTurma.map(m => {
        const perfil = extrairPerfilPrimeiro(m)
        const alunoId = perfil?.id || ''
        const alunoNome = perfil?.nome_completo || 'Aluno'
        const notaObj = notasMap[alunoId] || {}
        const notaValor = notaObj.nota_estagio ?? ''
        const parecerValor = notaObj.estagio_parecer ?? ''

        return `
          <tr data-aluno-id="${alunoId}">
            <td style="font-weight: 600; color: var(--text-main);">
              ${escapeHTML(alunoNome)}
            </td>
            <td>
              <input type="text" class="input input-nota-estagio" style="font-weight: 700; text-align: center;" 
                placeholder="Ex: 9.5 ou AP" value="${escapeHTML(String(notaValor))}">
            </td>
            <td>
              <input type="text" class="input input-parecer-estagio" 
                placeholder="Parecer do preceptor" value="${escapeHTML(String(parecerValor))}">
            </td>
          </tr>
        `
      }).join('')

      wrapper.style.display = 'block'
    })

    btnSalvarLote?.addEventListener('click', async () => {
      const rows = container.querySelectorAll('#tbody-lote-estagio tr')
      const items: { aluno_id: string; disciplina_base_id: string; nota: string | number; estagio_parecer?: string }[] = []

      rows.forEach(row => {
        const alunoId = row.getAttribute('data-aluno-id')
        if (!alunoId) return

        const inputNota = row.querySelector('.input-nota-estagio') as HTMLInputElement
        const inputParecer = row.querySelector('.input-parecer-estagio') as HTMLInputElement

        const valNota = inputNota?.value.trim()
        const valParecer = inputParecer?.value.trim()

        if (valNota !== undefined && valNota !== '') {
          const numNota = parseFloat(valNota.replace(',', '.'))
          const notaFinal = !isNaN(numNota) ? numNota : valNota.toUpperCase()

          items.push({
            aluno_id: alunoId,
            disciplina_base_id: disciplinaBaseIdSelecionada,
            nota: notaFinal,
            estagio_parecer: valParecer || undefined
          })
        }
      })

      if (items.length === 0) {
        toast.warning('Informe a nota de pelo menos um aluno para salvar.')
        return
      }

      toast.loading('Salvando notas de estágio em lote...')
      const { error } = await AcademicService.upsertNotaEstagioLote(items)
      toast.dismissLoading()

      if (error) {
        toast.error(`Erro ao salvar lote: ${error.message}`)
        return
      }

      toast.success('Notas de estágio registradas com sucesso em lote!')
    })

    // --- MODO INDIVIDUAL ---
    const indTurmaSelect = container.querySelector('#ind-turma-select') as HTMLSelectElement
    const indAlunoSelect = container.querySelector('#ind-aluno-select') as HTMLSelectElement
    const indDiscSelect = container.querySelector('#ind-disciplina-select') as HTMLSelectElement
    const indContentArea = container.querySelector('#ind-content-area') as HTMLElement

    indTurmaSelect?.addEventListener('change', async () => {
      const tId = indTurmaSelect.value
      indAlunoSelect.innerHTML = '<option value="">-- Escolha um aluno --</option>'
      indAlunoSelect.disabled = true
      indDiscSelect.innerHTML = '<option value="">-- Escolha uma disciplina --</option>'
      indDiscSelect.disabled = true
      indContentArea.style.display = 'none'

      if (!tId) return

      const { data: alunos } = await AcademicService.getAlunosDaTurma(tId)
      if (alunos && alunos.length > 0) {
        indAlunoSelect.innerHTML = '<option value="">-- Escolha um aluno --</option>' +
          alunos.map((m: any) => {
            const perfil = m.perfis
            return perfil ? `<option value="${perfil.id}">${escapeHTML(perfil.nome_completo)}</option>` : ''
          }).join('')
        indAlunoSelect.disabled = false
      }
    })

    indAlunoSelect?.addEventListener('change', async () => {
      const aId = indAlunoSelect.value
      const tId = indTurmaSelect.value
      indDiscSelect.innerHTML = '<option value="">-- Escolha uma disciplina --</option>'
      indDiscSelect.disabled = true
      indContentArea.style.display = 'none'

      if (!aId || !tId) return

      const { data: discRes } = await AcademicService.getDisciplinasDaTurma(tId)
      const disciplinas = discRes?.disciplinas || []

      if (disciplinas.length > 0) {
        indDiscSelect.innerHTML = '<option value="">-- Escolha uma disciplina --</option>' +
          disciplinas.map(d => {
            const temEstagio = disciplinaTemEstagio(d.nome, d.modulo)
            const label = temEstagio
              ? `${escapeHTML(d.nome)} (${escapeHTML(d.modulo || 'Geral')})`
              : `${escapeHTML(d.nome)} (⚠️ Sem Estágio)`
            const disabled = !temEstagio ? 'disabled' : ''
            return `<option value="${d.disciplina_base_id}" ${disabled}>${label}</option>`
          }).join('')
        indDiscSelect.disabled = false
      }
    })

    indDiscSelect?.addEventListener('change', async () => {
      const aId = indAlunoSelect.value
      const dId = indDiscSelect.value
      if (!aId || !dId) return

      const { data: boletim } = await AcademicService.getBoletim(aId)
      const notaObj = boletim?.find((b: any) => b.disciplina_base_id === dId)
      const notaAtual = notaObj?.nota_estagio ?? ''
      const parecerAtual = notaObj?.estagio_parecer ?? ''

      indContentArea.innerHTML = `
        <div style="background: var(--bg-app); padding: 1.5rem; border-radius: var(--radius-md); border-left: 4px solid var(--primary);">
          <h4 style="margin: 0 0 1rem 0; color: var(--text-main); font-weight: 600;">Lançamento Individual de Estágio</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; align-items: end;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="label">Nota (0-10 ou AP):</label>
              <input type="text" id="ind-nota-val" class="input" value="${escapeHTML(String(notaAtual))}">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="label">Parecer do Preceptor:</label>
              <input type="text" id="ind-parecer-val" class="input" value="${escapeHTML(String(parecerAtual))}">
            </div>
            <div>
              <button id="btn-salvar-ind-estagio" class="btn btn-primary" style="width: 100%;">
                ${ICONS.save} Salvar Nota
              </button>
            </div>
          </div>
        </div>
      `
      indContentArea.style.display = 'block'

      indContentArea.querySelector('#btn-salvar-ind-estagio')?.addEventListener('click', async () => {
        const nVal = (indContentArea.querySelector('#ind-nota-val') as HTMLInputElement).value.trim()
        const pVal = (indContentArea.querySelector('#ind-parecer-val') as HTMLInputElement).value.trim()

        if (!nVal) {
          toast.warning('Informe a nota de estágio.')
          return
        }

        const num = parseFloat(nVal.replace(',', '.'))
        const notaFinal = !isNaN(num) ? num : nVal.toUpperCase()

        toast.loading('Salvando nota de estágio...')
        const { error } = await AcademicService.upsertNotaEstagio(aId, dId, notaFinal, pVal || null)
        toast.dismissLoading()

        if (error) {
          toast.error(`Erro ao salvar: ${error.message}`)
        } else {
          toast.success('Nota de estágio salva com sucesso!')
        }
      })
    })
  }

  render()
  return container
}
