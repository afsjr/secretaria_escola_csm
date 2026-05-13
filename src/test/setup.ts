// Setup para testes - Mock de variáveis globais do navegador
import { vi } from 'vitest'

// Mock do import.meta.env
const mockImportMetaEnv = {
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  DEV: true,
  PROD: false,
  MODE: 'test'
}

// Aplicar antes de qualquer import
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: mockImportMetaEnv
    }
  },
  writable: true
})

// Mock do window para ambiente Node
const mockWindow = {
  location: {
    hostname: 'localhost',
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: ''
  },
  document: {
    body: {
      innerHTML: '',
      appendChild: vi.fn(function(el) {
        if (this === mockWindow.document.body) {
          // Simulate appending to body
        }
        return el;
      }),
      removeChild: vi.fn()
    },
    createElement: vi.fn((tag) => {
      const el: any = {
        tagName: tag.toUpperCase(),
        className: '',
        innerHTML: '',
        style: {},
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
        appendChild: vi.fn((child) => child),
        querySelector: vi.fn(() => mockWindow.document.createElement('div')),
        querySelectorAll: vi.fn(() => []),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dataset: {},
        classList: {
          add: vi.fn((cls) => { el.className += ' ' + cls; }),
          remove: vi.fn(),
          contains: vi.fn(() => false),
        },
        dispatchEvent: vi.fn(),
        click: vi.fn(),
      };
      
      if (tag.toLowerCase() === 'template') {
        const firstChild = mockWindow.document.createElement('div');
        el.content = { firstChild };
        // Sync innerHTML to firstChild for testing purposes
        Object.defineProperty(el, 'innerHTML', {
          set: (val) => { firstChild.innerHTML = val; },
          get: () => firstChild.innerHTML
        });
      }
      
      return el;
    }),
    getElementById: vi.fn(() => mockWindow.document.createElement('div')),
    querySelector: vi.fn(() => mockWindow.document.createElement('div')),
    querySelectorAll: vi.fn(() => [])
  }
}

// Mock do localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// Mock do sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}

// Mock do navigator
const mockNavigator = {
  userAgent: 'node.js/tests',
  language: 'pt-BR',
  onLine: true
}

// Aplicar mocks globalmente
Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
})

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
})

Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true
})

Object.defineProperty(global, 'navigator', {
  value: mockNavigator,
  writable: true
})

Object.defineProperty(global, 'document', {
  value: mockWindow.document,
  writable: true
})

// Mock do crypto.randomUUID
if (!global.crypto) {
  global.crypto = {
    randomUUID: () => `test-uuid-${Math.random().toString(36).substr(2, 9)}`
  } as any
}