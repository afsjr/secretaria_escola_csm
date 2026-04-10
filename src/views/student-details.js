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
    idade = hoje.getFullYear() - nasc.getFullYear()
    const mesDiff = hoje.getMonth() - nasc.getMonth()
    if (mesDiff < 0 || (mesDiff === 0 && hoje.getDate() < nasc.getDate())) {
      idade--
    }
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
            <input type="date" id="sd-nascimento" class="input" value="${dados.data_nascimento || ''}">
          </div>
          <div class="form-group">
            <label class="label">Gênero</label>
            <select id="sd-genero" class="input">
              <option value="">--</option>
              ${createOption('masculino', 'Masculino', dados.genero)}
              ${createOption('feminino', 'Feminino', dados.genero)}
              ${createOption('outro', 'Outro', dados.genero)}
              ${createOption('prefiro_nao_informar', 'Prefiro não informar', dados.genero)}
            </select>
          </div>
          <div class="form-group">
            <label class="label">Estado Civil</label>
            <select id="sd-estado-civil" class="input">
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
            <input type="text" id="sd-cidade-natal" class="input" value="${escapeHTML(dados.cidade_natal || '')}">
          </div>
          <div class="form-group">
            <label class="label">Nacionalidade</label>
            <input type="text" id="sd-nacionalidade" class="input" value="${escapeHTML(dados.nacionalidade || 'Brasileira')}">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">Profissão</label>
            <input type="text" id="sd-profissao" class="input" value="${escapeHTML(dados.profissao || '')}">
          </div>
          <div class="form-group">
            <label class="label">Empresa</label>
            <input type="text" id="sd-empresa" class="input" value="${escapeHTML(dados.empresa_trabalho || '')}">
          </div>
        </div>
      </fieldset>

      <!-- Documentos -->
      <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem;">Documentos</legend>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">RG</label>
            <input type="text" id="sd-rg" class="input" value="${escapeHTML(dados.rg || '')}">
          </div>
          <div class="form-group">
            <label class="label">Órgão Expedidor</label>
            <input type="text" id="sd-orgao-expedidor" class="input" value="${escapeHTML(dados.orgao_expedidor || '')}">
          </div>
          <div class="form-group">
            <label class="label">Data de Expedição</label>
            <input type="date" id="sd-data-expedicao-rg" class="input" value="${dados.data_expedicao_rg || ''}">
          </div>
        </div>
      </fieldset>

      <!-- Contato -->
      <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem;">Contato</legend>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">Telefone</label>
            <input type="text" id="sd-telefone" class="input" value="${escapeHTML(dados.telefone || '')}">
          </div>
          <div class="form-group">
            <label class="label">Celular</label>
            <input type="text" id="sd-celular" class="input" value="${escapeHTML(dados.celular || '')}">
          </div>
          <div class="form-group">
            <label class="label">WhatsApp</label>
            <input type="text" id="sd-whatsapp" class="input" value="${escapeHTML(dados.whatsapp || '')}">
          </div>
        </div>
      </fieldset>

      <!-- Endereço -->
      <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem;">Endereço</legend>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">CEP</label>
            <input type="text" id="sd-cep" class="input" value="${escapeHTML(endereco.cep || '')}">
          </div>
          <div class="form-group">
            <label class="label">Bairro</label>
            <input type="text" id="sd-bairro" class="input" value="${escapeHTML(endereco.bairro || '')}">
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">Logradouro (Rua, Av, etc)</label>
            <input type="text" id="sd-logradouro" class="input" value="${escapeHTML(endereco.logradouro || '')}">
          </div>
          <div class="form-group">
            <label class="label">Número</label>
            <input type="text" id="sd-numero" class="input" value="${escapeHTML(endereco.numero || '')}">
          </div>
        </div>

        <div class="form-group">
          <label class="label">Complemento</label>
          <input type="text" id="sd-complemento" class="input" value="${escapeHTML(endereco.complemento || '')}">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="form-group">
            <label class="label">Cidade</label>
            <input type="text" id="sd-cidade" class="input" value="${escapeHTML(endereco.cidade || '')}">
          </div>
          <div class="form-group">
            <label class="label">UF</label>
            <input type="text" id="sd-uf" class="input" value="${escapeHTML(endereco.uf || '')}" maxlength="2">
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
                    <div style="font-weight: 600;">${escapeHTML(r.nome)} ${r.principal ? '<span class="badge">Principal</span>' : ''} ${r.financeiro ? '<span class="badge badge-warning" style="background:#fef08a;color:#854d0e;">Financeiro</span>' : ''}</div>
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

  // Salvar Alterações Principais
  const saveBtn = container.querySelector('#save-btn')
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true
    saveBtn.textContent = 'Salvando...'

    try {
      // 1. DADOS PERFIL
      const dadosPerfil = {
        data_nascimento: container.querySelector('#sd-nascimento').value || null,
        genero: container.querySelector('#sd-genero').value || null,
        estado_civil: container.querySelector('#sd-estado-civil').value || null,
        cidade_natal: container.querySelector('#sd-cidade-natal').value || null,
        nacionalidade: container.querySelector('#sd-nacionalidade').value || null,
        profissao: container.querySelector('#sd-profissao').value || null,
        empresa_trabalho: container.querySelector('#sd-empresa').value || null,
        rg: container.querySelector('#sd-rg').value || null,
        orgao_expedidor: container.querySelector('#sd-orgao-expedidor').value || null,
        data_expedicao_rg: container.querySelector('#sd-data-expedicao-rg').value || null,
        telefone: container.querySelector('#sd-telefone').value || null,
        celular: container.querySelector('#sd-celular').value || null,
        whatsapp: container.querySelector('#sd-whatsapp').value || null
      }

      const { error: errorPerfil } = await StudentDetailsService.updateDadosPessoais(alunoId, dadosPerfil)
      if (errorPerfil) throw errorPerfil

      // 2. ENDEREÇO
      const dadosEndereco = {
        cep: container.querySelector('#sd-cep').value || null,
        bairro: container.querySelector('#sd-bairro').value || null,
        logradouro: container.querySelector('#sd-logradouro').value || null,
        numero: container.querySelector('#sd-numero').value || null,
        complemento: container.querySelector('#sd-complemento').value || null,
        cidade: container.querySelector('#sd-cidade').value || null,
        uf: container.querySelector('#sd-uf').value || null
      }

      const { error: errorEndereco } = await StudentDetailsService.saveEndereco(alunoId, dadosEndereco)
      if (errorEndereco) throw errorEndereco

      toast.success('Ficha do aluno atualizada com sucesso!')
    } catch (err) {
      toast.error('Erro ao salvar ficha: ' + err.message)
    } finally {
      saveBtn.disabled = false
      saveBtn.textContent = 'Salvar Alterações'
    }
  })

  // Adicionar responsável
  const addResponsavelBtn = container.querySelector('#add-responsavel-btn')
  addResponsavelBtn.addEventListener('click', async () => {
    const nome = prompt('Nome do responsável:')
    if (!nome) return

    const parentesco = prompt('Parentesco (Ex: Pai, Mãe, Tutor):') || ''
    const telefone = prompt('Telefone:') || ''
    const email = prompt('E-mail:') || ''
    const financeiroStr = prompt('É o Responsável Financeiro? (S/N)') || 'N'
    const isFinanceiro = financeiroStr.toUpperCase() === 'S'

    const { error } = await StudentDetailsService.addResponsavel(alunoId, {
      nome,
      parentesco,
      telefone,
      email,
      financeiro: isFinanceiro,
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
