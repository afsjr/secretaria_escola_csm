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
import { escapeHTML, createBadge, createOption } from '../lib/security'
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
  const disciplinasErro = dadosCompletos.disciplinasError

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
        </div>
      </div>

      <!-- Dados Pessoais -->
      <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem;">Dados Pessoais</legend>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">Data de Nascimento</label>
            <input type="date" id="pd-nascimento" class="input" value="${dados.data_nascimento || ''}">
          </div>
          <div class="form-group">
            <label class="label">Gênero</label>
            <select id="pd-genero" class="input">
              <option value="">--</option>
              ${createOption('masculino', 'Masculino', dados.genero)}
              ${createOption('feminino', 'Feminino', dados.genero)}
              ${createOption('outro', 'Outro', dados.genero)}
              ${createOption('prefiro_nao_informar', 'Prefiro não informar', dados.genero)}
            </select>
          </div>
          <div class="form-group">
            <label class="label">Estado Civil</label>
            <select id="pd-estado-civil" class="input">
              <option value="">--</option>
              ${createOption('solteiro', 'Solteiro(a)', dados.estado_civil)}
              ${createOption('casado', 'Casado(a)', dados.estado_civil)}
              ${createOption('divorciado', 'Divorciado(a)', dados.estado_civil)}
              ${createOption('viuvo', 'Viúvo(a)', dados.estado_civil)}
              ${createOption('uniao_estavel', 'União Estável', dados.estado_civil)}
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">Cidade Natal</label>
            <input type="text" id="pd-cidade-natal" class="input" value="${escapeHTML(dados.cidade_natal || '')}">
          </div>
          <div class="form-group">
            <label class="label">Nacionalidade</label>
            <input type="text" id="pd-nacionalidade" class="input" value="${escapeHTML(dados.nacionalidade || 'Brasileira')}">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">Profissão / Especialidade</label>
            <input type="text" id="pd-profissao" class="input" value="${escapeHTML(dados.profissao || '')}">
          </div>
          <div class="form-group">
            <label class="label">Graduação e Nome do Curso</label>
            <input type="text" id="pd-graduacao" class="input" value="${escapeHTML(dados.graduacao || '')}">
          </div>
        </div>

        <div class="form-group">
          <label class="label">Data de Conclusão da Graduação</label>
          <input type="date" id="pd-data-conclusao" class="input" value="${dados.data_conclusao_graduacao || ''}">
        </div>
      </fieldset>

      <!-- Documentos -->
      <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem;">Documentos</legend>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">RG</label>
            <input type="text" id="pd-rg" class="input" value="${escapeHTML(dados.rg || '')}">
          </div>
          <div class="form-group">
            <label class="label">Órgão Expedidor</label>
            <input type="text" id="pd-orgao-expedidor" class="input" value="${escapeHTML(dados.orgao_expedidor || '')}">
          </div>
          <div class="form-group">
            <label class="label">Data de Expedição</label>
            <input type="date" id="pd-data-expedicao-rg" class="input" value="${dados.data_expedicao_rg || ''}">
          </div>
        </div>
      </fieldset>

      <!-- Contato / Informações Reduzidas -->
      <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem;">Contato / Informações Reduzidas</legend>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">WhatsApp Principal (apenas números)</label>
            <input type="text" id="pd-whatsapp" class="input" value="${escapeHTML(dados.whatsapp || '')}">
          </div>
        </div>
      </fieldset>

      <!-- Endereço -->
      <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem;">Endereço</legend>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">CEP</label>
            <input type="text" id="pd-cep" class="input" value="${escapeHTML(endereco.cep || '')}">
          </div>
          <div class="form-group">
            <label class="label">Bairro</label>
            <input type="text" id="pd-bairro" class="input" value="${escapeHTML(endereco.bairro || '')}">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">Logradouro (Rua, Av, etc)</label>
            <input type="text" id="pd-logradouro" class="input" value="${escapeHTML(endereco.logradouro || '')}">
          </div>
          <div class="form-group">
            <label class="label">Número</label>
            <input type="text" id="pd-numero" class="input" value="${escapeHTML(endereco.numero || '')}">
          </div>
        </div>

        <div class="form-group">
          <label class="label">Complemento</label>
          <input type="text" id="pd-complemento" class="input" value="${escapeHTML(endereco.complemento || '')}">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">Cidade</label>
            <input type="text" id="pd-cidade" class="input" value="${escapeHTML(endereco.cidade || '')}">
          </div>
          <div class="form-group">
            <label class="label">UF</label>
            <input type="text" id="pd-uf" class="input" value="${escapeHTML(endereco.uf || '')}" maxlength="2">
          </div>
        </div>
      </fieldset>

      <!-- Disciplinas -->
      <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem;">Disciplinas / Turmas</legend>

        ${disciplinasErro
      ? `<div style="display: flex; align-items: center; gap: 0.8rem; padding: 1rem; background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 6px;">
              <span style="font-size: 1.2rem;">⚠️</span>
              <div>
                <div style="font-weight: 600; font-size: 0.9rem; color: #92400E;">Disciplinas indisponíveis</div>
                <div style="font-size: 0.8rem; color: #A16207;">Verifique as permissões de acesso no Supabase (RLS na tabela <code>disciplinas</code>).</div>
              </div>
            </div>`
      : disciplinas.length === 0
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

  // Salvar Alterações
  const saveBtn = container.querySelector('#save-btn')
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      saveBtn.disabled = true
      saveBtn.textContent = 'Salvando...'

      try {
        // 1. DADOS PERFIL
        const dadosPerfil = {
          data_nascimento: container.querySelector('#pd-nascimento').value || null,
          genero: container.querySelector('#pd-genero').value || null,
          estado_civil: container.querySelector('#pd-estado-civil').value || null,
          cidade_natal: container.querySelector('#pd-cidade-natal').value || null,
          nacionalidade: container.querySelector('#pd-nacionalidade').value || null,
          profissao: container.querySelector('#pd-profissao').value || null,
          graduacao: container.querySelector('#pd-graduacao').value || null,
          data_conclusao_graduacao: container.querySelector('#pd-data-conclusao').value || null,
          rg: container.querySelector('#pd-rg').value || null,
          orgao_expedidor: container.querySelector('#pd-orgao-expedidor').value || null,
          data_expedicao_rg: container.querySelector('#pd-data-expedicao-rg').value || null,
          whatsapp: container.querySelector('#pd-whatsapp').value || null
        }

        const { error: errorPerfil } = await ProfessorDetailsService.updateDadosPessoais(professorId, dadosPerfil)
        if (errorPerfil) throw errorPerfil

        // 2. ENDEREÇO
        const dadosEndereco = {
          cep: container.querySelector('#pd-cep').value || null,
          bairro: container.querySelector('#pd-bairro').value || null,
          logradouro: container.querySelector('#pd-logradouro').value || null,
          numero: container.querySelector('#pd-numero').value || null,
          complemento: container.querySelector('#pd-complemento').value || null,
          cidade: container.querySelector('#pd-cidade').value || null,
          uf: container.querySelector('#pd-uf').value || null
        }

        const { error: errorEndereco } = await ProfessorDetailsService.saveEndereco(professorId, dadosEndereco)
        if (errorEndereco) throw errorEndereco

        toast.success('Ficha do professor atualizada com sucesso!')
      } catch (err) {
        toast.error('Erro ao salvar ficha: ' + err.message)
      } finally {
        saveBtn.disabled = false
        saveBtn.textContent = 'Salvar Alterações'
      }
    })
  }

  return container
}
