import { getAllProfiles } from '../auth/session'
import { toast } from '../lib/toast'

const modulos = [
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

export async function AcademicoView() {
  const container = document.createElement('div')
  container.className = 'academico-view animate-in'

  // Fetch profiles to select a student
  const { data: profiles, error } = await getAllProfiles()
  const students = profiles?.filter(p => !p.perfil || p.perfil.toLowerCase() !== 'admin') || []

  container.innerHTML = `
    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; color: var(--text-main);">Controle Acadêmico</h1>
      <p>Gerencie as notas e presenças dos alunos por módulo. (Ambiente do Professor/Gestor)</p>
    </header>

    <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); margin-bottom: 2rem;">
      <div style="display: flex; gap: 1rem; align-items: flex-end;">
        <div class="form-group" style="flex: 1; margin: 0;">
          <label class="label">Selecione o Aluno:</label>
          <select id="aluno-select" class="input">
            <option value="">-- Escolha um aluno --</option>
            ${students.map(s => `<option value="${s.id}">${s.nome_completo} (${s.email})</option>`).join('')}
          </select>
        </div>
        <button id="load-student-btn" class="btn btn-primary" disabled>Carregar Diário</button>
      </div>
    </div>

    <div id="boletim-container" style="display: none;">
      ${modulos.map(modulo => `
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
                ${modulo.disciplinas.map(disciplina => `
                  <tr style="border-top: 1px solid var(--secondary);">
                    <td style="padding: 1rem; font-weight: 500; font-size: 0.9rem;">${disciplina}</td>
                    <td style="padding: 0.5rem;"><input type="number" min="0" class="input" style="padding: 0.4rem; font-size: 0.85rem; text-align: center;" placeholder="0"></td>
                    <td style="padding: 0.5rem;"><input type="number" min="0" max="10" step="0.1" class="input nota-input" style="padding: 0.4rem; font-size: 0.85rem; text-align: center;" placeholder="0.0"></td>
                    <td style="padding: 0.5rem;"><input type="number" min="0" max="10" step="0.1" class="input nota-input" style="padding: 0.4rem; font-size: 0.85rem; text-align: center;" placeholder="0.0"></td>
                    <td style="padding: 0.5rem;"><input type="number" min="0" max="10" step="0.1" class="input nota-input" style="padding: 0.4rem; font-size: 0.85rem; text-align: center;" placeholder="0.0"></td>
                    <td style="padding: 0.5rem; text-align: center; font-weight: bold; background: #f9fafb;" class="media-teoria">-</td>
                    <td style="padding: 0.5rem;"><input type="number" min="0" max="10" step="0.1" class="input rec-input" style="padding: 0.4rem; font-size: 0.85rem; text-align: center;" placeholder="0.0"></td>
                    <td style="padding: 0.5rem; text-align: center; font-weight: bold; color: var(--primary);" class="media-final">-</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `).join('')}
      
      <div style="display: flex; justify-content: flex-end; margin-bottom: 3rem;">
        <button id="save-grades-btn" class="btn btn-primary" style="font-size: 1.1rem; padding: 0.75rem 2rem;">Salvar Registros</button>
      </div>
    </div>
  `

  // Logic
  const select = container.querySelector('#aluno-select')
  const loadBtn = container.querySelector('#load-student-btn')
  const boletimContainer = container.querySelector('#boletim-container')
  const saveBtn = container.querySelector('#save-grades-btn')

  select.addEventListener('change', () => {
    loadBtn.disabled = !select.value
  })

  loadBtn.addEventListener('click', () => {
    boletimContainer.style.display = 'block'
    toast.success('Diário carregado para ' + select.options[select.selectedIndex].text)
  })

  saveBtn.addEventListener('click', () => {
    toast.success('Notas e presenças salvas com sucesso!')
    // Here you would normally send the data to Supabase
  })

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
        // If recovery grade exists, final is average of recovery and theory (this is just mock logic, can be adapted)
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
