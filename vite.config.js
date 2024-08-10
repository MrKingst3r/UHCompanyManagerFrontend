import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  base: './', // This is equivalent to `publicPath` in Vue CLI
  build: {
    outDir: 'dist', // This is equivalent to `outputDir`
    assetsDir: 'static', // This is equivalent to `assetsDir`
  },
})