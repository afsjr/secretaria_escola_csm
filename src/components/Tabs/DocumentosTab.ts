import { ICONS } from '../../lib/icons'
import { PDFService } from '../../lib/pdf-service'
import { AdminService } from '../../lib/admin-service'
import { AcademicService } from '../../lib/academic-service'
import { CourseService } from '../../lib/course-service'
import { DocumentsService } from '../../lib/documents-service'
import { supabase } from '../../lib/supabase'
import { toast } from '../../lib/toast'
import { escapeHTML } from '../../lib/security'

interface DocumentosTabProps {
  alunos: any[]
  profile: { id: string; perfil: string }
}

function podeGerarDocumento(perfil: string): boolean {
  return perfil === 'master_admin' || perfil === 'admin' || perfil === 'secretaria'
}

const TIPOS_DOCUMENTO = [
  'Declaração de Matrícula',
  'Histórico Acadêmico',
  'Boletim',
  'Declaração de Vínculo',
]

export function DocumentosTab({ alunos, profile }: DocumentosTabProps): HTMLDivElement {
  const container = document.createElement('div')
  container.className = 'tab-documentos'

  const render = (requests: any[]) => {
    const pode = podeGerarDocumento(profile.perfil)

    const requestsHtml = requests.length > 0
      ? `<div id="doc-requests-section" style="margin-bottom: 1.5rem;">
          <h4 style="margin: 0 0 0.75rem 0; color: var(--text-main);">Solicitações Pendentes (${requests.length})</h4>
          <div style="background: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.9rem;">
            ${requests.map(r => escapeHTML(r.tipo)).join(', ')}
          </div>
         </div>`
      : '<div id="doc-requests-section"></div>'

    container.innerHTML = `
      <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        <h3 style="margin: 0 0 1rem 0; color: var(--text-main);">Documentos</h3>
        <p style="margin: 0 0 1.5rem 0; color: var(--text-muted); font-size: 0.9rem;">
          Gere documentos oficiais sob demanda. Selecione o aluno e o tipo de documento desejado.
        </p>

        ${requestsHtml}

        <div class="form-group">
          <label class="label" for="doc-aluno-select">Aluno:</label>
          <select id="doc-aluno-select" class="input">
            <option value="">-- Selecione --</option>
            ${alunos.map(a => `<option value="${escapeHTML(a.id || '')}">${escapeHTML(a.nome_completo || 'N/A')}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="label" for="doc-tipo-select">Tipo de Documento:</label>
          <select id="doc-tipo-select" class="input">
            <option value="">-- Selecione --</option>
            ${TIPOS_DOCUMENTO.map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>
        </div>

        <div style="margin-top: 1rem;">
          ${pode ? `<button id="btn-gerar-documento" class="btn btn-primary">${ICONS.file} Gerar Documento</button>` : ''}
        </div>

        <div id="doc-status" style="margin-top: 1rem;"></div>
      </div>
    `
  }

  const handleGerarDocumento = async () => {
    const selectAluno = container.querySelector('#doc-aluno-select') as HTMLSelectElement
    const selectTipo = container.querySelector('#doc-tipo-select') as HTMLSelectElement
    const statusEl = container.querySelector('#doc-status') as HTMLElement

    if (!selectAluno.value) {
      toast.error('Selecione um aluno.')
      return
    }

    if (!selectTipo.value) {
      toast.error('Selecione o tipo de documento.')
      return
    }

    const btn = container.querySelector('#btn-gerar-documento') as HTMLButtonElement
    btn.disabled = true
    btn.textContent = 'Gerando...'
    statusEl.innerHTML = ''

    try {
      const { data: userData } = await AdminService.getUserById(selectAluno.value)
      if (!userData) {
        toast.error('Dados do aluno não encontrados.')
        btn.disabled = false
        btn.innerHTML = `${ICONS.file} Gerar Documento`
        return
      }

      const isAluno = userData.perfil === 'aluno'
      let turmaInfo: any = null

      if (isAluno) {
        const { data: matricula } = await supabase
          .from('matriculas')
          .select('*, turmas(id, nome, periodo, cursos(id, nome))')
          .eq('aluno_id', selectAluno.value)
          .eq('status_aluno', 'ativo')
          .limit(1)
          .maybeSingle()

        if (matricula?.turmas) {
          turmaInfo = {
            turma_nome: (matricula.turmas as any).nome,
            periodo: (matricula.turmas as any).periodo,
            curso_nome: (matricula.turmas as any).cursos?.nome || 'N/A',
            curso_id: (matricula.turmas as any).cursos?.id,
            turma_id: (matricula.turmas as any).id,
          }
        }
      }

      let doc: any

      switch (selectTipo.value) {
        case 'Declaração de Matrícula':
          if (!isAluno) {
            doc = PDFService.generateDeclaracaoVinculoPDF(userData)
          } else {
            if (!turmaInfo) throw new Error('Aluno não possui matrícula ativa')
            doc = PDFService.generateDeclaracaoPDF(userData, turmaInfo)
          }
          break

        case 'Histórico Acadêmico':
          if (!isAluno) throw new Error('Histórico disponível apenas para alunos')
          if (!turmaInfo) throw new Error('Aluno não possui matrícula ativa')
          doc = await gerarHistorico(userData, turmaInfo)
          break

        case 'Boletim':
          if (!isAluno) throw new Error('Boletim disponível apenas para alunos')
          if (!turmaInfo) throw new Error('Aluno não possui matrícula ativa')
          doc = await gerarBoletim(userData, turmaInfo)
          break

        case 'Declaração de Vínculo':
          doc = PDFService.generateDeclaracaoVinculoPDF(userData)
          break

        default:
          throw new Error('Tipo de documento inválido.')
      }

      const nomeArquivo = `${selectTipo.value.replace(/\s+/g, '_')}_${(userData.nome_completo || 'documento').replace(/\s+/g, '_')}.pdf`
      PDFService.downloadPDF(doc, nomeArquivo)
      toast.success('Documento gerado com sucesso!')
    } catch (err: any) {
      toast.error('Erro ao gerar documento: ' + err.message)
    } finally {
      btn.disabled = false
      btn.innerHTML = `${ICONS.file} Gerar Documento`
    }
  }

  const gerarHistorico = async (userData: any, turmaInfo: any) => {
    const { data: notas } = await AcademicService.getBoletim(userData.id)
    const { data: ofertas } = await CourseService.getOfertasDaTurmaComDatas(turmaInfo.turma_id)

    const notasComModulo = notas?.map((n: any) => {
      const discBase = n.disciplinas_base as any
      return {
        ...n,
        disciplina: discBase?.nome || n.disciplina || 'Disciplina',
        modulo: discBase?.modulo || 'I Módulo',
      }
    }) || notas || []

    const disciplinasPendentes: any[] = []
    if (ofertas && notas) {
      const notaIds = new Set(notas.map((n: any) => n.disciplina_base_id))
      ofertas.forEach((o: any) => {
        const discBase = o.disciplinas_base as any
        if (discBase?.id && !notaIds.has(discBase.id)) {
          disciplinasPendentes.push({
            disciplina: discBase.nome || 'Disciplina',
            modulo: discBase.modulo || '',
            status: 'pendente',
            faltas: 0, n1: null, n2: null, n3: null, rec: null,
          })
        }
      })
    }

    return PDFService.generateHistoricoPDF(userData, [...notasComModulo, ...disciplinasPendentes], turmaInfo)
  }

  const gerarBoletim = async (userData: any, turmaInfo: any) => {
    const { data: notas } = await AcademicService.getBoletim(userData.id)

    const notasComModulo = notas?.map((n: any) => {
      const discBase = n.disciplinas_base as any
      return {
        ...n,
        disciplina: discBase?.nome || n.disciplina || 'Disciplina',
        modulo: discBase?.modulo || 'I Módulo',
      }
    }) || notas || []

    const { data: ofertas } = await CourseService.getOfertasDaTurmaComDatas(turmaInfo.turma_id)

    const disciplinasPendentes: any[] = []
    if (ofertas && notas) {
      const notaIds = new Set(notas.map((n: any) => n.disciplina_base_id))
      ofertas.forEach((o: any) => {
        const discBase = o.disciplinas_base as any
        if (discBase?.id && !notaIds.has(discBase.id)) {
          disciplinasPendentes.push({
            disciplina: discBase.nome || 'Disciplina',
            modulo: discBase.modulo || '',
            status: 'pendente',
            faltas: 0, n1: null, n2: null, n3: null, rec: null,
          })
        }
      })
    }

    return PDFService.generateBoletimPDF(userData, [...notasComModulo, ...disciplinasPendentes], turmaInfo)
  }

  render([])

  container.querySelector('#btn-gerar-documento')?.addEventListener('click', handleGerarDocumento)

  DocumentsService.getAllOpenRequests().then(({ data }) => {
    render(data || [])
    container.querySelector('#btn-gerar-documento')?.addEventListener('click', handleGerarDocumento)
  })

  return container
}
