/**
 * Componente de Tabela de Alunos
 * 
 * Tabela reutilizável para listar alunos com status e ações.
 */

import { escapeHTML } from '../lib/security'

export interface TabelaAlunosProps {
  alunos: Array<{
    id: string
    nome_completo: string
    email: string
    telefone?: string
    cpf?: string
    perfil?: string
  }>
  mostrarCPF?: boolean
  mostrarTelefone?: boolean
  onSelecionar?: (id: string, nome: string) => void
  onVerDetalhes?: (id: string, nome: string) => void
}

export function createTabelaAlunos({ 
  alunos, 
  mostrarCPF = false,
  mostrarTelefone = false,
  onSelecionar,
  onVerDetalhes 
}: TabelaAlunosProps): string {
  if (!alunos || alunos.length === 0) {
    return '<p style="color: var(--text-muted);">Nenhum aluno encontrado.</p>'
  }

  return `
    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <thead style="background: var(--primary); color: white;">
        <tr>
          <th style="padding: 1rem; text-align: left;">Aluno</th>
          ${mostrarCPF ? '<th style="padding: 1rem; text-align: left;">CPF</th>' : ''}
          <th style="padding: 1rem; text-align: left;">Contato</th>
          ${onSelecionar ? '<th style="padding: 1rem; text-align: center;">Selecionar</th>' : ''}
        </tr>
      </thead>
      <tbody>
        ${alunos.map((a) => `
          <tr style="border-top: 1px solid var(--secondary);">
            <td style="padding: 1rem;">
              <div style="font-weight: 600;">${escapeHTML(a.nome_completo)}</div>
            </td>
            ${mostrarCPF ? `<td style="padding: 1rem;">${escapeHTML(a.cpf || '-')}</td>` : ''}
            <td style="padding: 1rem;">
              <div style="font-size: 0.85rem;">${escapeHTML(a.email || '-')}</div>
              ${mostrarTelefone ? `<div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHTML(a.telefone || '')}</div>` : ''}
            </td>
            ${onSelecionar ? `
              <td style="padding: 1rem; text-align: center;">
                <button class="btn btn-sm btn-primary btn-selecionar-aluno" 
                  data-id="${a.id}" 
                  data-nome="${escapeHTML(a.nome_completo)}">
                  Selecionar
                </button>
              </td>
            ` : ''}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

export function bindTabelaAlunosEventos(
  container: HTMLElement,
  props: TabelaAlunosProps
): void {
  if (!props.onSelecionar) return

  container.querySelectorAll('.btn-selecionar-aluno').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).getAttribute('data-id')
      const nome = (btn as HTMLElement).getAttribute('data-nome')
      if (id) {
        props.onSelecionar!(id, nome!)
      }
    })
  })
}