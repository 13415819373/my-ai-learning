import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getTaskDetail, submitHomework, uploadFile } from '../api'

// ============ 纯前端文本解析（不改后端）============
// 把 taskContent 里 "1. xxx 2. xxx" 的编号行拆成可勾选步骤
function parseTaskContent(content) {
  if (!content) return { intro: '', steps: [] }
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean)
  const steps = []
  const introLines = []
  const headingPattern = /^(约束规则|规则|固定流程|流程|要求|注意事项|任务描述|说明)[:：]/
  const stepPattern = /^(\d+)[.、)）]\s*(.+)/
  let foundStep = false
  for (const line of lines) {
    if (headingPattern.test(line)) continue
    const sm = line.match(stepPattern)
    if (sm) {
      foundStep = true
      steps.push({ no: Number(sm[1]), text: sm[2] })
    } else if (!foundStep) {
      introLines.push(line)
    } else if (steps.length) {
      steps[steps.length - 1].text += ' ' + line
    }
  }
  return { intro: introLines.join(' '), steps }
}

// "提示词清晰度 30 / AI缺陷识别 40" → [{name,score}]
function parseScoreRule(rule) {
  if (!rule) return []
  return rule.split('/').map(s => s.trim()).filter(Boolean).map(s => {
    const m = s.match(/^(.+?)\s*(\d+)\s*$/)
    return m ? { name: m[1].trim(), score: Number(m[2]) } : { name: s, score: null }
  })
}

// "AI对话记录 + Demo源码 + 批注" → 数组
function parseSubmitRequire(req) {
  if (!req) return []
  return req.split('+').map(s => s.trim()).filter(Boolean)
}

const AI_HINT_KEYWORDS = ['AI', '报错', '批注', '缺陷', '翻车', '胡编', '幻觉', '不准确', '编造', '排查', '优化点', '隐患', '不合理', '审核', '甄别', '检验']
function hasAiHint(text) {
  return AI_HINT_KEYWORDS.some(k => text.includes(k))
}

// 从内容关键词动态提取技能标签（非硬编码假数据）
const SKILL_RULES = [
  { kw: ['提示词'], skill: '提示词工程' },
  { kw: ['学习路线', '规划'], skill: '学习规划' },
  { kw: ['HTML', '静态页面', '表单'], skill: '前端基础' },
  { kw: ['Vue'], skill: 'Vue 开发' },
  { kw: ['接口', 'JSON', 'Spring Boot', 'Node'], skill: '后端 API' },
  { kw: ['MySQL', '建表', '增删改查', 'CRUD'], skill: '数据库' },
  { kw: ['部署', 'Vercel', 'GitHub Pages'], skill: '部署上线' },
  { kw: ['代码评审', '评审'], skill: '代码评审' },
  { kw: ['RAG', '向量', 'embedding', '检索'], skill: 'RAG 检索' },
  { kw: ['简历'], skill: '简历打磨' },
  { kw: ['面试'], skill: '面试技巧' },
  { kw: ['报错', '排查', '排错'], skill: 'Debug 排错' },
  { kw: ['缺陷', '批注', '隐患', '翻车', '甄别'], skill: 'AI 缺陷识别' }
]
function extractSkills(text) {
  const found = new Set()
  for (const { kw, skill } of SKILL_RULES) {
    if (kw.some(k => text.includes(k))) found.add(skill)
  }
  return [...found]
}

const progressKey = (taskId) => `task_progress_${taskId}`

// 颜色
const C = {
  blue: '#3b82f6',
  green: '#22c55e',
  purple: '#8b5cf6',
  text: '#1f2329',
  muted: '#8a94a6',
  border: '#e8ebf0',
  bg: '#f5f6fa',
  cardBg: '#fff'
}

