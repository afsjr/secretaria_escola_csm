import { updateUserProfile } from '../auth/session'
import { toast } from '../lib/toast'
import { escapeHTML } from '../lib/security'
import { StudentDetailsService } from '../lib/student-details-service'

export async function ProfileView(profile) {
  const container = document.createElement('div')
  container.className = 'profile-view animate-in'

  // Buscar dados completos
  const { data: dadosCompletos, error: erroDados } = await StudentDetailsService.getAlunoCompleto(profile.id)

  const dados = dadosCompletos?.perfil || profile
  const endereco = dadosCompletos?.endereco || {}
  const isAluno = dados.perfil === 'aluno'

  const initials = dados.nome_completo ? escapeHTML(dados.nome_completo.charAt(0).toUpperCase()) : '?'
  const nomeValue = escapeHTML(dados.nome_completo || '')
  const cpfValue = escapeHTML(dados.cpf || '')
  const telefoneValue = escapeHTML(dados.telefone || '')
  const emailValue = escapeHTML(dados.email || '')
  const perfilValue = escapeHTML(dados.perfil || 'aluno')

  // Novos campos
  const generoValue = dados.genero || ''
  const dataNascValue = dados.data_nascimento || ''
  const estadoCivilValue = dados.estado_civil || ''
  const cidadeNatalValue = escapeHTML(dados.cidade_natal || '')
  const nacionalidadeValue = escapeHTML(dados.nacionalidade || 'Brasileira')
  const profissaoValue = escapeHTML(dados.profissao || '')
  const rgValue = escapeHTML(dados.rg || '')
  const orgaoExpValue = escapeHTML(dados.orgao_expedidor || '')
  const celularValue = escapeHTML(dados.celular || dados.telefone_comercial || '')
  const whatsappValue = escapeHTML(dados.whatsapp || '')
  const cepValue = escapeHTML(endereco.cep || '')
  const logradouroValue = escapeHTML(endereco.logradouro || '')
  const numeroValue = escapeHTML(endereco.numero || '')
  const bairroValue = escapeHTML(endereco.bairro || '')
  const cidadeValue = escapeHTML(endereco.cidade || '')
  const ufValue = escapeHTML(endereco.uf || '')

  container.innerHTML = `
    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; color: var(--text-main);">Meus Dados</h1>
      <p>Gerencie suas informações pessoais do sistema.</p>
    </header>

    <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); max-width: 800px;">
      <div style="text-align: center; margin-bottom: 2rem;">
        <div style="width: 100px; height: 100px; border-radius: 50%; background: var(--accent); display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 2.5rem; color: white; margin-bottom: 1rem;">
          ${initials}
        </div>
        <p style="font-size: 0.85rem; color: var(--text-muted);">Foto de perfil em desenvolvimento</p>
      </div>

      <form id="profile-form">
        <!-- Dados Básicos -->
        <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem;">Dados Básicos</legend>
          
          <div class="form-group">
            <label class="label" for="nome-completo">Nome Completo</label>
            <input type="text" id="nome-completo" name="nome_completo" class="input" value="${nomeValue}" required>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="label" for="cpf">CPF</label>
              <input type="text" id="cpf" name="cpf" class="input" value="${cpfValue}" placeholder="000.000.000-00" readonly style="background: var(--secondary);">
            </div>
            <div class="form-group">
              <label class="label" for="email">E-mail</label>
              <input type="email" id="email" class="input" value="${emailValue}" readonly style="background: var(--secondary);">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="label" for="data-nascimento">Data de Nascimento</label>
              <input type="date" id="data-nascimento" name="data_nascimento" class="input" value="${dataNascValue}">
            </div>
            <div class="form-group">
              <label class="label" for="genero">Gênero</label>
              <select id="genero" name="genero" class="input">
                <option value="">Não informado</option>
                <option value="masculino" ${generoValue === 'masculino' ? 'selected' : ''}>Masculino</option>
                <option value="feminino" ${generoValue === 'feminino' ? 'selected' : ''}>Feminino</option>
                <option value="outro" ${generoValue === 'outro' ? 'selected' : ''}>Outro</option>
                <option value="prefiro_nao_informar" ${generoValue === 'prefiro_nao_informar' ? 'selected' : ''}>Prefiro não informar</option>
              </select>
            </div>
            <div class="form-group">
              <label class="label" for="estado-civil">Estado Civil</label>
              <select id="estado-civil" name="estado_civil" class="input">
                <option value="">Não informado</option>
                <option value="solteiro" ${estadoCivilValue === 'solteiro' ? 'selected' : ''}>Solteiro(a)</option>
                <option value="casado" ${estadoCivilValue === 'casado' ? 'selected' : ''}>Casado(a)</option>
                <option value="divorciado" ${estadoCivilValue === 'divorciado' ? 'selected' : ''}>Divorciado(a)</option>
                <option value="viuvo" ${estadoCivilValue === 'viuvo' ? 'selected' : ''}>Viúvo(a)</option>
                <option value="uniao_estavel" ${estadoCivilValue === 'uniao_estavel' ? 'selected' : ''}>União Estável</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="label" for="cidade-natal">Cidade Natal</label>
              <input type="text" id="cidade-natal" name="cidade_natal" class="input" value="${cidadeNatalValue}">
            </div>
            <div class="form-group">
              <label class="label" for="nacionalidade">Nacionalidade</label>
              <input type="text" id="nacionalidade" name="nacionalidade" class="input" value="${nacionalidadeValue}">
            </div>
          </div>

          <div class="form-group">
            <label class="label" for="profissao">Profissão</label>
            <input type="text" id="profissao" name="profissao" class="input" value="${profissaoValue}">
          </div>
        </fieldset>

        <!-- Documentos -->
        <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem;">Documentos</legend>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="label" for="rg">RG</label>
              <input type="text" id="rg" name="rg" class="input" value="${rgValue}">
            </div>
            <div class="form-group">
              <label class="label" for="orgao-exp">Órgão Expedidor</label>
              <input type="text" id="orgao-exp" name="orgao_expedidor" class="input" value="${orgaoExpValue}">
            </div>
            <div class="form-group">
              <label class="label" for="telefone">Telefone</label>
              <input type="text" id="telefone" name="telefone" class="input" value="${telefoneValue}" placeholder="(00) 00000-0000">
            </div>
          </div>
        </fieldset>

        <!-- Contato -->
        <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem;">Contato</legend>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="label" for="celular">Celular</label>
              <input type="text" id="celular" name="celular" class="input" value="${celularValue}" placeholder="(00) 00000-0000">
            </div>
            <div class="form-group">
              <label class="label" for="whatsapp">WhatsApp</label>
              <input type="text" id="whatsapp" name="whatsapp" class="input" value="${whatsappValue}" placeholder="(00) 00000-0000">
            </div>
          </div>
        </fieldset>

        ${isAluno ? `
        <!-- Endereço -->
        <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <legend style="font-weight: 600; color: var(--primary); padding: 0 0.5rem;">Endereço</legend>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="label" for="cep">CEP</label>
              <input type="text" id="cep" name="cep" class="input" value="${cepValue}" placeholder="00000-000">
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label class="label" for="logradouro">Rua/Avenida</label>
              <input type="text" id="logradouro" name="logradouro" class="input" value="${logradouroValue}">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="label" for="numero">Número</label>
              <input type="text" id="numero" name="numero" class="input" value="${numeroValue}">
            </div>
            <div class="form-group">
              <label class="label" for="bairro">Bairro</label>
              <input type="text" id="bairro" name="bairro" class="input" value="${bairroValue}">
            </div>
            <div class="form-group">
              <label class="label" for="cidade-end">Cidade</label>
              <input type="text" id="cidade-end" name="cidade" class="input" value="${cidadeValue}">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="label" for="uf">UF</label>
              <select id="uf" name="uf" class="input">
                <option value="">Selecione</option>
                <option value="AC" ${ufValue === 'AC' ? 'selected' : ''}>AC</option>
                <option value="AL" ${ufValue === 'AL' ? 'selected' : ''}>AL</option>
                <option value="AP" ${ufValue === 'AP' ? 'selected' : ''}>AP</option>
                <option value="AM" ${ufValue === 'AM' ? 'selected' : ''}>AM</option>
                <option value="BA" ${ufValue === 'BA' ? 'selected' : ''}>BA</option>
                <option value="CE" ${ufValue === 'CE' ? 'selected' : ''}>CE</option>
                <option value="DF" ${ufValue === 'DF' ? 'selected' : ''}>DF</option>
                <option value="ES" ${ufValue === 'ES' ? 'selected' : ''}>ES</option>
                <option value="GO" ${ufValue === 'GO' ? 'selected' : ''}>GO</option>
                <option value="MA" ${ufValue === 'MA' ? 'selected' : ''}>MA</option>
                <option value="MT" ${ufValue === 'MT' ? 'selected' : ''}>MT</option>
                <option value="MS" ${ufValue === 'MS' ? 'selected' : ''}>MS</option>
                <option value="MG" ${ufValue === 'MG' ? 'selected' : ''}>MG</option>
                <option value="PA" ${ufValue === 'PA' ? 'selected' : ''}>PA</option>
                <option value="PB" ${ufValue === 'PB' ? 'selected' : ''}>PB</option>
                <option value="PR" ${ufValue === 'PR' ? 'selected' : ''}>PR</option>
                <option value="PE" ${ufValue === 'PE' ? 'selected' : ''}>PE</option>
                <option value="PI" ${ufValue === 'PI' ? 'selected' : ''}>PI</option>
                <option value="RJ" ${ufValue === 'RJ' ? 'selected' : ''}>RJ</option>
                <option value="RN" ${ufValue === 'RN' ? 'selected' : ''}>RN</option>
                <option value="RS" ${ufValue === 'RS' ? 'selected' : ''}>RS</option>
                <option value="RO" ${ufValue === 'RO' ? 'selected' : ''}>RO</option>
                <option value="RR" ${ufValue === 'RR' ? 'selected' : ''}>RR</option>
                <option value="SC" ${ufValue === 'SC' ? 'selected' : ''}>SC</option>
                <option value="SP" ${ufValue === 'SP' ? 'selected' : ''}>SP</option>
                <option value="SE" ${ufValue === 'SE' ? 'selected' : ''}>SE</option>
                <option value="TO" ${ufValue === 'TO' ? 'selected' : ''}>TO</option>
              </select>
            </div>
          </div>
        </fieldset>
        ` : ''}

        <div class="form-group">
          <label class="label">Perfil de Acesso</label>
          <span class="badge" style="background: var(--primary); color: white;">${perfilValue}</span>
        </div>

        <button type="submit" class="btn btn-primary" id="save-btn">Salvar Alterações</button>
      </form>
    </div>
  `

  const form = container.querySelector('#profile-form')
  const saveBtn = container.querySelector('#save-btn')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    saveBtn.disabled = true
    saveBtn.textContent = 'Salvando...'

    try {
      // Dados pessoais
      const dadosPessoais = {
        nome_completo: form.querySelector('#nome-completo').value,
        data_nascimento: form.querySelector('#data-nascimento').value || null,
        genero: form.querySelector('#genero').value || null,
        estado_civil: form.querySelector('#estado-civil').value || null,
        cidade_natal: form.querySelector('#cidade-natal').value || null,
        nacionalidade: form.querySelector('#nacionalidade').value || null,
        profissao: form.querySelector('#profissao').value || null,
        rg: form.querySelector('#rg').value || null,
        orgao_expedidor: form.querySelector('#orgao-exp').value || null,
        telefone: form.querySelector('#telefone').value || null,
        celular: form.querySelector('#celular').value || null,
        whatsapp: form.querySelector('#whatsapp').value || null
      }

      // Salvar dados pessoais
      const { error: errorPerfil } = await StudentDetailsService.updateDadosPessoais(profile.id, dadosPessoais)
      if (errorPerfil) throw errorPerfil

      // Salvar endereço (apenas alunos)
      if (isAluno) {
        const endereco = {
          cep: form.querySelector('#cep').value || null,
          logradouro: form.querySelector('#logradouro').value || null,
          numero: form.querySelector('#numero').value || null,
          bairro: form.querySelector('#bairro').value || null,
          cidade: form.querySelector('#cidade-end').value || null,
          uf: form.querySelector('#uf').value || null
        }

        const { error: errorEndereco } = await StudentDetailsService.saveEndereco(profile.id, endereco)
        if (errorEndereco) throw errorEndereco
      }

      toast.success('Perfil atualizado com sucesso!')

      // Refresh
      setTimeout(() => {
        window.location.hash = '#/dashboard'
      }, 800)
    } catch (error) {
      toast.error('Erro ao salvar: ' + error.message)
      saveBtn.disabled = false
      saveBtn.textContent = 'Salvar Alterações'
    }
  })

  return container
}
