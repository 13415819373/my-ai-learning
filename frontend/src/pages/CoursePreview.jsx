import { useState } from 'react'
import { aiRobotCourse } from '../mock/aiRobotCourse'

// 解析纯文本里的编号行成步骤；"验收："行单独存为该步验收点
// 支持 ```代码块```：紧跟在某步骤后的代码块会附加到该步骤的 code 字段
function parseSteps(content) {
  if (!content) return { intro: '', steps: [] }
  const lines = content.split('\n')
  const steps = []
  const introLines = []
  const heading = /^(目标|怎么动手|做完你会看到|不懂的概念|AI 协作训练点)[:：]/
  const stepRe = /^(\d+)[.、)）]\s*(.+)/
  const checkRe = /^验收[:：]\s*(.+)/
  const assetRe = /^下载[:：]\s*(.+)/
  let found = false
  let inCode = false
  let codeBuf = []
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const line = raw.trim()
    if (line.startsWith('```')) {
      if (inCode) {
        if (steps.length) steps[steps.length - 1].code = (steps[steps.length - 1].code || '') + codeBuf.join('\n')
        inCode = false; codeBuf = []
      } else { inCode = true; codeBuf = [] }
      continue
    }
    if (inCode) { codeBuf.push(raw); continue }
    if (!line) continue
    if (heading.test(line)) continue
    const m = line.match(stepRe)
    if (m) { found = true; steps.push({ no: Number(m[1]), text: m[2], check: '', code: '', asset: '' }) }
    else if (!found) introLines.push(line)
    else if (steps.length) {
      const cm = line.match(checkRe)
      if (cm) {
        steps[steps.length - 1].check += (steps[steps.length - 1].check ? '\n' : '') + cm[1]
      } else {
        const am = line.match(assetRe)
        if (am) steps[steps.length - 1].asset = am[1].trim()
        else if (steps[steps.length - 1].check) {
          // 已有验收内容，后续行追加到验收框（支持多行验收，如正向/负向分支列表）
          steps[steps.length - 1].check += '\n' + line
        } else {
          steps[steps.length - 1].text += ' ' + line
        }
      }
    }
  }
  return { intro: introLines.join(' '), steps }
}
function parseScore(rule) {
  if (!rule) return []
  return rule.split('/').map(s => s.trim()).filter(Boolean).map(s => {
    const m = s.match(/^(.+?)\s*(\d+)\s*$/)
    return m ? { name: m[1].trim(), score: Number(m[2]) } : { name: s, score: null }
  })
}
function parseSubmit(req) {
  if (!req) return []
  return req.split('+').map(s => s.trim()).filter(Boolean)
}
const AI_KW = ['AI', '报错', '批注', '缺陷', '翻车', '胡编', '幻觉', '排查', '优化点', '隐患', '不合理', '审核', '甄别']
const hasAi = t => AI_KW.some(k => t.includes(k))

const C = { blue: '#3b82f6', green: '#22c55e', purple: '#8b5cf6', text: '#1f2329', muted: '#8a94a6', border: '#e8ebf0', bg: '#f5f6fa' }

