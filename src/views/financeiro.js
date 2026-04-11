import { FinanceiroService } from '../lib/financeiro-service'
import { AdminService } from '../lib/admin-service'
import { toast } from '../lib/toast'
import { supabase } from '../lib/supabase'
import { PDFService } from '../lib/pdf-service'

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
    AdminService.listAlunos(),
    FinanceiroService.getConfig()
  ])

  const resumo = resumoRes.data || { totalInadimplente: 0, totalRecuperado: 0, totalPrevisto: 0, contagemAtrasados: 0 }
  const todosAlunos = todosAlunosRes.data || []
  const configs = configRes.data || { multa_atraso: 0.02, juros_mensal: 0.01 }
  
  // Buscar pagamentos ativos
  const { data: todosPagamentos } = await supabase.from('pagamentos').select('*')

  const renderDashboard = () => `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
      <div class="card-stats" style="background: white; padding: 1.5rem; border-radius: 15px; box-shadow: var(--shadow-md); border-top: 4px solid var(--primary);">
        <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Volume em Atraso</div>
        <div style="font-size: 2rem; font-weight: 800; color: var(--primary);">R$ ${resumo.totalInadimplente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
      </div>
      <div class="card-stats" style="background: white; padding: 1.5rem; border-radius: 15px; box-shadow: var(--shadow-md); border-top: 4px solid var(--success);">
        <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Acordos Recuperados</div>
        <div style="font-size: 2rem; font-weight: 800; color: var(--success);">R$ ${resumo.totalRecuperado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
      </div>
    </div>
  `

  container.innerHTML = `
    <header class="view-header" style="margin-bottom: 2rem;">
      <h1 class="title" style="color: var(--primary); display: flex; align-items: center; gap: 10px;">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        Painel Financeiro & Acordos
      </h1>
      <p class="subtitle">Gestão de cobrança inspirada no modelo comercial CSM.</p>
    </header>

    ${renderDashboard()}

    <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: var(--shadow-sm); margin-bottom: 2rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 style="margin: 0;">Lista de Alunos</h3>
        <input type="text" id="busca-aluno-financeiro" class="input" placeholder="🔍 Buscar por nome ou CPF..." style="max-width: 350px;">
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
             <tr>
               <th>Aluno</th>
               <th>Status</th>
               <th>Débitos</th>
               <th>Ação</th>
             </tr>
          </thead>
          <tbody id="lista-alunos-financeiro">
            ${todosAlunos.map(aluno => {
              const pAluno = todosPagamentos?.filter(p => p.aluno_id === aluno.id) || []
              const atrasados = pAluno.filter(p => p.status === 'atrasado')
              const sumAtrasado = atrasados.reduce((a, b) => a + Number(b.valor_original), 0)
              
              return `
                <tr class="aluno-fin-row">
                  <td>
                    <div class="fw-600">${escapeHTML(aluno.nome_completo)}</div>
                    <div class="text-sm text-muted">${escapeHTML(aluno.cpf || 'Sem CPF')}</div>
                  </td>
                  <td>
                     <span class="badge ${atrasados.length > 0 ? 'badge-warning' : 'badge-success'}">
                        ${atrasados.length > 0 ? `Inadimplente (${atrasados.length})` : 'Em Dia'}
                     </span>
                  </td>
                  <td style="font-weight: 700; color: ${atrasados.length > 0 ? 'var(--danger)' : 'var(--text-main)'}">
                    R$ ${sumAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <div style="display: flex; gap: 8px;">
                      <button class="btn btn-sm btn-lancar-debito" data-id="${aluno.id}" data-nome="${escapeHTML(aluno.nome_completo)}">➕ Lançar</button>
                      <button class="btn btn-primary btn-sm btn-fatura" data-id="${aluno.id}" data-nome="${escapeHTML(aluno.nome_completo)}">💳 Ficha Financeira</button>
                    </div>
                  </td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL PREMIUM DE NEGOCIAÇÃO -->
    <div id="modal-premium-calculo" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(5px);">
      <div class="modal-content" style="background: var(--bg-app); border-radius: 20px; max-width: 1000px; width: 95%; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; border: 1px solid var(--border);">
        
        <div style="background: var(--primary); color: white; padding: 1.5rem 2rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="margin: 0; font-size: 1.5rem;">Ficha Financeira & Acordo</h2>
            <p id="calc-aluno-nome" style="margin: 0; opacity: 0.9; font-size: 0.9rem;"></p>
          </div>
          <button id="btn-fechar-premium" style="background: rgba(0,0,0,0.2); border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.5rem;">&times;</button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 350px; flex: 1; overflow: hidden;">
          
          <!-- LADO ESQUERDO: LISTAGEM DE DÉBITOS (IGUAL AS MATÉRIAS) -->
          <div style="padding: 2rem; overflow-y: auto; background: white;">
            <h4 style="margin-bottom: 1.5rem; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.1em; color: var(--text-muted);">Mensalidades e Pendências</h4>
            <div id="calc-lista-debitos" style="display: flex; flex-direction: column; gap: 12px;">
               <!-- Populado via JS -->
            </div>
            
            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border);">
               <h4 style="margin-bottom: 1rem; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.1em; color: var(--text-muted);">Ajustes Oficiais</h4>
               <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                  <div class="form-group">
                    <label class="label">Desconto no Acordo (R$)</label>
                    <input type="number" id="premium-desconto" class="input" value="0" step="0.01">
                  </div>
                  <div class="form-group">
                    <label class="label">Plano de Parcelas</label>
                    <select id="premium-parcelas" class="input">
                       <option value="1">À Vista (PIX/Débito)</option>
                       <option value="2">2x sem juros</option>
                       <option value="3">3x sem juros</option>
                       <option value="6">6x com juros administrat.</option>
                       <option value="12">12x com juros administrat.</option>
                    </select>
                  </div>
               </div>
            </div>
          </div>

          <!-- LADO DIREITO: RESUMO DO RECEBIMENTO (PREMIUM) -->
          <div style="background: #1a1a1a; color: white; padding: 2rem; display: flex; flex-direction: column;">
            <div style="flex: 1;">
              <h4 style="color: var(--accent); text-transform: uppercase; font-size: 0.8rem; margin-bottom: 2rem;">Resumo da Proposta</h4>
              
              <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="opacity: 0.7;">Principal Selecionado:</span>
                  <span id="res-principal">R$ 0,00</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="opacity: 0.7;">Multas e Juros acumulados:</span>
                  <span style="color: #ff4d4d;" id="res-taxas">+ R$ 0,00</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="opacity: 0.7;">Desconto aplicado:</span>
                  <span style="color: var(--success);" id="res-desconto">- R$ 0,00</span>
                </div>
              </div>

              <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.5rem; margin-top: 1.5rem;">
                <div style="font-size: 0.8rem; opacity: 0.6; text-transform: uppercase;">Valor Final do Acordo</div>
                <div id="res-total" style="font-size: 2.2rem; font-weight: 800; color: var(--accent); margin: 0.5rem 0;">R$ 0,00</div>
                <div id="res-parcelas" style="font-size: 1.1rem; font-weight: 500; opacity: 0.9;">(1x de R$ 0,00)</div>
              </div>
            </div>

            <button id="btn-confirmar-acordo" class="btn" style="background: var(--success); color: white; width: 100%; height: 50px; font-size: 1.1rem; font-weight: 800; border-radius: 12px; margin-bottom: 0.5rem;">
              EFETIVAR ACORDO
            </button>
            <button id="btn-gerar-recibo" class="btn" style="background: var(--accent); color: #000; width: 100%; height: 50px; font-size: 1rem; font-weight: 800; border-radius: 12px;">
              📄 GERAR RECIBO / TERMO
            </button>
            <p style="font-size: 0.7rem; text-align: center; margin-top: 1rem; opacity: 0.5;">
              Ao clicar em gerar recibo, o Termo de Acordo será baixado em PDF.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL LANÇAMENTO RÁPIDO -->
    <div id="modal-lancar-debito" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1001; justify-content: center; align-items: center;">
      <div class="modal-content" style="background: white; padding: 2rem; border-radius: 12px; max-width: 400px; width: 90%;">
        <h3>Lançar Novo Débito</h3>
        <p id="lancar-aluno-nome" style="font-weight: 600; margin-bottom: 1rem;"></p>
        <form id="form-lancar-debito">
           <input type="hidden" id="lancar-aluno-id">
           <div class="form-group"><label class="label">Descrição</label><input type="text" id="lancar-desc" class="input" placeholder="Mensalidade..." required></div>
           <div class="form-group"><label class="label">Valor Nominal</label><input type="number" id="lancar-valor" class="input" step="0.01" required></div>
           <div class="form-group"><label class="label">Vencimento Original</label><input type="date" id="lancar-data" class="input" required></div>
           <div style="display: flex; gap: 10px;">
              <button type="button" class="btn btn-fechar-lancar" style="flex: 1;">Cancelar</button>
              <button type="submit" class="btn btn-primary" style="flex: 1;">Registrar</button>
           </div>
        </form>
      </div>
    </div>
  `

  // --- LÓGICA DO PAINEL ---
  
  const modalPremium = container.querySelector('#modal-premium-calculo')
  const listaDebitosUI = container.querySelector('#calc-lista-debitos')
  let debitosSelecionados = []
  let alunoAtual = null

  const atualizarResumo = () => {
    const principal = debitosSelecionados.reduce((a, b) => a + Number(b.valor_original), 0)
    // Multa 2% + Juros 1% sobre cada selecionado
    const taxas = debitosSelecionados.reduce((a, b) => {
       const dias = (new Date() - new Date(b.data_vencimento)) / (1000 * 60 * 60 * 24)
       if (dias <= 0) return a
       return a + (Number(b.valor_original) * 0.02) + (Number(b.valor_original) * 0.01)
    }, 0)
    
    const desconto = Number(container.querySelector('#premium-desconto').value) || 0
    const parcelas = Number(container.querySelector('#premium-parcelas').value)
    const total = (principal + taxas) - desconto
    
    container.querySelector('#res-principal').textContent = `R$ ${principal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    container.querySelector('#res-taxas').textContent = `+ R$ ${taxas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    container.querySelector('#res-desconto').textContent = `- R$ ${desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    container.querySelector('#res-total').textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    container.querySelector('#res-parcelas').textContent = `(${parcelas}x de R$ ${(total/parcelas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`
  }

  container.addEventListener('click', async (e) => {
    // ABRIR FICHA FINANCEIRA (MODAL PREMIUM)
    if (e.target.classList.contains('btn-fatura')) {
      const { id, nome } = e.target.dataset
      alunoAtual = id
      container.querySelector('#calc-aluno-nome').textContent = nome
      
      const { data: debitos } = await FinanceiroService.getHistoricoAluno(id)
      
      listaDebitosUI.innerHTML = debitos.map(d => `
        <div class="debito-item" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 2px solid var(--bg-app); border-radius: 12px; transition: all 0.2s;">
          <input type="checkbox" class="check-debito" data-id="${d.id}" ${d.status === 'atrasado' ? 'checked' : ''} style="width: 20px; height: 20px;">
          <div style="flex: 1;">
            <div style="font-weight: 700;">${escapeHTML(d.descricao)}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Vencimento: ${new Date(d.data_vencimento).toLocaleDateString()}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 800;">R$ ${Number(d.valor_original).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <span class="badge ${d.status === 'atrasado' ? 'badge-warning' : 'badge-success'}" style="font-size: 0.6rem;">${d.status}</span>
          </div>
        </div>
      `).join('')

      debitosSelecionados = debitos.filter(d => d.status === 'atrasado')
      atualizarResumo()
      modalPremium.style.display = 'flex'
    }

    if (e.target.id === 'btn-fechar-premium') modalPremium.style.display = 'none'
  })

  // Evento dos Checkboxes (Matérias -> Mensalidades)
  listaDebitosUI.addEventListener('change', async (e) => {
    if (e.target.classList.contains('check-debito')) {
       const { data: todos } = await FinanceiroService.getHistoricoAluno(alunoAtual)
       const idsSelecionados = Array.from(listaDebitosUI.querySelectorAll('.check-debito:checked')).map(i => i.dataset.id)
       debitosSelecionados = todos.filter(d => idsSelecionados.includes(d.id))
       atualizarResumo()
    }
  })

  container.querySelector('#premium-desconto').oninput = atualizarResumo
  container.querySelector('#premium-parcelas').onchange = atualizarResumo

  // GERAR PDF DO ACORDO
  container.querySelector('#btn-gerar-recibo').addEventListener('click', async () => {
    if (debitosSelecionados.length === 0) {
      toast.error('Selecione pelo menos uma parcela para gerar o recibo.')
      return
    }

    const principal = debitosSelecionados.reduce((a, b) => a + Number(b.valor_original), 0)
    const taxas = debitosSelecionados.reduce((a, b) => {
       const dias = (new Date() - new Date(b.data_vencimento)) / (1000 * 60 * 60 * 24)
       if (dias <= 0) return a
       return a + (Number(b.valor_original) * 0.02) + (Number(b.valor_original) * 0.01)
    }, 0)
    
    const desconto = Number(container.querySelector('#premium-desconto').value) || 0
    const total = (principal + taxas) - desconto

    try {
      // Buscar dados completos do aluno para o CPF
      const { data: aluno } = await AdminService.getUserById(alunoAtual)
      
      const acordoData = {
        valorOriginal: principal,
        multa: principal * 0.02,
        juros: taxas - (principal * 0.02),
        desconto: desconto,
        valorFinal: total
      }

      const doc = PDFService.generateTermoAcordoPDF(aluno, acordoData)
      PDFService.downloadPDF(doc, `termo_acordo_${aluno.nome_completo.replace(/\s+/g, '_')}.pdf`)
      toast.success('Recibo gerado com sucesso!')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao gerar recibo: ' + err.message)
    }
  })

  // BUSCA
  container.querySelector('#busca-aluno-financeiro').oninput = (e) => {
    const val = e.target.value.toLowerCase()
    container.querySelectorAll('.aluno-fin-row').forEach(r => {
      r.style.display = r.innerText.toLowerCase().includes(val) ? '' : 'none'
    })
  }

  // LANÇAR DÉBITO RÁPIDO
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-lancar-debito')) {
       container.querySelector('#lancar-aluno-id').value = e.target.dataset.id
       container.querySelector('#lancar-aluno-nome').textContent = e.target.dataset.nome
       container.querySelector('#modal-lancar-debito').style.display = 'flex'
    }
    if (e.target.classList.contains('btn-fechar-lancar')) container.querySelector('#modal-lancar-debito').style.display = 'none'
  })

  container.querySelector('#form-lancar-debito').onsubmit = async (e) => {
    e.preventDefault()
    const payload = {
       aluno_id: container.querySelector('#lancar-aluno-id').value,
       descricao: container.querySelector('#lancar-desc').value,
       valor_original: container.querySelector('#lancar-valor').value,
       data_vencimento: container.querySelector('#lancar-data').value,
       status: new Date(container.querySelector('#lancar-data').value) < new Date() ? 'atrasado' : 'pendente'
    }
    const { error } = await supabase.from('pagamentos').insert(payload)
    if (error) toast.error(error.message)
    else { toast.success('Lançamento realizado!'); window.location.reload() }
  }

  return container
}
