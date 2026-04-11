import { FinanceiroService } from '../lib/financeiro-service'
import { AdminService } from '../lib/admin-service'
import { toast } from '../lib/toast'

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
  const [resumoRes, inadimplentesRes, configRes] = await Promise.all([
    FinanceiroService.getResumo(),
    FinanceiroService.getInadimplentes(),
    FinanceiroService.getConfig()
  ])

  const resumo = resumoRes.data || { totalInadimplente: 0, totalRecuperado: 0, totalPrevisto: 0, contagemAtrasados: 0 }
  const inadimplentes = inadimplentesRes.data || []
  const configs = configRes.data || { multa_atraso: 0.02, juros_mensal: 0.01 }

  const renderDashboard = () => `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
      <div class="card-stats" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: var(--shadow-sm); border-left: 5px solid var(--danger);">
        <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Total em Atraso</div>
        <div style="font-size: 1.75rem; font-weight: 700; color: var(--primary);">R$ ${resumo.totalInadimplente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">De ${resumo.contagemAtrasados} alunos inadimplentes</div>
      </div>
      
      <div class="card-stats" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: var(--shadow-sm); border-left: 5px solid var(--success);">
        <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Recuperação (Mês)</div>
        <div style="font-size: 1.75rem; font-weight: 700; color: var(--success);">R$ ${resumo.totalRecuperado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">Via acordos e pagamentos diretos</div>
      </div>

      <div class="card-stats" style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: var(--shadow-sm); border-left: 5px solid var(--accent);">
        <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Taxa de Inadimplência</div>
        <div style="font-size: 1.75rem; font-weight: 700; color: var(--text-main);">${((resumo.totalInadimplente / (resumo.totalPrevisto || 1)) * 100).toFixed(1)}%</div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">Sobre o faturamento total previsto</div>
      </div>
    </div>
  `

  const renderInadimplentes = () => `
    <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: var(--shadow-sm);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 style="margin: 0;">Gestão de Inadimplentes</h3>
        <input type="text" id="busca-inadimplente" class="input" placeholder="Buscar por nome ou CPF..." style="max-width: 300px;">
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Parcelas Atrás</th>
              <th>Valor Principal</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="lista-inadimplentes">
            ${inadimplentes.length === 0 ? '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Nenhuma inadimplência encontrada.</td></tr>' : 
              inadimplentes.map(aluno => {
                const totalPrincipal = aluno.pagamentos.reduce((acc, p) => acc + Number(p.valor_original), 0)
                return `
                  <tr class="inadimplente-row">
                    <td>
                      <div class="fw-600 text-main">${escapeHTML(aluno.nome_completo)}</div>
                      <div class="text-sm text-muted">${escapeHTML(aluno.cpf || 'Sem CPF')}</div>
                    </td>
                    <td><span class="badge badge-warning">${aluno.pagamentos.length} parcela(s)</span></td>
                    <td>R$ ${totalPrincipal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>
                      <button class="btn btn-primary btn-sm btn-negociar" 
                        data-id="${aluno.id}" 
                        data-nome="${escapeHTML(aluno.nome_completo)}"
                        data-valor="${totalPrincipal}">
                        🤝 Negociar
                      </button>
                    </td>
                  </tr>
                `
              }).join('')
            }
          </tbody>
        </table>
      </div>
    </div>
  `

  const renderRenegociacaoModal = () => `
    <div id="modal-negociacao" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
      <div class="modal-content" style="background: white; padding: 2rem; border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; position: relative;">
        <button id="btn-fechar-negociacao" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
        
        <h2 style="margin-bottom: 0.5rem; color: var(--primary);">Calculadora de Acordo</h2>
        <p style="margin-bottom: 2rem; color: var(--text-muted);">Aluno: <strong id="negociacao-nome-aluno"></strong></p>

        <div style="background: var(--bg-app); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div>
              <label class="label">Valor Principal</label>
              <div id="negociacao-valor-base" style="font-size: 1.25rem; font-weight: 700;">R$ 0,00</div>
            </div>
            <div>
              <label class="label">Multas/Juros (+)</label>
              <div id="negociacao-valor-taxas" style="font-size: 1.25rem; font-weight: 700; color: var(--danger);">R$ 0,00</div>
            </div>
          </div>
        </div>

        <form id="form-acordo">
          <input type="hidden" id="negociacao-aluno-id">
          
          <div class="form-group">
            <label class="label">Desconto no Acordo (R$)</label>
            <input type="number" id="negociacao-desconto" class="input" value="0" step="0.01">
          </div>

          <div class="form-group">
            <label class="label">Parcelamento</label>
            <select id="negociacao-parcelas" class="input">
              <option value="1">À vista</option>
              <option value="2">2x</option>
              <option value="3">3x</option>
              <option value="4">4x</option>
              <option value="5">5x</option>
              <option value="6">6x</option>
              <option value="10">10x</option>
              <option value="12">12x</option>
            </select>
          </div>

          <div style="background: var(--primary); color: white; padding: 1.5rem; border-radius: 8px; margin-top: 2rem; text-align: center;">
            <div style="font-size: 0.9rem; opacity: 0.9;">Total do Acordo</div>
            <div id="negociacao-total-final" style="font-size: 2rem; font-weight: 700; margin: 0.5rem 0;">R$ 0,00</div>
            <div id="negociacao-resumo-parcela" style="font-size: 1rem; font-weight: 500;">(1x de R$ 0,00)</div>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 1.5rem; height: 56px; font-size: 1.1rem;">
            Confirmar e Gerar Termo
          </button>
        </form>
      </div>
    </div>
  `

  container.innerHTML = `
    <header class="view-header">
      <h1 class="title">Gestão Financeira</h1>
      <p class="subtitle">Controle de inadimplência, cálculos de juros e acordos financeiros.</p>
    </header>

    ${renderDashboard()}
    ${renderInadimplentes()}
    ${renderRenegociacaoModal()}
  `

  // Eventos da Calculadora
  const modal = container.querySelector('#modal-negociacao')
  const formAcordo = container.querySelector('#form-acordo')
  const inputDesconto = container.querySelector('#negociacao-desconto')
  const selectParcelas = container.querySelector('#negociacao-parcelas')

  let currentNegociacao = {
    alunoId: '',
    valorBase: 0,
    taxas: 0
  }

  const atualizarCalculo = () => {
    const desconto = Number(inputDesconto.value) || 0
    const parcelas = Number(selectParcelas.value)
    const total = currentNegociacao.valorBase + currentNegociacao.taxas - desconto
    const valorParcela = total / parcelas

    container.querySelector('#negociacao-total-final').textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    container.querySelector('#negociacao-resumo-parcela').textContent = `(${parcelas}x de R$ ${valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`
  }

  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-negociar')) {
      const btn = e.target
      currentNegociacao.alunoId = btn.dataset.id
      currentNegociacao.valorBase = Number(btn.dataset.valor)
      
      // Cálculo simplificado de taxas (Ex: 2% multa + 5% juros fixos pra simulação)
      currentNegociacao.taxas = currentNegociacao.valorBase * (configs.multa_atraso + configs.juros_mensal)

      container.querySelector('#negociacao-nome-aluno').textContent = btn.dataset.nome
      container.querySelector('#negociacao-aluno-id').value = btn.dataset.id
      container.querySelector('#negociacao-valor-base').textContent = `R$ ${currentNegociacao.valorBase.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      container.querySelector('#negociacao-valor-taxas').textContent = `R$ ${currentNegociacao.taxas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      
      atualizarCalculo()
      modal.style.display = 'flex'
    }

    if (e.target.id === 'btn-fechar-negociacao') {
      modal.style.display = 'none'
    }
  })

  inputDesconto.addEventListener('input', atualizarCalculo)
  selectParcelas.addEventListener('change', atualizarCalculo)

  formAcordo.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    const submitBtn = e.target.querySelector('button[type="submit"]')
    submitBtn.disabled = true
    submitBtn.textContent = 'Processando...'

    const desconto = Number(inputDesconto.value) || 0
    const parcelas = Number(selectParcelas.value)
    const total = currentNegociacao.valorBase + currentNegociacao.taxas - desconto
    
    const { error } = await FinanceiroService.criarAcordo({
      alunoId: currentNegociacao.alunoId,
      totalDebito: currentNegociacao.valorBase + currentNegociacao.taxas,
      totalComDesconto: total,
      numeroParcelas: parcelas,
      valorParcela: total / parcelas
    })

    if (error) {
      toast.error('Erro ao gerar acordo: ' + error.message)
      submitBtn.disabled = false
      submitBtn.textContent = 'Confirmar e Gerar Termo'
    } else {
      toast.success('Acordo financeiro registrado com sucesso!')
      modal.style.display = 'none'
      // Recarregar view
      window.location.reload()
    }
  })

  return container
}
