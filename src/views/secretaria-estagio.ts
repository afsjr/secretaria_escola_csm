import { AcademicService } from '../lib/academic-service'
import { toast } from '../lib/toast'
import { escapeHTML } from '../lib/security'

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
      <div class="space-y-6">
        <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 class="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <span class="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                </span>
                Lançamento de Estágio Supervisionado em Lote
              </h2>
              <p class="text-slate-500 text-sm mt-1">
                Envio em lote das notas de estágio reportadas pelos preceptores para turmas do Curso Técnico.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">Selecione a Turma (Técnico)</label>
              <select id="select-turma-estagio" class="w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2.5 border">
                <option value="">Carregando turmas técnicas...</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1">Disciplina de Estágio</label>
              <select id="select-disciplina-estagio" class="w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2.5 border" disabled>
                <option value="">Selecione primeiro uma turma</option>
              </select>
            </div>
          </div>
        </div>

        <div id="estagio-tabela-container" class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hidden">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-slate-800">Alunos e Notas de Estágio</h3>
            <button id="btn-salvar-estagio-lote" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center gap-2 shadow-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Salvar Notas em Lote
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider">
                  <th class="py-3 px-4">Aluno</th>
                  <th class="py-3 px-4 w-40">Nota de Estágio</th>
                  <th class="py-3 px-4">Parecer do Preceptor</th>
                </tr>
              </thead>
              <tbody id="tbody-estagio-lote" class="divide-y divide-slate-200 text-sm">
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

    // Filtrar apenas turmas de curso técnico
    const turmasTecnicas: any[] = []
    for (const t of turmas) {
      const tipo = await AcademicService.getTipoDaTurma(t.id)
      if (tipo === 'tecnico' || !tipo) { // Permite por padrão se não especificado
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
        this.container.querySelector('#estagio-tabela-container')?.classList.add('hidden')
        return
      }

      await this.carregarDisciplinas(this.selectedTurmaId)
    })

    selectDisc?.addEventListener('change', async () => {
      this.disciplinaBaseId = selectDisc.value
      if (!this.disciplinaBaseId) {
        this.container.querySelector('#estagio-tabela-container')?.classList.add('hidden')
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
      ${disciplinas.map(d => `<option value="${d.disciplina_base_id}">${escapeHTML(d.nome)} (${escapeHTML(d.modulo || 'Geral')})</option>`).join('')}
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
      tbody.innerHTML = `<tr><td colspan="3" class="py-4 text-center text-slate-500">Nenhum aluno ativo nesta turma.</td></tr>`
      containerTabela.classList.remove('hidden')
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
        <tr class="hover:bg-slate-50 transition-colors" data-aluno-id="${alunoId}">
          <td class="py-3 px-4 font-medium text-slate-800">
            ${escapeHTML(alunoNome)}
          </td>
          <td class="py-3 px-4">
            <input type="text" 
                   class="input-nota-estagio w-full rounded border-slate-300 p-2 text-sm border focus:ring-emerald-500 focus:border-emerald-500" 
                   placeholder="Ex: 9.5 ou AP" 
                   value="${escapeHTML(String(notaValor))}">
          </td>
          <td class="py-3 px-4">
            <input type="text" 
                   class="input-parecer-estagio w-full rounded border-slate-300 p-2 text-sm border focus:ring-emerald-500 focus:border-emerald-500" 
                   placeholder="Observações do preceptor" 
                   value="${escapeHTML(String(parecerValor))}">
          </td>
        </tr>
      `
    }).join('')

    containerTabela.classList.remove('hidden')
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

    // Sinalização visual explícita com Toast Flutuante
    toast.success('Notas de estágio registradas com sucesso em lote!')

    // Recarregar dados
    await this.carregarNotasAlunos()
  }
}
