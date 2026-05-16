import { AdminService } from '../../lib/admin-service'
import { StudentDetailsService } from '../../lib/student-details-service'
import { ExcelService } from '../../lib/excel-service'
import { StudentDetailsView } from '../../views/student-details'
import { toast } from '../../lib/toast'
import { escapeHTML } from '../../lib/security'

interface GerenciarAlunosProps {
  alunos: any[]
  turmas: any[]
  onRefresh?: () => void
}

export function GerenciarAlunosTab({ alunos, turmas, onRefresh }: GerenciarAlunosProps): HTMLDivElement {
  const container = document.createElement('div')
  
  // KPIs Calculados
  const totalAlunos = alunos.length
  const bloqueadosFinanc = alunos.filter(a => a.bloqueio_financeiro).length
  const regularFinanc = totalAlunos - bloqueadosFinanc

  const renderStats = () => `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
      <div class="stat-card" style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border-left: 4px solid var(--primary);">
        <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.025em;">Total de Alunos</div>
        <div style="font-size: 2rem; font-weight: 700; color: var(--text-main); margin-top: 0.5rem;">${totalAlunos}</div>
      </div>
      <div class="stat-card" style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border-left: 4px solid var(--success);">
        <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.025em;">Financeiro OK</div>
        <div style="font-size: 2rem; font-weight: 700; color: var(--success); margin-top: 0.5rem;">${regularFinanc}</div>
      </div>
      <div class="stat-card" style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border-left: 4px solid var(--danger);">
        <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.025em;">Bloqueios</div>
        <div style="font-size: 2rem; font-weight: 700; color: var(--danger); margin-top: 0.5rem;">${bloqueadosFinanc}</div>
      </div>
    </div>
  `

  const renderTable = () => {
    if (!alunos || alunos.length === 0) return '<p>Não há alunos cadastrados no momento.</p>'

    return `
      <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; gap: 1rem;">
          <div style="flex: 1; position: relative;">
            <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none;">🔍</span>
            <input type="text" id="busca-aluno" class="input" placeholder="Buscar por nome ou CPF..." style="padding-left: 2.5rem; width: 100%; max-width: 400px; margin: 0;">
          </div>
          <button id="btn-export-alunos" class="btn btn-primary btn-sm" style="background: #217346; color: white; font-weight: 600; height: 42px; display: flex; align-items: center; gap: 0.5rem;">
            📊 Exportar Lista
          </button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th style="width: 35%;">Aluno</th>
                <th style="width: 15%;">CPF</th>
                <th style="width: 30%;">Status 360°</th>
                <th style="width: 20%; text-align: right;">Ações</th>
              </tr>
            </thead>
            <tbody id="tabela-alunos-corpo">
              ${alunos.map(aluno => `
                <tr class="aluno-row" data-id="${aluno.id}" data-nome="${escapeHTML(aluno.nome_completo)}" data-cpf="${escapeHTML(aluno.cpf || '')}">
                  <td>
                    <div style="display: flex; flex-direction: column;">
                      <span class="fw-600 text-main" style="font-size: 0.95rem;">${escapeHTML(aluno.nome_completo)}</span>
                      <span style="font-size: 0.8rem; color: var(--text-muted);">${escapeHTML(aluno.email)}</span>
                    </div>
                  </td>
                  <td style="color: var(--text-muted); font-family: monospace; font-size: 0.85rem;">${escapeHTML(aluno.cpf || '-')}</td>
                  <td>
                    <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                      <!-- Financeiro -->
                      ${aluno.bloqueio_financeiro 
                        ? '<span class="badge" style="background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; font-size: 0.65rem; padding: 2px 8px;">🔴 Bloqueado</span>' 
                        : '<span class="badge" style="background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; font-size: 0.65rem; padding: 2px 8px;">🟢 Regular</span>'}
                      
                      <!-- Estágio -->
                      <span class="badge" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; font-size: 0.65rem; padding: 2px 8px;">🔵 Estágio: OK</span>
                      
                      <!-- Docs -->
                      <span class="badge" style="background: #fffbeb; color: #d97706; border: 1px solid #fef3c7; font-size: 0.65rem; padding: 2px 8px;">🟡 Docs Pend.</span>
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: flex; gap: 0.4rem; justify-content: flex-end;">
                      <button class="btn-ver-ficha" data-id="${aluno.id}" title="Ver Ficha" style="background: var(--secondary); border: 1px solid var(--border); border-radius: 6px; padding: 0.4rem; cursor: pointer;">👁️</button>
                      <button class="btn-editar-aluno" data-id="${aluno.id}" title="Editar" style="background: var(--secondary); border: 1px solid var(--border); border-radius: 6px; padding: 0.4rem; cursor: pointer;">✏️</button>
                      <button class="btn-vincular-turma" data-id="${aluno.id}" data-nome="${escapeHTML(aluno.nome_completo)}" title="Matricular" style="background: var(--primary); color: white; border: none; border-radius: 6px; padding: 0.4rem; cursor: pointer;">🎓</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `
  }

  const renderModais = () => `
    <!-- Modal de Edição -->
    <div id="modal-editar-aluno" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
      <div class="modal-content" style="background: white; padding: 2rem; border-radius: var(--radius-lg); max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3 style="margin: 0; color: var(--text-main);">Editar Aluno</h3>
          <button id="btn-fechar-modal-edicao" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
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
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="label" for="edit-rg">RG</label>
              <input type="text" id="edit-rg" name="rg" class="input">
            </div>
            <div class="form-group">
              <label class="label" for="edit-nascimento">Data de Nascimento</label>
              <input type="date" id="edit-nascimento" name="data_nascimento" class="input">
            </div>
          </div>
          <div class="form-group">
            <label class="label" for="edit-naturalidade">Naturalidade (Cidade/Estado)</label>
            <input type="text" id="edit-naturalidade" name="cidade_natal" class="input">
          </div>
          <div class="form-group">
            <label class="label" for="edit-endereco">Endereço Completo</label>
            <input type="text" id="edit-endereco" name="endereco" class="input" placeholder="Rua, Número, Bairro...">
          </div>
          <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
            <button type="button" id="btn-cancelar-edicao" class="btn" style="flex: 1; background: var(--secondary); color: var(--text-main);">Cancelar</button>
            <button type="submit" class="btn btn-primary" id="btn-salvar-edicao" style="flex: 1;">Salvar Alterações</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Matrícula -->
    <div id="modal-matricular-aluno" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
      <div class="modal-content" style="background: white; padding: 2rem; border-radius: var(--radius-lg); max-width: 500px; width: 90%; box-shadow: var(--shadow-lg); border-top: 5px solid var(--accent);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3 style="margin: 0; color: var(--text-main); font-size: 1.5rem;">🎓 Matricular Aluno</h3>
          <button id="btn-fechar-modal-matricula" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
        </div>
        <div style="background: var(--secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <p style="margin: 0; font-size: 0.9rem; color: var(--text-muted);">Aluno: <strong id="nome-aluno-matricula" style="color: var(--text-main);"></strong></p>
        </div>
        <form id="form-vincular-turma">
          <input type="hidden" id="vincular-aluno-id">
          <div class="form-group">
            <label class="label" for="vincular-turma-id">Selecione a Turma *</label>
            <select id="vincular-turma-id" class="input" required style="width: 100%;">
              <option value="">-- Selecione uma turma --</option>
              ${turmas.map(t => `<option value="${t.id}">${escapeHTML(t.nome)} - ${escapeHTML(t.periodo)}</option>`).join('')}
            </select>
          </div>
          <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button type="button" class="btn btn-cancelar-matricula" style="flex: 1; background: var(--secondary); border: 1px solid var(--border); color: var(--text-main);">Cancelar</button>
            <button type="submit" class="btn btn-primary" id="btn-confirmar-matricula" style="flex: 1;">Confirmar Matrícula</button>
          </div>
        </form>
      </div>
    </div>
  `

  container.innerHTML = `
    ${renderStats()}
    ${renderTable()}
    ${renderModais()}
  `

  // =====================================================
  // HANDLERS DE EVENTOS
  // =====================================================

  // Busca
  const buscaInput = container.querySelector('#busca-aluno') as HTMLInputElement
  if (buscaInput) {
    buscaInput.addEventListener('input', () => {
      const termo = buscaInput.value.toLowerCase().trim()
      const rows = container.querySelectorAll('.aluno-row')
      rows.forEach(row => {
        const nome = (row.getAttribute('data-nome') || '').toLowerCase()
        const cpf = (row.getAttribute('data-cpf') || '').toLowerCase()
        ;(row as HTMLElement).style.display = (nome.includes(termo) || cpf.includes(termo)) ? '' : 'none'
      })
    })
  }

  // Ficha
  const btnsVerFicha = container.querySelectorAll('.btn-ver-ficha')
  btnsVerFicha.forEach(btn => {
    btn.addEventListener('click', async () => {
      const alunoId = btn.getAttribute('data-id')!
      const btnEl = btn as HTMLButtonElement
      btnEl.disabled = true
      btnEl.textContent = '...'
      try {
        const detailsView = await StudentDetailsView(alunoId)
        const mainContainer = container.closest('.secretaria-view') || container.parentElement
        if (mainContainer) {
          mainContainer.innerHTML = ''
          mainContainer.appendChild(detailsView)
        }
      } catch (err) {
        toast.error('Erro ao carregar ficha do aluno')
      } finally {
        btnEl.disabled = false
      }
    })
  })

  // Edição - Abertura
  const modalEditar = container.querySelector('#modal-editar-aluno') as HTMLElement
  const btnsEditar = container.querySelectorAll('.btn-editar-aluno')
  btnsEditar.forEach(btn => {
    btn.addEventListener('click', async () => {
      const alunoId = btn.getAttribute('data-id')!
      const btnEl = btn as HTMLButtonElement
      btnEl.disabled = true
      btnEl.textContent = '...'

      try {
        const { data: aluno } = await AdminService.getAlunoById(alunoId)
        const { data: enderecoData } = await StudentDetailsService.getEndereco(alunoId)

        if (aluno) {
          ;(container.querySelector('#edit-aluno-id') as HTMLInputElement).value = aluno.id
          ;(container.querySelector('#edit-nome') as HTMLInputElement).value = aluno.nome_completo || ''
          ;(container.querySelector('#edit-cpf') as HTMLInputElement).value = aluno.cpf || ''
          ;(container.querySelector('#edit-telefone') as HTMLInputElement).value = aluno.telefone || ''
          ;(container.querySelector('#edit-email') as HTMLInputElement).value = aluno.email || ''
          ;(container.querySelector('#edit-rg') as HTMLInputElement).value = aluno.rg || ''
          ;(container.querySelector('#edit-nascimento') as HTMLInputElement).value = aluno.data_nascimento || ''
          ;(container.querySelector('#edit-naturalidade') as HTMLInputElement).value = aluno.cidade_natal || ''
          ;(container.querySelector('#edit-endereco') as HTMLInputElement).value = enderecoData?.logradouro || ''
          modalEditar.style.display = 'flex'
        }
      } catch (err) {
        toast.error('Erro ao carregar dados do aluno')
      } finally {
        btnEl.disabled = false
      }
    })
  })

  // Edição - Fechamento
  const fecharModalEdicao = () => modalEditar.style.display = 'none'
  container.querySelector('#btn-fechar-modal-edicao')?.addEventListener('click', fecharModalEdicao)
  container.querySelector('#btn-cancelar-edicao')?.addEventListener('click', fecharModalEdicao)

  // Edição - Submit
  const formEditar = container.querySelector('#form-editar-aluno') as HTMLFormElement
  if (formEditar) {
    formEditar.addEventListener('submit', async (e) => {
      e.preventDefault()
      const alunoId = (container.querySelector('#edit-aluno-id') as HTMLInputElement).value
      const nomeCompleto = (container.querySelector('#edit-nome') as HTMLInputElement).value.trim()
      const cpf = (container.querySelector('#edit-cpf') as HTMLInputElement).value.trim()
      const telefone = (container.querySelector('#edit-telefone') as HTMLInputElement).value.trim()
      const rg = (container.querySelector('#edit-rg') as HTMLInputElement).value.trim()
      const data_nascimento = (container.querySelector('#edit-nascimento') as HTMLInputElement).value
      const cidade_natal = (container.querySelector('#edit-naturalidade') as HTMLInputElement).value.trim()
      const endereco = (container.querySelector('#edit-endereco') as HTMLInputElement).value.trim()

      const btnSalvar = container.querySelector('#btn-salvar-edicao') as HTMLButtonElement
      btnSalvar.disabled = true
      btnSalvar.textContent = 'Salvando...'

      try {
        const { error } = await AdminService.updateAluno(alunoId, {
          nome_completo: nomeCompleto, cpf, telefone, rg, data_nascimento, cidade_natal
        })
        if (endereco) await StudentDetailsService.saveEndereco(alunoId, { logradouro: endereco })
        
        if (error) throw error
        toast.success('Dados atualizados!')
        fecharModalEdicao()
        if (onRefresh) onRefresh()
      } catch (err: any) {
        toast.error('Erro ao salvar: ' + err.message)
      } finally {
        btnSalvar.disabled = false
        btnSalvar.textContent = 'Salvar Alterações'
      }
    })
  }

  // Matrícula - Abertura
  const modalMatricula = container.querySelector('#modal-matricular-aluno') as HTMLElement
  const btnsMatricular = container.querySelectorAll('.btn-vincular-turma')
  btnsMatricular.forEach(btn => {
    btn.addEventListener('click', () => {
      const alunoId = btn.getAttribute('data-id')!
      const alunoNome = btn.getAttribute('data-nome')!
      ;(container.querySelector('#vincular-aluno-id') as HTMLInputElement).value = alunoId
      ;(container.querySelector('#nome-aluno-matricula') as HTMLElement).textContent = alunoNome
      modalMatricula.style.display = 'flex'
    })
  })

  // Matrícula - Fechamento
  const fecharModalMatricula = () => modalMatricula.style.display = 'none'
  container.querySelector('#btn-fechar-modal-matricula')?.addEventListener('click', fecharModalMatricula)
  container.querySelector('.btn-cancelar-matricula')?.addEventListener('click', fecharModalMatricula)

  // Matrícula - Submit
  const formMatricula = container.querySelector('#form-vincular-turma') as HTMLFormElement
  if (formMatricula) {
    formMatricula.addEventListener('submit', async (e) => {
      e.preventDefault()
      const alunoId = (container.querySelector('#vincular-aluno-id') as HTMLInputElement).value
      const turmaId = (container.querySelector('#vincular-turma-id') as HTMLSelectElement).value
      
      const btnSubmit = container.querySelector('#btn-confirmar-matricula') as HTMLButtonElement
      btnSubmit.disabled = true
      btnSubmit.textContent = 'Matriculando...'

      try {
        const { error } = await AdminService.matricularAluno(alunoId, turmaId)
        if (error) throw error
        toast.success('Matriculado com sucesso!')
        fecharModalMatricula()
        if (onRefresh) onRefresh()
      } catch (err: any) {
        toast.error('Erro ao matricular: ' + err.message)
      } finally {
        btnSubmit.disabled = false
        btnSubmit.textContent = 'Confirmar Matrícula'
      }
    })
  }

  // Exportação
  container.querySelector('#btn-export-alunos')?.addEventListener('click', () => {
    try {
      ExcelService.exportAlunos(alunos)
      toast.success('Exportado com sucesso!')
    } catch (err: any) {
      toast.error('Erro ao exportar: ' + err.message)
    }
  })

  return container
}
