import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O navegador acessa /api pela mesma origem; a integração entra na P2.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: { '/api': process.env.API_PROXY_TARGET || 'http://127.0.0.1:3001' },
  },
})
