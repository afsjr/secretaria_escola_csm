/**
 * Componente de Tabela de Professores
 * 
 * Tabela reutilizável para listar professores com ações.
 */

import { escapeHTML } from '../lib/security'
import type { UserProfile } from '../types'

export interface TabelaProfessoresProps {
  professores: Array<{
    id: string
    nome_completo: string
    email: string
    telefone?: string
    perfil?: string
  }>
  onVerDetalhes?: (id: string, nome: string) => void
  onVincular?: (id: string, nome: string) => void
}

export function createTabelaProfessores({ professores, onVerDetalhes, onVincular }: TabelaProfessoresProps): string {
  if (!professores || professores.length === 0) {
    return '<p style="color: var(--text-muted);">Nenhum professor cadastrado.</p>'
  }

  return `
    <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <thead style="background: var(--primary); color: white;">
        <tr>
          <th style="padding: 1rem; text-align: left;">Professor</th>
          <th style="padding: 1rem; text-align: left;">Contato</th>
          <th style="padding: 1rem; text-align: center;">Ações</th>
        </tr>
      </thead>
      <tbody>
        ${professores.map((p) => `
          <tr style="border-top: 1px solid var(--secondary);">
            <td style="padding: 1rem;">
              <div style="font-weight: 600;">${escapeHTML(p.nome_completo)}</div>
            </td>
            <td style="padding: 1rem;">
              <div style="font-size: 0.85rem;">${escapeHTML(p.email || '-')}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHTML(p.telefone || '')}</div>
            </td>
            <td style="padding: 1rem; text-align: center;">
              <button class="btn btn-sm btn-secondary btn-ver-ficha" 
                data-id="${p.id}" 
                data-nome="${escapeHTML(p.nome_completo)}"
                style="margin-right: 0.5rem;">
                Ver Ficha
              </button>
              <button class="btn btn-sm btn-primary btn-vincular" 
                data-id="${p.id}" 
                data-nome="${escapeHTML(p.nome_completo)}">
                Vincular
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

export function bindTabelaProfessoresEventos(
  container: HTMLElement,
  props: TabelaProfessoresProps
): void {
  // Ver detalhes
  container.querySelectorAll('.btn-ver-ficha').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).getAttribute('data-id')
      const nome = (btn as HTMLElement).getAttribute('data-nome')
      if (id && props.onVerDetalhes) {
        props.onVerDetalhes(id, nome!)
      }
    })
  })

  // Vincular
  container.querySelectorAll('.btn-vincular').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).getAttribute('data-id')
      const nome = (btn as HTMLElement).getAttribute('data-nome')
      if (id && props.onVincular) {
        props.onVincular(id, nome!)
      }
    })
  })
}