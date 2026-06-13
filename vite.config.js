import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/kalshi-api': {
        target: 'https://external-api.kalshi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kalshi-api/, '/trade-api/v2'),
      },
      '/espn-api': {
        target: 'https://site.api.espn.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/espn-api/, ''),
      },
    },
  },
})
