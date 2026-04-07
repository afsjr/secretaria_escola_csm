/**
 * Professor Meus Alunos View
 * 
 * Lista todos os alunos do professor com busca.
 * Ao clicar, abre a ficha completa do aluno.
 * 
 * Uso secundário - para análise profunda individual.
 */

import { ProfessorService } from '../lib/professor-service'
import { StudentDetailsService } from '../lib/student-details-service'
import { toast } from '../lib/toast'
import { escapeHTML, createBadge } from '../lib/security'
import { StudentDetailsView } from './student-details'

export async function ProfessorAlunosView(profile) {
  const container = document.createElement('div')
  container.className = 'professor-alunos-view animate-in'

  // Buscar alunos de todas as turmas do professor
  const turmasDoProfessor = await ProfessorService.getTurmasDoProfessor(profile.id)
  
  let todosAlunos = []
  for (const turma of turmasDoProfessor) {
    const { data: matriculas } = await ProfessorService.getAlunosDaTurma(turma.id)
    if (matriculas) {
      todosAlunos = todosAlunos.concat(
        matriculas
          .filter(m => m.status_aluno === 'ativo')
          .map(m => ({
            ...m.perfis,
            turma_nome: turma.nome,
            turma_id: turma.id,
            matricula_id: m.id,
            status_aluno: m.status_aluno
          }))
      )
    }
  }

  // Remover duplicatas (aluno em múltiplas disciplinas da mesma turma)
  const alunosUnicos = todosAlunos.filter((aluno, index, self) =>
    index === self.findIndex(a => a.id === aluno.id)
  ).sort((a, b) => a.nome_completo.localeCompare(b.nome_completo))

  container.innerHTML = `
    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; color: var(--text-main);">Meus Alunos</h1>
      <p>Visualize a ficha completa de cada aluno.</p>
    </header>

    <!-- Busca -->
    <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); margin-bottom: 1.5rem;">
      <div class="form-group" style="margin: 0;">
        <label class="label" for="busca-aluno">Buscar Aluno</label>
        <input type="text" id="busca-aluno" class="input" placeholder="Digite o nome do aluno...">
      </div>
    </div>

    <!-- Lista de Alunos -->
    <div id="lista-alunos" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
      ${alunosUnicos.length === 0 
        ? `<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 2rem;">Nenhum aluno encontrado.</p>`
        : alunosUnicos.map(aluno => `
            <div class="aluno-card" data-id="${aluno.id}" data-nome="${escapeHTML(aluno.nome_completo.toLowerCase())}" style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); cursor: pointer; transition: all 0.2s; border-left: 4px solid var(--primary);">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.2rem; color: white; flex-shrink: 0;">
                  ${escapeHTML(aluno.nome_completo.charAt(0).toUpperCase())}
                </div>
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: var(--text-main);">${escapeHTML(aluno.nome_completo)}</div>
                  <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem;">${escapeHTML(aluno.turma_nome || '-')}</div>
                  <div style="margin-top: 0.3rem;">
                    ${createBadge(aluno.perfil)}
                  </div>
                </div>
              </div>
            </div>
          `).join('')
      }
    </div>
  `

  // === Event Handlers ===

  // Busca
  const buscaInput = container.querySelector('#busca-aluno')
  const listaAlunos = container.querySelector('#lista-alunos')

  buscaInput.addEventListener('input', () => {
    const termo = buscaInput.value.toLowerCase().trim()
    
    container.querySelectorAll('.aluno-card').forEach(card => {
      const nome = card.getAttribute('data-nome')
      card.style.display = nome.includes(termo) ? 'block' : 'none'
    })
  })

  // Clique no card do aluno → abre ficha
  container.querySelectorAll('.aluno-card').forEach(card => {
    card.addEventListener('click', async () => {
      const alunoId = card.getAttribute('data-id')
      
      card.style.opacity = '0.5'
      
      try {
        const detailsView = await StudentDetailsView(alunoId)
        container.innerHTML = ''
        container.appendChild(detailsView)
      } catch (err) {
        console.error('Erro ao carregar ficha:', err)
        toast.error('Erro ao carregar ficha do aluno')
        card.style.opacity = '1'
      }
    })

    // Hover effect
    card.addEventListener('mouseenter', () => {
      card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
      card.style.transform = 'translateY(-2px)'
    })
    card.addEventListener('mouseleave', () => {
      card.style.boxShadow = 'var(--shadow-sm)'
      card.style.transform = 'none'
    })
  })

  return container
}
