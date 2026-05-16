import { AcademicService } from '../../lib/academic-service'
import { disciplinaTemEstagio } from '../../lib/grades-utils'
import { toast } from '../../lib/toast'
import { escapeHTML } from '../../lib/security'

interface NotasEstagioTabProps {
  turmas: any[]
}

export function NotasEstagioTab({ turmas }: NotasEstagioTabProps): HTMLDivElement {
  const container = document.createElement('div')
  container.className = 'tab-notas-estagio'
  
  // Estado local do componente
  let disciplinasDaTurmaAtual: any[] = []
  let boletimCache: any[] | null = null

  const renderContent = () => `
    <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
      <h3 style="margin: 0 0 1rem 0; color: var(--text-main);">Notas de Estágio</h3>
      <p style="margin: 0 0 1.5rem 0; color: var(--text-muted); font-size: 0.9rem;">Lançar notas de estágio (0-10) por disciplina para alunos aptos.</p>
      
      <div class="form-group">
        <label class="label" for="notas-turma-select">Selecione a Turma:</label>
        <select id="notas-turma-select" class="input">
          <option value="">-- Escolha uma turma --</option>
          ${turmas.map(t => `<option value="${t.id}">${escapeHTML(t.nome)} (${escapeHTML(t.periodo)})</option>`).join('')}
        </select>
      </div>
      
      <div class="form-group">
        <label class="label" for="notas-aluno-select">Selecione o Aluno:</label>
        <select id="notas-aluno-select" class="input" disabled>
          <option value="">-- Escolha um aluno --</option>
        </select>
      </div>
      
      <div class="form-group">
        <label class="label" for="notas-disciplina-select">Selecione a Disciplina:</label>
        <select id="notas-disciplina-select" class="input" disabled>
          <option value="">-- Escolha uma disciplina --</option>
        </select>
      </div>
      
      <button id="btn-carregar-notas" class="btn btn-primary" disabled>📋 Carregar Estágio</button>
      
      <div id="notas-content" style="margin-top: 1.5rem; display: none;">
        <!-- Area de lançamento de nota -->
      </div>
    </div>
  `

  container.innerHTML = renderContent()

  // Seletores
  const turmaSelect = container.querySelector('#notas-turma-select') as HTMLSelectElement
  const alunoSelect = container.querySelector('#notas-aluno-select') as HTMLSelectElement
  const disciplinaSelect = container.querySelector('#notas-disciplina-select') as HTMLSelectElement
  const btnCarregar = container.querySelector('#btn-carregar-notas') as HTMLButtonElement
  const contentArea = container.querySelector('#notas-content') as HTMLElement

  // Handlers
  turmaSelect.addEventListener('change', async () => {
    const turmaId = turmaSelect.value
    
    // Reset cascata
    alunoSelect.innerHTML = '<option value="">-- Escolha um aluno --</option>'
    alunoSelect.disabled = true
    disciplinaSelect.innerHTML = '<option value="">-- Escolha uma disciplina --</option>'
    disciplinaSelect.disabled = true
    btnCarregar.disabled = true
    contentArea.style.display = 'none'
    disciplinasDaTurmaAtual = []
    boletimCache = null

    if (!turmaId) return

    try {
      const [alunosResult, disciplinasResult] = await Promise.all([
        AcademicService.getAlunosDaTurma(turmaId),
        AcademicService.getDisciplinasDaTurma(turmaId)
      ])

      if (disciplinasResult.data?.disciplinas) {
        disciplinasDaTurmaAtual = disciplinasResult.data.disciplinas
      }

      const alunosTurma = alunosResult.data
      if (alunosTurma && alunosTurma.length > 0) {
        alunoSelect.innerHTML = '<option value="">-- Escolha um aluno --</option>' +
          alunosTurma.map((m: any) => {
            const perfil = m.perfis
            return perfil ? `<option value="${perfil.id}">${escapeHTML(perfil.nome_completo)}</option>` : ''
          }).join('')
        alunoSelect.disabled = false
      } else {
        alunoSelect.innerHTML = '<option value="">Nenhum aluno nesta turma</option>'
      }
    } catch (err) {
      toast.error('Erro ao carregar dados da turma')
    }
  })

  alunoSelect.addEventListener('change', async () => {
    const alunoId = alunoSelect.value
    disciplinaSelect.innerHTML = '<option value="">-- Escolha uma disciplina --</option>'
    disciplinaSelect.disabled = true
    btnCarregar.disabled = true
    contentArea.style.display = 'none'
    boletimCache = null

    if (!alunoId) return

    try {
      const { data: notasAluno } = await AcademicService.getBoletim(alunoId)
      boletimCache = notasAluno

      if (disciplinasDaTurmaAtual.length > 0) {
        disciplinaSelect.innerHTML = '<option value="">-- Escolha uma disciplina --</option>' +
          disciplinasDaTurmaAtual.map(d => {
            const permite = disciplinaTemEstagio(d.nome, d.modulo)
            const sufixo = permite ? '' : ' (⚠️ Sem Estágio)'
            return `<option value="${d.disciplina_base_id}" data-nome="${escapeHTML(d.nome)}" data-permite="${permite}">${escapeHTML(d.nome)}${sufixo}</option>`
          }).join('')
        disciplinaSelect.disabled = false
      } else {
        disciplinaSelect.innerHTML = '<option value="">Turma sem disciplinas cadastradas</option>'
      }
    } catch (err) {
      toast.error('Erro ao carregar boletim do aluno')
    }
  })

  disciplinaSelect.addEventListener('change', () => {
    const option = disciplinaSelect.selectedOptions[0]
    const permite = option?.getAttribute('data-permite') === 'true'
    btnCarregar.disabled = !disciplinaSelect.value || !permite
    
    if (disciplinaSelect.value && !permite) {
      toast.warning('Esta disciplina não possui estágio (Módulo 1 ou Teórica).')
    }
  })

  btnCarregar.addEventListener('click', () => {
    const discBaseId = disciplinaSelect.value
    const nomeDisciplina = disciplinaSelect.selectedOptions[0]?.getAttribute('data-nome') || ''
    const alunoId = alunoSelect.value
    if (!discBaseId || !alunoId) return

    const notaExistente = boletimCache?.find((n: any) => n.disciplina_base_id === discBaseId)
    const notaEstagio = notaExistente?.nota_estagio ?? ''

    contentArea.innerHTML = `
      <div style="background: var(--secondary); padding: 1.5rem; border-radius: 8px; border-left: 4px solid var(--primary);">
        <p style="margin: 0 0 1rem 0; font-weight: 600; color: var(--text-main);">Lançamento para: ${escapeHTML(nomeDisciplina)}</p>
        <div style="display: flex; gap: 1rem; align-items: center;">
          <label style="font-weight: 500;">Nota de Estágio:</label>
          <input type="number" id="input-nota-estagio" class="input" 
            min="0" max="10" step="0.1" value="${notaEstagio}" 
            style="width: 100px; text-align: center; font-weight: 600;">
          <button id="btn-salvar-nota-estagio" class="btn btn-primary">💾 Salvar Nota</button>
        </div>
      </div>
    `
    contentArea.style.display = 'block'

    const btnSalvar = contentArea.querySelector('#btn-salvar-nota-estagio') as HTMLButtonElement
    const inputNota = contentArea.querySelector('#input-nota-estagio') as HTMLInputElement

    btnSalvar.addEventListener('click', async () => {
      const novaNota = parseFloat(inputNota.value)
      if (isNaN(novaNota) || novaNota < 0 || novaNota > 10) {
        toast.error('A nota deve estar entre 0 e 10')
        return
      }

      btnSalvar.disabled = true
      btnSalvar.textContent = '⌛ Salvando...'

      try {
        const { error } = await AcademicService.upsertNotaEstagio(alunoId, discBaseId, novaNota)
        if (error) throw error
        
        toast.success('Nota de estágio salva com sucesso!')
        
        // Atualizar cache local
        if (!boletimCache) boletimCache = []
        const idx = boletimCache.findIndex((n: any) => n.disciplina_base_id === discBaseId)
        if (idx >= 0) {
          boletimCache[idx].nota_estagio = novaNota
        } else {
          boletimCache.push({ disciplina_base_id: discBaseId, nota_estagio: novaNota })
        }
      } catch (err: any) {
        toast.error('Erro ao salvar nota: ' + err.message)
      } finally {
        btnSalvar.disabled = false
        btnSalvar.textContent = '💾 Salvar Nota'
      }
    })
  })

  return container
}
