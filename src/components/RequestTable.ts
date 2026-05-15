import { DocumentsService } from '../lib/documents-service'
import { PDFService } from '../lib/pdf-service'
import { AcademicService } from '../lib/academic-service'
import { AdminService } from '../lib/admin-service'
import { CourseService } from '../lib/course-service'
import { ExcelService } from '../lib/excel-service'
import { supabase } from '../lib/supabase'
import { toast } from '../lib/toast'
import { escapeHTML } from '../lib/security'
import { renderTemplate } from '../lib/dom-utils'
import type { UserProfile } from '../types'

;(window as any).supabase = supabase
;(window as any).AcademicService = AcademicService
;(window as any).CourseService = CourseService

export async function RequestTableComponent() {
  const { data: requests, error } = await DocumentsService.getAllOpenRequests()

  if (error) {
    return renderTemplate(`<p class="error-text">Erro ao carregar solicitações.</p>`)
  }

  if (!requests || requests.length === 0) {
    return renderTemplate('<p>Não há solicitações pendentes no momento.</p>')
  }

  const html = `
    <div class="request-table-container">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 style="margin: 0;">Solicitações de Documentos</h3>
        <button id="btn-export-solicitacoes" class="btn btn-primary btn-sm" style="background: #217346; color: white; font-weight: 600;">
          📊 Exportar Excel
        </button>
      </div>
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
                  <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary btn-sm generate-pdf-btn" 
                            data-id="${r.user_id}" 
                            data-tipo="${escapeHTML(r.tipo)}" 
                            data-nome="${escapeHTML(r.perfis?.nome_completo || '')}">
                      Gerar PDF
                    </button>
                    ${r.status === 'pendente' ? `
                      <button class="btn btn-primary btn-sm approve-btn" data-id="${r.id}" style="background: var(--success);">Concluir</button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `

  const container = renderTemplate<HTMLDivElement>(html)

  // Event Listeners
  container.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement

    // Export Excel
    if (target.id === 'btn-export-solicitacoes') {
      ExcelService.exportSolicitacoes(requests)
    }

    // Generate PDF
    if (target.classList.contains('generate-pdf-btn')) {
      const btn = target as HTMLButtonElement
      const userId = btn.dataset.id!
      const tipo = btn.dataset.tipo!
      const nome = btn.dataset.nome!
      await handleGerarPDF(userId, tipo, nome, btn)
    }

    // Approve/Conclude Request
    if (target.classList.contains('approve-btn')) {
      const btn = target as HTMLButtonElement
      const requestId = btn.dataset.id!
      await handleApproveRequest(requestId, btn)
    }
  })

  return container
}

async function handleGerarPDF(
  userId: string,
  tipo: string,
  nomeAluno: string,
  btnEl: HTMLButtonElement
): Promise<void> {
  btnEl.disabled = true
  btnEl.textContent = 'Gerando...'

  try {
    const { data: userData } = await AdminService.getUserById(userId)
    if (!userData) {
      toast.error('Usuário não encontrado')
      return
    }

    const { data: matriculas } = await supabase
      .from('matriculas')
      .select('*, turmas(id, nome, periodo, cursos(id, nome))')
      .eq('aluno_id', userId)
      .eq('status_aluno', 'ativo')
      .limit(1)
      .maybeSingle()

    const isAluno = userData.perfil === 'aluno'
    let turmaInfo: any = null

    if (isAluno && matriculas?.turmas) {
      turmaInfo = {
        turma_nome: matriculas.turmas.nome,
        periodo: matriculas.turmas.periodo,
        curso_nome: matriculas.turmas.cursos?.nome || 'N/A',
        curso_id: matriculas.turmas.cursos?.id
      }
    }

    const doc = await gerarDocumentoPDF(userData, tipo, nomeAluno, turmaInfo, isAluno)
    PDFService.downloadPDF(doc as any, `documento_${nomeAluno.replace(/\s+/g, '_')}.pdf`)
    toast.success('PDF gerado com sucesso!')
  } catch (err: any) {
    console.error('Erro ao gerar PDF:', err)
    toast.error('Erro ao gerar PDF: ' + err.message)
  } finally {
    btnEl.disabled = false
    btnEl.textContent = 'Gerar PDF'
  }
}

async function gerarDocumentoPDF(
  userData: any,
  tipo: string,
  nomeAluno: string,
  turmaInfo: any,
  isAluno: boolean
): Promise<any> {
  if (tipo.includes('Declaração de Matrícula')) {
    if (!isAluno) {
      return PDFService.generateDeclaracaoVinculoPDF(userData as UserProfile, { marcaCopia: true })
    }
    if (!turmaInfo) throw new Error('Aluno não possui matrícula ativa')
    return PDFService.generateDeclaracaoPDF(userData as UserProfile, turmaInfo, { marcaCopia: true })
  }

  if (tipo.includes('Histórico Acadêmico') || tipo.includes('Boletim')) {
    if (!isAluno) throw new Error('Histórico acadêmico disponível apenas para alunos')
    if (!turmaInfo) throw new Error('Aluno não possui matrícula ativa')
    const { data: notas } = await AcademicService.getBoletim(userData.id)
    const { data: disciplinasCurso } = await CourseService.getDisciplinasDoCurso(turmaInfo.curso_id)
    const notasComModulo = notas?.map((n: any) => {
      const disc = disciplinasCurso?.find((d: any) => d.nome === n.disciplina)
      return { ...n, modulo: disc?.modulo || 'I Módulo' }
    }) || notas || []
    return PDFService.generateHistoricoPDF(userData as UserProfile, notasComModulo, turmaInfo, { marcaCopia: true })
  }

  if (isAluno) {
    if (!turmaInfo) throw new Error('Aluno não possui matrícula ativa')
    return PDFService.generateDeclaracaoPDF(userData as UserProfile, turmaInfo, { marcaCopia: true })
  }
  return PDFService.generateDeclaracaoVinculoPDF(userData as UserProfile)
}

async function handleApproveRequest(requestId: string, btn: HTMLButtonElement) {
  btn.disabled = true
  btn.textContent = '...'
  
  const { error } = await DocumentsService.updateStatus(requestId, 'concluido')
  
  if (error) {
    toast.error('Erro ao concluir solicitação: ' + error.message)
    btn.disabled = false
    btn.textContent = 'Concluir'
  } else {
    toast.success('Solicitação concluída!')
    const row = document.getElementById(`req-row-${requestId}`)
    if (row) {
      const statusCell = row.querySelector('.status-cell')
      if (statusCell) {
        statusCell.innerHTML = '<span class="badge badge-success">concluido</span>'
      }
      btn.remove()
    }
  }
}
