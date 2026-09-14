import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // In production the frontend is served by FastAPI from the same origin,
  // so API calls use relative URLs (VITE_API_URL="").
  // In development the Vite proxy forwards /api/* to localhost:8000.
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    // Output directly into the backend static folder so Docker COPY picks it up
    outDir: path.resolve(__dirname, '../backend/app/static'),
    emptyOutDir: true,
  },
}))
