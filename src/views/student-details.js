/**
 * Student Details View - Ficha Completa do Aluno (Secretaria)
 * 
 * Permite visualizar e editar TODOS os dados de um aluno:
 * - Dados pessoais
 * - Endereço
 * - Responsáveis (CRUD)
 * - Observações (CRUD)
 * - Dados da matrícula
 */

import { toast } from '../lib/toast'
import { escapeHTML, createBadge, createOption } from '../lib/security'
import { StudentDetailsService } from '../lib/student-details-service'
import { AcademicService } from '../lib/academic-service'

export async function StudentDetailsView(alunoId) {
  const container = document.createElement('div')
  container.className = 'student-details-view animate-in'

  // Buscar dados completos
  const { data: dadosCompletos, error } = await StudentDetailsService.getAlunoCompleto(alunoId)

  if (error) {
    container.innerHTML = `
      <div style="padding: 2rem; text-align: center;">
        <h2 style="color: var(--danger);">Erro ao carregar dados do aluno</h2>
        <p>${escapeHTML(error.message)}</p>
        <button onclick="history.back()" class="btn btn-primary" style="margin-top: 1rem;">Voltar</button>
      </div>
    `
    return container
  }

  const dados = dadosCompletos.perfil
  const endereco = dadosCompletos.endereco || {}
  const responsaveis = dadosCompletos.responsaveis || []
  const observacoes = dadosCompletos.observacoes || []
  const matricula = dadosCompletos.matricula
  const turma = matricula?.turmas

  // Calcular idade
  let idade = '-'
  if (dados.data_nascimento) {
    const nasc = new Date(dados.data_nascimento)
    const hoje = new Date()
    idade = Math.floor((hoje - nasc) / (365.25 * 24 * 60 * 60 * 1000))
  }

  const isMenor = dados.data_nascimento && idade < 18

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
        <h1 style="font-size: 2rem; color: var(--text-main);">Ficha do Aluno</h1>
        <p>Visualize e edite todos os dados do aluno.</p>
      </div>
      <button onclick="history.back()" class="btn" style="background: var(--secondary);">← Voltar</button>
    </header>

    <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); max-width: 900px;">
      <!-- Cabeçalho do Aluno -->
      <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid var(--secondary);">
        <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 2rem; color: white; flex-shrink: 0;">
          ${initials}
        </div>
        <div style="flex: 1;">
          <h2 style="margin: 0; color: var(--text-main);">${escapeHTML(dados.nome_completo)}</h2>
          <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap;">
            ${createBadge(dados.perfil)}
            ${matricula ? createBadge(`Turma: ${escapeHTML(turma?.nome || 'N/A')}`, 'badge') : createBadge('Sem matrícula ativa', 'badge')}
            ${isMenor ? createBadge('Menor de Idade', 'badge') : ''}
          </div>
        </div>
        <div style="text-align: right; font-size: 0.9rem; color: var(--text-muted);">
          <div>Idade: <strong>${idade}</strong></div>
          <div>CPF: <strong>${escapeHTML(dados.cpf || '-')}</strong></div>
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

        <div class="form-group">
          <label class="label">Profissão / Empresa</label>
          <div class="field-value">
            ${escapeHTML(dados.profissao || '-')}
            ${dados.empresa_trabalho ? ` - ${escapeHTML(dados.empresa_trabalho)}` : ''}
          </div>
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

      <!-- Responsáveis -->
      <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem; display: flex; justify-content: space-between; align-items: center;">
          Responsáveis ${isMenor ? '(Obrigatório)' : '(Opcional)'}
          <button id="add-responsavel-btn" class="btn btn-primary" style="font-size: 0.8rem; padding: 0.3rem 0.8rem;">+ Adicionar</button>
        </legend>
        
        <div id="responsaveis-list">
          ${responsaveis.length === 0 
            ? `<p style="color: var(--text-muted); font-size: 0.9rem;">Nenhum responsável cadastrado.</p>`
            : `
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${responsaveis.map(r => `
                <div class="responsavel-item" data-id="${r.id}" style="padding: 1rem; background: var(--secondary); border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <div style="font-weight: 600;">${escapeHTML(r.nome)} ${r.principal ? '<span class="badge">Principal</span>' : ''}</div>
                    <div style="font-size: 0.85rem; color: var(--text-muted);">${escapeHTML(r.parentesco || '-')} | ${escapeHTML(r.telefone || '-')} | ${escapeHTML(r.email || '-')}</div>
                  </div>
                  <div style="display: flex; gap: 0.5rem;">
                    <button class="btn-edit-responsavel btn" style="font-size: 0.75rem; padding: 0.2rem 0.5rem;" data-id="${r.id}">Editar</button>
                    <button class="btn-delete-responsavel btn" style="font-size: 0.75rem; padding: 0.2rem 0.5rem; background: var(--danger); color: white;" data-id="${r.id}">X</button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </fieldset>

      <!-- Observações -->
      <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem; display: flex; justify-content: space-between; align-items: center;">
          Observações / Follow-up
          <button id="add-observacao-btn" class="btn btn-primary" style="font-size: 0.8rem; padding: 0.3rem 0.8rem;">+ Adicionar</button>
        </legend>
        
        <div id="observacoes-list">
          ${observacoes.length === 0 
            ? `<p style="color: var(--text-muted); font-size: 0.9rem;">Nenhuma observação registrada.</p>`
            : `
            <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 300px; overflow-y: auto;">
              ${observacoes.map(o => `
                <div class="observacao-item" data-id="${o.id}" style="padding: 1rem; background: var(--secondary); border-radius: 6px;">
                  <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                      <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                        ${createBadge(o.categoria || 'geral')}
                        <span style="font-size: 0.8rem; color: var(--text-muted);">${new Date(o.criado_em).toLocaleDateString('pt-BR')} ${o.criado_por_perfis ? `- ${escapeHTML(o.criado_por_perfis.nome_completo)}` : ''}</span>
                      </div>
                      <div style="white-space: pre-wrap;">${escapeHTML(o.texto)}</div>
                    </div>
                    <button class="btn-delete-observacao btn" style="font-size: 0.75rem; padding: 0.2rem 0.5rem; background: var(--danger); color: white;" data-id="${o.id}">X</button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </fieldset>

      <!-- Botão Salvar -->
      <div style="display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem;">
        <button id="save-btn" class="btn btn-primary">Salvar Alterações</button>
      </div>
    </div>
  `

  // === Event Handlers ===

  // Adicionar responsável
  const addResponsavelBtn = container.querySelector('#add-responsavel-btn')
  addResponsavelBtn.addEventListener('click', async () => {
    const nome = prompt('Nome do responsável:')
    if (!nome) return
    
    const parentesco = prompt('Parentesco (Ex: Pai, Mãe, Tutor):') || ''
    const telefone = prompt('Telefone:') || ''
    const email = prompt('E-mail:') || ''

    const { error } = await StudentDetailsService.addResponsavel(alunoId, {
      nome,
      parentesco,
      telefone,
      email,
      principal: responsaveis.length === 0
    })

    if (error) {
      toast.error('Erro ao adicionar responsável: ' + error.message)
    } else {
      toast.success('Responsável adicionado!')
      // Recarregar view
      window.location.reload()
    }
  })

  // Deletar responsável
  container.querySelectorAll('.btn-delete-responsavel').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const id = btn.getAttribute('data-id')
      if (!confirm('Deseja remover este responsável?')) return

      const { error } = await StudentDetailsService.deleteResponsavel(id)
      if (error) {
        toast.error('Erro ao remover: ' + error.message)
      } else {
        toast.success('Responsável removido!')
        window.location.reload()
      }
    })
  })

  // Adicionar observação
  const addObservacaoBtn = container.querySelector('#add-observacao-btn')
  addObservacaoBtn.addEventListener('click', async () => {
    const texto = prompt('Observação:')
    if (!texto) return
    
    const categoria = prompt('Categoria (geral, follow, importante, saude):') || 'geral'

    const { error } = await StudentDetailsService.addObservacao(alunoId, texto, categoria)
    if (error) {
      toast.error('Erro ao adicionar observação: ' + error.message)
    } else {
      toast.success('Observação registrada!')
      window.location.reload()
    }
  })

  // Deletar observação
  container.querySelectorAll('.btn-delete-observacao').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const id = btn.getAttribute('data-id')
      if (!confirm('Deseja remover esta observação?')) return

      const { error } = await StudentDetailsService.deleteObservacao(id)
      if (error) {
        toast.error('Erro ao remover: ' + error.message)
      } else {
        toast.success('Observação removida!')
        window.location.reload()
      }
    })
  })

  return container
}
