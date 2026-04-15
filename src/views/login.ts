import { login } from "../auth/session";
import { toast } from "../lib/toast";
import { validateLogin } from "../lib/validation";
import { checkRateLimit, clearRateLimit } from "../lib/rate-limiter";

export function LoginView(): HTMLElement {
  const container = document.createElement("div");
  container.className = "auth-container";

  container.innerHTML = `
    <div class="auth-card">
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎓</div>
        <h2 style="color: var(--primary);">Acesso Administrativo</h2>
        <p style="text-align:center; margin-bottom: 2rem; color: var(--text-muted);">SGE - Secretaria Escola CSM<br><strong style="color: var(--primary);">Colégio Santa Mônica</strong> - Limoeiro/PE</p>
      </div>

      <form id="login-form">
        <div class="form-group">
          <label class="label" for="email">E-mail</label>
          <input type="email" id="email" name="email" autocomplete="email" class="input" placeholder="seu@email.com" required>
        </div>

        <div class="form-group">
          <label class="label" for="password">Senha</label>
          <input type="password" id="password" name="password" autocomplete="current-password" class="input" placeholder="********" required>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">Entrar</button>
      </form>

      <div style="margin-top: 1rem;">
        <button type="button" id="btn-treinamento" class="btn" style="width: 100%; padding: 0.75rem; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer;">
          📚 Material de Treinamento
        </button>
      </div>

      <div class="auth-footer">
        Não tem uma conta? <a href="#/signup">Criar Cadastro</a>
        <br><br>
        Esqueceu sua senha? <a href="#/forgot-password">Recuperar Acesso</a>
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
      'button[type="submit"]',
    ) as HTMLButtonElement;
    submitBtn.disabled = true;
    submitBtn.textContent = "Entrando...";

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
      submitBtn.textContent = "Entrar";
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
