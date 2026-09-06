import { AcademicService } from '../lib/academic-service'
import { toast } from '../lib/toast'
import { escapeHTML } from '../lib/security'
import { ICONS } from '../lib/icons'
import { disciplinaTemEstagio } from '../lib/grades-utils'

export class SecretariaEstagioLoteView {
  private container: HTMLElement
  private turmasTecnicas: any[] = []
  private selectedTurmaId: string = ''
  private disciplinaBaseId: string = ''
  private alunos: any[] = []
  private notasMap: Record<string, any> = {}

  constructor(container: HTMLElement) {
    this.container = container
  }

  async render(): Promise<void> {
    this.container.innerHTML = `
      <div class="animate-in" style="background: var(--white); padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem;">
          <div>
            <h2 style="margin: 0; display: flex; align-items: center; gap: 0.5rem; font-size: 1.5rem; color: var(--text-main);">
              <span style="color: var(--primary);">${ICONS.clipboard}</span>
              Lançamento de Estágio Supervisionado em Lote
            </h2>
            <p style="margin: 0.25rem 0 0 0; color: var(--text-muted); font-size: 0.9rem;">
              Envio em lote das notas de estágio enviadas pelos preceptores para turmas de Curso Técnico.
            </p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          <div class="form-group">
            <label class="label" for="select-turma-estagio">Selecione a Turma (Técnico):</label>
            <select id="select-turma-estagio" class="input">
              <option value="">Carregando turmas técnicas...</option>
            </select>
          </div>

          <div class="form-group">
            <label class="label" for="select-disciplina-estagio">Disciplina de Estágio:</label>
            <select id="select-disciplina-estagio" class="input" disabled>
              <option value="">Selecione primeiro uma turma</option>
            </select>
          </div>
        </div>

        <div id="estagio-tabela-container" style="display: none;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="margin: 0; font-size: 1.1rem; color: var(--text-main);">Alunos e Notas de Estágio</h3>
            <button id="btn-salvar-estagio-lote" class="btn btn-primary">
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
              <tbody id="tbody-estagio-lote">
                <!-- Inserido dinamicamente -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `

    await this.carregarTurmasTecnicas()
    this.setupEvents()
  }

  private async carregarTurmasTecnicas(): Promise<void> {
    toast.loading('Carregando turmas...')
    const { data: turmas } = await AcademicService.getTurmas()
    toast.dismissLoading()

    if (!turmas) {
      toast.error('Erro ao carregar turmas')
      return
    }

    const turmasTecnicas: any[] = []
    for (const t of turmas) {
      const tipo = await AcademicService.getTipoDaTurma(t.id)
      if (tipo === 'tecnico' || !tipo) {
        turmasTecnicas.push(t)
      }
    }

    this.turmasTecnicas = turmasTecnicas
    const selectTurma = this.container.querySelector('#select-turma-estagio') as HTMLSelectElement

    if (!selectTurma) return

    if (turmasTecnicas.length === 0) {
      selectTurma.innerHTML = '<option value="">Nenhuma turma do curso técnico encontrada</option>'
      return
    }

    selectTurma.innerHTML = `
      <option value="">-- Selecione uma Turma --</option>
      ${turmasTecnicas.map(t => `<option value="${t.id}">${escapeHTML(t.nome)} (${escapeHTML(t.periodo)})</option>`).join('')}
    `
  }

  private setupEvents(): void {
    const selectTurma = this.container.querySelector('#select-turma-estagio') as HTMLSelectElement
    const selectDisc = this.container.querySelector('#select-disciplina-estagio') as HTMLSelectElement
    const btnSalvar = this.container.querySelector('#btn-salvar-estagio-lote') as HTMLButtonElement

    selectTurma?.addEventListener('change', async () => {
      this.selectedTurmaId = selectTurma.value
      if (!this.selectedTurmaId) {
        selectDisc.disabled = true
        selectDisc.innerHTML = '<option value="">Selecione primeiro uma turma</option>'
        this.container.querySelector('#estagio-tabela-container')!.style.display = 'none'
        return
      }

      await this.carregarDisciplinas(this.selectedTurmaId)
    })

    selectDisc?.addEventListener('change', async () => {
      this.disciplinaBaseId = selectDisc.value
      if (!this.disciplinaBaseId) {
        this.container.querySelector('#estagio-tabela-container')!.style.display = 'none'
        return
      }

      await this.carregarNotasAlunos()
    })

    btnSalvar?.addEventListener('click', async () => {
      await this.salvarLote()
    })
  }

