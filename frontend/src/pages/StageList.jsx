import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStages } from '../api'

export default function StageList() {
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStages()
      .then((res) => setStages(res.data))
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="muted">加载中...</p>

  return (
    <div>
      <h2 style={{ marginBottom: 8 }}>实训中心</h2>
      <p className="muted" style={{ marginBottom: 20 }}>
        以「借助 AI 自学全栈」为练习载体，训练一套可持续复用的 AI 协作自学工作流
      </p>

      {stages.map((stage) => (
        <Link
          key={stage.id}
          to={`/stage/${stage.id}/tasks`}
          className="card"
          style={{
            display: 'block',
            marginBottom: 14,
            transition: 'box-shadow 0.2s',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ marginBottom: 6 }}>{stage.stageName}</h3>
              <p className="muted">{stage.description}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span className="btn btn-outline" style={{ padding: '4px 12px' }}>
                {stage.taskCount} 个任务 →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
