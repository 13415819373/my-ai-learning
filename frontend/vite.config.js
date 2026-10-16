import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // base 部署需要 不加的话，页面会空白，JS 和 CSS 报 404。
  base: '/my-ai-learning/',
  plugins: [react()],
  server: {
    port: 6100,
    proxy: {
      // 前端所有 /api 请求转发到后端，避免跨域
      '/api': {
        target: 'http://localhost:6001',
        changeOrigin: true
      }
    }
  }
})
