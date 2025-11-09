import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración de Vite para GitHub Pages
export default defineConfig({
  base: '/Front/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000'
    }
  }
})