  private async carregarDisciplinas(turmaId: string): Promise<void> {
    toast.loading('Buscando disciplinas...')
    const { data } = await AcademicService.getDisciplinasDaTurma(turmaId)
    toast.dismissLoading()

    const selectDisc = this.container.querySelector('#select-disciplina-estagio') as HTMLSelectElement
    if (!selectDisc) return

    const disciplinas = data?.disciplinas || []
    if (disciplinas.length === 0) {
      selectDisc.disabled = true
      selectDisc.innerHTML = '<option value="">Nenhuma disciplina vinculada a esta turma</option>'
      return
    }

    selectDisc.disabled = false
    selectDisc.innerHTML = `
      <option value="">-- Selecione a Disciplina/Estágio --</option>
      ${disciplinas.map(d => {
        const temEstagio = disciplinaTemEstagio(d.nome, d.modulo)
        const label = temEstagio
          ? `${escapeHTML(d.nome)} (${escapeHTML(d.modulo || 'Geral')})`
          : `${escapeHTML(d.nome)} (⚠️ Sem Estágio)`
        const disabled = !temEstagio ? 'disabled' : ''
        return `<option value="${d.disciplina_base_id}" ${disabled}>${label}</option>`
      }).join('')}
    `
  }

  private async carregarNotasAlunos(): Promise<void> {
    if (!this.selectedTurmaId || !this.disciplinaBaseId) return

    toast.loading('Carregando alunos...')
    const { data, error } = await AcademicService.getNotasCompletasTurma(this.selectedTurmaId, this.disciplinaBaseId)
    toast.dismissLoading()

    if (error || !data) {
      toast.error('Erro ao carregar notas dos alunos')
      return
    }

    this.alunos = data.alunos || []
    this.notasMap = data.notasMap || {}

    const tbody = this.container.querySelector('#tbody-estagio-lote') as HTMLElement
    const containerTabela = this.container.querySelector('#estagio-tabela-container') as HTMLElement

    if (!tbody || !containerTabela) return

    if (this.alunos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; padding: 2rem; color: var(--text-muted);">Nenhum aluno ativo nesta turma.</td></tr>`
      containerTabela.style.display = 'block'
      return
    }

    tbody.innerHTML = this.alunos.map(m => {
      const perfil = Array.isArray(m.perfis) ? m.perfis[0] : m.perfis
      const alunoId = perfil?.id || ''
      const alunoNome = perfil?.nome_completo || 'Aluno'
      const notaObj = this.notasMap[alunoId] || {}
      const notaValor = notaObj.nota_estagio ?? ''
      const parecerValor = notaObj.estagio_parecer ?? ''

      return `
        <tr data-aluno-id="${alunoId}">
          <td>
            <div style="font-weight: 600; color: var(--text-main);">${escapeHTML(alunoNome)}</div>
          </td>
          <td>
            <input type="text" 
                   class="input input-nota-estagio" 
                   style="font-weight: 700; text-align: center;" 
                   placeholder="Ex: 9.5 ou AP" 
                   value="${escapeHTML(String(notaValor))}">
          </td>
          <td>
            <input type="text" 
                   class="input input-parecer-estagio" 
                   placeholder="Observações do preceptor" 
                   value="${escapeHTML(String(parecerValor))}">
          </td>
        </tr>
      `
    }).join('')

    containerTabela.style.display = 'block'
  }

  private async salvarLote(): Promise<void> {
    const rows = this.container.querySelectorAll('#tbody-estagio-lote tr')
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
          disciplina_base_id: this.disciplinaBaseId,
          nota: notaFinal,
          estagio_parecer: valParecer || undefined
        })
      }
    })

    if (items.length === 0) {
      toast.warning('Informe pelo menos uma nota de estágio para salvar.')
      return
    }

    toast.loading('Salvando notas de estágio em lote...')
    const { error } = await AcademicService.upsertNotaEstagioLote(items)
    toast.dismissLoading()

    if (error) {
      toast.error(`Falha ao salvar: ${error.message}`)
      return
    }

    toast.success('Notas de estágio registradas com sucesso em lote!')
    await this.carregarNotasAlunos()
  }
}
