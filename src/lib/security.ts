/**
 * Utilitário de Sanitização e Segurança
 *
 * Previne ataques XSS (Cross-Site Scripting) escapando caracteres perigosos
 * e fornecendo helpers seguros para inserção de HTML.
 */

/**
 * Escapa caracteres especiais de HTML para prevenir XSS
 * @param str - String a ser escapada
 * @returns String segura para inserção em HTML
 */
export function escapeHTML(str: unknown): string {
  if (str === null || str === undefined) return "";
  const strStr = String(str);

  return strStr
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Cria um elemento de texto seguro (sem risco de XSS)
 * @param text - Texto a ser inserido
 * @returns Node de texto seguro
 */
export function createSafeTextNode(text: unknown): Text {
  return document.createTextNode(String(text));
}

/**
 * Define o texto de um elemento de forma segura
 * @param element - Elemento alvo
 * @param text - Texto a ser inserido
 */
export function setSafeText(element: HTMLElement, text: unknown): void {
  element.textContent = String(text);
}

/**
 * Cria atributo HTML de forma segura (escapando valores)
 * @param name - Nome do atributo
 * @param value - Valor do atributo
 * @returns String do atributo escapado
 */
export function safeAttribute(name: string, value: string): string {
  return `${escapeHTML(name)}="${escapeHTML(value)}"`;
}

/**
 * Template helper seguro para inserção de dados do usuário em HTML
 * Uso: safeHTML`<div>${userData.nome}</div>`
 */
export function safeHTML(
  strings: TemplateStringsArray,
  ...values: unknown[]
): string {
  return strings.reduce((result, str, i) => {
    const value = values[i] !== undefined ? values[i] : "";
    return result + str + escapeHTML(String(value));
  }, "");
}

/**
 * Valida e sanitiza um nome de arquivo para download
 * @param filename - Nome do arquivo
 * @returns Nome seguro
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .substring(0, 255);
}

/**
 * Sanitiza URL para prevenir javascript: injection
 * @param url - URL a ser validada
 * @returns URL segura ou '#' se inválida
 */
export function sanitizeURL(url: string): string {
  if (!url) return "#";

  // Rejeitar URLs com protocolo javascript:
  if (url.toLowerCase().trim().startsWith("javascript:")) {
    console.warn("URL bloqueada por conter javascript:", url);
    return "#";
  }

  // Rejeitar URLs com data: (pode conter scripts)
  if (url.toLowerCase().trim().startsWith("data:")) {
    console.warn("URL bloqueada por conter data:", url);
    return "#";
  }

  return url;
}

/**
 * Helper para criar opções de select de forma segura
 * @param value - Valor da opção
 * @param label - Texto visível
 * @param selected - Se está selecionada
 * @returns HTML da opção
 */
export function createOption(
  value: string,
  label: string,
  selected = false,
): string {
  const selectedAttr = selected ? " selected" : "";
  return `<option value="${escapeHTML(value)}"${selectedAttr}>${
    escapeHTML(label)
  }</option>`;
}

/**
 * Helper para criar badges/labels de forma segura
 * @param text - Texto do badge
 * @param colorClass - Classe CSS para cor (opcional)
 * @returns HTML do badge
 */
export function createBadge(text: string, colorClass = ""): string {
  const classes = `badge ${colorClass}`.trim();
  return `<span class="${escapeHTML(classes)}">${escapeHTML(text)}</span>`;
}
