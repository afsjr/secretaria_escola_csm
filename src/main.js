import './styles/main.css'
import { supabase } from './lib/supabase'
import { LoginView } from './views/login'
import { SignupView } from './views/signup'
import { DashboardView } from './views/dashboard'
import { HomeView } from './views/home'

const app = document.querySelector('#app')

/**
 * Very simple client-side router based on URL hash.
 * Protects the dashboard by checking for a valid session.
 */
async function router() {
  const path = window.location.hash || '#/'
  const { data: { session } } = await supabase.auth.getSession()

  // Clear app
  app.innerHTML = ''

  // Protected route logic
  if (path.startsWith('#/dashboard') && !session) {
    window.location.hash = '#/'
    return
  }

  // Auth routing (if already logged in, skip login/signup)
  if ((path === '#/' || path === '#/signup') && session) {
    window.location.hash = '#/dashboard'
    return
  }

  // Render view
  try {
    if (path === '#/') {
      app.appendChild(LoginView())
    } else if (path === '#/signup') {
      app.appendChild(SignupView())
    } else if (path === '#/home') {
      app.appendChild(HomeView())
    } else if (path.startsWith('#/dashboard')) {
      // Pass the subpath to the DashboardView
      const subPath = path.replace('#/dashboard', '') || '/'
      app.appendChild(await DashboardView(session, subPath))
    } else {
      app.innerHTML = '<h1>404 - Página não encontrada</h1>'
    }
  } catch (err) {
    console.error('Render error:', err)
    app.innerHTML = '<p style="padding:20px; color:red;">Erro ao carregar página.</p>'
  }
}

// Listen for hash changes
window.addEventListener('hashchange', router)
window.addEventListener('load', router)

// Listen for Auth changes (login/logout redirect)
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    window.location.hash = '#/dashboard'
  } else if (event === 'SIGNED_OUT') {
    window.location.hash = '#/'
  }
  router()
})

// Initialize the app
router()
