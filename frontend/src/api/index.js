import http from './http'

// 认证
export const login = (username, password) => http.post('/auth/login', { username, password })
export const register = (username, password) => http.post('/auth/register', { username, password })
export const me = () => http.get('/auth/me')

// 阶段与任务
export const getStages = () => http.get('/stage/list')
export const getTasks = (stageId) => http.get('/task/list', { params: { stageId } })
export const getTaskDetail = (id) => http.get(`/task/${id}`)

// 作业
export const submitHomework = (data) => http.post('/homework/submit', data)
export const getMyHomeworks = () => http.get('/homework/my')
export const listHomeworks = (status) => http.get('/homework/list', { params: { status } })
export const reviewHomework = (data) => http.post('/homework/review', data)

// 文件上传
export const uploadFile = (file) => {
  const form = new FormData()
  form.append('file', file)
  return http.post('/file/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
