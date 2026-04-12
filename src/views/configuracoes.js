import { InstituicaoService } from '../lib/instituicao-service'
import { toast } from '../lib/toast'
import { escapeHTML } from '../lib/security'

export async function ConfiguracoesView() {
  const container = document.createElement('div')
  container.className = 'configuracoes-view animate-in'

  // Carregar dados existentes
  const { data: inst, error } = await InstituicaoService.getInstituicao()

  const v = (field) => escapeHTML(inst?.[field] || '')

  container.innerHTML = `
    <!-- AVISO DE ÁREA RESTRITA -->
    <div style="background: linear-gradient(135deg, #7f1d1d, #991b1b); color: white; padding: 1rem 1.5rem; border-radius: 12px; margin-bottom: 2rem; display: flex; align-items: flex-start; gap: 1rem; box-shadow: 0 4px 15px rgba(153,27,27,0.3);">
      <div style="font-size: 1.8rem; flex-shrink: 0; margin-top: 2px;">🔐</div>
      <div>
        <div style="font-weight: 800; font-size: 1rem; margin-bottom: 0.3rem; letter-spacing: 0.02em;">ÁREA DE ACESSO RESTRITO — SOMENTE ADMINISTRADOR</div>
        <div style="font-size: 0.82rem; opacity: 0.9; line-height: 1.6;">
          As configurações desta tela afetam <strong>todo o sistema</strong> e todos os documentos gerados. 
          Alterações indevidas podem comprometer a identificação institucional nos documentos legais. 
          <strong>Apenas pessoas expressamente autorizadas pela direção da instituição devem realizar modificações aqui.</strong>
        </div>
      </div>
    </div>

    <header style="margin-bottom: 2rem;">
      <h1 style="font-size: 2rem; color: var(--text-main); display: flex; align-items: center; gap: 10px;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 4.93 19.07M4.93 4.93A10 10 0 0 1 19.07 19.07"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>
        Configurações da Instituição
      </h1>
      <p style="color: var(--text-muted);">Estes dados aparecem em todos os documentos e PDFs gerados pelo sistema.</p>
    </header>

    <div style="display: grid; grid-template-columns: 1fr 380px; gap: 2rem; align-items: start;">

      <!-- FORMULÁRIO PRINCIPAL -->
      <form id="form-instituicao">
        
        <!-- IDENTIDADE -->
        <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; background: white;">
          <legend style="font-weight: 700; color: var(--primary); padding: 0 0.5rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em;">🏫 Identidade da Escola</legend>
          
          <div class="form-group">
            <label class="label" for="inst-nome">Nome Oficial da Instituição *</label>
            <input type="text" id="inst-nome" name="nome" class="input" value="${v('nome')}" placeholder="Ex: Colégio Santa Mônica" required>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="label" for="inst-cnpj">CNPJ</label>
              <input type="text" id="inst-cnpj" name="cnpj" class="input" value="${v('cnpj')}" placeholder="00.000.000/0001-00" maxlength="18">
            </div>
            <div class="form-group">
              <label class="label" for="inst-email">E-mail Oficial</label>
              <input type="email" id="inst-email" name="email" class="input" value="${v('email')}" placeholder="secretaria@escola.edu.br">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="label" for="inst-telefone">Telefone</label>
              <input type="text" id="inst-telefone" name="telefone" class="input" value="${v('telefone')}" placeholder="(00) 0000-0000">
            </div>
            <div class="form-group">
              <label class="label" for="inst-site">Site Oficial</label>
              <input type="text" id="inst-site" name="site" class="input" value="${v('site')}" placeholder="www.escola.edu.br">
            </div>
          </div>
        </fieldset>

        <!-- ENDEREÇO -->
        <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; background: white;">
          <legend style="font-weight: 700; color: var(--primary); padding: 0 0.5rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em;">📍 Endereço</legend>

          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem;">
            <div class="form-group">
              <label class="label" for="inst-cep">CEP</label>
              <input type="text" id="inst-cep" name="cep" class="input" value="${v('cep')}" placeholder="00000-000" maxlength="9">
            </div>
            <div class="form-group">
              <label class="label" for="inst-logradouro">Rua / Avenida</label>
              <input type="text" id="inst-logradouro" name="logradouro" class="input" value="${v('logradouro')}" placeholder="Rua Principal">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 80px 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label class="label" for="inst-numero">Nº</label>
              <input type="text" id="inst-numero" name="numero" class="input" value="${v('numero')}" placeholder="123">
            </div>
            <div class="form-group">
              <label class="label" for="inst-bairro">Bairro</label>
              <input type="text" id="inst-bairro" name="bairro" class="input" value="${v('bairro')}" placeholder="Centro">
            </div>
            <div class="form-group">
              <label class="label" for="inst-complemento">Complemento</label>
              <input type="text" id="inst-complemento" name="complemento" class="input" value="${v('complemento')}" placeholder="Sala 1, Bloco B">
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 80px; gap: 1rem;">
            <div class="form-group">
              <label class="label" for="inst-cidade">Cidade</label>
              <input type="text" id="inst-cidade" name="cidade" class="input" value="${v('cidade')}" placeholder="Limoeiro">
            </div>
            <div class="form-group">
              <label class="label" for="inst-uf">UF</label>
              <select id="inst-uf" name="uf" class="input">
                ${['', 'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
                  .map(s => `<option value="${s}" ${v('uf') === s ? 'selected' : ''}>${s || 'UF'}</option>`).join('')}
              </select>
            </div>
          </div>
        </fieldset>

        <!-- COR PRIMÁRIA -->
        <fieldset style="border: 1px solid var(--secondary); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; background: white;">
          <legend style="font-weight: 700; color: var(--primary); padding: 0 0.5rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em;">🎨 Identidade Visual</legend>
          <div style="display: grid; grid-template-columns: 120px 1fr; gap: 1rem; align-items: center;">
            <div class="form-group">
              <label class="label" for="inst-cor">Cor Principal</label>
              <input type="color" id="inst-cor" name="cor_primaria" class="input" value="${inst?.cor_primaria || '#1E3A5F'}" style="height: 45px; padding: 4px; cursor: pointer;">
            </div>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 1rem;">
              Cor usada no cabeçalho dos documentos PDF e nos elementos principais do sistema.
            </p>
          </div>
        </fieldset>

        <button type="submit" class="btn btn-primary" id="btn-salvar-inst" style="width: 100%; height: 50px; font-size: 1rem; font-weight: 700;">
          💾 Salvar Configurações
        </button>
      </form>

      <!-- PAINEL DE LOGO -->
      <div style="position: sticky; top: 2rem;">
        <div style="background: white; border-radius: 12px; box-shadow: var(--shadow-md); padding: 1.5rem; border: 1px solid var(--secondary);">
          <h3 style="margin-bottom: 0.5rem; font-size: 1rem; color: var(--text-main);">🖼️ Logo da Instituição</h3>
          <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.6;">
            A logo aparece no cabeçalho de todos os PDFs gerados.
          </p>

          <!-- Área de Preview -->
          <div id="logo-preview-area" style="width: 100%; height: 160px; border: 2px dashed var(--border); border-radius: 8px; display: flex; align-items: center; justify-content: center; background: var(--secondary); margin-bottom: 1rem; overflow: hidden; position: relative;">
            ${inst?.logo_url
              ? `<img src="${inst.logo_url}" alt="Logo" style="max-width: 100%; max-height: 100%; object-fit: contain; padding: 1rem;">`
              : `<div style="text-align: center; color: var(--text-muted);">
                  <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🏫</div>
                  <div style="font-size: 0.8rem;">Sem logo cadastrada</div>
                </div>`
            }
          </div>

          <!-- Especificações -->
          <div style="background: #f8fafc; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; border-left: 3px solid var(--accent);">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">📐 ESPECIFICAÇÕES</div>
            <ul style="font-size: 0.75rem; color: var(--text-muted); line-height: 2; list-style: none; padding: 0; margin: 0;">
              <li>✅ <strong>Formato ideal:</strong> PNG (fundo transparente)</li>
              <li>✅ <strong>Dimensões:</strong> 400 × 200px (proporção 2:1)</li>
              <li>✅ <strong>Tamanho máx.:</strong> 500KB</li>
              <li>⚠️ <strong>Aceitos também:</strong> JPG, SVG, WebP</li>
            </ul>
          </div>

          <!-- Input de Upload -->
          <label for="logo-file-input" class="btn" style="display: block; text-align: center; cursor: pointer; background: var(--secondary); color: var(--text-main); border: 1px solid var(--border); width: 100%; box-sizing: border-box;">
            📁 Escolher Arquivo
          </label>
          <input type="file" id="logo-file-input" accept="image/png,image/jpeg,image/svg+xml,image/webp" style="display: none;">
          
          <div id="upload-status" style="margin-top: 0.5rem; font-size: 0.8rem; text-align: center; color: var(--text-muted); min-height: 20px;"></div>

          ${inst?.logo_url ? `
            <button id="btn-remover-logo" class="btn" style="width: 100%; margin-top: 0.5rem; background: transparent; color: var(--danger); border: 1px solid var(--danger); font-size: 0.8rem;">
              🗑️ Remover Logo
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `

  // ─── LÓGICA DE UPLOAD DA LOGO ───────────────────────────────────────
  const logoInput = container.querySelector('#logo-file-input')
  const previewArea = container.querySelector('#logo-preview-area')
  const uploadStatus = container.querySelector('#upload-status')

  logoInput.addEventListener('change', async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    uploadStatus.textContent = '⏳ Enviando logo...'
    uploadStatus.style.color = 'var(--accent)'

    const { data, error } = await InstituicaoService.uploadLogo(file)

    if (error) {
      uploadStatus.textContent = '❌ ' + error.message
      uploadStatus.style.color = 'var(--danger)'
      return
    }

    // Atualiza preview sem reload
    previewArea.innerHTML = `<img src="${data.url}" alt="Logo" style="max-width: 100%; max-height: 100%; object-fit: contain; padding: 1rem;">`
    uploadStatus.textContent = '✅ Logo enviada com sucesso!'
    uploadStatus.style.color = 'var(--success)'
    toast.success('Logo atualizada! Os PDFs já usarão a nova logo.')
  })

  // ─── LÓGICA DE REMOÇÃO DA LOGO ──────────────────────────────────────
  container.querySelector('#btn-remover-logo')?.addEventListener('click', async () => {
    if (!confirm('Remover a logo da instituição?')) return
    const { error } = await InstituicaoService.saveInstituicao({ logo_url: null })
    if (error) return toast.error('Erro ao remover: ' + error.message)
    previewArea.innerHTML = `<div style="text-align: center; color: var(--text-muted);"><div style="font-size: 2.5rem;">🏫</div><div style="font-size: 0.8rem;">Sem logo cadastrada</div></div>`
    toast.success('Logo removida.')
  })

  // ─── LÓGICA DE SALVAR FORMULÁRIO ────────────────────────────────────
  const form = container.querySelector('#form-instituicao')
  const btnSalvar = container.querySelector('#btn-salvar-inst')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    btnSalvar.disabled = true
    btnSalvar.textContent = '⏳ Salvando...'

    const fd = new FormData(form)
    const payload = Object.fromEntries(fd.entries())

    // Remover campos vazios para não sobrescrever com null
    Object.keys(payload).forEach(k => {
      if (payload[k] === '') delete payload[k]
    })

    const { error } = await InstituicaoService.saveInstituicao(payload)

    if (error) {
      toast.error('Erro ao salvar: ' + error.message)
    } else {
      toast.success('Configurações salvas! Os documentos já refletem as mudanças.')
    }

    btnSalvar.disabled = false
    btnSalvar.textContent = '💾 Salvar Configurações'
  })

  return container
}
