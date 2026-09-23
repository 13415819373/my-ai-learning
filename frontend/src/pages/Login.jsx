import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { setAuth } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login(username, password)
      setAuth(res.data.token, res.data.user)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="card"
        style={{ width: 380, padding: 32 }}
      >
        <h2 style={{ marginBottom: 4, textAlign: 'center' }}>AI 自学实训平台</h2>
        <p className="muted" style={{ textAlign: 'center', marginBottom: 24 }}>
          训练驾驭 AI 自学新领域的能力
        </p>

        <div className="form-item">
          <label className="label">账号</label>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="请输入账号"
            required
          />
        </div>

        <div className="form-item">
          <label className="label">密码</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            required
          />
        </div>

        {error && <p className="err">{error}</p>}

        <button className="btn" type="submit" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
          {loading ? '登录中...' : '登录'}
        </button>

        <p className="muted" style={{ marginTop: 16, textAlign: 'center' }}>
          演示账号：admin / teacher / student，密码均为 123456
        </p>
      </form>
    </div>
  )
}
