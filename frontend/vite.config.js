import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 6000,
    proxy: {
      // 前端所有 /api 请求转发到后端，避免跨域
      '/api': {
        target: 'http://localhost:6001',
        changeOrigin: true
      }
    }
  }
})
