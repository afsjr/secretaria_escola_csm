import { toast } from '../lib/toast'
import { escapeHTML, createBadge } from '../lib/security'
import { StudentDetailsService } from '../lib/student-details-service'
import { supabase } from '../lib/supabase'
import type { UserRole } from '../types'

interface ProfileParam {
  id: string
  perfil: UserRole
}

export async function ProfileView(profile: ProfileParam): Promise<HTMLElement> {
  const container = document.createElement('div')
  container.className = 'profile-view animate-in'

  // Buscar dados completos
  const { data: dadosCompletos, error: erroDados } = await StudentDetailsService.getAlunoCompleto(profile.id)

  if (erroDados) {
    console.error('Erro ao buscar dados completos:', erroDados)
  }

const dados = dadosCompletos?.perfil || { id: profile.id, nome_completo: '', email: '', perfil: profile.perfil, cpf: '', telefone: '' }
  const dadosExtras = dadosCompletos?.perfil as any || {}
  const enderecoData = dadosCompletos?.endereco as any || {}
  const isAluno = (dados as any).perfil === 'aluno'

  const initials = dados.nome_completo ? escapeHTML(dados.nome_completo.charAt(0).toUpperCase()) : '?'
  const nomeValue = escapeHTML(dados.nome_completo || '')
  const cpfValue = escapeHTML(dados.cpf || '')
  const telefoneValue = escapeHTML(dados.telefone || '')
  const emailValue = escapeHTML(dados.email || '')
  const perfilValue = escapeHTML(dados.perfil || 'aluno')

  // Novos campos (do PerfilCompleto)
  const generoValue = dadosExtras.genero || ''
  const dataNascValue = dadosExtras.data_nascimento || ''
  const estadoCivilValue = dadosExtras.estado_civil || ''
  const cidadeNatalValue = escapeHTML(dadosExtras.cidade_natal || '')
  const nacionalidadeValue = escapeHTML(dadosExtras.nacionalidade || 'Brasileira')
  const profissaoValue = escapeHTML(dadosExtras.profissao || '')
  const rgValue = escapeHTML(dadosExtras.rg || '')
  const orgaoExpValue = escapeHTML(dadosExtras.orgao_expedidor || '')
  const celularValue = escapeHTML(dadosExtras.celular || dadosExtras.telefone_comercial || '')
  const whatsappValue = escapeHTML(dadosExtras.whatsapp || '')
  const cepValue = escapeHTML(enderecoData?.cep || '')
  const logradouroValue = escapeHTML(enderecoData?.logradouro || '')
  const numeroValue = escapeHTML(enderecoData?.numero || '')
  const bairroValue = escapeHTML(enderecoData?.bairro || '')
  const cidadeValue = escapeHTML(enderecoData?.cidade || '')
  const ufValue = escapeHTML(enderecoData?.uf || '')

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
          ${createBadge(perfilValue, 'badge')}
        </div>

        <div style="margin-top: 2rem; margin-bottom: 2rem;">
          <button type="submit" class="btn btn-primary" id="save-btn" style="width: 100%;">Salvar Dados Pessoais</button>
        </div>
      </form>

      <hr style="border: 0; border-top: 1px solid var(--secondary); margin: 2rem 0;">

      <!-- Seção de Segurança -->
      <form id="password-form">
        <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 8px; background: var(--secondary); background-opacity: 0.2;">
          <legend style="font-weight: 600; color: var(--danger); padding: 0 0.5rem;">Segurança: Alterar Senha</legend>

          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
            A nova senha deve ter no mínimo **8 caracteres**, contendo **letras e números** (Ex: csm_1983#).
          </p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="label" for="nova-senha">Nova Senha</label>
              <input type="password" id="nova-senha" class="input" placeholder="******" minlength="8">
            </div>
            <div class="form-group">
              <label class="label" for="confirma-senha">Confirmar Nova Senha</label>
              <input type="password" id="confirma-senha" class="input" placeholder="******" minlength="8">
            </div>
          </div>

          <button type="submit" class="btn" id="update-password-btn" style="background: var(--primary); color: white; margin-top: 1rem;">Atualizar Senha</button>
        </fieldset>
      </form>
    </div>
  `

  const form = container.querySelector('#profile-form') as HTMLFormElement
  const saveBtn = container.querySelector('#save-btn') as HTMLButtonElement

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    saveBtn.disabled = true
    saveBtn.textContent = 'Salvando...'

    try {
      // Dados pessoais
      const dadosPessoais = {
        nome_completo: (form.querySelector('#nome-completo') as HTMLInputElement).value,
        data_nascimento: (form.querySelector('#data-nascimento') as HTMLInputElement).value || null,
        genero: (form.querySelector('#genero') as HTMLSelectElement).value || null,
        estado_civil: (form.querySelector('#estado-civil') as HTMLSelectElement).value || null,
        cidade_natal: (form.querySelector('#cidade-natal') as HTMLInputElement).value || null,
        nacionalidade: (form.querySelector('#nacionalidade') as HTMLInputElement).value || null,
        profissao: (form.querySelector('#profissao') as HTMLInputElement).value || null,
        rg: (form.querySelector('#rg') as HTMLInputElement).value || null,
        orgao_expedidor: (form.querySelector('#orgao-exp') as HTMLInputElement).value || null,
        telefone: (form.querySelector('#telefone') as HTMLInputElement).value || null,
        celular: (form.querySelector('#celular') as HTMLInputElement).value || null,
        whatsapp: (form.querySelector('#whatsapp') as HTMLInputElement).value || null
      }

      // Salvar dados pessoais
      const { error: errorPerfil } = await StudentDetailsService.updateDadosPessoais(profile.id, dadosPessoais)
      if (errorPerfil) throw errorPerfil

      // Salvar endereço (apenas alunos)
      if (isAluno) {
        const endereco = {
          cep: (form.querySelector('#cep') as HTMLInputElement).value || null,
          logradouro: (form.querySelector('#logradouro') as HTMLInputElement).value || null,
          numero: (form.querySelector('#numero') as HTMLInputElement).value || null,
          bairro: (form.querySelector('#bairro') as HTMLInputElement).value || null,
          cidade: (form.querySelector('#cidade-end') as HTMLInputElement).value || null,
          uf: (form.querySelector('#uf') as HTMLSelectElement).value || null
        }

        const { error: errorEndereco } = await StudentDetailsService.saveEndereco(profile.id, endereco)
        if (errorEndereco) throw errorEndereco
      }

      toast.success('Perfil atualizado com sucesso!')

      // Refresh
      setTimeout(() => {
        window.location.hash = '#/dashboard'
      }, 800)
    } catch (error: any) {
      toast.error('Erro ao salvar: ' + error.message)
      saveBtn.disabled = false
      saveBtn.textContent = 'Salvar Dados Pessoais'
    }
  })

  // Lógica de Troca de Senha
  const passwordForm = container.querySelector('#password-form') as HTMLFormElement
  const updatePasswordBtn = container.querySelector('#update-password-btn') as HTMLButtonElement

  passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault()

    const novaSenha = (container.querySelector('#nova-senha') as HTMLInputElement).value
    const confirmaSenha = (container.querySelector('#confirma-senha') as HTMLInputElement).value

    if (!novaSenha) {
      toast.error('Digite a nova senha.')
      return
    }

    if (novaSenha !== confirmaSenha) {
      toast.error('As senhas não coincidem.')
      return
    }

    // Validação de força (8 caracteres, letras e números)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(novaSenha)) {
      toast.error('Senha fraca! Use 8+ caracteres, com letras e números.')
      return
    }

    updatePasswordBtn.disabled = true
    updatePasswordBtn.textContent = 'Atualizando...'

    const { error } = await supabase.auth.updateUser({ password: novaSenha })

    if (error) {
      toast.error('Erro ao atualizar senha: ' + error.message)
      updatePasswordBtn.disabled = false
      updatePasswordBtn.textContent = 'Atualizar Senha'
    } else {
      toast.success('Senha atualizada com sucesso!')
      passwordForm.reset()
      updatePasswordBtn.disabled = false
      updatePasswordBtn.textContent = 'Atualizar Senha'
    }
  })

  return container
}
