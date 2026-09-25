import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getTasks } from '../api'

// 从纯文本任务内容提取一句预览 + 步骤数
function previewContent(content) {
  if (!content) return { summary: '', stepCount: 0 }
  const firstLine = content.split('\n').map(l => l.trim()).find(Boolean) || ''
  const stepCount = (content.match(/^\s*\d+\./gm) || []).length
  return { summary: firstLine.length > 48 ? firstLine.slice(0, 48) + '…' : firstLine, stepCount }
}

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

      {tasks.map((task, idx) => {
        const { summary, stepCount } = previewContent(task.taskContent)
        return (
          <Link
            key={task.id}
            to={`/task/${task.id}`}
            className="card"
            style={{
              display: 'block', marginBottom: 12, cursor: 'pointer',
              borderLeft: '3px solid #3b82f6',
              transition: 'box-shadow .2s, transform .2s'
            }}
          >
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <span style={{
                background: '#3b82f6', color: '#fff',
                width: 32, height: 32, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, flexShrink: 0
              }}>
                {idx + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{task.taskTitle}</div>
                {summary && (
                  <div style={{ fontSize: 13, color: '#8a94a6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {summary}
                  </div>
                )}
                {stepCount > 0 && (
                  <span style={{ fontSize: 12, color: '#3b82f6', marginTop: 4, display: 'inline-block' }}>
                    {stepCount} 个实战步骤
                  </span>
                )}
              </div>
              <span style={{ color: '#8a94a6', fontSize: 18, flexShrink: 0 }}>›</span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
