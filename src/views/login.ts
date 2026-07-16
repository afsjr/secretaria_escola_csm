import { login } from "../auth/session";
import { toast } from "../lib/toast";
import { validateLogin } from "../lib/validation";
import { checkRateLimit, clearRateLimit } from "../lib/rate-limiter";
import { ICONS } from "../lib/icons";

export function LoginView(): HTMLElement {
  const container = document.createElement("div");
  container.className = "auth-container";

  container.innerHTML = `
    <div class="auth-card-split">
      <!-- Painel Esquerdo: Branding / Institucional -->
      <div class="auth-brand-side" style="background: linear-gradient(135deg, #ffffff 0%, #f4f6f8 100%) !important;">
        <div>
          <!-- Box da Logo -->
          <!-- Box da Logo -->
          <div class="brand-logo-box">
            <img src="/logo.png" alt="Logo CSM Técnico" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div style="display: none; align-items: center; justify-content: center; font-weight: 800; font-size: 1.5rem; color: #d11218; width: 100%; height: 100%; gap: 8px;">
              <span style="font-size: 2rem;">+</span> CSM TÉCNICO
            </div>
          </div>
          
          <h1 class="brand-title-split" style="color: #d11218 !important;">
            Secretaria<br>Colégio Santa Mônica - CSM
          </h1>
          
          <p class="brand-desc-split" style="color: #4b5563 !important;">
            SGE - Sistema de Gestão Escolar de alta performance para administração de turmas, alunos e registros acadêmicos.
          </p>
        </div>
        
        <!-- Material de Treinamento -->
        <div class="brand-training-box-split">
          <p style="color: #4b5563 !important;">Dúvidas no uso? Consulte o material de capacitação:</p>
          <button type="button" id="btn-treinamento" class="btn-training-split" style="background: rgba(0, 142, 43, 0.1) !important; color: #008e2b !important; border-color: rgba(0, 142, 43, 0.2) !important;">
            ${ICONS.book} Material de Treinamento
          </button>
        </div>

      </div>

      <!-- Painel Direito: Formulário -->
      <div class="auth-form-side">
        <!-- Cabeçalho Mobile (Exibido apenas em telas pequenas) -->
        <div class="mobile-brand-header">
           <div class="mobile-logo-box">
             <img src="/logo.png" alt="Logo CSM Técnico" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
             <div style="display: none; align-items: center; justify-content: center; font-weight: 800; font-size: 1.25rem; color: #d11218; width: 100%; height: 100%; gap: 6px;">
               <span style="font-size: 1.5rem;">+</span> CSM
             </div>
          </div>
          <h1 style="text-align: center; font-size: 1.5rem; font-weight: 800; color: var(--primary);">Secretaria CSM</h1>
          <p style="text-align: center; font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">SGE - Gestão Escolar</p>
        </div>

        <div style="max-width: 400px; width: 100%; margin: 0 auto;">
          <div class="form-header-split">
            <h2>Acessar Conta</h2>
            <p>Insira suas credenciais institucionais para entrar.</p>
          </div>

          <form id="login-form">
            <!-- Input: E-mail -->
            <div class="form-group">
              <label class="label" for="email">E-MAIL INSTITUCIONAL</label>
              <div class="input-icon-wrapper">
                <span class="input-icon-left">
                  ${ICONS.mail}
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autocomplete="email"
                  class="input"
                  placeholder="admin@santa-monica.com"
                  required
                >
              </div>
            </div>

            <!-- Input: Senha -->
            <div class="form-group">
              <label class="label" for="password">SENHA</label>
              <div class="input-icon-wrapper">
                <span class="input-icon-left">
                  ${ICONS.lock}
                </span>
                <input
                  type="password"
                  id="password"
                  name="password"
                  autocomplete="current-password"
                  class="input"
                  placeholder="••••••••••••"
                  required
                >
              </div>
            </div>

            <!-- Botão de Submissão -->
            <button type="submit" class="btn-submit-premium">
              Entrar na Plataforma <span style="font-size: 1.1rem; margin-left: 2px;">→</span>
            </button>
          </form>

          <!-- Links de Navegação Auxiliares -->
          <div class="auth-footer" style="text-align: left; margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <div>
              Não tem uma conta? <a href="#/signup">Criar Cadastro</a>
            </div>
            <div>
              Esqueceu sua senha? <a href="#/forgot-password">Recuperar Acesso</a>
            </div>
          </div>
          
          <div class="footer-secure-box">
            Ambiente protegido. <a href="#/suporte">Contato do suporte institucional</a>
          </div>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector("#login-form") as HTMLFormElement;
  form.addEventListener("submit", async (e: Event) => {
    e.preventDefault();

    const email = (form.querySelector("#email") as HTMLInputElement).value;
    const password =
      (form.querySelector("#password") as HTMLInputElement).value;

    // Validar inputs antes de enviar
    const validation = validateLogin({ email, password });

    if (!validation.success) {
      (validation as any).errors.forEach((err: string) => toast.error(err));
      return;
    }

    // Verificar rate limiting
    const rateLimit = checkRateLimit(email);
    if (!rateLimit.allowed) {
      toast.error(rateLimit.message!);
      return;
    }

    const submitBtn = form.querySelector(
      ".btn-submit-premium",
    ) as HTMLButtonElement;
    submitBtn.disabled = true;
    submitBtn.textContent = "Autenticando...";

    try {
      const { error } = await login(
        validation.data.email as string,
        validation.data.password as string,
      );

      if (error) {
        toast.error("Erro de acesso: " + error.message);
      } else {
        clearRateLimit(email); // Limpa tentativas após login bem-sucedido
        toast.success("Bem-vindo ao sistema!");
      }
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Entrar na Plataforma";
    }
  });

  // Training button event listener
  const btnTreinamento = container.querySelector("#btn-treinamento");
  if (btnTreinamento) {
    btnTreinamento.addEventListener("click", (e: Event) => {
      e.preventDefault();
      let baseUrl = window.location.href.split("#")[0].replace(
        "index.html",
        "",
      );
      if (!baseUrl.endsWith("/")) baseUrl += "/";
      window.open(baseUrl + "apresentacao_treinamento.html", "_blank");
    });
  }

  return container;
}
