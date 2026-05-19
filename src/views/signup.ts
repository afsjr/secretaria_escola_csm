import { registerUser } from "../auth/signup-handler";
import { toast } from "../lib/toast";
import { validateSignup, validarCPF } from "../lib/validation";
import { checkRateLimit, clearRateLimit } from "../lib/rate-limiter";

export function SignupView(): HTMLElement {
  const container = document.createElement("div");
  container.className = "auth-container";

  container.innerHTML = `
    <div class="auth-card">
      <h2>Novo Cadastro</h2>
      <p style="text-align:center; margin-bottom: 2rem;">Crie sua conta de aluno</p>

      <form id="signup-form">
        <div class="form-group">
          <label class="label" for="nomeCompleto">Nome Completo</label>
          <input type="text" id="nomeCompleto" name="nomeCompleto" autocomplete="name" class="input" placeholder="João Silva" required>
        </div>

        <div class="form-group">
          <label class="label" for="email">E-mail</label>
          <input type="email" id="email" name="email" autocomplete="email" class="input" placeholder="seu@email.com" required>
        </div>

        <div class="form-group">
          <label class="label" for="cpf">CPF</label>
          <div style="position: relative;">
            <input type="text" id="cpf" name="cpf" class="input" placeholder="000.000.000-00" required style="padding-right: 2.5rem;">
            <span id="cpf-status" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 1.2rem; display: none;"></span>
          </div>
          <small id="cpf-feedback" style="color: var(--text-muted); display: none;"></small>
        </div>

        <div class="form-group">
          <label class="label" for="telefone">Telefone / WhatsApp</label>
          <input type="text" id="telefone" name="telefone" autocomplete="tel" class="input" placeholder="(00) 00000-0000" required>
        </div>

        <div class="form-group">
          <label class="label" for="password">Senha</label>
          <input type="password" id="password" name="password" autocomplete="new-password" class="input" placeholder="mínimo 6 caracteres, 1 letra e 1 número" minlength="6" required>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">Registrar</button>
      </form>

      <div class="auth-footer">
        Já possui conta? <a href="#/">Fazer Login</a>
      </div>
    </div>
  `;

  const cpfInput = container.querySelector("#cpf") as HTMLInputElement;
  const cpfStatus = container.querySelector("#cpf-status") as HTMLSpanElement;
  const cpfFeedback = container.querySelector("#cpf-feedback") as HTMLSmallElement;

  function formatCPF(value: string): string {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  }

  cpfInput.addEventListener('input', () => {
    const rawValue = cpfInput.value;
    const formattedValue = formatCPF(rawValue);
    if (rawValue !== formattedValue) {
      cpfInput.value = formattedValue;
    }

    const cpf = cpfInput.value.replace(/\D/g, '');

    if (cpf.length === 0) {
      cpfStatus.style.display = 'none';
      cpfFeedback.style.display = 'none';
      cpfInput.style.borderColor = '';
      return;
    }

    if (cpf.length < 11) {
      cpfStatus.textContent = '⏳';
      cpfStatus.style.display = 'block';
      cpfStatus.style.color = 'var(--text-muted)';
      cpfFeedback.style.display = 'none';
      cpfInput.style.borderColor = '';
      return;
    }

    if (validarCPF(cpf)) {
      cpfStatus.textContent = '✅';
      cpfStatus.style.display = 'block';
      cpfStatus.style.color = 'var(--success)';
      cpfFeedback.textContent = 'CPF válido';
      cpfFeedback.style.display = 'block';
      cpfFeedback.style.color = 'var(--success)';
      cpfInput.style.borderColor = 'var(--success)';
    } else {
      cpfStatus.textContent = '❌';
      cpfStatus.style.display = 'block';
      cpfStatus.style.color = 'var(--danger)';
      cpfFeedback.textContent = 'CPF inválido';
      cpfFeedback.style.display = 'block';
      cpfFeedback.style.color = 'var(--danger)';
      cpfInput.style.borderColor = 'var(--danger)';
    }
  });

  const form = container.querySelector("#signup-form") as HTMLFormElement;
  form.addEventListener("submit", async (e: Event) => {
    e.preventDefault();

    const email = (form.querySelector("#email") as HTMLInputElement).value;
    const password =
      (form.querySelector("#password") as HTMLInputElement).value;
    const nomeCompleto =
      (form.querySelector("#nomeCompleto") as HTMLInputElement).value;
    const cpf = (form.querySelector("#cpf") as HTMLInputElement).value;
    const telefone =
      (form.querySelector("#telefone") as HTMLInputElement).value;

    const cpfClean = cpf.replace(/\D/g, '');
    if (cpfClean.length > 0 && cpfClean.length < 11) {
      toast.error("CPF incompleto. Digite os 11 números.");
      cpfInput.focus();
      return;
    }
    if (cpfClean.length === 11 && !validarCPF(cpfClean)) {
      toast.error("CPF inválido. Verifique o número e tente novamente.");
      cpfInput.focus();
      return;
    }

    const validation = validateSignup({
      email,
      password,
      nomeCompleto,
      cpf,
      telefone,
    });

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
    submitBtn.textContent = "Registrando...";

    try {
      const { error } = await registerUser({
        email: validation.data.email as string,
        password: validation.data.password as string,
        nomeCompleto: validation.data.nomeCompleto as string,
        cpf: validation.data.cpf as string,
        telefone: validation.data.telefone as string,
      });

      if (error) {
        toast.error("Erro no cadastro: " + error.message);
      } else {
        clearRateLimit(email);
        toast.success("Conta criada com sucesso!");
      }
    } catch {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Registrar";
    }
  });

  return container;
}
