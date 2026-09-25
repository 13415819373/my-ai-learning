import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStages } from '../api'

// 卖点标签：根据阶段序号匹配
const STAGE_TAGS = ['目标拆解', '分模块自学', '端到端实战', '求职复盘']

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
      {/* 卖点 Banner */}
      <div className="card" style={{
        marginBottom: 20, padding: 24,
        background: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
        border: '1px solid #bfdbfe'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            background: '#3b82f6', color: '#fff', fontSize: 11, fontWeight: 700,
            padding: '2px 8px', borderRadius: 10, letterSpacing: 1
          }}>面向学校</span>
          <span style={{ fontSize: 13, color: '#1e40af' }}>课程老旧 · 课时不够？用它补</span>
        </div>
        <h2 style={{ fontSize: 20, marginBottom: 8, color: '#1e3a8a' }}>
          不是教你用 AI，而是教你「用 AI 自学」
        </h2>
        <p style={{ fontSize: 14, color: '#3730a3', lineHeight: 1.7 }}>
          学生在每个任务里被迫先独立思考、再向 AI 提问、再找出 AI 的错误——
          每提交一次作业，都留下一份可写进简历的作品与技能图谱。
        </p>
        <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: '#1e40af' }}>✓ 全程 AI 协作留痕</span>
          <span style={{ fontSize: 13, color: '#1e40af' }}>✓ 作品可写简历</span>
          <span style={{ fontSize: 13, color: '#1e40af' }}>✓ 技能点亮可视化</span>
        </div>
      </div>

      <h2 style={{ marginBottom: 14 }}>实训路线</h2>

      {stages.map((stage, idx) => (
        <Link
          key={stage.id}
          to={`/stage/${stage.id}/tasks`}
          className="card"
          style={{
            display: 'block', marginBottom: 14, cursor: 'pointer',
            borderLeft: '4px solid #3b82f6',
            transition: 'box-shadow .2s, transform .2s'
          }}
        >
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <span style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: 8,
              background: '#eff6ff', color: '#3b82f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700
            }}>
              {stage.sort}
            </span>
            <div style={{ flex: 1 }}>
              <h3 style={{ marginBottom: 6, fontSize: 16 }}>{stage.stageName}</h3>
              <p className="muted" style={{ marginBottom: 10 }}>{stage.description}</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#8b5cf6', background: '#f5f3ff', padding: '2px 8px', borderRadius: 10 }}>
                  {STAGE_TAGS[idx] || ''}
                </span>
              </div>
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
