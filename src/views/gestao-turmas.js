import { AcademicService } from '../lib/academic-service'
import { toast } from '../lib/toast'

export async function GestaoTurmasView() {
  const container = document.createElement('div')
  container.className = 'gestao-turmas-view animate-in'

  // Fetch initial data
  const { data: turmas, error: errorTurmas } = await AcademicService.getTurmas()
  const { data: alunos, error: errorAlunos } = await AcademicService.getAlunos()

  if (errorTurmas) toast.error('Erro ao carregar turmas: ' + errorTurmas.message)

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
              <label class="label" for="turma-nome">Nome da Turma</label>
              <input type="text" id="turma-nome" name="turma_nome" class="input" placeholder="Ex: Tec. Enfermagem 12A" required>
            </div>
            <div class="form-group">
              <label class="label" for="turma-periodo">Período Letivo</label>
              <input type="text" id="turma-periodo" name="turma_periodo" class="input" placeholder="Ex: 2026.1" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Registrar Turma</button>
          </form>
        </div>

        <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
          <h3 style="margin-bottom: 1rem;">Turmas Ativas</h3>
          <ul id="lista-turmas" style="list-style: none; display: flex; flex-direction: column; gap: 10px;">
            ${!turmas || turmas.length === 0 ? '<p style="color:var(--text-muted);font-size:0.8rem;">Nenhuma turma registrada.</p>' : ''}
            ${turmas?.map(t => `
              <li style="padding: 1rem; border: 1px solid var(--secondary); border-radius: 6px; cursor: pointer; transition: 0.2s;" class="turma-item" data-id="${t.id}" data-nome="${t.nome}">
                <div style="font-weight: 600; color: var(--primary);">${t.nome} <span style="font-size:0.7rem; color:gray; font-weight:normal;">(${t.periodo})</span></div>
                <div style="font-size: 0.8rem; margin-top: 5px;">
                  <span class="badge" style="background: ${t.status_ingresso === 'aberta' ? '#dcfce7' : '#fee2e2'}; color: ${t.status_ingresso === 'aberta' ? '#166534' : '#991b1b'};">${t.status_ingresso}</span>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>

      <!-- Lado Direito: Detalhes da Turma e Matrículas -->
      <div id="painel-matriculas" style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); display: none;">
        <h2 id="titulo-turma-selecionada" style="margin-bottom: 0.5rem; color: var(--text-main);">Selecione uma Turma</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 2rem;">Gerencie matrículas e o status financeiro para esta turma.</p>

        <!-- Matricular Aluno -->
        <div style="background: #f8fafc; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; border: 1px solid var(--secondary);">
          <h4 style="margin-bottom: 15px;">Matricular Aluno Existente</h4>
          <div style="display: flex; gap: 10px; align-items: flex-end;">
            <div class="form-group" style="flex: 1; margin: 0;">
              <label for="aluno-select" style="display: none;">Escolha o Aluno</label>
              <select id="aluno-select" name="aluno_select" class="input">
                <option value="">-- Escolha um Aluno --</option>
                ${alunos?.map(a => `<option value="${a.id}">${a.nome_completo} (${a.cpf || 'Sem CPF'})</option>`).join('')}
              </select>
            </div>
            <button id="btn-matricular" class="btn btn-primary">Adicionar à Turma</button>
          </div>
        </div>

        <!-- Tabela de Alunos na Turma -->
        <h3 style="margin-bottom: 1rem;">Diário Oficial (Caderneta)</h3>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead style="background: var(--secondary); font-size: 0.85rem; text-transform: uppercase;">
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
  const formNovaTurma = container.querySelector('#form-nova-turma')
  formNovaTurma.addEventListener('submit', async (e) => {
    e.preventDefault()
    const nome = container.querySelector('#turma-nome').value
    const periodo = container.querySelector('#turma-periodo').value
    const btn = formNovaTurma.querySelector('button')
    
    btn.disabled = true; btn.textContent = 'Salvando...'
    const { error } = await AcademicService.createTurma({ nome, periodo: periodo.trim() })
    
    if (error) { toast.error('Erro: ' + error.message); btn.disabled = false; btn.textContent = 'Registrar Turma' } 
    else {
      toast.success('Turma criada com sucesso!')
      setTimeout(() => { window.location.reload() }, 1000)
    }
  })

  // 2. Selecionar Turma
  const listaTurmas = container.querySelectorAll('.turma-item')
  const painelMatriculas = container.querySelector('#painel-matriculas')
  const tituloTurma = container.querySelector('#titulo-turma-selecionada')
  const tabelaAlunos = container.querySelector('#tabela-alunos-turma')
  const btnMatricular = container.querySelector('#btn-matricular')
  let selectedTurmaId = null

  async function loadTurmaAlunos(turmaId) {
    tabelaAlunos.innerHTML = '<tr><td colspan="4" style="padding: 1rem; text-align: center;">Carregando Caderneta...</td></tr>'
    const { data: matriculas, error } = await AcademicService.getAlunosDaTurma(turmaId)
    
    if (error) {
      tabelaAlunos.innerHTML = `<tr><td colspan="4" style="color:red; padding: 1rem;">Erro: ${error.message}</td></tr>`
      return
    }

    if (!matriculas || matriculas.length === 0) {
      tabelaAlunos.innerHTML = '<tr><td colspan="4" style="padding: 1rem; text-align: center; color: var(--text-muted);">Nenhum aluno matriculado nesta turma ainda.</td></tr>'
      return
    }

    tabelaAlunos.innerHTML = matriculas.map(m => `
      <tr style="border-top: 1px solid var(--secondary);">
        <td style="padding: 1rem;">
          <div style="font-weight: 600;">${m.perfis?.nome_completo || 'Aluno Desconhecido'}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${m.perfis?.email || ''}</div>
        </td>
        <td style="padding: 1rem;">
          <label for="status-select-${m.id}" style="display:none;">Status Acadêmico</label>
          <select id="status-select-${m.id}" name="status_aluno" class="input status-aluno-select" data-matricula-id="${m.id}" data-aluno-id="${m.perfis.id}" data-bloqueio="${m.perfis.bloqueio_financeiro}" style="padding: 0.3rem; font-size: 0.8rem; width: auto; background: ${m.status_aluno==='ativo' ? '#dcfce7' : '#f3f4f6'};">
            <option value="ativo" ${m.status_aluno === 'ativo' ? 'selected' : ''}>Ativo Regular</option>
            <option value="trancado" ${m.status_aluno === 'trancado' ? 'selected' : ''}>Trancado / Inativo</option>
            <option value="evadido" ${m.status_aluno === 'evadido' ? 'selected' : ''}>Evadido</option>
            <option value="concluido" ${m.status_aluno === 'concluido' ? 'selected' : ''}>Concluído</option>
          </select>
        </td>
        <td style="padding: 1rem;">
          <label for="block-${m.id}" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="block-${m.id}" name="block_aluno" class="financeiro-checkbox" data-matricula-id="${m.id}" data-aluno-id="${m.perfis.id}" data-status="${m.status_aluno}" ${m.perfis.bloqueio_financeiro ? 'checked' : ''}>
            <span style="font-size: 0.8rem; font-weight: 600; color: ${m.perfis.bloqueio_financeiro ? '#dc2626' : '#22c55e'}">
              ${m.perfis.bloqueio_financeiro ? 'INADIMPLENTE' : 'Ok'}
            </span>
          </label>
        </td>
        <td style="padding: 1rem; text-align: right; display: flex; gap: 5px; justify-content: flex-end;">
          <button class="btn btn-primary btn-salvar-status" data-matricula-id="${m.id}" data-aluno-id="${m.perfis.id}" style="font-size: 0.75rem; padding: 0.4rem 0.8rem; flex: 1;">Salvar</button>
          <button class="btn btn-remover" data-matricula-id="${m.id}" title="Desfazer matrícula errada" style="background: transparent; border: 1px solid var(--danger); color: var(--danger); font-size: 0.75rem; padding: 0.4rem 0.6rem; border-radius: 4px; cursor: pointer;">
            X
          </button>
        </td>
      </tr>
    `).join('')

    // Events for "Salvar Aluno" inner buttons
    const botoesSalvarStatus = tabelaAlunos.querySelectorAll('.btn-salvar-status')
    botoesSalvarStatus.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const tr = e.target.closest('tr')
        const alunoId = btn.getAttribute('data-aluno-id')
        const matId = btn.getAttribute('data-matricula-id')
        const statusSelect = tr.querySelector('.status-aluno-select').value
        const isBloqueado = tr.querySelector('.financeiro-checkbox').checked

        btn.textContent = '...'
        const { error } = await AcademicService.atualizarStatusAdministrativo(alunoId, matId, statusSelect, isBloqueado)
        if(error) { toast.error('Falhou: ' + error.message) } 
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
        const matId = e.currentTarget.getAttribute('data-matricula-id')
        
        if (!window.confirm('Certeza absoluta? Apagar a matrícula excluirá também todas as notas vinculadas a ela (se houver). Pressione OK para prosseguir.')) return
        
        btn.textContent = '...'
        btn.disabled = true
        
        try {
          const { error } = await AcademicService.excluirMatricula(matId)
          if (error) { 
            throw error
          }
          toast.success('Matrícula evaporada com sucesso.')
          loadTurmaAlunos(turmaId)
        } catch (err) {
          console.error("Erro ao deletar matrícula:", err)
          toast.error('Falha: ' + err.message)
          btn.textContent = 'X'
          btn.disabled = false
        }
      })
    })
  }

  listaTurmas.forEach(el => {
    el.addEventListener('click', () => {
      // visual selection
      listaTurmas.forEach(i => i.style.borderColor = 'var(--secondary)')
      el.style.borderColor = 'var(--primary)'

      selectedTurmaId = el.getAttribute('data-id')
      tituloTurma.textContent = 'Turma: ' + el.getAttribute('data-nome')
      painelMatriculas.style.display = 'block'
      
      loadTurmaAlunos(selectedTurmaId)
    })
  })

  // 3. Matricular novo aluno
  btnMatricular.addEventListener('click', async () => {
    const alunoSelect = container.querySelector('#aluno-select')
    const alunoId = alunoSelect.value
    if (!alunoId) { toast.error('Selecione um aluno primeiro!'); return }
    if (!selectedTurmaId) { toast.error('Selecione uma turma primeiro!'); return }

    btnMatricular.disabled = true; btnMatricular.textContent = 'Matriculando...'
    
    // Simplificando: Assumimos que a constraint do banco deixa criar múltiplas pra permitir "Dependência". 
    // Em Produção, checaríamos se ele já não está ativo *nesta mesma* turma antes.
    const { error } = await AcademicService.matricularAluno(alunoId, selectedTurmaId)
    
    if (error) { 
      // Erro 23505 = unique_violation, caso decidamos futuramente colocar unique constraint
      toast.error('O aluno não pôde ser matriculado: ' + error.message) 
    } else {
      toast.success('Aluno inserido no diário da turma!')
      alunoSelect.value = ''
      loadTurmaAlunos(selectedTurmaId) // reload the list
    }
    btnMatricular.disabled = false; btnMatricular.textContent = 'Adicionar à Turma'
  })

  return container
}
