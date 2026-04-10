/**
 * Professor Details View - Ficha Completa do Professor
 * 
 * Permite visualizar e editar todos os dados de um professor:
 * - Dados pessoais
 * - Endereço
 * - Contato
 * - Disciplinas/Turmas atribuídas
 */

import { toast } from '../lib/toast'
import { escapeHTML, createBadge } from '../lib/security'
import { ProfessorDetailsService } from '../lib/professor-details-service'

export async function ProfessorDetailsView(professorId) {
  const container = document.createElement('div')
  container.className = 'professor-details-view animate-in'

  // Buscar dados completos
  const { data: dadosCompletos, error } = await ProfessorDetailsService.getProfessorCompleto(professorId)

  if (error) {
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center;">
        <h2 style="color: var(--danger);">Erro ao carregar dados do professor</h2>
        <p>${escapeHTML(error.message)}</p>
        <button onclick="history.back()" class="btn btn-primary" style="margin-top: 1rem;">Voltar</button>
      </div>
    `
    return container
  }

  const dados = dadosCompletos.perfil
  const endereco = dadosCompletos.endereco || {}
  const disciplinas = dadosCompletos.disciplinas || []

  const initials = dados.nome_completo ? escapeHTML(dados.nome_completo.charAt(0).toUpperCase()) : '?'
  
  // Gênero label
  const generoLabels = {
    'masculino': 'Masculino',
    'feminino': 'Feminino',
    'outro': 'Outro',
    'prefiro_nao_informar': 'Prefiro não informar'
  }
  const generoLabel = generoLabels[dados.genero] || '-'
  
  // Estado civil label
  const estadoCivilLabels = {
    'solteiro': 'Solteiro(a)',
    'casado': 'Casado(a)',
    'divorciado': 'Divorciado(a)',
    'viuvo': 'Viúvo(a)',
    'uniao_estavel': 'União Estável'
  }
  const estadoCivilLabel = estadoCivilLabels[dados.estado_civil] || '-'

  container.innerHTML = `
    <header style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="font-size: 2rem; color: var(--text-main);">Ficha do Professor</h1>
        <p>Visualize e edite todos os dados do professor.</p>
      </div>
      <button onclick="history.back()" class="btn" style="background: var(--secondary);">← Voltar</button>
    </header>

    <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); max-width: 900px;">
      <!-- Cabeçalho do Professor -->
      <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid var(--secondary);">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 2rem; color: white; flex-shrink: 0;">
          ${initials}
        </div>
        <div style="flex: 1;">
          <h2 style="margin: 0; color: var(--text-main);">${escapeHTML(dados.nome_completo)}</h2>
          <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
            ${createBadge(dados.perfil)}
            <span class="badge">E-mail: ${escapeHTML(dados.email || '-')}</span>
          </div>
        </div>
        <div style="text-align: right; font-size: 0.9rem; color: var(--text-muted);">
          <div>CPF: <strong>${escapeHTML(dados.cpf || '-')}</strong></div>
          <div>Telefone: <strong>${escapeHTML(dados.telefone || '-')}</strong></div>
        </div>
      </div>

      <!-- Dados Pessoais -->
      <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem;">Dados Pessoais</legend>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">Data de Nascimento</label>
            <div class="field-value">${dados.data_nascimento ? new Date(dados.data_nascimento).toLocaleDateString('pt-BR') : '-'}</div>
          </div>
          <div class="form-group">
            <label class="label">Gênero</label>
            <div class="field-value">${generoLabel}</div>
          </div>
          <div class="form-group">
            <label class="label">Estado Civil</label>
            <div class="field-value">${estadoCivilLabel}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">Cidade Natal</label>
            <div class="field-value">${escapeHTML(dados.cidade_natal || '-')}</div>
          </div>
          <div class="form-group">
            <label class="label">Nacionalidade</label>
            <div class="field-value">${escapeHTML(dados.nacionalidade || 'Brasileira')}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">Profissão / Especialidade</label>
            <div class="field-value">${escapeHTML(dados.profissao || '-')}</div>
          </div>
          <div class="form-group">
            <label class="label">Graduação e Nome do Curso</label>
            <div class="field-value">${escapeHTML(dados.graduacao || '-')}</div>
          </div>
        </div>

        <div class="form-group">
          <label class="label">Data de Conclusão da Graduação</label>
          <div class="field-value">${dados.data_conclusao_graduacao ? new Date(dados.data_conclusao_graduacao).toLocaleDateString('pt-BR') : '-'}</div>
        </div>
      </fieldset>

      <!-- Documentos -->
      <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem;">Documentos</legend>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">RG</label>
            <div class="field-value">${escapeHTML(dados.rg || '-')}</div>
          </div>
          <div class="form-group">
            <label class="label">Órgão Expedidor</label>
            <div class="field-value">${escapeHTML(dados.orgao_expedidor || '-')}</div>
          </div>
          <div class="form-group">
            <label class="label">Data de Expedição</label>
            <div class="field-value">${dados.data_expedicao_rg ? new Date(dados.data_expedicao_rg).toLocaleDateString('pt-BR') : '-'}</div>
          </div>
        </div>
      </fieldset>

      <!-- Contato -->
      <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem;">Contato</legend>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">Telefone</label>
            <div class="field-value">${escapeHTML(dados.telefone || '-')}</div>
          </div>
          <div class="form-group">
            <label class="label">Celular</label>
            <div class="field-value">${escapeHTML(dados.celular || '-')}</div>
          </div>
          <div class="form-group">
            <label class="label">WhatsApp</label>
            <div class="field-value">${escapeHTML(dados.whatsapp || '-')}</div>
          </div>
        </div>
      </fieldset>

      <!-- Endereço -->
      <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem;">Endereço</legend>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">CEP</label>
            <div class="field-value">${escapeHTML(endereco.cep || '-')}</div>
          </div>
          <div class="form-group">
            <label class="label">Bairro</label>
            <div class="field-value">${escapeHTML(endereco.bairro || '-')}</div>
          </div>
        </div>

        <div class="form-group">
          <label class="label">Endereço</label>
          <div class="field-value">
            ${endereco.logradouro ? `${escapeHTML(endereco.logradouro)}, ${escapeHTML(endereco.numero || 'S/N')}` : '-'}
            ${endereco.complemento ? ` - ${escapeHTML(endereco.complemento)}` : ''}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">Cidade</label>
            <div class="field-value">${escapeHTML(endereco.cidade || '-')}</div>
          </div>
          <div class="form-group">
            <label class="label">UF</label>
            <div class="field-value">${escapeHTML(endereco.uf || '-')}</div>
          </div>
        </div>
      </fieldset>

      <!-- Disciplinas -->
      <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem;">Disciplinas / Turmas</legend>
        
        ${disciplinas.length === 0 
          ? `<p style="color: var(--text-muted); font-size: 0.9rem;">Nenhuma disciplina atribuída.</p>`
          : `
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            ${disciplinas.map(d => `
              <div style="padding: 1rem; background: var(--secondary); border-radius: 6px;">
                <div style="font-weight: 600;">${escapeHTML(d.nome)}</div>
                <div style="font-size: 0.85rem; color: var(--text-muted);">
                  ${d.turmas ? `Turma: ${escapeHTML(d.turmas.nome)} (${escapeHTML(d.turmas.periodo)})` : ''}
                  ${d.cursos ? ` | Curso: ${escapeHTML(d.cursos.nome)}` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </fieldset>

      <!-- Botão Salvar -->
      <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
        <button id="save-btn" class="btn btn-primary">Salvar Alterações</button>
      </div>
    </div>
  `

  return container
}
