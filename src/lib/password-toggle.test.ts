import { describe, it, expect, vi, beforeEach } from 'vitest'
import { addPasswordToggle } from './password-toggle'

vi.mock('./icons', () => ({
  ICONS: {
    eye: '<svg>eye</svg>',
    eyeOff: '<svg>eyeOff</svg>',
  },
}))

function createInputWithFormGroup(type = 'password'): HTMLInputElement {
  const formGroup = document.createElement('div')
  formGroup.className = 'form-group'
  const input = document.createElement('input')
  input.type = type
  input.id = 'test-password'
  formGroup.appendChild(input)
  document.body.appendChild(formGroup)
  return input
}

function createInputWithWrapper(): HTMLInputElement {
  const wrapper = document.createElement('div')
  wrapper.className = 'input-icon-wrapper'
  const input = document.createElement('input')
  input.type = 'password'
  input.id = 'test-password'
  wrapper.appendChild(input)
  document.body.appendChild(wrapper)
  return input
}

describe('addPasswordToggle', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('insere botão com aria-label "Mostrar senha" em .form-group', () => {
    const input = createInputWithFormGroup()
    addPasswordToggle(input)

    const btn = document.querySelector('.input-toggle-btn') as HTMLButtonElement
    expect(btn).toBeDefined()
    expect(btn.getAttribute('aria-label')).toBe('Mostrar senha')
    expect(btn.innerHTML).toContain('eye')
  })

  it('alterna type de password para text no click', () => {
    const input = createInputWithFormGroup()
    addPasswordToggle(input)

    const btn = document.querySelector('.input-toggle-btn') as HTMLButtonElement
    btn.click()

    expect(input.type).toBe('text')
    expect(btn.getAttribute('aria-label')).toBe('Ocultar senha')
    expect(btn.innerHTML).toContain('eyeOff')
  })

  it('reverte de text para password no segundo click', () => {
    const input = createInputWithFormGroup()
    addPasswordToggle(input)

    const btn = document.querySelector('.input-toggle-btn') as HTMLButtonElement
    btn.click()
    btn.click()

    expect(input.type).toBe('password')
    expect(btn.getAttribute('aria-label')).toBe('Mostrar senha')
    expect(btn.innerHTML).toContain('eye')
  })

  it('insere botão dentro de .input-icon-wrapper quando input está no wrapper', () => {
    const input = createInputWithWrapper()
    addPasswordToggle(input)

    const wrapper = document.querySelector('.input-icon-wrapper')!
    const btn = wrapper.querySelector('.input-icon-right') as HTMLButtonElement
    expect(btn).toBeDefined()
    expect(btn.getAttribute('aria-label')).toBe('Mostrar senha')
  })

  it('não insere toggle em input que não é type password', () => {
    const input = createInputWithFormGroup('text')
    addPasswordToggle(input)

    const btn = document.querySelector('.input-toggle-btn')
    expect(btn).toBeNull()
  })

  it('chama focus() no input após alternar', () => {
    const input = createInputWithFormGroup()
    addPasswordToggle(input)

    const focusSpy = vi.spyOn(input, 'focus')
    const btn = document.querySelector('.input-toggle-btn') as HTMLButtonElement
    btn.click()

    expect(focusSpy).toHaveBeenCalled()
  })
})
