import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout, isTeacher } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div>
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid #e8ebf0',
          padding: '0 24px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <span style={{ fontWeight: 700, fontSize: 17 }}>AI 自学实训平台</span>
          <nav style={{ display: 'flex', gap: 16, fontSize: 14 }}>
            <Link to="/">实训中心</Link>
            <Link to="/homeworks">我的作业</Link>
            {isTeacher && <Link to="/review">作业批改</Link>}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14 }}>
            {user?.nickname}（{user?.role === 'admin' ? '管理员' : user?.role === 'teacher' ? '导师' : '学员'}）
          </span>
          <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '4px 12px' }}>
            退出
          </button>
        </div>
      </header>
      <main style={{ maxWidth: 960, margin: '24px auto', padding: '0 16px' }}>
        <Outlet />
      </main>
    </div>
  )
}
