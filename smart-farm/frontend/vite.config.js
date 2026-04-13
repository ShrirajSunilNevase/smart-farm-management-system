import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    // Split large vendor bundles so browsers can cache them independently
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor':    ['react', 'react-dom', 'react-router-dom'],
          'charts-vendor':   ['recharts'],
          'icons-vendor':    ['lucide-react'],
        }
      }
    }
  },

  // In production (Vercel), relative /api/* URLs are rewritten to the
  // serverless backend automatically via vercel.json rewrites.
  // The proxy below is only used during local development.
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
