import { useState } from 'react'
import { Search, ArrowLeft, AlertCircle } from 'lucide-react'
import { matchResume } from '../api'

export default function MatchSection({ resumeId, resumeData, onSuccess, onBack }) {
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [focused, setFocused] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (jobDesc.trim().length < 5) {
      setError('岗位描述至少需要 5 个字符')
      return
    }

    setError(null)
    setLoading(true)
    try {
      const data = await matchResume(resumeId, jobDesc.trim(), resumeData)
      onSuccess(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="glass-card p-4 sm:p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm text-white/40 hover:text-white/70 transition-colors mb-4 sm:mb-6"
        >
          <ArrowLeft size={13} />
          返回解析结果
        </button>

        <h2 className="text-lg sm:text-xl font-bold text-white/90 mb-1 sm:mb-2 flex items-center gap-2"><Search size={18} className="text-cosmos-400" /> 岗位匹配</h2>
        <p className="text-white/40 text-xs sm:text-sm mb-4 sm:mb-6">输入岗位需求描述，AI 将分析简历与岗位的匹配程度</p>

        <form onSubmit={handleSubmit}>
          <div className="relative">
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="input-field h-36 sm:h-48 resize-none font-body text-xs sm:text-sm leading-relaxed"
              disabled={loading}
            />
            {/* 自定义占位提示，空且未聚焦时显示 */}
            {!jobDesc && !focused && (
              <div className="absolute inset-0 flex flex-col justify-center px-4 py-3 pointer-events-none select-none text-xs sm:text-sm leading-relaxed">
                <p className="text-white/30">
                  如果您是<span className="text-cosmos-400">招聘方</span>：直接填写岗位要求、技能栈、学历等条件
                </p>
                <p className="text-white/30 mt-2">
                  如果您是<span className="text-nebula-400">求职者</span>：将目标岗位的招聘简章粘贴进来即可
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 sm:mt-6">
            <span className="text-white/20 text-xs">{jobDesc.length} 字</span>
            <button
              type="submit"
              disabled={loading || jobDesc.trim().length < 5}
              className="btn-primary flex items-center gap-2 text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-3"
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  AI 分析中...
                </>
              ) : (
                <>
                  <Search size={13} />
                  开始匹配
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs sm:text-sm animate-slide-up">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}
