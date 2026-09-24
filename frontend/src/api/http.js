import axios from 'axios'

const http = axios.create({
  baseURL: '/api',
  timeout: 30000
})

// 请求拦截：自动带上 token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截：统一处理错误码
http.interceptors.response.use(
  (res) => {
    const body = res.data
    if (body && body.code !== undefined && body.code !== 200) {
      // 业务层错误（如 500、401 等）
      if (body.code === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
      return Promise.reject(new Error(body.message || '请求失败'))
    }
    return body
  },
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // 跳转到登录页（避免在非浏览器环境报错）
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    const msg = err.response?.data?.message || err.message || '请求失败'
    return Promise.reject(new Error(msg))
  }
)

export default http
