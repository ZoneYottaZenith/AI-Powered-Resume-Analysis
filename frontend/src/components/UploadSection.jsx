import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, FileText, AlertCircle, History, ChevronRight, Trash2 } from 'lucide-react'
import { uploadResume, getApiKey } from '../api'

export default function UploadSection({ onSuccess, onLoadHistory, onNoKey }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [history, setHistory] = useState([])
  const fileRef = useRef()

  // 从 localStorage 加载历史记录
  useEffect(() => {
    try {
      const records = JSON.parse(localStorage.getItem('resume_history') || '[]')
      setHistory(records)
    } catch (_) {}
  }, [])

  const handleFile = useCallback(async (file) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('仅支持 PDF 格式文件')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过 10MB')
      return
    }

    // 上传前先检查key是否已配置
    try {
      const keyInfo = await getApiKey()
      if (!keyInfo.has_key) {
        // 将继续上传的逻辑传给父组件，key设置后自动执行
        onNoKey?.(() => {
          setError(null)
          setFileName(file.name)
          setUploading(true)
          uploadResume(file)
            .then(data => onSuccess(data))
            .catch(e => setError(e.message))
            .finally(() => setUploading(false))
        })
        return
      }
    } catch (_) {}

    setError(null)
    setFileName(file.name)
    setUploading(true)

    try {
      const data = await uploadResume(file)
      onSuccess(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }, [onSuccess])

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer?.files?.[0]
    handleFile(file)
  }, [handleFile])

  return (
    <div className="max-w-2xl mx-auto">
      <div
        className={`drop-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="spinner !w-10 !h-10 !border-3" />
            <div>
              <p className="text-white/70 font-medium">正在解析 {fileName}...</p>
              <p className="text-white/30 text-sm mt-1">AI 正在提取简历关键信息，请稍候</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-cosmos-600/10 border border-cosmos-500/20 flex items-center justify-center">
              {fileName ? <FileText size={28} className="text-cosmos-400" /> : <Upload size={28} className="text-cosmos-400" />}
            </div>
            <div>
              <p className="text-white/70 font-medium">
                {fileName ? fileName : '点击或拖拽上传 PDF 简历'}
              </p>
              <p className="text-white/30 text-sm mt-1">支持单个 PDF 文件，最大 10MB</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-up">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 历史记录 */}
      {history.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <History size={13} />
              <span>历史记录</span>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('resume_history')
                setHistory([])
              }}
              className="flex items-center gap-1 text-white/25 hover:text-red-400 transition-colors text-xs"
            >
              <Trash2 size={11} />
              清空
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {history.map((item) => {
              const name = item.resume_data?.basic_info?.name || '未知'
              const skills = item.resume_data?.skills || []
              const time = item.upload_time
                ? new Date(item.upload_time).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : ''
              return (
                <button
                  key={item.resume_id}
                  onClick={() => onLoadHistory(item)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/3 border border-white/8 hover:bg-white/6 hover:border-cosmos-500/30 transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-cosmos-600/15 flex items-center justify-center shrink-0">
                    <FileText size={15} className="text-cosmos-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white/80 text-sm font-medium truncate">{name}</span>
                      {skills.length > 0 && (
                        <span className="text-white/30 text-xs shrink-0">{skills.length} 项技能</span>
                      )}
                    </div>
                    <p className="text-white/30 text-xs truncate mt-0.5">{item.filename}{time ? ` · ${time}` : ''}</p>
                  </div>
                  <ChevronRight size={14} className="text-white/20 group-hover:text-cosmos-400 transition-colors shrink-0" />
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
