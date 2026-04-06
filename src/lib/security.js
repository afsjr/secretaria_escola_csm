/**
 * Utilitário de Sanitização e Segurança
 * 
 * Previne ataques XSS (Cross-Site Scripting) escapando caracteres perigosos
 * e fornecendo helpers seguros para inserção de HTML.
 */

/**
 * Escapa caracteres especiais de HTML para prevenir XSS
 * @param {string} str - String a ser escapada
 * @returns {string} String segura para inserção em HTML
 */
export function escapeHTML(str) {
  if (str === null || str === undefined) return ''
  if (typeof str !== 'string') str = String(str)
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Cria um elemento de texto seguro (sem risco de XSS)
 * @param {string} text - Texto a ser inserido
 * @returns {Text} Node de texto seguro
 */
export function createSafeTextNode(text) {
  return document.createTextNode(text)
}

/**
 * Define o texto de um elemento de forma segura
 * @param {HTMLElement} element - Elemento alvo
 * @param {string} text - Texto a ser inserido
 */
export function setSafeText(element, text) {
  element.textContent = text
}

/**
 * Cria atributo HTML de forma segura (escapando valores)
 * @param {string} name - Nome do atributo
 * @param {string} value - Valor do atributo
 * @returns {string} String do atributo escapado
 */
export function safeAttribute(name, value) {
  return `${escapeHTML(name)}="${escapeHTML(value)}"`
}

/**
 * Template helper seguro para inserção de dados do usuário em HTML
 * Uso: safeHTML`<div>${userData.nome}</div>`
 */
export function safeHTML(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] !== undefined ? values[i] : ''
    return result + str + escapeHTML(String(value))
  }, '')
}

/**
 * Valida e sanitiza um nome de arquivo para download
 * @param {string} filename - Nome do arquivo
 * @returns {string} Nome seguro
 */
export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .substring(0, 255)
}

/**
 * Sanitiza URL para prevenir javascript: injection
 * @param {string} url - URL a ser validada
 * @returns {string} URL segura ou '#' se inválida
 */
export function sanitizeURL(url) {
  if (!url) return '#'
  
  // Rejeitar URLs com protocolo javascript:
  if (url.toLowerCase().trim().startsWith('javascript:')) {
    console.warn('URL bloqueada por conter javascript:', url)
    return '#'
  }
  
  // Rejeitar URLs com data: (pode conter scripts)
  if (url.toLowerCase().trim().startsWith('data:')) {
    console.warn('URL bloqueada por conter data:', url)
    return '#'
  }
  
  return url
}

/**
 * Helper para criar opções de select de forma segura
 * @param {string} value - Valor da opção
 * @param {string} label - Texto visível
 * @param {boolean} selected - Se está selecionada
 * @returns {string} HTML da opção
 */
export function createOption(value, label, selected = false) {
  const selectedAttr = selected ? ' selected' : ''
  return `<option value="${escapeHTML(value)}"${selectedAttr}>${escapeHTML(label)}</option>`
}

/**
 * Helper para criar badges/labels de forma segura
 * @param {string} text - Texto do badge
 * @param {string} colorClass - Classe CSS para cor (opcional)
 * @returns {string} HTML do badge
 */
export function createBadge(text, colorClass = '') {
  const classes = `badge ${colorClass}`.trim()
  return `<span class="${escapeHTML(classes)}">${escapeHTML(text)}</span>`
}
