/**
 * Simple Toast Utility
 * Shows professional floating alerts in the bottom-right corner.
 * WCAG AA: Uses aria-live region for screen reader announcements.
 */
import { escapeHTML } from "./security";

type ToastType = "success" | "error" | "info" | "warning" | "loading";

export const toast = {
  container: null as HTMLDivElement | null,
  liveRegion: null as HTMLDivElement | null,
  loadingEl: null as HTMLDivElement | null,

  init(): void {
    if (this.container) return;
    this.container = document.createElement("div");
    this.container.className = "toast-container";
    document.body.appendChild(this.container);

    this.liveRegion = document.createElement("div");
    this.liveRegion.id = "toast-aria-live";
    this.liveRegion.className = "sr-only";
    this.liveRegion.setAttribute("aria-live", "polite");
    this.liveRegion.setAttribute("aria-atomic", "true");
    document.body.appendChild(this.liveRegion);
  },

  show(message: string, type: ToastType = "info", duration = 3000): void {
    this.init();

    const el = document.createElement("div");
    el.className = `toast ${type}`;
    const contentDiv = document.createElement("div");
    contentDiv.className = "toast-content";
    contentDiv.textContent = message;
    el.appendChild(contentDiv);

    this.container!.appendChild(el);

    if (this.liveRegion) {
      this.liveRegion.textContent = message;
    }

    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      setTimeout(() => el.remove(), 300);
    }, duration);
  },

  loading(message = "Carregando..."): void {
    this.dismissLoading();
    this.init();

    const el = document.createElement("div");
    el.className = "toast loading";
    el.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;flex-shrink:0;"></span><div class="toast-content">${escapeHTML(message)}</div>`;
    this.container!.appendChild(el);
    this.loadingEl = el;

    if (this.liveRegion) {
      this.liveRegion.setAttribute("aria-live", "assertive");
      this.liveRegion.textContent = message;
    }
  },

  dismissLoading(): void {
    if (this.loadingEl) {
      this.loadingEl.remove();
      this.loadingEl = null;
    }
    if (this.liveRegion) {
      this.liveRegion.setAttribute("aria-live", "polite");
      this.liveRegion.textContent = "";
    }
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
