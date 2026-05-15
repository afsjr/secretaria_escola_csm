// Setup para testes - Mock de variáveis globais e ambiente
import { vi } from 'vitest'

// Mock do import.meta.env
const mockImportMetaEnv = {
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  DEV: true,
  PROD: false,
  MODE: 'test'
}

// Aplicar mock do import.meta.env
// No Vitest com JSDOM, podemos usar vi.stubEnv se preferir, 
// mas para compatibilidade com o código atual:
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: mockImportMetaEnv
    }
  },
  configurable: true
})

// Mocks globais que o JSDOM não fornece ou precisam ser controlados
if (typeof window !== 'undefined') {
  // Mock do matchMedia se necessário
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// Mock do crypto.randomUUID se não existir no ambiente
if (!globalThis.crypto) {
  (globalThis as any).crypto = {
    randomUUID: () => `test-uuid-${Math.random().toString(36).substr(2, 9)}`
  }
}