/**
 * Utilitários para manipulação do DOM
 */

/**
 * Cria um elemento HTML a partir de uma string de template
 * @param html - String HTML
 * @returns O primeiro elemento da string convertida
 */
export function renderTemplate<T extends HTMLElement>(html: string): T {
  const template = document.createElement('template')
  template.innerHTML = html.trim()
  return template.content.firstChild as T
}

/**
 * Limpa e preenche um container com novo conteúdo
 * @param container - Elemento pai
 * @param content - Elemento ou string a ser inserida
 */
export function setContent(container: HTMLElement, content: HTMLElement | string): void {
  container.innerHTML = ''
  if (typeof content === 'string') {
    container.innerHTML = content
  } else {
    container.appendChild(content)
  }
}
