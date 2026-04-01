import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5001,
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy voor alle site-previews en hun assets
      '^/(previews|academy|bakkerij|de-stijlvolle-kapper|gentse-dakwerken|kdc-it-advies|lex-justitia|pure-bloom|urban-brew|athena-hub|ai-consultant|chocolade-shop|cloud-architects|code-crafters|de-schaar|demo-bakkerij|demo-consultant|demo-portfolio|fpc-gent|jets-archive|karel-portfolio|karel-webdesign|nieuwe-tanden|portfolio-kbm|pure-relaxation|test-dentist|test-kapper|test-medical|test-portfolio|test-real-estate|test-restaurant|test-store|urban-oasis|urban-sneakers|urban-soles)': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