export default function TaskDetail() {
  const { taskId } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  const [aiDialog, setAiDialog] = useState('')
  const [files, setFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [checked, setChecked] = useState([])

  useEffect(() => {
    getTaskDetail(taskId)
      .then((res) => {
        setDetail(res.data)
        try {
          const saved = JSON.parse(localStorage.getItem(progressKey(taskId)) || '[]')
          setChecked(Array.isArray(saved) ? saved : [])
        } catch {
          setChecked([])
        }
      })
      .catch((err) => alert(err.message))
      .finally(() => setLoading(false))
  }, [taskId])

  const toggleStep = (idx) => {
    setChecked(prev => {
      const next = prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
      localStorage.setItem(progressKey(taskId), JSON.stringify(next))
      return next
    })
  }

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
  const { intro, steps } = parseTaskContent(task.taskContent)
  const scoreItems = parseScoreRule(task.scoreRule)
  const submitItems = parseSubmitRequire(task.submitRequire)
  const skills = extractSkills(task.taskContent + ' ' + task.taskTitle)

  const doneCount = checked.length
  const totalCount = steps.length
  const progress = totalCount ? Math.round(doneCount / totalCount * 100) : 0
  const allDone = totalCount > 0 && doneCount === totalCount

  return (
    <div>
      <Link to="#" onClick={() => navigate(-1)} className="muted" style={{ display: 'inline-block', marginBottom: 12 }}>
        ← 返回
      </Link>

      {/* 任务头部 */}
      <div className="card" style={{ marginBottom: 16, borderLeft: `4px solid ${C.blue}`, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            background: '#eff6ff', color: C.blue, fontSize: 12, fontWeight: 600,
            padding: '3px 10px', borderRadius: 12
          }}>{stage}</span>
          <span style={{
            background: '#f5f3ff', color: C.purple, fontSize: 12, fontWeight: 600,
            padding: '3px 10px', borderRadius: 12
          }}>作品可写简历</span>
        </div>
        <h2 style={{ marginBottom: intro ? 8 : 0, fontSize: 22, lineHeight: 1.35 }}>{task.taskTitle}</h2>
        {intro && <p style={{ color: '#475467', fontSize: 14, lineHeight: 1.7 }}>{intro}</p>}

        {/* 进度条 */}
        {totalCount > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: C.muted }}>实战进度</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: allDone ? C.green : C.blue }}>
                {doneCount}/{totalCount} · {progress}%
              </span>
            </div>
            <div style={{ height: 8, background: '#eef0f4', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: allDone ? C.green : C.blue,
                borderRadius: 99,
                transition: 'width .35s ease'
              }} />
            </div>
          </div>
        )}
      </div>

      {/* 勋章解锁提示 */}
      {allDone && (
        <div className="card" style={{
          marginBottom: 16, textAlign: 'center',
          background: 'linear-gradient(135deg,#fffbeb,#fef3c7)',
          border: '1px solid #fde68a'
        }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>🏆</div>
          <div style={{ fontWeight: 700, color: '#92400e', marginBottom: 2 }}>任务达成</div>
          <div style={{ fontSize: 13, color: '#b45309' }}>所有实战步骤已完成，可提交作业解锁勋章</div>
        </div>
      )}

      {/* 实战步骤 */}
      {totalCount > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            实战步骤
            <span style={{ fontSize: 12, color: C.muted, fontWeight: 400 }}>（点一下勾选，进度自动保存）</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {steps.map((s, idx) => {
              const done = checked.includes(idx)
              const aiHit = hasAiHint(s.text)
              return (
                <div key={idx} onClick={() => toggleStep(idx)} style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                  background: done ? '#f0fdf4' : C.bg,
                  border: `1px solid ${done ? '#bbf7d0' : 'transparent'}`,
                  transition: 'all .2s'
                }}>
                  <span style={{
                    flexShrink: 0, width: 24, height: 24, borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700,
                    background: done ? C.green : C.blue, color: '#fff',
                    transition: 'background .2s'
                  }}>{done ? '✓' : s.no}</span>
                  <span style={{
                    fontSize: 14, lineHeight: 1.6, flex: 1, color: done ? C.muted : C.text,
                    textDecoration: done ? 'line-through' : 'none'
                  }}>{s.text}</span>
                  {aiHit && (
                    <span style={{
                      flexShrink: 0, fontSize: 11, fontWeight: 600, color: C.purple,
                      background: '#f5f3ff', padding: '2px 8px', borderRadius: 10,
                      whiteSpace: 'nowrap'
                    }}>AI 协作点</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 评分标准 */}
      {scoreItems.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>评分标准</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {scoreItems.map((it, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8,
                background: C.bg, border: `1px solid ${C.border}`, fontSize: 13
              }}>
                <span style={{ color: '#475467' }}>{it.name}</span>
                {it.score != null && (
                  <span style={{ color: C.blue, fontWeight: 700 }}>{it.score}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 提交物清单 */}
      {submitItems.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>提交物清单</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {submitItems.map((it, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                <span style={{ color: C.blue, fontWeight: 700 }}>▢</span>
                <span>{it}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 解锁技能 */}
      {skills.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            完成可解锁技能
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {skills.map((sk, i) => {
              const unlocked = allDone
              return (
                <span key={i} style={{
                  fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 10,
                  background: unlocked ? '#ecfdf5' : C.bg,
                  color: unlocked ? '#047857' : C.muted,
                  border: `1px solid ${unlocked ? '#a7f3d0' : C.border}`
                }}>{unlocked ? '★ ' : ''}{sk}</span>
              )
            })}
          </div>
        </div>
      )}

      {/* 参考微课 */}
      {resources?.length > 0 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, marginBottom: 8 }}>相关参考微课</h3>
          <p className="muted" style={{ marginBottom: 10 }}>按需查阅，不是主课程</p>
          {resources.map((r) => (
            <div key={r.id} style={{ padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontWeight: 500 }}>· {r.title}</span>
              {r.description && <span className="muted">（{r.description}）</span>}
            </div>
          ))}
        </div>
      )}

      {/* 提交作业 */}
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
            <ul style={{ marginTop: 8, fontSize: 13, color: C.blue }}>
              {files.map((f, i) => (
                <li key={i}>{f.name}</li>
              ))}
            </ul>
          )}
        </div>

        <button className="btn" onClick={handleSubmit} disabled={submitting} style={{ width: '100%' }}>
          {submitting ? '提交中...' : '提交作业'}
        </button>
      </div>
    </div>
  )
}
