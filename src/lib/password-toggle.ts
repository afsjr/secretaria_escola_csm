import { ICONS } from './icons'

export function addPasswordToggle(input: HTMLInputElement): void {
  if (!input || input.type !== 'password') return

  const wrapper = input.closest('.input-icon-wrapper')
  const formGroup = input.closest('.form-group')
  const parent = wrapper || formGroup
  if (!parent) return

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = wrapper ? 'input-icon-right' : 'input-toggle-btn'
  btn.setAttribute('aria-label', 'Mostrar senha')
  btn.innerHTML = ICONS.eye

  btn.addEventListener('click', () => {
    const isPassword = input.type === 'password'
    input.type = isPassword ? 'text' : 'password'
    btn.innerHTML = isPassword ? ICONS.eyeOff : ICONS.eye
    btn.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha')
    input.focus()
  })

  parent.style.position = 'relative'
  parent.appendChild(btn)
}
