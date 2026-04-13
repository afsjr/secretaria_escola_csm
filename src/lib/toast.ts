/**
 * Simple Toast Utility
 * Shows professional floating alerts in the bottom-right corner.
 */
import { escapeHTML } from "./security";

type ToastType = "success" | "error" | "info" | "warning";

export const toast = {
  container: null as HTMLDivElement | null,

  init(): void {
    if (this.container) return;
    this.container = document.createElement("div");
    this.container.className = "toast-container";
    document.body.appendChild(this.container);
  },

  show(message: string, type: ToastType = "info", duration = 3000): void {
    this.init();

    const el = document.createElement("div");
    el.className = `toast ${type}`;
    // Usar textContent para prevenir XSS
    const contentDiv = document.createElement("div");
    contentDiv.className = "toast-content";
    contentDiv.textContent = message;
    el.appendChild(contentDiv);

    this.container!.appendChild(el);

    // Auto-remove
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      setTimeout(() => el.remove(), 300);
    }, duration);
  },

  success(msg: string): void {
    this.show(msg, "success");
  },
  error(msg: string): void {
    this.show(msg, "error");
  },
  info(msg: string): void {
    this.show(msg, "info");
  },
  warning(msg: string): void {
    this.show(msg, "warning");
  },
};
