import './styles/main.css'
import { supabase } from './lib/supabase'
import { LoginView } from './views/login'
import { SignupView } from './views/signup'
import { DashboardView } from './views/dashboard'
import { HomeView } from './views/home'
import { ForgotPasswordView } from './views/forgot-password'
import { ResetPasswordView } from './views/reset-password'

const app = document.querySelector('#app') as HTMLElement | null

if (!app) {
  document.body.innerHTML = '<div style="padding:2rem;text-align:center;color:red;">Erro: elemento #app não encontrado</div>'
  throw new Error('#app element not found')
}

async function router(): Promise<void> {
  const hash = window.location.hash || '#/'
  const path = hash.split('&')[0].split('?')[0]  // Strip query/hash params from recovery URL

  if (!app) return

  try {
    const { data: { session } } = await supabase.auth.getSession()

    // Clear app immediately after getting session (or error)
    app.innerHTML = ''

  // Handle Supabase recovery redirect: #access_token=...&type=recovery
  const isRecoveryFlow = hash.includes('type=recovery') || hash.includes('type=email')

  if (isRecoveryFlow && path !== '#/reset-password') {
    console.log('[router] Detected recovery flow, redirecting to #/reset-password')
    window.location.hash = '#/reset-password'
    return
  }

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
        const subPath = path.replace('#/dashboard', '') || '/'
        app.appendChild(await DashboardView(session as any, subPath))
      } else {
        app.innerHTML = '<div style="padding: 2rem; text-align: center;"><h1>404</h1><p>Página não encontrada</p><a href="#/">Voltar para o início</a></div>'
      }
    } catch (err) {
      console.error('Render error:', err)
      app.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: #e53e3e; background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; margin: 20px;">
          <h2 style="margin-top: 0;">Erro ao carregar página</h2>
          <p>${err instanceof Error ? err.message : 'Erro desconhecido'}</p>
          <button onclick="window.location.reload()" style="background: #e53e3e; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px;">
            Tentar Novamente
          </button>
        </div>
      `
    }
  } catch (err) {
    console.error('Initial router error:', err)
    app.innerHTML = '<p style="padding:20px; color:red;">Erro crítico na inicialização do sistema.</p>'
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
