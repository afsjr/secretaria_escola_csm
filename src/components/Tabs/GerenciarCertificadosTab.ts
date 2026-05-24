import { CertificateService } from '../../lib/certificate-service'
import { supabase } from '../../lib/supabase'
import { toast } from '../../lib/toast'
import { escapeHTML } from '../../lib/security'
import { ICONS } from '../../lib/icons'
import { getUserProfile } from '../../auth/session'

export function GerenciarCertificadosTab(): HTMLDivElement {
  const container = document.createElement('div')

  const render = async () => {
    const profile = await getUserProfile()
    const isMasterAdmin = profile?.perfil === 'master_admin'

    const { data: modelos } = await supabase
      .from('certificados_modelos')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: alunosConcluidos } = await supabase
      .from('matriculas')
      .select('id, aluno_id, perfis!inner(id, nome_completo, cpf), turmas!inner(id, nome, cursos!inner(id, nome))')
      .eq('status_aluno', 'concluido')

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem;">
        <!-- Coluna da Esquerda: Upload de Imagens -->
        <div>
          <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); margin-bottom: 2rem; border-top: 4px solid var(--primary);">
            <h3 style="margin-bottom: 1rem;">${ICONS.image} Imagens do Certificado</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Faça upload da logo e assinatura do colégio. Formatos: PNG, JPEG.</p>

            <form id="form-upload-logo" style="margin-bottom: 1.5rem;">
              <div class="form-group">
                <label class="label">Logo do Colégio</label>
                <input type="file" id="input-logo" class="input" accept="image/png,image/jpeg" ${isMasterAdmin ? '' : 'disabled'}>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%;" ${isMasterAdmin ? '' : 'disabled'}>
                ${ICONS.upload} Enviar Logo
              </button>
            </form>

            <form id="form-upload-assinatura">
              <div class="form-group">
                <label class="label">Assinatura do Diretor</label>
                <input type="file" id="input-assinatura" class="input" accept="image/png,image/jpeg" ${isMasterAdmin ? '' : 'disabled'}>
              </div>
              <button type="submit" class="btn btn-primary" style="width: 100%;" ${isMasterAdmin ? '' : 'disabled'}>
                ${ICONS.upload} Enviar Assinatura
              </button>
            </form>

            ${!isMasterAdmin ? '<p style="font-size: 0.8rem; color: var(--danger); margin-top: 0.5rem;">Apenas master_admin pode gerenciar imagens.</p>' : ''}
          </div>

          <!-- Lista de Modelos -->
          <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
            <h3 style="margin-bottom: 1rem;">Modelos Ativos</h3>
            ${!modelos || modelos.length === 0 ? '<p style="color: var(--text-muted);">Nenhum modelo configurado.</p>' : `
              <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                ${modelos.map((m: any) => `
                  <div style="padding: 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-md);">
                    <div style="font-weight: 600;">${escapeHTML(m.nome)}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">
                      ${m.tipo_curso === 'formacao' ? 'Formação' : 'Técnico'} |
                      ${m.logo_path ? 'Logo ✓' : 'Logo —'} |
                      ${m.assinatura_path ? 'Assinatura ✓' : 'Assinatura —'}
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        </div>

        <!-- Coluna da Direita: Geração de Certificados -->
        <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
          <h3 style="margin-bottom: 1rem;">${ICONS.graduation} Gerar Certificados</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Selecione um aluno com matrícula concluída para gerar o certificado.</p>

          <div class="form-group">
            <label class="label" for="select-aluno-certificado">Aluno</label>
            <select id="select-aluno-certificado" class="input">
              <option value="">-- Selecione --</option>
              ${(alunosConcluidos || []).map((m: any) => {
                const p = Array.isArray(m.perfis) ? m.perfis[0] : m.perfis
                return `<option value="${m.aluno_id}" data-curso-id="${m.turmas?.cursos?.id || ''}" data-curso-nome="${escapeHTML(m.turmas?.cursos?.nome || '')}" data-aluno-nome="${escapeHTML(p?.nome_completo || '')}" data-aluno-cpf="${escapeHTML(p?.cpf || '')}">${escapeHTML(p?.nome_completo)} - ${escapeHTML(m.turmas?.cursos?.nome)}</option>`
              }).join('')}
            </select>
          </div>

          <div style="display: flex; gap: 0.75rem;">
            <button id="btn-gerar-certificado" class="btn btn-primary" style="flex: 1;">
              ${ICONS.file} Gerar Certificado
            </button>
          </div>

          <div id="certificado-preview" style="margin-top: 1.5rem; display: none;">
            <hr style="margin-bottom: 1rem;">
            <div id="certificado-result"></div>
          </div>
        </div>
      </div>
    `
  }

  render()

  setTimeout(() => {
    // Upload Logo
    const formLogo = container.querySelector('#form-upload-logo') as HTMLFormElement
    if (formLogo) {
      formLogo.addEventListener('submit', async (e) => {
        e.preventDefault()
        const input = container.querySelector('#input-logo') as HTMLInputElement
        if (!input.files?.[0]) { toast.error('Selecione uma imagem.'); return }

        const file = input.files[0]
        const path = `logos/${Date.now()}_${file.name}`

        const { error: uploadError } = await supabase.storage
          .from('certificados-imagens')
          .upload(path, file)

        if (uploadError) { toast.error('Erro no upload: ' + uploadError.message); return }

        await supabase.from('certificados_modelos').upsert({
          nome: 'Padrão',
          tipo_curso: 'formacao',
          logo_path: path,
        }, { onConflict: 'id' })

        toast.success('Logo enviada!')
        render()
      })
    }

    // Upload Assinatura
    const formAssinatura = container.querySelector('#form-upload-assinatura') as HTMLFormElement
    if (formAssinatura) {
      formAssinatura.addEventListener('submit', async (e) => {
        e.preventDefault()
        const input = container.querySelector('#input-assinatura') as HTMLInputElement
        if (!input.files?.[0]) { toast.error('Selecione uma imagem.'); return }

        const file = input.files[0]
        const path = `assinaturas/${Date.now()}_${file.name}`

        const { error: uploadError } = await supabase.storage
          .from('certificados-imagens')
          .upload(path, file)

        if (uploadError) { toast.error('Erro no upload: ' + uploadError.message); return }

        await supabase.from('certificados_modelos').upsert({
          nome: 'Padrão',
          tipo_curso: 'formacao',
          assinatura_path: path,
        }, { onConflict: 'id' })

        toast.success('Assinatura enviada!')
        render()
      })
    }

    // Gerar Certificado
    const btnGerar = container.querySelector('#btn-gerar-certificado') as HTMLButtonElement
    if (btnGerar) {
      btnGerar.addEventListener('click', async () => {
        const select = container.querySelector('#select-aluno-certificado') as HTMLSelectElement
        const option = select.selectedOptions[0]
        if (!option.value) { toast.error('Selecione um aluno.'); return }

        const alunoId = option.value
        const cursoId = option.getAttribute('data-curso-id')!
        const cursoNome = option.getAttribute('data-curso-nome')!
        const alunoNome = option.getAttribute('data-aluno-nome')!
        const alunoCpf = option.getAttribute('data-aluno-cpf')!

        const profile = await getUserProfile()
        if (!profile) { toast.error('Usuário não autenticado.'); return }

        btnGerar.disabled = true
        btnGerar.textContent = 'Gerando...'

        try {
          const { pdf, hash, error } = await CertificateService.gerarCertificado(
            alunoId, cursoId, cursoNome, alunoNome, alunoCpf, 0, 'formacao', profile.id
          )

          if (error) { toast.error(error.message); return }

          if (pdf) {
            pdf.save(`certificado_${hash}.pdf`)
            toast.success('Certificado gerado com sucesso!')
          }
        } catch (err: any) {
          toast.error('Erro ao gerar certificado: ' + err.message)
        } finally {
          btnGerar.disabled = false
          btnGerar.textContent = `${ICONS.file} Gerar Certificado`
        }
      })
    }
  }, 100)

  return container
}
