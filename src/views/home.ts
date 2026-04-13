export function HomeView(): HTMLElement {
  const container = document.createElement('div')
  container.className = 'home-container animate-in'

  container.innerHTML = `
    <div class="home-card">
      <div class="home-header">
        <div class="home-logo" style="color: var(--primary);">🎓</div>
        <h1 style="color: var(--primary);">Secretaria Escola CSM</h1>
        <p style="color: var(--text-muted);">Colégio Santa Mônica - Limoeiro/PE</p>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Sistema de Gestão Escolar</p>
      </div>

      <div class="home-options">
        <div class="home-option" onclick="window.location.hash='#/'" style="border-left: 4px solid var(--primary);">
          <span class="home-option-icon" style="background: var(--primary);">🔑</span>
          <div>
            <h3>Acesso Administrativo</h3>
            <p>Login para Secretaria e Professores</p>
          </div>
        </div>

        <div class="home-option" onclick="window.location.hash='#/aluno-info'" style="border-left: 4px solid var(--accent);">
          <span class="home-option-icon" style="background: var(--accent); color: var(--text-main);">👤</span>
          <div>
            <h3>Portal do Aluno</h3>
            <p>Informações acadêmicas e documentos</p>
          </div>
        </div>

        <div class="home-option" id="btn-treinamento-home" style="border-left: 4px solid var(--success); background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%); cursor: pointer;">
          <span class="home-option-icon" style="background: var(--success);">📚</span>
          <div>
            <h3 style="color: var(--success-text);">Material de Treinamento</h3>
            <p>Guia completo de funcionalidades e permissões</p>
          </div>
        </div>
      </div>

      <div class="home-footer">
        <a href="#/" class="home-link">Já tem conta? Faça login</a>
      </div>
    </div>
  `

  // Training button event listener
  setTimeout(() => {
    const btnTreinamento = container.querySelector('#btn-treinamento-home')
    if (btnTreinamento) {
      btnTreinamento.addEventListener('click', () => {
        window.open(window.location.origin + window.location.pathname + 'apresentacao_treinamento.html', '_blank')
      })
    }
  }, 100)

  return container
}
