import { DocumentsService } from '../lib/documents-service'
import { AdminService } from '../lib/admin-service'
import { ProfessorService } from '../lib/professor-service'
import { CourseService } from '../lib/course-service'
import { PDFService } from '../lib/pdf-service'
import { AcademicService } from '../lib/academic-service'
import { supabase } from '../lib/supabase'
import { toast } from '../lib/toast'
import { StudentDetailsView } from './student-details'
import { ProfessorDetailsView } from './professor-details'
import { StudentDetailsService } from '../lib/student-details-service'

// Helper para prevenir XSS
const escapeHTML = (str) => {
  if (!str) return ''
  return String(str).replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag]))
}

export async function SecretariaView() {
  const container = document.createElement('div')
  container.className = 'secretaria-view animate-in'

  const { data: requests, error } = await DocumentsService.getAllOpenRequests()
  const { data: turmas } = await AdminService.getTurmas()
  const { data: alunos, error: errorAlunos } = await AdminService.listAlunos()
  const { data: professores, error: errorProfessores } = await ProfessorService.getProfessores()
  const { data: disciplinas, error: errorDisciplinas } = await ProfessorService.getAllDisciplinas()
  const { data: cursos, error: errorCursos } = await CourseService.getCursos()

  if (errorAlunos) toast.error('Erro ao carregar alunos: ' + errorAlunos.message)

  const renderRequests = () => {
    if (error) return `<p class="error-text">Erro ao carregar solicitações.</p>`
    if (!requests || requests.length === 0) return '<p>Não há solicitações pendentes no momento.</p>'

    return `
      <div class="table-responsive bg-white rounded-lg shadow-sm mt-4">
        <table class="data-table">
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Documento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${requests.map(r => `
              <tr id="req-row-${r.id}">
                <td>
                  <div class="fw-600 text-main">${escapeHTML(r.perfis?.nome_completo || 'N/A')}</div>
                  <div class="text-sm text-muted">${escapeHTML(r.perfis?.email || '')}</div>
                </td>
                <td>${escapeHTML(r.tipo)}</td>
                <td class="status-cell">
                  <span class="badge ${r.status === 'pendente' ? 'badge-warning' : 'badge-success'}">
                    ${escapeHTML(r.status)}
                  </span>
                </td>
                <td class="action-cell">
                  <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-primary btn-sm generate-pdf-btn" data-id="${r.user_id}" data-tipo="${escapeHTML(r.tipo)}" data-nome="${escapeHTML(r.perfis?.nome_completo || '')}">
                      Gerar PDF
                    </button>
                    ${r.status === 'pendente' ? `
                      <button class="btn btn-primary btn-sm approve-btn" data-id="${r.id}" style="background: var(--success);">Concluir</button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
  }

  const renderGerenciarAlunos = () => {
    if (errorAlunos) return `<p class="error-text">Erro ao carregar alunos.</p>`
    if (!alunos || alunos.length === 0) return '<p>Não há alunos cadastrados no momento.</p>'

    return `
      <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3 style="margin: 0; color: var(--text-main);">Gerenciar Alunos</h3>
          <input type="text" id="busca-aluno" class="input" placeholder="Buscar por nome ou CPF..." style="width: 300px; margin: 0;">
        </div>
        
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nome Completo</th>
                <th>E-mail</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody id="tabela-alunos">
              ${alunos.map(aluno => `
                <tr class="aluno-row" data-id="${aluno.id}" data-nome="${escapeHTML(aluno.nome_completo)}" data-cpf="${escapeHTML(aluno.cpf || '')}">
                  <td>
                    <div class="fw-600 text-main">${escapeHTML(aluno.nome_completo)}</div>
                  </td>
                  <td>${escapeHTML(aluno.email)}</td>
                  <td>${escapeHTML(aluno.cpf || '-')}</td>
                  <td>${escapeHTML(aluno.telefone || '-')}</td>
                  <td>
                    <span class="badge ${aluno.bloqueio_financeiro ? 'badge-warning' : 'badge-success'}">
                      ${aluno.bloqueio_financeiro ? 'Bloqueado' : 'Ativo'}
                    </span>
                  </td>
                    <td style="padding: 1rem;">
                      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button class="btn btn-sm btn-ver-ficha" data-id="${aluno.id}" style="background: var(--primary); color: white; font-size: 0.75rem; padding: 0.4rem 0.8rem; border-radius: 4px; white-space: nowrap;">📋 Ficha</button>
                        <button class="btn btn-primary btn-sm btn-editar-aluno" data-id="${aluno.id}" style="font-size: 0.75rem; padding: 0.4rem 0.8rem; border-radius: 4px; white-space: nowrap;">✏️ Editar</button>
                        <button class="btn btn-sm btn-vincular-turma" data-id="${aluno.id}" data-nome="${escapeHTML(aluno.nome_completo)}" style="background: var(--accent); color: var(--text-main); font-size: 0.75rem; padding: 0.4rem 0.8rem; border-radius: 4px; font-weight: 600; white-space: nowrap; border: 2px solid var(--accent);">🎓 Matricular</button>
                      </div>
                    </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal de Edição -->
      <div id="modal-editar-aluno" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
        <div class="modal-content" style="background: white; padding: 2rem; border-radius: var(--radius-lg); max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 style="margin: 0; color: var(--text-main);">Editar Aluno</h3>
            <button id="btn-fechar-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
          </div>
          
          <form id="form-editar-aluno">
            <input type="hidden" id="edit-aluno-id" name="aluno_id">
            
            <div class="form-group">
              <label class="label" for="edit-nome">Nome Completo *</label>
              <input type="text" id="edit-nome" name="nome_completo" class="input" required>
            </div>

            <div class="form-group">
              <label class="label" for="edit-cpf">CPF</label>
              <input type="text" id="edit-cpf" name="cpf" class="input" placeholder="000.000.000-00">
            </div>

            <div class="form-group">
              <label class="label" for="edit-telefone">Telefone / WhatsApp</label>
              <input type="text" id="edit-telefone" name="telefone" class="input" placeholder="(00) 00000-0000">
            </div>

            <div class="form-group">
              <label class="label">E-mail</label>
              <input type="text" id="edit-email" class="input" disabled style="background: var(--secondary);">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div class="form-group">
                <label class="label" for="edit-rg">RG</label>
                <input type="text" id="edit-rg" name="rg" class="input">
              </div>
              <div class="form-group">
                <label class="label" for="edit-nascimento">Data de Nascimento</label>
                <input type="date" id="edit-nascimento" name="data_nascimento" class="input">
              </div>
            </div>

            <div class="form-group">
              <label class="label" for="edit-naturalidade">Naturalidade (Cidade/Estado)</label>
              <input type="text" id="edit-naturalidade" name="cidade_natal" class="input">
            </div>

            <div class="form-group">
              <label class="label" for="edit-endereco">Endereço Completo</label>
              <input type="text" id="edit-endereco" name="endereco" class="input" placeholder="Rua, Número, Bairro...">
            </div>

            <div class="form-group">
              <label class="label">Perfil</label>
              <input type="text" id="edit-perfil" class="input" disabled style="background: var(--secondary);">
            </div>

            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
              <button type="button" id="btn-cancelar-edicao" class="btn" style="flex: 1; background: var(--secondary); color: var(--text-main);">Cancelar</button>
              <button type="submit" class="btn btn-primary" id="btn-salvar-edicao" style="flex: 1;">Salvar Alterações</button>
            </div>
          </form>
        </div>
      </div>
    `
  }

  const renderCadastroProfessor = () => `
    <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); max-width: 600px; margin: 0 auto;">
      <h3 style="margin-bottom: 1.5rem; color: var(--text-main);">Cadastrar Novo Professor</h3>
      <p style="margin-bottom: 1.5rem; color: var(--text-muted); font-size: 0.9rem;">Crie uma nova conta de professor no sistema. O professor poderá fazer login imediatamente após o cadastro.</p>
      
      <form id="form-cadastro-professor">
        <div class="form-group">
          <label class="label" for="professor-nome">Nome Completo *</label>
          <input type="text" id="professor-nome" name="professor_nome" class="input" placeholder="Maria Silva" required>
        </div>

        <div class="form-group">
          <label class="label" for="professor-email">E-mail *</label>
          <input type="email" id="professor-email" name="professor_email" class="input" placeholder="maria@email.com" required>
        </div>

        <div class="form-group">
          <label class="label" for="professor-cpf">CPF</label>
          <input type="text" id="professor-cpf" name="professor_cpf" class="input" placeholder="000.000.000-00">
        </div>

        <div class="form-group">
          <label class="label" for="professor-telefone">Telefone / WhatsApp</label>
          <input type="text" id="professor-telefone" name="professor_telefone" class="input" placeholder="(00) 00000-0000">
        </div>

        <div class="form-group">
          <label class="label" for="professor-senha">Senha * (mínimo 6 caracteres)</label>
          <input type="password" id="professor-senha" name="professor_senha" class="input" placeholder="******" minlength="6" required>
        </div>

        <button type="submit" class="btn btn-primary" id="btn-cadastrar-professor" style="width: 100%;">Cadastrar Professor</button>
      </form>
    </div>
  `

  const renderGerenciarProfessores = () => {
    if (errorProfessores) return `<p class="error-text">Erro ao carregar professores.</p>`

    return `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <!-- Lista de Professores -->
        <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
          <h3 style="margin: 0 0 1rem 0; color: var(--text-main);">Professores Cadastrados</h3>
          
          ${!professores || professores.length === 0 ? '<p style="color: var(--text-muted);">Nenhum professor cadastrado.</p>' : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  ${professores.map(p => `
                    <tr>
                      <td>
                        <div class="fw-600 text-main">${escapeHTML(p.nome_completo)}</div>
                      </td>
                      <td>${escapeHTML(p.email)}</td>
                      <td style="display: flex; gap: 0.3rem;">
                        <button class="btn btn-sm btn-ver-ficha-prof" data-id="${p.id}" style="background: var(--primary); color: white; font-size: 0.7rem; padding: 0.3rem 0.6rem;">Ficha</button>
                        <button class="btn btn-primary btn-sm btn-vincular-disciplinas" data-id="${p.id}" data-nome="${escapeHTML(p.nome_completo)}" style="font-size: 0.7rem; padding: 0.3rem 0.6rem;">Vincular Disciplinas</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

        <!-- Disciplinas -->
        <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
          <h3 style="margin: 0 0 1rem 0; color: var(--text-main);">Disciplinas do Curso</h3>
          
          ${!disciplinas || disciplinas.length === 0 ? '<p style="color: var(--text-muted);">Nenhuma disciplina cadastrada.</p>' : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Disciplina</th>
                    <th>Módulo</th>
                    <th>Professor</th>
                  </tr>
                </thead>
                <tbody>
                  ${disciplinas.map(d => `
                    <tr>
                      <td>${escapeHTML(d.nome)}</td>
                      <td>${escapeHTML(d.modulo)}</td>
                      <td>
                        ${d.perfis?.nome_completo ? `<span class="badge badge-success">${escapeHTML(d.perfis.nome_completo)}</span>` : '<span class="badge badge-warning">Sem professor</span>'}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>

      <!-- Modal de Vinculação -->
      <div id="modal-vincular-disciplinas" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
        <div class="modal-content" style="background: white; padding: 2rem; border-radius: var(--radius-lg); max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 style="margin: 0; color: var(--text-main);">Vincular Disciplinas e Turmas ao Professor</h3>
            <button id="btn-fechar-modal-vincular" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
          </div>
          
          <p style="margin-bottom: 1rem; color: var(--text-muted); font-size: 0.9rem;">Selecione as disciplinas que o professor <strong id="nome-professor-vincular"></strong> irá ministrar e vincule a cada turma:</p>
          
          <form id="form-vincular-disciplinas">
            <input type="hidden" id="professor-id-vincular" name="professor_id">
            
            <div style="max-height: 400px; overflow-y: auto; border: 1px solid var(--secondary); border-radius: 8px; padding: 1rem;">
              <table style="width: 100%; border-collapse: collapse;">
                <thead style="background: var(--secondary); font-size: 0.8rem; text-transform: uppercase;">
                  <tr>
                    <th style="padding: 0.75rem; text-align: left;">Selecionar</th>
                    <th style="padding: 0.75rem; text-align: left;">Disciplina</th>
                    <th style="padding: 0.75rem; text-align: left;">Módulo</th>
                    <th style="padding: 0.75rem; text-align: left;">Turma</th>
                    <th style="padding: 0.75rem; text-align: left;">Professor Atual</th>
                  </tr>
                </thead>
                <tbody>
                  ${disciplinas ? disciplinas.map(d => `
                    <tr class="disciplina-row" data-id="${d.id}" style="border-bottom: 1px solid var(--secondary);">
                      <td style="padding: 0.75rem;">
                        <input type="checkbox" name="disciplinas" value="${d.id}" ${d.professor_id ? 'checked' : ''} class="disciplina-checkbox">
                      </td>
                      <td style="padding: 0.75rem; font-weight: 500;">${escapeHTML(d.nome)}</td>
                      <td style="padding: 0.75rem; color: var(--text-muted);">${escapeHTML(d.modulo)}</td>
                      <td style="padding: 0.75rem;">
                        <select name="turma_${d.id}" class="input turma-select" style="padding: 0.3rem; font-size: 0.8rem; width: 100%;">
                          <option value="">-- Sem Turma --</option>
                          ${turmas && turmas.length > 0 ? turmas.map(t => `
                            <option value="${t.id}" ${d.turma_id === t.id ? 'selected' : ''}>${escapeHTML(t.nome)} (${escapeHTML(t.periodo)})</option>
                          `).join('') : ''}
                        </select>
                      </td>
                      <td style="padding: 0.75rem;">
                        ${d.perfis?.nome_completo ? `<span class="badge badge-success" style="font-size: 0.75rem;">${escapeHTML(d.perfis.nome_completo)}</span>` : '<span style="color: var(--text-muted); font-size: 0.8rem;">—</span>'}
                      </td>
                    </tr>
                  `).join('') : ''}
                </tbody>
              </table>
            </div>

            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
              <button type="button" id="btn-cancelar-vincular" class="btn" style="flex: 1; background: var(--secondary); color: var(--text-main);">Cancelar</button>
              <button type="submit" class="btn btn-primary" id="btn-salvar-vincular" style="flex: 1;">Salvar Vinculação</button>
            </div>
          </form>
        </div>
      </div>
    `
  }

  const renderCadastroAluno = () => `
    <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); max-width: 600px; margin: 0 auto;">
      <h3 style="margin-bottom: 1.5rem; color: var(--text-main);">Cadastrar Novo Aluno</h3>
      <p style="margin-bottom: 1.5rem; color: var(--text-muted); font-size: 0.9rem;">Crie uma nova conta de aluno no sistema. O aluno poderá fazer login imediatamente após o cadastro.</p>
      
      <form id="form-cadastro-aluno">
        <div class="form-group">
          <label class="label" for="aluno-nome">Nome Completo *</label>
          <input type="text" id="aluno-nome" name="aluno_nome" class="input" placeholder="João Silva" required>
        </div>

        <div class="form-group">
          <label class="label" for="aluno-email">E-mail *</label>
          <input type="email" id="aluno-email" name="aluno_email" class="input" placeholder="joao@email.com" required>
        </div>

        <div class="form-group">
          <label class="label" for="aluno-cpf">CPF</label>
          <input type="text" id="aluno-cpf" name="aluno_cpf" class="input" placeholder="000.000.000-00">
        </div>

        <div class="form-group">
          <label class="label" for="aluno-telefone">Telefone / WhatsApp</label>
          <input type="text" id="aluno-telefone" name="aluno_telefone" class="input" placeholder="(00) 00000-0000">
        </div>

        <div class="form-group">
          <label class="label" for="aluno-senha">Senha * (mínimo 6 caracteres)</label>
          <input type="password" id="aluno-senha" name="aluno_senha" class="input" placeholder="******" minlength="6" required>
        </div>

        <div class="form-group">
          <label class="label" for="aluno-turma">Matricular em Turma (opcional)</label>
          <select id="aluno-turma" name="aluno_turma" class="input">
            <option value="">-- Selecione uma turma --</option>
            ${turmas && turmas.length > 0 ? turmas.map(t => `
              <option value="${t.id}">${t.nome} (${t.periodo})</option>
            `).join('') : '<option value="">Nenhuma turma disponível</option>'}
          </select>
        </div>

        <button type="submit" class="btn btn-primary" id="btn-cadastrar" style="width: 100%;">Cadastrar Aluno</button>
      </form>
    </div>
  `

  const renderGerenciarCursos = () => {
    return `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
        <!-- Formulário de Novo Curso -->
        <div style="background: white; padding: 2rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
          <h3 style="margin-bottom: 1.5rem; color: var(--text-main);">Cadastrar Novo Curso</h3>
          <p style="margin-bottom: 1.5rem; color: var(--text-muted); font-size: 0.9rem;">Cadastre cursos como Técnico em Enfermagem, Instrumentação Cirúrgica, ou cursos livres.</p>
          
          <form id="form-cadastro-curso">
            <div class="form-group">
              <label class="label" for="curso-nome">Nome do Curso *</label>
              <input type="text" id="curso-nome" name="curso_nome" class="input" placeholder="Ex: Técnico em Enfermagem" required>
            </div>

            <div class="form-group">
              <label class="label" for="curso-descricao">Descrição</label>
              <textarea id="curso-descricao" name="curso_descricao" class="input" rows="3" placeholder="Descreva brevemente o curso..."></textarea>
            </div>

            <button type="submit" class="btn btn-primary" id="btn-cadastrar-curso" style="width: 100%;">Cadastrar Curso</button>
          </form>
        </div>

        <!-- Lista de Cursos -->
        <div style="background: white; padding: 1.5rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm);">
          <h3 style="margin: 0 0 1rem 0; color: var(--text-main);">Cursos Cadastrados</h3>
          
          ${errorCursos ? `<p class="error-text">Erro ao carregar cursos.</p>` : ''}
          ${!cursos || cursos.length === 0 ? '<p style="color: var(--text-muted);">Nenhum curso cadastrado.</p>' : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Curso</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  ${cursos.map(c => `
                    <tr class="curso-row" data-id="${c.id}">
                      <td>
                        <div class="fw-600 text-main">${escapeHTML(c.nome)}</div>
                        <div class="text-sm text-muted">${escapeHTML(c.descricao || '')}</div>
                      </td>
                      <td>
                        <span class="badge ${c.ativo ? 'badge-success' : 'badge-warning'}">
                          ${c.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        ${c.ativo ? `
                          <button class="btn btn-sm btn-desativar-curso" data-id="${c.id}" style="background: var(--danger); color: white;">Desativar</button>
                        ` : `
                          <button class="btn btn-sm btn-reativar-curso" data-id="${c.id}" style="background: var(--success); color: white;">Reativar</button>
                        `}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `
  }

  const renderModalMatricula = () => `
    <div id="modal-matricular-aluno" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
      <div class="modal-content" style="background: white; padding: 2rem; border-radius: var(--radius-lg); max-width: 500px; width: 90%; box-shadow: var(--shadow-lg); border-top: 5px solid var(--accent);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3 style="margin: 0; color: var(--text-main); font-size: 1.5rem;">🎓 Matricular Aluno</h3>
          <button id="btn-fechar-modal-matricula" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted);">&times;</button>
        </div>
        
        <div style="background: var(--secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
          <p style="margin: 0; font-size: 0.9rem; color: var(--text-muted);">Aluno: <strong id="nome-aluno-matricula" style="color: var(--text-main);"></strong></p>
        </div>

        <form id="form-vincular-turma">
          <input type="hidden" id="vincular-aluno-id">
          
          <div class="form-group">
            <label class="label" for="vincular-turma-id">Selecione a Turma *</label>
            <select id="vincular-turma-id" class="input" required style="width: 100%;">
              <option value="">-- Selecione uma turma --</option>
              ${turmas && turmas.length > 0 ? turmas.map(t => `
                <option value="${t.id}">${escapeHTML(t.nome)} - ${escapeHTML(t.periodo)}</option>
              `).join('') : '<option value="">Nenhuma turma disponível</option>'}
            </select>
          </div>
          
          <div style="display: flex; gap: 1rem; margin-top: 2rem;">
            <button type="button" class="btn btn-fechar-matricula" style="flex: 1; background: var(--secondary); border: 1px solid var(--border); color: var(--text-main); cursor: pointer; border-radius: 6px; padding: 0.75rem; font-weight: 600;">Cancelar</button>
            <button type="submit" class="btn btn-primary" style="flex: 1; border-radius: 6px; padding: 0.75rem; font-weight: 600;">Confirmar Matrícula</button>
          </div>
        </form>
      </div>
    </div>
  `

  container.innerHTML = `
    <header class="view-header">
      <h1 class="title">Painel da Secretaria</h1>
      <p class="subtitle">Gerencie as solicitações de todos os alunos do sistema.</p>
    </header>

    <div class="tabs-container">
      <button class="tab-btn active" data-tab="solicitacoes">Solicitações</button>
      <button class="tab-btn" data-tab="cadastro">Cadastrar Aluno</button>
      <button class="tab-btn" data-tab="gerenciar">Gerenciar Alunos</button>
      <button class="tab-btn" data-tab="cadastro-professor">Cadastrar Professor</button>
      <button class="tab-btn" data-tab="gerenciar-professores">Gerenciar Professores</button>
      <button class="tab-btn" data-tab="gerenciar-cursos">Gerenciar Cursos</button>
    </div>

    <div id="tab-solicitacoes" class="tab-content">
      ${renderRequests()}
    </div>

    <div id="tab-cadastro" class="tab-content" style="display: none;">
      ${renderCadastroAluno()}
    </div>

    <div id="tab-gerenciar" class="tab-content" style="display: none;">
      ${renderGerenciarAlunos()}
    </div>

    <div id="tab-cadastro-professor" class="tab-content" style="display: none;">
      ${renderCadastroProfessor()}
    </div>

    <div id="tab-gerenciar-professores" class="tab-content" style="display: none;">
      ${renderGerenciarProfessores()}
    </div>

    <div id="tab-gerenciar-cursos" class="tab-content" style="display: none;">
      ${renderGerenciarCursos()}
    </div>

    ${renderModalMatricula()}
  `

  // Lógica das tabs
  const tabBtns = container.querySelectorAll('.tab-btn')
  const tabContents = container.querySelectorAll('.tab-content')

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab')

      tabBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')

      tabContents.forEach(content => {
        content.style.display = 'none'
      })
      container.querySelector(`#tab-${tab}`).style.display = 'block'
    })
  })

  // =====================================================
  // GERAR PDF DE DOCUMENTOS
  // =====================================================
  const generatePdfBtns = container.querySelectorAll('.generate-pdf-btn')
  generatePdfBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const userId = btn.getAttribute('data-id')
      const tipo = btn.getAttribute('data-tipo')
      const nomeAluno = btn.getAttribute('data-nome')

      btn.disabled = true
      btn.textContent = 'Gerando...'

      try {
        // Buscar dados do usuário (qualquer perfil)
        const { data: userData } = await AdminService.getUserById(userId)
        if (!userData) {
          toast.error('Usuário não encontrado')
          btn.disabled = false
          btn.textContent = 'Gerar PDF'
          return
        }

        // Buscar matrícula apenas se for aluno
        let turmaInfo = null
        if (userData.perfil === 'aluno') {
          const { data: matriculas } = await supabase
            .from('matriculas')
            .select(`
              *,
              turmas(id, nome, periodo, cursos(id, nome))
            `)
            .eq('aluno_id', userId)
            .eq('status_aluno', 'ativo')
            .limit(1)
            .maybeSingle()

          if (matriculas?.turmas) {
            turmaInfo = {
              turma_nome: matriculas.turmas.nome,
              periodo: matriculas.turmas.periodo,
              curso_nome: matriculas.turmas.cursos?.nome || 'N/A'
            }
          }
        }

        // Gerar PDF baseado no tipo de documento e perfil
        if (tipo.includes('Declaração de Matrícula')) {
          if (userData.perfil === 'aluno') {
            if (!turmaInfo) {
              toast.error('Aluno não possui matrícula ativa')
              btn.disabled = false
              btn.textContent = 'Gerar PDF'
              return
            }
            const doc = PDFService.generateDeclaracaoPDF(userData, turmaInfo)
            PDFService.downloadPDF(doc, `declaracao_${nomeAluno.replace(/\s+/g, '_')}.pdf`)
          } else {
            // Admin/Professor → Declaração de Vínculo
            const doc = PDFService.generateDeclaracaoVinculoPDF(userData)
            PDFService.downloadPDF(doc, `declaracao_vinculo_${nomeAluno.replace(/\s+/g, '_')}.pdf`)
          }
          toast.success('PDF gerado com sucesso!')

        } else if (tipo.includes('Histórico Acadêmico') || tipo.includes('Boletim')) {
          // Histórico só para alunos
          if (userData.perfil !== 'aluno') {
            toast.error('Histórico acadêmico disponível apenas para alunos')
            btn.disabled = false
            btn.textContent = 'Gerar PDF'
            return
          }

          if (!turmaInfo) {
            toast.error('Aluno não possui matrícula ativa')
            btn.disabled = false
            btn.textContent = 'Gerar PDF'
            return
          }

          const { data: notas } = await AcademicService.getBoletim(userId)

          // Buscar módulos das disciplinas
          const { data: disciplinasCurso } = await CourseService.getDisciplinasDoCurso(
            turmaInfo?.curso_id || matriculas?.turmas?.cursos?.id
          )

          const notasComModulo = notas?.map(n => {
            const disc = disciplinasCurso?.find(d => d.nome === n.disciplina)
            return { ...n, modulo: disc?.modulo || 'I Módulo' }
          }) || notas || []

          const doc = PDFService.generateHistoricoPDF(userData, notasComModulo, turmaInfo)
          PDFService.downloadPDF(doc, `historico_${nomeAluno.replace(/\s+/g, '_')}.pdf`)
          toast.success('PDF gerado com sucesso!')

        } else {
          // Outros tipos de documento
          if (userData.perfil === 'aluno') {
            if (!turmaInfo) {
              toast.error('Aluno não possui matrícula ativa')
              btn.disabled = false
              btn.textContent = 'Gerar PDF'
              return
            }
            const doc = PDFService.generateDeclaracaoPDF(userData, turmaInfo)
            PDFService.downloadPDF(doc, `documento_${nomeAluno.replace(/\s+/g, '_')}.pdf`)
          } else {
            // Admin/Professor/Secretaria → Declaração de Vínculo
            const doc = PDFService.generateDeclaracaoVinculoPDF(userData)
            PDFService.downloadPDF(doc, `documento_${nomeAluno.replace(/\s+/g, '_')}.pdf`)
          }
          toast.success('PDF gerado com sucesso!')
        }
      } catch (err) {
        console.error('Erro ao gerar PDF:', err)
        toast.error('Erro ao gerar PDF: ' + err.message)
      }

      btn.disabled = false
      btn.textContent = 'Gerar PDF'
    })
  })

  // =====================================================
  // APROVAÇÃO DE DOCUMENTOS
  // =====================================================
  const approveBtns = container.querySelectorAll('.approve-btn')
  approveBtns.forEach(btn => {
    btn.onclick = async () => {
      const id = btn.getAttribute('data-id')
      btn.disabled = true
      btn.textContent = 'Processando...'

      const { error } = await DocumentsService.updateStatus(id, 'concluído')

      if (error) {
        toast.error('Erro ao atualizar status: ' + error.message)
        btn.disabled = false
        btn.textContent = 'Concluir'
      } else {
        toast.success('Documento concluído com sucesso!')

        const row = container.querySelector(`#req-row-${id}`)
        if (row) {
          const statusCell = row.querySelector('.status-cell')
          const actionCell = row.querySelector('.action-cell')

          if (statusCell) {
            statusCell.innerHTML = `<span class="badge badge-success">concluído</span>`
          }
          if (actionCell) {
            actionCell.innerHTML = '<span class="text-muted">---</span>'
          }
        }
      }
    }
  })

  // =====================================================
  // CADASTRO DE ALUNO
  // =====================================================
  const formCadastro = container.querySelector('#form-cadastro-aluno')
  const btnCadastrar = container.querySelector('#btn-cadastrar')

  formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault()

    const nomeCompleto = container.querySelector('#aluno-nome').value.trim()
    const email = container.querySelector('#aluno-email').value.trim()
    const cpf = container.querySelector('#aluno-cpf').value.trim()
    const telefone = container.querySelector('#aluno-telefone').value.trim()
    const senha = container.querySelector('#aluno-senha').value
    const turmaId = container.querySelector('#aluno-turma').value

    if (!nomeCompleto || !email || !senha) {
      toast.error('Preencha os campos obrigatórios.')
      return
    }

    if (senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    btnCadastrar.disabled = true
    btnCadastrar.textContent = 'Cadastrando...'

    const { data, error } = await AdminService.createUserByAdmin({
      email,
      password: senha,
      nomeCompleto,
      cpf,
      telefone,
      perfil: 'aluno'
    })

    if (error) {
      toast.error('Erro ao cadastrar: ' + error.message)
      btnCadastrar.disabled = false
      btnCadastrar.textContent = 'Cadastrar Aluno'
      return
    }

    if (turmaId && data?.userId) {
      const { error: erroMatricula } = await AdminService.matricularAluno(data.userId, turmaId)

      if (erroMatricula) {
        toast.warning('Aluno cadastrado, mas houve erro ao matricular na turma: ' + erroMatricula.message)
      } else {
        toast.success('Aluno cadastrado e matriculado com sucesso!')
      }
    } else {
      toast.success('Aluno cadastrado com sucesso!')
    }

    formCadastro.reset()
    btnCadastrar.disabled = false
    btnCadastrar.textContent = 'Cadastrar Aluno'
  })

  // =====================================================
  // CADASTRO DE PROFESSOR
  // =====================================================
  const formCadastroProfessor = container.querySelector('#form-cadastro-professor')
  const btnCadastrarProfessor = container.querySelector('#btn-cadastrar-professor')

  formCadastroProfessor.addEventListener('submit', async (e) => {
    e.preventDefault()

    const nomeCompleto = container.querySelector('#professor-nome').value.trim()
    const email = container.querySelector('#professor-email').value.trim()
    const cpf = container.querySelector('#professor-cpf').value.trim()
    const telefone = container.querySelector('#professor-telefone').value.trim()
    const senha = container.querySelector('#professor-senha').value

    if (!nomeCompleto || !email || !senha) {
      toast.error('Preencha os campos obrigatórios.')
      return
    }

    if (senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    btnCadastrarProfessor.disabled = true
    btnCadastrarProfessor.textContent = 'Cadastrando...'

    const { data, error } = await AdminService.createUserByAdmin({
      email,
      password: senha,
      nomeCompleto,
      cpf,
      telefone,
      perfil: 'professor'
    })

    if (error) {
      toast.error('Erro ao cadastrar: ' + error.message)
      btnCadastrarProfessor.disabled = false
      btnCadastrarProfessor.textContent = 'Cadastrar Professor'
      return
    }

    toast.success('Professor cadastrado com sucesso!')

    formCadastroProfessor.reset()
    btnCadastrarProfessor.disabled = false
    btnCadastrarProfessor.textContent = 'Cadastrar Professor'
  })

  // =====================================================
  // VER FICHA DO PROFESSOR
  // =====================================================
  const btnsVerFichaProf = container.querySelectorAll('.btn-ver-ficha-prof')
  btnsVerFichaProf.forEach(btn => {
    btn.addEventListener('click', async () => {
      const professorId = btn.getAttribute('data-id')

      btn.disabled = true
      btn.textContent = '...'

      try {
        const detailsView = await ProfessorDetailsView(professorId)
        container.innerHTML = ''
        container.appendChild(detailsView)
      } catch (err) {
        console.error('Erro ao carregar ficha do professor:', err)
        toast.error('Erro ao carregar ficha do professor')
      }

      btn.disabled = false
      btn.textContent = 'Ficha'
    })
  })

  // =====================================================
  // VINCULAÇÃO DE DISCIPLINAS
  // =====================================================
  const btnsVincular = container.querySelectorAll('.btn-vincular-disciplinas')
  const modalVincular = container.querySelector('#modal-vincular-disciplinas')
  const btnFecharModalVincular = container.querySelector('#btn-fechar-modal-vincular')
  const btnCancelarVincular = container.querySelector('#btn-cancelar-vincular')
  const formVincular = container.querySelector('#form-vincular-disciplinas')
  const btnSalvarVincular = container.querySelector('#btn-salvar-vincular')

  btnsVincular.forEach(btn => {
    btn.addEventListener('click', () => {
      const professorId = btn.getAttribute('data-id')
      const professorNome = btn.getAttribute('data-nome')

      container.querySelector('#professor-id-vincular').value = professorId
      container.querySelector('#nome-professor-vincular').textContent = professorNome

      container.querySelectorAll('input[name="disciplinas"]').forEach(cb => {
        cb.checked = false
      })

      if (disciplinas) {
        disciplinas.forEach(d => {
          if (d.professor_id === professorId) {
            const cb = container.querySelector(`input[name="disciplinas"][value="${d.id}"]`)
            if (cb) cb.checked = true
          }
        })
      }

      modalVincular.style.display = 'flex'
    })
  })

  if (btnFecharModalVincular) {
    btnFecharModalVincular.addEventListener('click', () => {
      modalVincular.style.display = 'none'
    })
  }

  if (btnCancelarVincular) {
    btnCancelarVincular.addEventListener('click', () => {
      modalVincular.style.display = 'none'
    })
  }

  if (modalVincular) {
    modalVincular.addEventListener('click', (e) => {
      if (e.target === modalVincular) {
        modalVincular.style.display = 'none'
      }
    })
  }

  if (formVincular) {
    formVincular.addEventListener('submit', async (e) => {
      e.preventDefault()

      const professorId = container.querySelector('#professor-id-vincular').value
      const checkboxes = container.querySelectorAll('input[name="disciplinas"]:checked')

      const vinculacoes = []
      checkboxes.forEach(cb => {
        const disciplinaId = cb.value
        const turmaSelect = container.querySelector(`select[name="turma_${disciplinaId}"]`)
        const turmaId = turmaSelect ? turmaSelect.value : null
        vinculacoes.push({ disciplinaId, turmaId })
      })

      if (vinculacoes.length === 0) {
        toast.warning('Selecione pelo menos uma disciplina!')
        return
      }

      btnSalvarVincular.disabled = true
      btnSalvarVincular.textContent = 'Salvando...'

      // Desvincular disciplinas atuais do professor
      if (disciplinas && disciplinas.length > 0) {
        for (const d of disciplinas) {
          if (d.professor_id === professorId) {
            await ProfessorService.desvincularProfessorDisciplina(d.id)
          }
        }
      }

      const { error } = await ProfessorService.vincularProfessorDisciplinasTurma(professorId, vinculacoes)

      if (error) {
        toast.error('Erro ao vincular disciplinas: ' + error.message)
        btnSalvarVincular.disabled = false
        btnSalvarVincular.textContent = 'Salvar Vinculação'
        return
      }

      toast.success('Disciplinas vinculadas com sucesso!')
      modalVincular.style.display = 'none'

      btnSalvarVincular.disabled = false
      btnSalvarVincular.textContent = 'Salvar Vinculação'

      // Recarregar para atualizar a lista
      setTimeout(() => window.location.reload(), 500)
    })
  }

  // =====================================================
  // BUSCA/FILTRO DE ALUNOS
  // =====================================================
  const buscaAlunoInput = container.querySelector('#busca-aluno')
  if (buscaAlunoInput) {
    buscaAlunoInput.addEventListener('input', () => {
      const termo = buscaAlunoInput.value.toLowerCase().trim()
      const rows = container.querySelectorAll('.aluno-row')

      rows.forEach(row => {
        const nome = row.getAttribute('data-nome').toLowerCase()
        const cpf = row.getAttribute('data-cpf').toLowerCase()

        if (nome.includes(termo) || cpf.includes(termo)) {
          row.style.display = ''
        } else {
          row.style.display = 'none'
        }
      })
    })
  }

  // =====================================================
  // VER FICHA DO ALUNO
  // =====================================================
  const btnsVerFicha = container.querySelectorAll('.btn-ver-ficha')
  btnsVerFicha.forEach(btn => {
    btn.addEventListener('click', async () => {
      const alunoId = btn.getAttribute('data-id')
      const contentArea = container.closest('.main-content') || container.parentElement

      // Mostrar loading
      btn.disabled = true
      btn.textContent = '...'

      try {
        const detailsView = await StudentDetailsView(alunoId)
        container.innerHTML = ''
        container.appendChild(detailsView)
      } catch (err) {
        console.error('Erro ao carregar ficha:', err)
        toast.error('Erro ao carregar ficha do aluno')
      }

      btn.disabled = false
      btn.textContent = 'Ficha'
    })
  })

  // =====================================================
  // EDIÇÃO DE ALUNO
  // =====================================================
  const btnsEditar = container.querySelectorAll('.btn-editar-aluno')
  const modalEditar = container.querySelector('#modal-editar-aluno')
  const btnFecharModal = container.querySelector('#btn-fechar-modal')
  const btnCancelarEdicao = container.querySelector('#btn-cancelar-edicao')
  const formEditar = container.querySelector('#form-editar-aluno')
  const btnSaveEdit = container.querySelector('#btn-salvar-edicao')

  btnsEditar.forEach(btn => {
    btn.addEventListener('click', async () => {
      const alunoId = btn.getAttribute('data-id')

      btn.disabled = true
      btn.textContent = '...'

      const { data: aluno, error } = await AdminService.getAlunoById(alunoId)
      const { data: enderecoData } = await StudentDetailsService.getEndereco(alunoId)

      btn.disabled = false
      btn.textContent = 'Editar'

      if (error) {
        toast.error('Erro ao carregar dados do aluno: ' + error.message)
        return
      }

      if (!aluno) {
        toast.error('Aluno não encontrado')
        return
      }

      container.querySelector('#edit-aluno-id').value = aluno.id
      container.querySelector('#edit-nome').value = aluno.nome_completo || ''
      container.querySelector('#edit-cpf').value = aluno.cpf || ''
      container.querySelector('#edit-telefone').value = aluno.telefone || ''
      container.querySelector('#edit-email').value = aluno.email || ''
      container.querySelector('#edit-perfil').value = aluno.perfil || 'aluno'

      // Novos campos
      container.querySelector('#edit-rg').value = aluno.rg || ''
      container.querySelector('#edit-nascimento').value = aluno.data_nascimento || ''
      container.querySelector('#edit-naturalidade').value = aluno.cidade_natal || ''
      container.querySelector('#edit-endereco').value = enderecoData && enderecoData.logradouro ? enderecoData.logradouro : ''

      modalEditar.style.display = 'flex'
    })
  })

  if (btnFecharModal) {
    btnFecharModal.addEventListener('click', () => {
      modalEditar.style.display = 'none'
    })
  }

  if (btnCancelarEdicao) {
    btnCancelarEdicao.addEventListener('click', () => {
      modalEditar.style.display = 'none'
    })
  }

  if (modalEditar) {
    modalEditar.addEventListener('click', (e) => {
      if (e.target === modalEditar) {
        modalEditar.style.display = 'none'
      }
    })
  }

  if (formEditar) {
    formEditar.addEventListener('submit', async (e) => {
      e.preventDefault()

      const alunoId = container.querySelector('#edit-aluno-id').value
      const nomeCompleto = container.querySelector('#edit-nome').value.trim()
      const cpf = container.querySelector('#edit-cpf').value.trim()
      const telefone = container.querySelector('#edit-telefone').value.trim()

      if (!nomeCompleto) {
        toast.error('O nome completo é obrigatório.')
        return
      }

      btnSaveEdit.disabled = true
      btnSaveEdit.textContent = 'Salvando...'

      const editRg = container.querySelector('#edit-rg').value.trim()
      const editNascimento = container.querySelector('#edit-nascimento').value
      const editNaturalidade = container.querySelector('#edit-naturalidade').value.trim()
      const editEndereco = container.querySelector('#edit-endereco').value.trim()

      const { error } = await AdminService.updateAluno(alunoId, {
        nome_completo: nomeCompleto,
        cpf: cpf || null,
        telefone: telefone || null,
        rg: editRg || null,
        data_nascimento: editNascimento || null,
        cidade_natal: editNaturalidade || null
      })

      // Salvar endereço separado se fornecido
      if (editEndereco) {
        await StudentDetailsService.saveEndereco(alunoId, { logradouro: editEndereco })
      }

      if (error) {
        toast.error('Erro ao salvar: ' + error.message)
        btnSaveEdit.disabled = false
        btnSaveEdit.textContent = 'Salvar Alterações'
        return
      }

      toast.success('Dados do aluno atualizados com sucesso!')

      const row = container.querySelector(`.aluno-row[data-id="${alunoId}"]`)
      if (row) {
        row.querySelector('td:first-child .fw-600').textContent = nomeCompleto
        row.setAttribute('data-nome', nomeCompleto)
        row.setAttribute('data-cpf', cpf)
        row.querySelector('td:nth-child(3)').textContent = cpf || '-'
        row.querySelector('td:nth-child(4)').textContent = telefone || '-'
      }

      modalEditar.style.display = 'none'

      btnSaveEdit.disabled = false
      btnSaveEdit.textContent = 'Salvar Alterações'
    })
  }

  // =====================================================
  // GERENCIAMENTO DE CURSOS
  // =====================================================
  const formCadastroCurso = container.querySelector('#form-cadastro-curso')
  const btnCadastrarCurso = container.querySelector('#btn-cadastrar-curso')

  if (formCadastroCurso) {
    formCadastroCurso.addEventListener('submit', async (e) => {
      e.preventDefault()

      const nome = container.querySelector('#curso-nome').value.trim()
      const descricao = container.querySelector('#curso-descricao').value.trim()

      if (!nome) {
        toast.error('O nome do curso é obrigatório.')
        return
      }

      btnCadastrarCurso.disabled = true
      btnCadastrarCurso.textContent = 'Cadastrando...'

      const { data, error } = await CourseService.createCurso({ nome, descricao })

      if (error) {
        toast.error('Erro ao cadastrar curso: ' + error.message)
        btnCadastrarCurso.disabled = false
        btnCadastrarCurso.textContent = 'Cadastrar Curso'
        return
      }

      toast.success('Curso cadastrado com sucesso!')
      formCadastroCurso.reset()
      btnCadastrarCurso.disabled = false
      btnCadastrarCurso.textContent = 'Cadastrar Curso'

      // Reload page to show new course
      window.location.hash = '#/dashboard'
      setTimeout(() => window.location.hash = '#/dashboard/secretaria', 10)
    })
  }

  // Desativar curso
  const btnsDesativarCurso = container.querySelectorAll('.btn-desativar-curso')
  btnsDesativarCurso.forEach(btn => {
    btn.addEventListener('click', async () => {
      const cursoId = btn.getAttribute('data-id')
      btn.disabled = true
      btn.textContent = '...'

      const { error } = await CourseService.desativarCurso(cursoId)

      if (error) {
        toast.error('Erro ao desativar curso: ' + error.message)
        btn.disabled = false
        btn.textContent = 'Desativar'
        return
      }

      toast.success('Curso desativado!')
      window.location.hash = '#/dashboard'
      setTimeout(() => window.location.hash = '#/dashboard/secretaria', 10)
    })
  })

  // Reativar curso
  const btnsReativarCurso = container.querySelectorAll('.btn-reativar-curso')
  btnsReativarCurso.forEach(btn => {
    btn.addEventListener('click', async () => {
      const cursoId = btn.getAttribute('data-id')
      btn.disabled = true
      btn.textContent = '...'

      const { error } = await CourseService.reativarCurso(cursoId)

      if (error) {
        toast.error('Erro ao reativar curso: ' + error.message)
        btn.disabled = false
        btn.textContent = 'Reativar'
        return
      }

      toast.success('Curso reativado!')
      window.location.hash = '#/dashboard'
      setTimeout(() => window.location.hash = '#/dashboard/secretaria', 10)
    })
  })

  // =====================================================
  // VINCULAR ALUNO A TURMA (MATRÍCULA)
  // =====================================================
  const btnsMatricular = container.querySelectorAll('.btn-vincular-turma')
  const modalMatricula = container.querySelector('#modal-matricular-aluno')
  const formMatricula = container.querySelector('#form-vincular-turma')

  btnsMatricular.forEach(btn => {
    btn.addEventListener('click', () => {
      const alunoId = btn.getAttribute('data-id')
      const alunoNome = btn.getAttribute('data-nome')
      container.querySelector('#vincular-aluno-id').value = alunoId
      container.querySelector('#nome-aluno-matricula').textContent = alunoNome
      modalMatricula.style.display = 'flex'
    })
  })

  container.querySelector('.btn-fechar-matricula').onclick = () => {
    modalMatricula.style.display = 'none'
  }

  // Fechar modal com botão X
  container.querySelector('#btn-fechar-modal-matricula').onclick = () => {
    modalMatricula.style.display = 'none'
  }

  formMatricula.onsubmit = async (e) => {
    e.preventDefault()
    const alunoId = container.querySelector('#vincular-aluno-id').value
    const turmaId = container.querySelector('#vincular-turma-id').value

    const btnSubmit = formMatricula.querySelector('button[type="submit"]')
    btnSubmit.disabled = true
    btnSubmit.textContent = 'Matriculando...'

    const { error } = await AdminService.matricularAluno(alunoId, turmaId)

    btnSubmit.disabled = false
    btnSubmit.textContent = 'Matricular'

    if (error) {
      toast.error('Erro ao matricular: ' + error.message)
    } else {
      toast.success('Aluno matriculado com sucesso!')
      modalMatricula.style.display = 'none'
    }
  }

  return container
}
