import { useState } from 'react'
import { Key, AlertCircle, ExternalLink } from 'lucide-react'
import { updateApiKey } from '../api'

/** 未配置 API Key 时的引导弹框 */
export default function KeyModal({ onClose }) {
  const [keyInput, setKeyInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async () => {
    const key = keyInput.trim()
    if (!key) return
    setSubmitting(true)
    setError(null)
    try {
      await updateApiKey(key)
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative glass-card p-6 sm:p-8 max-w-md w-full space-y-5 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cosmos-600/20 border border-cosmos-500/30 flex items-center justify-center shrink-0">
            <Key size={18} className="text-cosmos-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white/90">配置 AI Key</h2>
            <p className="text-white/40 text-xs mt-0.5">运行 AI 功能前需要先填入 DeepSeek API Key</p>
          </div>
        </div>

        <p className="text-white/50 text-sm leading-relaxed">
          还没有 Key？前往{' '}
          <a
            href="https://platform.deepseek.com/api_keys"
            target="_blank"
            rel="noreferrer"
            className="text-cosmos-400 hover:text-cosmos-300 inline-flex items-center gap-1 transition-colors"
          >
            platform.deepseek.com
            <ExternalLink size={11} />
          </a>{' '}
          免费创建一个，然后粘贴到下方。
        </p>

        <input
          type="text"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          className="input-field font-mono text-sm"
          disabled={submitting}
          autoFocus
        />

        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle size={13} />
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || !keyInput.trim()}
          className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
        >
          {submitting ? <><span className="spinner" /> 保存中...</> : '确认并开始使用'}
        </button>
      </div>
    </div>
  )
}
