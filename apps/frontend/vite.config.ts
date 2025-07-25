import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/DilSeDaan-Block-Chain/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          blockchain: ['web3', 'ethers'],
          ui: ['lucide-react', 'framer-motion'],
          charts: ['recharts'],
          utils: ['lodash', 'date-fns', 'clsx', 'tailwind-merge']
        }
      }
    }
  },
  define: {
    global: 'globalThis',
  }
})