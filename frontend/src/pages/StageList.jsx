import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStages, sendEmail, fetchGitHubRepo, fetchGitHubFile } from '../api'

// 卖点标签：根据阶段序号匹配
const STAGE_TAGS = ['目标拆解', '分模块自学', '端到端实战', '求职复盘']

export default function StageList() {
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [mailMsg, setMailMsg] = useState('')
  const [ghUrl, setGhUrl] = useState('')
  const [ghMsg, setGhMsg] = useState('')
  const [ghBranch, setGhBranch] = useState('')
  const [ghFiles, setGhFiles] = useState([])
  const [ghCurFile, setGhCurFile] = useState('')
  const [ghContent, setGhContent] = useState('')
  const [ghLoadingFile, setGhLoadingFile] = useState(false)

  useEffect(() => {
    getStages()
      .then((res) => setStages(res.data))
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false))
  }, [])

  // 发验证码邮件：调后端 MailController -> Resend
  const sendMail = async () => {
    const to = email.trim()
    if (!to) { alert('请输入邮箱'); return }
    setMailMsg('发送中...')
    try {
      const res = await sendEmail(to)
      setMailMsg(`发送成功！验证码：${res.data.code}（已发到 ${to}）`)
    } catch (err) {
      setMailMsg('发送失败：' + err.message)
    }
  }

  // 读取 GitHub 公开仓库：调后端 GitHubController -> GitHub API
  const loadRepo = async () => {
    const url = ghUrl.trim()
    if (!url) { alert('请输入 GitHub 仓库地址'); return }
    setGhMsg('读取中...')
    setGhFiles([])
    try {
      const res = await fetchGitHubRepo(url)
      setGhBranch(res.data.branch)
      // tree 是 JSON 字符串，解析出文件列表
      const treeJson = JSON.parse(res.data.tree)
      const files = (treeJson.tree || []).filter((f) => f.type === 'blob')
      setGhFiles(files)
      setGhMsg(`成功！共 ${files.length} 个文件（分支 ${res.data.branch}）`)
      setGhCurFile(''); setGhContent('')
    } catch (err) {
      setGhMsg('读取失败：' + err.message)
    }
  }

  // 点击某个文件，读它的内容
  const openFile = async (path) => {
    setGhCurFile(path); setGhContent(''); setGhLoadingFile(true)
    try {
      const res = await fetchGitHubFile(ghUrl.trim(), path)
      // 内容 base64 解码为文本
      const text = decodeURIComponent(escape(atob(res.data.content)))
      setGhContent(text)
    } catch (err) {
      setGhContent('读取失败：' + err.message)
    } finally {
      setGhLoadingFile(false)
    }
  }

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

      {/* 发邮件测试区（练手用） */}
      <div className="card" style={{ marginTop: 20, padding: 20 }}>
        <h3 style={{ marginBottom: 10, fontSize: 16 }}>📧 发送验证码邮件（测试 Resend）</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="输入收件邮箱"
            style={{ flex: 1, minWidth: 220, padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc' }}
          />
          <button className="btn" onClick={sendMail}>发送验证码</button>
        </div>
        {mailMsg && <p style={{ marginTop: 10, fontSize: 13, color: '#475569' }}>{mailMsg}</p>}
      </div>

      {/* 读取 GitHub 仓库测试区（练手用） */}
      <div className="card" style={{ marginTop: 16, padding: 20 }}>
        <h3 style={{ marginBottom: 10, fontSize: 16 }}>🐙 读取 GitHub 公开仓库（测试）</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={ghUrl}
            onChange={(e) => setGhUrl(e.target.value)}
            placeholder="https://github.com/用户名/仓库名"
            style={{ flex: 1, minWidth: 220, padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc' }}
          />
          <button className="btn" onClick={loadRepo}>读取仓库</button>
        </div>
        {ghMsg && <p style={{ marginTop: 10, fontSize: 13, color: '#475569' }}>{ghMsg}</p>}
        {ghFiles.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
            <div style={{ flex: '0 0 260px', maxHeight: 240, overflow: 'auto', border: '1px solid #e2e8f0', borderRadius: 6, padding: 8 }}>
              {ghFiles.slice(0, 50).map((f, i) => (
                <div
                  key={i}
                  onClick={() => openFile(f.path)}
                  style={{ fontSize: 12, padding: '4px 6px', cursor: 'pointer', borderRadius: 4, fontFamily: 'monospace' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                >{f.path}</div>
              ))}
              {ghFiles.length > 50 && <p className="muted" style={{ fontSize: 12 }}>… 共 {ghFiles.length} 个，仅显示前 50</p>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {ghLoadingFile && <p className="muted" style={{ fontSize: 12 }}>读取中...</p>}
              {ghContent && (
                <pre style={{
                  fontSize: 12, background: '#0f172a', color: '#e2e8f0', padding: 12,
                  borderRadius: 6, overflow: 'auto', maxHeight: 320, margin: 0, fontFamily: 'monospace'
                }}>{ghContent}</pre>
              )}
              {ghCurFile && !ghContent && !ghLoadingFile && <p className="muted" style={{ fontSize: 12 }}>{ghCurFile}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
