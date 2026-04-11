import { FinanceiroService } from '../lib/financeiro-service'
import { AdminService } from '../lib/admin-service'
import { toast } from '../lib/toast'
import { supabase } from '../lib/supabase'

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

export async function FinanceiroView() {
  const container = document.createElement('div')
  container.className = 'financeiro-view animate-in'

  // Carregar dados iniciais
  const [resumoRes, todosAlunosRes, configRes] = await Promise.all([
    FinanceiroService.getResumo(),
    AdminService.listAlunos(), // Pegar lista completa de alunos
    FinanceiroService.getConfig()
  ])

  const resumo = resumoRes.data || { totalInadimplente: 0, totalRecuperado: 0, totalPrevisto: 0, contagemAtrasados: 0 }
  const todosAlunos = todosAlunosRes.data || []
  const configs = configRes.data || { multa_atraso: 0.02, juros_mensal: 0.01 }

  // Buscar pagamentos atrasados para marcar na lista principal
  const { data: todosPagamentos } = await supabase.from('pagamentos').select('*')

  const renderDashboard = () => `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
      <div class="card-stats" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: var(--shadow-sm); border-left: 5px solid var(--danger);">
        <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Total em Atraso</div>
        <div id="stat-atraso" style="font-size: 1.75rem; font-weight: 700; color: var(--primary);">R$ ${resumo.totalInadimplente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
      </div>
      <div class="card-stats" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: var(--shadow-sm); border-left: 5px solid var(--success);">
        <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Recuperação do Mês</div>
        <div style="font-size: 1.75rem; font-weight: 700; color: var(--success);">R$ ${resumo.totalRecuperado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
      </div>
    </div>
  `

  const renderFiltros = () => `
    <div style="background: white; padding: 1.5rem; border-radius: 12px 12px 0 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
      <h3 style="margin: 0;">Gestão Financeira de Alunos</h3>
      <div style="display: flex; gap: 1rem;">
        <input type="text" id="busca-aluno-financeiro" class="input" placeholder="Buscar por nome ou CPF..." style="width: 300px; margin: 0;">
      </div>
    </div>
  `

  const renderTabela = () => {
    return `
      <div class="table-responsive" style="background: white; border-radius: 0 0 12px 12px; box-shadow: var(--shadow-sm);">
        <table class="data-table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Status Financeiro</th>
              <th>Dívida Total</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="lista-alunos-financeiro">
            ${todosAlunos.map(aluno => {
              const pagamentosAluno = todosPagamentos?.filter(p => p.aluno_id === aluno.id) || []
              const totalAtrasado = pagamentosAluno
                .filter(p => p.status === 'atrasado')
                .reduce((acc, p) => acc + Number(p.valor_original), 0)
              
              const emAtraso = totalAtrasado > 0

              return `
                <tr class="aluno-fin-row" data-id="${aluno.id}">
                  <td>
                    <div class="fw-600 text-main">${escapeHTML(aluno.nome_completo)}</div>
                    <div class="text-sm text-muted">${escapeHTML(aluno.cpf || 'Sem CPF')}</div>
                  </td>
                  <td>
                    <span class="badge ${emAtraso ? 'badge-warning' : 'badge-success'}">
                      ${emAtraso ? `Inadimplente (${pagamentosAluno.filter(p => p.status === 'atrasado').length})` : 'Em dia / Sem débitos'}
                    </span>
                  </td>
                  <td style="font-weight: 600; color: ${emAtraso ? 'var(--danger)' : 'var(--text-main)'}">
                    R$ ${totalAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <div style="display: flex; gap: 0.5rem;">
                      <button class="btn btn-sm btn-lancar-debito" data-id="${aluno.id}" data-nome="${escapeHTML(aluno.nome_completo)}" style="background: var(--bg-app); border: 1px solid var(--border);">➕ Lançar</button>
                      ${emAtraso ? `<button class="btn btn-primary btn-sm btn-negociar" data-id="${aluno.id}" data-nome="${escapeHTML(aluno.nome_completo)}" data-valor="${totalAtrasado}">🤝 Acordo</button>` : ''}
                    </div>
                  </td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      </div>
    `
  }

  const renderModais = () => `
    <!-- Modal Lançar Débito -->
    <div id="modal-lancar-debito" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
      <div class="modal-content" style="background: white; padding: 2rem; border-radius: 12px; max-width: 400px; width: 90%;">
        <h3 style="margin-bottom: 1.5rem;">Lançar Novo Débito</h3>
        <p id="lancar-nome-aluno" style="font-weight: 600; margin-bottom: 1.5rem;"></p>
        <form id="form-lancar-debito">
          <input type="hidden" id="lancar-aluno-id">
          <div class="form-group">
            <label class="label">Descrição (ex: Mensalidade Abril)</label>
            <input type="text" id="lancar-desc" class="input" required>
          </div>
          <div class="form-group">
            <label class="label">Valor (R$)</label>
            <input type="number" id="lancar-valor" class="input" step="0.01" required>
          </div>
          <div class="form-group">
            <label class="label">Vencimento</label>
            <input type="date" id="lancar-vencimento" class="input" required>
          </div>
          <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <button type="button" class="btn btn-fechar-lancar" style="flex: 1;">Cancelar</button>
            <button type="submit" class="btn btn-primary" style="flex: 1;">Confirmar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Renegociação (Acordo) -->
    <div id="modal-negociacao" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
      <div class="modal-content" style="background: white; padding: 2rem; border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
        <h2 style="color: var(--primary);">Calculadora de Acordo</h2>
        <p id="negociacao-nome-aluno" style="margin-bottom: 1.5rem; font-weight: 600;"></p>
        
        <div style="background: var(--bg-app); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div><label class="label">Principal</label><div id="neg-valor-base" style="font-weight: 700;"></div></div>
          <div><label class="label">Multas/Juros</label><div id="neg-valor-taxas" style="color: var(--danger); font-weight: 700;"></div></div>
        </div>

        <form id="form-acordo">
          <input type="hidden" id="neg-aluno-id">
          <div class="form-group"><label class="label">Desconto (R$)</label><input type="number" id="neg-desconto" class="input" value="0"></div>
          <div class="form-group">
            <label class="label">Parcelamento</label>
            <select id="neg-parcelas" class="input">
              <option value="1">A vista</option>
              <option value="2">2x</option>
              <option value="3">3x</option>
              <option value="6">6x</option>
              <option value="12">12x</option>
            </select>
          </div>
          <div style="background: var(--primary); color: white; padding: 1rem; border-radius: 8px; text-align: center;">
            <div id="neg-total" style="font-size: 1.5rem; font-weight: 700;"></div>
            <div id="neg-resumo"></div>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Confirmar Acordo</button>
          <button type="button" class="btn btn-fechar-neg" style="width: 100%; margin-top: 0.5rem; background: var(--secondary);">Fechar</button>
        </form>
      </div>
    </div>
  `

  container.innerHTML = `
    <header class="view-header">
      <h1 class="title">Painel Financeiro</h1>
      <p class="subtitle">Gestão de mensalidades, cobranças e acordos financeiros.</p>
    </header>
    ${renderDashboard()}
    ${renderFiltros()}
    ${renderTabela()}
    ${renderModais()}
  `

  // --- Lógica de Eventos ---

  // Busca
  const inputBusca = container.querySelector('#busca-aluno-financeiro')
  inputBusca.addEventListener('input', (e) => {
    const termo = e.target.value.toLowerCase()
    container.querySelectorAll('.aluno-fin-row').forEach(row => {
      row.style.display = row.innerText.toLowerCase().includes(termo) ? '' : 'none'
    })
  })

  // Modal Lançar Débito
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-lancar-debito')) {
      const btn = e.target
      container.querySelector('#lancar-nome-aluno').textContent = btn.dataset.nome
      container.querySelector('#lancar-aluno-id').value = btn.dataset.id
      container.querySelector('#modal-lancar-debito').style.display = 'flex'
    }
    if (e.target.classList.contains('btn-fechar-lancar')) {
      container.querySelector('#modal-lancar-debito').style.display = 'none'
    }
    if (e.target.classList.contains('btn-fechar-neg')) {
      container.querySelector('#modal-negociacao').style.display = 'none'
    }
  })

  // Salvar Débito
  const formLancar = container.querySelector('#form-lancar-debito')
  formLancar.addEventListener('submit', async (e) => {
    e.preventDefault()
    const alunoId = container.querySelector('#lancar-aluno-id').value
    const desc = container.querySelector('#lancar-desc').value
    const valor = container.querySelector('#lancar-valor').value
    const vencimento = container.querySelector('#lancar-vencimento').value

    const status = new Date(vencimento) < new Date() ? 'atrasado' : 'pendente'

    const { error } = await supabase.from('pagamentos').insert({
      aluno_id: alunoId,
      descricao: desc,
      valor_original: valor,
      data_vencimento: vencimento,
      status: status
    })

    if (error) toast.error('Erro: ' + error.message)
    else {
      toast.success('Débito lançado com sucesso!')
      window.location.reload()
    }
  })

  // Calculadora de Acordo
  let currentNeg = { base: 0, taxas: 0 }
  const atualizarCalculo = () => {
    const desc = Number(container.querySelector('#neg-desconto').value) || 0
    const parc = Number(container.querySelector('#neg-parcelas').value)
    const total = currentNeg.base + currentNeg.taxas - desc
    container.querySelector('#neg-total').textContent = `Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    container.querySelector('#neg-resumo').textContent = `${parc}x de R$ ${(total / parc).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  }

  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-negociar')) {
      const btn = e.target
      currentNeg.base = Number(btn.dataset.valor)
      currentNeg.taxas = currentNeg.base * (configs.multa_atraso + configs.juros_mensal)
      
      container.querySelector('#negociacao-nome-aluno').textContent = btn.dataset.nome
      container.querySelector('#neg-aluno-id').value = btn.dataset.id
      container.querySelector('#neg-valor-base').textContent = `R$ ${currentNeg.base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      container.querySelector('#neg-valor-taxas').textContent = `R$ ${currentNeg.taxas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      
      atualizarCalculo()
      container.querySelector('#modal-negociacao').style.display = 'flex'
    }
  })

  container.querySelector('#neg-desconto').oninput = atualizarCalculo
  container.querySelector('#neg-parcelas').onchange = atualizarCalculo

  container.querySelector('#form-acordo').onsubmit = async (e) => {
    e.preventDefault()
    const total = currentNeg.base + currentNeg.taxas - (Number(container.querySelector('#neg-desconto').value) || 0)
    const res = await FinanceiroService.criarAcordo({
      alunoId: container.querySelector('#neg-aluno-id').value,
      totalDebito: currentNeg.base + currentNeg.taxas,
      totalComDesconto: total,
      numeroParcelas: container.querySelector('#neg-parcelas').value,
      valorParcela: total / Number(container.querySelector('#neg-parcelas').value)
    })
    if (res.error) toast.error(res.error.message)
    else {
      toast.success('Acordo firmado!')
      window.location.reload()
    }
  }

  return container
}
