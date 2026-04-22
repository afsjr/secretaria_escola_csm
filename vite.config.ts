import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,       // Remove console.log, console.error, console.warn
        drop_debugger: true,      // Remove debugger statements
        passes: 3,                // Múltiplas passagens para melhor otimização
        dead_code: true,          // Remove código não utilizado
        unused: true              // Remove variáveis/funções não utilizadas
      },
      mangle: {
        toplevel: true,           // Ofusca nomes de variáveis e funções no escopo global
        keep_classnames: false,   // Não preserva nomes de classes
        keep_fnames: false        // Não preserva nomes de funções
      },
      format: {
        comments: false           // Remove todos os comentários do build final
      }
    },
    // Configurações adicionais de ofuscação
    target: 'es2015',             // Mantém compatibilidade com navegadores modernos
    cssCodeSplit: true,           // Divide CSS em chunks separados
    sourcemap: false              // DESATIVA source maps em produção (segurança)
  },
  server: {
    port: 3000,                  // Porta fix para Supabase auth redirects
    strictPort: true,            // Falha se a porta já estiver em uso
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
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    alias: [
      { find: /^.\/supabase$/, replacement: './src/test/__mocks__/supabase.ts' }
    ]
  }
})
