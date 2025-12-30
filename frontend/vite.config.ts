import { defineConfig } from 'vite'
import reactswc from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactswc(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // The backend server
        changeOrigin: false, // Preserve the original Host header
        secure: false,
      },
    }
  }
})
