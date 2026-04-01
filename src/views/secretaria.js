import { DocumentsService } from '../lib/documents-service'
import { AdminService } from '../lib/admin-service'
import { toast } from '../lib/toast'

// Helper para prevenir XSS
const escapeHTML = (str) => {
  if (!str) return ''
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag]))
}

export async function SecretariaView() {
  const container = document.createElement('div')
  container.className = 'secretaria-view animate-in'

  const { data: requests, error } = await DocumentsService.getAllOpenRequests()
  const { data: turmas } = await AdminService.getTurmas()
  const { data: alunos, error: errorAlunos } = await AdminService.listAlunos()

  if (errorAlunos) toast.error('Erro ao carregar alunos: ' + errorAlunos.message)

  const renderRequests = () => {
    if (error) return `<p class="error-text">Erro ao carregar solicitações.</p>`
    if (!requests || requests.length === 0) return '<p>Não há solicitações pendentes no momento.</p>'
    
    return `
      <div class="table-responsive bg-white rounded-lg shadow-sm mt-4">
        <table class="data-table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Documento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${requests.map(r => `
              <tr id="req-row-${r.id}">
                <td>
                  <div class="fw-600 text-main">${escapeHTML(r.perfis?.nome_completo || 'N/A')}</div>
                  <div class="text-sm text-muted">${escapeHTML(r.perfis?.email || '')}</div>
                </td>
                <td>${escapeHTML(r.tipo)}</td>
                <td class="status-cell">
                  <span class="badge ${r.status === 'pendente' ? 'badge-warning' : 'badge-success'}">
                    ${escapeHTML(r.status)}
                  </span>
                </td>
                <td class="action-cell">
                  ${r.status === 'pendente' ? `
                    <button class="btn btn-primary btn-sm approve-btn" data-id="${r.id}">Concluir</button>
                  ` : '<span class="text-muted">---</span>'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
  }

  const renderGerenciarAlunos = () => {
    if (errorAlunos) return `<p class="error-text">Erro ao carregar alunos.</p>`
    if (!alunos || alunos.length === 0) return '<p>Não há alunos cadastrados no momento.</p>'
    
    return `
      <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3 style="margin: 0; color: var(--text-main);">Gerenciar Alunos</h3>
          <input type="text" id="busca-aluno" class="input" placeholder="Buscar por nome ou CPF..." style="width: 300px; margin: 0;">
        </div>
        
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nome Completo</th>
                <th>E-mail</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody id="tabela-alunos">
              ${alunos.map(aluno => `
                <tr class="aluno-row" data-id="${aluno.id}" data-nome="${escapeHTML(aluno.nome_completo)}" data-cpf="${escapeHTML(aluno.cpf || '')}">
                  <td>
                    <div class="fw-600 text-main">${escapeHTML(aluno.nome_completo)}</div>
                  </td>
                  <td>${escapeHTML(aluno.email)}</td>
                  <td>${escapeHTML(aluno.cpf || '-')}</td>
                  <td>${escapeHTML(aluno.telefone || '-')}</td>
                  <td>
                    <span class="badge ${aluno.bloqueio_financeiro ? 'badge-warning' : 'badge-success'}">
                      ${aluno.bloqueio_financeiro ? 'Bloqueado' : 'Ativo'}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-primary btn-sm btn-editar-aluno" data-id="${aluno.id}">Editar</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal de Edição -->
      <div id="modal-editar-aluno" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
        <div class="modal-content" style="background: white; padding: 2rem; border-radius: var(--radius-lg); max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 style="margin: 0; color: var(--text-main);">Editar Aluno</h3>
            <button id="btn-fechar-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
          </div>
          
          <form id="form-editar-aluno">
            <input type="hidden" id="edit-aluno-id" name="aluno_id">
            
            <div class="form-group">
              <label class="label" for="edit-nome">Nome Completo *</label>
              <input type="text" id="edit-nome" name="nome_completo" class="input" required>
            </div>

            <div class="form-group">
              <label class="label" for="edit-cpf">CPF</label>
              <input type="text" id="edit-cpf" name="cpf" class="input" placeholder="000.000.000-00">
            </div>

            <div class="form-group">
              <label class="label" for="edit-telefone">Telefone / WhatsApp</label>
              <input type="text" id="edit-telefone" name="telefone" class="input" placeholder="(00) 00000-0000">
            </div>

            <div class="form-group">
              <label class="label">E-mail</label>
              <input type="text" id="edit-email" class="input" disabled style="background: var(--secondary);">
            </div>

            <div class="form-group">
              <label class="label">Perfil</label>
              <input type="text" id="edit-perfil" class="input" disabled style="background: var(--secondary);">
            </div>

            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
              <button type="button" id="btn-cancelar-edicao" class="btn" style="flex: 1; background: var(--secondary); color: var(--text-main);">Cancelar</button>
              <button type="submit" class="btn btn-primary" id="btn-salvar-edicao" style="flex: 1;">Salvar Alterações</button>
            </div>
          </form>
        </div>
      </div>
    `
  }

  const renderCadastroAluno = () => `
    <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); max-width: 600px; margin: 0 auto;">
      <h3 style="margin-bottom: 1.5rem; color: var(--text-main);">Cadastrar Novo Aluno</h3>
      <p style="margin-bottom: 1.5rem; color: var(--text-muted); font-size: 0.9rem;">Crie uma nova conta de aluno no sistema. O aluno poderá fazer login imediatamente após o cadastro.</p>
      
      <form id="form-cadastro-aluno">
        <div class="form-group">
          <label class="label" for="aluno-nome">Nome Completo *</label>
          <input type="text" id="aluno-nome" name="aluno_nome" class="input" placeholder="João Silva" required>
        </div>

        <div class="form-group">
          <label class="label" for="aluno-email">E-mail *</label>
          <input type="email" id="aluno-email" name="aluno_email" class="input" placeholder="joao@email.com" required>
        </div>

        <div class="form-group">
          <label class="label" for="aluno-cpf">CPF</label>
          <input type="text" id="aluno-cpf" name="aluno_cpf" class="input" placeholder="000.000.000-00">
        </div>

        <div class="form-group">
          <label class="label" for="aluno-telefone">Telefone / WhatsApp</label>
          <input type="text" id="aluno-telefone" name="aluno_telefone" class="input" placeholder="(00) 00000-0000">
        </div>

        <div class="form-group">
          <label class="label" for="aluno-senha">Senha * (mínimo 6 caracteres)</label>
          <input type="password" id="aluno-senha" name="aluno_senha" class="input" placeholder="******" minlength="6" required>
        </div>

        <div class="form-group">
          <label class="label" for="aluno-turma">Matricular em Turma (opcional)</label>
          <select id="aluno-turma" name="aluno_turma" class="input">
            <option value="">-- Selecione uma turma --</option>
            ${turmas && turmas.length > 0 ? turmas.map(t => `
              <option value="${t.id}">${t.nome} (${t.periodo})</option>
            `).join('') : '<option value="">Nenhuma turma disponível</option>'}
          </select>
        </div>

        <button type="submit" class="btn btn-primary" id="btn-cadastrar" style="width: 100%;">Cadastrar Aluno</button>
      </form>
    </div>
  `

  container.innerHTML = `
    <header class="view-header">
      <h1 class="title">Painel da Secretaria</h1>
      <p class="subtitle">Gerencie as solicitações de todos os alunos do sistema.</p>
    </header>

    <div class="tabs-container">
      <button class="tab-btn active" data-tab="solicitacoes">Solicitações de Documentos</button>
      <button class="tab-btn" data-tab="cadastro">Cadastrar Aluno</button>
      <button class="tab-btn" data-tab="gerenciar">Gerenciar Alunos</button>
    </div>

    <div id="tab-solicitacoes" class="tab-content">
      ${renderRequests()}
    </div>

    <div id="tab-cadastro" class="tab-content" style="display: none;">
      ${renderCadastroAluno()}
    </div>

    <div id="tab-gerenciar" class="tab-content" style="display: none;">
      ${renderGerenciarAlunos()}
    </div>
  `

  // Lógica das tabs
  const tabBtns = container.querySelectorAll('.tab-btn')
  const tabContents = container.querySelectorAll('.tab-content')

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab')
      
      // Atualizar botões
      tabBtns.forEach(b => {
        b.classList.remove('active')
      })
      btn.classList.add('active')
      
      // Mostrar conteúdo
      tabContents.forEach(content => {
        content.style.display = 'none'
      })
      container.querySelector(`#tab-${tab}`).style.display = 'block'
    })
  })

  // Lógica de aprovação de documentos
  const approveBtns = container.querySelectorAll('.approve-btn')
  approveBtns.forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id')
      btn.disabled = true
      btn.textContent = 'Processando...'

      const { error } = await DocumentsService.updateStatus(id, 'concluído')

      if (error) {
        toast.error('Erro ao atualizar status: ' + error.message)
        btn.disabled = false
        btn.textContent = 'Concluir'
      } else {
        toast.success('Documento concluído com sucesso!')
        
        const row = container.querySelector(`#req-row-${id}`)
        if (row) {
          const statusCell = row.querySelector('.status-cell')
          const actionCell = row.querySelector('.action-cell')
          
          if (statusCell) {
            statusCell.innerHTML = `<span class="badge badge-success">concluído</span>`
          }
          if (actionCell) {
            actionCell.innerHTML = '<span class="text-muted">---</span>'
          }
        }
      }
    }
  })

  // Lógica de cadastro de aluno
  const formCadastro = container.querySelector('#form-cadastro-aluno')
  const btnCadastrar = container.querySelector('#btn-cadastrar')

  formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault()

    const nomeCompleto = container.querySelector('#aluno-nome').value.trim()
    const email = container.querySelector('#aluno-email').value.trim()
    const cpf = container.querySelector('#aluno-cpf').value.trim()
    const telefone = container.querySelector('#aluno-telefone').value.trim()
    const senha = container.querySelector('#aluno-senha').value
    const turmaId = container.querySelector('#aluno-turma').value

    if (!nomeCompleto || !email || !senha) {
      toast.error('Preencha os campos obrigatórios.')
      return
    }

    if (senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    btnCadastrar.disabled = true
    btnCadastrar.textContent = 'Cadastrando...'

    // Criar usuário
    const { data, error } = await AdminService.createUserByAdmin({
      email,
      password: senha,
      nomeCompleto,
      cpf,
      telefone,
      perfil: 'aluno'
    })

    if (error) {
      toast.error('Erro ao cadastrar: ' + error.message)
      btnCadastrar.disabled = false
      btnCadastrar.textContent = 'Cadastrar Aluno'
      return
    }

    // Se seleccionou turma, matricular
    if (turmaId && data?.userId) {
      const { error: erroMatricula } = await AdminService.matricularAluno(data.userId, turmaId)
      
      if (erroMatricula) {
        toast.warning('Aluno cadastrado, mas houve erro ao matricular na turma: ' + erroMatricula.message)
      } else {
        toast.success('Aluno cadastrado e matriculado com sucesso!')
      }
    } else {
      toast.success('Aluno cadastrado com sucesso!')
    }

    // Limpar formulário
    formCadastro.reset()
    btnCadastrar.disabled = false
    btnCadastrar.textContent = 'Cadastrar Aluno'
  })

  // Lógica de busca/filtro de alunos
  const buscaAlunoInput = container.querySelector('#busca-aluno')
  if (buscaAlunoInput) {
    buscaAlunoInput.addEventListener('input', () => {
      const termo = buscaAlunoInput.value.toLowerCase().trim()
      const rows = container.querySelectorAll('.aluno-row')
      
      rows.forEach(row => {
        const nome = row.getAttribute('data-nome').toLowerCase()
        const cpf = row.getAttribute('data-cpf').toLowerCase()
        
        if (nome.includes(termo) || cpf.includes(termo)) {
          row.style.display = ''
        } else {
          row.style.display = 'none'
        }
      })
    })
  }

  // Lógica de edição de aluno
  const btnsEditar = container.querySelectorAll('.btn-editar-aluno')
  const modalEditar = container.querySelector('#modal-editar-aluno')
  const btnFecharModal = container.querySelector('#btn-fechar-modal')
  const btnCancelarEdicao = container.querySelector('#btn-cancelar-edicao')
  const formEditar = container.querySelector('#form-editar-aluno')
  const btnSaveEdit = container.querySelector('#btn-salvar-edicao')

  btnsEditar.forEach(btn => {
    btn.addEventListener('click', async () => {
      const alunoId = btn.getAttribute('data-id')
      
      btn.disabled = true
      btn.textContent = '...'
      
      const { data: aluno, error } = await AdminService.getAlunoById(alunoId)
      
      btn.disabled = false
      btn.textContent = 'Editar'
      
      if (error) {
        toast.error('Erro ao carregar dados do aluno: ' + error.message)
        return
      }
      
      if (!aluno) {
        toast.error('Aluno não encontrado')
        return
      }
      
      // Preencher modal
      container.querySelector('#edit-aluno-id').value = aluno.id
      container.querySelector('#edit-nome').value = aluno.nome_completo || ''
      container.querySelector('#edit-cpf').value = aluno.cpf || ''
      container.querySelector('#edit-telefone').value = aluno.telefone || ''
      container.querySelector('#edit-email').value = aluno.email || ''
      container.querySelector('#edit-perfil').value = aluno.perfil || 'aluno'
      
      // Mostrar modal
      modalEditar.style.display = 'flex'
    })
  })

  // Fechar modal
  if (btnFecharModal) {
    btnFecharModal.addEventListener('click', () => {
      modalEditar.style.display = 'none'
    })
  }

  if (btnCancelarEdicao) {
    btnCancelarEdicao.addEventListener('click', () => {
      modalEditar.style.display = 'none'
    })
  }

  // Fechar modal clicando fora
  if (modalEditar) {
    modalEditar.addEventListener('click', (e) => {
      if (e.target === modalEditar) {
        modalEditar.style.display = 'none'
      }
    })
  }

  // Salvar edição
  if (formEditar) {
    formEditar.addEventListener('submit', async (e) => {
      e.preventDefault()
      
      const alunoId = container.querySelector('#edit-aluno-id').value
      const nomeCompleto = container.querySelector('#edit-nome').value.trim()
      const cpf = container.querySelector('#edit-cpf').value.trim()
      const telefone = container.querySelector('#edit-telefone').value.trim()
      
      if (!nomeCompleto) {
        toast.error('O nome completo é obrigatório.')
        return
      }
      
      btnSaveEdit.disabled = true
      btnSaveEdit.textContent = 'Salvando...'
      
      const { error } = await AdminService.updateAluno(alunoId, {
        nome_completo: nomeCompleto,
        cpf: cpf || null,
        telefone: telefone || null
      })
      
      if (error) {
        toast.error('Erro ao salvar: ' + error.message)
        btnSaveEdit.disabled = false
        btnSaveEdit.textContent = 'Salvar Alterações'
        return
      }
      
      toast.success('Dados do aluno atualizados com sucesso!')
      
      // Atualizar linha na tabela
      const row = container.querySelector(`.aluno-row[data-id="${alunoId}"]`)
      if (row) {
        row.querySelector('td:first-child .fw-600').textContent = nomeCompleto
        row.setAttribute('data-nome', nomeCompleto)
        row.setAttribute('data-cpf', cpf)
        row.querySelector('td:nth-child(3)').textContent = cpf || '-'
        row.querySelector('td:nth-child(4)').textContent = telefone || '-'
      }
      
      // Fechar modal
      modalEditar.style.display = 'none'
      
      btnSaveEdit.disabled = false
      btnSaveEdit.textContent = 'Salvar Alterações'
    })
  }

  return container
}
