import { useEffect, useState } from 'react'
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, MessageSquare, BarChart3 } from 'lucide-react'

function ScoreRing({ score, label }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const duration = 1200
    const start = performance.now()

    const tick = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic，结尾减速
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(eased * score)
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [score])

  const color = score >= 70 ? '#4ade80' : score >= 40 ? '#facc15' : '#f87171'

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="score-ring"
        style={{
          '--progress': current,
          background: `conic-gradient(${color} ${current}%, rgba(255,255,255,0.05) ${current}%)`,
        }}
      >
        <div className="score-ring-inner">
          <span className="text-2xl font-bold" style={{ color }}>{Math.round(current)}</span>
          <span className="text-[10px] text-white/30">/ 100</span>
        </div>
      </div>
      <span className="text-xs text-white/40 font-medium">{label}</span>
    </div>
  )
}

function KeywordTag({ word, matched }) {
  return (
    <span className={matched ? 'tag tag-success' : 'tag tag-danger'}>
      {matched ? <CheckCircle size={12} className="mr-1" /> : <XCircle size={12} className="mr-1" />}
      {word}
    </span>
  )
}

export default function MatchResult({ data, onBack, onReset }) {
  const { match_score: s } = data

  return (
    <div className="space-y-6 animate-slide-up">
      {/* 总体情况 */}
      <div className="glass-card p-4 sm:p-8">
        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-8">
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white/90 mb-0.5 flex items-center gap-2"><BarChart3 size={18} className="text-cosmos-400 shrink-0" /> 匹配报告</h2>
            <p className="text-white/40 text-xs sm:text-sm truncate">
              候选人：{data.resume_data.basic_info.name || '未知'}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={onBack} className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm text-white/50 hover:text-white/80 bg-white/5 hover:bg-white/10 transition-all whitespace-nowrap">
              <ArrowLeft size={13} />
              重新匹配
            </button>
            <button onClick={onReset} className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm text-white/50 hover:text-white/80 bg-white/5 hover:bg-white/10 transition-all whitespace-nowrap">
              <RotateCcw size={13} />
              分析新简历
            </button>
          </div>
        </div>

        {/* 四个得分环 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 justify-items-center">
          <ScoreRing score={s.overall_score} label="综合匹配度" />
          <ScoreRing score={s.skill_match} label="技能匹配" />
          <ScoreRing score={s.experience_match} label="经验相关性" />
          <ScoreRing score={s.education_match} label="学历匹配" />
        </div>
      </div>

      {/* ai的评价 - 多维分段展示 */}
      {s.ai_comment && (() => {
        // 解析【标签】内容格式，兜底直接渲染原文
        const sections = s.ai_comment.split('\n').map(line => {
          const m = line.match(/^【(.+?)】(.*)$/)
          return m ? { label: m[1], text: m[2].trim() } : { label: null, text: line.trim() }
        }).filter(s => s.text)

        const hasSections = sections.some(s => s.label)

        return (
          <div className="glass-card p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-semibold text-cosmos-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <MessageSquare size={13} />
              AI 评语
            </h3>
            {hasSections ? (
              <div className="space-y-2 sm:space-y-3">
                {sections.map((sec, i) => (
                  <div key={i} className="flex gap-2 sm:gap-3">
                    {sec.label && (
                      <span className="shrink-0 text-[10px] sm:text-xs font-medium text-cosmos-400 bg-cosmos-500/10 border border-cosmos-500/20 rounded-md px-1.5 sm:px-2 py-0.5 h-fit mt-0.5 whitespace-nowrap">
                        {sec.label}
                      </span>
                    )}
                    <p className="text-white/60 text-xs sm:text-sm leading-relaxed">{sec.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/60 text-xs sm:text-sm leading-relaxed whitespace-pre-line">{s.ai_comment}</p>
            )}
          </div>
        )
      })()}

      {/* 匹配的关键词和缺少的 */}
      <div className="space-y-6">
        {s.matched_keywords && s.matched_keywords.length > 0 && (
          <div className="glass-card p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-semibold text-green-400/80 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle size={13} />
              匹配关键词
            </h3>
            <div className="flex flex-wrap gap-2">
              {s.matched_keywords.map((w) => (
                <KeywordTag key={w} word={w} matched />
              ))}
            </div>
          </div>
        )}

        {s.missing_keywords && s.missing_keywords.length > 0 && (
          <div className="glass-card p-4 sm:p-6">
            <h3 className="text-xs sm:text-sm font-semibold text-red-400/80 uppercase tracking-wider mb-3 flex items-center gap-2">
              <XCircle size={13} />
              缺失关键词
            </h3>
            <div className="flex flex-wrap gap-2">
              {s.missing_keywords.map((w) => (
                <KeywordTag key={w} word={w} matched={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
