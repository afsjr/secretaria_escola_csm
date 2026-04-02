import { getAllProfiles } from '../auth/session'
import { AcademicService } from '../lib/academic-service'
import { CourseService } from '../lib/course-service'
import { PDFService } from '../lib/pdf-service'
import { supabase } from '../lib/supabase'
import { toast } from '../lib/toast'

// Disciplinas hardcoded como fallback (caso não existam no banco)
const modulosFallback = [
  {
    nome: 'I Módulo',
    disciplinas: [
      'Psicologia Aplicada',
      'Nutrição e Dietética',
      'Português Instrumental',
      'Matemática Instrumental',
      'Microbiologia e Parasitologia',
      'Higiene e Profilaxia',
      'Ética Profissional',
      'Anatomia e Fisiologia Humana'
    ]
  },
  {
    nome: 'II Módulo',
    disciplinas: [
      'Introdução à Enfermagem',
      'Enfermagem Médica',
      'Noções de Farmacologia',
      'Enfermagem Cirúrgica',
      'Noções de Adm. em Unidade Hospitalar'
    ]
  },
  {
    nome: 'III Módulo',
    disciplinas: [
      'Enfermagem Materno Infantil',
      'Enfermagem em Pronto Socorro',
      'Enfermagem Neuro Psiquiátrica',
      'Enfermagem em Saúde Pública'
    ]
  }
]