export default function CoursePreview() {
  const [open, setOpen] = useState(1) // 默认展开第1步
  const [checked, setChecked] = useState({}) // { stepNo: [idx...] }
  const pk = n => `preview_step_${n}`

  const toggleStep = (stepNo, idx) => {
    setChecked(prev => {
      const cur = prev[stepNo] || (JSON.parse(localStorage.getItem(pk(stepNo)) || '[]'))
      const next = cur.includes(idx) ? cur.filter(i => i !== idx) : [...cur, idx]
      localStorage.setItem(pk(stepNo), JSON.stringify(next))
      return { ...prev, [stepNo]: next }
    })
  }
  const getChecked = stepNo => checked[stepNo] || (JSON.parse(localStorage.getItem(pk(stepNo)) || '[]'))
  const [copied, setCopied] = useState('')
  const copyCode = (code, key) => {
    navigator.clipboard.writeText(code)
    setCopied(key)
    setTimeout(() => setCopied(''), 1500)
  }

  // 整个项目总进度（跨 5 步所有步骤）
  let totalSteps = 0, doneSteps = 0
  aiRobotCourse.steps.forEach(s => {
    const { steps } = parseSteps(s.content)
    totalSteps += steps.length
    doneSteps += getChecked(s.no).length
  })
  const totalProg = totalSteps ? Math.round(doneSteps / totalSteps * 100) : 0

  return (
    <div>
      <div style={{ marginBottom: 12, fontSize: 13, color: C.muted }}>← 课程预览（mock 数据，确认样子后补到后端）</div>

      {/* 课程 banner */}
      <div className="card" style={{
        marginBottom: 16, padding: 24,
        background: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '1px solid #bfdbfe'
      }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
          <span style={{ background: '#3b82f6', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>5 步造一个</span>
          <span style={{ fontSize: 13, color: '#1e40af' }}>做完能写进简历</span>
        </div>
        <h2 style={{ fontSize: 22, marginBottom: 6, color: '#1e3a8a' }}>{aiRobotCourse.title}</h2>
        <p style={{ fontSize: 14, color: '#3730a3' }}>{aiRobotCourse.subtitle}</p>
      </div>

      {/* 总进度条 */}
      <div className="card" style={{ marginBottom: 16, padding: '14px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: C.muted }}>整个项目进度</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: totalProg === 100 ? C.green : C.blue }}>
            {doneSteps}/{totalSteps} 步 · {totalProg}%
          </span>
        </div>
        <div style={{ height: 8, background: '#eef0f4', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${totalProg}%`, background: totalProg === 100 ? C.green : C.blue, borderRadius: 99, transition: 'width .35s ease' }} />
        </div>
        {totalProg === 100 && <div style={{ marginTop: 8, fontSize: 13, color: C.green, fontWeight: 600 }}>🎉 全部完成！可以提交项目代码了</div>}
      </div>

      {/* 5 步手风琴 */}
      {aiRobotCourse.steps.map((s) => {
        const isOpen = open === s.no
        const { intro, steps } = parseSteps(s.content)
        const scoreItems = parseScore(s.score)
        const submitItems = parseSubmit(s.submit)
        const ck = getChecked(s.no)
        const done = ck.length
        const total = steps.length
        const prog = total ? Math.round(done / total * 100) : 0
        const allDone = total > 0 && done === total
        return (
          <div key={s.no} className="card" style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>
            {/* 步骤头 */}
            <div
              data-acc={s.no}
              onClick={() => {
                const willOpen = !isOpen
                setOpen(willOpen ? s.no : null)
                if (willOpen) setTimeout(() => {
                  document.querySelector(`[data-acc="${s.no}"]`)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
                }, 80)
              }}
              style={{
                display: 'flex', gap: 14, alignItems: 'center', padding: '16px 20px',
                cursor: 'pointer', background: isOpen ? '#eff6ff' : '#fff',
                borderBottom: isOpen ? `1px solid ${C.border}` : 'none'
              }}
            >
              <span style={{
                flexShrink: 0, width: 32, height: 32, borderRadius: 8,
                background: allDone ? C.green : C.blue, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700
              }}>{allDone ? '✓' : s.no}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{s.stageName}{total > 0 && ` · ${total} 个实战步骤`}</div>
              </div>
              {total > 0 && (
                <span style={{ fontSize: 12, fontWeight: 600, color: allDone ? C.green : C.blue }}>
                  {done}/{total}
                </span>
              )}
              <span style={{ color: C.muted, fontSize: 18 }}>{isOpen ? '▾' : '▸'}</span>
            </div>

            {/* 展开内容 */}
            {isOpen && (
              <div style={{ padding: 20 }}>
                {intro && <p style={{ color: '#475467', fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>{intro}</p>}

                {total > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: C.muted }}>实战步骤（点一下勾选，自动保存）</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: allDone ? C.green : C.blue }}>{prog}%</span>
                    </div>
                    <div style={{ height: 6, background: '#eef0f4', borderRadius: 99, overflow: 'hidden', marginBottom: 14 }}>
                      <div style={{ height: '100%', width: `${prog}%`, background: allDone ? C.green : C.blue, borderRadius: 99, transition: 'width .3s' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {steps.map((st, idx) => {
                        const d = ck.includes(idx)
                        const aiHit = hasAi(st.text)
                        return (
                          <div key={idx} style={{
                            display: 'flex', gap: 12, alignItems: 'flex-start',
                            padding: '11px 13px', borderRadius: 8,
                            background: d ? '#f0fdf4' : C.bg,
                            border: `1px solid ${d ? '#bbf7d0' : 'transparent'}`,
                            transition: 'all .2s'
                          }}>
                            <span onClick={() => toggleStep(s.no, idx)} title="点序号勾选/取消" style={{
                              flexShrink: 0, width: 22, height: 22, borderRadius: 6,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 700, background: d ? C.green : C.blue, color: '#fff',
                              cursor: 'pointer', userSelect: 'none'
                            }}>{d ? '✓' : st.no}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                <span style={{ flex: 1, fontSize: 14, lineHeight: 1.6, color: d ? C.muted : C.text, textDecoration: d ? 'line-through' : 'none' }}>{st.text}</span>
                                {aiHit && <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: C.purple, background: '#f5f3ff', padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>AI 协作点</span>}
                              </div>
                              {st.asset && (
                                <a href={`/${st.asset}`} download onClick={(e) => e.stopPropagation()} style={{
                                  display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8,
                                  background: '#22c55e', color: '#fff', fontSize: 13, fontWeight: 600,
                                  padding: '6px 14px', borderRadius: 8, textDecoration: 'none', cursor: 'pointer', width: 'fit-content'
                                }}>📄 下载示例：{st.asset}</a>
                              )}
                              {st.code && (() => {
                                const ck2 = `${s.no}-${idx}`
                                return (
                                  <div style={{ marginTop: 8, position: 'relative' }}>
                                    <button onClick={(e) => { e.stopPropagation(); copyCode(st.code, ck2) }} style={{
                                      position: 'absolute', top: 6, right: 6, zIndex: 2,
                                      border: '1px solid #334155', background: '#334155', color: '#e2e8f0',
                                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5, cursor: 'pointer'
                                    }}>{copied === ck2 ? '已复制 ✓' : '复制'}</button>
                                    <pre style={{
                                      margin: 0, padding: '12px 14px', background: '#0f172a',
                                      border: '1px solid #1e293b', borderRadius: 6, overflowX: 'auto',
                                      fontSize: 12.5, fontFamily: 'Consolas,Monaco,Menlo,monospace',
                                      lineHeight: 1.7, color: '#e2e8f0'
                                    }}><code>{st.code}</code></pre>
                                  </div>
                                )
                              })()}
                              {st.check && (
                                <div style={{ marginTop: 6, fontSize: 13, color: '#1e40af', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '6px 10px', borderRadius: 6, lineHeight: 1.6 }}>
                                  <span style={{ fontWeight: 700 }}>验收</span>：{st.check}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}

                {/* 每步不单独评分/提交，全项目做完再统一提交代码 */}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
