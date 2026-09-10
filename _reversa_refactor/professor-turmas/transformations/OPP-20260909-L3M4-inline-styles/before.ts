// OPP-20260909-L3M4 — Antes (fragmentos representativos dos ~79 style= inline)
// Extraídos de src/views/professor-turmas.ts (estado original):

  <tr data-aluno-id="${aluno?.id || ''}" style="border-top: 1px solid var(--secondary);">
    <td style="padding: 0.5rem;">
      <div class="aluno-nome" style="font-weight: 500;">${escapeHTML(aluno?.nome_completo || 'Aluno Desconhecido')}</div>
    </td>
    <td style="padding: 0.5rem;"><input type="number" class="input input-faltas" value="${notas.faltas || 0}" min="0" style="width: 50px; text-align: center; padding: 0.3rem;"></td>
    <td style="padding: 0.5rem;"><input type="number" class="input input-n1" ... style="width: 50px; text-align: center; padding: 0.3rem;"></td>
    <td style="padding: 0.5rem;"><input type="number" class="input input-n2" ... style="width: 50px; text-align: center; padding: 0.3rem;"></td>
    <td style="padding: 0.5rem;"><input type="number" class="input input-n3" ... style="width: 50px; text-align: center; padding: 0.3rem;"></td>
    <td style="padding: 0.5rem; text-align: center; font-weight: bold; background: #f0f4f8;" class="media-cell" data-media>...</td>
    <td style="padding: 0.5rem;"><input type="number" class="input input-rec" ... style="width: 50px; text-align: center; padding: 0.3rem;" ${recDisabled}></td>
    <td style="padding: 0.5rem; text-align: center; font-weight: bold; background: #f0f4f8;" class="final-cell" data-final>...</td>
    <td style="padding: 0.5rem; text-align: center;" class="status-cell" data-status>
      <span style="color: ${statusColor}; font-weight: 600; font-size: 0.8rem;">${escapeHTML(status)}</span>
    </td>
  </tr>

// Cores hardcoded fora dos tokens: #f0f4f8, #f8fafc, #2a4a7f, #DC2626.
// Padrões repetidos: "padding: 0.5rem" em 6 <td>, "width: 50px; text-align:
// center; padding: 0.3rem" em 5 <input>.