import { useEffect, useState } from 'react'
import { listHomeworks, reviewHomework } from '../api'

function statusBadge(status) {
  return status === 'reviewed'
    ? <span style={{ background: '#d1fae5', color: '#065f46', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>已批改</span>
    : <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>待批改</span>
}

export default function ReviewList() {
  const [status, setStatus] = useState('')
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null) // 当前展开批改的作业

  const load = (s) => {
    setLoading(true)
    listHomeworks(s)
      .then((res) => setList(res.data))
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleReview = async (hwId) => {
    const item = list.find((x) => x.homework.id === hwId)
    if (!item) return
    const review = item.review
    const score = window.prompt('请输入分数（0-100）：', review?.score ?? '80')
    if (score === null) return
    const comment = window.prompt('请输入评语：', review?.comment ?? '')
    if (comment === null) return

    try {
      await reviewHomework({ homeworkId: hwId, score: Number(score), comment })
      alert('批改成功！')
      setActive(null)
      load(status)
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>作业批改</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn ${!status ? '' : 'btn-outline'}`} onClick={() => { setStatus(''); load('') }}>
            全部
          </button>
          <button className={`btn ${status === 'pending' ? '' : 'btn-outline'}`} onClick={() => { setStatus('pending'); load('pending') }}>
            待批改
          </button>
          <button className={`btn ${status === 'reviewed' ? '' : 'btn-outline'}`} onClick={() => { setStatus('reviewed'); load('reviewed') }}>
            已批改
          </button>
        </div>
      </div>

      {loading && <p className="muted">加载中...</p>}
      {!loading && list.length === 0 && <p className="muted">暂无作业</p>}

      {list.map((item) => {
        const hw = item.homework
        const review = item.review
        const isActive = active === hw.id
        return (
          <div className="card" key={hw.id} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{item.taskTitle}</strong>
                <div className="muted" style={{ marginTop: 2 }}>
                  学生：{item.studentName} · {item.stageName}
                </div>
              </div>
              {statusBadge(hw.status)}
            </div>

            {isActive && (
              <div style={{ marginTop: 14, background: '#f8fafc', borderRadius: 8, padding: 14 }}>
                <p className="label">AI 对话记录</p>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    fontSize: 13,
                    background: '#fff',
                    border: '1px solid #eee',
                    borderRadius: 6,
                    padding: 10,
                    marginBottom: 10,
                    maxHeight: 220,
                    overflow: 'auto'
                  }}
                >
                  {hw.aiDialog || '（无文本，仅有上传文件）'}
                </pre>
                {hw.fileUrls && (
                  <p className="muted" style={{ marginBottom: 10 }}>
                    附件：{hw.fileUrls.split(',').map((u) => <a key={u} href={u} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', marginRight: 8 }}>下载</a>)}
                  </p>
                )}
                {review && (
                  <p style={{ fontSize: 14 }}>
                    当前得分：<strong style={{ color: '#3b82f6' }}>{review.score}</strong> · 评语：{review.comment}
                  </p>
                )}
                <button className="btn" onClick={() => handleReview(hw.id)} style={{ marginTop: 8 }}>
                  {review ? '重新批改' : '去批改'}
                </button>
              </div>
            )}

            <button
              className="btn btn-outline"
              onClick={() => setActive(isActive ? null : hw.id)}
              style={{ marginTop: 10, padding: '4px 12px' }}
            >
              {isActive ? '收起' : '查看并批改'}
            </button>
          </div>
        )
      })}
    </div>
  )
}
