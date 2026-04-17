import { useState, useEffect } from 'react'
import { Key, Save, CheckCircle, AlertCircle, ArrowLeft, Trash2 } from 'lucide-react'
import { getApiKey, updateApiKey, deleteApiKey } from '../api'

export default function KeyPage() {
  const [info, setInfo] = useState(null)
  const [newKey, setNewKey] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [result, setResult] = useState(null) // {ok: bool, msg: str}

  useEffect(() => {
    getApiKey().then(setInfo).catch(() => {})
  }, [])

  const handleSave = async () => {
    if (!newKey.trim()) return
    setSaving(true)
    setResult(null)
    try {
      const data = await updateApiKey(newKey.trim())
      setResult({ ok: true, msg: `已更新，当前：${data.masked_key}` })
      setInfo((prev) => prev ? { ...prev, has_key: true, masked_key: data.masked_key } : null)
      setNewKey('')
    } catch (e) {
      setResult({ ok: false, msg: e.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setResult(null)
    try {
      await deleteApiKey()
      setResult({ ok: true, msg: '已清除 API Key' })
      setInfo((prev) => prev ? { ...prev, has_key: false, masked_key: '未设置' } : null)
    } catch (e) {
      setResult({ ok: false, msg: e.message })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-start justify-center pt-16 px-4">
      {/* 背景粒子 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-cosmos-400/20 rounded-full animate-float" />
        <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-nebula-400/20 rounded-full animate-float animate-delay-200" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          返回主页
        </a>

        <div className="glass-card p-8 space-y-6">
          <h1 className="text-xl font-bold text-white/90 flex items-center gap-2">
            <Key size={20} className="text-cosmos-400" />
            API Key 管理
          </h1>

          {/* 当前key信息 */}
          <div className="space-y-3">
            <p className="text-white/40 text-xs uppercase tracking-wider">当前配置</p>
            {info ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-white/40">API Key</span>
                  <span className="text-white/80 font-mono">{info.masked_key}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-white/40">API 地址</span>
                  <span className="text-white/60 text-xs truncate max-w-[200px]">{info.base_url}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-white/40">模型</span>
                  <span className="text-white/60">{info.model}</span>
                </div>
              </div>
            ) : (
              <div className="text-white/30 text-sm">加载中...</div>
            )}
          </div>

          {/* 更新key */}
          <div className="space-y-3">
            <p className="text-white/40 text-xs uppercase tracking-wider">更换 API Key</p>
            <input
              type="password"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              placeholder="粘贴新的 API Key..."
              className="input-field font-mono text-sm"
              disabled={saving || deleting}
            />
            <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || deleting || !newKey.trim()}
              className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
            >
              {saving ? (
                <><span className="spinner" /> 保存中...</>
              ) : (
                <><Save size={14} /> 保存并立即生效</>
              )}
            </button>
            <button
              onClick={handleDelete}
              disabled={saving || deleting || !info?.has_key}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {deleting ? <span className="spinner !border-red-400" /> : <Trash2 size={14} />}
              删除
            </button>
            </div>
          </div>

          {/* 操作结果 */}
          {result && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm animate-slide-up ${
              result.ok
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {result.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              <span>{result.msg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
