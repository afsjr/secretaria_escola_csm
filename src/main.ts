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
  const hash = window.location.hash || '#/'
  const path = hash.split('&')[0].split('?')[0]  // Strip query/hash params from recovery URL
  const { data: { session } } = await supabase.auth.getSession()

  // Handle Supabase recovery redirect: #access_token=...&type=recovery
  const isRecoveryFlow = hash.includes('type=recovery') || hash.includes('type=email')

  if (isRecoveryFlow && path !== '#/reset-password') {
    console.log('[router] Detected recovery flow, redirecting to #/reset-password')
    window.location.hash = '#/reset-password'
    return
  }

  // Clear app
  app.innerHTML = ''

  // Protected route logic
  if (path.startsWith('#/dashboard') && !session) {
    window.location.hash = '#/'
    return
  }

  // Auth routing (if already logged in, skip auth screens)
  // EXCEPTION: do NOT redirect from reset-password even if session exists (recovery flow)
  const isAuthRoute = path === '#/' || path === '#/signup' || path === '#/forgot-password'
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
      app.appendChild(await DashboardView(session as any, subPath))
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
  console.log('[onAuthStateChange]', event, session?.user?.email)

  if (event === 'SIGNED_IN') {
    if (window.location.hash === '#/' || window.location.hash === '') {
      window.location.hash = '#/dashboard'
    }
  } else if (event === 'SIGNED_OUT') {
    window.location.hash = '#/'
  } else if (event === 'PASSWORD_RECOVERY') {
    console.log('[onAuthStateChange] PASSWORD_RECOVERY event detected')
    window.location.hash = '#/reset-password'
  } else if (event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
    // Some Supabase versions fire these events instead of PASSWORD_RECOVERY
    const hash = window.location.hash
    if (hash.includes('type=recovery') || hash.includes('access_token=')) {
      console.log('[onAuthStateChange] Recovery via hash detected')
      window.location.hash = '#/reset-password'
    }
  }
})
