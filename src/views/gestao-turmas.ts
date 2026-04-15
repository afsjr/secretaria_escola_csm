import { AcademicService } from '../lib/academic-service'
import { CourseService } from '../lib/course-service'
import { AuditService } from '../lib/audit-service'
import { toast } from '../lib/toast'
import { escapeHTML, createOption } from '../lib/security'
import type { UserRole } from '../types'

interface ProfileParam {
  id: string
  perfil: UserRole
}

export async function GestaoTurmasView(profile: ProfileParam): Promise<HTMLElement> {
  const container = document.createElement('div')
  container.className = 'gestao-turmas-view animate-in'

  // Verificar se o usuário tem permissão para editar/excluir turmas
  const canManageTurmas = profile.perfil === 'secretaria' || profile.perfil === 'admin' || profile.perfil === 'master_admin'

  // Fetch initial data
  const turmasResult = await AcademicService.getTurmas()
  const turmas = turmasResult.data
  const errorTurmas = turmasResult.error

  const alunosResult = await AcademicService.getAlunos()
  const alunos = alunosResult.data
  const errorAlunos = alunosResult.error

  const cursosResult = await CourseService.getCursosAtivos()
  const cursos = cursosResult.data
  const errorCursos = cursosResult.error

  if (errorTurmas) toast.error('Erro ao carregar turmas: ' + errorTurmas.message)

  const cursosOptions = cursos && cursos.length > 0
    ? cursos.map((c: any) => createOption(c.id, c.nome)).join('')
    : '<option value="">Nenhum curso cadastrado</option>'

  const turmasList = !turmas || turmas.length === 0
    ? '<p style="color:var(--text-muted);font-size:0.8rem;">Nenhuma turma registrada.</p>'
    : turmas?.map((t: any) => {
      const statusBg = t.status_ingresso === 'aberta' ? 'var(--success-bg)' : '#FEE2E2'
      const statusColor = t.status_ingresso === 'aberta' ? 'var(--success-text)' : '#991B1B'
      const manageButtons = canManageTurmas ? `
        <div style="margin-top: 0.5rem; display: flex; gap: 6px;">
          <button type="button" class="btn-editar-turma" data-id="${escapeHTML(t.id)}" data-nome="${escapeHTML(t.nome)}" title="Editar nome da turma" style="background: transparent; border: 1px solid var(--accent); color: var(--accent); font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; cursor: pointer;">✏️ Editar</button>
          <button type="button" class="btn-excluir-turma" data-id="${escapeHTML(t.id)}" data-nome="${escapeHTML(t.nome)}" title="Excluir turma" style="background: transparent; border: 1px solid var(--danger); color: var(--danger); font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; cursor: pointer;">🗑️ Excluir</button>
        </div>
      ` : ''
      return `
          <li style="padding: 1rem; border: 2px solid var(--border); border-radius: 8px; cursor: pointer; transition: all 0.2s; background: white;" class="turma-item" data-id="${escapeHTML(t.id)}" data-nome="${escapeHTML(t.nome)}" onmouseover="this.style.borderColor='var(--primary)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'" onmouseout="this.style.borderColor='var(--secondary)'; this.style.boxShadow='none'">
            <div style="font-weight: 600; color: var(--primary); font-size: 1.05rem;">
              <span class="turma-nome-display">${escapeHTML(t.nome)}</span>
              <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">(${escapeHTML(t.periodo)})</span>
              <input type="text" class="turma-nome-input" style="display: none; font-size: 1.05rem; font-weight: 600; color: var(--primary); border: 1px solid var(--accent); border-radius: 4px; padding: 0.2rem 0.4rem; width: 60%;" />
            </div>
            <div style="font-size: 0.8rem; margin-top: 8px;">
              <span class="badge" style="background: ${statusBg}; color: ${statusColor}; padding: 0.3rem 0.6rem; border-radius: 4px; font-weight: 600;">${escapeHTML(t.status_ingresso)}</span>
            </div>
            ${manageButtons}
          </li>
        `
    }).join('')

  const alunosOptions = alunos?.map((a: any) =>
    createOption(a.id, `${a.nome_completo} (${a.cpf || 'Sem CPF'})`)
  ).join('') || ''

  container.innerHTML = `
    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; color: var(--text-main);">Gestão de Turmas e Matrículas</h1>
      <p>Crie novas turmas, matricule os alunos e gerencie o status acadêmico/financeiro.</p>
    </header>

    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem;">

      <!-- Lado Esquerdo: Criar Turma e Lista de Turmas -->
      <div>
        <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); margin-bottom: 2rem; border-top: 4px solid var(--primary);">
          <h3 style="margin-bottom: 1rem;">Abrir Nova Turma</h3>
          <form id="form-nova-turma">
            <div class="form-group">
              <label class="label" for="turma-curso">Curso *</label>
              <select id="turma-curso" name="turma_curso" class="input" required>
                <option value="">-- Selecione o Curso --</option>
                ${cursosOptions}
              </select>
            </div>
            <div class="form-group">
              <label class="label" for="turma-nome">Nome da Turma</label>
              <input type="text" id="turma-nome" name="turma_nome" class="input" placeholder="Ex: Tec. Enfermagem 12A" required>
            </div>
            <div class="form-group">
              <label class="label" for="turma-periodo">Período letivo</label>
              <input type="text" id="turma-periodo" name="turma_periodo" class="input" placeholder="Ex: 2026.1" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Registrar Turma</button>
          </form>
        </div>

        <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
          <h3 style="margin-bottom: 1rem;">Turmas Ativas</h3>
          <ul id="lista-turmas" style="list-style: none; display: flex; flex-direction: column; gap: 10px;">
            ${turmasList}
          </ul>
        </div>
      </div>

      <!-- Lado Direito: Detalhes da Turma e Matrículas -->
      <div id="painel-matriculas" style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); display: none;">
        <h2 id="titulo-turma-selecionada" style="margin-bottom: 0.5rem; color: var(--primary); border-bottom: 3px solid var(--accent); padding-bottom: 0.5rem;">Selecione uma Turma</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem;">Gerencie matrículas e o status acadêmico/financeiro para esta turma.</p>

        <!-- Matricular Aluno - DESTAQUE -->
        <div style="background: linear-gradient(135deg, #FFF9E6 0%, #FFF4B8 100%); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border: 2px solid var(--accent); box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);">
          <h4 style="margin-bottom: 1rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.5rem;">🎓</span>
            Matricular Aluno Existente
          </h4>
          <div style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
            <div class="form-group" style="flex: 1; margin: 0; min-width: 250px;">
              <label for="aluno-select" class="label" style="font-size: 0.85rem; font-weight: 600;">Selecione o Aluno</label>
              <select id="aluno-select" name="aluno_select" class="input" style="width: 100%;">
                <option value="">-- Escolha um Aluno --</option>
                ${alunosOptions}
              </select>
            </div>
            <button id="btn-matricular" class="btn btn-primary" style="background: var(--primary); white-space: nowrap; padding: 0.75rem 1.5rem; font-weight: 600;">
              <span style="margin-right: 0.5rem;">✓</span> Matricular na Turma
            </button>
          </div>
        </div>

        <!-- Tabela de Alunos na Turma -->
        <h3 style="margin-bottom: 1rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.3rem;">📋</span>
          Diário Oficial (Caderneta)
        </h3>
        <div style="overflow-x: auto; border: 1px solid var(--border); border-radius: 8px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead style="background: var(--primary); color: white; font-size: 0.85rem; text-transform: uppercase;">
              <tr>
                <th style="padding: 1rem;">Nome do Aluno</th>
                <th style="padding: 1rem;">Status (Acadêmico)</th>
                <th style="padding: 1rem;">Bloqueio Financ.</th>
                <th style="padding: 1rem; text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody id="tabela-alunos-turma">
              <tr><td colspan="4" style="padding: 1rem; text-align: center; color: var(--text-muted);">Clique em uma turma ao lado para visualizar os alunos.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `

  /* ------------- FUNÇÕES E EVENTOS ------------- */

  // 1. Criar Turma
  const formNovaTurma = container.querySelector('#form-nova-turma') as HTMLFormElement
  formNovaTurma.addEventListener('submit', async (e) => {
    e.preventDefault()
    const nome = (container.querySelector('#turma-nome') as HTMLInputElement).value
    const periodo = (container.querySelector('#turma-periodo') as HTMLInputElement).value
    const cursoId = (container.querySelector('#turma-curso') as HTMLSelectElement).value
    const btn = formNovaTurma.querySelector('button') as HTMLButtonElement

    if (!cursoId) {
      toast.error('Selecione um curso para a turma!')
      return
    }

    btn.disabled = true; btn.textContent = 'Salvando...'
    const createResult = await AcademicService.createTurma({ nome, periodo: periodo.trim() })
    const { data: turmaData, error } = createResult

    if (error) { toast.error('Erro: ' + error.message); btn.disabled = false; btn.textContent = 'Registrar Turma' }
    else {
      // Vincular turma ao curso
      if (turmaData?.id && cursoId) {
        await CourseService.vincularTurmaAoCurso(turmaData.id, cursoId)
      }

      // Registrar no audit log
      await AuditService.log({
        acao: 'criar_turma',
        tabela_afetada: 'turmas',
        registro_id: turmaData?.id,
        descricao: `Turma "${nome}" criada para o período ${periodo}`,
        dados_novos: { nome, periodo, curso_id: cursoId }
      })

      toast.success('Turma criada com sucesso!')
      setTimeout(() => { window.location.reload() }, 1000)
    }
  })

  // 1.5 Editar nome da turma (apenas secretaria/admin/master_admin)
  const listaTurmasContainer = container.querySelector('#lista-turmas') as HTMLElement

  listaTurmasContainer.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement

    // Editar turma
    if (target.classList.contains('btn-editar-turma') || target.closest('.btn-editar-turma')) {
      e.stopPropagation()
      const btn = target.classList.contains('btn-editar-turma') ? target : target.closest('.btn-editar-turma') as HTMLElement
      const turmaId = btn.dataset.id as string
      const turmaNomeAtual = btn.dataset.nome as string
      const turmaItem = btn.closest('.turma-item') as HTMLElement
      const nomeDisplay = turmaItem.querySelector('.turma-nome-display') as HTMLElement
      const nomeInput = turmaItem.querySelector('.turma-nome-input') as HTMLInputElement

      // Mostrar input inline
      nomeDisplay.style.display = 'none'
      nomeInput.style.display = 'inline-block'
      nomeInput.value = turmaNomeAtual
      nomeInput.focus()
      nomeInput.select()

      // Salvar ao pressionar Enter ou perder foco
      const salvarNome = async () => {
        const novoNome = nomeInput.value.trim()
        if (!novoNome) {
          toast.error('O nome da turma não pode ser vazio.')
          nomeInput.focus()
          return
        }

        if (novoNome === turmaNomeAtual) {
          // Cancelar se não mudou
          nomeDisplay.style.display = 'inline'
          nomeInput.style.display = 'none'
          return
        }

        try {
          const updateResult = await AcademicService.updateTurma(turmaId, { nome: novoNome })
          const { error } = updateResult

          if (error) {
            toast.error('Erro ao renomear turma: ' + error.message)
          } else {
            // Registrar no audit log
            await AuditService.log({
              acao: 'alterar_turma',
              tabela_afetada: 'turmas',
              registro_id: turmaId,
              descricao: `Turma renomeada de "${turmaNomeAtual}" para "${novoNome}"`,
              dados_antigos: { nome: turmaNomeAtual },
              dados_novos: { nome: novoNome }
            })

            toast.success('Turma renomeada com sucesso!')
            nomeDisplay.textContent = novoNome
            nomeDisplay.dataset.nome = novoNome
          }
        } catch (err: any) {
          toast.error('Erro inesperado: ' + err.message)
        }

        nomeDisplay.style.display = 'inline'
        nomeInput.style.display = 'none'
      }

      nomeInput.addEventListener('blur', salvarNome)
      nomeInput.addEventListener('keydown', async (ev) => {
        if (ev.key === 'Enter') {
          ev.preventDefault()
          nomeInput.removeEventListener('blur', salvarNome)
          await salvarNome()
        }
        if (ev.key === 'Escape') {
          nomeDisplay.style.display = 'inline'
          nomeInput.style.display = 'none'
        }
      })
    }

    // Excluir turma
    if (target.classList.contains('btn-excluir-turma') || target.closest('.btn-excluir-turma')) {
      e.stopPropagation()
      const btn = target.classList.contains('btn-excluir-turma') ? target : target.closest('.btn-excluir-turma') as HTMLElement
      const turmaId = btn.dataset.id as string
      const turmaNome = btn.dataset.nome as string

      if (!confirm(`Tem certeza que deseja excluir a turma "${turmaNome}"?\n\nEsta ação não pode ser desfeita e removerá todas as matrículas vinculadas.`)) {
        return
      }

      ;(btn as HTMLButtonElement).disabled = true
      ;(btn as HTMLButtonElement).textContent = 'Excluindo...'

      try {
        const deleteResult = await AcademicService.deleteTurma(turmaId)

        if (deleteResult.error) {
          toast.error('Erro ao excluir turma: ' + deleteResult.error.message)
        } else {
          // Registrar no audit log
          await AuditService.log({
            acao: 'delete_turma',
            tabela_afetada: 'turmas',
            registro_id: turmaId,
            descricao: `Turma "${turmaNome}" excluída permanentemente`,
            dados_antigos: { nome: turmaNome, id: turmaId }
          })

          toast.success('Turma excluída com sucesso!')
          // Remover o item da lista visualmente
          const turmaItem = btn.closest('.turma-item') as HTMLElement
          turmaItem.style.transition = 'opacity 0.3s, transform 0.3s'
          turmaItem.style.opacity = '0'
          turmaItem.style.transform = 'translateX(-20px)'
          setTimeout(() => turmaItem.remove(), 300)
        }
      } catch (err: any) {
        toast.error('Erro inesperado: ' + err.message)
      }

      ;(btn as HTMLButtonElement).disabled = false
      ;(btn as HTMLButtonElement).innerHTML = '🗑️ Excluir'
    }
  })

  // 2. Selecionar Turma
  const listaTurmas = container.querySelectorAll('.turma-item')
  const painelMatriculas = container.querySelector('#painel-matriculas') as HTMLElement
  const tituloTurma = container.querySelector('#titulo-turma-selecionada') as HTMLElement
  const tabelaAlunos = container.querySelector('#tabela-alunos-turma') as HTMLElement
  const btnMatricular = container.querySelector('#btn-matricular') as HTMLButtonElement
  let selectedTurmaId: string | null = null

  async function loadTurmaAlunos(turmaId: string) {
    tabelaAlunos.innerHTML = '<tr><td colspan="4" style="padding: 1rem; text-align: center;">Carregando Caderneta...</td></tr>'
    const matriculasResult = await AcademicService.getAlunosDaTurma(turmaId)
    const { data: matriculas, error } = matriculasResult

    if (error) {
      tabelaAlunos.innerHTML = `<tr><td colspan="4" style="color:red; padding: 1rem;">Erro: ${escapeHTML(error.message)}</td></tr>`
      return
    }

    if (!matriculas || matriculas.length === 0) {
      tabelaAlunos.innerHTML = '<tr><td colspan="4" style="padding: 1rem; text-align: center; color: var(--text-muted);">Nenhum aluno matriculado nesta turma ainda.</td></tr>'
      return
    }

    tabelaAlunos.innerHTML = matriculas.map((m) => {
      const alunoData = Array.isArray(m.perfis) ? m.perfis[0] : m.perfis as { id?: string; nome_completo?: string; email?: string; bloqueio_financeiro?: boolean } | undefined
      const nomeAluno = escapeHTML(alunoData?.nome_completo || 'Aluno Desconhecido')
      const emailAluno = escapeHTML(alunoData?.email || '')
      const matriculaId = escapeHTML(m.id)
      const alunoId = escapeHTML(alunoData?.id || '')
      const statusBg = m.status_aluno === 'ativo' ? '#dcfce7' : '#f3f4f6'
      const bloqueioColor = alunoData?.bloqueio_financeiro ? '#dc2626' : '#22c55e'
      const bloqueioText = alunoData?.bloqueio_financeiro ? 'INADIMPLENTE' : 'Ok'
      const checkedAttr = alunoData?.bloqueio_financeiro ? 'checked' : ''

      return `
        <tr style="border-top: 1px solid var(--secondary);">
          <td style="padding: 1rem;">
            <div style="font-weight: 600;">${nomeAluno}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${emailAluno}</div>
          </td>
          <td style="padding: 1rem;">
            <label for="status-select-${matriculaId}" style="display:none;">Status Acadêmico</label>
            <select id="status-select-${matriculaId}" name="status_aluno" class="input status-aluno-select" data-matricula-id="${matriculaId}" data-aluno-id="${alunoId}" data-bloqueio="${alunoData?.bloqueio_financeiro || false}" style="padding: 0.3rem; font-size: 0.8rem; width: auto; background: ${statusBg};">
              ${createOption('ativo', 'Ativo Regular', m.status_aluno === 'ativo')}
              ${createOption('trancado', 'Trancado / Inativo', m.status_aluno === 'trancado')}
              ${createOption('evadido', 'Evadido', m.status_aluno === 'evadido')}
              ${createOption('concluido', 'Concluído', m.status_aluno === 'concluido')}
            </select>
          </td>
          <td style="padding: 1rem;">
            <label for="block-${matriculaId}" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="block-${matriculaId}" name="block_aluno" class="financeiro-checkbox" data-matricula-id="${matriculaId}" data-aluno-id="${alunoId}" data-status="${escapeHTML(m.status_aluno)}" ${checkedAttr}>
              <span style="font-size: 0.8rem; font-weight: 600; color: ${bloqueioColor}">
                ${bloqueioText}
              </span>
            </label>
          </td>
          <td style="padding: 1rem; text-align: right; display: flex; gap: 5px; justify-content: flex-end;">
            <button type="button" class="btn btn-salvar-status" data-matricula-id="${matriculaId}" data-aluno-id="${alunoId}" style="font-size: 0.75rem; padding: 0.4rem 0.8rem; flex: 1;">Salvar</button>
            <button type="button" class="btn btn-remover" data-matricula-id="${matriculaId}" style="background: transparent; border: 1px solid var(--danger); color: var(--danger); font-size: 0.75rem; padding: 0.4rem 0.6rem; border-radius: 4px; cursor: pointer;">
              X Excluir
            </button>
          </td>
        </tr>
      `
    }).join('')

    // Events for "Salvar Aluno" inner buttons
    const botoesSalvarStatus = tabelaAlunos.querySelectorAll('.btn-salvar-status')
    botoesSalvarStatus.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const tr = (e.target as HTMLElement).closest('tr') as HTMLElement
        const alunoId = (btn as HTMLButtonElement).getAttribute('data-aluno-id')
        const matId = (btn as HTMLButtonElement).getAttribute('data-matricula-id')
        const statusSelect = (tr.querySelector('.status-aluno-select') as HTMLSelectElement).value
        const isBloqueado = (tr.querySelector('.financeiro-checkbox') as HTMLInputElement).checked

        ;(btn as HTMLButtonElement).textContent = '...'
        const { error } = await AcademicService.atualizarStatusAdministrativo(alunoId as string, matId as string, statusSelect, isBloqueado) as any
        if (error) { toast.error('Falhou: ' + error.message) }
        else {
          toast.success('Perfil atualizado!')
          loadTurmaAlunos(turmaId) // reload view safely
        }
      })
    })

    // Events for "Remover Matrícula" inner buttons
    const botoesRemover = tabelaAlunos.querySelectorAll('.btn-remover')
    botoesRemover.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault()
        e.stopPropagation()
        const matId = (e.currentTarget as HTMLElement).getAttribute('data-matricula-id')

        if (!window.confirm('Certeza absoluta? Apagar a matrícula excluirá também todas as notas vinculadas a ela (se houver). Pressione OK para prosseguir.')) return

        ;(btn as HTMLButtonElement).textContent = '...'
        ;(btn as HTMLButtonElement).disabled = true

        try {
          const { error } = await AcademicService.excluirMatricula(matId as string) as any
          if (error) {
            throw error
          }
          toast.success('Matrícula evaporada com sucesso.')
          loadTurmaAlunos(turmaId)
        } catch (err: any) {
          console.error("Erro ao deletar matrícula:", err)
          toast.error('Falha: ' + err.message)
          ;(btn as HTMLButtonElement).textContent = 'X'
          ;(btn as HTMLButtonElement).disabled = false
        }
      })
    })
  }

  listaTurmas.forEach(el => {
    el.addEventListener('click', () => {
      // visual selection
      listaTurmas.forEach(i => (i as HTMLElement).style.borderColor = 'var(--secondary)')
      ;(el as HTMLElement).style.borderColor = 'var(--primary)'

      selectedTurmaId = el.getAttribute('data-id')
      tituloTurma.textContent = 'Turma: ' + el.getAttribute('data-nome')
      painelMatriculas.style.display = 'block'

      loadTurmaAlunos(selectedTurmaId as string)
    })
  })

  // 3. Matricular novo aluno
  btnMatricular.addEventListener('click', async () => {
    const alunoSelect = container.querySelector('#aluno-select') as HTMLSelectElement
    const alunoId = alunoSelect.value
    if (!alunoId) { toast.error('Selecione um aluno primeiro!'); return }
    if (!selectedTurmaId) { toast.error('Selecione uma turma primeiro!'); return }

    btnMatricular.disabled = true; btnMatricular.textContent = 'Matriculando...'

    // Simplificando: Assumimos que a constraint do banco deixa criar múltiplas pra permitir "Dependência".
    // Em Produção, checaríamos se ele já não está ativo *nesta mesma* turma antes.
    const { error } = await AcademicService.matricularAluno(alunoId, selectedTurmaId) as any

    if (error) {
      // Erro 23505 = unique_violation, caso decidamos futuramente colocar unique constraint
      toast.error('O aluno não pôde ser matriculado: ' + error.message)
    } else {
      toast.success('Aluno inserido no diário da turma!')

      // Registrar no audit log
      await AuditService.log({
        acao: 'matricular_aluno',
        tabela_afetada: 'matriculas',
        descricao: `Aluno matriculado na turma selecionada`,
        dados_novos: { aluno_id: alunoId, turma_id: selectedTurmaId }
      })

      alunoSelect.value = ''
      loadTurmaAlunos(selectedTurmaId) // reload the list
    }
    btnMatricular.disabled = false; btnMatricular.textContent = 'Adicionar à Turma'
  })

  return container
}
