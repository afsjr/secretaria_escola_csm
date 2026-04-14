/**
 * Testes para security.ts
 * Funções helper de segurança
 */

import { describe, it, expect } from 'vitest'
import { escapeHTML, createBadge, createOption } from '../lib/security'

describe('Security - escapeHTML', () => {
  it('deve escapar HTML basico', () => {
    expect(escapeHTML('<script>')).toBe('&lt;script&gt;')
  })

  it('deve escapar aspas simples', () => {
    const result = escapeHTML("it's")
    expect(result).toMatch(/&#(39|x27)/)
  })

  it('deve escapar aspas duplas', () => {
    expect(escapeHTML('say "hello"')).toBe('say &quot;hello&quot;')
  })

  it('deve escapar &, <, >', () => {
    expect(escapeHTML('a & b < c > d')).toBe('a &amp; b &lt; c &gt; d')
  })

  it('deve retornar string vazia para null/undefined', () => {
    expect(escapeHTML(null)).toBe('')
    expect(escapeHTML(undefined)).toBe('')
  })

  it('deve retornar string unchanged se nao tiver HTML', () => {
    expect(escapeHTML('normal text')).toBe('normal text')
  })
})

describe('Security - createBadge', () => {
  it('deve criar badge para status ativo', () => {
    const badge = createBadge('ativo')
    expect(badge).toContain('<span')
    expect(badge).toContain('ativo')
    expect(badge).toContain('</span>')
  })

  it('deve criar badge para status inativo', () => {
    const badge = createBadge('inativo')
    expect(badge).toContain('<span')
    expect(badge).toContain('inativo')
  })

  it('deve criar badge para status pendente', () => {
    const badge = createBadge('pendente')
    expect(badge).toContain('<span')
    expect(badge).toContain('pendente')
  })
})

describe('Security - createOption', () => {
  it('deve criar option basica', () => {
    const option = createOption('valor', 'Label')
    expect(option).toContain('<option')
    expect(option).toContain('value="valor"')
    expect(option).toContain('>Label</option>')
  })

  it('deve criar option com selected=true', () => {
    const option = createOption('valor', 'Label', true)
    expect(option).toContain('selected')
  })

  it('deve criar option com selected=false', () => {
    const option = createOption('valor', 'Label', false)
    expect(option).not.toContain('selected')
  })
})

describe('Security - XSS Prevention', () => {
  it('deve bloquear ataque XSS com script', () => {
    const input = '<script>alert("xss")</script>'
    const escaped = escapeHTML(input)
    expect(escaped).not.toContain('<script>')
    expect(escaped).toContain('&lt;script&gt;')
  })

  it('deve escapar tag img', () => {
    const input = '<img src=x>'
    const escaped = escapeHTML(input)
    expect(escaped).toContain('&lt;img')
  })
})