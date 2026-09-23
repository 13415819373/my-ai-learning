import { useEffect, useState } from 'react'
import { getMyHomeworks } from '../api'

function statusBadge(status) {
  return status === 'reviewed'
    ? <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>已批改</span>
    : <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>待批改</span>
}

export default function MyHomeworks() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyHomeworks()
      .then((res) => setList(res.data))
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="muted">加载中...</p>

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>我的作业</h2>

      {list.length === 0 && <p className="muted">还没有提交过作业</p>}

      {list.map((item) => {
        const hw = item.homework
        const review = item.review
        return (
          <div className="card" key={hw.id} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <strong>{item.taskTitle}</strong>
                <span className="muted" style={{ marginLeft: 10 }}>{item.stageName}</span>
              </div>
              {statusBadge(hw.status)}
            </div>
            <p className="muted" style={{ marginBottom: 6 }}>
              提交时间：{new Date(hw.submitTime).toLocaleString('zh-CN')}
            </p>
            {review && (
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 12, marginTop: 8 }}>
                <div style={{ marginBottom: 4 }}>
                  得分：<strong style={{ color: '#3b82f6' }}>{review.score}</strong> / 100
                </div>
                {review.comment && <p style={{ fontSize: 14 }}>导师评语：{review.comment}</p>}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
