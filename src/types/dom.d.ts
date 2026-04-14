/**
 * Helper declarations for DOM elements
 *解决 Element.style, Element.onclick, Element.onsubmit errors
 */

declare global {
  interface HTMLElement {
    style: CSSStyleDeclaration
    onclick: ((this: HTMLElement, ev: MouseEvent) => any) | null
    onsubmit: ((this: HTMLFormElement, ev: Event) => any) | null
  }

  interface Element {
    style: CSSStyleDeclaration
  }
}

export {}