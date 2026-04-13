import { defineConfig } from 'vite'

// CONFIGURAÇÃO SÊNIOR: Ajustar a 'base' conforme o nome do seu repositório no GitHub.
// Como o repositório é 'secretaria_escola_csm', a base deve ser o nome dele entre barras.
export default defineConfig({
  base: '/secretaria_escola_csm/',
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,       // Remove console.log, console.error, console.warn
        drop_debugger: true       // Remove debugger statements
      }
    }
  },
  server: {
    // Configurar headers de segurança para dev server
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  },
  // Prevenir vazamento de variáveis de ambiente sensíveis
  define: {
    // Garantir que variáveis não-VITE_ não sejam expostas
    'process.env': {}
  }
})
