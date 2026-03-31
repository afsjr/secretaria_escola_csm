import { defineConfig } from 'vite'

// CONFIGURAÇÃO SÊNIOR: Ajustar a 'base' conforme o nome do seu repositório no GitHub.
// Como o repositório é 'secretaria_escola_csm', a base deve ser o nome dele entre barras.
export default defineConfig({
  base: '/secretaria_escola_csm/',
  build: {
    outDir: 'dist',
  },
})
