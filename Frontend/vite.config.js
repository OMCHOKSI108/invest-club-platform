import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),
  react()],
  server: {
    proxy: {
      '/api/stock': {
        target: 'https://fastapi-stock-data.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stock/, '')
      }
    }
  }
})
