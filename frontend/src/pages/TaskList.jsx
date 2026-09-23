import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTasks } from '../api'

export default function TaskList() {
  const { stageId } = useParams()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTasks(stageId)
      .then((res) => setTasks(res.data))
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false))
  }, [stageId])

  if (loading) return <p className="muted">加载中...</p>

  return (
    <div>
      <Link to="/" className="muted" style={{ display: 'inline-block', marginBottom: 12 }}>
        ← 返回实训中心
      </Link>
      <h2 style={{ marginBottom: 16 }}>本阶段任务</h2>

      {tasks.length === 0 && <p className="muted">该阶段暂无任务</p>}

      {tasks.map((task, idx) => (
        <Link
          key={task.id}
          to={`/task/${task.id}`}
          className="card"
          style={{ display: 'block', marginBottom: 12, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span
              style={{
                background: '#3b82f6',
                color: '#fff',
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                flexShrink: 0
              }}
            >
              {idx + 1}
            </span>
            <span style={{ fontWeight: 600 }}>{task.taskTitle}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
