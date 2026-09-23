import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import StageList from './pages/StageList'
import TaskList from './pages/TaskList'
import TaskDetail from './pages/TaskDetail'
import MyHomeworks from './pages/MyHomeworks'
import ReviewList from './pages/ReviewList'
import Layout from './components/Layout'

function RequireAuth({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

function RequireTeacher({ children }) {
  const { isTeacher } = useAuth()
  if (!isTeacher) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<RequireAuth><StageList /></RequireAuth>} />
          <Route path="/stage/:stageId/tasks" element={<RequireAuth><TaskList /></RequireAuth>} />
          <Route path="/task/:taskId" element={<RequireAuth><TaskDetail /></RequireAuth>} />
          <Route path="/homeworks" element={<RequireAuth><MyHomeworks /></RequireAuth>} />
          <Route path="/review" element={<RequireTeacher><ReviewList /></RequireTeacher>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
