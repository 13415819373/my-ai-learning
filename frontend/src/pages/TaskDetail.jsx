import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getTaskDetail, submitHomework, uploadFile } from '../api'

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 16, marginBottom: 10, color: '#1f2329' }}>{title}</h3>
      {children}
    </div>
  )
}

export default function TaskDetail() {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  // 提交表单
  const [aiDialog, setAiDialog] = useState('')
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getTaskDetail(taskId)
      .then((res) => setDetail(res.data))
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false))
  }, [taskId])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await uploadFile(file)
      setFiles((prev) => [...prev, res.data])
      alert(`已上传：${res.data.name}`)
    } catch (err) {
      alert(err.message)
    } finally {
      e.target.value = ''
    }
  }

  const handleSubmit = async () => {
    if (!aiDialog.trim() && files.length === 0) {
      alert('请至少粘贴 AI 对话记录或上传文件')
      return
    }
    setSubmitting(true)
    try {
      await submitHomework({
        taskId: Number(taskId),
        aiDialog,
        fileUrls: files.map((f) => f.url)
      })
      alert('提交成功！')
      navigate('/homeworks')
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <p className="muted">加载中...</p>
  if (!detail) return <p className="muted">任务不存在</p>

  const { task, stage, resources } = detail

  return (
    <div>
      <Link to="#" onClick={() => navigate(-1)} className="muted" style={{ display: 'inline-block', marginBottom: 12 }}>
        ← 返回
      </Link>

      <div className="card" style={{ marginBottom: 16 }}>
        <span className="muted" style={{ marginRight: 8 }}>{stage}</span>
        <h2 style={{ marginBottom: 12 }}>{task.taskTitle}</h2>

        <Section title="任务描述与约束规则">
          <div style={{ whiteSpace: 'pre-wrap', color: '#333' }}>{task.taskContent}</div>
        </Section>

        <Section title="提交物清单">
          <div style={{ whiteSpace: 'pre-wrap', color: '#333' }}>{task.submitRequire}</div>
        </Section>

        <Section title="评分标准">
          <div style={{ whiteSpace: 'pre-wrap', color: '#333' }}>{task.scoreRule}</div>
        </Section>

        {resources?.length > 0 && (
          <Section title="相关参考微课（按需查阅，不是主课程）">
            {resources.map((r) => (
              <div key={r.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f1f5' }}>
                <span style={{ fontWeight: 500 }}>· {r.title}</span>
                {r.description && <span className="muted">（{r.description}）</span>}
              </div>
            ))}
          </Section>
        )}
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, marginBottom: 16 }}>提交作业</h3>

        <div className="form-item">
          <label className="label">粘贴 AI 对话记录</label>
          <textarea
            className="textarea"
            value={aiDialog}
            onChange={(e) => setAiDialog(e.target.value)}
            placeholder="请粘贴你和 AI 的完整对话过程（平台重点考察：是否先独立思考、提示词是否精准、能否识别 AI 的错误）"
          />
        </div>

        <div className="form-item">
          <label className="label">上传文件（代码、文档、截图等）</label>
          <input type="file" onChange={handleUpload} style={{ fontSize: 13 }} />
          {files.length > 0 && (
            <ul style={{ marginTop: 8, fontSize: 13, color: '#3b82f6' }}>
              {files.map((f, i) => (
                <li key={i}>{f.name}</li>
              ))}
            </ul>
          )}
        </div>

        <button className="btn" onClick={handleSubmit} disabled={submitting}>
          {submitting ? '提交中...' : '提交作业'}
        </button>
      </div>
    </div>
  )
}
