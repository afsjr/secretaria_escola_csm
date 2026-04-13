import './styles/main.css'
import { supabase } from './lib/supabase'
import { LoginView } from './views/login'
import { SignupView } from './views/signup'
import { DashboardView } from './views/dashboard'
import { HomeView } from './views/home'
import { ForgotPasswordView } from './views/forgot-password'
import { ResetPasswordView } from './views/reset-password'

const app = document.querySelector('#app') as HTMLElement

/**
 * Very simple client-side router based on URL hash.
 * Protege o painel de controle verificando sessão válida.
 */
async function router(): Promise<void> {
  const path = window.location.hash || '#/'
  const { data: { session } } = await supabase.auth.getSession()

  // Clear app
  app.innerHTML = ''

  // Protected route logic
  if (path.startsWith('#/dashboard') && !session) {
    window.location.hash = '#/'
    return
  }

  // Auth routing (if already logged in, skip auth screens)
  const isAuthRoute = path === '#/' || path === '#/signup' || path === '#/forgot-password' || path === '#/reset-password'
  if (isAuthRoute && session) {
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
    } else if (path === '#/forgot-password') {
      app.appendChild(ForgotPasswordView())
    } else if (path === '#/reset-password') {
      app.appendChild(ResetPasswordView())
    } else if (path.startsWith('#/dashboard')) {
      // Pass the subpath to the PainelControleView
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

// Listen for Auth state changes (login/logout redirect)
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    if (window.location.hash === '#/' || window.location.hash === '') {
      window.location.hash = '#/dashboard'
    }
  } else if (event === 'SIGNED_OUT') {
    window.location.hash = '#/'
  }
  // Remove redundant router() call here as hashchange/load already cover it
})