export async function AcademicoView(profile) {
  const container = document.createElement('div')
  container.className = 'academico-view animate-in'
  
  const isAdmin = profile?.perfil?.toLowerCase() === 'admin'

  // Fetch profiles to select a student
  const { data: profiles, error } = await getAllProfiles()
  if (error) {
    console.error('Erro ao buscar perfis:', error)
    toast.error('Erro de conexão com o banco de dados. Verifique a tabela "perfis".')
  }
  const students = profiles?.filter(p => !p.perfil || p.perfil.toLowerCase() !== 'admin') || []

  // Fetch disciplinas from database
  let modulosFromDB = null
  try {
    const { data: allDisciplinas } = await CourseService.getDisciplinasDoCurso(null)
    if (allDisciplinas && allDisciplinas.length > 0) {
      // Group by modulo
      const grouped = {}
      allDisciplinas.forEach(d => {
        const modulo = d.modulo || 'Sem Módulo'
        if (!grouped[modulo]) grouped[modulo] = []
        grouped[modulo].push(d.nome)
      })
      
      modulosFromDB = Object.keys(grouped).map(nome => ({
        nome,
        disciplinas: grouped[nome]
      }))
    }
  } catch (err) {
    console.warn('Erro ao carregar disciplinas do banco, usando fallback:', err)
  }

  const modulos = modulosFromDB || modulosFallback

  container.innerHTML = `
    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; color: var(--text-main);">${isAdmin ? 'Controle Acadêmico' : 'Boletim Escolar'}</h1>
      <p>${isAdmin ? 'Gerencie as notas e presenças dos alunos por módulo. (Ambiente do Professor/Gestor)' : 'Espelho das suas notas e presenças. (Apenas Leitura)'}</p>
    </header>

    ${isAdmin ? `
    <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); margin-bottom: 2rem;">
      <div style="display: flex; gap: 1rem; align-items: flex-end;">
        <div class="form-group" style="flex: 1; margin: 0;">
          <label class="label" for="aluno-select">Selecione o Aluno:</label>
          <select id="aluno-select" name="aluno_select" class="input">
            <option value="">-- Escolha um aluno --</option>
            ${students.map(s => `<option value="${s.id}">${s.nome_completo} (${s.email})</option>`).join('')}
          </select>
        </div>
        <button id="load-student-btn" class="btn btn-primary" disabled>Carregar Diário</button>
      </div>
    </div>
    ` : ''}

    <div id="boletim-container" style="${isAdmin ? 'display: none;' : 'display: block;'}">
      <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem; gap: 0.5rem;">
        <button id="print-boletim-btn" class="btn btn-primary" style="display: ${isAdmin ? 'none' : 'flex'}; align-items: center; gap: 0.5rem;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Imprimir Boletim
        </button>
      </div>

      ${modulos.map((modulo, mIdx) => `
        <div style="background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); overflow: hidden; margin-bottom: 2rem;">
          <div style="background: var(--primary); padding: 1rem; color: white;">
            <h3 style="margin: 0; font-size: 1.2rem;">${modulo.nome}</h3>
          </div>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 800px;">
              <thead style="background: var(--secondary); font-size: 0.8rem; text-transform: uppercase;">
                <tr>
                  <th style="padding: 1rem; width: 25%;">Disciplina</th>
                  <th style="padding: 1rem; text-align: center;">Faltas</th>
                  <th style="padding: 1rem; text-align: center;">1ª Nota</th>
                  <th style="padding: 1rem; text-align: center;">2ª Nota</th>
                  <th style="padding: 1rem; text-align: center;">3ª Nota</th>
                  <th style="padding: 1rem; text-align: center;">Média Teoria</th>
                  <th style="padding: 1rem; text-align: center;">Recup.</th>
                  <th style="padding: 1rem; text-align: center;">Média Final</th>
                </tr>
              </thead>
              <tbody>
                ${modulo.disciplinas.map((disciplina, dIdx) => {
                  const safeDisc = disciplina.replace(/[^a-zA-Z]/g, '').toLowerCase()
                  const prefix = `mod${mIdx}_disc${dIdx}_${safeDisc}`
                  return `
                  <tr class="disciplina-row" data-disciplina="${disciplina}" data-modulo="${modulo.nome}" style="border-top: 1px solid var(--secondary);">
                    <td style="padding: 1rem; font-weight: 500; font-size: 0.9rem;">${disciplina}</td>
                    <td style="padding: 0.5rem;"><input type="number" id="faltas_${prefix}" name="faltas_${prefix}" aria-label="Faltas em ${disciplina}" min="0" class="input faltas-input" style="padding: 0.4rem; font-size: 0.85rem; text-align: center;" placeholder="0"></td>
                    <td style="padding: 0.5rem;"><input type="number" id="n1_${prefix}" name="n1_${prefix}" aria-label="Nota 1 em ${disciplina}" min="0" max="10" step="0.1" class="input nota-input" style="padding: 0.4rem; font-size: 0.85rem; text-align: center;" placeholder="0.0"></td>
                    <td style="padding: 0.5rem;"><input type="number" id="n2_${prefix}" name="n2_${prefix}" aria-label="Nota 2 em ${disciplina}" min="0" max="10" step="0.1" class="input nota-input" style="padding: 0.4rem; font-size: 0.85rem; text-align: center;" placeholder="0.0"></td>
                    <td style="padding: 0.5rem;"><input type="number" id="n3_${prefix}" name="n3_${prefix}" aria-label="Nota 3 em ${disciplina}" min="0" max="10" step="0.1" class="input nota-input" style="padding: 0.4rem; font-size: 0.85rem; text-align: center;" placeholder="0.0"></td>
                    <td style="padding: 0.5rem; text-align: center; font-weight: bold; background: #f9fafb;" class="media-teoria">-</td>
                    <td style="padding: 0.5rem;"><input type="number" id="rec_${prefix}" name="rec_${prefix}" aria-label="Nota de Recuperação em ${disciplina}" min="0" max="10" step="0.1" class="input rec-input" style="padding: 0.4rem; font-size: 0.85rem; text-align: center;" placeholder="0.0"></td>
                    <td style="padding: 0.5rem; text-align: center; font-weight: bold; color: var(--primary);" class="media-final">-</td>
                  </tr>
                `}).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `).join('')}
      
      ${isAdmin ? `
      <div style="display: flex; justify-content: flex-end; margin-bottom: 3rem;">
        <button id="save-grades-btn" class="btn btn-primary" style="font-size: 1.1rem; padding: 0.75rem 2rem;">Salvar Registros</button>
      </div>
      ` : ''}
    </div>
  `

  // Logic
  const select = container.querySelector('#aluno-select')
  const loadBtn = container.querySelector('#load-student-btn')
  const boletimContainer = container.querySelector('#boletim-container')
  const saveBtn = container.querySelector('#save-grades-btn')
  const printBtn = container.querySelector('#print-boletim-btn')

  // =====================================================
  // IMPRIMIR BOLETIM (PDF)
  // =====================================================
  if (printBtn) {
    printBtn.addEventListener('click', async () => {
      printBtn.disabled = true
      printBtn.textContent = 'Gerando PDF...'

      try {
        const alunoId = isAdmin ? select.value : profile.id
        if (!alunoId) {
          toast.error('Selecione um aluno primeiro.')
          return
        }

        // Buscar dados do aluno
        const { data: alunoData } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', alunoId)
          .single()

        // Buscar matrícula e turma
        const { data: matricula } = await supabase
          .from('matriculas')
          .select(`
            *,
            turmas(id, nome, periodo, cursos(id, nome))
          `)
          .eq('aluno_id', alunoId)
          .eq('status_aluno', 'ativo')
          .limit(1)
          .single()

        const turmaInfo = matricula?.turmas ? {
          turma_nome: matricula.turmas.nome,
          periodo: matricula.turmas.periodo,
          curso_nome: matricula.turmas.cursos?.nome || 'Técnico em Enfermagem'
        } : null

        // Coletar notas da tela
        const notasData = []
        container.querySelectorAll('.disciplina-row').forEach(row => {
          const disciplina = row.getAttribute('data-disciplina')
          const modulo = row.getAttribute('data-modulo')
          const faltas = row.querySelector('.faltas-input').value
          const n1 = row.querySelectorAll('.nota-input')[0].value
          const n2 = row.querySelectorAll('.nota-input')[1].value
          const n3 = row.querySelectorAll('.nota-input')[2].value
          const rec = row.querySelector('.rec-input').value

          notasData.push({
            disciplina,
            modulo,
            faltas: parseFloat(faltas) || 0,
            n1: parseFloat(n1) || 0,
            n2: parseFloat(n2) || 0,
            n3: parseFloat(n3) || 0,
            rec: parseFloat(rec) || 0
          })
        })

        if (notasData.length === 0) {
          toast.error('Nenhuma nota encontrada para gerar o boletim.')
          return
        }

        const doc = PDFService.generateBoletimPDF(alunoData, notasData, turmaInfo)
        PDFService.downloadPDF(doc, `boletim_${(alunoData.nome_completo || 'aluno').replace(/\s+/g, '_')}.pdf`)
        toast.success('Boletim gerado com sucesso!')
      } catch (err) {
        console.error('Erro ao gerar boletim:', err)
        toast.error('Erro ao gerar PDF: ' + err.message)
      }

      printBtn.disabled = false
      printBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Imprimir Boletim
      `
    })
  }

  async function refreshGradesUI(alunoId) {
    if (!alunoId) return
    const { data, error } = await AcademicService.getBoletim(alunoId)
    if (error) { toast.error('Falha na rede ao puxar notas: ' + error.message); return }

    // Clear ghost values
    container.querySelectorAll('.disciplina-row input').forEach(i => i.value = '')

    if (data && data.length > 0) {
      data.forEach(dbRow => {
        const row = container.querySelector(`tr[data-disciplina="${dbRow.disciplina}"]`)
        if (row) {
          row.querySelector('.faltas-input').value = dbRow.faltas || ''
          row.querySelectorAll('.nota-input')[0].value = dbRow.n1 || ''
          row.querySelectorAll('.nota-input')[1].value = dbRow.n2 || ''
          row.querySelectorAll('.nota-input')[2].value = dbRow.n3 || ''
          const recInput = row.querySelector('.rec-input')
          if(recInput) recInput.value = dbRow.rec || ''
        }
      })
    }

    // Force recalculation events manually since setting .value doesn't trigger 'input'
    const ev = new Event('input')
    container.querySelectorAll('.nota-input').forEach(i => i.dispatchEvent(ev))
    container.querySelectorAll('.rec-input').forEach(i => i.dispatchEvent(ev))

    // Show print button for admin after loading
    if (isAdmin && printBtn) {
      printBtn.style.display = 'flex'
    }
  }

  if (isAdmin) {
    select.addEventListener('change', () => {
      loadBtn.disabled = !select.value
    })

    loadBtn.addEventListener('click', async () => {
      boletimContainer.style.display = 'block'
      toast.success('Baixando Diário Oficial do Servidor...')
      loadBtn.textContent = 'Carregando...'
      await refreshGradesUI(select.value)
      loadBtn.textContent = 'Carregar Diário'
    })

    saveBtn.addEventListener('click', async () => {
      const alunoId = select.value
      if (!alunoId) { toast.error('Escolha um aluno!'); return }

      saveBtn.disabled = true; saveBtn.textContent = 'Salvando Nuvem...'

      const arrayNotas = []
      container.querySelectorAll('.disciplina-row').forEach(row => {
        const disciplina = row.getAttribute('data-disciplina')
        const faltas = row.querySelector('.faltas-input').value
        const n1 = row.querySelectorAll('.nota-input')[0].value
        const n2 = row.querySelectorAll('.nota-input')[1].value
        const n3 = row.querySelectorAll('.nota-input')[2].value
        const rec = row.querySelector('.rec-input').value
        
        arrayNotas.push({ disciplina, faltas, n1, n2, n3, rec })
      })

      const { error } = await AcademicService.saveBoletim(alunoId, arrayNotas)
      
      if (error) { toast.error('Falha de Segurança (Erro ao salvar): ' + error.message) }
      else { toast.success('Boletim lacrado e salvo com sucesso!') }

      saveBtn.disabled = false; saveBtn.textContent = 'Salvar Registros'
    })
  } else {
    // Aluno logado: auto-carrega boletim dele mesmo
    refreshGradesUI(profile.id)
  }

  // Disable inputs if not admin
  const allInputs = container.querySelectorAll('input')
  if (!isAdmin) {
    allInputs.forEach(input => {
      input.disabled = true
      input.style.background = '#f9fafb'
      input.style.cursor = 'not-allowed'
    })
  }

  // Simple average calculator
  const rows = container.querySelectorAll('tbody tr')
  rows.forEach(row => {
    const notasInputs = row.querySelectorAll('.nota-input')
    const mediaTeoriaCell = row.querySelector('.media-teoria')
    const recInput = row.querySelector('.rec-input')
    const mediaFinalCell = row.querySelector('.media-final')

    const calculateGrades = () => {
      let sum = 0
      let count = 0
      notasInputs.forEach(input => {
        const val = parseFloat(input.value)
        if (!isNaN(val)) {
          sum += val
          count++
        }
      })
      
      let mediaTeoria = count > 0 ? (sum / count) : null
      
      if (mediaTeoria !== null) {
        mediaTeoriaCell.textContent = mediaTeoria.toFixed(1)
        mediaTeoriaCell.style.color = mediaTeoria >= 7 ? 'var(--success)' : 'var(--danger)'
      } else {
        mediaTeoriaCell.textContent = '-'
        mediaTeoriaCell.style.color = 'inherit'
      }

      const recVal = parseFloat(recInput.value)
      if (!isNaN(recVal) && mediaTeoria !== null) {
        const final = (mediaTeoria + recVal) / 2
        mediaFinalCell.textContent = final.toFixed(1)
        mediaFinalCell.style.color = final >= 7 ? 'var(--success)' : 'var(--danger)'
      } else if (mediaTeoria !== null) {
        mediaFinalCell.textContent = mediaTeoria.toFixed(1)
        mediaFinalCell.style.color = mediaTeoria >= 7 ? 'var(--success)' : 'var(--danger)'
      } else {
        mediaFinalCell.textContent = '-'
        mediaFinalCell.style.color = 'inherit'
      }
    }

    notasInputs.forEach(input => input.addEventListener('input', calculateGrades))
    recInput.addEventListener('input', calculateGrades)
  })

  return container
}
