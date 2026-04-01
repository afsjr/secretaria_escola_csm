export function HomeView() {
  const container = document.createElement('div')
  container.className = 'home-container animate-in'

  container.innerHTML = `
    <div class="home-card">
      <div class="home-header">
        <div class="home-logo">🎓</div>
        <h1>Secretaria Escola CSM</h1>
        <p>Sistema de Gestão Escolar</p>
      </div>
      
      <div class="home-options">
        <div class="home-option" onclick="window.location.hash='#/'">
          <span class="home-option-icon">🔑</span>
          <h3>Acesso Administrativo</h3>
          <p>Login para Secretaria</p>
        </div>
        
        <div class="home-option" onclick="window.location.hash='#/aluno-info'">
          <span class="home-option-icon">👤</span>
          <h3>Portal do Aluno</h3>
          <p>Informações acadêmicas</p>
        </div>
      </div>
      
      <div class="home-footer">
        <a href="#/" class="home-link">Já tem conta? Faça login</a>
      </div>
    </div>
  `

  return container
}
