import { ICONS } from '../../lib/icons'
import { escapeHTML } from '../../lib/security'
import { CpfService, type InconsistenciasCPF } from '../../lib/cpf-service'
import { ExcelService } from '../../lib/excel-service'
import { toast } from '../../lib/toast'

interface Aluno {
  id: string
  nome_completo: string
  email: string
  cpf?: string
  telefone?: string
  bloqueio_financeiro: boolean
}

interface Turma {
  id: string
  nome: string
  periodo: string
}

interface GerenciarAlunosProps {
  alunos: Aluno[]
  turmas: Turma[]
  onRefresh?: () => void
  onEdit?: (aluno: Aluno) => void
  onView?: (aluno: Aluno) => void
  onMatricular?: (aluno: Aluno) => void
}

export function GerenciarAlunosTab({ 
  alunos, 
  turmas, 
  onRefresh, 
  onEdit, 
  onView, 
  onMatricular 
}: GerenciarAlunosProps): HTMLDivElement {
  const container = document.createElement('div')
  container.className = 'animate-in'

  const totalAlunos = alunos.length
  const bloqueadosFinanc = alunos.filter(a => a.bloqueio_financeiro).length
  const regularFinanc = totalAlunos - bloqueadosFinanc

  const renderStats = () => `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
      <div class="stat-card">
        <div class="stat-label">Total de Alunos</div>
        <div class="stat-value">${escapeHTML(String(totalAlunos))}</div>
      </div>
      <div class="stat-card" style="border-bottom: 4px solid var(--success);">
        <div class="stat-label">Financeiro OK</div>
        <div class="stat-value" style="color: var(--success);">${escapeHTML(String(regularFinanc))}</div>
      </div>
      <div class="stat-card" style="border-bottom: 4px solid var(--danger);">
        <div class="stat-label">Bloqueios</div>
        <div class="stat-value" style="color: var(--danger);">${escapeHTML(String(bloqueadosFinanc))}</div>
      </div>
    </div>
  `

  const renderPainelCPF = () => `
    <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); margin-bottom: 1.5rem; border-left: 4px solid var(--accent);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h3 style="margin: 0;">Inconsistências de CPF</h3>
          <p style="margin: 0.25rem 0 0; color: var(--text-muted); font-size: 0.85rem;">Perfis sem CPF e CPFs duplicados. Nenhum registro é alterado.</p>
        </div>
        <button class="btn btn-primary" id="btn-verificar-cpf">Verificar inconsistências de CPF</button>
      </div>
      <div id="painel-cpf-conteudo" style="margin-top: 1.5rem; display: none;"></div>
    </div>
  `

  const renderTable = () => `
    <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <h3 style="margin: 0;">Lista de Alunos</h3>
        <div style="display: flex; gap: 10px;">
          <input type="text" id="busca-aluno" class="input" placeholder="Buscar por nome ou CPF..." style="width: 300px;">
          <button class="btn btn-primary" id="btn-refresh-alunos">${ICONS.refresh} Atualizar</button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Contato</th>
              <th>Status 360°</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${alunos.map(aluno => `
              <tr class="aluno-row">
                <td>
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div class="avatar-circle">${escapeHTML(aluno.nome_completo.charAt(0).toUpperCase())}</div>
                    <div>
                      <div style="font-weight: 600;">${escapeHTML(aluno.nome_completo)}</div>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">CPF: ${escapeHTML(aluno.cpf || '---')}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style="font-size: 0.85rem;">${escapeHTML(aluno.email)}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHTML(aluno.telefone || '---')}</div>
                </td>
                <td>
                  <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                    <!-- Financeiro -->
                    ${aluno.bloqueio_financeiro 
                      ? `<span class="badge" style="background: #fee2e2; color: #dc2626; border: 1px solid #fecaca;">🔴 Bloqueado</span>`
                      : `<span class="badge" style="background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0;">🟢 Regular</span>`}
                    
                    <!-- Estágio -->
                    <span class="badge" style="background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;">🔵 Estágio: OK</span>
                    
                    <!-- Docs -->
                    <span class="badge" style="background: #fffbeb; color: #d97706; border: 1px solid #fef3c7;">🟡 Docs Pend.</span>
                  </div>
                </td>
                <td style="text-align: right;">
                  <div style="display: flex; gap: 8px; justify-content: flex-end;">
                    <button class="btn btn-sm btn-secondary" onclick="window.location.hash='#/student-details?id=${escapeHTML(aluno.id)}'" title="Ver Ficha">${ICONS.eye}</button>
                    <button class="btn btn-sm btn-primary btn-editar-aluno" onclick="window.location.hash='#/student-details?edit=true&id=${escapeHTML(aluno.id)}'" title="Editar">${ICONS.edit}</button>
                    <button class="btn btn-sm btn-accent btn-vincular-turma" onclick="window.location.hash='#/gestao-turmas?matricular=${escapeHTML(aluno.id)}'" title="Matricular">${ICONS.graduation}</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `

  container.innerHTML = `
    ${renderStats()}
    ${renderPainelCPF()}
    ${renderTable()}
  `

  let lastInconsistencias: InconsistenciasCPF | null = null

  function renderLinhaPerfil(p: any): string {
    return `<tr>
      <td style="padding:0.5rem;">${escapeHTML(p.nome_completo || '---')}</td>
      <td style="padding:0.5rem;">${escapeHTML(p.email || '---')}</td>
      <td style="padding:0.5rem;">${escapeHTML(p.perfil || '---')}</td>
      <td style="padding:0.5rem;">${escapeHTML(p.cpf || '---')}</td>
    </tr>`
  }

  function exportarInconsistencias(): void {
    if (!lastInconsistencias) return
    const columns = [
      { header: 'Nome Completo', key: 'nome_completo' },
      { header: 'E-mail', key: 'email' },
      { header: 'Perfil', key: 'perfil' },
      { header: 'CPF', key: 'cpf' },
    ]
    const duplicadosPlanos = lastInconsistencias.duplicados.flatMap(d =>
      d.perfis.map(p => ({ ...p, cpf: p.cpf || d.cpf }))
    )
    try {
      ExcelService.exportMultipleSheets([
        { name: 'Sem CPF', data: lastInconsistencias.semCpf as any[], columns },
        { name: 'Duplicados', data: duplicadosPlanos, columns },
      ], `inconsistencias_cpf_${new Date().toISOString().slice(0, 10)}`)
      toast.success('Planilha exportada com sucesso!')
    } catch (err: any) {
      toast.error('Erro ao exportar: ' + (err?.message || String(err)))
    }
  }

  async function carregarInconsistencias(): Promise<void> {
    const alvo = container.querySelector('#painel-cpf-conteudo') as HTMLElement | null
    if (!alvo) return
    alvo.style.display = 'block'
    alvo.innerHTML = '<p style="color:var(--text-muted);">Carregando...</p>'

    const { data, error } = await CpfService.listarInconsistenciasCPF()
    if (error || !data) {
      alvo.innerHTML = `<p style="color:var(--danger);">Erro ao carregar: ${escapeHTML(error?.message || 'desconhecido')}</p>`
      return
    }
    lastInconsistencias = data

    const totalDuplicados = data.duplicados.reduce((acc, d) => acc + d.perfis.length, 0)
    const tabelaSemCpf = data.semCpf.length
      ? `<div class="table-responsive"><table class="data-table"><thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>CPF</th></tr></thead><tbody>${data.semCpf.map(renderLinhaPerfil).join('')}</tbody></table></div>`
      : '<p style="color:var(--text-muted);font-size:0.85rem;">Nenhum perfil sem CPF.</p>'

    const tabelaDuplicados = data.duplicados.length
      ? data.duplicados.map(d => `
          <div style="margin-bottom:1rem;">
            <div style="font-weight:600;margin-bottom:0.25rem;">CPF: ${escapeHTML(d.cpf)} — ${d.perfis.length} registros</div>
            <div class="table-responsive"><table class="data-table"><thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>CPF</th></tr></thead><tbody>${d.perfis.map(renderLinhaPerfil).join('')}</tbody></table></div>
          </div>
        `).join('')
      : '<p style="color:var(--text-muted);font-size:0.85rem;">Nenhum CPF duplicado.</p>'

    alvo.innerHTML = `
      <div style="display:flex;justify-content:flex-end;margin-bottom:1rem;">
        <button class="btn btn-secondary" id="btn-exportar-cpf">Exportar Excel</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:1rem;">
        <div class="stat-card"><div class="stat-label">Sem CPF</div><div class="stat-value">${escapeHTML(String(data.semCpf.length))}</div></div>
        <div class="stat-card"><div class="stat-label">CPFs duplicados</div><div class="stat-value" style="color:var(--danger);">${escapeHTML(String(data.duplicados.length))}</div></div>
        <div class="stat-card"><div class="stat-label">Perfis em duplicidade</div><div class="stat-value" style="color:var(--danger);">${escapeHTML(String(totalDuplicados))}</div></div>
      </div>
      <h4 style="margin:1rem 0 0.5rem;">Perfis sem CPF (${escapeHTML(String(data.semCpf.length))})</h4>
      ${tabelaSemCpf}
      <h4 style="margin:1.5rem 0 0.5rem;">CPFs duplicados (${escapeHTML(String(data.duplicados.length))})</h4>
      ${tabelaDuplicados}
    `

    alvo.querySelector('#btn-exportar-cpf')?.addEventListener('click', exportarInconsistencias)
  }

  // Event Listeners
  setTimeout(() => {
    container.querySelector('#btn-refresh-alunos')?.addEventListener('click', () => onRefresh?.())
    container.querySelector('#btn-verificar-cpf')?.addEventListener('click', carregarInconsistencias)
    
    // Busca (Simples para demonstração)
    container.querySelector('#busca-aluno')?.addEventListener('input', (e) => {
      const termo = (e.target as HTMLInputElement).value.toLowerCase()
      const rows = container.querySelectorAll('tbody tr')
      rows.forEach(row => {
        const text = row.textContent?.toLowerCase() || ''
        ;(row as HTMLElement).style.display = text.includes(termo) ? '' : 'none'
      })
    })
  }, 0)

  return container
}
